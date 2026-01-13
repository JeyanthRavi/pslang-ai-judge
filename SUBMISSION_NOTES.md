# Submission Notes

**VERBA AI — For Hackathon Judges**

---

## 60-Second Pitch

**VERBA is a legal-grade decision pipeline that:**

- ✅ **Captures voice testimony** with real-time transcription (Web Speech API)
- ✅ **Compiles structured PSLang** from natural language with evidence references
- ✅ **Seals evidence immutably** with SHA-256 hashing (legal-grade ledger)
- ✅ **Generates deterministic verdicts** that vary based on input (no canned cases)
- ✅ **Settles on-chain** via Shardeum with confidential receipts (INCO)

**Sponsor Integrations:**
- **ThinkRoot (PRIMARY):** PSLang intent translation + code-generation-ready spec (FALLBACK works now, LIVE with API keys)
- **Shardeum:** On-chain settlement (ready for deployment)
- **INCO:** Confidential evaluation (local proof, adapter ready)

**Key Innovation:** Status badges are **runtime-derived** (never hardcoded). Integration statuses update based on actual conditions.

---

## What's LIVE vs DEMO vs LOCAL PROOF

### ✅ LIVE (Fully Functional)

**Voice Transcription**
- Real-time Web Speech API
- Works in Chrome/Edge
- Live transcript during recording

**Evidence Sealing**
- SHA-256 hashing (client-side)
- Immutable ledger after sealing
- Evidence references in PSLang

**PSLang Intent Translation (ThinkRoot)**
- Natural language → Structured JSON (code-generation-ready)
- FALLBACK mode works now (deterministic parser)
- LIVE mode ready (switches automatically when API keys provided)
- Evidence-aware compilation
- Stable hash generation (used for on-chain verification)

**Judge Backend**
- Deterministic verdict generation
- Varies based on evidence strength
- No repeating canned cases

**Status Accuracy**
- Runtime-derived integration statuses
- Never hardcoded "LIVE" labels
- Single source of truth (`integrationStatus.ts`)

---

### 🟡 DEMO (Functional, Mock Data)

**Shardeum Settlement**
- Wallet connect works
- Network switching works
- Transaction preview works
- **Status:** DEMO (until contract deployed)
- **To make LIVE:** Deploy contract, set `NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS`


---

### 🔵 LOCAL PROOF (Implementation Complete, Needs Network/SDK)

**INCO Confidential Mode**
- Toggle works
- Badge appears in Deliberation
- Receipt panel appears in Verdict
- Adapter interface complete
- **Status:** LOCAL_PROOF (needs INCO SDK integration)
- **To make LIVE:** Integrate INCO SDK, configure network

---

## Where Judges Can Verify Each Integration

### ThinkRoot (PSLang Intent Translation + Code Generation)

**Location:** Intent step → PSLang step → ReviewModeDrawer

**What to Check:**
1. Voice tab is default
2. Record voice → see real-time transcript
3. PSLang compiles from transcript → see structured JSON
4. Check mode badge: "LIVE" (if API configured) or "FALLBACK" (deterministic parser)
5. Expand "View Technical Details" → see full parsed intent JSON
6. Note intent hash (SHA-256) → used for on-chain verification
7. Evidence references appear in PSLang (if evidence sealed first)
8. Check ReviewModeDrawer → PSLang hash, mode indicator

**Proof:** 
- Voice-first flow
- PSLang visualization with animated reveal
- Structured intent JSON (code-generation-ready)
- Mode transparency (LIVE/FALLBACK)
- Intent hash for on-chain verification

**Code-Generation Readiness:**
- Parsed intent JSON can drive smart contract calls
- Can generate agreement text automatically
- Can create dispute template code
- Can assemble legal documents programmatically

---

### Shardeum (Settlement)

**Location:** Verdict step → Settlement section

**What to Check:**
1. Connect wallet
2. Switch to Shardeum Sphinx (chainId 8082)
3. See transaction preview
4. Execute settlement
5. See tx hash + explorer link
6. Check ReviewModeDrawer → Shardeum status (DEMO or LIVE)

**Proof:** Transaction hash, explorer link, status badge

**Status Logic:**
- **LIVE:** wallet connected + chainId 8082 + contract address + tx hash exists
- **DEMO:** demo mode OR contract address missing OR no tx hash

---

### INCO (Confidential Evaluation)

**Location:** Deliberation step (badge) → Verdict step (receipt)

**What to Check:**
1. Toggle INCO Mode ON (top-right)
2. See "Privacy-Preserved Evaluation (INCO)" badge in Deliberation
3. See Confidential Receipt panel in Verdict
4. Check ReviewModeDrawer → INCO status (LOCAL_PROOF)

**Proof:** Toggle, badge, receipt panel, adapter interface

**Status Logic:**
- **LOCAL_PROOF:** Default (adapter structure, local mock)
- **LIVE:** Would require INCO SDK integration

---


---

## Integration Status Summary

| Sponsor | Current Status | Where to Verify | How to Make LIVE |
|---------|---------------|-----------------|------------------|
| **ThinkRoot** | ✅ FALLBACK works / LIVE with API keys | PSLang step, ReviewModeDrawer | Set `NEXT_PUBLIC_PSLANG_API_URL` + `NEXT_PUBLIC_PSLANG_API_KEY` |
| **Shardeum** | 🟡 DEMO | Verdict → Settlement | Deploy contract, set env var |
| **INCO** | 🔵 LOCAL_PROOF | Deliberation, Verdict | Integrate INCO SDK |

---

## Quick Verification Path (2 Minutes)

1. **Open app** → http://localhost:3000 (or Vercel URL)
2. **Complete pipeline:**
   - Record voice (5-10 seconds)
   - Lock PSLang
   - Upload evidence
   - Begin deliberation
   - See verdict
3. **Enable Review Build Mode** (top-right toggle)
4. **Check ReviewModeDrawer:**
   - Transcript length
   - PSLang hash
   - Evidence count
   - Integration statuses
5. **Visit `/integrations`** → See detailed status for each sponsor
6. **Toggle INCO Mode ON** → See receipt in Verdict step
7. **Test Shardeum** (if wallet available) → Connect, execute settlement

---

## Key Features to Highlight

### For Judges

1. **"Status accuracy"** — Integration statuses are runtime-derived, never hardcoded
2. **"Voice-first"** — Real-time transcription, not placeholder
3. **"Legal-grade evidence"** — Immutable ledger with cryptographic hashing
4. **"Deterministic judge"** — Varies outputs, no canned cases
5. **"Native integrations"** — Sponsor tech feels natural, not forced
6. **"Review Build Mode"** — One toggle shows all proof UI

### Technical Highlights

- **Web Speech API** — Real-time voice transcription
- **SHA-256 hashing** — Client-side evidence hashing
- **wagmi + viem** — Wallet integration
- **Framer Motion** — Premium animations
- **Next.js API routes** — Judge backend
- **TypeScript** — Full type safety
- **Runtime status derivation** — Single source of truth

---

## Documentation Links

- **`README.md`** — Project overview, quick start
- **`DEMO_SCRIPT.md`** — Detailed demo walkthrough
- **`SPONSORS.md`** — Sponsor integration details
- **`DEPLOY.md`** — Deployment guide
- **`SUBMISSION_CHECKLIST.md`** — Pre-submission verification

---

## Honest Disclosure

**What Works Today:**
- ✅ Complete pipeline flow
- ✅ Voice transcription (real)
- ✅ Evidence sealing (immutable)
- ✅ PSLang compilation (dynamic)
- ✅ Judge backend (deterministic)
- ✅ Status accuracy (runtime-derived)

**What Requires Deployment:**
- 🟡 Shardeum LIVE (contract deployment)

**What Requires SDK Integration:**
- 🔵 INCO LIVE (INCO SDK integration)

**All limitations are clearly documented. Demo mode fully functional.**

---

**Ready for review!**

