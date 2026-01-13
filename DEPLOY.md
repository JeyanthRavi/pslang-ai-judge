# Deployment Guide

**VERBA AI — Vercel Deployment + Configuration**

---

## Quick Deploy to Vercel

### Prerequisites

- Vercel account (free tier works)
- GitHub repository (or Vercel CLI)

### Steps

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js (no config needed)
   - Click "Deploy"

3. **Or Deploy via CLI**
   ```bash
   npm i -g vercel
   vercel
   ```

**That's it!** The app deploys in demo mode by default (no env vars required).

---

## Environment Variables (Optional)

### Demo Mode (Default)

**No environment variables needed.** The app works fully in demo mode:
- Voice transcription works
- Evidence sealing works
- Judge deliberation works
- Shardeum shows "DEMO" status
- All features functional

### Shardeum Live Mode

To enable **LIVE** Shardeum settlement:

1. **Deploy Contract**
   ```bash
   cd contracts
   npm install
   npm run deploy
   ```
   This deploys `VerdictSettlement.sol` to Shardeum Sphinx (chainId 8082).

2. **Set Environment Variable in Vercel**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS=0x... (your deployed address)
     ```
   - Redeploy

3. **Verify**
   - Connect wallet in app
   - Switch to Shardeum Sphinx network
   - Execute settlement
   - Status shows "LIVE" in ReviewModeDrawer

### Flux Live Mode

To enable **LIVE** Flux compute:

1. **Deploy Judge Service to FluxCloud**
   - Build Docker image: `docker build -t judge-service .`
   - Push to FluxCloud registry
   - Deploy service
   - Get endpoint URL (e.g., `https://your-service.fluxcloud.io`)

2. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_JUDGE_MODE=flux
     NEXT_PUBLIC_JUDGE_API_BASE=https://your-service.fluxcloud.io
     ```
   - Redeploy

3. **Verify**
   - Complete pipeline to Deliberation step
   - Click "Begin Deliberation"
   - Status shows "LIVE" in ReviewModeDrawer

---

## Vercel Configuration

The repo includes `vercel.json` with minimal config:
- Framework: Next.js (auto-detected)
- Build command: `npm run build`
- Output: `.next` (default)

**No additional config needed** unless you need custom routing or headers.

---

## What NOT to Do

### ❌ Don't Commit Secrets

- **Never commit `.env.local`** (already in `.gitignore`)
- **Never commit private keys** (use Vercel env vars)
- **Never commit contract deployment keys** (use local `.env` only)

### ❌ Don't Set Unnecessary Env Vars

- Demo mode works without any env vars
- Only set env vars if you want LIVE mode

### ❌ Don't Deploy Contracts from Vercel

- Contract deployment must be done locally or via CI/CD
- Vercel only hosts the frontend

---

## Deployment Checklist

### Before First Deploy

- [ ] Code pushed to GitHub
- [ ] `.env.local` is NOT committed (check `.gitignore`)
- [ ] `npm run build` succeeds locally
- [ ] No TypeScript errors
- [ ] No lint errors

### After Deploy

- [ ] App loads on Vercel URL
- [ ] All routes accessible (`/`, `/integrations`)
- [ ] Voice recording works (HTTPS required for mic)
- [ ] Pipeline flow works end-to-end
- [ ] ReviewModeDrawer shows accurate statuses

### For Live Mode (Optional)

- [ ] Contract deployed (if using Shardeum live)
- [ ] `NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS` set in Vercel
- [ ] Flux service deployed (if using Flux live)
- [ ] `NEXT_PUBLIC_JUDGE_MODE` and `NEXT_PUBLIC_JUDGE_API_BASE` set in Vercel
- [ ] Status shows "LIVE" in ReviewModeDrawer

---

## Troubleshooting

### Build Fails

- Check Node.js version (Vercel uses 20.x by default)
- Ensure `package.json` has correct scripts
- Check for TypeScript errors locally first

### Env Vars Not Working

- Ensure env vars are set in Vercel dashboard (not `.env.local`)
- Redeploy after adding env vars
- Check variable names match exactly (case-sensitive)

### Mic Permission Denied

- HTTPS is required for microphone access
- Vercel provides HTTPS by default
- Check browser console for permission errors

### Wallet Not Connecting

- Ensure MetaMask is installed
- Check Shardeum Sphinx network is added (chainId 8082)
- Verify contract address is correct (if using live mode)

---

## One-Click Commands

### Local Development
```bash
npm run dev
```

### Build Locally
```bash
npm run build
npm start
```

### Deploy Contracts
```bash
npm run deploy:contracts
```

### Deploy to Vercel (CLI)
```bash
vercel
```

---

## Environment Variables Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_JUDGE_MODE` | No | `local` | Judge API mode (`local` or `flux`) |
| `NEXT_PUBLIC_JUDGE_API_BASE` | No | - | Flux endpoint URL (if `JUDGE_MODE=flux`) |
| `NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS` | No | - | Shardeum contract address (for LIVE status) |

**All variables are optional.** Demo mode works without any.

---

## Next Steps

1. Deploy to Vercel (demo mode)
2. Test end-to-end flow
3. (Optional) Deploy contracts for Shardeum live
4. (Optional) Deploy judge service to FluxCloud
5. Set env vars in Vercel for live modes
6. Redeploy

**See `SUBMISSION_NOTES.md` for what's LIVE vs DEMO.**

---

**Ready to deploy!**

