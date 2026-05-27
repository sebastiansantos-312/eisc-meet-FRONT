import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  MessageSquare,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  MoreVertical,
  PhoneOff,
  Send,
  Settings,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { getRoomById, listRoomMessages } from "../../repositories/room.repository";
import { connectSocket, socket } from "../../sockets/socketManager";
import useAuthStore from "../../stores/useAuthStore";
import type { ChatMessage, StudyRoom } from "../../types/room.types";

type OnlineRoomUser = {
  socketId: string;
  userId: string;
};

const Room = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.authUser);
  const profile = useAuthStore((state) => state.profile);
  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [chatError, setChatError] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineRoomUser[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const participants = useMemo(() => {
    const knownIds = new Set<string>(room?.participantIds ?? []);
    onlineUsers.forEach((user) => knownIds.add(user.userId));

    if (authUser?.uid) knownIds.add(authUser.uid);

    return [...knownIds].map((uid) => ({
      id: uid,
      name: uid === authUser?.uid ? "Tu" : `Usuario ${uid.slice(0, 6)}`,
      avatar: uid === authUser?.uid ? getInitials(profile?.name ?? authUser?.displayName ?? "Tu") : uid.slice(0, 2).toUpperCase(),
      isMuted: uid === authUser?.uid ? isMuted : false,
      isVideoOff: uid === authUser?.uid ? isVideoOff : true,
      isSpeaking: uid === authUser?.uid && !isMuted,
      isOnline: onlineUsers.some((user) => user.userId === uid) || uid === authUser?.uid,
    }));
  }, [authUser?.displayName, authUser?.uid, isMuted, isVideoOff, onlineUsers, profile?.name, room?.participantIds]);

  useEffect(() => {
    let active = true;

    const loadRoom = async () => {
      if (!roomId) {
        setRoomLoading(false);
        setRoomError("No se encontro el ID de la sala.");
        return;
      }

      setRoomLoading(true);
      setRoomError(null);

      try {
        const nextRoom = await getRoomById(roomId);

        if (!active) return;

        if (!nextRoom) {
          setRoomError("Esta sala no existe o no tienes acceso.");
          setRoom(null);
          return;
        }

        if (nextRoom.status === "closed") {
          navigate("/dashboard", { replace: true, state: { notice: "La sala fue cerrada por el anfitrion." } });
          return;
        }

        setRoom(nextRoom);
        const history = await listRoomMessages(nextRoom.id);
        if (active) setMessages(history);
      } catch {
        if (active) setRoomError("No se pudo cargar la sala.");
      } finally {
        if (active) setRoomLoading(false);
      }
    };

    loadRoom();

    return () => {
      active = false;
    };
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !authUser?.uid) return;

    connectSocket().then((connected) => {
      if (connected) socket.emit("room:join", { roomId });
    });

    const handleRoomUsers = (payload: { roomId: string; users: OnlineRoomUser[] }) => {
      if (payload.roomId === roomId) {
        setOnlineUsers(payload.users);
      }
    };

    const handleChatMessage = (message: ChatMessage) => {
      if (message.roomId !== roomId) return;

      setMessages((current) => {
        if (current.some((entry) => entry.id === message.id)) return current;
        return [...current, message];
      });
      setSendingMessage(false);
      setChatError(null);
    };

    const handleChatError = (payload: { message?: string }) => {
      setSendingMessage(false);
      setChatError(payload.message ?? "No se pudo enviar el mensaje.");
    };

    const handleRoomClosed = (payload: { roomId: string }) => {
      if (payload.roomId !== roomId) return;

      socket.emit("room:leave", { roomId });
      navigate("/dashboard", { replace: true, state: { notice: "La sala fue cerrada por el anfitrion." } });
    };

    socket.on("room:users", handleRoomUsers);
    socket.on("chat:message", handleChatMessage);
    socket.on("chat:error", handleChatError);
    socket.on("room:closed", handleRoomClosed);

    return () => {
      socket.emit("room:leave", { roomId });
      socket.off("room:users", handleRoomUsers);
      socket.off("chat:message", handleChatMessage);
      socket.off("chat:error", handleChatError);
      socket.off("room:closed", handleRoomClosed);
    };
  }, [authUser?.uid, navigate, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, showChat]);

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = messageText.trim();

    if (!roomId || !trimmedMessage) return;

    setSendingMessage(true);
    setChatError(null);
    socket.emit("chat:message", { roomId, message: trimmedMessage });
    setMessageText("");
  };

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Volver al inicio"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-card-foreground sm:text-xl">
              {roomLoading ? "Cargando sala..." : room?.name ?? "Sala de estudio"}
            </h1>
            <p className="text-xs text-muted-foreground">ID de sala: {roomId ?? "general"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Configuracion de la sala">
            <Settings className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Mas opciones">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </header>

      <section className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-auto p-4">
          {roomError ? (
            <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {roomError}
            </div>
          ) : null}
          <div className="grid content-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {participants.map((participant) => (
              <ParticipantVideo key={participant.id} participant={participant} />
            ))}
          </div>
        </div>

        {showChat ? (
          <aside className="hidden w-80 shrink-0 flex-col border-l border-border bg-card md:flex xl:w-96">
            <ChatPanel
              messages={messages}
              authUserId={authUser?.uid}
              messageText={messageText}
              sending={sendingMessage}
              error={chatError}
              messagesEndRef={messagesEndRef}
              onMessageTextChange={setMessageText}
              onSend={handleSendMessage}
              onClose={() => setShowChat(false)}
            />
          </aside>
        ) : null}
      </section>

      {showChat ? (
        <section className="border-t border-border bg-card md:hidden">
          <ChatPanel
            compact
            messages={messages}
            authUserId={authUser?.uid}
            messageText={messageText}
            sending={sendingMessage}
            error={chatError}
            messagesEndRef={messagesEndRef}
            onMessageTextChange={setMessageText}
            onSend={handleSendMessage}
            onClose={() => setShowChat(false)}
          />
        </section>
      ) : null}

      <footer className="border-t border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-5 w-5" />
            <span>{participants.length} participantes</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <ControlButton
              icon={isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              label={isMuted ? "Activar microfono" : "Silenciar"}
              active={!isMuted}
              onClick={() => setIsMuted((current) => !current)}
            />
            <ControlButton
              icon={isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              label={isVideoOff ? "Activar camara" : "Apagar camara"}
              active={!isVideoOff}
              onClick={() => setIsVideoOff((current) => !current)}
            />
            <ControlButton
              icon={isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
              label={isScreenSharing ? "Dejar de compartir" : "Compartir pantalla"}
              active={isScreenSharing}
              onClick={() => setIsScreenSharing((current) => !current)}
            />
            {!showChat ? (
              <ControlButton icon={<MessageSquare className="h-5 w-5" />} label="Mensajes" onClick={() => setShowChat(true)} />
            ) : null}
            <Link
              to="/dashboard"
              className="inline-flex min-h-16 items-center gap-2 rounded-xl bg-red-400 px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <PhoneOff className="h-5 w-5" />
              Salir
            </Link>
          </div>

          <div className="hidden w-32 lg:block" />
        </div>
      </footer>
    </main>
  );
};

type Participant = {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
  isOnline: boolean;
};

const ParticipantVideo = ({ participant }: { participant: Participant }) => {
  return (
    <div
      className={`relative flex aspect-video min-h-40 items-center justify-center overflow-hidden rounded-xl border-2 bg-muted transition-colors shadow-sm ${
        participant.isSpeaking ? "border-primary" : "border-transparent"
      }`}
    >
      {participant.isVideoOff ? (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
          <span className="text-3xl font-semibold text-primary">{participant.avatar}</span>
        </div>
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-muted to-accent" />
      )}

      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/70 px-3 py-1.5 backdrop-blur-sm">
        <span className="text-sm font-semibold text-white">{participant.name}</span>
        {participant.isMuted ? <MicOff className="h-3.5 w-3.5 text-white" /> : null}
        <span className={`h-2 w-2 rounded-full ${participant.isOnline ? "bg-green-400" : "bg-slate-400"}`} />
      </div>
    </div>
  );
};

const ChatPanel = ({
  compact,
  messages,
  authUserId,
  messageText,
  sending,
  error,
  messagesEndRef,
  onMessageTextChange,
  onSend,
  onClose,
}: {
  compact?: boolean;
  messages: ChatMessage[];
  authUserId?: string;
  messageText: string;
  sending: boolean;
  error: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onMessageTextChange: (value: string) => void;
  onSend: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) => {
  return (
    <div className={`flex flex-col ${compact ? "max-h-80" : "h-full"}`}>
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-card-foreground">Mensajes</h2>
        </div>
        <button onClick={onClose} className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Cerrar chat">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-auto p-4">
        {messages.length ? (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} isYou={message.senderId === authUserId} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Aun no hay mensajes en esta sala.
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-4">
        {error ? (
          <p className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
        ) : null}
        <form onSubmit={onSend} className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(event) => onMessageTextChange(event.target.value)}
            placeholder="Escribe un mensaje..."
            className="min-w-0 flex-1 rounded-lg border border-input bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="rounded-lg bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Enviar mensaje"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

const ControlButton = ({ icon, label, active, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) => {
  const isDisabledState = active === false;

  return (
    <button
      onClick={onClick}
      className={`flex min-h-16 min-w-20 flex-col items-center justify-center gap-1.5 rounded-xl px-4 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
        isDisabledState ? "bg-red-400 text-white hover:bg-red-500" : "bg-accent text-accent-foreground hover:bg-accent/80"
      }`}
      aria-label={label}
    >
      {icon}
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
};

const ChatMessage = ({ message, isYou }: { message: ChatMessage; isYou: boolean }) => {
  return (
    <div className={`flex flex-col ${isYou ? "items-end" : "items-start"}`}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{isYou ? "Tu" : `Usuario ${message.senderId.slice(0, 6)}`}</span>
        <span className="text-xs text-muted-foreground">{formatMessageTime(message.createdAt)}</span>
      </div>
      <div className={`max-w-[85%] rounded-xl px-4 py-2 ${isYou ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
        <p className="text-sm leading-relaxed">{message.message}</p>
      </div>
    </div>
  );
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TU";
};

const formatMessageTime = (value?: string) => {
  if (!value) return "";

  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default Room;
