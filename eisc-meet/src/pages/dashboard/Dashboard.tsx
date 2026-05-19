import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Circle, Clock, LogIn, Plus, Search, Users, X } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";
import { createRoom, joinRoom, listRoomsByParticipant } from "../../repositories/room.repository";
import useAuthStore from "../../stores/useAuthStore";
import type { StudyRoom } from "../../types/room.types";

const onlineUsers = [
  { name: "Tu", avatar: "TU", status: "Disponible" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.authUser);
  const profile = useAuthStore((state) => state.profile);
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [savingRoom, setSavingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [query, setQuery] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const ownRooms = useMemo(() => {
    return rooms.filter((room) => room.ownerId === authUser?.uid);
  }, [authUser?.uid, rooms]);

  const filteredRooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return rooms;

    return rooms.filter((room) => {
      return [room.name, room.subject, room.description, room.roomCode].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [query, rooms]);

  useEffect(() => {
    let active = true;

    const loadRooms = async () => {
      if (!authUser?.uid) return;

      setLoadingRooms(true);
      setError(null);

      try {
        const nextRooms = await listRoomsByParticipant(authUser.uid);
        if (active) setRooms(nextRooms);
      } catch {
        if (active) setError("No se pudieron cargar tus salas.");
      } finally {
        if (active) setLoadingRooms(false);
      }
    };

    loadRooms();

    return () => {
      active = false;
    };
  }, [authUser?.uid]);

  const handleCreateRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!authUser?.uid) {
      setError("Debes iniciar sesion para crear una sala.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const subject = String(formData.get("subject") ?? "");
    const description = String(formData.get("description") ?? "");
    const maxParticipants = Number(formData.get("maxParticipants") ?? 8);

    setSavingRoom(true);
    setError(null);

    try {
      const room = await createRoom({
        ownerId: authUser.uid,
        name,
        subject,
        description,
        maxParticipants,
      });
      setRooms((current) => [room, ...current]);
      setShowCreateRoom(false);
      event.currentTarget.reset();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "No se pudo crear la sala.");
    } finally {
      setSavingRoom(false);
    }
  };

  const handleJoinRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!authUser?.uid) {
      setError("Debes iniciar sesion para unirte a una sala.");
      return;
    }

    setJoiningRoom(true);
    setError(null);

    try {
      const room = await joinRoom(joinCode, authUser.uid);
      setRooms((current) => {
        const withoutDuplicate = current.filter((currentRoom) => currentRoom.id !== room.id);
        return [room, ...withoutDuplicate];
      });
      setJoinCode("");
      navigate(`/room/${room.id}`);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "No se pudo entrar a la sala.");
    } finally {
      setJoiningRoom(false);
    }
  };

  return (
    <DashboardShell>
      <header className="border-b border-border bg-card px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-card-foreground">Salas de estudio</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile?.name ? `${profile.name}, crea o retoma tus sesiones de estudio` : "Crea o retoma tus sesiones de estudio"}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form onSubmit={handleJoinRoom} className="flex min-w-0 gap-2">
              <label className="min-w-0 flex-1 sm:w-44">
                <span className="sr-only">ID o codigo de sala</span>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                  placeholder="ID o codigo"
                  className="w-full rounded-lg border border-input bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <button
                type="submit"
                disabled={joiningRoom || !joinCode.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 font-medium text-card-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" />
                {joiningRoom ? "Entrando..." : "Unirse"}
              </button>
            </form>
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar salas..."
                className="w-full rounded-lg border border-input bg-input-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowCreateRoom(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Plus className="h-4 w-4" />
              Crear sala
            </button>
          </div>
        </div>
      </header>

      <section className="p-4 sm:p-6">
        {error ? (
          <div className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {loadingRooms ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="h-44 animate-pulse rounded-xl bg-card" />
                <div className="h-44 animate-pulse rounded-xl bg-card" />
              </div>
            ) : filteredRooms.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredRooms.map((room) => (
                  <Link
                    key={room.id}
                    to={`/room/${room.id}`}
                    className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-card-foreground transition-colors group-hover:text-primary">{room.name}</h2>
                        <p className="text-xs text-muted-foreground">{room.subject}</p>
                      </div>
                      <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
                        {room.ownerId === authUser?.uid ? "Admin" : "Invitado"}
                      </span>
                    </div>
                    <p className="mb-4 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                      {room.description || "Sala de estudio privada"}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {room.participantIds.length}/{room.maxParticipants}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : "New"}
                      </span>
                      <span className="rounded bg-accent px-2 py-1 font-mono text-xs text-accent-foreground">
                        {room.roomCode}
                      </span>
                    </div>
                    <div className="mt-4 border-t border-border pt-4">
                      <span className="block rounded-lg bg-primary/10 py-2 text-center text-sm font-medium text-primary transition-colors group-hover:bg-primary/20">
                        Entrar a la sala
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-card-foreground">Aun no tienes salas</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Crea tu primera sala o entra a una existente con su ID o codigo.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCreateRoom(true)}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <Plus className="h-4 w-4" />
                  Crear sala
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-card-foreground">
                <Users className="h-5 w-5 text-primary" />
                Usuarios en linea
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
              <h2 className="mb-4 font-semibold text-card-foreground">Tu actividad</h2>
              <div className="space-y-4">
                <StatItem label="Salas creadas" value={String(ownRooms.length)} />
                <StatItem label="Salas como invitado" value={String(Math.max(rooms.length - ownRooms.length, 0))} />
                <StatItem label="Horas de estudio esta semana" value={`${profile?.studyHours ?? 0} hrs`} />
                <StatItem label="Sesiones realizadas" value={String(profile?.sessionsJoined ?? 0)} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {showCreateRoom ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-room-title"
            className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="create-room-title" className="text-xl font-semibold text-card-foreground">
                  Crear sala de estudio
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">Esto guardara una nueva sala en Firestore.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateRoom(false)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Cerrar dialogo de crear sala"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <TextField name="name" label="Nombre de la sala" placeholder="Repaso de estructuras de datos" />
              <TextField name="subject" label="Materia" placeholder="Ciencias de la computacion" />
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-card-foreground">Descripcion</span>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Objetivo breve de esta sala"
                  className="w-full resize-none rounded-lg border border-input bg-input-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-card-foreground">Maximo de participantes</span>
                <input
                  name="maxParticipants"
                  type="number"
                  min={2}
                  max={50}
                  defaultValue={8}
                  className="w-full rounded-lg border border-input bg-input-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateRoom(false)}
                  className="rounded-lg border border-border px-4 py-2.5 font-medium text-card-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingRoom}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  {savingRoom ? "Creando..." : "Crear sala"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
};

const TextField = ({ name, label, placeholder }: { name: string; label: string; placeholder: string }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-card-foreground">{label}</span>
    <input
      name={name}
      type="text"
      required
      placeholder={placeholder}
      className="w-full rounded-lg border border-input bg-input-background px-3 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </label>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-card-foreground">{value}</span>
  </div>
);

export default Dashboard;
