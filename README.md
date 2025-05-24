<img src="https://github.com/angvit/Content-Rediscovery-Platform/blob/main/frontend/public/cspherelogo2.png?raw=true" alt="logo" width="350" height="200"/>

<h1>Rediscover what matters — faster.</h1>




A full-stack web app and browser extension that helps users **save**, **summarize**, and **search** web content using **embeddings** and **ai-generated summaries**. 

**Live App**: [https://csphere-nly9.vercel.app/]

---

## Local Setup

### 1. Backend (Python + FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate (for windows: source venv/scripts/Activate )
pip install -r requirements.txt
uvicorn app.api.main:app --reload
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### 3. Chrome Extension

1. Load the `chrome_extension/` folder into Chrome via `chrome://extensions`

2. Enable Developer Mode -> "Load Unpacked" -> Select `chrome_extension/`
