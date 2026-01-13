# VERBA AI — Voice → PSLang → On-Chain Enforceable Outcome

**A legal-grade decision pipeline powered by ThinkRoot's PSLang intent translation: Voice testimony → Structured intent spec → Code-generation-ready JSON → Blockchain settlement.**

---

## What is VERBA?

VERBA demonstrates a complete **voice-first legal decision pipeline** that translates natural language testimony into structured, enforceable outcomes:

1. **Voice-First Capture** — Record testimony with real-time transcription
2. **PSLang Intent Translation** — Natural language → Structured contract/spec JSON (ThinkRoot-powered)
3. **Code-Generation Ready** — Parsed intent drives smart contract calls, agreement text, and future automated code generation
4. **Evidence Upload** — Legal-grade evidence ledger with SHA-256 hashing
5. **AI Judge Deliberation** — Deterministic verdict generation based on evidence
6. **On-Chain Settlement** — Shardeum blockchain settlement with confidential receipts (INCO)

---

## Why This is a ThinkRoot-Style Product

**VERBA embodies ThinkRoot's core principles:**

- **Human-Centric Design** — Voice-first testimony capture respects how people actually communicate disputes
- **Intent Translation Visibility** — PSLang step shows exactly how vernacular testimony becomes structured JSON
- **Reasoning Transparency** — AI judge deliberation stages are visible, evidence-cited, and auditable
- **Code-Generation Ready** — The parsed intent spec (PSLang output) is a structured contract that can drive:
  - Smart contract function calls
  - Agreement text generation
  - Automated dispute template code generation
  - Future automated legal document assembly

**The PSLang layer is the innovation:** We built a PSLang-compatible wrapper that works today (FALLBACK mode) and seamlessly switches to LIVE mode when ThinkRoot PSLang API credentials are provided.

---

## Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Modern browser (Chrome/Edge recommended for voice transcription)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# ThinkRoot PSLang (optional - enables LIVE mode)
# If not set, uses FALLBACK deterministic parser
NEXT_PUBLIC_PSLANG_API_URL=https://api.pslang.example.com/parse
NEXT_PUBLIC_PSLANG_API_KEY=your_pslang_api_key

# Wallet Mode (default: relayer - no MetaMask required)
NEXT_PUBLIC_WALLET_MODE=relayer  # or "metamask"

# Shardeum Relayer Configuration (required for relayer mode)
RELAYER_PRIVATE_KEY=0x...  # Testnet private key (keep secure)
SHARDEUM_RPC_URL=https://sphinx.shardeum.org/

# Shardeum Contract Address (set after deploying contract)
NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS=0x...  # Paste after deploy

# Gemini AI Judge (server-side only, optional)
GEMINI_API_KEY=your_gemini_api_key
JUDGE_ENGINE=gemini  # or "deterministic" or "auto" (default: deterministic)
```

See `.env.example` for all available options.

---

## 2-Minute Demo Script

### No Wallet Demo (Relayer Mode - Default)

**No MetaMask or external wallet required.** On-chain writes are relayed via a backend key (hackathon demo).

1. **Landing** → Click "Begin Testimony"
2. **Intent Capture** → Select "Voice" mode, click "Start Recording", speak for 5-10 seconds, click "Stop Recording"
3. **PSLang Visualization** → Watch animated compilation, see structured intent JSON, click "Lock PSLang & Continue"
4. **Evidence Upload** → Drag & drop a file (PDF/image), click "Seal Evidence & Continue"
5. **Deliberation** → Click "Begin Deliberation", watch staged reasoning
6. **Verdict** → See decision, rationale, confidence
7. **Record Outcome** → Click "Record on Shardeum (Relayed)" → See tx hash + explorer link
8. **Agreement** → Sign as Party A and Party B (simulated parties), then "Record Agreement (Relayed)"
9. **Review Mode** → Click "Review Mode" button (top-right), see proof drawer with metrics

**What's stored on-chain:** Receipt (caseHash, outcomeCode, confidenceBps, evidenceRoot) + Agreement (agreementId, caseHash, evidenceRoot, termsHash, partyA, partyB, signatures)

**Full demo script:** See `DEMO_SCRIPT.md`  
**ThinkRoot-specific demo:** See `THINKROOT_BOUNTY.md`

---

## Sponsor Map

| Sponsor | Primary Use | Where to See | Status |
|---------|------------|--------------|--------|
| **ThinkRoot** | PSLang intent translation + code-gen ready spec | PSLang step, structured output, hash, proof drawer | ✅ FALLBACK works / LIVE with API keys |
| **Shardeum** | On-chain receipt + agreement record/verify | Verdict step → Settlement, Agreement step | ✅ Demo/Live depends on contract deploy |
| **INCO** | LOCAL_PROOF confidential receipt interface | Deliberation badge, Verdict confidential receipt | ✅ LOCAL_PROOF (adapter ready for SDK) |

---

## ThinkRoot Integration (PSLang + Code Generation)

### What ThinkRoot is Used For

**PSLang Intent Translation Pipeline:**
- Natural language testimony → Structured intent JSON
- Extracts: currency, amount, deadline, parties, task type, conditions
- Generates deterministic intent hash (SHA-256)
- Produces code-generation-ready spec that drives:
  - Smart contract function calls
  - Agreement text generation
  - Future automated dispute template code generation

### Where It Appears in UI

1. **PSLang Step** (`src/components/pipeline/PSLangStep.tsx`):
   - Shows "Structured Case Summary" card
   - Displays parsed intent JSON (collapsible)
   - Shows mode badge: "LIVE" or "FALLBACK"
   - Displays intent hash (SHA-256)
   - Shows extracted key fields as chips (claim type, amount, parties)

2. **ReviewModeDrawer** (top-right):
   - PSLang hash display
   - Mode indicator (LIVE/FALLBACK)
   - Confidence score

3. **Evidence Step**:
   - PSLang compilation references `evidenceId`s from sealed evidence

### Where It Plugs In Backend

**PSLang Wrapper Architecture** (`src/utils/pslang/`):

```
Voice/Text Input
    ↓
PSLang Wrapper (parsePSLang)
    ↓
├─→ Try LIVE Adapter (if NEXT_PUBLIC_PSLANG_API_URL + KEY set)
│   └─→ ThinkRoot PSLang API → ParsedIntent
│
└─→ Fallback Parser (if LIVE fails/unconfigured)
    └─→ Regex + Heuristics → ParsedIntent
    ↓
Structured Intent JSON (code-gen ready)
    ↓
Intent Hash (SHA-256)
    ↓
Rest of VERBA Flow
```

**Files:**
- `src/utils/pslang/index.ts` - Main entry point (tries LIVE, falls back to FALLBACK)
- `src/utils/pslang/liveAdapter.ts` - Real PSLang API adapter
- `src/utils/pslang/fallbackParser.ts` - Deterministic parser (works without API)
- `src/utils/pslang/types.ts` - TypeScript types matching PSLang structure

**Environment Variables:**
- `NEXT_PUBLIC_PSLANG_API_URL` - PSLang API endpoint (optional)
- `NEXT_PUBLIC_PSLANG_API_KEY` - PSLang API key (optional)

**If not configured:** Uses FALLBACK deterministic parser (works out of the box)  
**If configured:** Automatically uses LIVE mode (no code changes needed)

See `THINKROOT_BOUNTY.md` for detailed ThinkRoot integration guide.

---

## Shardeum Integration (Settlement)

- **Status:** ✅ Ready (LIVE with contract deployment)
- **Where:** Verdict step → Settlement section, Agreement step → Record Agreement
- **Proof:** 
  - **Relayer Mode (default):** Backend relayer submits transactions, shows tx hash + explorer link
  - **MetaMask Mode (optional):** Wallet connect, network check, transaction execution, explorer link
- **Chain:** Shardeum Sphinx (chainId 8082, RPC: https://sphinx.shardeum.org/)
- **Contract Address:** Set via `NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS` env var (see Deployed Addresses section below)
- **Relayer:** Server-side key submits transactions (hackathon demo mode)

---

## INCO Integration (Confidential Evaluation)

- **Status:** ✅ Local Proof (adapter + receipt objects, ready for SDK)
- **Where:** Deliberation step (badge), Verdict step (confidential receipt)
- **Proof:** Toggle INCO mode, see receipt panel
- **Implementation:** Adapter interface ready for INCO SDK integration
- **Contract Address:** N/A (no on-chain address in current build; address appears only when INCO SDK/chain is configured)

---

## Deployed Addresses

### Shardeum Sphinx (chainId 8082)

**Contract Address:** Set via `NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS` environment variable

The contract address is read from your `.env.local` file at runtime. To deploy:

```bash
cd contracts
npm install
npm run deploy
```

Copy the printed address and add to `.env.local`:
```bash
NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS=0x...  # Paste after deploy
```

**Explorer:** https://explorer-sphinx.shardeum.org/address/{CONTRACT_ADDRESS}

### INCO

**Contract Address:** N/A

No on-chain address in current build. INCO integration uses LOCAL_PROOF adapter with receipt objects. An on-chain address will appear only when INCO SDK/chain credentials are configured.

---

## Truth Table

| Integration | Current Status | How to Enable LIVE | What's Required |
|------------|---------------|-------------------|-----------------|
| **PSLang** | ✅ FALLBACK works now | Set `NEXT_PUBLIC_PSLANG_API_URL` + `NEXT_PUBLIC_PSLANG_API_KEY` | ThinkRoot PSLang API credentials |
| **ThinkRoot** | ✅ Primary narrative + integration-ready PSLang wrapper | No fake claims - wrapper is real, works in FALLBACK, ready for LIVE | PSLang API access (optional) |
| **Shardeum** | ✅ Demo/Live depends on contract deploy + env var | Deploy contract, set `NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS` | Contract deployment + relayer key (or MetaMask) |
| **INCO** | ✅ LOCAL_PROOF unless SDK configured | Configure INCO SDK/chain credentials | INCO SDK access (future) |

---

## Review Points

### For Judges

1. **Visit `/integrations`** — See integration status (LIVE/DEMO/LOCAL PROOF/READY)
2. **Complete pipeline** — Follow demo script above
3. **Enable Review Build Mode** — Toggle (top-right) to see all proof UI
4. **Check ReviewModeDrawer** — Shows transcript length, PSLang hash, evidence count, integration statuses
5. **Test PSLang Step** — See structured intent JSON, mode badge (LIVE/FALLBACK), intent hash
6. **Test INCO Mode** — Toggle INCO mode, see confidential receipt in Verdict step
7. **Test Shardeum** — Record receipt/agreement, verify on-chain

### Key Features to Highlight

- **Voice transcription** — Real-time Web Speech API
- **PSLang intent translation** — Natural language → Structured JSON (code-gen ready)
- **Evidence sealing** — Immutable ledger with SHA-256 hashing
- **Deterministic judge** — Varies verdicts based on input (no canned cases)
- **Status accuracy** — Integration statuses never lie (runtime-derived)
- **No Wallet Required** — Default relayer mode works without MetaMask
- **Simulated Parties** — Party A/B signing for agreements (off-chain signatures)

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main pipeline
│   ├── integrations/      # Integration status page
│   └── api/judge/         # Judge API endpoint
├── components/
│   ├── pipeline/          # Pipeline step components
│   ├── voice/             # Voice recorder
│   ├── wallet/            # Wallet settlement
│   └── ui/                # Reusable UI primitives
├── lib/                    # Utilities
│   ├── pslangCompiler.ts  # PSLang compilation (legacy)
│   ├── evidenceUtils.ts    # Evidence hashing
│   ├── integrationStatus.ts # Status resolver
│   └── chains.ts          # Shardeum config
├── utils/
│   └── pslang/            # PSLang wrapper (ThinkRoot integration)
│       ├── index.ts       # Main entry (tries LIVE, falls back)
│       ├── liveAdapter.ts # Real PSLang API adapter
│       ├── fallbackParser.ts # Deterministic parser
│       └── types.ts       # PSLang types
├── store/                  # State management
│   └── PipelineContext.tsx # Global pipeline state
├── types/                  # TypeScript types
└── integrations/
    └── inco/              # INCO adapter
```

---

## Modes

### Demo Mode
- Default ON
- Uses mock data where needed
- Shardeum settlement shows "Demo" badge
- All features work without wallet/contract

### Live Mode
- Toggle Demo Mode OFF
- Requires contract deployment for Shardeum
- **Relayer Mode (default):** No wallet connection needed; backend relayer submits transactions
- **MetaMask Mode (optional):** Requires wallet connection for settlement
- Shows "Live" status when conditions met (tx hash exists + verification success)

### Review Build Mode
- Toggle (top-right, below INCO toggle)
- When ON: Auto-opens ReviewModeDrawer, shows all proof UI
- When OFF: Keeps UI clean

### INCO Mode
- Toggle (top-right)
- When ON: Shows "Privacy-Preserved Evaluation" badge in Deliberation
- Generates confidential receipt in Verdict step

---

## Documentation

- **`THINKROOT_BOUNTY.md`** — Detailed ThinkRoot integration guide (PSLang + code generation)
- **`DEMO_SCRIPT.md`** — Detailed demo walkthrough
- **`SPONSORS.md`** — Sponsor integration details
- **`DEPLOY.md`** — Vercel deployment guide
- **`SUBMISSION_NOTES.md`** — Submission notes for judges
- **`SUBMISSION_CHECKLIST.md`** — Pre-submission verification
- **`PSLANG_WRAPPER.md`** — PSLang wrapper technical documentation
- **`PROGRESS.md`** — Build progress log
- **`FINAL_BUILD_REPORT.md`** — Implementation summary

---

## Tech Stack

- **Next.js 16** — App Router
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Framer Motion** — Animations
- **wagmi + viem** — Wallet integration (optional)
- **Web Speech API** — Voice transcription
- **Web Audio API** — Waveform visualization
- **PSLang Wrapper** — ThinkRoot intent translation layer

---

## License

MIT

---

## Contact

Built for hackathon submission. See `THINKROOT_BOUNTY.md` for ThinkRoot integration details.
