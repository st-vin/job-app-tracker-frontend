# Job Application Tracker - Frontend Setup Guide

A complete React TypeScript application for tracking job applications with authentication, dashboard analytics, and interview management.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) or **pnpm** (v8 or higher)
- **Git** (optional, for version control)

## Project Structure

```
job-tracker-frontend/
├── client/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── api/            # API client and endpoints
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Main app component
│   │   ├── main.tsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── index.html          # HTML template
│   └── tsconfig.json       # TypeScript configuration
├── package.json            # Project dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # Root TypeScript config
└── README.md               # This file
```

## Installation

### 1. Extract the Project

Unzip the downloaded file to your desired location:

```bash
unzip job-tracker-frontend.zip
cd job-tracker-frontend
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Or using pnpm:
```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Backend API Configuration
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=Job Application Tracker
VITE_APP_ID=job-tracker-frontend

# Optional: Analytics
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

**Important:** The backend API must be running on `http://localhost:8080`. If your backend runs on a different port, update `VITE_API_URL` accordingly.

## Running the Application

### Development Server

Start the development server with hot module replacement:

```bash
npm run dev
```

Or with pnpm:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Create an optimized production build:

```bash
npm run build
```

The compiled files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run check` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Features

### Authentication
- User registration with email verification
- Secure login with JWT tokens
- Protected routes with role-based access control
- Automatic token refresh and persistence

### Dashboard
- KPI cards showing application statistics
- Status distribution pie chart
- Quick access to recent reminders
- Navigation to all core features

### Application Management
- **Multiple Views**: Table, Grid, and Kanban board layouts
- **CRUD Operations**: Create, read, update, and delete applications
- **Search & Filter**: Find applications by company or position
- **Status Tracking**: Monitor application progress through pipeline stages

### Interview Management
- **Reminders**: Set and manage interview reminders
- **Interview Notes**: Document interview feedback by stage
- **Timeline View**: Review interview history for each application

### User Profile
- View account information
- Application statistics
- Quick access to settings

## Technology Stack

### Frontend Framework
- **React 18+** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### State Management & Data Fetching
- **React Query** - Server state management
- **React Context** - Global state (Auth, Theme)
- **React Router v6** - Client-side routing

### Form Handling
- **React Hook Form** - Efficient form management
- **Zod** - Schema validation

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Pre-built React components
- **Lucide React** - Icon library
- **Recharts** - Data visualization

### HTTP Client
- **Axios** - HTTP requests with interceptors

### Notifications
- **React Hot Toast** - Toast notifications

## API Integration

The application communicates with a backend API running at `http://localhost:8080`. The API client is configured in `client/src/api/client.ts` with:

- Automatic JWT token injection in request headers
- Request/response interceptors for error handling
- Centralized error management

### API Endpoints Used

**Authentication:**
- `POST /auth/register` - User registration
- `POST /auth/verify-email` - Email verification
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

**Applications:**
- `GET /applications` - List all applications
- `GET /applications/:id` - Get application details
- `POST /applications` - Create application
- `PUT /applications/:id` - Update application
- `DELETE /applications/:id` - Delete application

**Reminders:**
- `GET /reminders` - List all reminders
- `GET /reminders/application/:appId` - Get reminders for application
- `POST /reminders` - Create reminder
- `DELETE /reminders/:id` - Delete reminder

**Interview Notes:**
- `GET /notes` - List all notes
- `GET /notes/application/:appId` - Get notes for application
- `POST /notes` - Create note
- `DELETE /notes/:id` - Delete note

**Dashboard:**
- `GET /dashboard/stats` - Get dashboard statistics

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically use the next available port. Check the terminal output for the actual URL.

### Backend Connection Issues
Ensure your backend API is running and accessible at the configured `VITE_API_URL`. Check:
1. Backend is running on the correct port
2. CORS is properly configured on the backend
3. Network connectivity between frontend and backend

### Module Not Found Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules pnpm-lock.yaml
npm install
```

### TypeScript Errors
Run type checking to identify issues:
```bash
npm run check
```

## Development Guidelines

### Component Structure
- Keep components small and focused
- Use TypeScript for type safety
- Extract reusable logic into custom hooks
- Place shared components in `client/src/components/`

### State Management
- Use React Context for global state (Auth, Theme)
- Use React Query for server state
- Use React Hook Form for form state

### Styling
- Use Tailwind CSS utility classes
- Leverage shadcn/ui components for consistency
- Define custom styles in `client/src/index.css` when needed

### API Calls
- Use React Query hooks for data fetching
- Implement proper error handling
- Show loading and error states to users

## Building & Deployment

### Production Build
```bash
npm run build
```

This creates an optimized build in the `dist/` directory ready for deployment.

### Deployment Options
- **Vercel**: Connect your Git repository and deploy automatically
- **Netlify**: Drag and drop the `dist/` folder or connect Git
- **Docker**: Create a Dockerfile for containerized deployment
- **Traditional Hosting**: Upload `dist/` contents to your web server

## Performance Optimization

The application includes several performance optimizations:
- Code splitting with lazy-loaded routes
- Image optimization
- CSS minification
- JavaScript bundling and minification
- React Query caching strategies

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Considerations

- JWT tokens are stored in localStorage
- Sensitive operations require authentication
- CORS is configured for the backend API
- Input validation with Zod schemas
- XSS protection through React's built-in escaping

## Contributing

When adding new features:
1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a pull request

## License

This project is provided as-is for use with the Job Application Tracker system.

## Support & Troubleshooting

For issues or questions:
1. Check the troubleshooting section above
2. Review the application logs in the browser console
3. Verify backend API is running and accessible
4. Ensure all environment variables are correctly configured

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Last Updated:** November 2025
**Version:** 1.0.0
