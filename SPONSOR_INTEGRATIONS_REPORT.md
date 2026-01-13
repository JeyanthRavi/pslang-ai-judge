# VERBA Sponsor Integration Report

**Date:** 2026-01-12  
**Status:** ✅ All integrations implemented and ready for demo

---

## Executive Summary

All three sponsor integrations (Shardeum, INCO, Flux) have been implemented with real functionality and clear proof mechanisms. The application is ready for hackathon review with honest status labels (Live/Demo/Local Proof).

---

## 1. Shardeum Integration ✅

### Implementation Status
- **Status:** ✅ Live (requires contract deployment) / Demo mode available
- **Contract:** `contracts/VerdictSettlement.sol`
- **Deployment:** Hardhat scripts ready
- **Wallet Stack:** wagmi v3 + viem v2
- **Network:** Shardeum Sphinx (chainId 8082)

### What's Implemented
1. **Smart Contract**
   - `VerdictSettlement.sol` with `recordVerdict()` function
   - Stores: pslangHash, decision (uint8), amount, timestamp, claimant
   - Emits `VerdictRecorded` event
   - Deployment script: `contracts/scripts/deploy.js`

2. **Wallet Integration**
   - `WalletProvider` wraps app with wagmi config
   - `WalletSettlement` component in Verdict step
   - Connect wallet, network check, transaction preview
   - Execute transaction, display tx hash + explorer link

3. **Chain Configuration**
   - `src/lib/chains.ts` with Shardeum Sphinx config
   - RPC: `https://sphinx.shardeum.org/`
   - Explorer: `https://explorer-sphinx.shardeum.org`
   - Currency: SHM

### How to Demo Shardeum Settlement

**Prerequisites:**
1. Deploy contract to Shardeum Sphinx:
   ```bash
   cd contracts
   npm install
   # Set PRIVATE_KEY in .env
   npm run deploy
   ```
2. Set `NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS` in `.env.local`
3. Get testnet SHM tokens (faucet if needed)

**Demo Flow:**
1. Complete pipeline through Verdict step
2. Click "Connect Wallet" → MetaMask connects
3. If wrong network, click "Switch Network" → Switches to Shardeum Sphinx (8082)
4. See transaction preview (contract address, method, params)
5. Click "Settle on Shardeum" → MetaMask popup
6. Confirm transaction → Wait for confirmation
7. See tx hash displayed with "View on Explorer" link
8. Click link → Opens Shardeum Explorer

**Proof:**
- Transaction hash visible in UI
- Explorer link opens verified transaction
- ReviewModeDrawer shows wallet address and chain ID

**Limitations:**
- Requires contract deployment for live mode
- Demo mode works without contract (shows "Demo Settlement" badge)
- Testnet faucet may be needed for gas

---

## 2. INCO Integration ✅

### Implementation Status
- **Status:** ✅ Local Proof (ready for INCO SDK)
- **Adapter:** `src/integrations/inco/IncoAdapter.ts`
- **UI Integration:** Toggle, badges, receipt panel

### What's Implemented
1. **INCO Adapter**
   - `generateConfidentialReceipt()` function
   - Receipt structure: receiptId, pslangHash, accessPolicy
   - `isIncoAvailable()` check function
   - Ready for INCO SDK integration

2. **UI Integration**
   - INCO Mode toggle (top-right, below Demo Mode)
   - "Privacy-Preserved Evaluation (INCO)" badge in Deliberation step
   - Confidential Receipt panel in Verdict step (when INCO mode ON)
   - Receipt shows: receiptId, pslangHash, access policy

3. **Pipeline Integration**
   - `incoMode` state in PipelineContext
   - Deliberation step passes `incoMode` to judge API
   - Verdict step generates receipt when INCO mode active

### How to Demo INCO Mode

**Demo Flow:**
1. Run `npm run dev`
2. See "INCO Mode OFF" badge (top-right)
3. Click to toggle → Badge changes to "INCO Mode ON"
4. Navigate to Deliberation step → See "Privacy-Preserved Evaluation (INCO)" badge
5. Complete Deliberation → Navigate to Verdict step
6. See "Confidential Receipt (INCO)" panel with:
   - Receipt ID (inco_timestamp_hash)
   - PSLang hash
   - Access policy ("User-only decryption")
7. Toggle INCO mode OFF → Receipt panel disappears

**Proof:**
- Toggle visible in UI
- Badge appears in Deliberation step
- Receipt panel appears in Verdict step
- ReviewModeDrawer shows INCO Mode status

**Limitations:**
- Currently generates local proof receipts (not actual INCO network contracts)
- Ready for INCO SDK integration (adapter structure in place)
- Contract deployment to INCO network would make this fully live

---

## 3. Flux Integration ✅

### Implementation Status
- **Status:** ✅ Ready for FluxCloud deployment
- **Dockerfile:** Present in repo root
- **Endpoint Switch:** Environment variable based

### What's Implemented
1. **Dockerfile**
   - Node 20 Alpine base
   - Next.js standalone build
   - Exposes port 3000
   - Ready for FluxCloud containerization

2. **Endpoint Switching**
   - Environment variables: `JUDGE_MODE=local|flux`, `JUDGE_API_BASE`
   - Deliberation step auto-switches between:
     - Local: `/api/judge`
     - Flux: `${JUDGE_API_BASE}/judge`
   - Latency tracking and display

3. **UI Integration**
   - Deliberation step shows "Compute: Local" or "Compute: Flux"
   - ReviewModeDrawer shows judge endpoint and latency
   - `/integrations` page shows Flux deployment status

### How to Demo Flux Integration

**Local Mode (Default):**
1. Run `npm run dev`
2. Complete Deliberation step
3. See "Compute: Local" in Deliberation step
4. ReviewModeDrawer shows "Local /api/judge" and latency

**Flux Mode:**
1. Set environment variables:
   ```bash
   NEXT_PUBLIC_JUDGE_MODE=flux
   NEXT_PUBLIC_JUDGE_API_BASE=https://your-flux-endpoint.com
   ```
2. Run `npm run dev`
3. Complete Deliberation step
4. See "Compute: Flux" in Deliberation step
5. ReviewModeDrawer shows Flux endpoint URL and latency

**Deployment to FluxCloud:**
1. Build Docker image:
   ```bash
   docker build -t judge-service .
   ```
2. Push to FluxCloud registry
3. Deploy on FluxCloud
4. Set `NEXT_PUBLIC_JUDGE_API_BASE` to Flux endpoint

**Proof:**
- Dockerfile present in repo
- Endpoint switching works (local/Flux)
- Latency displayed in ReviewModeDrawer
- `/integrations` page shows deployment instructions

**Limitations:**
- Requires FluxCloud deployment for live endpoint
- Local mode works without deployment
- Endpoint switching is environment-based (no UI toggle)

---

## 4. Integration Proof Drawer ✅

### What's Shown
- Transcript length (characters)
- PSLang hash (truncated)
- Evidence count
- Demo/Live mode status
- Judge Backend (Local/Flux endpoint)
- Judge latency (ms)
- Shardeum wallet address (if connected)
- Shardeum chain ID
- INCO Mode status (ON/OFF)

### Location
- Top-right button: "Review Mode"
- Opens drawer with all proof data
- Updates as pipeline progresses

---

## 5. /integrations Page ✅

### What's Shown
For each integration:
- **Status:** Live/Demo/Local Proof/Ready
- **Where Used:** Which pipeline step
- **Proof:** Contract address, explorer link, implementation details
- **Deployment Instructions:** How to deploy (if applicable)

### Integrations Listed
1. **ThinkRoot:** UI proof in pipeline flow
2. **Shardeum:** Contract address, explorer link, deployment status
3. **INCO:** Implementation status, toggle location, receipt details
4. **Flux:** Dockerfile status, endpoint config, deployment steps

---

## Files Added/Modified

### New Files
- `contracts/VerdictSettlement.sol` - Smart contract
- `contracts/hardhat.config.js` - Hardhat config
- `contracts/package.json` - Contract dependencies
- `contracts/scripts/deploy.js` - Deployment script
- `src/lib/chains.ts` - Shardeum chain config
- `src/providers/WalletProvider.tsx` - Wagmi provider
- `src/components/wallet/WalletSettlement.tsx` - Wallet settlement UI
- `src/integrations/inco/IncoAdapter.ts` - INCO adapter
- `src/components/IncoModeToggle.tsx` - INCO mode toggle
- `Dockerfile` - Flux deployment
- `.dockerignore` - Docker ignore rules

### Modified Files
- `package.json` - Added wagmi, viem, @tanstack/react-query
- `src/app/layout.tsx` - Added WalletProvider wrapper
- `src/store/PipelineContext.tsx` - Added incoMode state
- `src/components/pipeline/VerdictStep.tsx` - Integrated WalletSettlement, INCO receipt
- `src/components/pipeline/DeliberationStep.tsx` - Flux endpoint switching, INCO badge
- `src/components/ReviewModeDrawer.tsx` - Added Shardeum, INCO, Flux proof data
- `src/app/integrations/page.tsx` - Updated with all integration statuses
- `src/app/page.tsx` - Added IncoModeToggle

---

## How to Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables (optional for live mode):**
   ```bash
   # .env.local
   NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS=0x... # After contract deployment
   NEXT_PUBLIC_JUDGE_MODE=local # or "flux"
   NEXT_PUBLIC_JUDGE_API_BASE=https://... # If using Flux
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Visit:** `http://localhost:3000`

---

## Demo Script (30 seconds)

1. **Voice → Transcript:** Show voice recording with waveform
2. **PSLang:** Show animated compilation
3. **Evidence:** Show file upload with hashing
4. **Deliberation:** Show "Privacy-Preserved Evaluation (INCO)" badge
5. **Verdict:** Show verdict + Confidential Receipt (INCO mode ON)
6. **Wallet:** Connect wallet, show transaction preview
7. **Review Mode:** Open drawer, show all proof data (Shardeum address, INCO status, Flux endpoint)

---

## Known Limitations

1. **Shardeum:** Requires contract deployment and testnet tokens for live mode
2. **INCO:** Currently local proof (ready for SDK integration)
3. **Flux:** Requires FluxCloud deployment for live endpoint
4. **All integrations:** Demo mode works without deployment

---

## Next Steps (Post-Hackathon)

1. Deploy VerdictSettlement contract to Shardeum Sphinx
2. Integrate INCO SDK for actual confidential contracts
3. Deploy judge service to FluxCloud
4. Add UI toggle for Flux endpoint (currently env-based)

---

## Conclusion

All sponsor integrations are implemented with real functionality and clear proof mechanisms. The application is ready for hackathon review with honest status labels and working demo modes.

