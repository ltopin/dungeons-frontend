---
target: /campanhas
total_score: 13
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CampaignsListPage.tsx"
target_fingerprint: "sha256:4447db22c894bdefbdfaf66cbb5ef61eab064b5e6b8d0cc0174083ab96833bb6"
target_path: "C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\CampaignsListPage.tsx"
timestamp: 2026-09-07T12-40-22Z
slug: src-routes-campaignslistpage-tsx
---
Method: dual-agent (A: a20a19a4680995418 · B: a35535f3c3022f1ab)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 1 | Loading text exists, but "Entrar" has no pending/disabled state during the async join call, and no success confirmation beyond an implicit route change |
| 2 | Match System / Real World | 2 | PT-BR domain vocabulary (mestre/jogador) is right, but "Campanhas abertas" shows only a name — no mestre, no description |
| 3 | User Control and Freedom | 1 | No confirm/undo on "Entrar" (join) or "Sair" (logout); no cancel affordance in the create-campaign flow |
| 4 | Consistency and Standards | 1 | Raw browser-default buttons/links directly contradict the themed `.auth-screen`/`.ficha-sheet` patterns used elsewhere in the same app |
| 5 | Error Prevention | 1 | "Criar campanha" (constructive) and "Sair" (destructive) sit in the same unstyled `<nav>` row with identical visual weight |
| 6 | Recognition Rather Than Recall | 2 | "nome — role" inline per row is fine; open campaigns give no recognizable context before joining |
| 7 | Flexibility and Efficiency | 1 | No search/sort/filter once either list grows |
| 8 | Aesthetic and Minimalist Design | 1 | Sparse ≠ minimalist here; reads as unfinished rather than intentional |
| 9 | Error Recovery | 1 | Alert messages are generic with no retry, despite a `.save-status__retry` pattern already existing in the codebase's CSS |
| 10 | Help and Documentation | 1 | Only a one-line welcome banner; no contextual guidance for the more consequential open-campaign join decision |
| **Total** | | **13/40** | **Poor** |

## Design Specificity Verdict

**LLM assessment**: This is a generic CRUD list wearing the app's colors by accident, not by design. The only D&D/product-specific touches are inherited globals (dark-brown `body` background, Garamond serif, `main{max-width:960px}`) that apply to every route — nothing on the page itself was authored for a campaign/ficha tracker built for a friend group. Headings, `<ul>`/`<li>` structure, and bare `<button>`/`<a>` elements are indistinguishable from a tutorial todo-list app. This matches PRODUCT.md's own stated evidence ("sem estilo visual aplicado, HTML semântico simples") — confirmed, and arguably worse in practice: unstyled OS-default buttons float on a dark-brown body, which reads as visually broken rather than neutrally plain.

**Deterministic scan**: The bundled detector (`impeccable detect --json src/routes/CampaignsListPage.tsx`) returned **0 findings**, exit code 0 — a clean pass. This is not a contradiction of the LLM review; it's a scope mismatch worth naming explicitly. The detector runs regex-based anti-pattern matching on the `.tsx` file's own inline styling surface, and this file has almost none to catch (two `className` references, no inline `style=`, no hardcoded colors in JSX). Its config/ignore rules were checked and are not suppressing anything relevant. The page's real problems — no thematic identity, flat hierarchy, unstyled interactive elements — are problems of *absence*, which a regex detector targeting anti-patterns structurally cannot see. Read "0 findings" here as "nothing to flag," not "nothing wrong."

**Visual overlays**: Not available this run. No browser automation tool is exposed in this session, so no live-server injection or on-page overlay was attempted. Assessment B relied on CLI detector output plus a manual source cross-check against `src/styles.css` only.

## Overall Impression

The screen works — state handling (loading/error/empty/populated, independently for two lists) is genuinely solid — but it has had no design pass at all, and it's the very next screen a user sees after the warmly-styled login/signup flow and its own green welcome banner. That handoff is the biggest opportunity: right now the emotional temperature drops off a cliff the instant the banner's done its job.

## What's Working

- **Accessibility scaffolding is real, not decorative**: `role="status"`, `role="alert"`, `aria-label="Campanhas abertas"` are all correctly placed — a strong foundation to design on top of rather than something to bolt on later.
- **State model is complete and independent per list**: loading, error, empty, and populated are each handled for both "suas campanhas" and "campanhas abertas," with no silent failure paths.
- **Welcome banner tone is right**: the green "Conta criada com sucesso!" banner is a genuine warm peak — the problem is what comes right after it, not the banner itself.

## Priority Issues

**[P0] Destructive and constructive actions share one visual weight**
- **Why it matters**: "Criar campanha" and "Sair" (logout) sit in the same unstyled `<nav>` row, rendered identically. A misclick logs the user out with no confirmation.
- **Fix**: Separate them structurally — move "Sair" to a secondary/account area (or require confirmation), and give "Criar campanha" primary-button styling so it reads as the intended next action.
- **Suggested command**: `/impeccable layout`

**[P0] No thematic identity — the screen breaks the product's established visual language**
- **Why it matters**: This is the first screen after login/signup, both of which already carry the "Livro de Ligações" leather/gold tokens (`--panel`, `--gold`, `--parchment`, etc., defined in `styles.css`). Landing here after that setup feels like leaving the product entirely.
- **Fix**: Introduce a `.campaigns-screen` treatment that reuses the existing token set rather than inventing a new palette — this doesn't require redesigning the sheet's identity, just extending it.
- **Suggested command**: `/impeccable polish` (or `/impeccable colorize` if color/token work should be isolated first)

**[P1] Open campaigns can be joined one-click, with zero decision-relevant context**
- **Why it matters**: "Campanhas abertas" shows only a name. There's no mestre, no description, no player count — a jogador commits to a campaign (per PRODUCT.md, exactly one ficha per campaign, a meaningful commitment) blind.
- **Fix**: Show mestre name and a short description per open-campaign card before the "Entrar" action.
- **Suggested command**: `/impeccable clarify`

**[P1] Error and empty states have no recovery path despite one already existing in code**
- **Why it matters**: `role="alert"` messages ("Não foi possível carregar…") are dead ends. The codebase already defines a `.save-status__retry` pattern elsewhere that isn't reused here.
- **Fix**: Wire a retry action into both error states; give the empty state ("Você ainda não participa de nenhuma campanha") an embedded CTA instead of a flat statement.
- **Suggested command**: `/impeccable clarify`

**[P2] "Entrar" has no pending/disabled state**
- **Why it matters**: A double-click can double-fire `entrarNaCampanha`, risking a duplicate-membership error surfaced as a raw alert.
- **Fix**: Disable the button and show a pending state for the duration of the request.
- **Suggested command**: `/impeccable polish`

## Persona Red Flags

**Jordan (First-Timer)**: Just saw the polished green welcome banner after signing up, then immediately hits raw bullet lists and gray default buttons — a jarring tonal drop. Joining an open campaign with only a name to go on (no mestre, no description) is intimidating with nothing to base the decision on.

**Sam (Accessibility-Dependent)**: The `role`/`aria-label` usage is genuinely good, but focus rings silently revert to the browser default here, unlike the explicit gold `:focus-visible` styling used in `.auth-screen`/`.ficha-sheet` — jarring mid-app for keyboard users. More concretely: each "Entrar" button's accessible name is just "Entrar" — the campaign name is a sibling text node, not inside the `<button>` — so a screen-reader user tabbing through multiple open campaigns hears "Entrar, button" repeated with no way to tell them apart.

**Riley (Stress-Tester)**: Rapid double-click on "Entrar" has no disable guard. A long list (10+ campaigns) is just an ever-growing bare `<ul>` with no scroll container, search, or cap — cognitive load climbs linearly with data volume, with zero mitigation.

## Minor Observations

- The two identical "Carregando…" strings for the two independent lists are visually indistinguishable at a glance — a small addition of context (e.g. inside each section) would help.
- "nome — role" string concatenation could be misread as part of the campaign's own name by a new user.

## Questions to Consider

- PRODUCT.md describes an invite-code join flow; the shipped code instead shows a public "browse open campahas" list. Intentional pivot, or drift worth reconciling in the product doc?
- If this screen is meant to "feel part of the same product" as the tome-themed screens, why is it apparently the last one to get a visual pass — sequencing, or genuine uncertainty about what a list screen should look like in this visual language?
- There's no visible way to leave a campaign once joined by mistake — does that path exist anywhere in the product, even off-screen?
