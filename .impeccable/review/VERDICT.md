## verdict

1. resolved — detail-desktop.png now shows only the current Emerald Ape in all four thumbnails and the focal image, with consistent title and purchase context.
2. resolved — home-mobile.png shows the full description beside the portrait; home-tablet.png wraps the paragraph within the copy column without clipping.
3. resolved — login-mobile.png and register-mobile.png now have equal 28 px input gutters, centered brand/title, and restored registration spacing; confirmation-mobile.png fills the viewport width.
4. resolved — the updated confirmation-desktop.png and confirmation-mobile.png visibly show the #241612 receipt, compact copper metadata band including the real total and simulated transaction, and a centered “Continuar explorando” action fully inside both captured viewports. The previous action-visibility regression is resolved.
5. resolved — checkout-mobile.png now orders the selected wallet, quote/coupon, total, validity/refresh, consent and confirmation in the decision sequence requested.
6. resolved — profile-desktop.png and profile-mobile.png show a styled Portuguese “Alterar foto” control and format/size status, with no exposed English file-picker chrome.
7. resolved — desktop captures visibly show consistent drawn service icons and a drawn login icon replacing the Unicode substitutes.
8. partial — home-desktop.png no longer has the editorial guide/category labels; detail-desktop.png and confirmation-desktop.png no longer have the collection/order eyebrows. The hero welcome eyebrow remains above the heading in home-desktop.png, home-tablet.png and home-mobile.png. Its literal Figma provenance is acknowledged; the reviewer's explicit eyebrow ban says fidelity to a comp cannot authorize that element, so renaming its class cannot close the finding.

## remaining

- Fix8 remains partial: the hero welcome eyebrow is retained by the parent as the documented Figma-source exception in REFERENCE-EXCEPTIONS.md. That record accurately distinguishes the parent's implementation decision from reviewer approval; it does not resolve this reviewer's explicit floor finding.
- Fixes1–7 are resolved at the scored-fix scope. No further regression is visible in the updated receipt captures. This is not a new whole-surface review.

disposition: fix
