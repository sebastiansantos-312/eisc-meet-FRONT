import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Award, BookOpen, Calendar, Camera, Clock, Mail, User } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";
import useAuthStore from "../../stores/useAuthStore";
import { joinDisplayName, splitDisplayName, type AcademicYear } from "../../types/user.types";

type ProfileForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  photoURL: string;
  bio: string;
  university: string;
  major: string;
  year: AcademicYear;
  gpa: string;
  allowStudyInvites: boolean;
  enableEmailNotifications: boolean;
  showStudyHoursPublic: boolean;
};

const emptyForm: ProfileForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  photoURL: "",
  bio: "",
  university: "",
  major: "",
  year: "",
  gpa: "",
  allowStudyInvites: true,
  enableEmailNotifications: true,
  showStudyHoursPublic: false,
};

const Profile = () => {
  const { authUser, profile, profileLoading, error, updateProfile } = useAuthStore();
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [status, setStatus] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!profile) return;

    const { firstName, lastName } = profile.firstName || profile.lastName
      ? { firstName: profile.firstName ?? "", lastName: profile.lastName ?? "" }
      : splitDisplayName(profile.name);
    setForm({
      firstName,
      lastName,
      username: profile.username ?? "",
      email: profile.email ?? "",
      photoURL: profile.photoURL ?? "",
      bio: profile.bio ?? "",
      university: profile.university ?? "",
      major: profile.major ?? "",
      year: profile.year ?? "",
      gpa: profile.gpa ?? "",
      allowStudyInvites: profile.allowStudyInvites ?? true,
      enableEmailNotifications: profile.enableEmailNotifications ?? true,
      showStudyHoursPublic: profile.showStudyHoursPublic ?? false,
    });
  }, [profile]);

  const initials = useMemo(() => {
    const name = profile?.name ?? authUser?.displayName ?? "Estudiante EISC";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ES";
  }, [authUser?.displayName, profile?.name]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        name: joinDisplayName(form.firstName, form.lastName),
        photoURL: form.photoURL || null,
        bio: form.bio,
        university: form.university,
        major: form.major,
        year: form.year,
        gpa: form.gpa,
        allowStudyInvites: form.allowStudyInvites,
        enableEmailNotifications: form.enableEmailNotifications,
        showStudyHoursPublic: form.showStudyHoursPublic,
      });
      setStatus("Perfil actualizado correctamente.");
    } catch {
      // El store expone el mensaje para la UI.
    }
  };

  const updateField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setStatus(null);
    setAvatarError(null);

    if (!file.type.startsWith("image/")) {
      setAvatarError("Selecciona un archivo de imagen valido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("La imagen debe pesar maximo 5 MB.");
      return;
    }

    try {
      const photoURL = await imageFileToAvatarDataUrl(file);
      updateField("photoURL", photoURL);
      setStatus("Imagen lista. Guarda los cambios para actualizar tu perfil.");
    } catch {
      setAvatarError("No se pudo procesar la imagen. Intenta con otra.");
    }
  };

  const clearAvatar = () => {
    setAvatarError(null);
    updateField("photoURL", "");
    setStatus("Imagen removida. Guarda los cambios para actualizar tu perfil.");
  };

  if (profileLoading && !profile) {
    return (
      <DashboardShell>
        <header className="border-b border-border bg-card px-4 py-5 sm:px-6">
          <div className="h-8 w-56 animate-pulse rounded bg-accent" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-accent" />
        </header>
        <section className="mx-auto max-w-5xl p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-80 animate-pulse rounded-xl bg-card" />
            <div className="h-96 animate-pulse rounded-xl bg-card lg:col-span-2" />
          </div>
        </section>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <header className="border-b border-border bg-card px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-semibold text-card-foreground">Configuracion del perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Administra tu cuenta y preferencias</p>
      </header>

      <section className="mx-auto max-w-5xl p-4 sm:p-6">
        {(error || status) ? (
          <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${error ? "border-red-400/30 bg-red-500/10 text-red-200" : "border-green-400/30 bg-green-500/10 text-green-200"}`}>
            {error ?? status}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="relative mb-4 inline-block">
                {form.photoURL ? (
                  <img src={form.photoURL} alt={profile?.name ?? "Perfil de usuario"} className="h-32 w-32 rounded-full object-cover" />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                    <span className="text-4xl font-semibold text-primary">{initials}</span>
                  </div>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Cambiar imagen de perfil"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Cambiar imagen
                </button>
                {form.photoURL ? (
                  <button
                    type="button"
                    onClick={clearAvatar}
                    className="text-sm font-medium text-red-200 transition-colors hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    Quitar imagen
                  </button>
                ) : null}
                {avatarError ? <p className="text-sm text-red-200">{avatarError}</p> : null}
              </div>
              <h2 className="text-lg font-semibold text-card-foreground">{profile?.name ?? authUser?.displayName ?? "Estudiante EISC"}</h2>
              <p className="mb-4 text-sm text-muted-foreground">{profile?.major || "Estudiante"}</p>
              <div className="space-y-3 border-t border-border pt-4">
                <StatRow icon={<Clock className="h-4 w-4" />} label="Horas de estudio" value={`${profile?.studyHours ?? 0} hrs`} />
                <StatRow icon={<Award className="h-4 w-4" />} label="Sesiones" value={String(profile?.sessionsJoined ?? 0)} />
                <StatRow icon={<Calendar className="h-4 w-4" />} label="Miembro desde" value={profile?.createdAt ? new Date(profile.createdAt).getFullYear().toString() : "2026"} />
              </div>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-card-foreground">
                <User className="h-5 w-5 text-primary" />
                Informacion personal
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TextField label="Nombres" value={form.firstName} onChange={(value) => updateField("firstName", value)} />
                  <TextField label="Apellidos" value={form.lastName} onChange={(value) => updateField("lastName", value)} />
                </div>
                <TextField label="Username" value={form.username} onChange={(value) => updateField("username", value)} />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-card-foreground">Correo electronico</span>
                  <span className="relative block">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="w-full rounded-lg border border-input bg-input-background py-2.5 pl-10 pr-4 text-muted-foreground focus:outline-none"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-card-foreground">Biografia</span>
                  <textarea
                    rows={3}
                    value={form.bio}
                    onChange={(event) => updateField("bio", event.target.value)}
                    className="w-full resize-none rounded-lg border border-input bg-input-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-card-foreground">
                <BookOpen className="h-5 w-5 text-primary" />
                Informacion academica
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TextField label="Universidad" value={form.university} onChange={(value) => updateField("university", value)} />
                  <TextField label="Programa" value={form.major} onChange={(value) => updateField("major", value)} />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-card-foreground">Semestre/Nivel</span>
                    <select
                      className="w-full rounded-lg border border-input bg-input-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.year}
                      onChange={(event) => updateField("year", event.target.value as AcademicYear)}
                    >
                      <option value="">Selecciona nivel</option>
                      <option value="freshman">Primeros semestres</option>
                      <option value="sophomore">Intermedio</option>
                      <option value="junior">Avanzado</option>
                      <option value="senior">Ultimo ano</option>
                      <option value="graduate">Posgrado</option>
                    </select>
                  </label>
                  <TextField label="Promedio (opcional)" value={form.gpa} onChange={(value) => updateField("gpa", value)} />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-card-foreground">Preferencias de estudio</h2>
              <div className="space-y-4">
                <CheckboxField
                  label="Permitir que otros me inviten a sesiones de estudio"
                  checked={form.allowStudyInvites}
                  onChange={(value) => updateField("allowStudyInvites", value)}
                />
                <CheckboxField
                  label="Activar notificaciones por correo para nuevas sesiones"
                  checked={form.enableEmailNotifications}
                  onChange={(value) => updateField("enableEmailNotifications", value)}
                />
                <CheckboxField
                  label="Mostrar mis horas de estudio en el perfil publico"
                  checked={form.showStudyHoursPublic}
                  onChange={(value) => updateField("showStudyHoursPublic", value)}
                />
              </div>
            </section>

            <button
              type="submit"
              disabled={profileLoading}
              className="rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profileLoading ? "Guardando..." : "Guardar cambios"}
            </button>
          </form>
        </div>
      </section>
    </DashboardShell>
  );
};

const TextField = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-card-foreground">{label}</span>
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-input bg-input-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </label>
);

const CheckboxField = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) => (
  <label className="flex cursor-pointer items-center gap-3 text-sm text-card-foreground">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
    />
    {label}
  </label>
);

const StatRow = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
    <span className="font-semibold text-card-foreground">{value}</span>
  </div>
);

const imageFileToAvatarDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("READ_FAILED"));
    reader.onload = () => {
      image.src = String(reader.result ?? "");
    };

    image.onerror = () => reject(new Error("IMAGE_FAILED"));
    image.onload = () => {
      const size = 320;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("CANVAS_FAILED"));
        return;
      }

      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = (image.naturalWidth - sourceSize) / 2;
      const sourceY = (image.naturalHeight - sourceSize) / 2;

      canvas.width = size;
      canvas.height = size;
      context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };

    reader.readAsDataURL(file);
  });
};

export default Profile;
