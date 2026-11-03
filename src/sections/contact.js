import { EMAIL } from '../config.js';
import { $ } from '../core/dom.js';

/** Contact: copy the email address (with a fallback message when the clipboard is unavailable). */
export function initContact() {
  const note = $('#copyNote');
  $('#copyBtn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      note.textContent = 'Correo copiado';
    } catch {
      note.textContent = 'Selecciona el correo de arriba para copiarlo';
    }
  });
}
