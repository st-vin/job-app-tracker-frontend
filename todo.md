# Job Application Tracker Frontend - TODO

## Phase 1: Project Setup & Configuration
- [x] Install core dependencies (React Router, Axios, React Query, React Hook Form, Zod, date-fns, lucide-react, react-hot-toast)
- [x] Setup Tailwind CSS
- [x] Install and configure shadcn/ui components
- [x] Configure ESLint and Prettier

## Phase 2: Type Definitions & API Client
- [x] Create TypeScript interfaces (auth, application, reminder, note, common types)
- [x] Build centralized Axios API client with interceptors
- [x] Export typed API methods grouped by domain

## Phase 3: Authentication System
- [x] Create AuthContext with state management
- [x] Implement ProtectedRoute component
- [x] Build RegisterPage with email validation and debounced existence check
- [x] Build VerifyEmailPage with token extraction and auto-redirect
- [x] Build LoginPage with form validation
- [x] Implement token persistence in localStorage

## Phase 4: Core Application Pages
- [x] Build DashboardPage with KPI cards and charts
- [x] Build ApplicationsListPage with table view
- [x] Build ApplicationsListPage with grid and Kanban views
- [x] Implement search functionality with debouncing
- [x] Implement filter panel (status, salary range)
- [ ] Build ApplicationDetailPage with tabs (Overview, Reminders, Notes)
- [ ] Build AddApplicationPage with form validation
- [ ] Build EditApplicationPage with pre-population
- [x] Implement Reminders Tab with CRUD operations
- [ ] Implement Interview Notes Tab with timeline format
- [x] Build RemindersListPage (global view)

## Phase 5: User Profile & Settings
- [x] Build ProfilePage with user info display
- [ ] Build EditProfilePage with form and password change
- [ ] Build SettingsPage with preferences and theme toggle
- [ ] Implement account deletion with multi-step confirmation

## Phase 6: Advanced Features
- [ ] Create FilterContext for global filter state
- [ ] Persist filters to URL query params
- [ ] Implement responsive design (mobile-first)
- [ ] Add skeleton screens for loading states
- [ ] Implement optimistic updates for status changes
- [ ] Add Kanban drag-and-drop with @dnd-kit
- [ ] Implement pagination for large datasets

## Phase 7: Routing, Error Handling & Accessibility
- [ ] Setup React Router v6 with all routes
- [ ] Implement Error Boundary component
- [ ] Add 404 Not Found page
- [ ] Implement network error banner with retry
- [ ] Add ARIA labels and keyboard navigation
- [ ] Test accessibility (WCAG 2.1 AA)
- [ ] Implement code splitting with React.lazy()

## Phase 8: Documentation & Delivery
- [ ] Create comprehensive README.md
- [ ] Create .env.example file
- [ ] Review code quality and standards
- [ ] Final testing checklist
- [ ] Performance optimization review

## Bug Fixes
- [x] Fix Input component ref forwarding issue in react-hook-form integration
