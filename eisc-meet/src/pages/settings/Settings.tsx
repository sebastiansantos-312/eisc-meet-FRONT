import type { ChangeEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Eye, Mic, MonitorCheck, Shield, SlidersHorizontal, Trash2, Video, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import useAuthStore from "../../stores/useAuthStore";

type RoomPreferences = {
  joinMuted: boolean;
  joinCameraOff: boolean;
  compactChat: boolean;
  presenceAlerts: boolean;
  rememberDevices: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  screenReaderHints: boolean;
  confirmBeforeMedia: boolean;
  showOnlineStatus: boolean;
  displayFullName: boolean;
  allowInvites: boolean;
};

const storageKey = "eisc-meet:settings";

const defaultPreferences: RoomPreferences = {
  joinMuted: true,
  joinCameraOff: true,
  compactChat: false,
  presenceAlerts: true,
  rememberDevices: true,
  highContrast: false,
  reduceMotion: false,
  largeText: false,
  screenReaderHints: true,
  confirmBeforeMedia: true,
  showOnlineStatus: true,
  displayFullName: false,
  allowInvites: true,
};

const Settings = () => {
  const navigate = useNavigate();
  const { loading, error, deleteAccount, clearError } = useAuthStore();
  const [preferences, setPreferences] = useState<RoomPreferences>(() => readPreferences());
  const [permissionStatus, setPermissionStatus] = useState("Sin probar");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("a11y-high-contrast", preferences.highContrast);
    root.classList.toggle("a11y-reduce-motion", preferences.reduceMotion);
    root.classList.toggle("a11y-large-text", preferences.largeText);
  }, [preferences.highContrast, preferences.largeText, preferences.reduceMotion]);

  useEffect(() => {
    if (!showDeleteModal) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowDeleteModal(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showDeleteModal]);

  const enabledCount = useMemo(() => Object.values(preferences).filter(Boolean).length, [preferences]);

  const updatePreference = (key: keyof RoomPreferences) => (event: ChangeEvent<HTMLInputElement>) => {
    setPreferences((current) => ({ ...current, [key]: event.target.checked }));
  };

  const testDevices = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setPermissionStatus("Este navegador no permite probar camara y microfono.");
      return;
    }

    setPermissionStatus("Solicitando permisos...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionStatus("Camara y microfono disponibles.");
    } catch {
      setPermissionStatus("Permisos bloqueados o dispositivo no disponible.");
    }
  };

  const handleDeleteAccount = async () => {
    clearError();

    try {
      await deleteAccount();
      navigate("/login", { replace: true });
    } catch {
      setShowDeleteModal(false);
    }
  };

  return (
    <DashboardShell>
      <header className="border-b border-border bg-card px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-primary">Preferencias</p>
          <h1 className="text-2xl font-semibold text-card-foreground">Configuracion</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Ajusta como entras a las salas, tus dispositivos, privacidad y apoyos de accesibilidad.
          </p>
        </div>
      </header>

      <section className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[1fr_20rem]">
        <div className="grid gap-5 lg:grid-cols-2">
          <PreferenceGroup title="Preferencias de sala" icon={<SlidersHorizontal className="h-5 w-5" />}>
            <Toggle label="Entrar siempre con microfono apagado" checked={preferences.joinMuted} onChange={updatePreference("joinMuted")} />
            <Toggle label="Entrar siempre con camara apagada" checked={preferences.joinCameraOff} onChange={updatePreference("joinCameraOff")} />
            <Toggle label="Mostrar vista compacta del chat" checked={preferences.compactChat} onChange={updatePreference("compactChat")} />
            <Toggle label="Mostrar avisos de entrada y salida" checked={preferences.presenceAlerts} onChange={updatePreference("presenceAlerts")} />
            <Toggle label="Recordar ultimos dispositivos usados" checked={preferences.rememberDevices} onChange={updatePreference("rememberDevices")} />
          </PreferenceGroup>

          <PreferenceGroup title="Dispositivos" icon={<MonitorCheck className="h-5 w-5" />}>
            <div className="grid gap-3 sm:grid-cols-2">
              <DeviceState icon={<Mic className="h-5 w-5" />} label="Microfono" value={permissionStatus} />
              <DeviceState icon={<Video className="h-5 w-5" />} label="Camara" value={permissionStatus} />
            </div>
            <button type="button" onClick={testDevices} className="mt-3 rounded-lg bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary">
              Probar camara y microfono
            </button>
          </PreferenceGroup>

          <PreferenceGroup title="Accesibilidad" icon={<Eye className="h-5 w-5" />}>
            <Toggle label="Modo alto contraste" checked={preferences.highContrast} onChange={updatePreference("highContrast")} />
            <Toggle label="Reducir animaciones" checked={preferences.reduceMotion} onChange={updatePreference("reduceMotion")} />
            <Toggle label="Tamano de texto grande" checked={preferences.largeText} onChange={updatePreference("largeText")} />
            <Toggle label="Mejoras para lector de pantalla" checked={preferences.screenReaderHints} onChange={updatePreference("screenReaderHints")} />
            <Toggle label="Confirmar antes de encender camara o microfono" checked={preferences.confirmBeforeMedia} onChange={updatePreference("confirmBeforeMedia")} />
          </PreferenceGroup>

          <PreferenceGroup title="Privacidad" icon={<Shield className="h-5 w-5" />}>
            <Toggle label="Permitir que otros vean mi estado en linea" checked={preferences.showOnlineStatus} onChange={updatePreference("showOnlineStatus")} />
            <Toggle label="Mostrar mi nombre completo en salas" checked={preferences.displayFullName} onChange={updatePreference("displayFullName")} />
            <Toggle label="Permitir invitaciones a salas" checked={preferences.allowInvites} onChange={updatePreference("allowInvites")} />
          </PreferenceGroup>

          <section className="rounded-lg border border-red-400/30 bg-red-500/10 p-5 lg:col-span-2">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-red-100">
              <AlertTriangle className="h-5 w-5" />
              Zona de riesgo
            </h2>
            <p className="max-w-2xl text-sm text-red-100/80">
              Elimina tu perfil, reserva de username y cuenta de Firebase Auth. Esta accion es definitiva.
            </p>
            {error ? (
              <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100" aria-live="polite">
                {error}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => {
                clearError();
                setShowDeleteModal(true);
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-400 px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar cuenta
            </button>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg font-semibold text-card-foreground">Resumen</h2>
          <p className="mt-2 text-sm text-muted-foreground">{enabledCount} preferencias activas.</p>
          <div className="mt-5 rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
            Alto contraste, reducir animaciones y texto grande se aplican de inmediato. Las otras preferencias quedan guardadas para integrarlas con la sala.
          </div>
        </aside>
      </section>

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="delete-account-title" className="text-xl font-semibold text-card-foreground">
                  Eliminar cuenta?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Esto borra tus datos de Firestore, elimina tu cuenta de acceso y te devuelve al login.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Cerrar dialogo de eliminar cuenta"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg border border-border px-4 py-2.5 font-medium text-card-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteAccount}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-400 px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {loading ? "Eliminando..." : "Eliminar cuenta"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </DashboardShell>
  );
};

const readPreferences = () => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? { ...defaultPreferences, ...JSON.parse(stored) } as RoomPreferences : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
};

const PreferenceGroup = ({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) => (
  <section className="rounded-lg border border-border bg-card p-5">
    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-card-foreground">
      <span className="text-primary">{icon}</span>
      {title}
    </h2>
    <div className="space-y-3">{children}</div>
  </section>
);

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) => (
  <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
    <span className="text-sm font-medium text-card-foreground">{label}</span>
    <input type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 accent-primary" />
  </label>
);

const DeviceState = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-background p-4">
    <div className="mb-2 flex items-center gap-2 text-primary">{icon}<span className="font-semibold text-card-foreground">{label}</span></div>
    <p className="text-sm text-muted-foreground">{value}</p>
  </div>
);

export default Settings;
