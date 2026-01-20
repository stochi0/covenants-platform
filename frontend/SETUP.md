# Dashboard Setup Guide

## Quick Start

### 1. Create environment file

Create a `.env` file in the `frontend` directory:

```bash
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

### 2. Start the backend

From the repository root:

```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

### 3. Start the frontend

In a new terminal, from the `frontend` directory:

```bash
pnpm dev
```

The dashboard will be available at `http://localhost:5173`

## Features

### Filter Panel
- **Country/State/City**: Text input filters for location-based filtering
- **Chemistries**: Multi-select badge filters for chemistry types (AND logic)
- **Clear All**: Reset all filters at once

### Stats Cards
- **Total Companies**: Aggregate count across all filtered locations
- **Locations**: Number of top locations in current view
- **Chemistries**: Number of available chemistry types
- **Products**: Total product count

### Data Visualizations

1. **Locations Table**: Top countries/states/cities by company count
2. **Chemistry Distribution**: Bar chart showing chemistry types and company counts
3. **Products Leaderboard**: 
   - **Top Companies**: Companies ranked by product count
   - **Product Types**: Distribution of product types (API, Intermediate, etc.)

## Technology Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS 4** for styling
- **shadcn/ui** for UI components
- **Lucide React** for icons

## API Integration

All API calls are handled through `/src/lib/api.ts` which provides:

- Type-safe TypeScript interfaces
- Automatic query parameter building
- Error handling
- Support for all backend filtering options

## Customization

### Adding More Chemistry Types

Edit `COMMON_CHEMISTRIES` in `/src/components/FilterPanel.tsx`:

```ts
const COMMON_CHEMISTRIES = [
  "HYDROGENATION",
  "OXIDATION",
  // Add more...
];
```

### Adjusting Data Limits

Modify the fetch calls in `/src/components/Dashboard.tsx`:

```ts
const locData = await fetchLocationStats("country", 10, apiFilters); // Change 10 to desired limit
```

### Changing Aggregation Level

Update the level parameter in `fetchLocationStats`:
- `"point"` - Individual company locations (GeoJSON)
- `"country"` - Country-level aggregation
- `"state"` - State-level aggregation
- `"city"` - City-level aggregation

## Troubleshooting

### Backend Connection Issues

1. Ensure backend is running on port 8000
2. Check `VITE_API_BASE_URL` in `.env`
3. Open browser console for error messages

### No Data Showing

1. Verify backend has seeded data
2. Try clearing filters
3. Check backend logs for errors

### CORS Errors

Backend should have CORS enabled for `*` in development. If you see CORS errors, check `app/main.py` configuration.

