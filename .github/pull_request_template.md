## Summary

<!-- What changed and why. -->

## Testing

<!-- How you verified the change. -->

## Mobile UI checklist

Delete this section if the PR does not touch `apps/mobile/`.

- [ ] Opened every changed screen, sheet, or form on a physical iPhone (not only the simulator)
- [ ] Typed into every text field in those screens and confirmed the text is visible above the keyboard
- [ ] If a shared primitive changed (`bottom-sheet-shell`, `story-bottom-sheet`, `parent-bottom-sheet`, `use-bottom-sheet-*`): checked its consumers per `apps/mobile/AGENTS.md`
- [ ] Checked school admin, parent, and teacher if the component is shared across portals
- [ ] Attached screenshots for visible UI changes
- [ ] If the sheet gallery visual diff failed: reviewed the `sheet-gallery-android` diffs and either fixed the regression or committed updated baselines
