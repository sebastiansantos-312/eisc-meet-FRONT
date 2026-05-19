import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AtSign, CheckCircle, Lock, Mail, User, Video } from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import { isValidUsername } from "../../types/user.types";

type RegisterForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
};

type RegisterErrors = Partial<Record<keyof RegisterForm, string>>;

const initialForm: RegisterForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
};

const namePattern = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,30}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegisterForm = (form: RegisterForm): RegisterErrors => {
  const errors: RegisterErrors = {};
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const username = form.username.trim();
  const email = form.email.trim();

  if (!namePattern.test(firstName)) {
    errors.firstName = "Usa solo letras, minimo 2 y maximo 30 caracteres.";
  }

  if (!namePattern.test(lastName)) {
    errors.lastName = "Usa solo letras, minimo 2 y maximo 30 caracteres.";
  }

  if (!isValidUsername(username)) {
    errors.username = "Usa 3 a 20 caracteres: letras, numeros o underscore, sin espacios.";
  }

  if (!emailPattern.test(email)) {
    errors.email = "Ingresa un correo valido.";
  }

  if (form.password.length < 6) {
    errors.password = "La contrasena debe tener al menos 6 caracteres.";
  } else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password)) {
    errors.password = "Recomendado: incluye mayuscula, minuscula y numero.";
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = "Las contrasenas no coinciden.";
  }

  if (!form.termsAccepted) {
    errors.termsAccepted = "Debes aceptar los terminos para continuar.";
  }

  return errors;
};

const Register = () => {
  const navigate = useNavigate();
  const { error, loading, loginWithGoogle, registerWithEmail, clearError } = useAuthStore();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<RegisterErrors>({});
  const [status, setStatus] = useState<string | null>(null);

  const updateField = <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setStatus(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setStatus(null);

    const normalizedForm = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
    };
    const errors = validateRegisterForm(normalizedForm);

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    try {
      await registerWithEmail(normalizedForm);
      setStatus("Cuenta creada correctamente.");
      navigate("/dashboard");
    } catch {
      // El store expone el mensaje para la UI.
    }
  };

  const handleGoogleRegister = async () => {
    clearError();
    setStatus(null);

    try {
      const profile = await loginWithGoogle();
      navigate(profile.profileCompleted ? "/dashboard" : "/complete-profile");
    } catch {
      // El store expone el mensaje para la UI.
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-accent/20 p-4">
      <section className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Video className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold text-foreground">EISC Meet</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="mb-2 text-2xl font-semibold text-card-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground">Join your classmates in collaborative study rooms</p>
          </div>

          {error || status ? (
            <div
              className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
                error ? "border-red-400/30 bg-red-500/10 text-red-200" : "border-green-400/30 bg-green-500/10 text-green-200"
              }`}
            >
              {status ? (
                <span className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {status}
                </span>
              ) : (
                error
              )}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={(value) => updateField("firstName", value)}
                error={fieldErrors.firstName}
                placeholder="Jane"
                icon={<User className="h-5 w-5" />}
              />

              <TextField
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={(value) => updateField("lastName", value)}
                error={fieldErrors.lastName}
                placeholder="Smith"
              />
            </div>

            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={(value) => updateField("username", value)}
              error={fieldErrors.username}
              placeholder="jane_smith"
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]{3,20}"
              icon={<AtSign className="h-5 w-5" />}
              helper="Use 3 to 20 letters, numbers, or underscores."
            />

            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={(value) => updateField("email", value.toLowerCase())}
              error={fieldErrors.email}
              placeholder="student@university.edu"
              icon={<Mail className="h-5 w-5" />}
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={(value) => updateField("password", value)}
              error={fieldErrors.password}
              placeholder="Create a strong password"
              minLength={6}
              icon={<Lock className="h-5 w-5" />}
            />

            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(value) => updateField("confirmPassword", value)}
              error={fieldErrors.confirmPassword}
              placeholder="Confirm your password"
              minLength={6}
              icon={<Lock className="h-5 w-5" />}
            />

            <label className="block">
              <span className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={form.termsAccepted}
                  onChange={(event) => updateField("termsAccepted", event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <span>I agree to the Terms of Service and Privacy Policy</span>
              </span>
              <FieldError message={fieldErrors.termsAccepted} />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <div className="relative py-1">
              <div className="absolute inset-x-0 top-1/2 border-t border-border" />
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleRegister}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card py-3 font-medium text-card-foreground transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">G</span>
              {loading ? "Connecting..." : "Sign up with Google"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary transition-colors hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

type TextFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder: string;
  type?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  helper?: string;
  icon?: ReactNode;
};

const TextField = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  minLength,
  maxLength,
  pattern,
  helper,
  icon,
}: TextFieldProps) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-card-foreground">{label}</span>
    <span className="relative block">
      {icon ? <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span> : null}
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={`${name}-feedback`}
        className={`w-full rounded-lg border bg-input-background py-2.5 pr-4 text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
          icon ? "pl-10" : "pl-3"
        } ${error ? "border-red-400" : "border-input"}`}
      />
    </span>
    <span id={`${name}-feedback`}>
      <FieldError message={error} />
      {!error && helper ? <span className="mt-2 block text-xs text-muted-foreground">{helper}</span> : null}
    </span>
  </label>
);

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;

  return <span className="mt-2 block text-xs font-medium text-red-200">{message}</span>;
};

export default Register;
