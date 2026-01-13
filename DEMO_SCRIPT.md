# VERBA AI — Demo Script

**Duration:** 2-3 minutes  
**Audience:** Hackathon judges, reviewers

---

## Variant 1: Demo Mode (No Wallet Required)

### Setup
- Ensure `npm run dev` is running
- Open `http://localhost:3000`
- Demo Mode should be ON (default)

### Step-by-Step

#### 1. Landing (5 seconds)
**Say:** "This is VERBA AI, a legal-grade decision pipeline."

**Do:** Click "Begin Testimony"

**Highlight:** Smooth fade transition, pipeline rail appears

---

#### 2. Intent Capture — Voice (30 seconds)
**Say:** "I'm demonstrating the voice-first capture system."

**Do:**
- Voice tab should be selected by default
- Select case type: "Refund dispute"
- Click "Start Recording"
- **Speak clearly for 5-10 seconds:** "I purchased a product for ₹5000 but it was defective. The seller refused to refund my money. I have the invoice and photos of the damaged item."
- Click "Stop Recording"

**Highlight:**
- Live waveform visualization responding to voice
- Real-time transcript appearing (Web Speech API)
- "Recording Sealed" confirmation
- Transcript locks after "Lock & Continue"

---

#### 3. PSLang Visualization (15 seconds)
**Say:** "The transcript is compiled into structured PSLang with evidence references."

**Do:**
- Watch animated line-by-line reveal
- Point out: ACTOR, CLAIM, VALUE, CONTEXT, EVIDENCE refs, HASH
- Click "Lock PSLang & Continue"

**Highlight:**
- PSLang hash is unique per input
- Evidence references appear if evidence was sealed first

---

#### 4. Evidence Upload (20 seconds)
**Say:** "Evidence is sealed with SHA-256 hashing for legal-grade immutability."

**Do:**
- Drag & drop a file (PDF, image, or document)
- Or click to browse
- See file appear in ledger with hash computation
- Click "Seal Evidence & Continue"

**Highlight:**
- Evidence strength indicator
- SHA-256 hash computation
- Immutable after sealing (no remove/replace)

---

#### 5. Deliberation (20 seconds)
**Say:** "The AI Judge evaluates evidence and generates a deterministic verdict."

**Do:**
- Click "Begin Deliberation"
- Watch staged messages: "Evaluating Evidence..." → "Applying Precedent..." → "Finalizing Verdict..."
- See verdict preview

**Highlight:**
- Staged reasoning trace
- Verdict varies based on evidence strength
- If INCO mode ON: "Privacy-Preserved Evaluation (INCO)" badge

---

#### 6. Verdict (15 seconds)
**Say:** "The verdict includes decision, rationale, confidence, and settlement options."

**Do:**
- See Decision section: APPROVE/PARTIAL/REJECT
- See rationale bullets
- See confidence score
- If INCO mode ON: See Confidential Receipt panel
- Scroll to Settlement section

**Highlight:**
- Decision based on evidence strength
- Settlement section disabled until verdict exists
- Demo settlement badge (if no contract)

---

#### 7. Review Mode (20 seconds)
**Say:** "Review Mode shows live proof metrics for all integrations."

**Do:**
- Click "Review Mode" button (top-right)
- Or toggle "Review Build Mode" ON (auto-opens drawer)
- Point out:
  - Transcript length
  - PSLang hash
  - Evidence count
  - Integration statuses (Shardeum: DEMO, Flux: READY, INCO: LOCAL_PROOF)

**Highlight:**
- Status badges are runtime-derived (never lie)
- Proof drawer updates as pipeline progresses

---

#### 8. Integrations Page (15 seconds)
**Say:** "The integrations page shows detailed status for each sponsor."

**Do:**
- Navigate to `/integrations`
- Point out each integration:
  - **Shardeum:** Status (DEMO/LIVE), contract address, explorer link
  - **INCO:** Status (LOCAL_PROOF), implementation details
  - **Flux:** Status (READY/LIVE), deployment instructions

**Highlight:**
- Honest status labels
- Clear distinction between LIVE/DEMO/LOCAL_PROOF/READY

---

## Variant 2: Live Mode (With Wallet)

### Prerequisites
- Shardeum contract deployed
- `NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS` set in `.env.local`
- Wallet with Shardeum Sphinx network added
- Testnet SHM tokens for gas

### Additional Steps (after Verdict)

#### Settlement (30 seconds)
**Say:** "Settlement executes on Shardeum Sphinx testnet."

**Do:**
- In Settlement section, click "Connect Wallet"
- Approve MetaMask connection
- If wrong network, click "Switch Network" → Approve
- See transaction preview (contract, method, params)
- Click "Settle on Shardeum"
- Approve transaction in MetaMask
- Wait for confirmation

**Highlight:**
- Network check (must be Shardeum Sphinx 8082)
- Transaction preview
- Tx hash displayed
- Explorer link opens verified transaction
- ReviewModeDrawer shows Shardeum: LIVE status

---

## Key Talking Points

### For Judges

1. **"Voice-first capture"** — Real-time transcription, not placeholder
2. **"Legal-grade evidence"** — Immutable ledger with cryptographic hashing
3. **"Deterministic judge"** — Varies outputs, no canned cases
4. **"Sponsor integrations"** — Shardeum (tx proof), INCO (confidential receipts), Flux (decentralized compute)
5. **"Status accuracy"** — Integration statuses are runtime-derived, never hardcoded
6. **"Review Build Mode"** — One toggle shows all proof UI for judges

### Technical Highlights

- **Web Speech API** — Real-time voice transcription
- **SHA-256 hashing** — Client-side evidence hashing
- **wagmi + viem** — Wallet integration
- **Framer Motion** — Premium animations
- **Next.js API routes** — Judge backend
- **TypeScript** — Full type safety

---

## Troubleshooting

### Voice not working
- Check browser permissions (Chrome/Edge recommended)
- Ensure HTTPS or localhost (required for mic access)

### Wallet not connecting
- Ensure MetaMask is installed
- Check Shardeum Sphinx network is added (chainId 8082)

### Build errors
- Run `npm install` first
- Check Node.js version (20+)
- Ensure all env vars are set if using live mode

---

## Time Breakdown

- **Setup:** 10 seconds
- **Pipeline flow:** 2 minutes
- **Review Mode:** 20 seconds
- **Integrations page:** 15 seconds
- **Total:** ~2.5 minutes

---

## Success Criteria

✅ Voice transcription works  
✅ PSLang compiles from transcript  
✅ Evidence seals with hash  
✅ Verdict varies based on evidence  
✅ ReviewModeDrawer shows accurate statuses  
✅ /integrations page shows honest labels  
✅ (Optional) Shardeum settlement executes  

---

**Ready for submission!**

