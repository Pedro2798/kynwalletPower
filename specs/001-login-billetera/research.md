# Research: Pantalla de Inicio de Sesión de KynWallet

**Feature**: `001-login-billetera` | **Date**: 2026-10-14

Todas las incógnitas del Technical Context quedan resueltas aquí.

## R1. Stack base

- **Decision**: React 19 + TypeScript 5.x (modo `strict`) + Vite 8, Node.js ≥ 20 LTS
  (en la implementación se usó Vite 8 en lugar de 7 por compatibilidad con `@vitejs/plugin-react`).
- **Rationale**: stack solicitado por el usuario; Vite ofrece arranque y build rápidos sin
  configuración adicional; TypeScript estricto refuerza contratos entre capas (Principio III).
- **Alternatives considered**: Next.js (SSR/rutas innecesarias para una sola pantalla, viola
  YAGNI); Create React App (sin mantenimiento activo, incumple 7.1.b).

## R2. Estilos y tokens de diseño

- **Decision**: CSS Modules por componente + un archivo global de tokens como CSS custom
  properties, con los nombres de las variables de Figma (`--neutral-0`, `--neutral-900`,
  `--brand-500`, `--brand-600`, etc.). Tipografía Inter autoalojada con `@fontsource-variable/inter`.
- **Rationale**: cero dependencias de runtime; los tokens replican 1:1 las variables de Figma
  (fuente única, DRY); Inter local evita peticiones a terceros.
- **Alternatives considered**: Tailwind (el MCP de Figma lo genera por defecto, pero añade
  dependencia y configuración no requeridas); CSS-in-JS (costo de runtime innecesario).

**Tokens extraídos de Figma (`get_variable_defs`, nodo 2:2)**:

| Token Figma | Valor | Uso en diseño |
|---|---|---|
| neutral/0 | `#ffffff` | Fondo panel formulario, inputs |
| neutral/300 | `#d7d9e6` | Bordes de inputs, divisor |
| neutral/400 | `#a9abc2` | Placeholder |
| neutral/500 | `#8a8ca8` | Subtítulo, "o continúa con", "¿No tienes cuenta?" |
| neutral/700 | `#3d3f5c` | Etiquetas |
| neutral/900 | `#16182c` | Título, texto botones sociales |
| brand/500 | `#ff6b3d` | Fondo botón "Iniciar sesión" |
| brand/600 | `#ef5226` | Enlaces "¿Olvidaste…?", "Regístrate" |

Valores sin variable (de `get_design_context`): degradado del panel de marca
`linear-gradient(121.19deg, #ff8a65 0%, #ef5226 70.71%)`; tarjeta `rgba(255,255,255,.16)` con borde
`rgba(255,255,255,.35)`, radio 22px; chip `rgba(255,217,128,.9)`; radios de input/botón 12px;
alto de input/botón 52px, sociales 48px; gap del formulario 22px; ancho del formulario 400px;
panel de marca 620px con padding 64/56px. Tipografía: título 30px Bold, titular 44px Bold
(line-height 1.08), cuerpo 16–17px Regular, etiquetas 14px Medium, botón 16px SemiBold.

## R3. Contraste de color frente a WCAG 2.1 AA (Constitución 8.4)

Medición de contraste sobre blanco de los tokens del diseño:

| Uso | Colores | Ratio | Requisito | Resultado |
|---|---|---|---|---|
| Texto botón principal | blanco / brand-500 | 2.83:1 | 4.5:1 | ❌ |
| Enlaces 14px | brand-600 / blanco | 3.56:1 | 4.5:1 | ❌ |
| Textos secundarios | neutral-500 / blanco | 3.28:1 | 4.5:1 | ❌ |
| Placeholder | neutral-400 / blanco | 2.26:1 | 4.5:1 (recomendado) | ❌ |
| Borde de input | neutral-300 / blanco | 1.40:1 | 3:1 (1.4.11) | ❌ |
| Etiquetas | neutral-700 / blanco | 10.17:1 | 4.5:1 | ✅ |

- **Decision**: conservar los tokens de Figma y añadir tokens accesibles derivados, usados solo
  donde el original no cumple: `--brand-700: #d04721` (4.56:1, botón y enlaces),
  `--neutral-600: #73748b` (4.57:1, textos secundarios y placeholder),
  `--neutral-border: #92949c` (3.03:1, bordes de controles). El matiz de los colores se mantiene;
  solo se oscurecen.
- **Rationale**: la Constitución exige AA como OBLIGATORIO (8.4) y la desviación del sistema de
  diseño requiere aprobación (8.6); ajustar la luminosidad es el menor cambio visual que cumple.
- **Alternatives considered**: reproducir los colores exactos (incumple 8.4 y SC-005); texto
  oscuro sobre el naranja (cambia más la identidad visual).
- **Pending**: aprobación del responsable de diseño (registrado en Complexity Tracking del plan).

## R4. Origen de las cuentas de demostración

- **Conflicto**: el usuario pidió "usuarios ficticios predefinidos en el código"; la Constitución
  5.3 y FR-011 prohíben credenciales en el código fuente y en archivos versionados.
- **Decision**: las cuentas se leen de la variable `VITE_DEMO_USERS` (JSON) definida en
  `.env.local`, archivo no versionado. Se versiona `.env.example` con valores de ejemplo
  marcados como tales. Un adaptador de infraestructura valida y convierte esa configuración;
  si falta o es inválida, la pantalla muestra "Servicio de acceso no disponible…" (caso límite de
  la spec).
- **Rationale**: cumple 5.3 sin backend; el dominio recibe las cuentas por inyección
  (`AuthGateway`), así que cambiar el origen afecta un único archivo.
- **Nota de transparencia**: en una aplicación solo-cliente, cualquier valor `VITE_*` queda
  visible en el bundle generado. Es aceptable porque son cuentas ficticias sin acceso real, y se
  documenta en el quickstart.
- **Alternatives considered**: arreglo en el código (incumple 5.3, solo viable con una excepción
  aprobada según 9.1); hash de contraseñas en el código (sigue siendo material de credenciales
  versionado y añade complejidad).
- **Datos de prueba**: las pruebas usan cuentas ficticias construidas en los propios tests y
  pasadas por inyección; no corresponden a ningún sistema real.

## R5. Simulación de autenticación

- **Decision**: `InMemoryAuthGateway` implementa el puerto `AuthGateway`; compara el correo
  normalizado (trim + minúsculas) y la contraseña exacta, y responde tras una espera de 1000 ms
  configurable. La espera se inyecta para que las pruebas la controlen con temporizadores
  falsos.
- **Rationale**: cumple FR-007/FR-008 y mantiene las pruebas deterministas.
- **Alternatives considered**: MSW simulando una API (simula una red que el alcance excluye,
  viola YAGNI).

## R6. Gestión de estado del formulario

- **Decision**: hook propio `useLoginForm` sobre `useReducer` con una máquina de estados
  explícita (`idle → submitting → success | failure | unavailable`) y errores por campo. Las
  validaciones son funciones puras del dominio.
- **Rationale**: dos campos no justifican una librería (KISS/YAGNI); un reducer puro es fácil de
  probar.
- **Alternatives considered**: React Hook Form + Zod (dependencias innecesarias para dos campos).

## R7. Validación de correo

- **Decision**: correo normalizado no vacío, ≤ 254 caracteres, que cumpla
  `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$`. Contraseña sin recortar, longitud 8–128.
- **Rationale**: cubre los casos de la spec ("usuario@", "usuario.com") sin la complejidad de
  RFC 5322 completo.

## R8. Pruebas y calidad

- **Decision**: Vitest 5 + React Testing Library + `@testing-library/user-event` + `jsdom`;
  `axe-core` con un helper propio (`vitest-axe` se descartó por falta de mantenimiento, 7.1.b)
  para comprobar accesibilidad en las pruebas de componentes; cobertura con
  `@vitest/coverage-v8` y umbral del 80 % en líneas y ramas. ESLint 9 (flat config) con
  `typescript-eslint`, `eslint-plugin-react-hooks` y `eslint-plugin-jsx-a11y`; Prettier.
- **Rationale**: Vitest comparte la configuración de Vite; RTL prueba comportamiento observable
  por el usuario (Given/When/Then de la spec).
- **Alternatives considered**: Jest (requiere transformaciones extra con Vite); Playwright E2E (el
  usuario pidió "pruebas básicas"; se pospone, YAGNI).

## R9. Controles de cumplimiento (Constitución 9.4)

- **Decision**: scripts npm `lint`, `typecheck`, `test`, `test:coverage`, `build`,
  `audit:deps` (`npm audit --audit-level=high`), `audit:licenses`
  (`license-checker-rseidelsohn` con lista de licencias permitidas: MIT, ISC, BSD-2-Clause,
  BSD-3-Clause, Apache-2.0, 0BSD, OFL-1.1, CC0-1.0, BlueOak-1.0.0) y `scan:secrets`
  (`secretlint`). Un script `verify` los ejecuta todos en secuencia.
- **Rationale**: hace verificables localmente los controles obligatorios mientras no exista
  pipeline de CI.
- **Note**: el directorio no es todavía un repositorio git; las reglas de revisión (9.3)
  requieren inicializarlo antes de integrar cambios.

## R10. Diseño responsivo

- **Decision**: primero móvil, con dos puntos de corte. Por debajo de 960px el panel de marca se
  reduce a una cabecera con el logo (se ocultan el titular y la tarjeta) y el formulario ocupa el
  ancho disponible (máx. 400px). Por debajo de 480px se aplica padding lateral de 16px. Desde
  960px se usa la distribución del diseño en dos columnas (marca 620px fija para ≥ 1280px y 43 %
  entre 960 y 1280px).
- **Rationale**: cumple FR-018 (320px sin scroll horizontal) y conserva el logo visible.

## R11. Recursos gráficos

- **Decision**: descargar en la implementación los SVG del diseño (logo, icono de visibilidad,
  iconos sociales) con las URL que devuelve `get_design_context` y guardarlos en `src/assets/`.
  Las URL temporales caducan a los 7 días: si caducaron, se vuelve a ejecutar
  `get_design_context` sobre el nodo `2:2`.
- **Note**: en Figma los iconos de Google, Apple y del control de visibilidad son elipses de
  marcador de posición; se reproducen tal cual, sin sustituirlos por logotipos de marca.
