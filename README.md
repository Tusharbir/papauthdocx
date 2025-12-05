
PapDocAuthX — Frontend

This folder contains the React application for the PapDocAuthX user interface. It is built with Create React App, Tailwind CSS, and Material-UI. The frontend communicates with the backend API (default: `http://localhost:4000`).

## Quick Start & Onboarding

### Prerequisites
- Node.js 18 or later
- Backend running (see PapDocAuthX-Backend)

### Install dependencies
```powershell
cd PapDocAuthX-Frontend
npm install
```

### Start development server
```powershell
npm start
```

### Force a port (PowerShell)
```powershell
$env:PORT=3000; npm start
```

### Configuration
If running frontend and backend on different hosts, set `REACT_APP_API_BASE_URL` in `.env.local`:
```
REACT_APP_API_BASE_URL=http://localhost:4000
```

**Keep backend on 4000 and frontend on 3000 for local development.**

## Features (Current)
- Public landing page with analytics (no login required)
- Demo workflow: upload, verify, and view document version chain
- Admin/Org onboarding: create organizations, admins, and issue documents
- Document verification: cryptographic version chain, hash checks
- No QR code, Merkle proof, or anomaly signal features (these have been removed)

## Useful Scripts
- `npm start` — start development server
- `npm run build` — production build to `build/`
- `npm test` — run tests

## Troubleshooting
- Landing shows 0 or 404: confirm backend is running and frontend is on a different port
- Kill stray Node processes on Windows: `Get-Process node | Stop-Process` (or use Task Manager)
- If CORS or proxy issues appear, set `REACT_APP_API_BASE_URL` to the backend URL

## Developer Notes
- All deprecated features (QR code, Merkle proof, anomaly signals) have been removed from the UI and codebase
- For API examples and Postman collections, see the backend repo

---
License: MIT

If you want a longer README with component documentation, example API requests, or a Postman collection, I can add `docs/README_DEV.md` — tell me which pieces you prefer.

---
MIT License
