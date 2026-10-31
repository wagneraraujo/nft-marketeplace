---
name: Kurio
description: Coffee and copper NFT marketplace adapted from the approved Kurio Figma.
colors:
  primary: "#d28a4c"
  accent: "#e89b55"
  background: "#140d0a"
  card: "#241612"
  raised: "#2f1d15"
  secondary: "#38220f"
  foreground: "#f5f1eb"
  muted-foreground: "#cfb28c"
  text-secondary: "#b39463"
  border: "#55321f"
  divider: "#3f2319"
  error: "#f5a58f"
typography:
  display:
    fontFamily: "Roboto Mono, monospace"
    fontSize: "43px"
    fontWeight: 700
    lineHeight: 1.6
  headline:
    fontFamily: "Roboto Mono, monospace"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.5
  title:
    fontFamily: "Roboto Mono, monospace"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "Roboto Mono, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Roboto Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  control: "4px"
  artwork: "8px"
  mobile-field: "10px"
  wallet: "12px"
  portrait: "16px"
  mobile-card: "25px"
  mobile-action: "30px"
spacing:
  step-8: "8px"
  step-12: "12px"
  step-16: "16px"
  step-20: "20px"
  step-24: "24px"
  step-28: "28px"
  step-32: "32px"
  step-40: "40px"
  step-48: "48px"
  step-72: "72px"
  step-96: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.background}"
    rounded: "{rounded.control}"
    padding: "7px 20px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "7px 20px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
    height: "44px"
  trait-chip:
    textColor: "{colors.muted-foreground}"
    rounded: "20px"
    padding: "4px 10px"
  card-art:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.control}"
    padding: "25px 4px"
---
# Design System: Kurio

## Overview

**Creative North Star: "Kurio coffee/copper marketplace"**

Kurio is the approved coffee/copper marketplace from Figma T3mb62CfaKKBEad1KGr5Qy. Compact monospaced text, warm dark fields and original ape portraits give a dense catalog a consistent identity. This records the shipped React implementation; the source reference settles the visual direction.

Desktop uses an open catalog with a sidebar and flat surfaces. Mobile changes composition: rounded artwork containers, staggered catalog columns, a bottom navigation shelf and purchase docks. Quotes, account values and receipt snapshots remain real mock data, so sample Figma prices are not visual constants.

**Key Characteristics:**

- Coffee fields with copper actions and prices.
- One local monospaced family, differentiated by size and weight.
- Original raster artwork at focal scale.
- Flat desktop surfaces and rounded mobile shelves.

Evidence: `src/index.css`, shared button/shell components, catalog card, auth, profile, wallet, checkout and order implementations; `PRODUCT.md`, `docs/figma/UI-DIRECTION.md`, `docs/visual/DECISIONS.md`, and `docs/figma/asset-map.json`. Reference screenshots live in `docs/figma/reference`; implementation captures live in `.impeccable/review`. Captures and reviewer verdicts are bounded evidence, not a pixel-equality certification.

## Colors

The palette combines coffee grounds, cream reading text and copper signals. Normative values are in frontmatter.

### Primary

- **Copper** (`primary`): filled actions, selected navigation, selection and control accents.
- **Bright copper** (`accent`): prices, text links and the visible focus outline.

### Secondary

- **Deep copper field** (`secondary`): receipt metadata band and secondary button surface.

### Neutral

- **Coffee ink** (`background`): page field and primary-action lettering.
- **Coffee card** (`card`): catalog artwork frames, sidebar, desktop auth/receipt and mobile navigation.
- **Raised coffee** (`raised`): favorite controls, receipt item rows and status fields.
- **Warm cream** (`foreground`): headings and reading text.
- **Sand** (`muted-foreground`): secondary readable text and field labels.
- **Muted ochre** (`text-secondary`): placeholders, small metadata and desktop hero description.
- **Soft copper border** (`border`) and **dark divider** (`divider`): controls and quiet structural lines.
- **Warm error** (`error`): associated field errors.

**The Copper Action Rule.** Use copper for primary actions, prices and selected navigation; keep long reading text in the warm neutral text colors.

## Typography

**Display Font / Body Font / Label Font:** locally loaded Roboto Mono, with monospace fallback. The variable WOFF2 is served by `@fontsource-variable/roboto-mono`; the implemented hierarchy uses regular, medium and bold weights.

### Hierarchy

- **Display:** desktop hero uses the frontmatter display role; tablet reduces to (27px), mobile to (18px), with mobile hero line-height (29px).
- **Headline:** detail titles and default h1 use the headline role; ordinary page headings use (24px), mobile headings (20px).
- **Title:** section headings use the title role; panel headings use (18px), account headings (16px).
- **Body:** frontmatter body role; descriptive detail copy uses (24px) line-height where specified.
- **Label:** compact labels and metadata use the label role; card names are regular (14px), prices bold (15px desktop / 16px mobile). Receipt metadata is smaller and specific to the receipt, not a new general reading scale.

**The One Family Rule.** Use local Roboto Mono for headings, prose, controls and metadata.

## Layout

Desktop page, header and footer share `min(1200px, calc(100% - 64px))`; at (1440px) this yields (120px) side margins. The header is (77px) tall including its divider. The page begins with (32px) top padding and (96px) bottom padding. The hero is (450px) high. Main home sections use (96px) separation. The catalog uses a (310px) sidebar, (48px) gap, three equal columns, (34px) column gaps and (72px) row gaps. Account pages use a (310px) sidebar and (28px) gap. Cart uses a (330px) summary and (70px) gap; checkout uses a (400px) sidebar.

At (701–1100px), shared side gutters become (24px); the hero is (350px), catalog sidebar (210px), catalog gap (24px) and grid two columns with (16px) column gaps. At (1600px) and above the shared width remains explicitly (1200px).

At (700px) and below, ordinary pages use (24px) side gutters and (130px) bottom padding. Transaction/auth forms use (28px) gutters. Desktop header/footer, promotions and editorial disappear; bottom navigation is fixed at (95px), with safe-area padding. Home uses a (190px) hero, two catalog columns with (16px) column gaps and (22px) row gaps, and even cards translated down (32px). Related grids cancel that translation. The copy beside the hero portrait is bounded by `calc(100% - 154px)`.

Detail becomes a stacked artwork/content composition with a fixed purchase dock. Account fields and wallet forms collapse to one column, and the sidebar becomes a horizontal strip. Auth and receipt dialogs fill the viewport at mobile widths. The checkout decision sequence is wallet, quote/coupon, totals and validity, consent, then confirmation.

## Elevation & Depth

Depth is predominantly tonal: card, raised and secondary fields sit on the coffee background. Cards and ordinary buttons have no decorative shadow. Desktop auth uses `0 8px 40px #0003`; the mobile purchase dock uses `0 -10px 25px #140d0a38`. Receipt backdrop is `#140d0af5`; auth has a transparent desktop backdrop over inert catalog content and an opaque coffee mobile backdrop.

**The Tonal Surface Rule.** Separate ordinary surfaces with warm fields and fine borders; reserve shadows for the auth overlay and mobile purchase dock.

State transitions use background (0.15s); button hover also brightens with `brightness(1.1)`. Skeleton loading pulses (1.5s ease-in-out). Under `prefers-reduced-motion: reduce`, animations and transitions are disabled and scroll behavior is automatic.

## Shapes

Desktop controls use compact corners; artwork adds softer image corners. Mobile deliberately increases curvature: catalog shells (25px), portraits (16px), hero (28px), navigation top corners (30px), detail content (32px), purchase dock (36px), and cart summary (40px). Mobile transaction actions are pills (30px); auth fields/actions use (10px). Trait chips use (20px). Avatars, favorite controls and quantity actions are circles. One-pixel copper borders distinguish fields and selected states; desktop auth and receipt have a (4px) copper bottom edge.

## Components

### Buttons

Primary buttons use copper with coffee lettering, medium (14px) type, (7px 20px) padding, (35px) minimum height and compact corners. Outline/ghost variants preserve the shared geometry; outline uses a fine border, ghost gains the muted surface on hover. Disabled controls use half opacity and a disabled cursor; disabled social auth uses (0.8) opacity. Mobile purchase and checkout actions increase to (58–60px), while auth actions reach (60px). Hover brightens; focus uses an accent (2px) outline offset (4px). The shared Base UI button also supplies its ring/invalid states.

### Chips

Traits are outlined, rounded metadata chips with sand text and (4px 10px) padding. Status uses a raised field with copper text. They are metadata, not controls. Filter tabs use `aria-pressed`; selected tabs become copper with a (2px) underline.

### Cards / Containers

Catalog cards frame square `object-fit: cover` artwork on coffee card fields, with a separate title/price below. Favorite buttons are circular overlays, shown on hover, keyboard focus or selection; mobile also exposes the first card favorite. Preserve accessible names and `aria-pressed`. Wallet selection is a (12px) rounded, bordered card; checked radios turn the border copper.

The four original PNG portraits (`8f387.png`, `83794.png`, `9add2.png`, `b7cfc.png`) and supplied SVGs are exported from the approved Figma and served from `public/figma`. `docs/figma/asset-map.json` and `src/lib/design-assets.ts` record provenance/slot mapping. Use the current NFT's artwork throughout its gallery; do not borrow other NFTs as alternate views. Frame captures are documentation only.

### Inputs / Fields

Transparent fields have a copper border, warm text, compact corners, (11px 14px) padding and (44px) height. Mobile auth fields are (50px). Search groups wrap an unbordered field inside the enclosing border. Checkboxes/radios use copper accent and (16px) size. Labels remain associated even where visually hidden; warm error text is associated with invalid inputs. Password visibility controls are named buttons. Avatar selection uses the accessible Portuguese “Alterar foto” trigger and filename/format status.

Profile persists name, email, avatar, username, ENS and wallet alias. Wallets persist label, address, primary flag, display/profile names, Ethereum network, type, email, ENS, secondary address and referral code through Zod contracts and MSW handlers. Password save is separate and validates confirmation. Checkout account fields are read-only; wallet choice selects a saved wallet, with no invented chain connection.

### Navigation

Desktop navigation spans the header height; current pages use copper and a bottom underline. Account navigation uses sand text, copper current state and a (5px) left marker; mobile removes that marker. The mobile shelf uses supplied SVGs, active copper and a raised circular center action. Icons are supplied SVGs or consistently drawn Lucide SVGs, never glyph substitutes.

### Native dialogs and receipt

Auth and receipt call `showModal()` on native dialogs, preserving browser modal focus management. Accessible close buttons and Escape route back to home/orders. Desktop auth is (500px) wide with final padding (44px 80px 42px); receipt is (580px) with (28px 32px 24px) padding and bounded viewport height. Mobile explicitly overrides native max-width and uses full viewport width/height. Receipt content scrolls independently while the centered final action stays outside that scroll region. Its copper metadata band groups total, order, date, wallet and any explicitly simulated transaction; item/amount data comes from the order snapshot.

## Do's and Don'ts

### Do:

- **Do** use the approved local artwork and the shared coffee/copper tokens.
- **Do** preserve visible keyboard focus and reduced-motion handling.
- **Do** let narrow layouts recompose into the shipped mobile patterns.
- **Do** show actual saved fields, quote totals and order snapshots with explicit simulation wording.

### Don't:

- **Don't** use frame screenshots as UI or substitute unrelated artwork in an NFT gallery.
- **Don't** introduce another display family or decorative hard offset shadows.
- **Don't** present unavailable social, payment or blockchain operations as working controls.
- **Don't** extend the reference-specific hero welcome label into a general eyebrow pattern.

Not canonized or repaired by this documentation: the retained “Bem-vindo à Kurio” hero eyebrow is a craft-floor defect with a narrowly documented source-authority exception in `.impeccable/review/REFERENCE-EXCEPTIONS.md`; it is not a reusable pattern. `REVIEW.md` and `VERDICT.md` describe bounded review findings; final receipt recaptures are handled separately. No visual defect is legitimized as a token here. `RTK.md` was referenced but absent from this workspace.
