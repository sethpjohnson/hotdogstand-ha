# Hot Dog Stand theme — controller setup

Target: Home Assistant 2026.7+. Everything below lives on the HA config volume
(`/config`, mounted here at `/Volumes/config`).

## 1. Theme (required)
Copy the theme into a themes subfolder:
```
/config/themes/hotdog-stand/hotdog-stand.yaml   <-  hotdog-stand.yaml
```
`configuration.yaml` must load themes (default in HA):
```yaml
frontend:
  themes: !include_dir_merge_named themes
```
Reload: Developer Tools → YAML → **Themes**, then pick "hotdog-stand-theme" in
your Profile. The theme is fully functional with just this step — the two
add-ons below are only for the extra polish noted.

## 2. card-mod (optional — for the boxed config search field)
Only needed for the hard black border on the Settings search box (everything
else, incl. square corners and bordered dropdown popups, is plain theme vars).

1. Install **card-mod** via HACS (Frontend → "card-mod").
2. Load it as a **frontend module** (required to style non-Lovelace panels):
   ```yaml
   frontend:
     extra_module_url:
       - /hacsfiles/lovelace-card-mod/card-mod.js?hacstag=<your-hacstag>
   ```
   Find your exact `hacstag` in Settings → Dashboards → ⋮ → Resources.
3. Restart HA.

If card-mod is absent, the theme still works — only the search-box border is
skipped (its `card-mod-*` keys are inert without card-mod).

## 3. Windows 3.1 font (optional — pixelated MS Sans Serif)
Gives the authentic bitmap font on every device (not just Windows).

1. Copy these to the config `www` folder (served at `/local/`):
   ```
   /config/www/hotdog-font.js                     <-  www/hotdog-font.js
   /config/www/fonts/ms_sans_serif.woff2          <-  www/fonts/ms_sans_serif.woff2
   /config/www/fonts/ms_sans_serif_bold.woff2     <-  www/fonts/ms_sans_serif_bold.woff2
   ```
2. Load the loader as a frontend module:
   ```yaml
   frontend:
     extra_module_url:
       - /local/hotdog-font.js
   ```
3. Restart HA.

Without this, the font falls back to real MS Sans Serif (Windows) then
Tahoma/Geneva/sans-serif. The font is "Pixelated MS Sans Serif" from the
[98.css](https://github.com/jdan/98.css) project (MIT).

## Notes
- `.env` (HA long-lived token) is gitignored — never committed.
- Known limitation: Web-Awesome dropdown *pickers* (Profile Language/Theme,
  Time zone, etc.) can't take a border — a card-mod 4.2.1 bug aborts the page if
  you try. They get square corners only.
