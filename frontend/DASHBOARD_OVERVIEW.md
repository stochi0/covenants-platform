# CDMO Analytics Dashboard - Overview

## 🎉 Dashboard Complete!

Your dashboard is now live and connected to the FastAPI backend!

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── input.tsx
│   │   │   └── skeleton.tsx
│   │   ├── Dashboard.tsx     # Main dashboard component
│   │   ├── FilterPanel.tsx   # Filter controls
│   │   ├── StatsCard.tsx     # Summary statistic cards
│   │   ├── LocationsTable.tsx     # Location rankings
│   │   ├── ChemistryChart.tsx     # Chemistry distribution
│   │   └── ProductsLeaderboard.tsx # Product statistics
│   ├── lib/
│   │   ├── api.ts            # API integration & types
│   │   └── utils.ts          # Utility functions (shadcn)
│   ├── App.tsx               # App entry point
│   └── main.tsx              # React mount point
├── .env                      # Environment variables
└── SETUP.md                  # Setup instructions
```

## 🎨 Component Architecture

### Dashboard.tsx
**Main orchestrator component**
- Manages global state (filters, loading, data)
- Fetches data from all endpoints when filters change
- Passes data down to child components
- Uses React hooks (`useState`, `useEffect`)

### FilterPanel.tsx
**Interactive filter controls**
- Country, State, City text inputs
- Chemistry multi-select badges (clickable)
- "Clear All" button to reset filters
- Emits filter changes via callback

### StatsCard.tsx
**Reusable metric display**
- Shows single statistic with icon
- Loading skeleton state
- Used for: Companies, Locations, Chemistries, Products

### LocationsTable.tsx
**Top locations ranking**
- Displays aggregated location data
- Rank badges (#1, #2, etc.)
- Company count for each location
- Hover effects for better UX

### ChemistryChart.tsx
**Chemistry distribution visualization**
- Horizontal bar chart style
- Shows chemistry name + company count
- Bars scale based on max value
- Clean, modern design

### ProductsLeaderboard.tsx
**Product statistics with tabs**
- **Tab 1**: Top companies by product count
- **Tab 2**: Global product type distribution (API, Intermediate, etc.)
- Company IDs and names displayed
- Loading states

## 🔌 API Integration

### api.ts Features

**Type Safety**: Full TypeScript types for all responses
```typescript
export type StatsFilters = {
  country?: string;
  state?: string;
  city?: string;
  chemistries?: string[];
};
```

**API Functions**:
- `fetchHealth()` - Health check
- `fetchLocationStats(level, limit, filters)` - Location data
- `fetchChemistryStats(limit, filters)` - Chemistry stats
- `fetchProductStats(by, limit, filters)` - Product stats

**Query Building**: Automatic URLSearchParams construction
- Handles repeated query params for multi-select
- Properly encodes special characters
- Filters undefined values

## 🎯 Features Implemented

### ✅ Core Features
- [x] Real-time data fetching from FastAPI backend
- [x] Multi-dimensional filtering (location + chemistry)
- [x] Responsive layout (mobile-friendly)
- [x] Loading states with skeleton UI
- [x] Error handling
- [x] Auto-refresh when filters change

### ✅ Data Visualizations
- [x] Summary statistics cards (4 metrics)
- [x] Top locations table with rankings
- [x] Chemistry distribution bar chart
- [x] Product leaderboard (2 views)

### ✅ UX Enhancements
- [x] Hover effects on interactive elements
- [x] Badge-based chemistry filters
- [x] Clear all filters button
- [x] Loading skeletons
- [x] Empty states when no data
- [x] Smooth transitions

## 🎨 Design System

### Colors (from Tailwind/shadcn)
- **Background**: Neutral gray backgrounds
- **Cards**: White/card background with borders
- **Primary**: Default theme primary color for badges/charts
- **Muted**: Subtle text for descriptions
- **Accent**: Hover states

### Typography
- **Headings**: Bold, large headings (text-4xl, text-2xl)
- **Body**: Clear, readable text
- **Monospace**: For rank badges (#1, #2)

### Spacing
- Consistent gap-4, gap-6 for spacing
- Padding: p-4, p-6 for cards
- Margins: Minimal, using Flexbox/Grid gaps

## 🔄 Data Flow

```
User Interaction (Filter Change)
        ↓
  FilterPanel emits new filters
        ↓
  Dashboard updates state
        ↓
  useEffect triggers re-fetch
        ↓
  API calls to backend (parallel)
        ↓
  State updated with new data
        ↓
  Child components re-render
```

## 🚀 Future Enhancements

### Potential Additions
1. **Map View**: 
   - Use `level=point` to get GeoJSON
   - Integrate Leaflet or Mapbox
   - Show company locations on map

2. **Advanced Filtering**:
   - Date range filters
   - Capacity ranges
   - Certification filters
   - Multi-select for locations

3. **Data Export**:
   - Export filtered data to CSV
   - PDF report generation
   - Share filtered views via URL

4. **Search**:
   - Company name search
   - Product search
   - Fuzzy matching

5. **Comparison View**:
   - Compare multiple companies
   - Side-by-side stats
   - Diff visualization

6. **Real-time Updates**:
   - WebSocket connection
   - Live data updates
   - Notification system

7. **User Preferences**:
   - Save filter presets
   - Custom dashboard layouts
   - Dark/light mode toggle

8. **Analytics**:
   - Trend analysis over time
   - Growth metrics
   - Predictive insights

## 📊 Performance Notes

- Backend caches responses for ~60 seconds
- Frontend makes parallel API calls for efficiency
- React's reconciliation keeps re-renders minimal
- shadcn components are lightweight and performant

## 🐛 Debugging Tips

### Check Backend Connection
```bash
curl http://localhost:8000/health
```

### Check API Response
```bash
curl "http://localhost:8000/api/stats/locations?level=country&limit=10"
```

### Browser Console
- Open DevTools (F12)
- Check Console for API errors
- Check Network tab for failed requests

### Common Issues

**Issue**: "Failed to fetch"
- **Solution**: Ensure backend is running on port 8000

**Issue**: No data showing
- **Solution**: Check if backend has seeded data
- **Solution**: Clear filters

**Issue**: CORS errors
- **Solution**: Backend should allow `*` origin in dev

## 📦 Dependencies

### Production
- `react` (19.2.0) - UI library
- `react-dom` (19.2.0) - DOM renderer
- `lucide-react` - Icon library
- `tailwindcss` (4.1.18) - Styling
- `class-variance-authority` - Component variants
- `clsx` - Conditional classes
- `tailwind-merge` - Merge Tailwind classes

### Development
- `vite` (7.2.4) - Build tool
- `typescript` (5.9.3) - Type checking
- `@vitejs/plugin-react-swc` - Fast Refresh
- `eslint` - Linting

## 🎓 Learning Resources

### shadcn/ui
- Docs: https://ui.shadcn.com
- Examples: https://ui.shadcn.com/examples
- Components: https://ui.shadcn.com/docs/components

### React 19
- Docs: https://react.dev
- Hooks: https://react.dev/reference/react

### Tailwind CSS 4
- Docs: https://tailwindcss.com
- Play: https://play.tailwindcss.com

## 🎉 You're All Set!

The dashboard is fully functional and ready to use. Visit http://localhost:5173 to explore your CDMO analytics!

Happy analyzing! 📊✨

