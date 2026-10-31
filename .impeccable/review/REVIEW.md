disposition: fix

Inputs unavailable: RTK.md, a QUALITY BAR card, and a five-block seeded direction contract; the packet explicitly identifies an existing Figma adaptation, so new-world roll, comp approval, build-state and comp-diff gates do not apply. Figma contexts were sampled; no browser, rendering, second detector pass, or business-test execution was performed.

## persistence

Pass for the declared reference-adaptation path: PRODUCT.md exists, with the visual authority, preserved business constraints, operating viewports and simulation boundaries recorded. UI-DIRECTION.md and DECISIONS.md persist the measured layout and deliberate functional differences. All 21 required captures exist, show the claimed route/state from its top, have plausible content and dimensions, and contain no malformed blank regions: 10 desktop captures at 1440 px, 10 mobile captures at 414×896, and the 768 px full-page tablet capture. Modal backdrops are intentional, not invalid evidence. This review does not certify the pending 390 px business suite.

## fidelity

The reference inventory is a coffee-colored page field, copper actions, compact monospaced lettering, square original ape portraits, a desktop split hero and sidebar/three-column catalog, an offset two-column mobile catalog, rounded mobile bottom navigation, compact desktop auth/receipt panels, and account forms beside an active sidebar. These existing Figma sources are authoritative references, not a generated approved comp.

| Element | Status | Evidence |
| --- | --- | --- |
| TYPE | match | Local Roboto Mono preserves the reference's monospaced character, weight hierarchy and terminals. The detector's Roboto warning is overridden by the pinned Figma face. |
| MATERIAL | match | Original raster portraits are plainly visible at focal scale; the implementation does not replace them with CSS/vector illustration or bury them under a wash. |
| GROUND | match | Most frequent page-field pixel is RGB(20,13,10), #140D0A, in both reference/home.png and home-desktop.png. The principal card field is RGB(36,22,18), #241612, in both. The receipt panel is the exception below. |
| Desktop home composition | match | Hero/image scale, sidebar, three-column grid, promotional blocks and editorial follow the source proportionally. |
| Mobile home composition | contradicted | The staggered grid and hero art are present, but descriptive text disappears behind the portrait. The 768 px hero also clips its prose instead of wrapping within its column. |
| NFT detail | contradicted | The prominent artwork and mobile purchase dock follow the source, but desktop thumbnails introduce other NFTs as alternate images of the NFT being purchased. Clicking changes artwork without changing title, price or purchase ID. The source thumbnails show the same work. |
| Cart and visitor state | adaptation | Real item count, API quote, service fee and visitor sign-in message follow PRODUCT.md and DECISIONS.md rather than static sample totals. The recognizable row/summary composition remains. |
| Checkout data and wallet choice | adaptation | Read-only account fields, registered wallets, consent and quote refresh are supported by the documented product truth; fake provider connections are correctly absent. |
| Mobile checkout reading order | contradicted | The confirmation button appears above coupon, subtotal, fee, total and quote validity. The source places the total before the final action. Required business controls explain extra content, not this reversed decision order. |
| Auth dialogs | contradicted | Mobile content is off-center: inputs run from x28 to about x352 instead of x386 in the 414 px source. Registration also compresses the brand/title/form spacing considerably. The native dialog width limit remains active despite width:100%. |
| Receipt | contradicted | The desktop panel uses the page-field color and loses the reference's clearly bounded #241612 surface and copper metadata band. Transaction/date/total information is scattered below the list rather than grouped. Mobile also inherits the native dialog width limit. Real snapshot totals and the explicitly simulated transaction are acceptable adaptations under DECISIONS.md. |
| Profile and wallets | adaptation | Persistent optional fields, real account state, separate password save and actual registered wallets follow DECISIONS.md; the sidebar/form structure remains recognizable. The exposed English native file-picker control is unfinished browser chrome. |
| Navigation, editorial and footer destinations | adaptation | Existing working destinations and the favorites alternative to newsletter are explicitly documented in PRODUCT.md/DECISIONS.md. Unsupported commercial/social/chain claims are omitted rather than invented. |
| Footer icons and small labels | contradicted | Unicode ◈/◉/♧ substitute for an icon system. Hero welcome labels, editorial “GUIA … / CULTURA DIGITAL” labels, the detail collection kicker and the receipt order kicker also fail the craft floor's explicit eyebrow ban. |

## ceiling

The Figma reference supplies the finish bar in this adaptation; no separate world card was supplied. Its compact receipt surface, grouped metadata, consistently drawn icons, balanced mobile auth geometry, and legible copy beside artwork remain unused or incomplete. Do not invent motion or ornament to compensate. The first viewport retains the distinctive ape/copper/mono identity; the clipped prose and uneven dialog gutters weaken its finish.

## material_fixes

1. Truth/fidelity — In src/features/catalog/detail.tsx, remove unrelated NFTs from the current item's image gallery; use only actual images of that NFT, or a single primary image. Selecting another work must navigate to that work and update all purchase context.
2. Responsive fidelity — Bound the home hero copy to the space beside the portrait at 414/390 px and at 768 px; make the complete description wrap visibly, with no text hidden under art or clipped at a flex-column edge.
3. Auth fidelity — Explicitly override the native mobile dialog max-width for auth and receipt, giving the 414 px auth inputs equal 28 px gutters and a viewport-wide receipt. Restore the registration brand/title/form vertical spacing toward mobile-register.png while retaining scrollable error states.
4. Receipt fidelity — Restore the desktop #241612 receipt surface, a distinct copper-tinted metadata band grouping transaction/date/total and wallet when known, and a centered final action; retain the real snapshot and the explicit simulation wording, without adding Etherscan or chain claims.
5. Checkout reading order — Put quote totals and validity/refresh before consent and the final confirmation action in the mobile DOM/visual order. Keep the selected real wallet above those controls; the purchase action must follow the amount it authorizes.
6. Browser-surface finish — Replace the exposed profile file-picker chrome with an accessible styled “Alterar foto” trigger and a Portuguese filename/status, preserving file selection, validation, keyboard focus and persistence.
7. Craft floor/icon fidelity — Replace footer Unicode service glyphs and the header login arrow glyph with supplied SVG assets or consistently drawn icons; retain their existing actions and labels.
8. Craft floor — Remove the visible hero welcome eyebrow, editorial guide/category eyebrows, detail collection eyebrow and receipt order eyebrow; retain meaningful collection/order information in ordinary metadata rows rather than above headings.

## keep

Keep the exact coffee/copper ground, local Roboto Mono, original raster portraits, staggered mobile catalog, functioning business workflows, preserved user data, authoritative quote values and honest simulation boundaries.
