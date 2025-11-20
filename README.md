
PapDocAuthX — Frontend

This folder contains the React application used for the PapDocAuthX user interface. It uses Create React App with Tailwind and Material-UI. The frontend communicates with the backend API; by default the backend is expected at `http://localhost:4000`.

Quick start

Prerequisites:
- Node.js 18 or later
- Backend running (default `http://localhost:4000`)

Install dependencies

```powershell
cd PapDocAuthX-Frontend
npm install
```

Start development server

```powershell
npm start
```

Force a port (PowerShell)

```powershell
$env:PORT=3000; npm start
```

Configuration

If you run frontend and backend on different hosts, set `REACT_APP_API_BASE_URL` in `.env.local`:

```
REACT_APP_API_BASE_URL=http://localhost:4000
```

Important note about ports

If the frontend dev server binds to the backend port (typically 4000), API calls to `/api/*` may be handled by the dev server and return 404. Keep the backend on 4000 and the frontend on 3000, or set `REACT_APP_API_BASE_URL` to point at the backend.


Landing analytics

- The public landing page uses `GET /api/analytics/public-summary` and does not require authentication.
- When a user is authenticated, the app requests the protected `GET /api/analytics/summary` endpoint for detailed metrics.

Useful scripts

- `npm start` — start development server
- `npm run build` — production build
- `npm test` — run tests

Troubleshooting

- Landing shows 0 or 404: confirm backend is running and the frontend dev server is not using the backend port.
- Kill stray Node processes on Windows: in PowerShell run `Get-Process node | Stop-Process` or use Task Manager.

If you want expanded developer notes, API examples, or a Postman collection, I can add a `docs/` folder with those materials.

---

License: MIT

## Useful Scripts

- `npm start` — start CRA dev server
- `npm run build` — production build to `build/`
- `npm test` — run tests

--

## Troubleshooting

- Landing shows 0 / 404: confirm backend is running and that the dev server is not served on the backend port.
- Kill stray node processes on Windows: in PowerShell run `Get-Process node | Stop-Process` (or use Task Manager).
- If CORS or proxy issues appear, set `REACT_APP_API_BASE_URL` to the backend URL.

--

If you want a longer README with component documentation, example API requests, or a Postman collection, I can add `docs/README_DEV.md` — tell me which pieces you prefer.

---
MIT License
