# Deployment Status & Ollama Configuration

## Current Status (as of last commit 2b29a01)

### ✅ GitHub Pages (Frontend)
- **URL:** https://griffin-hall.github.io/WebProject-AI/
- **Status:** ✅ Deployed and updated
- **Features:** All UI updates live (particles, flight path, Ollama status indicator)

### ✅ Render.com (Backend API)
- **URL:** https://webproject-ai.onrender.com
- **Status:** ✅ Running (separate deployment)
- **Note:** Uses its own database, NOT your local Ollama

### ⏸️ Your Local Machine (Ollama)
- **URL:** http://127.0.0.1:11434
- **Status:** ✅ Running, but **isolated from GitHub Pages**
- **Reason:** Browser security prevents web pages from accessing localhost

---

## The Problem

GitHub Pages (static frontend) **cannot** directly access your local Ollama:

```
GitHub Pages (internet) ──X──► Your Local Machine (localhost)
       │
       └── Can access ──► Render API (internet)
```

### Why?
1. **CORS:** Browsers block web pages from calling localhost
2. **Network:** Your local machine isn't exposed to the internet
3. **Security:** This is intentional browser protection

---

## Solution Options

### Option 1: Local Development (Use Your Ollama) ⭐ RECOMMENDED

Run everything locally:

```bash
# 1. Ensure Ollama is running
curl http://127.0.0.1:11434/api/tags  # Should show qwen3-coder:30b

# 2. Terminal 1: Start Backend
 cd packages/server
 cp .env.example .env
# Edit .env: Set your DATABASE_URL
npm run dev
# Server starts on http://localhost:3001

# 3. Terminal 2: Start Frontend
cd packages/client
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:3001
npm run dev
# Client starts on http://localhost:5173

# 4. Open http://localhost:5173
# You should see: "AI Powered (Local) • qwen3-coder:30b"
```

**Result:** ✅ Full local stack with YOUR Ollama

---

### Option 2: Expose Local Ollama (Advanced)

Use a tunnel to expose your local Ollama to the internet:

```bash
# Using cloudflared
cloudflared tunnel --url http://localhost:11434

# Or using ngrok
ngrok http 11434
```

Then update Render deployment with the tunnel URL.

**⚠️ Security Risk:** Exposes your Ollama to the internet

---

### Option 3: Deploy Ollama to Cloud (Complex)

Deploy your server + Ollama to a VPS/cloud instance:
- Rent a GPU server (RunPod, Vast.ai, etc.)
- Install Ollama + your server there
- Update GitHub Pages to point to that server

**Cost:** ~$0.50-2/hour for GPU instances

---

### Option 4: Use Render's Fallback (Current State)

Keep using https://griffin-hall.github.io/WebProject-AI/ as-is:
- Frontend from GitHub Pages ✅
- API from Render ✅
- **No Ollama** (uses keyword fallback) ⚠️

Search still works, but uses basic keyword matching instead of AI.

---

## How to Verify What's Running

### Test GitHub Pages Site
```bash
curl https://griffin-hall.github.io/WebProject-AI/
# Returns HTML (static site)
```

### Test Render API
```bash
curl https://webproject-ai.onrender.com/api/health
curl https://webproject-ai.onrender.com/api/health/ollama
# Shows Ollama status for RENDER's instance (not yours)
```

### Test Your Local Setup
```bash
# Terminal 1
cd packages/server && npm run dev

# Terminal 2 (new window)
curl http://localhost:3001/api/health/ollama
# Shows: "status": "available" if Ollama connected
```

---

## What Was Deployed to GitHub Pages

✅ Hero page with particles and flight path animation  
✅ Destination cards with flicker fix  
✅ Ollama status UI component  
✅ All visual improvements  

⚠️ BUT: The GitHub Pages site points to Render API, not your local Ollama  

---

## Recommended Workflow

### For Development (use your Ollama):
```bash
# Local stack
localhost:5173  →  localhost:3001  →  localhost:11434 (Ollama)
   (Client)         (Server)            (Your AI)
```

### For Demo (show others):
```
https://griffin-hall.github.io/WebProject-AI/
   ↓
https://webproject-ai.onrender.com
   ↓
Keyword-based extraction (no Ollama)
```

---

## Summary

| What | Status | How to Access |
|------|--------|---------------|
| GitHub Pages UI | ✅ Live | https://griffin-hall.github.io/WebProject-AI/ |
| Render API | ✅ Live | https://webproject-ai.onrender.com |
| Your Ollama | ✅ Running | http://127.0.0.1:11434 (local only) |
| **Full Local Stack** | ⏸️ Needs setup | `npm run dev` in both client & server |

**To use YOUR Ollama:** Run the local development stack (Option 1 above).
