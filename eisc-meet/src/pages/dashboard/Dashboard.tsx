import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  DoorOpen,
  LogIn,
  MessageSquare,
  MonitorUp,
  Plus,
  Settings,
  Users,
  Video,
} from "lucide-react";
import DashboardShell from "../../components/DashboardShell";
import useAuthStore from "../../stores/useAuthStore";

type GuideStep = {
  title: string;
  description: string;
  icon: ReactNode;
  bullets: string[];
  actionLabel: string;
  actionTo: string;
};

const guideSteps: GuideStep[] = [
  {
    title: "Crea o entra a una sala",
    description: "Usa Grupos de estudio para abrir una sala propia o pegar el codigo que te compartieron.",
    icon: <DoorOpen className="h-10 w-10" />,
    bullets: ["Crea salas por materia", "Comparte el ID con invitados", "Vuelve a salas activas"],
    actionLabel: "Ir a grupos",
    actionTo: "/groups",
  },
  {
    title: "Activa audio y video",
    description: "Dentro de la sala puedes encender camara, microfono y elegir dispositivos antes de estudiar.",
    icon: <Video className="h-10 w-10" />,
    bullets: ["Permisos claros del navegador", "Mute y camara apagada visibles", "Estados sincronizados"],
    actionLabel: "Configurar dispositivos",
    actionTo: "/settings",
  },
  {
    title: "Chatea sin interrumpir",
    description: "El panel de mensajes guarda la conversacion y hace auto-scroll cuando llegan nuevos mensajes.",
    icon: <MessageSquare className="h-10 w-10" />,
    bullets: ["Mensajes en tiempo real", "Historial al recargar", "Nombres de participantes"],
    actionLabel: "Ver sesiones",
    actionTo: "/sessions",
  },
  {
    title: "Comparte pantalla",
    description: "Presenta documentos o ejercicios sin tumbar la llamada; el audio puede seguir activo.",
    icon: <MonitorUp className="h-10 w-10" />,
    bullets: ["Reemplazo de video por pantalla", "Restauracion automatica", "Control para dejar de compartir"],
    actionLabel: "Abrir configuracion",
    actionTo: "/settings",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const profile = useAuthStore((state) => state.profile);
  const [activeStep, setActiveStep] = useState(0);
  const [joinCode, setJoinCode] = useState("");
  const currentStep = guideSteps[activeStep];

  const greeting = useMemo(() => {
    const name = profile?.firstName || profile?.name?.split(" ")[0] || profile?.username;
    return name ? `Hola, ${name}` : "Hola";
  }, [profile?.firstName, profile?.name, profile?.username]);

  const goPrevious = () => {
    setActiveStep((current) => (current === 0 ? guideSteps.length - 1 : current - 1));
  };

  const goNext = () => {
    setActiveStep((current) => (current === guideSteps.length - 1 ? 0 : current + 1));
  };

  const handleQuickCreate = () => {
    navigate("/groups", { state: { action: "create" } });
  };

  const handleQuickJoin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = joinCode.trim();
    if (!code) return;
    navigate("/groups", { state: { action: "join", code } });
  };

  return (
    <DashboardShell>
      <section className="min-h-screen bg-background px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          <header className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">{greeting}</p>
              <h1 className="mt-1 text-2xl font-semibold text-card-foreground">Bienvenido a EISC Meet</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Esta guia resume el flujo principal para estudiar en salas colaborativas con chat, audio, video y pantalla compartida.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/groups" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary">
                <Users className="h-4 w-4" />
                Grupos de estudio
              </Link>
              <Link to="/settings" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 font-semibold text-card-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary">
                <Settings className="h-4 w-4" />
                Configuracion
              </Link>
            </div>
          </header>

          <section className="grid gap-5 lg:grid-cols-[1fr_20rem]">
            <div className="rounded-lg border border-border bg-card p-5 sm:p-6">
              <div className="flex min-h-[25rem] flex-col justify-between gap-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                    {currentStep.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary">Paso {activeStep + 1} de {guideSteps.length}</p>
                    <h2 className="mt-2 text-3xl font-semibold text-card-foreground">{currentStep.title}</h2>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{currentStep.description}</p>
                    <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                      {currentStep.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2 rounded-lg border border-border bg-background p-3 text-sm text-card-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    {guideSteps.map((step, index) => (
                      <button
                        key={step.title}
                        type="button"
                        onClick={() => setActiveStep(index)}
                        className={`h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary ${index === activeStep ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/50"}`}
                        aria-label={`Ver paso ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={goPrevious} className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Paso anterior">
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <Link to={currentStep.actionTo} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary">
                      {currentStep.actionLabel}
                    </Link>
                    <button type="button" onClick={goNext} className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Paso siguiente">
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <section className="rounded-lg border border-border bg-card p-5">
                <h2 className="mb-4 text-lg font-semibold text-card-foreground" id="quick-access-title">Accesos rapidos</h2>
                <nav aria-labelledby="quick-access-title" className="space-y-3">
                  {/* Crear sala */}
                  <button
                    id="btn-quick-create"
                    type="button"
                    onClick={handleQuickCreate}
                    className="flex w-full items-center gap-3 rounded-lg border border-border bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Crear una nueva sala de estudio"
                  >
                    <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
                    Crear sala
                  </button>

                  {/* Unirse a sala */}
                  <form
                    onSubmit={handleQuickJoin}
                    role="search"
                    aria-label="Unirse a sala por código"
                    className="flex gap-2"
                  >
                    <label htmlFor="quick-join-code" className="sr-only">ID o código de sala</label>
                    <input
                      id="quick-join-code"
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="ID o código de sala"
                      aria-label="ID o código de sala"
                      className="min-w-0 flex-1 rounded-lg border border-input bg-input-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      id="btn-quick-join"
                      type="submit"
                      disabled={!joinCode.trim()}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Unirse a la sala"
                    >
                      <LogIn className="h-4 w-4" aria-hidden="true" />
                      Unirse
                    </button>
                  </form>

                  {/* Resto de accesos */}
                  <QuickLink to="/groups" icon={<Users className="h-5 w-5" />} label="Gestionar salas" />
                  <QuickLink to="/sessions" icon={<CalendarDays className="h-5 w-5" />} label="Agenda de sesiones" />
                  <QuickLink to="/notifications" icon={<Bell className="h-5 w-5" />} label="Centro de actividad" />
                </nav>
              </section>

              <section className="rounded-lg border border-border bg-card p-5">
                <h2 className="mb-3 text-lg font-semibold text-card-foreground">Antes de entrar</h2>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>Ten listo el ID si vas como invitado.</p>
                  <p>Revisa permisos de camara y microfono.</p>
                  <p>Usa compartir pantalla para explicar documentos o ejercicios.</p>
                </div>
              </section>
            </aside>
          </section>
        </div>
      </section>
    </DashboardShell>
  );
};

const QuickLink = ({ to, icon, label }: { to: string; icon: ReactNode; label: string }) => (
  <Link to={to} className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary">
    <span className="text-primary">{icon}</span>
    {label}
  </Link>
);

export default Dashboard;
