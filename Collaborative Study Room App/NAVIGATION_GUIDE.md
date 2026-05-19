# EISC Meet - Navigation Guide

## How to Navigate the SPA Prototype

This guide demonstrates the Single Page Application (SPA) navigation architecture for EISC Meet.

## Starting Point: Landing Page (/)

**URL**: `/`

**Navigation Options**:
- Click **"Get Started"** → Navigate to `/register`
- Click **"Log In"** (top nav) → Navigate to `/login`
- Click **"Sign In"** (hero section) → Navigate to `/login`

---

## Login Page (/login)

**URL**: `/login`

**Features**:
- Email/password form with visible labels
- Google sign-in button (UI only - Sprint 0)
- "Remember me" checkbox
- "Forgot password?" link (placeholder)
- Form validation (required fields)

**Navigation Options**:
- Click **"Sign In"** button → Navigate to `/dashboard`
- Click **"Sign up"** link → Navigate to `/register`
- Click **EISC Meet logo** → Navigate to `/` (home)

**Keyboard Accessibility**:
- Tab through all form inputs
- Visible focus states on all elements
- Enter key submits form

---

## Register Page (/register)

**URL**: `/register`

**Features**:
- Full name, email, password fields with labels
- Password confirmation field
- Terms of Service checkbox (required)
- Google sign-up button (UI only)

**Navigation Options**:
- Click **"Create Account"** → Navigate to `/dashboard`
- Click **"Sign in"** link → Navigate to `/login`
- Click **EISC Meet logo** → Navigate to `/` (home)

---

## Dashboard (/dashboard)

**URL**: `/dashboard`

**Layout**: Persistent sidebar + main content area

**Features**:
- 6 study room cards (clickable)
- "Create Room" button (placeholder)
- Search bar (visual only)
- Online users sidebar
- Activity statistics widget

**Sidebar Navigation** (persistent across authenticated pages):
- ✅ **Dashboard** (active) → `/dashboard`
- **My Sessions** → `/sessions` (placeholder page)
- **Study Groups** → `/groups` (placeholder page)
- **Profile** → `/profile`
- **Settings** → `/settings` (placeholder page)
- **Notifications** (badge: 3) → `/notifications` (placeholder page)
- **Sign Out** → `/` (landing page)

**Navigation Options**:
- Click **any room card** → Navigate to `/room/:roomId` (e.g., `/room/1`)
- Click **sidebar items** → Navigate to respective pages
- Click **"Create Room"** → (Planned for Sprint 1)

**Active State**:
- Dashboard nav item is highlighted with purple background
- Current route is visually distinct

---

## Study Room (/room/:roomId)

**URL**: `/room/:roomId` (e.g., `/room/1`)

**Layout**: Full-screen video call interface (no sidebar)

**Features**:
- Video grid (5 participant tiles)
- Participant name tags and status indicators
- Real-time chat sidebar (collapsible)
- Control bar with media controls

**Controls** (UI only - Sprint 0):
- **Mute/Unmute** microphone
- **Start/Stop Video** camera
- **Share Screen**
- **Chat** toggle
- **Leave** (red button) → Navigate to `/dashboard`

**Navigation Options**:
- Click **back arrow** (top left) → Navigate to `/dashboard`
- Click **Leave** button → Navigate to `/dashboard`

**Chat Interface**:
- Message history display
- Input field with send button
- Toggle chat visibility via control bar

---

## Profile (/profile)

**URL**: `/profile`

**Layout**: Persistent sidebar + profile content

**Features**:
- Avatar upload button (visual only)
- Personal information form
- Academic information form
- Study preferences checkboxes
- Save buttons (visual only - Sprint 0)

**Sidebar Navigation**:
- Same persistent sidebar as Dashboard
- Profile nav item is highlighted (active state)

**Navigation Options**:
- Click **sidebar items** → Navigate to respective pages
- Click **Sign Out** → Navigate to `/` (landing)

**Forms**:
- Editable text inputs
- Dropdown select (academic year)
- Checkbox preferences
- All form elements have visible labels

---

## Placeholder Pages

**URLs**:
- `/sessions` - My Sessions (planned)
- `/groups` - Study Groups (planned)
- `/settings` - Settings (planned)
- `/notifications` - Notifications (planned)

**Features**:
- "Coming Soon" message
- Indicates feature is planned for future sprint
- Persistent sidebar navigation
- Maintains SPA context

**Navigation**:
- Use sidebar to navigate to other pages

---

## Not Found Page (404)

**URL**: `/*` (any invalid route, e.g., `/invalid-page`)

**Triggered When**:
- User navigates to non-existent route
- Typing invalid URL in browser

**Features**:
- Clear error message
- 404 status indication
- EISC Meet branding

**Navigation Options**:
- Click **"Go to Dashboard"** → Navigate to `/dashboard`
- Click **"Back to Home"** → Navigate to `/` (landing)

---

## Navigation Patterns

### SPA Behavior
- **No page reloads** - all navigation happens client-side
- **URL updates** - browser history tracks route changes
- **Back/forward buttons** - work as expected
- **Persistent state** - sidebar remains across authenticated pages

### Active States
- Current page highlighted in sidebar navigation
- Hover states on all clickable elements
- Focus states visible for keyboard navigation

### Route Protection (Visual Only - Sprint 0)
In future sprints:
- `/dashboard`, `/profile`, `/room/:id` will require authentication
- Unauthenticated users redirected to `/login`
- Currently all routes are accessible for prototype demonstration

### Keyboard Navigation
- **Tab** - Move focus to next interactive element
- **Shift+Tab** - Move focus to previous element
- **Enter** - Activate buttons and links
- **Escape** - Close modals (future feature)

---

## Testing the Navigation Flow

### Complete User Journey
1. Start at `/` (Landing)
2. Click **"Get Started"** → `/register`
3. Fill form and click **"Create Account"** → `/dashboard`
4. Click **first room card** → `/room/1`
5. Click **Leave button** → `/dashboard`
6. Click **Profile** in sidebar → `/profile`
7. Click **Dashboard** in sidebar → `/dashboard`
8. Click **Sign Out** → `/` (Landing)
9. Navigate to `/invalid-url` → 404 page
10. Click **"Go to Dashboard"** → `/dashboard`

### Expected Behavior
- ✅ All links navigate correctly
- ✅ No page reloads during navigation
- ✅ Sidebar persists on authenticated pages
- ✅ Active states update based on current route
- ✅ Back/forward browser buttons work
- ✅ URL bar updates with each route change

---

## Responsive Behavior

### Mobile (<768px)
- Sidebar may collapse to hamburger menu (future enhancement)
- Room cards stack vertically
- Chat sidebar overlays video grid
- Controls remain accessible

### Tablet (768px - 1024px)
- 2-column room grid
- Sidebar visible but narrower
- Profile forms adapt to single column

### Desktop (>1024px)
- Full 3-column layout on Dashboard
- Persistent sidebar
- Video grid up to 3 columns
- Optimal spacing and readability

---

**Sprint 0 Status**: All navigation routes are functional and demonstrate the planned SPA architecture.
