# Submission Checklist

**VERBA AI — Pre-Submission Verification**

---

## Repository

- [x] README.md present and clear
- [x] .env.example present with all required vars
- [x] package.json has correct scripts
- [x] No dead/legacy files breaking build
- [x] All imports resolve correctly
- [x] TypeScript compiles with zero errors
- [x] No lint errors

---

## Environment Setup

- [ ] `.env.local` created from `.env.example` (if using live mode)
- [ ] `NEXT_PUBLIC_JUDGE_MODE` set (local or flux)
- [ ] `NEXT_PUBLIC_JUDGE_API_BASE` set (if using flux)
- [ ] `NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS` set (if using Shardeum live)

**Note:** Demo mode works without any env vars.

---

## Build & Run

- [ ] `npm install` completes successfully
- [ ] `npm run build` completes with zero errors
- [ ] `npm run dev` starts on http://localhost:3000
- [ ] No console errors on page load
- [ ] All routes accessible (/, /integrations)

---

## Demo Route (Homepage)

- [ ] Landing step renders
- [ ] "Begin Testimony" button works
- [ ] Intent step appears (Voice default)
- [ ] Voice recording works (mic permission)
- [ ] Transcript appears after recording
- [ ] PSLang compiles and displays
- [ ] Evidence upload works (drag-drop)
- [ ] Evidence seals with hash
- [ ] Deliberation button works
- [ ] Verdict appears after deliberation
- [ ] Settlement section shows (disabled until verdict)

---

## Integrations Route

- [ ] `/integrations` page loads without errors
- [ ] All sponsor sections render
- [ ] Status badges show (LIVE/DEMO/LOCAL_PROOF/READY)
- [ ] Statuses are accurate (runtime-derived)
- [ ] No "PipelineProvider missing" errors

---

## Sponsor Integrations

### Shardeum (Optional — Live Mode)
- [ ] Contract deployed (if using live mode)
- [ ] Contract address in `.env.local`
- [ ] Wallet connects
- [ ] Network switches to Shardeum Sphinx (8082)
- [ ] Transaction executes
- [ ] Tx hash displays
- [ ] Explorer link works
- [ ] Status shows LIVE (if all conditions met)

### INCO (Always Available)
- [ ] INCO Mode toggle visible (top-right)
- [ ] Toggle works
- [ ] Badge appears in Deliberation when ON
- [ ] Receipt panel appears in Verdict when ON
- [ ] Status shows LOCAL_PROOF

### Flux (Optional — Live Mode)
- [ ] Dockerfile present
- [ ] `FLUX_DEPLOYMENT.md` present
- [ ] Endpoint switching works (env vars)
- [ ] Status shows READY (or LIVE if deployed)

---

## Review Tools

- [ ] Review Build Mode toggle visible
- [ ] Toggle works (shows/hides proof UI)
- [ ] ReviewModeDrawer opens when toggle ON
- [ ] Drawer shows accurate metrics
- [ ] Drawer shows integration statuses
- [ ] No errors when drawer opens/closes

---

## Documentation

- [ ] README.md complete
- [ ] DEMO_SCRIPT.md present
- [ ] SPONSORS.md present
- [ ] FLUX_DEPLOYMENT.md present (if applicable)
- [ ] .env.example present
- [ ] All docs are clear and accurate

---

## Quick Test (90 Seconds)

1. [ ] Run `npm run dev`
2. [ ] Open http://localhost:3000
3. [ ] Click "Begin Testimony"
4. [ ] Record voice (5-10 seconds)
5. [ ] Complete PSLang step
6. [ ] Upload evidence file
7. [ ] Begin deliberation
8. [ ] See verdict
9. [ ] Toggle Review Build Mode ON
10. [ ] Check ReviewModeDrawer (statuses accurate)
11. [ ] Visit `/integrations` (statuses match drawer)
12. [ ] Toggle INCO Mode ON
13. [ ] See receipt in Verdict step

---

## Optional Live Steps

### Shardeum Live (Requires)
- [ ] Contract deployment to Shardeum Sphinx
- [ ] Testnet SHM tokens for gas
- [ ] Wallet with Shardeum network added
- [ ] Contract address in `.env.local`

### Flux Live (Requires)
- [ ] FluxCloud account
- [ ] Docker image built and pushed
- [ ] Service deployed on FluxCloud
- [ ] Endpoint URL in `.env.local`

**Note:** Demo mode works without these. Live mode is optional for full proof.

---

## Final Checks

- [ ] No build errors
- [ ] No runtime errors
- [ ] All routes accessible
- [ ] Status badges accurate
- [ ] Documentation complete
- [ ] Demo script tested
- [ ] Ready for submission

---

## Known Limitations (Honest Disclosure)

1. **Shardeum:** Requires contract deployment for LIVE status (demo works)
2. **Flux:** Requires FluxCloud deployment for LIVE status (ready works)
3. **INCO:** Currently LOCAL_PROOF (ready for SDK integration)
4. **Voice:** Requires browser support (Chrome/Edge recommended)

**All limitations are clearly documented and demo mode works fully.**

---

**Status:** ✅ Ready for submission

