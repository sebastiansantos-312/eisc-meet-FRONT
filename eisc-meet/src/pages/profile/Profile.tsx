import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Award, BookOpen, Calendar, Camera, Clock, Mail, User } from "lucide-react";
import DashboardShell from "../../components/DashboardShell";
import useAuthStore from "../../stores/useAuthStore";
import { joinDisplayName, splitDisplayName, type AcademicYear } from "../../types/user.types";

type ProfileForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
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
    const name = profile?.name ?? authUser?.displayName ?? "EISC Student";
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
        <h1 className="text-2xl font-semibold text-card-foreground">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences</p>
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
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt={profile.name ?? "User profile"} className="h-32 w-32 rounded-full object-cover" />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-secondary/20">
                    <span className="text-4xl font-semibold text-primary">{initials}</span>
                  </div>
                )}
                <button type="button" className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary">
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <h2 className="text-lg font-semibold text-card-foreground">{profile?.name ?? authUser?.displayName ?? "EISC Student"}</h2>
              <p className="mb-4 text-sm text-muted-foreground">{profile?.major || "Student"}</p>
              <div className="space-y-3 border-t border-border pt-4">
                <StatRow icon={<Clock className="h-4 w-4" />} label="Study Hours" value={`${profile?.studyHours ?? 0} hrs`} />
                <StatRow icon={<Award className="h-4 w-4" />} label="Sessions" value={String(profile?.sessionsJoined ?? 0)} />
                <StatRow icon={<Calendar className="h-4 w-4" />} label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).getFullYear().toString() : "2026"} />
              </div>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-card-foreground">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TextField label="First Name" value={form.firstName} onChange={(value) => updateField("firstName", value)} />
                  <TextField label="Last Name" value={form.lastName} onChange={(value) => updateField("lastName", value)} />
                </div>
                <TextField label="Username" value={form.username} onChange={(value) => updateField("username", value)} />
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-card-foreground">Email Address</span>
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
                  <span className="mb-2 block text-sm font-medium text-card-foreground">Bio</span>
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
                Academic Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TextField label="University" value={form.university} onChange={(value) => updateField("university", value)} />
                  <TextField label="Major" value={form.major} onChange={(value) => updateField("major", value)} />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-card-foreground">Year</span>
                    <select
                      className="w-full rounded-lg border border-input bg-input-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.year}
                      onChange={(event) => updateField("year", event.target.value as AcademicYear)}
                    >
                      <option value="">Select year</option>
                      <option value="freshman">Freshman</option>
                      <option value="sophomore">Sophomore</option>
                      <option value="junior">Junior</option>
                      <option value="senior">Senior</option>
                      <option value="graduate">Graduate</option>
                    </select>
                  </label>
                  <TextField label="GPA (Optional)" value={form.gpa} onChange={(value) => updateField("gpa", value)} />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 font-semibold text-card-foreground">Study Preferences</h2>
              <div className="space-y-4">
                <CheckboxField
                  label="Allow others to invite me to study sessions"
                  checked={form.allowStudyInvites}
                  onChange={(value) => updateField("allowStudyInvites", value)}
                />
                <CheckboxField
                  label="Enable email notifications for new sessions"
                  checked={form.enableEmailNotifications}
                  onChange={(value) => updateField("enableEmailNotifications", value)}
                />
                <CheckboxField
                  label="Show my study hours on public profile"
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
              {profileLoading ? "Saving..." : "Save Changes"}
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

export default Profile;
