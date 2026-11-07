/** Environment flags and constants shared by every module. */
export const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;

export const EMAIL = 'adrijonas16@gmail.com';

/** 3D model and liveries for the helmet viewer (served from /public). */
export const HELMET = {
  model: '/models/helmet.glb',
  textures: '/models/',
};
