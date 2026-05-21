import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
import { getRoomById } from "../../repositories/room.repository";
import { connectSocket, socket } from "../../sockets/socketManager";
import useAuthStore from "../../stores/useAuthStore";
import type { StudyRoom } from "../../types/room.types";

const participants = [
  { id: "1", name: "Tu", avatar: "TU", isMuted: false, isVideoOff: false, isSpeaking: true },
  { id: "2", name: "Alex Chen", avatar: "AC", isMuted: false, isVideoOff: false, isSpeaking: false },
  { id: "3", name: "Sara Gomez", avatar: "SG", isMuted: true, isVideoOff: false, isSpeaking: false },
  { id: "4", name: "Miguel Ruiz", avatar: "MR", isMuted: false, isVideoOff: true, isSpeaking: false },
  { id: "5", name: "Emilia Diaz", avatar: "ED", isMuted: false, isVideoOff: false, isSpeaking: false },
];

const chatMessages = [
  { id: "1", sender: "Alex Chen", message: "Hola a todos! Listos para resolver esta guia?", time: "2:30 PM" },
  { id: "2", sender: "Sara Gomez", message: "Si! Empecemos por la pregunta 3, esta dificil.", time: "2:31 PM" },
  { id: "3", sender: "Tu", message: "De acuerdo, tambien estoy atascado ahi.", time: "2:32 PM" },
  { id: "4", sender: "Miguel Ruiz", message: "Creo que ya lo entendi, voy a compartir pantalla.", time: "2:33 PM" },
];

const Room = () => {
  const { roomId } = useParams();
  const authUser = useAuthStore((state) => state.authUser);
  const [room, setRoom] = useState<StudyRoom | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);

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

        setRoom(nextRoom);
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

    return () => {
      socket.emit("room:leave", { roomId });
    };
  }, [authUser?.uid, roomId]);

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
            <ChatPanel onClose={() => setShowChat(false)} />
          </aside>
        ) : null}
      </section>

      {showChat ? (
        <section className="border-t border-border bg-card md:hidden">
          <ChatPanel compact onClose={() => setShowChat(false)} />
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
      </div>
    </div>
  );
};

const ChatPanel = ({ compact, onClose }: { compact?: boolean; onClose: () => void }) => {
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
        {chatMessages.map((message) => (
          <ChatMessage key={message.id} {...message} />
        ))}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            className="min-w-0 flex-1 rounded-lg border border-input bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="rounded-lg bg-primary p-2 text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Enviar mensaje">
            <Send className="h-5 w-5" />
          </button>
        </div>
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

const ChatMessage = ({ sender, message, time }: { sender: string; message: string; time: string }) => {
  const isYou = sender === "Tu";

  return (
    <div className={`flex flex-col ${isYou ? "items-end" : "items-start"}`}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{sender}</span>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
      <div className={`max-w-[85%] rounded-xl px-4 py-2 ${isYou ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

export default Room;
