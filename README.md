# VERBA AI — PSLang Judge

**A legal-grade decision pipeline with voice-first testimony capture, AI-powered deliberation, and blockchain settlement.**

---

## What is VERBA?

VERBA is a hackathon project that demonstrates a complete legal decision pipeline:

1. **Voice-First Capture** — Record testimony with real-time transcription
2. **PSLang Visualization** — Structured intent compilation with evidence references
3. **Evidence Upload** — Legal-grade evidence ledger with SHA-256 hashing
4. **AI Judge Deliberation** — Deterministic verdict generation based on evidence
5. **Verdict & Settlement** — On-chain settlement via Shardeum with confidential receipts (INCO)

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

### Environment Variables (Optional)

Copy `.env.example` to `.env.local` and configure:

```bash
# Gemini AI Judge (server-side only, optional)
# If set, uses Gemini for verdict reasoning; otherwise uses rules engine
GEMINI_API_KEY=your_gemini_api_key

# Judge Service Mode (local or flux)
NEXT_PUBLIC_JUDGE_MODE=local

# Flux Endpoint (if using flux mode)
NEXT_PUBLIC_JUDGE_API_BASE=https://your-flux-endpoint.com

# Shardeum Contract Address (set after deploying contract)
# Deploy: cd contracts && npm install && npm run deploy
# Then copy the printed address here:
NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS=0x...
```

See `.env.example` for all available options.

---

## 2-Minute Demo Script

### Demo Mode (No Wallet Required)

1. **Landing** → Click "Begin Testimony"
2. **Intent Capture** → Select "Voice" mode, click "Start Recording", speak for 5-10 seconds, click "Stop Recording"
3. **PSLang Visualization** → Watch animated compilation, click "Lock PSLang & Continue"
4. **Evidence Upload** → Drag & drop a file (PDF/image), click "Seal Evidence & Continue"
5. **Deliberation** → Click "Begin Deliberation", watch staged reasoning
6. **Verdict** → See decision, rationale, confidence
7. **Review Mode** → Click "Review Mode" button (top-right), see proof drawer with metrics

### Live Mode (With Wallet)

Same as above, plus:
- Connect wallet in Verdict step
- Switch to Shardeum Sphinx (chainId 8082)
- Execute settlement transaction
- See tx hash + explorer link

**Full demo script:** See `DEMO_SCRIPT.md`

---

## Sponsor Integrations

### ThinkRoot (MVP Acceleration + Build Blocks)
- **Status:** ✅ Enabled
- **What ThinkRoot Enabled:**
  - **MVP Acceleration** — Rapid assembly of production-shaped UX with modular architecture
  - **Frontend Building Blocks** — Guided pipeline state machine, step-by-step UX flow, glassmorphism design system
  - **Backend Scaffolding** — AI judge reasoning structure, prompt engineering patterns for evidence-cited verdicts
  - **Structured Intent Layer** — PSLang visualization and compilation pipeline
- **Where to See:**
  - **Pipeline UX** — Voice-first testimony capture, guided step progression (`src/components/pipeline/*`)
  - **PSLang Layer** — Structured case summary with evidence references (`src/utils/pslang/*`)
  - **Voice-First Flow** — Real-time transcription and waveform visualization (`src/components/voice/*`)
- **Code References:** `src/components/pipeline/*`, `src/utils/pslang/*`, `src/lib/pslangCompiler.ts`

### Shardeum (Settlement)
- **Status:** ✅ Ready (LIVE with contract deployment)
- **Where:** Verdict step → Settlement section
- **Proof:** Wallet connect, network check, transaction execution, explorer link
- **Chain:** Shardeum Sphinx (chainId 8082, RPC: https://sphinx.shardeum.org/)
- **Contract Address:** Set via `NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS` env var (see Deployed Addresses section below)

### INCO (Confidential Evaluation)
- **Status:** ✅ Local Proof (adapter + receipt objects, ready for SDK)
- **Where:** Deliberation step (badge), Verdict step (confidential receipt)
- **Proof:** Toggle INCO mode, see receipt panel
- **Implementation:** Adapter interface ready for INCO SDK integration
- **Contract Address:** N/A (no on-chain address in current build; address appears only when INCO SDK/chain is configured)

### Flux (Decentralized Compute)
- **Status:** ✅ Ready (LIVE with deployment)
- **Where:** Deliberation step (compute indicator), ReviewModeDrawer
- **Proof:** Endpoint switching, latency tracking
- **Deployment:** See `FLUX_DEPLOYMENT.md`

**Detailed sponsor info:** See `SPONSORS.md`

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
NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS=0x...
```

**Explorer:** https://explorer-sphinx.shardeum.org/address/{CONTRACT_ADDRESS}

### INCO

**Contract Address:** N/A

No on-chain address in current build. INCO integration uses LOCAL_PROOF adapter with receipt objects. An on-chain address will appear only when INCO SDK/chain credentials are configured.

---

## Tooling & Build Acceleration

VERBA was built with rapid MVP assembly in mind. ThinkRoot enabled accelerated development through:

- **Production-Shaped UX** — Modular pipeline architecture with state machine-driven step progression
- **Design System** — Consistent glassmorphism UI components and motion primitives
- **Structured Intent Narrative** — PSLang layer for translating vernacular testimony into structured case summaries
- **AI Judge Scaffolding** — Prompt engineering patterns and reasoning structure for evidence-cited verdicts

The project is designed so all sponsor integrations are verifiable through runtime-derived statuses, not just claimed. Each integration has clear proof points visible in the UI and documented in code.

---

## Sponsor Proof Map

| Sponsor | What We Used | Where to See | Code/Docs Location |
|---------|-------------|--------------|-------------------|
| **ThinkRoot** | MVP acceleration + design/build blocks + structured intent narrative | Pipeline UX + PSLang layer card + voice-first flow | `src/components/pipeline/*`, `src/utils/pslang/*`, `SUBMISSION_NOTES.md` |
| **Shardeum** | EVM settlement + on-chain receipt verification | Verdict step → Settlement section | `src/components/wallet/*`, `contracts/VerdictSettlement.sol` |
| **INCO** | Confidential contract adapter (LOCAL_PROOF) | Deliberation badge + Verdict confidential receipt | `src/integrations/inco/IncoAdapter.ts` |
| **Flux** | Decentralized hosting (if deployed) | ReviewModeDrawer + Deliberation compute indicator | `Dockerfile`, `FLUX_DEPLOYMENT.md` |

---

## Review Points

### For Judges

1. **Visit `/integrations`** — See integration status (LIVE/DEMO/LOCAL PROOF/READY)
2. **Complete pipeline** — Follow demo script above
3. **Enable Review Build Mode** — Toggle (top-right) to see all proof UI
4. **Check ReviewModeDrawer** — Shows transcript length, PSLang hash, evidence count, integration statuses
5. **Test INCO Mode** — Toggle INCO mode, see confidential receipt in Verdict step
6. **Test Shardeum** (if wallet available) — Connect, switch network, execute settlement

### Key Features to Highlight

- **Voice transcription** — Real-time Web Speech API
- **Evidence sealing** — Immutable ledger with SHA-256 hashing
- **PSLang compilation** — Dynamic from transcript + evidence
- **Deterministic judge** — Varies verdicts based on input (no canned cases)
- **Status accuracy** — Integration statuses never lie (runtime-derived)

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
│   ├── pslangCompiler.ts  # PSLang compilation
│   ├── evidenceUtils.ts    # Evidence hashing
│   ├── integrationStatus.ts # Status resolver
│   └── chains.ts          # Shardeum config
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
- Requires wallet connection for settlement
- Shows "Live" status when conditions met

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

- **`DEMO_SCRIPT.md`** — Detailed demo walkthrough
- **`SPONSORS.md`** — Sponsor integration details
- **`DEPLOY.md`** — Vercel deployment guide
- **`SUBMISSION_NOTES.md`** — Submission notes for judges
- **`SUBMISSION_CHECKLIST.md`** — Pre-submission verification
- **`FLUX_DEPLOYMENT.md`** — Flux deployment guide (if applicable)
- **`PROGRESS.md`** — Build progress log
- **`FINAL_BUILD_REPORT.md`** — Implementation summary

---

## Tech Stack

- **Next.js 16** — App Router
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Framer Motion** — Animations
- **wagmi + viem** — Wallet integration
- **Web Speech API** — Voice transcription
- **Web Audio API** — Waveform visualization

---

## License

MIT

---

## Contact

Built for hackathon submission. See `SPONSORS.md` for integration details.
