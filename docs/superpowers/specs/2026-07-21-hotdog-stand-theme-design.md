# True Hotdog Stand Theme — Design Spec

Date: 2026-07-21
Target: Home Assistant **2026.7.2** (verified live via API)
Deliverable: `hotdog-stand.yaml` (dev copy in repo; deployed to
`/Volumes/config/themes/hotdog-stand/hotdog-stand.yaml` on the controller)

## Problem

The existing theme wires up only ~40 CSS variables and predates Home
Assistant's move to Material 3. Many 2026-era surfaces (md-dialogs, md-menus,
newer buttons, entity/domain state colors) read from `--md-sys-color-*` and
`--ha-*` tokens the current theme never sets, so they fall back to HA's default
light/dark palette — producing white-on-white text/icons and other
low-contrast spots. The file also carries ~570 lines of commented-out dead
experiments.

## Goal

A **faithful, garish** Windows 3.1 "Hot Dog Stand" theme (loud red / yellow /
black) that covers **every** visual surface of the HA frontend with
**no white-on-white or low-contrast** elements. Pure theme YAML — no external
integration (card-mod) dependency.

## Palette (base tokens)

| Token       | Value     | Role                                  |
|-------------|-----------|---------------------------------------|
| `hd-red`    | `#FF0000` | Primary surface / background          |
| `hd-yellow` | `#FFD700` | Accent / active / selected            |
| `hd-black`  | `#000000` | Borders; text on yellow               |
| `hd-white`  | `#FFFFFF` | Text on red; input fill               |
| `hd-red-dk` | `#B00000` | Hover / pressed on red surfaces       |
| `hd-grey`   | `#808080` | Disabled text/lines only              |

Font: `'Trebuchet MS', sans-serif` (kept from original).

## The hard contrast rule (enforced on every fg/bg pairing)

Allowed foreground-on-background combinations ONLY:

- **White on red**
- **Black on yellow**
- **Yellow on black**
- **Black on white** (code editor / syntax only — see input note below)

Explicitly forbidden (these are the current file's offenders):

- White on yellow
- Yellow on red
- Black on red

Any icon or text on a red surface is white (or yellow for active/accent
emphasis); any icon or text on a yellow surface is black.

**Accepted exception — active-state accents (formalized after review):**
Active/on entity icons and state colors (`state-icon-active-color`,
`state-on-color`, `state-<domain>-*`, `rgb-state-*`) are **yellow on the red
surface** (~2.85:1). This is intentional and functional: inactive icons are
white, so yellow is what distinguishes an *active* entity from an inactive one.
Repainting them white would erase that distinction. Given the faithful-garish
mandate and that the yellow is large/bold and clearly legible, this borderline
pair is a deliberate, documented exception to the 4-pair rule — not a defect.

**Input decision (revised after live verification):** inputs/text-fields/selects
render **white text on a transparent (red-card) fill** with a white underline and
black border — NOT black-on-white. Live audit showed HA 2026 draws field *value*
text from the global (white) text token; pairing that with a white fill produced
white-on-white, so the fill is transparent (red shows through) and text stays
white — consistent with every other surface. The **code editor (CodeMirror) is
the sole black-on-white surface** (`code-editor-background-color: white` + dark
syntax), independent of the form-field tokens.

## Coverage — set every variable in each group so nothing falls back

1. Core: `primary-color`, `accent-color`, `dark-/light-primary-color`,
   `divider-color`, `disabled-text-color`.
2. Text: `primary-/secondary-text-color`, `text-primary-color`,
   `text-light-primary-color`.
3. Backgrounds: `primary-/secondary-/card-background-color`.
4. Status: `error-/warning-/success-/info-color` (kept legible, not pure black).
5. Cards: `ha-card-background`, `ha-card-border-color`, `-border-width`,
   `-border-radius`, `-box-shadow`, `ha-card-header-color`.
6. App header + toolbar/tabs: `app-header-background-color`,
   `app-header-text-color`, `app-header-selection-bar-color`, `--mdc-tab-*`.
7. Sidebar: background, icon, text, selected icon/text/background, title.
8. States & domains: `state-icon-color`, `state-icon-active-color`,
   `state-*-color`, per-domain `state-<domain>-<state>-color`, and the newer
   `--rgb-state-*` entity colors.
9. Inputs (MDC + legacy): text-field & select fill/ink/line/label/dropdown
   colors, `input-*` legacy vars.
10. Dialogs / more-info: `mdc-dialog-*`, `ha-dialog-*`, `more-info-*`.
11. Switches / toggles / sliders: `switch-*`, `paper-toggle-*`, `ha-slider-*`,
    `slider-*`.
12. Menus / dropdowns: `mdc-menu-*`, `paper-listbox-*`, `ha-select-*`.
13. Chips / badges / toasts: `label-badge-*`, chip + toast colors.
14. Code editor + markdown: `code-editor-background-color`,
    `markdown-code-background-color`, `codemirror-*`.
15. **Material 3 tokens (the key modern gap):** `--md-sys-color-*`
    (primary, on-primary, surface, on-surface, surface-variant, outline,
    secondary/tertiary, error, and container variants) mapped to the palette
    under the contrast rule.

Single flat theme (no light/dark `modes:`) so the look is identical regardless
of the user's system light/dark setting.

## Verification — live browser audit loop

1. Write dev `hotdog-stand.yaml` in repo.
2. Copy to `/Volumes/config/themes/hotdog-stand/hotdog-stand.yaml`.
3. `POST /api/services/frontend/reload_themes` (Bearer `HA_TOKEN`,
   host `http://10.0.1.160:8123`).
4. Drive the frontend in a browser (auth via `HA_TOKEN`); screenshot each
   surface: dashboard cards, sidebar, top tabs, a more-info dialog, Settings
   pages, an input/dropdown, the YAML code editor, a markdown card, a
   toast/dialog.
5. Flag and fix any surface where an element's color ≈ its background; repeat.

**Done when:** zero surfaces exhibit an element color ≈ background, across the
enumerated screenshot set.

**Risk:** frontend login via long-lived token (localStorage `hassTokens`
injection) may need iteration. Fallback if browser auth is intractable:
rely on exhaustive enumerated variable coverage (§Coverage), which by
construction leaves no variable unset, and spot-check fewer surfaces.

## Out of scope (deferred)

- **card-mod CSS flair** (angled hotdog-card borders, sidebar blink animation,
  custom tooltips) — authentic but hard-depends on card-mod (HACS) and is
  fragile across HA updates. Optional later pass, gated on card-mod presence.

## Security / repo hygiene

- `.env` (contains `HA_TOKEN`) is gitignored and never committed.
- Fresh repo on `main`; per user instruction, commit directly to `main`,
  no signing required.
