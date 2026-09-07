---
target: campanhas/nova
total_score: 8
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 2
target_identity: "file:C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\NewCampaignPage.tsx"
target_fingerprint: "sha256:9b6ef859bdd2a74e41f867973b25787d2e8f69422a6a6f7ec248030b0ee30db5"
target_path: "C:\\Users\\ltopi\\OneDrive\\Documentos\\Projetos\\dungeonsanddragonsregistration\\dungeons-frontend\\src\\routes\\NewCampaignPage.tsx"
timestamp: 2026-09-07T13-01-31Z
slug: src-routes-newcampaignpage-tsx
---
Method: dual-agent (A: ace529f8637c67249 · B: a8808f09180ed5087)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 0 | No loading/submitting feedback while `criarCampanha` POST is in flight |
| 2 | Match System / Real World | 2 | Label copy is correct but no example name, no framing of what happens next |
| 3 | User Control and Freedom | 1 | No cancel/back link; only escape is the browser back button |
| 4 | Consistency and Standards | 0 | No themed wrapper, no `id`/`htmlFor`, no `autoComplete`, no disabled-while-submitting — breaks pattern set by Login/Signup/CampaignsList |
| 5 | Error Prevention | 1 | No `maxLength`, submit button not disabled → double-click can fire duplicate POSTs |
| 6 | Recognition Rather Than Recall | 3 | Single field, nothing to recall — low-risk by task nature |
| 7 | Flexibility and Efficiency | n/a | Single-field form has no meaningful "expert" shortcut to add |
| 8 | Aesthetic and Minimalist Design | 0 | Not minimalist — unstyled; no hierarchy, no brand presence |
| 9 | Error Recovery | 1 | `ApiError` detail is caught and discarded; every failure (401, network, validation) shows the same generic message |
| 10 | Help and Documentation | n/a | Task is one labeled field; no documentation need |
| **Total** | | **8/32** | **Critical** (25%, below the 30% Poor threshold) |

## Design Specificity Verdict

**LLM assessment:** Zero product character. `NewCampaignPage.tsx` is bare semantic HTML — `<main><h1><form><label><input><button>` — with no `className`, no inline style, no design tokens. That alone wouldn't be surprising for a nascent product, but it's a materially worse finding here than "the area is unstyled": `CampaignsListPage` (28 `className` usages), `LoginPage` (8) and `SignupPage` (10) all already carry the "Livro de Ligações"-adjacent panel theme (gold-topped panels, Cinzel headings, loading states, status-code-aware errors, focus management on error). This page is the one screen in the campaign-creation flow left behind, and it sits one click past a fully themed gold "Criar campanha" button — the user free-falls from a polished screen into raw browser-default form controls mid-flow.

**Deterministic scan:** The static regex detector found **zero findings** on the target file (`impeccable detect --json src/routes/NewCampaignPage.tsx`, exit 0, `[]`) — expected and not reassuring, since the file has literally no CSS surface for pattern rules to fire on. A URL-mode Puppeteer scan against the live route (`http://localhost:5173/campanhas/nova`) returned one finding, but it traced to `.auth-screen__panel` on the **login page**, confirming the route actually redirected there (`RequireSession` → no session → `<Navigate to="/login" />`) rather than rendering the target. That finding is evidence the target page could not be reached live, not a defect in the target itself. A broader scan of `src/routes/` also returned no findings, and `CampaignPage.tsx` (the campaign detail screen) is the only other route file at 0 `className` usages — the same "left behind" pattern, worth a follow-up look later.

**Visual overlays:** Not available. Assessment B confirmed no screen-share/screenshot tool was accessible and, more fundamentally, the target route is auth-gated with no live backend session in this environment — it redirects to `/login` before rendering, so there is nothing on `/campanhas/nova` a browser overlay could have highlighted. No overlay is shown in a **[Human]** tab; this is a fallback signal, not a skipped step.

## Overall Impression

The form works — it validates, submits, and navigates on success — but that is the entirety of its design. Every neighboring screen in this exact flow (signup, login, the campaign list one click before this page) has already solved loading states, status-aware errors, and a themed panel layout. This page reimplements none of it, so it reads less like "early, unstyled MVP" and more like a page that fell out of the rollout. The single biggest opportunity is also the cheapest: the visual and interaction patterns already exist elsewhere in this codebase (`.auth-screen__panel`, `carregando` state, `ApiError`-aware messaging) — this page needs to adopt them, not invent new ones.

## What's Working

- The core loop is functionally sound: empty-name validation, POST to the API, navigate to the new campaign on success — nothing blocks the user from completing the task.
- `role="alert"` is present on both error paragraphs, so failures are at least announced to screen readers.
- Beyond that, there's nothing further to credit — no visual design, no state handling beyond the bare minimum. Assessment A was explicit that inventing a third strength would be dishonest here.

## Priority Issues

**[P0] No loading/disabled state during submission**
Why it matters: `handleSubmit` awaits `criarCampanha` with no `carregando` flag and the button stays clickable throughout. A slow network or a double-click fires two `POST /campanhas` requests, potentially creating duplicate campaigns the user then has to notice and clean up.
Fix: add a `carregando` state mirroring `SignupPage`, disable the button and swap its label to "Criando…" while in flight.
Suggested command: `/impeccable harden`

**[P0] Server error detail is discarded — every failure shows one generic message**
Why it matters: `apiRequest` throws an `ApiError` carrying a real HTTP status and often a server message, but `catch { setErroEnvio('Não foi possível criar a campanha. Tente novamente.') }` throws it away. A 401 (session expired), a validation error, a duplicate-name conflict, and a plain network outage all render identically — "Tente novamente" is actively misleading when the real problem is that the user is logged out.
Fix: branch on `err instanceof ApiError` / `err.status` as `SignupPage` already does, plus a distinct offline message for network failures.
Suggested command: `/impeccable harden`

**[P1] Zero visual/brand identity, breaking continuity from the campaign list**
Why it matters: The user arrives from a fully themed gold pill button into raw browser-default controls — the single largest consistency break in the product (heuristic 4), landing at the moment PRODUCT.md frames as the exciting "start of a new adventure."
Fix: wrap the form in the same panel convention already used by `.auth-screen__panel` / `.campaigns-screen__panel` (gold top border, panel background, Cinzel heading) rather than inventing a new visual language.
Suggested command: `/impeccable polish`

**[P1] No way back or out of the form**
Why it matters: No cancel link, no breadcrumb to `/campanhas` — the only escape is the browser back button, undiscoverable for less technical users and inconsistent with every other screen's masthead/nav affordance.
Fix: add a "Cancelar" / back-to-list link matching `CampaignsListPage`'s masthead pattern.
Suggested command: `/impeccable polish`

**[P2] No success acknowledgment — the creation moment has no peak**
Why it matters: Success silently redirects with no toast or banner, wasting the moment PRODUCT.md itself frames as significant, and inconsistent with the `boasVindas` banner already built for signup ("Conta criada com sucesso! Bem-vindo(a).").
Fix: pass `{ state: { campanhaCriada: true } }` on navigate and render a brief banner on the campaign page, reusing the existing welcome-banner CSS.
Suggested command: `/impeccable delight`

## Persona Red Flags

**Jordan (first-timer):** Lands here right after finishing signup, expecting the product to keep feeling considered — instead hits a raw `<input>` with a default OS control and a bare "Criar" button, no example campaign name, no hint of what happens next, and no visible way to back out if they clicked in by mistake.

**Sam (accessibility):** The error `<p role="alert">` is announced, but unlike `SignupPage` (which uses `ref` + `tabIndex={-1}` + `.focus()` on error), this page never moves keyboard focus to the error — a screen-reader user who submits an empty name hears the announcement but keeps focus on the button. The `<input>` also has no `id`, diverging from the explicit `id`/`htmlFor`/`aria-describedby` pattern every other form in the app uses.

**Riley (stress-tester):** Double-clicking "Criar" while a request is pending sends two POSTs (no disable-on-submit), likely creating duplicate campaigns. Killing the network mid-submit produces the exact same message as an expired session or a validation failure, since the real error object is discarded in the `catch` block.

## Minor Observations

- Input has no `autoFocus` — on a one-field, one-task page, the cursor should already be in the box.
- No `required` attribute and no deliberate `noValidate` choice (Signup sets both explicitly); here it's just an implicit gap.
- No `autoComplete` attribute, breaking the pattern set on Signup's fields.
- Button label "Criar" is terser than the page title "Criar campanha" — reads ambiguous in isolation.
- No `maxLength` on the name field, and `CampaignsListPage`'s name rendering has no truncation/overflow handling either — a very long name isn't prevented at entry and could break the list layout later.
- The detector's URL-scan mode returned exit code `0` even with a `"severity": "warning"` finding present in the JSON — worth noting as a tool quirk, unrelated to this page.
- `CampaignPage.tsx` (the campaign detail screen) is the only other route file at zero `className` usages — likely the next page in this same "left behind" pattern.

## Questions to Consider

- If Signup already solved loading states, status-aware errors, and focus-managed accessibility — and the campaign list already solved the themed-panel visual language — why does this one page reimplement none of it?
- The product explicitly frames campaign creation as an exciting, high-stakes creative moment for the Mestre — does anything currently plan for a success state, or does "navigate and say nothing" stay permanent?
- Does the API enforce unique campaign names at all? If not, is a Mestre expected to discover a collision only by scrolling their list later?
