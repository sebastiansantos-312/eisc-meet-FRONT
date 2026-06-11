# eisc-meet — Frontend

Aplicación web del **Salón de Estudio Colaborativo en Tiempo Real**, construida con React + TypeScript + Vite. Permite a estudiantes autenticarse, crear/unirse a salas de estudio, chatear en tiempo real y comunicarse mediante audio, video y pantalla compartida usando WebRTC.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework UI | React 19 + TypeScript |
| Bundler | Vite |
| Estilos | Tailwind CSS |
| Autenticación | Firebase Auth (Email/Password + Google) |
| Base de datos | Firestore |
| Tiempo real | Socket.io Client |
| Video/Audio P2P | WebRTC (API nativa del navegador) |
| Enrutamiento | React Router DOM |
| Estado global | Zustand |
| Iconos | Lucide React |
| Despliegue | Vercel |

---

## Variables de entorno

Crea un archivo `.env` basándote en `.env.example`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# URL del backend de tiempo real (Socket.io + Signaling)
VITE_REALTIME_BACKEND_URL=http://localhost:3000

# URL del backend principal (REST)
VITE_BACKEND_URL=http://localhost:4000
```

---

## Instalación y ejecución local

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (HMR)
npm run dev

# Build de producción
npm run build

# Previsualizar build
npm run preview
```

---

## Estructura del proyecto

```
src/
├── components/         # Componentes globales reutilizables
│   ├── AuthBootstrap.tsx
│   ├── DashboardShell.tsx
│   └── ProtectedRoute.tsx
├── contexts/           # Contextos de React
├── hooks/              # Custom hooks
├── layouts/            # Layouts de página
├── lib/                # Configuración de Firebase
├── pages/              # Páginas de la aplicación
│   ├── complete-profile/  # US-02: Completar perfil Google
│   ├── dashboard/         # US-06: Dashboard de salas
│   ├── home/              # Página de inicio
│   ├── login/             # US-03: Inicio de sesión
│   ├── profile/           # US-04 / US-05: Perfil de usuario
│   ├── register/          # US-01: Registro manual
│   └── room/              # US-09..14: Sala de estudio (WebRTC)
├── repositories/       # Acceso a Firestore
├── routes/             # Configuración de rutas SPA
├── services/           # Servicios de Firebase Auth
├── sockets/            # Gestión de conexión Socket.io
├── stores/             # Stores de Zustand
├── types/              # Tipos TypeScript compartidos
└── utils/              # Utilidades generales
```

---

## Rutas de la aplicación

| Ruta | Página | Protegida | Historia |
|---|---|---|---|
| `/` | Home | No | — |
| `/login` | Login | No | US-03 |
| `/register` | Registro manual | No | US-01 |
| `/complete-profile` | Completar perfil Google | Sí | US-02 |
| `/dashboard` | Dashboard de salas | Sí | US-06 |
| `/profile` | Perfil de usuario | Sí | US-04, US-05 |
| `/room/:roomId` | Sala de estudio | Sí | US-09..14 |
| `*` | 404 Not Found | No | — |

Las rutas marcadas como **Protegidas** redirigen a `/login` si el usuario no está autenticado (implementado en `ProtectedRoute.tsx`).

---

## Funcionalidades implementadas

### Autenticación (Sprint 1 — TS-01, US-01/02/03)
- Registro manual con nombre, apellido, username único, avatar y correo institucional.
- Registro/Login con Google; flujo de username obligatorio en el primer ingreso.
- Validación de unicidad de username contra Firestore.
- Rutas privadas protegidas con redirección automática.

### Perfil de usuario (Sprint 2 — US-04/05)
- Visualización y edición de nombre, apellido, username y datos académicos.
- Validación de colisión de username y correo al editar.
- Eliminación de cuenta con modal de confirmación (borra de Firestore y Firebase Auth).

### Gestión de salas (Sprint 2/3 — US-06/07/08)
- Creación de salas con nombre, materia y aforo máximo.
- Dashboard con lista de salas propias y unidas.
- Edición y eliminación de salas (solo el anfitrión).
- Unirse a sala por ID.

### Chat en tiempo real (Sprint 3 — US-10/11)
- Mensajería instantánea via Socket.io con auto-scroll.
- Historial persistente cargado desde Firestore al entrar a la sala.
- Panel de chat lateral (escritorio) y panel inferior (móvil).

### Sala de estudio — WebRTC (Sprint 4/5 — US-09/12/13/14)
- Grid adaptativo de videos que se ajusta automáticamente al número de participantes.
- Transmisión P2P de audio y video via WebRTC con servidor STUN de Google.
- Control de micrófono (mute/unmute) y cámara (on/off) con actualización en tiempo real para todos.
- Compartición de pantalla con reemplazo del stream de cámara y restauración automática al detener.
- Selector de dispositivos de audio y video por separado.
- Feedback inmediato si el navegador deniega el acceso a cámara/micrófono.
- Notificaciones de entrada/salida de participantes.

---

## Arquitectura WebRTC en el cliente

### Negociación P2P

```
Al unirse a la sala (room:users recibido):
  - El peer con socket.id lexicográficamente menor crea la oferta
  - Se crea un RTCPeerConnection por cada par de participantes
  - Los candidatos ICE recibidos antes de setRemoteDescription
    se almacenan en pendingCandidates y se aplican después

Al compartir pantalla:
  - getDisplayMedia() obtiene el stream de escritorio
  - replaceTrack() reemplaza la video track en todas las conexiones activas
  - No se renegocia: la sustitución es transparente para los demás
  - Al detener, se restaura el track de cámara original (si estaba activo)
```

### Servidor STUN configurado
```ts
const peerConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};
```

---

## Accesibilidad (WCAG 2.2)

- Todos los botones de control tienen `aria-label` descriptivo.
- El grid de videos usa `aria-label` con estado de micrófono y cámara por participante.
- Los mensajes de error y estado usan `role="alert"` y `aria-live`.
- El chat usa `role="log"` con `aria-live="polite"` para anunciar mensajes nuevos.
- Los modales usan `role="dialog"` y `aria-modal="true"`.
- Los menús usan `role="menu"` / `role="menuitem"` / `role="listbox"` / `role="option"`.
- Foco recuperable con `Escape` en modales y menús.
- Contraste de color cumple mínimos AA en todos los estados.

---

## Despliegue en Vercel

1. Conectar el repositorio a Vercel.
2. Configurar las variables de entorno del `.env.example` en el panel de Vercel.
3. El archivo `vercel.json` incluye la regla de rewrite para el enrutamiento SPA:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/" }] }
   ```
4. Vercel detecta automáticamente el proyecto Vite y usa `npm run build` + directorio `dist`.
