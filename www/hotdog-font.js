// Hot Dog Stand theme loader. Loaded for EVERY theme via
// frontend.extra_module_url, so everything below is gated on a sentinel theme
// variable (--hd-theme-active, set by hotdog-stand.yaml). When another theme is
// selected, all treatments are removed again without a page reload.
//
// Three treatments, each reversible:
//   1. body font   — HA hardcodes `body{font-family:Roboto,...}` (not a CSS
//      variable) which the sidebar and other chrome INHERIT. A theme can only
//      set variables, so a document-level <style> forces the pixel font.
//      Elements that set their own font (e.g. the monospace code editor via
//      --ha-font-family-code) are unaffected because explicit wins over inherited.
//   2. grey Windows buttons adopted into every shadow root.
//   3. black Settings/Profile panel headers.
//
// The @font-face declarations stay unconditional: they only download when a
// font-family actually references them.
//
// The sentinel is read off <html> only. A per-view Lovelace `theme:` that
// selects hotdog-stand does NOT trigger the loader, and a global hotdog-stand
// with a differently-themed view still gets the treatments inside that view.
(function () {
  if (window.__hotdogLoader) return;
  window.__hotdogLoader = "2";

  var active = false;

  function isActive() {
    try {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue("--hd-theme-active")
          .trim() !== ""
      );
    } catch (e) {
      return false;
    }
  }

  // ---- 1. Fonts ---------------------------------------------------------
  var fontFace = document.createElement("style");
  fontFace.id = "hotdog-font-face";
  fontFace.textContent =
    "@font-face{font-family:'Pixelated MS Sans Serif';" +
    "src:url('/local/fonts/ms_sans_serif.woff2') format('woff2');" +
    "font-weight:400;font-display:swap;}" +
    "@font-face{font-family:'Pixelated MS Sans Serif';" +
    "src:url('/local/fonts/ms_sans_serif_bold.woff2') format('woff2');" +
    "font-weight:700;font-display:swap;}";
  document.head.appendChild(fontFace);

  var bodyFont = document.createElement("style");
  bodyFont.id = "hotdog-body-font";
  bodyFont.textContent =
    "body{font-family:'Pixelated MS Sans Serif','MS Sans Serif',Tahoma,Geneva,sans-serif !important;}";

  function applyBodyFont(on) {
    if (on) {
      if (!bodyFont.parentNode) document.head.appendChild(bodyFont);
    } else if (bodyFont.parentNode) {
      bodyFont.parentNode.removeChild(bodyFont);
    }
  }

  // ---- 2. Grey Windows buttons -------------------------------------------
  // Make EVERY ha-button / ha-icon-button a grey Windows 3.1 button, no matter
  // how deeply it is nested (overflow menus, integration cards, sub-page
  // headers, dialogs...). card-mod can only reach buttons whose exact shadow
  // path is enumerated; this styles them all by adopting one shared stylesheet
  // into every shadow root (ha-button's inner element is `.button`).
  // Also recolors the "active filters" notice from the theme's dark-red hover
  // tint (#B00000) to the correct pure red.
  var css =
    /* grey beveled Windows button, square, black label/icon */
    ".button{background:#C0C0C0 !important;border:2px outset #C0C0C0 !important;" +
    "border-radius:0 !important;color:#000000 !important;}" +
    ".button:hover,.button:focus,.button:focus-visible{background:#C0C0C0 !important;}" +
    ".button:active{border-style:inset !important;}" +
    /* remove the modern round hover/ripple overlay */
    ".button::before,.button::after{display:none !important;background:none !important;}" +
    /* filter-count notice -> correct red, white text */
    ".active-filters{background:#FF0000 !important;color:#FFFFFF !important;}" +
    /* dropdown/menu item highlight: Web Awesome sets the hover/selected bg to
       --wa-color-neutral-fill-normal (black in this theme) under black text ->
       black-on-black. Force a red highlight bar with white text instead. */
    "ha-dropdown-item:hover,ha-dropdown-item:focus,ha-dropdown-item:focus-visible," +
    "ha-dropdown-item[selected],ha-dropdown-item:where([state-submenu-open]){" +
    "background-color:#FF0000 !important;color:#FFFFFF !important;}";
  // ONE shared sheet is adopted unconditionally into every shadow root and
  // toggled by swapping its contents (empty when the theme is inactive). Every
  // adopter updates at once, so no per-root bookkeeping (which would leak every
  // closed dialog / popup root) is needed.
  var sheet = null;
  try {
    sheet = new CSSStyleSheet();
  } catch (e) {
    sheet = null; // no constructable-stylesheet support -> skip buttons (theme still works)
  }

  function adopt(sr) {
    try {
      if (sr && sr.adoptedStyleSheets && sr.adoptedStyleSheets.indexOf(sheet) === -1) {
        sr.adoptedStyleSheets = sr.adoptedStyleSheets.concat(sheet);
      }
    } catch (e) {}
  }

  // Catch every shadow root created from now on (covers dynamically-added
  // buttons — cards expanding, dialogs opening, menus, etc.).
  if (sheet) {
    try {
      var orig = Element.prototype.attachShadow;
      Element.prototype.attachShadow = function (init) {
        var sr = orig.call(this, init);
        adopt(sr);
        return sr;
      };
    } catch (e) {}
  }

  // Retro-adopt into shadow roots that already existed before this ran. Only
  // done at startup, and on navigation while active; the attachShadow patch
  // covers the rest.
  function retro(node, depth) {
    if (!node || depth > 25) return;
    if (node.shadowRoot) { adopt(node.shadowRoot); retro(node.shadowRoot, depth + 1); }
    var k = node.children;
    if (k) for (var i = 0; i < k.length; i++) retro(k[i], depth + 1);
  }
  function runRetro() { if (sheet) { try { retro(document.body, 0); } catch (e) {} } }

  function applyButtons(on) {
    if (!sheet) return;
    try { sheet.replaceSync(on ? css : ""); } catch (e) {}
  }

  // ---- 3. Panel headers ---------------------------------------------------
  // ha-panel-config and ha-panel-profile re-assert
  // --sidebar-background-color (which the config/profile toolbar paints from)
  // and --app-header-background-color as var(--primary-color) (red) on their
  // own :host, which a theme variable cannot override and which has no card-mod
  // hook for the profile panel. Set both inline (important) on those panels
  // whenever they appear.
  // Hosts blackened so far, so deactivating can clear them without walking the
  // DOM. HA builds a fresh panel element on some visits and REATTACHES a cached
  // one on others (ha-panel-config comes back from cache), so a host that is
  // detached when the theme flips must still be cleared: hosts are therefore
  // held weakly (never leaked, cleared whether connected or not) and only dead
  // or duplicate refs are pruned. (WeakRef is ES2021; HA 2026 requires it.)
  var panels = [];
  function recordPanel(node) {
    var live = [];
    var seen = false;
    for (var i = 0; i < panels.length; i++) {
      var n = panels[i].deref();
      if (n) { live.push(panels[i]); if (n === node) seen = true; }
    }
    if (!seen) live.push(new WeakRef(node));
    panels = live;
  }

  function walkPanels(node, depth) {
    if (!node || depth > 20) return;
    if (node.nodeType === 1) {
      var tn = node.localName;
      if (tn === "ha-panel-config" || tn === "ha-panel-profile") {
        // The config/profile top bar (hass-tabs-subpage .toolbar) paints from
        // --sidebar-background-color (red), not --app-header-background-color.
        // Override it to black on the panel only — the sidebar nav stays red.
        node.style.setProperty("--sidebar-background-color", "#000000", "important");
        node.style.setProperty("--app-header-background-color", "#000000", "important");
        recordPanel(node);
      }
      if (node.shadowRoot) walkPanels(node.shadowRoot, depth + 1);
    }
    var kids = node.children;
    if (kids) for (var i = 0; i < kids.length; i++) walkPanels(kids[i], depth + 1);
  }

  function clearPanels() {
    for (var i = 0; i < panels.length; i++) {
      var n = panels[i].deref();
      if (n) {
        n.style.removeProperty("--sidebar-background-color");
        n.style.removeProperty("--app-header-background-color");
      }
    }
    panels = [];
  }

  // ---- sync ---------------------------------------------------------------
  // Read the sentinel and apply/remove all three treatments. Body font and
  // buttons only change on a state flip. Panels are re-walked on every sync
  // while ACTIVE (they re-assert their vars and appear on navigation); while
  // inactive nothing is walked, so the interval / click listener are just one
  // cheap getComputedStyle.
  function sync() {
    var on = isActive();
    if (on !== active) {
      active = on;
      applyBodyFont(on);
      applyButtons(on);
      if (!on) clearPanels();
    }
    if (on) {
      try { walkPanels(document.body, 0); } catch (e) {}
    }
  }

  // HA writes theme variables to <html style="..."> on a theme switch.
  try {
    new MutationObserver(function () { sync(); }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
  } catch (e) {}
  window.addEventListener("location-changed", function () {
    setTimeout(sync, 60);
    // Navigation retro-walk only while active; when inactive the startup walk
    // plus the attachShadow patch already cover every root.
    if (active) setTimeout(runRetro, 150);
  });
  document.addEventListener("click", function () {
    if (active) setTimeout(sync, 150);
  }, true);
  sync();
  setTimeout(function () { runRetro(); sync(); }, 500);
  setInterval(sync, 3000);
})();
