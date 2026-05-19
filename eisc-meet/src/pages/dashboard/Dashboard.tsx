import { Link } from "react-router-dom";
import { Circle, Clock, Plus, Search, Users } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";

const studyRooms = [
  { id: "1", name: "Data Structures", participants: 8, maxParticipants: 12, status: "active", subject: "Computer Science", startedAt: "2h ago" },
  { id: "2", name: "Calculus Study Group", participants: 5, maxParticipants: 10, status: "active", subject: "Mathematics", startedAt: "45m ago" },
  { id: "3", name: "Physics Lab Review", participants: 3, maxParticipants: 8, status: "active", subject: "Physics", startedAt: "1h ago" },
  { id: "4", name: "Literature Discussion", participants: 0, maxParticipants: 15, status: "scheduled", subject: "Literature", startedAt: "Starts in 30m" },
] as const;

const onlineUsers = [
  { name: "Alex Chen", avatar: "AC", status: "In Study Room" },
  { name: "Sarah Johnson", avatar: "SJ", status: "Available" },
  { name: "Michael Brown", avatar: "MB", status: "In Study Room" },
  { name: "Emily Davis", avatar: "ED", status: "Available" },
];

const Dashboard = () => {
  return (
    <DashboardShell>
      <header className="border-b border-border bg-card px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">Study Rooms</h1>
            <p className="mt-1 text-sm text-muted-foreground">Join or create a collaborative study session</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search rooms..."
                className="w-full rounded-lg border border-input bg-input-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
              />
            </label>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary">
              <Plus className="h-4 w-4" />
              Create Room
            </button>
          </div>
        </div>
      </header>

      <section className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2">
            {studyRooms.map((room) => (
              <Link key={room.id} to={`/room/${room.id}`} className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-card-foreground transition-colors group-hover:text-primary">{room.name}</h2>
                    <p className="text-xs text-muted-foreground">{room.subject}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${room.status === "active" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-300"}`}>
                    {room.status === "active" ? "Active" : "Scheduled"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {room.participants}/{room.maxParticipants}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {room.startedAt}
                  </span>
                </div>
                <div className="mt-4 border-t border-border pt-4">
                  <span className="block rounded-lg bg-primary/10 py-2 text-center text-sm font-medium text-primary transition-colors group-hover:bg-primary/20">
                    Join Room
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-card-foreground">
                <Users className="h-5 w-5 text-primary" />
                Online Users
                <span className="ml-auto text-sm text-muted-foreground">{onlineUsers.length}</span>
              </h2>
              <div className="space-y-3">
                {onlineUsers.map((user) => (
                  <div key={user.name} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-sm font-medium text-primary">
                      {user.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-card-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.status}</p>
                    </div>
                    <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 font-semibold text-card-foreground">Your Activity</h2>
              <div className="space-y-4">
                <StatItem label="Study Hours This Week" value="12.5 hrs" />
                <StatItem label="Sessions Joined" value="8" />
                <StatItem label="Active Streak" value="5 days" />
              </div>
            </div>
          </aside>
        </div>
      </section>
    </DashboardShell>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-card-foreground">{value}</span>
  </div>
);

export default Dashboard;
