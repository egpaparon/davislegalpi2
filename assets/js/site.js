/* ==========================================================================
   DAVIS LEGAL - Site behaviour
   Progressive enhancement only: every page works with JS disabled.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     1. STICKY HEADER: transparent -> solid
     ---------------------------------------------------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      var stuck = window.scrollY > 24;
      header.classList.toggle("is-stuck", stuck);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----------------------------------------------------------------------
     2. DESKTOP PRACTICE-AREAS DROPDOWN
     Hover on pointer devices, click/keyboard everywhere.
     ---------------------------------------------------------------------- */
  var dropdowns = document.querySelectorAll("[data-dropdown]");
  Array.prototype.forEach.call(dropdowns, function (item) {
    var trigger = item.querySelector(".nav__link");
    var panel = item.querySelector(".nav__panel");
    if (!trigger || !panel) return;
    var closeTimer;

    var open = function () {
      clearTimeout(closeTimer);
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    };
    var close = function () {
      item.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
    };
    var closeSoon = function () {
      closeTimer = setTimeout(close, 160);
    };

    item.addEventListener("mouseenter", open);
    item.addEventListener("mouseleave", closeSoon);
    item.addEventListener("focusin", open);
    item.addEventListener("focusout", function (e) {
      if (!item.contains(e.relatedTarget)) close();
    });
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      item.classList.contains("is-open") ? close() : open();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && item.classList.contains("is-open")) {
        close();
        trigger.focus();
      }
    });
  });

  /* ----------------------------------------------------------------------
     3. MOBILE DRAWER
     ---------------------------------------------------------------------- */
  var drawer = document.getElementById("mobile-nav");
  var toggle = document.querySelector(".nav-toggle");
  if (drawer && toggle) {
    var scrim = drawer.querySelector(".mobile-nav__scrim");
    var closeBtn = drawer.querySelector(".mobile-nav__close");
    var lastFocus = null;

    var openDrawer = function () {
      lastFocus = document.activeElement;
      drawer.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var first = drawer.querySelector("a, button");
      if (first) setTimeout(function () { first.focus(); }, 240);
    };
    var closeDrawer = function () {
      drawer.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };

    toggle.addEventListener("click", function () {
      drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
    });
    if (scrim) scrim.addEventListener("click", closeDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
    });

    /* Focus trap */
    drawer.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !drawer.classList.contains("is-open")) return;
      var f = drawer.querySelectorAll('a[href], button:not([disabled])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* Sub-menu accordions inside the drawer */
    var subToggles = drawer.querySelectorAll(".mobile-nav__sub-toggle");
    Array.prototype.forEach.call(subToggles, function (btn) {
      btn.addEventListener("click", function () {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        if (panel) panel.setAttribute("data-open", String(!open));
      });
    });
  }

  /* ----------------------------------------------------------------------
     4. ACCORDIONS (FAQ)
     ---------------------------------------------------------------------- */
  var accTriggers = document.querySelectorAll(".accordion__trigger");
  Array.prototype.forEach.call(accTriggers, function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      if (panel) panel.setAttribute("data-open", String(!open));
    });
  });

  /* ----------------------------------------------------------------------
     5. SCROLL REVEAL
     ---------------------------------------------------------------------- */
  var revealTargets = document.querySelectorAll("[data-reveal]");
  if (revealTargets.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(revealTargets, function (el) { el.classList.add("is-in"); });
    } else {
      document.documentElement.classList.add("reveal-ready");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
          setTimeout(function () { el.classList.add("is-in"); }, delay);
          io.unobserve(el);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      Array.prototype.forEach.call(revealTargets, function (el) { io.observe(el); });
    }
  }

  /* ----------------------------------------------------------------------
     6. BACK TO TOP
     ---------------------------------------------------------------------- */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    var toggleTop = function () {
      toTop.classList.toggle("is-visible", window.scrollY > 600);
    };
    toggleTop();
    window.addEventListener("scroll", toggleTop, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ----------------------------------------------------------------------
     7. COUNT-UP ON STAT NUMBERS
     ---------------------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count"), 10);
        var suffix = el.getAttribute("data-count-suffix") || "";
        var start = null, dur = 1400;
        var step = function (ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * target).toLocaleString("en-US") + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
  }

  /* ----------------------------------------------------------------------
     8. LAZY CALENDLY - only load the widget script when it scrolls into view
     ---------------------------------------------------------------------- */
  var calendly = document.querySelector(".calendly-inline-widget");
  if (calendly) {
    var loadCalendly = function () {
      if (document.getElementById("calendly-script")) return;
      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(css);
      var s = document.createElement("script");
      s.id = "calendly-script";
      s.src = "https://assets.calendly.com/assets/external/widget.js";
      s.async = true;
      document.body.appendChild(s);
    };
    if ("IntersectionObserver" in window) {
      var wio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { loadCalendly(); wio.disconnect(); }
      }, { rootMargin: "400px" });
      wio.observe(calendly);
    } else {
      loadCalendly();
    }
  }

  /* ----------------------------------------------------------------------
     9. ARTICLE SEARCH / FILTER (articles index)
     ---------------------------------------------------------------------- */
  var search = document.getElementById("article-search");
  if (search) {
    var cards = document.querySelectorAll("[data-article]");
    var countEl = document.getElementById("article-count");
    var emptyEl = document.getElementById("article-empty");
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      Array.prototype.forEach.call(cards, function (card) {
        var hay = (card.getAttribute("data-article") || "").toLowerCase();
        var match = !q || hay.indexOf(q) !== -1;
        card.hidden = !match;
        if (match) shown++;
      });
      if (countEl) countEl.textContent = shown;
      if (emptyEl) emptyEl.hidden = shown !== 0;
    });
  }
})();
