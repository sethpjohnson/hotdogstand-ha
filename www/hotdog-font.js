// Hot Dog Stand theme — registers the "Pixelated MS Sans Serif" webfont
// (MIT-licensed, from the 98.css project) document-wide so Home Assistant's
// shadow-DOM text can use it. Loaded via frontend.extra_module_url.
//
// Also forces the base `body` font: HA hardcodes `body{font-family:Roboto,...}`
// (not a CSS variable), which the sidebar and other chrome INHERIT. A theme can
// only set variables, so it can't reach `body` — but this document-level style
// can. Elements that set their own font (e.g. the monospace code editor via
// --ha-font-family-code) are unaffected because explicit wins over inherited.
(function () {
  if (document.getElementById("hotdog-font-face")) return;
  var s = document.createElement("style");
  s.id = "hotdog-font-face";
  var stack =
    "'Pixelated MS Sans Serif','MS Sans Serif',Tahoma,Geneva,sans-serif";
  s.textContent =
    "@font-face{font-family:'Pixelated MS Sans Serif';" +
    "src:url('/local/fonts/ms_sans_serif.woff2') format('woff2');" +
    "font-weight:400;font-display:swap;}" +
    "@font-face{font-family:'Pixelated MS Sans Serif';" +
    "src:url('/local/fonts/ms_sans_serif_bold.woff2') format('woff2');" +
    "font-weight:700;font-display:swap;}" +
    "body{font-family:" + stack + " !important;}";
  document.head.appendChild(s);
})();

// Hot Dog Stand theme — force the Settings/Profile panel headers BLACK.
// ha-panel-config and ha-panel-profile re-assert
// --app-header-background-color: var(--primary-color) (red) on their own :host,
// which a theme variable cannot override and which has no card-mod hook for the
// profile panel. Set the property inline (important) on those panels whenever
// they appear. Re-run on navigation (HA fires `location-changed`) plus a slow
// fallback interval; the set is idempotent and cheap.
(function () {
  function blackenPanels(node, depth) {
    if (!node || depth > 20) return;
    if (node.nodeType === 1) {
      var tn = node.localName;
      if (tn === "ha-panel-config" || tn === "ha-panel-profile") {
        // The config/profile top bar (hass-tabs-subpage .toolbar) paints from
        // --sidebar-background-color (red), not --app-header-background-color.
        // Override it to black on the panel only — the sidebar nav stays red.
        node.style.setProperty("--sidebar-background-color", "#000000", "important");
        node.style.setProperty("--app-header-background-color", "#000000", "important");
      }
      if (node.shadowRoot) blackenPanels(node.shadowRoot, depth + 1);
    }
    var kids = node.children;
    if (kids) for (var i = 0; i < kids.length; i++) blackenPanels(kids[i], depth + 1);
  }
  function run() {
    try { blackenPanels(document.body, 0); } catch (e) {}
  }
  window.addEventListener("location-changed", function () { setTimeout(run, 60); });
  document.addEventListener("click", function () { setTimeout(run, 150); }, true);
  setTimeout(run, 500);
  setInterval(run, 3000);
})();

// Hot Dog Stand theme — make EVERY ha-button / ha-icon-button a grey Windows 3.1
// button, no matter how deeply it is nested (overflow menus, integration cards,
// sub-page headers, dialogs...). card-mod can only reach buttons whose exact
// shadow path is enumerated; this styles them all by adopting one shared
// stylesheet into every shadow root (ha-button's inner element is `.button`).
// Also recolors the "active filters" notice from the theme's dark-red hover
// tint (#B00000) to the correct pure red.
(function () {
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
  var sheet;
  try {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
  } catch (e) {
    return; // no constructable-stylesheet support -> skip (theme still works)
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
  try {
    var orig = Element.prototype.attachShadow;
    Element.prototype.attachShadow = function (init) {
      var sr = orig.call(this, init);
      adopt(sr);
      return sr;
    };
  } catch (e) {}
  // Retro-adopt into shadow roots that already existed before this ran.
  function retro(node, depth) {
    if (!node || depth > 25) return;
    if (node.shadowRoot) { adopt(node.shadowRoot); retro(node.shadowRoot, depth + 1); }
    var k = node.children;
    if (k) for (var i = 0; i < k.length; i++) retro(k[i], depth + 1);
  }
  function run() { try { retro(document.body, 0); } catch (e) {} }
  setTimeout(run, 500);
  window.addEventListener("location-changed", function () { setTimeout(run, 150); });
})();
