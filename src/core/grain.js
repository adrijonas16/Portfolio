/** Film grain: one 128px noise tile drawn once and used as a fixed background (cheap to composite). */
export function initGrain() {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    document.documentElement.style.setProperty('--grain', `url(${canvas.toDataURL()})`);
  } catch {
    /* no canvas: no grain */
  }
}
