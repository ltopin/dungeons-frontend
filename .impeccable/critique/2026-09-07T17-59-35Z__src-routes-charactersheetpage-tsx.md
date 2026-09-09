---
target: "/campanhas/:id/ficha"
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 3
p1_count: 2
target_identity: "file:C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CharacterSheetPage.tsx"
target_fingerprint: "sha256:06169ef611c433245298370e0984807a316464a2d1458072de322ddd8c95b6be"
target_path: "C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CharacterSheetPage.tsx"
timestamp: 2026-09-07T17-59-35Z
slug: src-routes-charactersheetpage-tsx
---
Method: dual-agent (A: a5cb280df91808a1b · B: a6ad532937e13750a)

Target resolved: /campanhas/:id/ficha -> src/routes/CharacterSheetPage.tsx, composing 8 tab components under src/sheet/tabs/. Evaluated with real backend state (signup, campaign, join, populated fields) against the live API/DB, driving a real headless-Chrome session through login and all 8 tabs at desktop and mobile widths, with Impeccable's own detector injected into the live DOM.

# Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2/4 | Autosave badge renders nothing until the first edit; browser tab title stays the generic "Livro de Ligações" |
| 2 | Match System / Real World | 3/4 | Strong D&D terminology and hex-seal metaphor, but English ability codes (STR/DEX...) sit directly over Portuguese labels |
| 3 | User Control and Freedom | 1/4 | Zero way back to the campaign - no link, no breadcrumb; only browser back |
| 4 | Consistency and Standards | 1/4 | Talentos tab uses a .row-card class with no matching CSS rule - visibly unstyled next to every other list tab |
| 5 | Error Prevention | 1/4 | Every row delete (X) fires instantly, no confirm, no undo |
| 6 | Recognition Rather Than Recall | 2/4 | Perícias never computes a skill Total - player must recall the ability mod from another tab and add it by hand |
| 7 | Flexibility and Efficiency | 1/4 | Tab bar is plain buttons, not an ARIA tablist - no arrow-key switching; no bulk actions or row templates anywhere |
| 8 | Aesthetic and Minimalist Design | 3/4 | Clean section grouping and density; Talentos breakage is the main blemish |
| 9 | Error Recovery | 2/4 | Per-row save failures get a retry button (good); top-level load failure is one flat sentence with no retry |
| 10 | Help and Documentation | 1/4 | One inline hint exists in the whole sheet; the pattern isn't reused anywhere it's also needed |
| **Total** | | **17/40** | **Poor - major UX overhaul needed** |

All 10 heuristics apply to this surface (data-entry Operate UI); none scored n/a.

# Design Specificity Verdict

**Design review**: The visual chrome is genuinely authored for D&D - hexagonal ability-score "seals," Cinzel display type, gold-on-parchment inputs, a blue "total" pill pattern on saving throws that actually does the game's arithmetic for the player. This isn't a generic dark-mode form in a costume. But the interaction model underneath doesn't match that ambition: every field with a fixed D&D vocabulary (Tamanho, Alinhamento, a skill's ability code) is a bare text input, skill totals are never computed, and two of eight tabs (Talentos, Ataques) are either visibly broken or functionally empty. The theme is specific; the tool under it is a generic CRUD list wearing that theme, and the gap widens the deeper you go into the tabs.

**Deterministic scan**: The CLI static scan (impeccable detect on the TSX source) came back clean - but that's a coverage gap, not a clean bill of health. The regex-based scanner can't see computed styles, and the file actually responsible for every finding below (src/styles.css) wasn't in the scanned target set. Injecting the same detector into the live rendered page instead found 23 anti-patterns: 16x undersized-ui-text (ability-score labels at 9px, field labels at 10px - both below the 11px floor), 6x text-occlusion (each ability modifier badge, e.g. "+2", "+4", 33% covered by its own hex background), and 1x border-accent-on-rounded on the masthead header. That last rule already has a self-authored suppression sitting in .impeccable/config.json marked "not user-confirmed" - the live page still visibly reproduces it regardless. A separate DOM probe found 29 of 29 form inputs on the Geral tab have no programmatic label (label for/aria-label missing) - sighted users see labels fine, but a screen reader gets nothing.

There's a real tension between the two assessments worth naming: the design review calls the ability-score seals the single strongest piece of visual identity on the page - and the detector shows that exact component is where the undersized-text and text-occlusion findings concentrate (12 of 23 findings live inside .seal-label-text/.seal-mod). The idea is right; the execution of that specific component needs a pass.

**Visual overlays**: A screenshot of the live injected overlay confirms the findings aren't scanner noise - the highlight boxes sit exactly on the 9-10px ability/field labels and visibly clip through the "+2"/"+4" modifier badges. This was a one-shot capture; the evidence-gathering dev session has since been stopped.

# Overall Impression

The identity is there and it's good - this doesn't read as a template. What's missing is the follow-through: the page that gets used constantly during a live session has no way out, deletes data with one accidental click, is unusable with a screen reader, and two of its eight tabs are unfinished. It's a strong skin on an incomplete skeleton.

# What's Working

- **Ability seals**: the hexagon-clip shape plus circular modifier badge reads as a sigil, not a stat box - genuinely distinctive, even with the text-rendering bugs inside it.
- **Saving-throw total pills** (Combate tab): the one place the app actually does the game's math for the player (base + mágico + outros -> live total) instead of just storing three raw numbers. This is the pattern the rest of the sheet should be following.
- **Per-row autosave with isolated retry**: a flaky save on one skill row doesn't block or roll back the other nineteen - a good engineering call for a tool meant to survive a live session, even though its visibility (badge only appears after first edit) needs work.

# Priority Issues

**[P0] No way back to the campaign**
Why it matters: this is the page a player lives in during a session; a dead end with only browser-back as the exit breaks the "app" feeling and is a real trap on mobile.
Fix: reuse the "Voltar à campanha" link pattern that already exists on the sibling read-only page (CharacterSheetReadOnlyPage.tsx) but was never added here.
Suggested command: /impeccable clarify

**[P0] Screen readers cannot use this page**
Why it matters: 29 of 29 form inputs on the Geral tab have no programmatic label (confirmed by DOM probe, not inferred) - a screen-reader user gets no accessible name on any field. This isn't a polish gap, it's a full task-completion block for that user group.
Fix: bind every visible field caption to its input via label htmlFor/id, or aria-label where a visual label isn't a real label element. Very likely systemic across all 8 tabs (same field components reused), not just Geral.
Suggested command: /impeccable audit

**[P0] Instant, unconfirmed row deletion**
Why it matters: every X across Talentos/Ataques/Perícias/Magias/Itens deletes immediately with no confirm and no undo - one misclick permanently destroys a hand-written talent description or spell note.
Fix: confirm dialog before delete, or an undo toast with a few seconds' grace before the DELETE actually fires.
Suggested command: /impeccable harden

**[P1] The signature ability-seal component has undersized and self-occluding text**
Why it matters: this is the component the design review flagged as the strongest visual identity on the page - and the detector shows 12 of its 23 findings live inside that exact component (6x labels at 9px, 6x modifier badges 33% covered by their own background hex). The idea is right; the execution undermines it.
Fix: raise .seal-label-text off the 9px floor (11px minimum) and fix the margin-top: -14px overlap between .seal-mod and .seal-hex in src/styles.css.
Suggested command: /impeccable polish

**[P1] Two of eight tabs are unfinished (Talentos, Ataques) and Perícias never computes a total**
Why it matters: Talentos uses a CSS class (.row-card) with no matching stylesheet rule, so it renders visibly broken; Ataques shows a bare empty box with no guidance; Perícias stores the pieces of a skill total (graduações, outros) but never adds the ability modifier, forcing mental math on the single most-used number at the table.
Fix: restyle Talentos with the existing .list-section treatment, add empty-state copy to Ataques/Itens, and add a computed Total pill to Perícias matching the saving-throw pattern already built in Combate.
Suggested command: /impeccable layout then /impeccable clarify

# Persona Red Flags

**Jordan (first-timer)**: Perícias shows raw ability codes (int, dex, cha...) as free text rather than a picker, assuming prior familiarity; the empty Ataques tab gives no cue whether it's broken or just empty; the bare "Carregando ficha..." loading state drops the entire theme, briefly making the app look like it navigated somewhere broken.

**Sam (accessibility-dependent)**: confirmed via DOM probe, not assumption - 29/29 inputs on Geral have no label association, so a screen reader announces nothing usable on any field. The tab bar is plain buttons with no tablist/tab/tabpanel roles, so there's no "tab 3 of 8" context and no arrow-key navigation between tabs.

**Riley (stress tester, running combat live)**: the missing Perícias total means doing addition mid-turn; the no-confirm delete means one mistimed tap during a tense moment permanently wipes a spell or attack; building an attack from scratch under time pressure means filling 6 separately-labeled free-text fields per row with no templates or autocomplete.

# Minor Observations

- Browser tab title never updates from the generic "Livro de Ligações" - affects anyone with multiple campaign tabs open, plus browser history/bookmarks.
- Ability abbreviations are English (STR/DEX) directly over Portuguese labels - inconsistent localization.
- Tamanho and Alinhamento are free text despite being fixed D&D vocabularies, inviting typos/casing drift over time.
- The "Salvo" badge has no timestamp - a save from 20 minutes ago looks identical to one from 2 seconds ago.
- The blood-red accent used for the "Pontos de Vida" section title never applies to the HP figures themselves when the character is wounded (29/42 shown with no visual damage state).
- Garamond (body font) isn't loaded as a webfont - only Cinzel and JetBrains Mono are - so body text silently falls back to a system serif on machines without Garamond installed.

# Questions to Consider

- Talentos and Ataques are core, class-defining tabs for a Ranger, yet they're the two least-finished - was that a deliberate sequencing choice, or did they just get skipped?
- There's no manual Save button anywhere - is a badge that only appears after the first edit enough for a player to trust their character survives a crash mid-session?
- If a player had to run tonight's combat on this sheet, would the theme survive contact, or would they quietly open a spreadsheet instead?
