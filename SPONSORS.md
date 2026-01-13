# Sponsor Integrations

**VERBA AI — Sponsor Alignment & Proof**

---

## Overview

VERBA integrates three sponsor technologies in a native, non-forced manner:

1. **ThinkRoot** — Voice-first capture + PSLang visualization
2. **Shardeum** — On-chain settlement
3. **INCO** — Confidential evaluation
4. **Flux** — Decentralized compute hosting

---

## ThinkRoot — Voice + PSLang

### Integration
- **Status:** ✅ UI Proof
- **Alignment:** Voice-first testimony capture, structured intent translation

### Where It's Used
- **Intent Step:** Voice recording with real-time transcription (Web Speech API)
- **PSLang Step:** Structured compilation from transcript with evidence references

### Proof Points
- Voice-first flow (default mode)
- Real-time transcript generation
- PSLang compilation with animated reveal
- Evidence references in PSLang output

### Files
- `src/components/voice/VoiceRecorder.tsx` — Voice capture
- `src/lib/pslangCompiler.ts` — PSLang compilation
- `src/components/pipeline/PSLangStep.tsx` — Visualization

### Status
**UI Proof** — No SDK required, alignment demonstrated through UX flow

---

## Shardeum — Settlement + Receipt on Chain

### Integration
- **Status:** ✅ Ready (LIVE with contract deployment)
- **Network:** Shardeum Sphinx (chainId 8082)
- **RPC:** https://sphinx.shardeum.org/
- **Explorer:** https://explorer-sphinx.shardeum.org/

### Where It's Used
- **Verdict Step → Settlement Section:** Wallet connect, transaction execution

### Proof Points
- Wallet connection (wagmi + viem)
- Network check (prompts switch to Shardeum Sphinx)
- Transaction preview (contract, method, params)
- Transaction execution (`recordVerdict` function)
- Tx hash display with explorer link
- ReviewModeDrawer shows Shardeum status (LIVE/DEMO)

### Status Logic
- **LIVE:** wallet connected + chainId 8082 + contract address + tx hash exists
- **DEMO:** demo mode OR contract address missing OR no tx hash

### Files
- `src/lib/chains.ts` — Shardeum chain configuration
- `src/components/wallet/WalletSettlement.tsx` — Settlement UI
- `contracts/VerdictSettlement.sol` — Smart contract
- `contracts/scripts/deploy.js` — Deployment script

### Deployment
1. Deploy contract: `cd contracts && npm run deploy`
2. Set `NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS` in `.env.local`
3. Connect wallet and execute settlement

### Status
**Ready for deployment** — Contract and UI complete, requires deployment for LIVE status

---

## INCO — Confidential Evaluation

### Integration
- **Status:** ✅ Local Proof (ready for SDK)
- **Mode:** Toggle-based (top-right badge)

### Where It's Used
- **Deliberation Step:** "Privacy-Preserved Evaluation (INCO)" badge when mode ON
- **Verdict Step:** Confidential Receipt panel when mode ON

### Proof Points
- INCO Mode toggle (global)
- Badge in Deliberation step
- Confidential Receipt in Verdict step (receiptId, pslangHash, accessPolicy)
- Adapter interface ready for INCO SDK

### Implementation
- **Adapter Interface:** `src/integrations/inco/IncoAdapter.ts`
  - `prepareConfidentialPayload()`
  - `submitConfidentialEvaluation()`
  - `getConfidentialReceipt()`
- **Local Mock:** Uses same interface, ready for SDK swap

### Status Logic
- **LOCAL_PROOF:** Default (adapter structure, local mock)
- **LIVE:** Would require INCO SDK integration + network configuration

### Files
- `src/integrations/inco/IncoAdapter.ts` — Adapter interface
- `src/components/IncoModeToggle.tsx` — Toggle component
- `src/components/pipeline/DeliberationStep.tsx` — Adapter usage
- `src/components/pipeline/VerdictStep.tsx` — Receipt display

### Status
**Local Proof** — Adapter structure complete, ready for INCO SDK integration

---

## Flux — Decentralized Compute Hosting

### Integration
- **Status:** ✅ Ready (LIVE with deployment)
- **Service:** Judge API endpoint

### Where It's Used
- **Deliberation Step:** Endpoint switching (local vs Flux)
- **ReviewModeDrawer:** Shows Flux endpoint and latency
- **/integrations Page:** Deployment status

### Proof Points
- Dockerfile for containerization
- Environment variable switching (`JUDGE_MODE=flux`)
- Endpoint URL display
- Latency tracking
- Status indicator (LIVE/READY)

### Status Logic
- **LIVE:** judge mode = flux + base URL set + last call succeeded
- **READY:** dockerfile exists + endpoint switch exists but not in flux mode

### Deployment
1. Build Docker image: `docker build -t judge-service .`
2. Push to FluxCloud registry
3. Deploy on FluxCloud
4. Set `NEXT_PUBLIC_JUDGE_MODE=flux` and `NEXT_PUBLIC_JUDGE_API_BASE`

### Files
- `Dockerfile` — Container definition
- `FLUX_DEPLOYMENT.md` — Deployment guide
- `src/components/pipeline/DeliberationStep.tsx` — Endpoint switching
- `src/lib/integrationStatus.ts` — Status resolver

### Status
**Ready for deployment** — Dockerfile and docs complete, requires FluxCloud deployment for LIVE status

---

## Integration Status Summary

| Sponsor | Status | Where Used | Proof Location |
|---------|--------|------------|----------------|
| **ThinkRoot** | UI Proof | Intent, PSLang | Voice flow, PSLang visualization |
| **Shardeum** | Ready (LIVE with deploy) | Verdict → Settlement | Tx hash + explorer link |
| **INCO** | Local Proof | Deliberation, Verdict | Toggle, badge, receipt panel |
| **Flux** | Ready (LIVE with deploy) | Deliberation | Endpoint + latency |

---

## How to Verify Integrations

### For Judges

1. **Complete pipeline** — Follow `DEMO_SCRIPT.md`
2. **Enable Review Build Mode** — Toggle ON (top-right)
3. **Check ReviewModeDrawer** — See integration statuses
4. **Visit `/integrations`** — See detailed status for each sponsor
5. **Test INCO Mode** — Toggle ON, see receipt in Verdict
6. **Test Shardeum** (if wallet available) — Connect, execute settlement
7. **Test Flux** (if deployed) — Set env vars, see LIVE status

### Status Accuracy

All statuses are **runtime-derived** using `src/lib/integrationStatus.ts`:
- No hardcoded "LIVE" labels
- Statuses update based on actual conditions
- ReviewModeDrawer and /integrations page use same helper (single source of truth)

---

## Files Reference

### Core Integration Files
- `src/lib/integrationStatus.ts` — Status resolver (single source of truth)
- `src/lib/chains.ts` — Shardeum chain configuration
- `src/integrations/inco/IncoAdapter.ts` — INCO adapter interface

### UI Components
- `src/components/wallet/WalletSettlement.tsx` — Shardeum settlement
- `src/components/IncoModeToggle.tsx` — INCO mode toggle
- `src/components/ReviewModeDrawer.tsx` — Proof drawer
- `src/app/integrations/page.tsx` — Integration status page

### Contracts
- `contracts/VerdictSettlement.sol` — Shardeum contract
- `contracts/scripts/deploy.js` — Deployment script

### Deployment
- `Dockerfile` — Flux container
- `FLUX_DEPLOYMENT.md` — Deployment guide

---

## Honest Status Labels

- **LIVE** — Actually running/connected (wallet + contract + tx OR flux endpoint + successful call)
- **DEMO** — Functional but using mock/placeholder data
- **LOCAL_PROOF** — Implementation complete, ready for network/SDK integration
- **READY** — Deployment-ready (Dockerfile, scripts, docs) but not deployed

**No false claims.** Statuses are computed from runtime conditions.

---

## Next Steps (Post-Hackathon)

1. Deploy VerdictSettlement contract to Shardeum Sphinx
2. Deploy judge service to FluxCloud
3. Integrate INCO SDK for actual confidential contracts
4. Add real-time status tracking improvements

---

**All integrations are functional and ready for demo.**

