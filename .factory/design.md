# Patchcard visual thesis

## Direction: botanical field guide

Patchcard treats an ephemeral browser sound like a field specimen: observed,
named, annotated, and preserved in a portable card.
The page borrows the restraint of a naturalist's folio—warm paper, ink rules,
specimen numbers, handwritten annotations—without imitating a museum website.
Waveforms become leaf venation and parameter controls become labeled measures.
This is intentionally a light-only treatment: the printable paper metaphor and
ink contrast are core to recognition, while the demo's night-time sound is
expressed with deep green rather than a dark theme.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| Paper | `#F3EEDC` | explicit page background |
| Pale herbarium | `#E5E6CF` | grouped surfaces |
| Linen | `#FCFAF2` | raised cards and inputs |
| Forest ink | `#173C32` | body text, 10.5:1 on paper |
| Bark | `#5A4938` | secondary text, 6.7:1 on paper |
| Fern | `#2F6B50` | primary action, 5.9:1 with white |
| Saffron | `#D99A2B` | focus and selected detail; paired with shape/text |
| Berry | `#A34436` | errors, 5.7:1 on paper |
| Moss | `#557348` | success, always paired with a status label |

The paper is subtly stippled in CSS, not with a downloaded texture. Borders
are forest-ink rules and asymmetric botanical corner marks, never generic
rounded SaaS cards.

## Typography

- Display: Georgia, Cambria, `Times New Roman`, serif. Its humanist curves and
  sturdy numerals evoke printed field manuals without adding a font payload.
- Utility/body: `Arial Narrow`, `Aptos`, `Segoe UI`, sans-serif. Small caps,
  tabular figures, and modest letter spacing distinguish specimen metadata.
- Scale: 14 / 16 / 20 / 26 / clamp(40, 7vw, 76) px; body is never below 16px.

## Space and shape

An 8px base rhythm with 4px micro-spacing. Main sections use 64–112px vertical
space on desktop and 48–72px on mobile. Corners are 2–10px; cards use clipped
paper corners, offset rules, and generous internal whitespace. Controls and
buttons are at least 44px high. The desktop workbench is a 7/5 split; at 820px
it becomes a single, deliberately reordered column with the live specimen
before saved cards. Decorative notes and one secondary intro paragraph are
removed below 500px.

## Interaction grammar

- Sliders are measuring stems: a solid fern fill with visible numeric readout.
- Every edit redraws the waveform immediately and labels the card “unsaved.”
- Save actions update a plain status line and add the named card to the list.
- Opening a shared URL restores the settings; import errors keep the current
  card intact and explain what to do next.
- QR and print appear in the share section because they move settings between
  devices or onto paper.

## Motion

UI transitions last 160–240ms and change only transform/opacity. The waveform
draws from left to right on first reveal; cards settle by 4px after save. No
motion loops. Under `prefers-reduced-motion: reduce`, transitions and waveform
reveal are immediate and smooth scrolling is disabled.

## Asset plan and provenance

One original raster hero, `site/assets/patchcard-herbarium.webp`, anchors the
metaphor: a top-down, tactile herbarium arrangement where a waveform specimen
is catalogued among pressed leaves. It has no text, logo, or UI screenshot, so
all functional copy remains real HTML. Source generated on 2026-08-27 with the
factory `gen-image.sh` deployment and converted locally to WebP. The product
uses only this generated asset and hand-authored CSS/SVG icons.

For repair 3, `site/public/patchcard-share.webp` is a deterministic center
crop of that original art at exactly 1200×630. The three PNG app icons are
deterministic square crops of the same owned art. No new model output or
external reference was used.

Final generation prompt:

> Use case: stylized-concept. Asset type: wide landing-page hero illustration
> for an open-source sound preset library. Scene/backdrop: top-down botanical
> field-guide folio on warm fibrous paper. Subject: a single translucent
> waveform shaped like the delicate venation of a fern frond, pinned as a
> scientific specimen among three sparse pressed leaves, tiny brass measuring
> pins, and restrained dark-green ink registration marks. Style/medium: tactile
> editorial still life, photoreal paper and plant texture with subtle hand-inked
> line work. Composition: 3:2 landscape, central specimen, calm negative space
> around edges, crop-safe at mobile widths. Lighting/mood: soft window light,
> quiet curiosity, archival but alive. Color palette: warm ivory paper, forest
> green, dried sage, small saffron accents. Constraints: no people, no screens,
> no synthesizer keyboard, no readable text, no letters, no logos, no watermark,
> no neon, no gradient background, no border.

The asset is original AI-generated imagery owned for this product; no external
or copyrighted reference image was used. The README and MIT license cover the
hand-authored code; adopters should provide explicit licensing metadata for
any audio sample they attach.
