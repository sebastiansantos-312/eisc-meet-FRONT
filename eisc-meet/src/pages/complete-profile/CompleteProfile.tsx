import type { FormEvent } from "react";
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AtSign, User, Video } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import { isValidUsername, splitDisplayName } from "../../types/user.types";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { authUser, profile, profileLoading, error, completeProfile, clearError } = useAuthStore();
  const nameParts = splitDisplayName(profile?.name ?? authUser?.displayName ?? null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  if (profile?.profileCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();

    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get("firstName") ?? "");
    const lastName = String(formData.get("lastName") ?? "");
    const username = String(formData.get("username") ?? "");

    if (!isValidUsername(username)) {
      useAuthStore.setState({
        error: "El username debe tener 3 a 20 caracteres y solo usar letras, numeros o guion bajo.",
      });
      return;
    }

    try {
      await completeProfile({ firstName, lastName, username });
      navigate("/dashboard");
    } catch {
      // El store expone el mensaje para la UI.
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <section className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Video className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold text-foreground">EISC Meet</span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-semibold text-card-foreground">Completa tu perfil</h1>
            <p className="text-sm text-muted-foreground">Elige un username unico antes de entrar a tu inicio</p>
          </div>

          {error ? (
            <div className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-card-foreground">Nombres</span>
                <span className="relative block">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="firstName"
                    type="text"
                    required
                    defaultValue={profile?.firstName ?? nameParts.firstName}
                    className="w-full rounded-lg border border-input bg-input-background py-2.5 pl-10 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-card-foreground">Apellidos</span>
                <input
                  name="lastName"
                  type="text"
                  required
                  defaultValue={profile?.lastName ?? nameParts.lastName}
                  className="w-full rounded-lg border border-input bg-input-background px-3 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-card-foreground">Username</span>
              <span className="relative block">
                <AtSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="username"
                  type="text"
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[A-Za-z0-9_]{3,20}"
                  placeholder="eisc_student"
                  defaultValue={profile?.username ?? ""}
                  className="w-full rounded-lg border border-input bg-input-background py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </span>
              <span className="mt-2 block text-xs text-muted-foreground">Usa de 3 a 20 letras, numeros o guion bajo.</span>
            </label>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profileLoading ? "Guardando..." : "Continuar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};

export default CompleteProfile;
