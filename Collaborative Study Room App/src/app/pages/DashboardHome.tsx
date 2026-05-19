import { Link } from "react-router";
import {
  Plus,
  Users,
  Clock,
  Search,
  Circle,
} from "lucide-react";

const STUDY_ROOMS = [
  {
    id: "1",
    name: "CS 101: Data Structures",
    participants: 8,
    maxParticipants: 12,
    status: "active" as const,
    subject: "Computer Science",
    startedAt: "2h ago",
  },
  {
    id: "2",
    name: "Calculus Study Group",
    participants: 5,
    maxParticipants: 10,
    status: "active" as const,
    subject: "Mathematics",
    startedAt: "45m ago",
  },
  {
    id: "3",
    name: "Physics Lab Review",
    participants: 3,
    maxParticipants: 8,
    status: "active" as const,
    subject: "Physics",
    startedAt: "1h ago",
  },
  {
    id: "4",
    name: "English Literature Discussion",
    participants: 0,
    maxParticipants: 15,
    status: "scheduled" as const,
    subject: "Literature",
    startedAt: "Starts in 30m",
  },
  {
    id: "5",
    name: "Chemistry Final Prep",
    participants: 10,
    maxParticipants: 15,
    status: "active" as const,
    subject: "Chemistry",
    startedAt: "3h ago",
  },
  {
    id: "6",
    name: "History Exam Study Session",
    participants: 0,
    maxParticipants: 12,
    status: "scheduled" as const,
    subject: "History",
    startedAt: "Starts tomorrow",
  },
];

const ONLINE_USERS = [
  { name: "Alex Chen", avatar: "AC", status: "In Study Room" },
  { name: "Sarah Johnson", avatar: "SJ", status: "Available" },
  { name: "Michael Brown", avatar: "MB", status: "In Study Room" },
  { name: "Emily Davis", avatar: "ED", status: "Available" },
  { name: "James Wilson", avatar: "JW", status: "In Study Room" },
];

export function DashboardHome() {
  return (
    <>
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-card-foreground">Study Rooms</h2>
            <p className="text-sm text-muted-foreground mt-1">Join or create a collaborative study session</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search rooms..."
                className="pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary w-64"
              />
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Room
            </button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Study Rooms Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STUDY_ROOMS.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            {/* Online Users */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Online Users
                <span className="ml-auto text-sm text-muted-foreground">{ONLINE_USERS.length}</span>
              </h3>
              <div className="space-y-3">
                {ONLINE_USERS.map((user) => (
                  <div key={user.name} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-medium text-sm text-primary">
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.status}</p>
                    </div>
                    <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-card-foreground mb-4">Your Activity</h3>
              <div className="space-y-4">
                <StatItem label="Study Hours This Week" value="12.5 hrs" />
                <StatItem label="Sessions Joined" value="8" />
                <StatItem label="Active Streak" value="5 days" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    participants: number;
    maxParticipants: number;
    status: "active" | "scheduled";
    subject: string;
    startedAt: string;
  };
}

function RoomCard({ room }: RoomCardProps) {
  return (
    <Link to={`/room/${room.id}`}>
      <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-lg group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-card-foreground group-hover:text-primary transition-colors mb-1">
              {room.name}
            </h4>
            <p className="text-xs text-muted-foreground">{room.subject}</p>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              room.status === "active"
                ? "bg-green-500/10 text-green-500"
                : "bg-yellow-500/10 text-yellow-500"
            }`}
          >
            {room.status === "active" ? "Active" : "Scheduled"}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>
              {room.participants}/{room.maxParticipants}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{room.startedAt}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <button className="w-full py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary text-sm">
            Join Room
          </button>
        </div>
      </div>
    </Link>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-card-foreground">{value}</span>
    </div>
  );
}
