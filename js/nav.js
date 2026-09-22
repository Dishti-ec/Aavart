/* ============================================================
   Kabadiwala Connect — Shared navigation bar (single source)
   One nav for every page. Include on any page with:
     <div id="kc-nav"></div>
     <script src="js/nav.js"></script>        (from the site root)
     <script src="../js/nav.js"></script>     (from /pages)
   The script figures out where it is, points the links correctly,
   marks the current page, and wires the mobile menu + scroll border.
   Edit the markup here once and it updates everywhere.
   ============================================================ */
(function () {
  "use strict";

  // Are we inside the /pages folder or at the site root?
  var path = location.pathname.replace(/\\/g, "/");
  var inPages = /\/pages\//.test(path);
  var file = (path.split("/").pop() || "index.html").toLowerCase();
  var root = inPages ? "../" : "";       // prefix to reach the site root
  var pg = inPages ? "" : "pages/";      // prefix to reach a /pages file

  // one place to describe the links; hrefs are resolved for the location
  var LINKS = [
    { key: "nav_how",       label: "How it works",   href: root + "index.html#how" },
    { key: "nav_impact",    label: "Impact",         href: root + "index.html#network" },
    { key: "nav_try_demo",  label: "Try live demo",  href: pg + "login.html", match: "login.html", demo: true }
  ];

  // Icons match the homepage header exactly (sun/moon toggle + hamburger).
  var ICON = {
    sun: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    menu: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'
  };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  // link list, shared by desktop nav + mobile nav
  function linksHTML() {
    return LINKS.map(function (l) {
      var cls = [];
      if (l.match && file === l.match) cls.push("current");
      if (l.demo) cls.push("nav-demo");
      var clsAttr = cls.length ? ' class="' + cls.join(" ") + '"' : "";
      return '<a href="' + l.href + '"' + clsAttr + ' data-i18n="' + l.key + '">' + esc(l.label) + "</a>";
    }).join("");
  }

  function langHTML() {
    return '<div class="lang-toggle" role="group" aria-label="Language">' +
      '<button class="lang-btn active" data-lang="en">EN</button>' +
      '<button class="lang-btn" data-lang="hi">हिं</button>' +
      '<button class="lang-btn" data-lang="mr">मर</button>' +
    '</div>';
  }

  function syncBrandLogos() {
    var isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.querySelectorAll(".brand-logo").forEach(function (img) {
      var darkSrc = img.getAttribute("data-dark-src");
      var lightSrc = img.getAttribute("data-light-src");
      var chosen = isDark ? (darkSrc || img.getAttribute("src")) : (lightSrc || img.getAttribute("src"));
      if (chosen && chosen !== img.getAttribute("src")) img.setAttribute("src", chosen);
    });
  }

  // Exact same markup/classes as the homepage header, so every page renders one identical navbar.
  var HTML =
    '<header class="site-header" id="siteHeader">' +
      '<div class="container header-inner">' +
        '<a href="' + root + 'index.html" class="logo">' +
          '<img class="brand-logo" data-light-src="' + root + 'assets/punarva-logo.svg" data-dark-src="' + root + 'assets/punarva-logo-white.svg" src="' + root + 'assets/punarva-logo.svg" alt="PUNARVA" />' +
        '</a>' +
        '<nav class="nav-links">' + linksHTML() + '</nav>' +
        '<div class="header-actions">' +
          langHTML() +
          '<button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle dark mode">' +
            '<span class="theme-icon theme-icon-sun">' + ICON.sun + '</span>' +
            '<span class="theme-icon theme-icon-moon">' + ICON.moon + '</span>' +
          '</button>' +
          '<button class="nav-toggle" id="navToggle" type="button" aria-label="Open menu" aria-expanded="false">' + ICON.menu + '</button>' +
        '</div>' +
      '</div>' +
      '<nav class="mobile-nav" id="mobileNav">' + linksHTML() + langHTML() + '</nav>' +
    '</header>';

  function mount() {
    var slot = document.getElementById("kc-nav");
    if (slot) {
      slot.outerHTML = HTML;                 // replace the placeholder with the nav
    } else if (!document.getElementById("siteHeader")) {
      // no placeholder and no existing header: put it first in <body>
      document.body.insertAdjacentHTML("afterbegin", HTML);
    } else {
      return;                                // a header already exists; leave it
    }

    var header = document.getElementById("siteHeader");
    var navToggle = document.getElementById("navToggle");
    var mobileNav = document.getElementById("mobileNav");

    function toggleNav() {
      if (mobileNav) mobileNav.classList.toggle("open");
      if (navToggle) {
        var expanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", (!expanded).toString());
      }
    }
    if (navToggle) navToggle.addEventListener("click", toggleNav);
    // close the mobile menu after tapping a link
    if (mobileNav) mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { mobileNav.classList.remove("open"); });
    });

    // theme toggle — shares the kc-theme key with every page
    var themeBtn = document.getElementById("themeToggle");
    if (themeBtn) themeBtn.addEventListener("click", function () {
      var r = document.documentElement;
      var next = r.getAttribute("data-theme") === "dark" ? "light" : "dark";
      r.setAttribute("data-theme", next);
      try { localStorage.setItem("kc-theme", next); } catch (e) {}
      if (window.syncBrandLogos) window.syncBrandLogos();
      else syncBrandLogos();
    });

    // subtle border once the page scrolls
    if (header) {
      var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // Bind the injected language buttons ourselves so they work no matter when
    // i18n.js ran (initI18n only binds buttons that existed at load time).
    function bindLang() {
      if (!(window.KC && typeof KC.setLanguage === "function")) return false;
      header.querySelectorAll(".lang-btn").forEach(function (b) {
        b.addEventListener("click", function () { KC.setLanguage(b.getAttribute("data-lang")); });
      });
      // translate the freshly injected nav + sync the active button
      try { KC.setLanguage(KC.currentLang ? KC.currentLang() : "en"); } catch (e) {}
      return true;
    }
    if (!bindLang()) {
      // i18n.js may load after us; retry briefly
      var tries = 0, t = setInterval(function () {
        if (bindLang() || ++tries > 40) clearInterval(t);
      }, 50);
    }
  }

  // FOOTER injection (keeps site footer consistent)
  function mountFooter() {
    var fslot = document.getElementById("kc-footer");
    var FOOTER = '<footer class="site-footer">'
      + '<div class="container footer-inner">'
        + '<div class="footer-col">'
          + '<a href="' + root + 'index.html" class="logo">'
            + '<img class="brand-logo" data-light-src="' + root + 'assets/punarva-logo.svg" data-dark-src="' + root + 'assets/punarva-logo-white.svg" src="' + root + 'assets/punarva-logo.svg" alt="PUNARVA" />'
          + '</a>'
          + '<div class="caption">Turning scrap into traceable value.</div>'
        + '</div>'
        + '<div class="footer-col">'
          + '<a href="' + root + 'index.html#how">How it works</a>'
          + '<a href="' + pg + 'collector.html">Collector</a>'
          + '<a href="' + pg + 'recycler.html">Recycler</a>'
        + '</div>'
        + '<div class="footer-col">'
          + '<a href="' + pg + 'admin.html">Admin</a>'
          + '<a href="#" id="footer-install">Install (PWA)</a>'
        + '</div>'
      + '</div>'
    + '</footer>';

    if (fslot) { fslot.outerHTML = FOOTER; }
    else if (!document.querySelector(".site-footer")) { document.body.insertAdjacentHTML('beforeend', FOOTER); }
    if (window.syncBrandLogos) window.syncBrandLogos();
    else syncBrandLogos();
  }

  // mount footer after header so pages share same footer
  mountFooter();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
