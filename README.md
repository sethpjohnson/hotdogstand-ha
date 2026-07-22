# Hot Dog Stand — a Home Assistant theme

The Windows 3.1 color scheme that Microsoft shipped in 1992, that every reviewer mocked, that no human being has ever willingly selected. Rebuilt, pixel by pixel, for your smart home.

Your lights turn on. Your automations fire. Your presence detection knows you're home before you do. And still, some evenings, you stared at that calm gray dashboard and felt that something wasn't there. It was this. This is the thing.

## What you're getting

A complete theme in the original Hot Dog Stand palette: fire-engine red, taxi-cab yellow, and black borders ruled straight like it's a spreadsheet. White window bodies float on a yellow desktop. Every card wears a red title bar and a thick black frame. Nothing is rounded, because rounded corners are a modern affectation and we are not modern people.

It reaches the whole frontend. Not the easy 80%. The dialogs, the Settings pages, the little "⋯" overflow menus buried three shadow roots deep that most themes quietly give up on. Buttons everywhere are gray, beveled, and click *inward* when you press them, the way a button is supposed to behave. There is no white-on-white text anywhere in the product, which is genuinely more than the 1992 original could claim.

## Why you would do this

Home Assistant ships with restrained, thoughtful defaults. Soft neutrals. A little blue. A palette designed by people who like your retinas.

We reviewed that work carefully and went the other way.

The joke, and there's always supposed to be a joke here, is that it's actually readable. Black on yellow, white on red, black on white. The contrast ratios are excellent. It is loud, not illegible. You could run a control room on this. You would be the only one who wanted to, but you could.

## What's in the box

- **The theme** (`hotdog-stand.yaml`). Hundreds of tokens covering the classic vars, the MDC vars, Material 3, the newer `--ha-color-*` semantic layer, and Web Awesome. This is the part that does the heavy lifting.
- **A pixel font.** Real bitmap "MS Sans Serif" (the [98.css](https://github.com/jdan/98.css) webfont), loaded on every device so your dashboard reads like a BIOS setup screen on any phone, not just a Pentium.
- **A small loader** (`www/hotdog-font.js`) that installs the font and then goes hunting through shadow DOM to grey out every last button, blacken the Settings and Profile title bars, and generally finish the parts a theme file legally cannot reach.

## Install

Full steps are in [`SETUP.md`](SETUP.md). The short version: drop the theme in your `themes` folder, pick it in your profile, and you're done. Two optional add-ons ([card-mod](https://github.com/thomasloven/lovelace-card-mod) and the font loader) buy you the square inputs, the red title bars, the gray buttons, and the bitmap font. Without them the theme still works and is still, unmistakably, a hot dog stand.

## Deliberate design decisions that are not bugs

- **No hover animations. No ripples. No fades.** You touch a thing, the thing changes. Windows 3.1 held no opinions about "delight" and neither do we.
- **The code editor keeps its syntax colors.** Everyone has a limit. This is ours.
- **Switches, sliders, chips, badges, toasts** all live in the palette. On is yellow-on-black. Off is a little gray box. You will always know which.
- **It is not subtle.** Reports to that effect will be closed as working-as-intended.

## Honest caveats

- A brand-new third-party card with deeply buried custom elements might slip through and render looking calm and modern. If you spot one, open an issue; the loader can usually be taught to find it.
- Home Assistant moves fast. A frontend rewrite can shift the shadow-DOM paths that card-mod and the loader rely on. If a corner reverts to gray-and-blue after an update, that's the most likely reason.

## Credits

The bitmap font comes from [98.css](https://github.com/jdan/98.css) by Jordan Scales (MIT). The color scheme comes from Microsoft, who have never publicly explained themselves. Card piercing is powered by [card-mod](https://github.com/thomasloven/lovelace-card-mod).

## License

MIT. See [`LICENSE`](LICENSE). Do whatever you like with it. Wear sunglasses.
