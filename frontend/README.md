# Frontend (React + Vite + TypeScript)

This frontend provides a modern dashboard to manage expenses and categories.

## Libraries

- @tanstack/react-query — data fetching and caching
- react-hook-form — forms
- @hookform/resolvers + zod — schema validation
- shadcn-ui style components (local) — button, table, dialog, inputs, popover, calendar
- lucide-react — icons
- react-hot-toast — user feedback toasts
- react-day-picker + date-fns — date picking and formatting

## Key Features

- Expenses table with actions (edit/delete)
- Add/Edit Expense dialog with validation (RHF + Zod)
- Category dropdown (loaded via API)
- Toast notifications on success/error
- Loading states for queries and mutations

## Usage

1. Install deps (already in package.json):

```powershell
npm install
```

2. Configure API base url (optional):

Create `.env`:

```
VITE_API_BASE_URL=http://localhost:8080
```

3. Run dev server:

```powershell
npm run dev
```

Open the printed URL (default http://localhost:5173). Login/Signup first, then open Dashboard to manage expenses and categories.

## Notes

- QueryClientProvider and Toaster are wired in `src/main.tsx`.
- Expenses UI lives in `src/components/ExpensesManager.tsx` and is used from `src/pages/Dashboard.tsx`.
- Minimal shadcn-like components are under `src/components/ui/`.
