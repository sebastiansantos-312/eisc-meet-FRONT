# EISC Meet - Flujos de Navegación

## 📋 Índice de Flujos

1. [Flujo de Registro (Nuevo Usuario)](#flujo-1-registro-nuevo-usuario)
2. [Flujo de Login (Usuario Existente)](#flujo-2-login-usuario-existente)
3. [Flujo de Unirse a Sala de Estudio](#flujo-3-unirse-a-sala-de-estudio)
4. [Flujo de Navegación en Dashboard](#flujo-4-navegación-en-dashboard)
5. [Flujo de Edición de Perfil](#flujo-5-edición-de-perfil)
6. [Flujo de Sesión de Video](#flujo-6-sesión-de-video)
7. [Flujo de Error 404](#flujo-7-página-no-encontrada)
8. [Flujo de Cerrar Sesión](#flujo-8-cerrar-sesión)

---

## Flujo 1: Registro (Nuevo Usuario)

### Descripción
Usuario nuevo que quiere crear una cuenta en EISC Meet.

### Diagrama de Flujo

```
┌─────────────────┐
│  Landing Page   │
│       (/)       │
└────────┬────────┘
         │
         │ Click "Get Started" o
         │ "Create Free Account"
         ▼
┌─────────────────┐
│ Register Page   │
│   (/register)   │
└────────┬────────┘
         │
         │ Completa formulario:
         │ • Full Name
         │ • Email
         │ • Password
         │ • Confirm Password
         │ ☑ Terms of Service
         │
         │ Click "Create Account"
         ▼
┌─────────────────┐
│   Dashboard     │
│  (/dashboard)   │
└─────────────────┘
```

### Pasos Detallados

1. **Inicio**: Usuario llega a `/`
2. **Acción**: Click en botón "Get Started" (header) o "Create Free Account" (hero section)
3. **Navegación**: Sistema navega a `/register`
4. **Formulario**:
   - Campo: Full Name (requerido)
   - Campo: Email (requerido, validación de formato)
   - Campo: Password (requerido)
   - Campo: Confirm Password (requerido, debe coincidir)
   - Checkbox: Acepta Terms of Service (requerido)
5. **Opción Alternativa**: Click "Sign up with Google" (UI placeholder - Sprint 0)
6. **Submit**: Click en "Create Account"
7. **Resultado**: Navegación automática a `/dashboard`

### Puntos de Salida Alternativos

- Click en "Sign in" → Navega a `/login`
- Click en logo EISC Meet → Navega a `/`

---

## Flujo 2: Login (Usuario Existente)

### Descripción
Usuario con cuenta existente que quiere iniciar sesión.

### Diagrama de Flujo

```
┌─────────────────┐
│  Landing Page   │
│       (/)       │
└────────┬────────┘
         │
         │ Click "Log In" (header) o
         │ "Sign In" (hero)
         ▼
┌─────────────────┐
│   Login Page    │
│    (/login)     │
└────────┬────────┘
         │
         │ Ingresa credenciales:
         │ • Email
         │ • Password
         │ ☑ Remember me (opcional)
         │
         │ Click "Sign In"
         ▼
┌─────────────────┐
│   Dashboard     │
│  (/dashboard)   │
└─────────────────┘
```

### Pasos Detallados

1. **Inicio**: Usuario en `/`
2. **Acción**: Click en "Log In" o "Sign In"
3. **Navegación**: Sistema navega a `/login`
4. **Formulario**:
   - Campo: Email Address (requerido)
   - Campo: Password (requerido)
   - Checkbox: Remember me (opcional)
5. **Opciones Adicionales**:
   - Link: "Forgot password?" (placeholder)
   - Botón: "Sign in with Google" (placeholder)
6. **Submit**: Click en "Sign In"
7. **Resultado**: Navegación automática a `/dashboard`

### Puntos de Salida Alternativos

- Click en "Sign up" → Navega a `/register`
- Click en logo EISC Meet → Navega a `/`
- Click en "Forgot password?" → (Placeholder - Sprint 1)

---

## Flujo 3: Unirse a Sala de Estudio

### Descripción
Usuario autenticado que quiere unirse a una sala de estudio activa.

### Diagrama de Flujo

```
┌─────────────────┐
│   Dashboard     │
│  (/dashboard)   │
└────────┬────────┘
         │
         │ Visualiza salas disponibles:
         │ • CS 101: Data Structures (8/12) Active
         │ • Calculus Study Group (5/10) Active
         │ • Physics Lab Review (3/8) Active
         │ • etc.
         │
         │ Click en tarjeta de sala
         ▼
┌─────────────────┐
│   Study Room    │
│ (/room/:roomId) │
│                 │
│ Características:│
│ • Video Grid    │
│ • Chat Sidebar  │
│ • Controls      │
└────────┬────────┘
         │
         │ Opciones:
         │ • Continuar en sesión
         │ • Click "Leave"
         │ • Click ← (back)
         ▼
┌─────────────────┐
│   Dashboard     │
│  (/dashboard)   │
└─────────────────┘
```

### Pasos Detallados

1. **Inicio**: Usuario en `/dashboard`
2. **Visualización**: Ve grid de salas disponibles
3. **Información de cada sala**:
   - Nombre (ej: "CS 101: Data Structures")
   - Participantes actuales / máximo (ej: 8/12)
   - Estado: Active (verde) o Scheduled (amarillo)
   - Materia (ej: "Computer Science")
   - Tiempo activo (ej: "2h ago")
4. **Acción**: Hover sobre tarjeta (borde cambia a primary/50)
5. **Click**: En cualquier parte de la tarjeta
6. **Navegación**: Sistema navega a `/room/:roomId` (ej: `/room/1`)
7. **Vista de Sala**:
   - Grid de video con participantes
   - Chat sidebar (collapsible)
   - Barra de controles inferior
8. **Salida**: Click en "Leave" o flecha back

### Estados de Salas

**Active (Activo)**:
- Badge verde: "Active"
- Participantes > 0
- Muestra tiempo activo: "2h ago", "45m ago"

**Scheduled (Programado)**:
- Badge amarillo: "Scheduled"
- Participantes = 0
- Muestra tiempo futuro: "Starts in 30m", "Starts tomorrow"

---

## Flujo 4: Navegación en Dashboard

### Descripción
Navegación entre secciones usando el sidebar persistente.

### Diagrama de Flujo

```
                    ┌─────────────────┐
                    │   Dashboard     │
                    │  (/dashboard)   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  My Sessions │    │ Study Groups │    │   Profile    │
│  (/sessions) │    │   (/groups)  │    │  (/profile)  │
│  [Planned]   │    │  [Planned]   │    │   [Active]   │
└──────────────┘    └──────────────┘    └──────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────┐
            │   Settings   │  │Notifications │
            │  (/settings) │  │(/notifications)│
            │  [Planned]   │  │  [Planned]   │
            └──────────────┘  └──────────────┘
```

### Sidebar de Navegación

**Secciones Principales**:
1. 🏠 **Dashboard** → `/dashboard` (Active - muestra salas)
2. 📅 **My Sessions** → `/sessions` (Planned - "Coming Soon")
3. 👥 **Study Groups** → `/groups` (Planned - "Coming Soon")
4. 👤 **Profile** → `/profile` (Active - edición de perfil)
5. ⚙️ **Settings** → `/settings` (Planned - "Coming Soon")

**Sección Inferior**:
6. 🔔 **Notifications** → `/notifications` (Badge: 3) (Planned)
7. 🚪 **Sign Out** → `/` (Landing)

### Características del Sidebar

- **Persistente**: Visible en todas las páginas autenticadas
- **Active State**: Página actual destacada con fondo violeta
- **Hover State**: Fondo gris claro al pasar mouse
- **Focus State**: Anillo azul al navegar con teclado
- **Badge**: Contador rojo en Notifications (3)

### Pasos para Navegar

1. Usuario en cualquier página autenticada
2. Sidebar siempre visible a la izquierda
3. Click en cualquier item del sidebar
4. Navegación instantánea (SPA - sin recarga)
5. Active state actualizado automáticamente
6. Contenido principal cambia, sidebar permanece

---

## Flujo 5: Edición de Perfil

### Descripción
Usuario edita su información personal y académica.

### Diagrama de Flujo

```
┌─────────────────┐
│   Dashboard     │
│  (/dashboard)   │
└────────┬────────┘
         │
         │ Click "Profile" en sidebar
         ▼
┌─────────────────────────────────────┐
│           Profile Page              │
│           (/profile)                │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────┐  ┌────────────┐ │
│  │ Avatar Card   │  │ Personal   │ │
│  │ • Foto JS     │  │ Info Form  │ │
│  │ • Stats       │  │            │ │
│  │ • Cambiar foto│  │ • Name     │ │
│  └───────────────┘  │ • Email    │ │
│                     │ • Bio      │ │
│                     └────────────┘ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Academic Information        │   │
│  │ • University                │   │
│  │ • Major                     │   │
│  │ • Year (dropdown)           │   │
│  │ • GPA                       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Study Preferences           │   │
│  │ ☑ Allow others to find me   │   │
│  │ ☑ Email notifications       │   │
│  │ ☐ Show study hours          │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         │
         │ Click "Save Changes" o
         │ Navegar usando sidebar
         ▼
```

### Secciones del Perfil

**1. Avatar Card (Izquierda)**
- Avatar circular con iniciales "JS"
- Botón de cámara para cambiar foto
- Nombre: Jane Smith
- Título: Computer Science Major
- Estadísticas:
  - 📊 Study Hours: 127.5 hrs
  - 🏆 Sessions: 42
  - 📅 Member Since: Jan 2026

**2. Personal Information (Derecha)**
- First Name: Jane
- Last Name: Smith
- Email: jane.smith@university.edu
- Bio: textarea expandible
- Botón: "Save Changes"

**3. Academic Information**
- University: State University
- Major: Computer Science
- Year: Dropdown (Freshman, Sophomore, Junior*, Senior, Graduate)
- GPA: 3.8 (opcional)
- Botón: "Update Academic Info"

**4. Study Preferences**
- ☑ Allow others to find me for study sessions
- ☑ Enable email notifications for new sessions
- ☐ Show my study hours on public profile

### Interacciones

1. **Cambiar Avatar**: Click en botón de cámara (placeholder)
2. **Editar Campos**: Click en input, modificar texto
3. **Cambiar Año**: Click en dropdown, seleccionar opción
4. **Toggle Preferencias**: Click en checkboxes
5. **Guardar**: Click en botones "Save Changes" (placeholder)
6. **Salir**: Usar sidebar para navegar a otra página

---

## Flujo 6: Sesión de Video

### Descripción
Usuario participa en una sala de estudio con video, audio y chat.

### Diagrama de Flujo

```
┌─────────────────┐
│   Study Room    │
│ (/room/:roomId) │
├─────────────────┤
│                 │
│  ┌─────────────────────────────┐  ┌──────────┐
│  │  Video Grid (2x3)           │  │  Chat    │
│  │  ┌────┐ ┌────┐ ┌────┐      │  │ Sidebar  │
│  │  │You │ │Alex│ │Sara│      │  │          │
│  │  └────┘ └────┘ └────┘      │  │ Messages │
│  │  ┌────┐ ┌────┐ ┌────┐      │  │ ────────│
│  │  │Mike│ │Emly│ │(+) │      │  │ Input    │
│  │  └────┘ └────┘ └────┘      │  └──────────┘
│  └─────────────────────────────┘
│                 │
│  ┌──────────────────────────────────────┐
│  │     Control Bar (Inferior)           │
│  │  [🎤Mute] [📹Video] [🖥️Share]       │
│  │  [💬Chat] [📞Leave]                  │
│  └──────────────────────────────────────┘
└─────────────────┘
```

### Componentes de la Sala

**Header Superior**:
- ← Botón back → `/dashboard`
- Nombre sala: "CS 101: Data Structures"
- Room ID: 1
- ⚙️ Settings (placeholder)
- ⋮ More options (placeholder)

**Grid de Video (Principal)**:
- Hasta 6 participantes visibles
- Cada tile muestra:
  - Video (o avatar si cámara apagada)
  - Nombre del participante
  - 🔇 Icono si está muteado
  - Borde violeta si está hablando
- Responsive: 2 columnas mobile, 3 desktop

**Chat Sidebar (Derecha)**:
- Toggle visible/oculto
- Historial de mensajes
- Muestra:
  - Nombre del sender
  - Mensaje
  - Hora (ej: "2:30 PM")
- Input de texto + botón Send
- Mensajes propios alineados a la derecha (fondo violeta)
- Mensajes de otros alineados a la izquierda (fondo gris)

**Control Bar (Inferior)**:
- **Mute/Unmute**: Toggle audio
  - Active: fondo gris, icono 🎤
  - Muted: fondo rojo, icono 🔇
- **Start/Stop Video**: Toggle cámara
  - Active: fondo gris, icono 📹
  - Off: fondo rojo, icono 📹 con slash
- **Share Screen**: Toggle pantalla compartida
  - Normal: fondo gris, icono 🖥️
  - Sharing: fondo gris activo, icono 🖥️ con slash
- **Chat**: Toggle sidebar
  - Solo visible si chat está oculto
- **Leave**: Salir de la sala
  - Botón rojo destacado
  - Icono 📞 con slash
  - Navega a `/dashboard`

### Estados de Participantes

**You (Tú)**:
- Video activo, no muteado
- Indicador de "hablando" activo
- Tile marcado como "You"

**Otros Participantes**:
- Alex Chen: Video activo, no muteado
- Sarah Johnson: Video activo, muteado (🔇)
- Michael Brown: Video apagado (muestra avatar MB), no muteado
- Emily Davis: Video activo, no muteado

### Flujo de Interacción

1. **Entrar**: Desde `/dashboard` → click en sala → `/room/1`
2. **Video Cargado**: Grid muestra todos los participantes
3. **Controles Disponibles**:
   - Click Mute → Audio apagado, icono cambia
   - Click Video → Cámara apagada, muestra avatar
   - Click Share → (Placeholder - Sprint 2)
   - Click Chat → Toggle sidebar
4. **Enviar Mensaje**:
   - Escribir en input
   - Click Send o Enter
   - Mensaje aparece en chat
5. **Salir**:
   - Click "Leave" → Confirma salida
   - Navega a `/dashboard`
   - O click ← back arrow

---

## Flujo 7: Página No Encontrada

### Descripción
Usuario intenta acceder a una ruta que no existe.

### Diagrama de Flujo

```
┌─────────────────┐
│  Cualquier      │
│  Página         │
└────────┬────────┘
         │
         │ Usuario escribe URL inválida:
         │ • /pagina-invalida
         │ • /xyz
         │ • /room/abc/xyz
         ▼
┌─────────────────┐
│  404 Not Found  │
│      (/*)       │
├─────────────────┤
│                 │
│   🔍 Icon       │
│                 │
│ "Page Not Found"│
│                 │
│ "The page you're│
│  looking for    │
│  doesn't exist" │
│                 │
│ [Go to Dashboard]│
│ [Back to Home] │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────┐   ┌─────┐
│ /   │   │/dash│
│ Home│   │board│
└─────┘   └─────┘
```

### Pasos Detallados

1. **Trigger**: Usuario en cualquier página
2. **Acción Incorrecta**:
   - Escribe URL inválida en barra de direcciones
   - Click en link roto
   - Bookmark antiguo
3. **Detección**: React Router detecta ruta no definida
4. **Navegación**: Sistema navega a ruta wildcard `*`
5. **Renderizado**: Componente NotFound
6. **Contenido**:
   - Logo EISC Meet (clickeable → `/`)
   - Icono de búsqueda 🔍 en círculo violeta
   - Título: "Page Not Found"
   - Descripción: "The page you're looking for doesn't exist or has been moved."
   - Error code: "Error 404"
7. **Opciones de Recuperación**:
   - Botón primario: "Go to Dashboard" → `/dashboard`
   - Botón secundario: "Back to Home" → `/`
8. **Salida**: Click en cualquier botón o logo

### Ejemplos de URLs Inválidas

- `/pagina-que-no-existe`
- `/room` (sin ID)
- `/room/abc/extra`
- `/dashbord` (typo)
- `/perfil` (en español, debería ser `/profile`)
- `/admin`
- Cualquier ruta no definida en routes.tsx

---

## Flujo 8: Cerrar Sesión

### Descripción
Usuario autenticado que quiere cerrar su sesión.

### Diagrama de Flujo

```
┌─────────────────┐
│  Cualquier      │
│  Página         │
│  Autenticada    │
│  (con sidebar)  │
└────────┬────────┘
         │
         │ Sidebar visible
         │ Sección inferior:
         │ • 🔔 Notifications (3)
         │ • 🚪 Sign Out
         │
         │ Click "Sign Out"
         ▼
┌─────────────────┐
│  Landing Page   │
│       (/)       │
│                 │
│ Usuario ahora   │
│ no autenticado  │
└─────────────────┘
```

### Pasos Detallados

1. **Inicio**: Usuario en cualquier página autenticada:
   - `/dashboard`
   - `/profile`
   - `/sessions`
   - `/groups`
   - `/settings`
   - `/notifications`

2. **Ubicación**: Sidebar izquierdo, sección inferior

3. **Visualización**:
   - Icono: 🚪 LogOut
   - Texto: "Sign Out"
   - Hover: Fondo gris claro

4. **Acción**: Click en "Sign Out"

5. **Efecto** (Sprint 0 - Visual):
   - Navegación inmediata a `/`
   - Sidebar desaparece
   - Vuelve a landing page pública

6. **Estado Final**:
   - Usuario en Landing Page
   - No autenticado
   - Puede volver a Login/Register

### Comportamiento Futuro (Sprint 1+)

En sprints futuros, este flujo incluirá:
- Limpieza de tokens de autenticación
- Cierre de sesión en Firebase/Supabase
- Limpieza de localStorage
- Confirmación opcional ("¿Estás seguro?")
- Redirección a `/login` si intenta acceder a rutas protegidas

---

## 🎯 Resumen de Rutas

### Rutas Públicas (Sin Autenticación)
```
/           → Landing Page
/login      → Login Page
/register   → Register Page
/*          → 404 Not Found
```

### Rutas Autenticadas (Con Sidebar)
```
/dashboard      → Dashboard (Active)
/profile        → Profile Settings (Active)
/sessions       → My Sessions (Planned)
/groups         → Study Groups (Planned)
/settings       → Settings (Planned)
/notifications  → Notifications (Planned)
```

### Rutas Standalone (Sin Sidebar)
```
/room/:roomId   → Study Room Video Interface
```

---

## 🔑 Elementos Clave de UX

### Consistencia
- ✅ Mismo header con logo en páginas públicas
- ✅ Mismo sidebar en páginas autenticadas
- ✅ Mismos estilos de botones y forms
- ✅ Mismos colores y tipografía

### Retroalimentación Visual
- ✅ Hover states en todos los elementos clickeables
- ✅ Focus states para navegación por teclado
- ✅ Active states en navegación actual
- ✅ Badges de notificaciones
- ✅ Status indicators (Active/Scheduled)

### Accesibilidad
- ✅ Navegación por teclado (Tab)
- ✅ Labels visibles en todos los inputs
- ✅ Contraste de color 4.5:1 mínimo
- ✅ Áreas de click grandes (44px mín)
- ✅ Estructura semántica HTML

### Responsive
- ✅ Mobile first approach
- ✅ Breakpoints: sm (640px), md (768px), lg (1024px)
- ✅ Grid adaptable (1/2/3 columnas)
- ✅ Sidebar colapsable (futuro)

---

## 📊 Mapa de Navegación Completo

```
                        Landing (/)
                            │
                ┌───────────┴───────────┐
                │                       │
            /login                  /register
                │                       │
                └───────────┬───────────┘
                            │
                      /dashboard ←─────┐
                            │          │
                ┌───────────┼──────────┼──────────┐
                │           │          │          │
            /profile    /sessions  /groups   /settings
                │           │          │          │
                └───────────┴──────────┴──────────┘
                            │
                    Sidebar Navigation
                            │
                ┌───────────┴───────────┐
                │                       │
         /notifications          /room/:roomId
                │                       │
                │                   [Leave]
                │                       │
                └───────────┬───────────┘
                            │
                      /dashboard
                            │
                      [Sign Out]
                            │
                     Landing (/)
```

---

## ✅ Checklist de Pruebas

### Navegación Básica
- [ ] Landing → Login → Dashboard
- [ ] Landing → Register → Dashboard
- [ ] Dashboard → Profile → Dashboard
- [ ] Dashboard → Room → Dashboard
- [ ] Cualquier página → 404 → Dashboard

### Sidebar
- [ ] Todos los items clickeables
- [ ] Active state correcto
- [ ] Hover states funcionan
- [ ] Sign Out regresa a Landing

### Formularios
- [ ] Inputs tienen labels visibles
- [ ] Validación de campos requeridos
- [ ] Submit navega correctamente
- [ ] Checkboxes togglean

### Accesibilidad
- [ ] Tab navigation funciona
- [ ] Focus states visibles
- [ ] Enter activa botones
- [ ] Escape cierra modals (futuro)

### Responsive
- [ ] Mobile (< 768px) - Layout adaptado
- [ ] Tablet (768-1024px) - 2 columnas
- [ ] Desktop (> 1024px) - 3 columnas
- [ ] Sidebar visible en desktop

---

**Estado**: Sprint 0 - Todos los flujos implementados y navegables
**Última Actualización**: Mayo 2026
