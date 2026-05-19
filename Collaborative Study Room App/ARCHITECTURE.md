# EISC Meet - SPA Architecture Documentation

## Sprint 0 - MVP Prototype

This is a **planning prototype** demonstrating the architecture, UX flow, and routing structure for the EISC Meet collaborative study platform.

## Technology Stack

- **React** - Component-based UI framework
- **React Router** - Client-side SPA routing
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type-safe development
- **Lucide React** - Icon system

## Route Structure

```
/                     → Landing Page (public)
/login                → Login Page (public)
/register             → Register Page (public)
/dashboard            → Dashboard with persistent sidebar (authenticated)
/profile              → User Profile (authenticated, with sidebar)
/sessions             → My Sessions (planned - Sprint 1)
/groups               → Study Groups (planned - Sprint 1)
/settings             → Settings (planned - Sprint 1)
/notifications        → Notifications (planned - Sprint 1)
/room/:roomId         → Study Room (authenticated, full-screen)
/*                    → 404 Not Found
```

## Component Architecture

### Layout System

**DashboardLayout** - Persistent sidebar wrapper for authenticated pages
- Shared navigation sidebar
- Active state indicators
- Consistent spacing and structure
- Outlet for nested routes

### Page Components

**Public Pages** (no layout wrapper):
- Landing
- Login
- Register
- NotFound

**Authenticated Pages** (wrapped in DashboardLayout):
- DashboardHome
- ProfileContent
- Future: Sessions, Groups, Settings, Notifications

**Full-Screen Pages** (custom layout):
- StudyRoom (video call interface)

## Navigation Patterns

### User Flow
1. Landing → Login/Register
2. Login/Register → Dashboard
3. Dashboard → Study Room (via room cards)
4. Dashboard ↔ Profile (via sidebar)
5. Any authenticated page → Sign Out → Landing

### Sidebar Navigation
- Persistent across Dashboard, Profile, and future authenticated pages
- Visual active state highlighting
- Keyboard accessible (focus states)
- Notification badges on relevant items

## Accessibility Features

- ✅ Visible keyboard focus states on all interactive elements
- ✅ Semantic HTML structure (nav, header, main, aside)
- ✅ Proper ARIA labels on buttons
- ✅ High contrast text (4.5:1 minimum)
- ✅ Form inputs with visible labels (not placeholder-only)
- ✅ Large clickable areas (44px minimum touch targets)
- ✅ Consistent spacing system via Tailwind

## Planned Features (Future Sprints)

These features are **visually represented** in the UI but not yet functional:

### Sprint 1 (Backend Integration)
- [ ] Firebase Authentication
- [ ] Supabase database integration
- [ ] User registration/login flow
- [ ] Profile data persistence

### Sprint 2 (Real-time Features)
- [ ] WebRTC video calls
- [ ] Real-time chat (WebSocket)
- [ ] Live participant list
- [ ] Screen sharing functionality

### Sprint 3 (Study Room Features)
- [ ] Room creation and management
- [ ] Session scheduling
- [ ] Study group formation
- [ ] Session history and analytics

### Sprint 4 (Advanced Features)
- [ ] Calendar integration
- [ ] Notification system
- [ ] Advanced settings
- [ ] Study statistics dashboard

## Design System

### Color Palette

**Light Mode:**
- Background: #fafafa
- Primary: #6366f1 (Indigo)
- Secondary: #8b5cf6 (Violet)
- Accent: #eef2ff (Light Indigo)

**Dark Mode:**
- Background: #0f0f1a (Deep Navy)
- Card: #1a1a2e (Dark Gray)
- Primary: #818cf8 (Light Indigo)
- Secondary: #a78bfa (Light Violet)

### Typography
- Font: System sans-serif stack
- Headings: Medium weight (500)
- Body: Normal weight (400)
- Accessible contrast ratios throughout

### Spacing
- Consistent 8px grid system
- Rounded corners: 0.75rem (12px)
- Card padding: 1.5rem (24px)

## File Structure

```
src/
├── app/
│   ├── components/
│   │   └── DashboardLayout.tsx    # Persistent sidebar layout
│   ├── pages/
│   │   ├── Landing.tsx            # Marketing/hero page
│   │   ├── Login.tsx              # Authentication
│   │   ├── Register.tsx           # User registration
│   │   ├── DashboardHome.tsx      # Main dashboard view
│   │   ├── StudyRoom.tsx          # Video call interface
│   │   ├── ProfileContent.tsx     # User profile settings
│   │   └── NotFound.tsx           # 404 error page
│   ├── routes.tsx                 # React Router configuration
│   └── App.tsx                    # Root component
└── styles/
    └── theme.css                  # Tailwind theme tokens
```

## Development Notes

### Running the Application
The Vite dev server is already running in the Figma Make environment.
Do NOT run `vite build` or manual server commands.

### Navigation Testing
All routes are functional and can be tested:
- Click "Get Started" → navigates to /register
- Click "Log In" → navigates to /login
- Submit login form → navigates to /dashboard
- Click room card → navigates to /room/:id
- Sidebar navigation → persistent across pages
- Invalid routes → shows 404 page

### State Management
Currently using React Router for navigation state.
Future sprints will add:
- Context API for user authentication state
- Local storage for session persistence
- Real-time state management (Socket.io/WebRTC)

## Responsive Design

- **Mobile**: Stacked layouts, collapsible sidebar
- **Tablet**: Adaptive grid (2 columns)
- **Desktop**: Full layout (3 columns where applicable)
- **Large Desktop**: Max-width containers for readability

All breakpoints use Tailwind's responsive modifiers (sm, md, lg, xl).

---

**Last Updated**: Sprint 0 - May 2026
**Status**: Planning Prototype - Architecture Complete
