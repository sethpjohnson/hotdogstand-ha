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
