# Adriana Chipana — Portafolio

Portafolio personal: proyectos independientes, juegos, modelado 3D y experiencia profesional.
En vivo: https://adriana-chipana.vercel.app

Hecho con **Vite**, **GSAP** (ScrollTrigger + SplitText), **Lenis** y **three.js**, sin framework de UI.

## Comandos

```bash
npm install
npm run dev            # servidor local con recarga en caliente
npm run build          # build de producción → dist/
npm run preview        # sirve el build
npm run lint           # ESLint
npm run format         # Prettier
npm test               # reglas del 4 en raya + prueba de humo en Chromium (requiere npm run build)
```

La primera vez en una máquina nueva: `npx playwright install chromium`.

## Arquitectura

```
index.html                 Solo marcado (todas las secciones)
public/
  img/                     Capturas de proyectos (webp)
  models/                  helmet.glb y texturas de los acabados
src/
  main.js                  Orden de arranque: chrome → secciones → loader → entrada del hero
  config.js                Flags (reduced motion, táctil), correo, rutas de assets
  data/                    Contenido, no código
    projects.js            Proyectos independientes (agregar uno = agregar un objeto)
    editor-files.js        Lo que escribe el editor del hero
  core/                    Piezas transversales
    scroll.js              Lenis + GSAP sincronizados, anclas, arranque arriba
    loader.js              Barra "Compilando" que espera imágenes y fuentes
    chrome.js              Nav, marquee de tecnologías, títulos que se revelan
    cursor.js              Cursor propio y botones magnéticos
    grain.js               Grano de película (una textura de 128 px)
    dom.js                 $ y $$
  games/
    connect4.js            Reglas puras del 4 en raya (sin DOM, con tests)
  sections/                Un módulo por sección: render + animaciones
    hero.js, highlight.js  Cuadrícula de puntos + editor que escribe C#, TSX y terminal
    projects.js            Paneles, galerías y scroll horizontal
    bonk.js                Escenario fijo de Bonk de los Dioses
    raya.js                Interfaz del 4 en raya
    viewer3d.js            Casco 3D (three.js en un chunk aparte, carga perezosa)
    experience.js          Experiencia y diagramas (N capas, chatbot, integraciones)
    about.js, contact.js
  styles/
    tokens.css             Colores, easing y espaciado
    base.css               Reset, tipografía, foco, reduced motion
    sections/*.css         Un archivo por sección
tests/
  connect4.test.mjs        node:test sobre las reglas del juego
  smoke.mjs                Playwright: carga, proyectos, editor, juego, 3D y secciones
```

### Decisiones

- **Contenido separado de la lógica.** Los proyectos viven en `src/data/projects.js`; las secciones solo los pintan.
- **Rendimiento.** three.js (~690 kB) es un chunk aparte que se descarga solo al acercarse a la sección 3D.
  Los bucles de animación (cuadrícula, editor, visor 3D) se pausan cuando no están en pantalla, y las
  imágenes de las galerías cargan en diferido.
- **Accesibilidad.** Con `prefers-reduced-motion` no hay scroll suave ni animaciones; foco visible;
  el juego se puede jugar con teclado.
- **Despliegue.** Vercel construye con `npm run build` y sirve `dist/` (ver `vercel.json`).
