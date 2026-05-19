import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { StudyRoom } from "./pages/StudyRoom";
import { ProfileContent } from "./pages/ProfileContent";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      {
        path: "dashboard",
        Component: DashboardHome,
      },
      {
        path: "profile",
        Component: ProfileContent,
      },
      {
        path: "sessions",
        Component: PlaceholderPage,
      },
      {
        path: "groups",
        Component: PlaceholderPage,
      },
      {
        path: "settings",
        Component: PlaceholderPage,
      },
      {
        path: "notifications",
        Component: PlaceholderPage,
      },
    ],
  },
  {
    path: "/room/:roomId",
    Component: StudyRoom,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);

function PlaceholderPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Coming Soon</h2>
        <p className="text-muted-foreground">This feature is planned for a future sprint</p>
      </div>
    </div>
  );
}
