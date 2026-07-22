# Hot Dog Stand theme — setup

Target: Home Assistant 2026.7+. Everything below lives on your HA config volume
(`/config`).

There are three pieces. The theme file is required and gives you the full
red/yellow/black palette on its own. card-mod and the font loader are optional,
but together they add the parts a theme file physically cannot reach: the red
card title bars, the gray beveled buttons everywhere, square inputs, the bitmap
font, and the black Settings/Profile title bars. For the look in the README,
install all three.

## 1. Theme (required)

Copy the theme into a themes subfolder:

```
/config/themes/hotdog-stand/hotdog-stand.yaml   <-  hotdog-stand.yaml
```

`configuration.yaml` must load themes (this is the HA default):

```yaml
frontend:
  themes: !include_dir_merge_named themes
```

Reload with Developer Tools → YAML → **Themes**, then pick `hotdog-stand-theme`
in your Profile. That alone recolors the entire frontend.

## 2. card-mod (recommended)

card-mod pierces shadow DOM so the theme can style things HA hardcodes. With it
you get: the red card **title bars**, the black window frames on cards, square
input borders, the gray Windows buttons in config/dialog forms, the sidebar
font and frame, and the tile control buttons.

1. Install **card-mod** via HACS (Frontend → search "card-mod").
2. Load it as a **frontend module** (this is what lets a theme reach non-Lovelace
   panels like Settings):

   ```yaml
   frontend:
     extra_module_url:
       - /hacsfiles/lovelace-card-mod/card-mod.js?hacstag=<your-hacstag>
   ```

   Find your exact `hacstag` under Settings → Dashboards → ⋮ → Resources.
3. Restart HA.

Without card-mod the theme still works; the `card-mod-*` keys in the YAML are
simply inert, so you lose the title bars and a few button treatments.

## 3. Font + button loader (recommended)

`hotdog-font.js` does two jobs: it installs the bitmap "MS Sans Serif" font
document-wide, and it walks the shadow DOM to finish the parts card-mod can't
address by path — every deeply nested button becomes a gray Windows button, the
Settings and Profile title bars turn black, and the dropdown-menu hover state
gets a readable red highlight.

1. Copy these into the config `www` folder (served at `/local/`):

   ```
   /config/www/hotdog-font.js                    <-  www/hotdog-font.js
   /config/www/fonts/ms_sans_serif.woff2         <-  www/fonts/ms_sans_serif.woff2
   /config/www/fonts/ms_sans_serif_bold.woff2    <-  www/fonts/ms_sans_serif_bold.woff2
   ```

2. Load it as a frontend module (alongside card-mod):

   ```yaml
   frontend:
     extra_module_url:
       - /hacsfiles/lovelace-card-mod/card-mod.js?hacstag=<your-hacstag>
       - /local/hotdog-font.js
   ```

3. Restart HA, then hard-refresh the browser (Cmd/Ctrl+Shift+R). Browsers cache
   `extra_module_url` scripts, so after any change to `hotdog-font.js` you need
   a hard refresh, or bump a version query (`/local/hotdog-font.js?v=2`).

Without the loader, the font falls back to a real MS Sans Serif on Windows, then
Tahoma/Geneva/sans-serif, and the deep buttons keep their default styling. The
font is "Pixelated MS Sans Serif" from [98.css](https://github.com/jdan/98.css)
(MIT).

## Notes

- Web Awesome dropdown *pickers* (Profile Language/Theme, Time zone) get square
  corners but not a hard border — trying to border them trips a card-mod bug
  that aborts the page render.
- If a corner of the UI reverts to gray-and-blue after an HA update, the
  shadow-DOM paths likely moved; the `card-mod-*` blocks in the YAML and the
  selectors in `hotdog-font.js` are where to adjust.
