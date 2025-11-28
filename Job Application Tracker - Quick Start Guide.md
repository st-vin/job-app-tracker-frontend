# Job Application Tracker - Quick Start Guide

## What's Included

The `job-tracker-frontend.zip` file contains a complete, production-ready React TypeScript application with:

- ✅ Full authentication system (Register, Email Verification, Login)
- ✅ Dashboard with KPI cards and analytics charts
- ✅ Application management (Create, Read, Update, Delete)
- ✅ Multiple view modes (Table, Grid, Kanban)
- ✅ Interview reminders and notes management
- ✅ User profile and settings
- ✅ Responsive design for all devices
- ✅ Type-safe API client with Axios
- ✅ React Query for server state management
- ✅ Form validation with React Hook Form and Zod

## Getting Started in 5 Minutes

### Step 1: Extract the Archive
```bash
unzip job-tracker-frontend.zip
cd job-tracker-frontend
```

### Step 2: Install Dependencies
```bash
npm install
# or
pnpm install
```

### Step 3: Configure Environment
Create a `.env.local` file in the root directory:
```env
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=Job Application Tracker
VITE_APP_ID=job-tracker-frontend
```

### Step 4: Start Development Server
```bash
npm run dev
# or
pnpm dev
```

### Step 5: Open in Browser
Navigate to `http://localhost:5173` and start using the application!

## Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ or **pnpm** v8+
- **Backend API** running at `http://localhost:8080`

## Important Notes

### Backend API Required
This frontend application requires a backend API to be running. The API should be accessible at `http://localhost:8080` (or update `VITE_API_URL` in `.env.local` if your backend runs on a different port).

### Environment Variables
The `.env.local` file is required for the application to work. At minimum, set:
- `VITE_API_URL` - Your backend API URL

### Node Modules Not Included
The `node_modules` directory is not included in the zip file. You must run `npm install` or `pnpm install` after extraction.

## Project Structure

```
job-tracker-frontend/
├── client/src/
│   ├── api/              # API client with Axios
│   ├── components/       # Reusable UI components
│   ├── contexts/         # Auth and Theme contexts
│   ├── pages/            # Page components
│   ├── types/            # TypeScript definitions
│   └── App.tsx           # Main application
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS config
└── SETUP_README.md       # Detailed setup guide
```

## Available Commands

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run check     # TypeScript type checking
npm run lint      # Run ESLint
npm run format    # Format code with Prettier
```

## Features Overview

### Authentication Pages
- **Register**: Create new account with email verification
- **Login**: Secure login with JWT tokens
- **Verify Email**: Email confirmation flow

### Dashboard
- Overview of all applications
- KPI cards (Total, Last 30 Days, Avg Salary, Offers)
- Status distribution chart
- Quick access to upcoming reminders

### Applications Management
- **List View**: Table with sorting and filtering
- **Grid View**: Card-based layout
- **Kanban View**: Status-based columns
- **Detail View**: Full application information with tabs
- **Add/Edit**: Form-based creation and updates

### Interview Management
- **Reminders**: Schedule and manage interview reminders
- **Notes**: Document interview feedback by stage
- **Timeline**: View interview history

### User Profile
- View account information
- Application statistics
- Account settings

## Technology Stack

- **React 18+** with TypeScript
- **Vite** for fast development and building
- **React Router v6** for navigation
- **React Query** for server state
- **React Hook Form** + **Zod** for forms
- **Tailwind CSS 4** for styling
- **shadcn/ui** for components
- **Axios** for API calls
- **Recharts** for charts

## Troubleshooting

### Port 5173 Already in Use
Vite will automatically use the next available port. Check the terminal output for the actual URL.

### Cannot Connect to Backend
1. Verify backend API is running on `http://localhost:8080`
2. Check `VITE_API_URL` in `.env.local`
3. Ensure CORS is configured on backend
4. Check browser console for error details

### Module Not Found
```bash
rm -rf node_modules pnpm-lock.yaml
npm install
```

### TypeScript Errors
```bash
npm run check
```

## Next Steps

1. **Read SETUP_README.md** - Detailed setup and development guide
2. **Explore the codebase** - Understand the project structure
3. **Customize** - Add your branding and features
4. **Deploy** - Build and deploy to production

## Support

For detailed documentation, see `SETUP_README.md` included in the project.

---

**Version:** 1.0.0  
**Last Updated:** November 2025
