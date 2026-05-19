import { Link, useParams } from "react-router";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  Send,
  MoreVertical,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";

const PARTICIPANTS = [
  { id: "1", name: "You", avatar: "YO", isMuted: false, isVideoOff: false, isSpeaking: true },
  { id: "2", name: "Alex Chen", avatar: "AC", isMuted: false, isVideoOff: false, isSpeaking: false },
  { id: "3", name: "Sarah Johnson", avatar: "SJ", isMuted: true, isVideoOff: false, isSpeaking: false },
  { id: "4", name: "Michael Brown", avatar: "MB", isMuted: false, isVideoOff: true, isSpeaking: false },
  { id: "5", name: "Emily Davis", avatar: "ED", isMuted: false, isVideoOff: false, isSpeaking: false },
];

const CHAT_MESSAGES = [
  { id: "1", sender: "Alex Chen", message: "Hey everyone! Ready to tackle this problem set?", time: "2:30 PM" },
  { id: "2", sender: "Sarah Johnson", message: "Yes! Let's start with question 3, it's tricky", time: "2:31 PM" },
  { id: "3", sender: "You", message: "Agreed, I'm stuck on that one too", time: "2:32 PM" },
  { id: "4", sender: "Michael Brown", message: "I think I figured it out, let me share my screen", time: "2:33 PM" },
];

export function StudyRoom() {
  const { roomId } = useParams();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="h-screen bg-background dark flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 hover:bg-accent rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div>
            <h2 className="font-semibold text-card-foreground">CS 101: Data Structures</h2>
            <p className="text-xs text-muted-foreground">Room ID: {roomId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="h-full grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
            {PARTICIPANTS.map((participant) => (
              <ParticipantVideo key={participant.id} participant={participant} />
            ))}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-card border-l border-border flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-card-foreground">Chat</h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {CHAT_MESSAGES.map((msg) => (
                <ChatMessage key={msg.id} {...msg} />
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-input-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-card border-t border-border px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{PARTICIPANTS.length} participants</span>
          </div>

          <div className="flex items-center gap-3">
            <ControlButton
              icon={isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              label={isMuted ? "Unmute" : "Mute"}
              active={!isMuted}
              onClick={() => setIsMuted(!isMuted)}
            />
            <ControlButton
              icon={isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              label={isVideoOff ? "Start Video" : "Stop Video"}
              active={!isVideoOff}
              onClick={() => setIsVideoOff(!isVideoOff)}
            />
            <ControlButton
              icon={isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              label={isScreenSharing ? "Stop Sharing" : "Share Screen"}
              active={isScreenSharing}
              onClick={() => setIsScreenSharing(!isScreenSharing)}
            />
            {!showChat && (
              <ControlButton
                icon={<MessageSquare className="w-5 h-5" />}
                label="Chat"
                onClick={() => setShowChat(true)}
              />
            )}
            <Link to="/dashboard">
              <button className="px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-destructive flex items-center gap-2">
                <PhoneOff className="w-5 h-5" />
                Leave
              </button>
            </Link>
          </div>

          <div className="w-32"></div>
        </div>
      </div>
    </div>
  );
}

interface ParticipantVideoProps {
  participant: {
    id: string;
    name: string;
    avatar: string;
    isMuted: boolean;
    isVideoOff: boolean;
    isSpeaking: boolean;
  };
}

function ParticipantVideo({ participant }: ParticipantVideoProps) {
  return (
    <div
      className={`relative bg-muted rounded-xl overflow-hidden aspect-video flex items-center justify-center border-2 transition-colors ${
        participant.isSpeaking ? "border-primary" : "border-transparent"
      }`}
    >
      {participant.isVideoOff ? (
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <span className="text-2xl font-semibold text-primary">{participant.avatar}</span>
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-muted to-accent"></div>
      )}

      {/* Name Tag */}
      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg flex items-center gap-2">
        <span className="text-sm font-medium text-white">{participant.name}</span>
        {participant.isMuted && <MicOff className="w-3.5 h-3.5 text-white" />}
      </div>
    </div>
  );
}

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function ControlButton({ icon, label, active, onClick }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
        active === false
          ? "bg-destructive text-destructive-foreground hover:opacity-90"
          : "bg-accent text-accent-foreground hover:bg-accent/80"
      }`}
      aria-label={label}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function ChatMessage({ sender, message, time }: { sender: string; message: string; time: string }) {
  const isYou = sender === "You";
  return (
    <div className={`flex flex-col ${isYou ? "items-end" : "items-start"}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-muted-foreground">{sender}</span>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
      <div
        className={`px-3 py-2 rounded-lg max-w-[80%] ${
          isYou ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        }`}
      >
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
