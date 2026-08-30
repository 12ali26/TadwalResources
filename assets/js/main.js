/* ==========================================================================
   Tadwal Resources — site behaviour
   Vanilla JS, no dependencies. Loaded with `defer`.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     CONFIG — edit these three values, then redeploy.
     ---------------------------------------------------------------------- */
  var CONFIG = {
    // WhatsApp number in international format, digits only (no +, spaces or dashes).
    whatsappNumber: "254700000000",
    whatsappMessage: "Hello Tadwal Resources, I would like to enquire about ",

    // Where the contact / enquiry forms POST.
    // Formspree: create a form at https://formspree.io and paste its endpoint here.
    // Leave as-is to run in demo mode (no network request, success message only).
    formEndpoint: "https://formspree.io/f/REPLACE_WITH_FORM_ID"
  };

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    initYear();
    initMobileNav();
    initDropdowns();
    initReveal();
    initWhatsApp();
    initConditionalFields();
    initForms();
  });

  /* ---------- Footer year ---------- */
  function initYear() {
    var el = document.querySelector("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    // Close when a link is chosen or the viewport grows back to desktop.
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) setOpen(false);
    });

    // Close when tapping outside the open panel.
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (e.target.closest("#primary-nav") || e.target.closest(".nav-toggle")) return;
      setOpen(false);
    });
  }

  /* ---------- Dropdown menus (click + keyboard) ---------- */
  function initDropdowns() {
    var groups = Array.prototype.slice.call(document.querySelectorAll(".has-dropdown"));
    if (!groups.length) return;

    groups.forEach(function (group) {
      var btn = group.querySelector(".dropdown-toggle");
      if (!btn) return;

      function setOpen(open) {
        group.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
      }

      btn.addEventListener("click", function () {
        var willOpen = !group.classList.contains("is-open");
        closeAll();
        setOpen(willOpen);
      });

      group.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          setOpen(false);
          btn.focus();
        }
      });
    });

    function closeAll() {
      groups.forEach(function (g) {
        g.classList.remove("is-open");
        var b = g.querySelector(".dropdown-toggle");
        if (b) b.setAttribute("aria-expanded", "false");
      });
    }

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".has-dropdown")) closeAll();
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4, 3) * 60 + "ms";
      io.observe(el);
    });
  }

  /* ---------- WhatsApp links ---------- */
  function initWhatsApp() {
    var base = "https://wa.me/" + CONFIG.whatsappNumber;
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-whatsapp]"));
    links.forEach(function (link) {
      var topic = link.getAttribute("data-whatsapp");
      var text = CONFIG.whatsappMessage + (topic ? topic : "your services") + ".";
      link.setAttribute("href", base + "?text=" + encodeURIComponent(text));
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    });
  }

  /* ---------- Progressive disclosure in forms ---------- */
  function initConditionalFields() {
    var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-reveals]"));
    triggers.forEach(function (trigger) {
      var target = document.getElementById(trigger.getAttribute("data-reveals"));
      if (!target) return;
      var matchValue = trigger.getAttribute("data-reveals-when") || "";

      function sync() {
        var show = matchValue
          ? trigger.value === matchValue
          : Boolean(trigger.value);
        target.hidden = !show;
        // Required only while visible.
        Array.prototype.slice.call(target.querySelectorAll("[data-required-when-shown]"))
          .forEach(function (f) { f.required = show; });
      }
      trigger.addEventListener("change", sync);
      sync();
    });
  }

  /* ---------- Form validation + submission ---------- */
  function initForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("form[data-form]"));
    forms.forEach(function (form) {
      var status = form.querySelector(".form__status");
      var submitBtn = form.querySelector("button[type=submit]");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        clearErrors(form);

        var firstInvalid = validate(form);
        if (firstInvalid) {
          firstInvalid.focus();
          showStatus(status, "err", "Please check the highlighted fields and try again.");
          return;
        }

        // Honeypot — silently succeed for bots.
        var hp = form.querySelector(".honeypot input");
        if (hp && hp.value) {
          form.reset();
          showStatus(status, "ok", "Thank you — your message has been sent.");
          return;
        }

        submit(form, status, submitBtn);
      });
    });
  }

  function validate(form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));
    var firstInvalid = null;

    fields.forEach(function (field) {
      if (field.disabled || field.type === "hidden" || field.closest("[hidden]")) return;
      var message = "";

      if (field.required && !field.value.trim()) {
        message = "This field is required.";
      } else if (field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
        message = "Enter a valid email address.";
      } else if (field.type === "tel" && field.value && !/^[0-9+()\-\s]{7,}$/.test(field.value)) {
        message = "Enter a valid phone number.";
      }

      if (message) {
        field.setAttribute("aria-invalid", "true");
        var errEl = form.querySelector("#" + field.getAttribute("aria-describedby"));
        if (errEl) errEl.textContent = message;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    return firstInvalid;
  }

  function clearErrors(form) {
    Array.prototype.slice.call(form.querySelectorAll("[aria-invalid=true]"))
      .forEach(function (f) { f.removeAttribute("aria-invalid"); });
    Array.prototype.slice.call(form.querySelectorAll(".field__error"))
      .forEach(function (e) { e.textContent = ""; });
  }

  function showStatus(el, kind, msg) {
    if (!el) return;
    el.hidden = false;
    el.className = "form__status form__status--" + kind;
    el.textContent = msg;
  }

  function submit(form, status, submitBtn) {
    var demoMode = !CONFIG.formEndpoint || CONFIG.formEndpoint.indexOf("REPLACE_WITH_FORM_ID") !== -1;
    var label = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

    var done = function (ok) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = label; }
      if (ok) {
        form.reset();
        Array.prototype.slice.call(form.querySelectorAll("fieldset[data-conditional]"))
          .forEach(function (fs) { fs.hidden = true; });
        showStatus(status, "ok", "Thank you — your enquiry has reached our team. We usually reply within one business day.");
      } else {
        showStatus(status, "err", "Something went wrong sending your message. Please call or WhatsApp us instead.");
      }
    };

    if (demoMode) {
      window.setTimeout(function () { done(true); }, 600);
      return;
    }

    fetch(CONFIG.formEndpoint, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (res) { done(res.ok); })
      .catch(function () { done(false); });
  }
})();
