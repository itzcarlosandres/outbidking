# 🏆 puja.lol — Plataforma de ranking con pujas en vivo (Full-Stack)

Plataforma web donde usuarios publican sus productos (webs, apps, canales de YouTube, SaaS) en un directorio público rankeado, y compiten en pujas en tiempo real para escalar posiciones. Inspirado en outbid.lol, 100% en español.

---

## 🛠 Stack Tecnológico

- **Framework**: Next.js 14+ (App Router, Server Components, TypeScript estricto)
- **Base de datos**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js v5 (Google + GitHub OAuth + Acceso Rápido Demo)
- **Tiempo Real**: Pusher (Channels) para emisión y recepción de eventos `bid:new`
- **Estilos**: Tailwind CSS + Shadcn design tokens
- **Animaciones**: Framer Motion (reordenamiento suave FLIP del ranking)
- **Validación**: Zod (schemas cliente/servidor)
- **Rate Limiting**: Upstash Redis (con fallback en memoria para desarrollo local)
- **Iconos**: Lucide React + Google Favicons API

---

## 🎨 Paleta de Diseño y Estética

- **Modo Claro**:
  - Fondo: `#FBF5EE` (crema cálido)
  - Cards: `#FFFFFF`, bordes `#EFE3D5`
  - Texto: `#241C15`, muted `#A2917F`
  - Acento: `#FF4A1C` (naranja quemado para CTAs, precios y badges)
  - Top 3 destacado: `#FFEEE4` con borde `#FFD2BC`
- **Modo Oscuro**:
  - Fondo: `#100D0B`, cards `#1A1512`, bordes `#2B231D`, acento `#FF5B2E`
- **Tipografía**: Inter con `tabular-nums` para precios consistentes y números en formato `es-ES` (`$17.005`).

---

## 💳 Sistema de Pagos (Modo Manual / Simulado)

Por el momento se ha configurado un **módulo de pago manual / simulado**:
1. Al publicar un sitio o realizar una puja, se valida la regla de negocio y se crea la transacción atómica en Prisma (`Payment` + `Site`/`Bid`).
2. Se emite inmediatamente el evento `bid:new` por Pusher para que todos los navegadores conectados vean cómo sube la fila con animación FLIP.
3. Para conectar una pasarela en el futuro (Stripe, MercadoPago, DLocal, Crypto), los endpoints en `/api/sites` y `/api/bids` pueden conectarse al checkout del proveedor deseado.

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio e instalar dependencias
```bash
pnpm install
```

### 2. Configurar variables de entorno
Crea un archivo `.env` basado en `.env.example`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pujalol?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu_clave_secreta_super_segura"

# Opcionales para OAuth real
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""

# Pusher para tiempo real en vivo
PUSHER_APP_ID="tu_app_id"
PUSHER_SECRET="tu_secret"
NEXT_PUBLIC_PUSHER_KEY="tu_key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
```

### 3. Sincronizar Base de Datos y Ejecutar Seed
```bash
# Sincronizar modelos con PostgreSQL
pnpm prisma db push

# Poblar con 20 proyectos realistas, pujas históricas y usuario admin
pnpm prisma db seed
```

### 4. Iniciar Servidor de Desarrollo
```bash
pnpm dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📋 Cuentas de Prueba Incluidas en el Seed

- **👑 Admin**: `admin@puja.lol` (rol `ADMIN` con acceso a `/admin`)
- **@sofidev**: `sofia@dev.co` (dueña del #1 *ChatNode AI*)
- **@cryptonico**: `nico@crypto.lat` (dueño de *CryptoSniper Pro*)
- **@luna_codes**: `luna@code.io` (dueña de *PromptLayer Studio*)
- O puedes escribir cualquier handle en el formulario de inicio de sesión para entrar al instante.
