import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, DoorOpen, LineChart, Users } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import { listRoomsByParticipant } from "../../repositories/room.repository";
import useAuthStore from "../../stores/useAuthStore";
import type { StudyRoom } from "../../types/room.types";

const Sessions = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const profile = useAuthStore((state) => state.profile);
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDate());

  useEffect(() => {
    let active = true;

    const loadRooms = async () => {
      if (!authUser?.uid) return;

      setLoading(true);
      setError(null);

      try {
        const nextRooms = await listRoomsByParticipant(authUser.uid);
        if (active) setRooms(nextRooms);
      } catch {
        if (active) setError("No se pudo cargar tu historial de salas.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadRooms();

    return () => {
      active = false;
    };
  }, [authUser?.uid]);

  const currentMonth = useMemo(() => buildMonthDays(), []);
  const sessionsByDay = useMemo(() => {
    return rooms.reduce<Record<number, StudyRoom[]>>((groups, room) => {
      const day = room.createdAt ? new Date(room.createdAt).getDate() : new Date().getDate();
      groups[day] = [...(groups[day] ?? []), room];
      return groups;
    }, {});
  }, [rooms]);
  const selectedSessions = sessionsByDay[selectedDay] ?? [];
  const ownRooms = rooms.filter((room) => room.ownerId === authUser?.uid);

  return (
    <DashboardShell>
      <header className="border-b border-border bg-card px-4 py-5 sm:px-6">
        <p className="text-sm font-medium text-primary">Agenda de estudio</p>
        <h1 className="mt-1 text-2xl font-semibold text-card-foreground">Sesiones</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Revisa tus salas recientes, actividad del mes y accesos rapidos para volver a estudiar.
        </p>
      </header>

      <section className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat icon={<Clock className="h-5 w-5" />} label="Horas esta semana" value={`${profile?.studyHours ?? 0} hrs`} />
            <Stat icon={<CalendarDays className="h-5 w-5" />} label="Sesiones registradas" value={String(Math.max(profile?.sessionsJoined ?? 0, rooms.length))} />
            <Stat icon={<LineChart className="h-5 w-5" />} label="Salas activas" value={String(rooms.filter((room) => room.status === "active").length)} />
          </div>

          <section className="rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-card-foreground">Calendario mensual</h2>
              <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString([], { month: "long", year: "numeric" })}</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {currentMonth.map((day) => {
                const hasSessions = Boolean(sessionsByDay[day]?.length);
                const selected = selectedDay === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`flex aspect-square min-h-12 flex-col items-center justify-center rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-accent"
                    }`}
                  >
                    <span className="font-semibold">{day}</span>
                    {hasSessions ? <span className={`mt-1 h-1.5 w-1.5 rounded-full ${selected ? "bg-primary-foreground" : "bg-primary"}`} /> : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Sesiones recientes</h2>
            {loading ? (
              <div className="h-32 animate-pulse rounded-lg bg-muted" />
            ) : error ? (
              <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
            ) : rooms.length ? (
              <div className="space-y-3">
                {rooms.slice(0, 8).map((room) => <SessionRow key={room.id} room={room} isOwner={room.ownerId === authUser?.uid} />)}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted-foreground">Todavia no hay sesiones registradas.</p>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Dia seleccionado</h2>
            {selectedSessions.length ? (
              <div className="space-y-3">
                {selectedSessions.map((room) => <SessionRow key={room.id} room={room} isOwner={room.ownerId === authUser?.uid} compact />)}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No hay salas marcadas para este dia.</p>
            )}
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">Resumen</h2>
            <div className="space-y-3 text-sm">
              <Summary label="Como anfitrion" value={String(ownRooms.length)} />
              <Summary label="Como invitado" value={String(Math.max(rooms.length - ownRooms.length, 0))} />
              <Summary label="Materia frecuente" value={mostCommonSubject(rooms)} />
            </div>
          </section>
        </aside>
      </section>
    </DashboardShell>
  );
};

const buildMonthDays = () => {
  const now = new Date();
  const total = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Array.from({ length: total }, (_, index) => index + 1);
};

const mostCommonSubject = (rooms: StudyRoom[]) => {
  const counts = rooms.reduce<Record<string, number>>((current, room) => {
    const subject = room.subject || "General";
    current[subject] = (current[subject] ?? 0) + 1;
    return current;
  }, {});
  return Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "Sin datos";
};

const Stat = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-card p-5">
    <div className="mb-3 text-primary">{icon}</div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-card-foreground">{value}</p>
  </div>
);

const SessionRow = ({ room, isOwner, compact }: { room: StudyRoom; isOwner: boolean; compact?: boolean }) => (
  <article className="rounded-lg border border-border bg-background p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-semibold text-card-foreground">{room.name}</h3>
        <p className="text-sm text-muted-foreground">{room.subject || "Sala de estudio"}</p>
      </div>
      <span className="rounded-full bg-accent px-2 py-1 text-xs font-semibold text-accent-foreground">{isOwner ? "Anfitrion" : "Invitado"}</span>
    </div>
    {!compact ? (
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{room.createdAt ? new Date(room.createdAt).toLocaleString() : "Fecha reciente"}</span>
        <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{room.participantIds.length} participantes</span>
      </div>
    ) : null}
    {room.status === "active" ? (
      <Link to={`/room/${room.id}`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary">
        <DoorOpen className="h-4 w-4" />
        Volver a sala
      </Link>
    ) : null}
  </article>
);

const Summary = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-semibold text-card-foreground">{value}</span>
  </div>
);

export default Sessions;
