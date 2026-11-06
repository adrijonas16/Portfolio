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
index.html                 Solo el <head> y el orden de las secciones (~40 líneas)
plugins/
  html-partials.js         Une los parciales en el build: <!-- @include partials/hero.html -->
public/
  img/                     Capturas de proyectos (webp)
  models/                  helmet.glb y texturas de los acabados
  favicon.svg
src/
  main.js                  Orden de arranque: chrome → secciones → loader → entrada del hero
  config.js                Flags (reduced motion, táctil), correo, rutas de assets
  partials/                Marcado HTML, un archivo por sección
    hero.html, projects.html, bonk.html, raya.html, model3d.html, about.html, contact.html…
    experience/            Un archivo por empleo + path.html (formación)
  data/                    Contenido que se pinta con JS
    projects.js            Proyectos independientes (agregar uno = agregar un objeto)
    editor-files.js        Lo que escribe el editor del hero
  core/                    Piezas transversales: scroll, loader, cursor, nav, grano
  games/connect4.js        Reglas puras del 4 en raya (sin DOM, con tests)
  sections/                Un módulo JS por sección: comportamiento y animaciones
  styles/
    tokens.css             Colores, easing y espaciado
    base.css               Reset, tipografía, foco, skip link, reduced motion
    sections/*.css         Un archivo por sección
tests/
  connect4.test.mjs        Reglas del juego
  html-partials.test.mjs   Includes: anidados, inexistentes, circulares, fuera de la carpeta
  smoke.mjs                Playwright: carga, proyectos, editor, juego, 3D, formación y secciones
```

Cada sección tiene sus tres piezas con el mismo nombre: `partials/x.html` (marcado), `styles/sections/x.css`
(estilos) y `sections/x.js` (comportamiento).

### Decisiones

- **HTML por partes sin JavaScript.** Los parciales se unen al construir, así que el sitio sigue siendo un
  HTML estático completo (lo leen buscadores y funciona sin JS); no hay estilos en línea.
- **Contenido separado de la lógica.** Los proyectos viven en `src/data/projects.js`; las secciones solo los pintan.
- **Rendimiento.** three.js (~690 kB) es un chunk aparte que se descarga solo al acercarse a la sección 3D.
  Los bucles de animación (cuadrícula, editor, visor 3D) se pausan cuando no están en pantalla, y las
  imágenes de las galerías cargan en diferido.
- **Accesibilidad.** Con `prefers-reduced-motion` no hay scroll suave ni animaciones; foco visible;
  el juego se puede jugar con teclado.
- **Despliegue.** Vercel construye con `npm run build` y sirve `dist/` (ver `vercel.json`).
