/** Environment flags and constants shared by every module. */
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;

export const EMAIL = 'adrijonas16@gmail.com';

/** Desktop breakpoint where the projects gallery scrolls horizontally. */
export const DESKTOP_QUERY = '(min-width: 901px)';

/** 3D model and liveries for the helmet viewer (served from /public). */
export const HELMET = {
  model: '/models/helmet.glb',
  textures: '/models/',
};
