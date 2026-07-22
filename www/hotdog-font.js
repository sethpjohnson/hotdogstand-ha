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
