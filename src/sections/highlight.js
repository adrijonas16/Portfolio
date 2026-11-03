/** A deliberately small syntax highlighter for the hero editor (C#, TSX and a terminal). */

const KEYWORDS =
  /^(public|private|readonly|class|async|await|return|const|export|function|if|new|var|using|interface)$/;
const FUNCTIONS = /^(get|map|ListarAsync|Ok|useQuery|Listar|Proyectos)$/;
const TOKEN =
  /("[^"]*"?|'[^']*'?|`[^`]*`?|\/\/.*$|\[[A-Z][A-Za-z]*(?=[\](])|[A-Za-z_]\w*|=>|<\/?[A-Z]\w*|[{}()[\]<>;.,=:?&|!+-]|\s+|.)/g;

export const escapeHtml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Returns one line of code as HTML with <span class="t-*"> tokens. */
export function highlight(line, isTerminal = false) {
  if (isTerminal) {
    if (line.startsWith('$')) return `<span class="t-p">$</span>${escapeHtml(line.slice(1))}`;
    if (/^(200|✓)/.test(line)) return `<span class="t-ok">${escapeHtml(line)}</span>`;
    return `<span class="t-c">${escapeHtml(line)}</span>`;
  }
  return line.replace(TOKEN, (t) => {
    if (/^["'`]/.test(t)) return `<span class="t-s">${escapeHtml(t)}</span>`;
    if (t.startsWith('//')) return `<span class="t-c">${escapeHtml(t)}</span>`;
    if (/^\[[A-Z]/.test(t)) return `[<span class="t-a">${escapeHtml(t.slice(1))}</span>`;
    if (/^<\/?[A-Z]/.test(t)) {
      const open = t.match(/^<\/?/)[0];
      return `${escapeHtml(open)}<span class="t-t">${escapeHtml(t.slice(open.length))}</span>`;
    }
    if (KEYWORDS.test(t)) return `<span class="t-k">${t}</span>`;
    if (/^[A-Z]\w*$/.test(t)) return `<span class="t-t">${t}</span>`;
    if (FUNCTIONS.test(t)) return `<span class="t-f">${t}</span>`;
    if (t === '=>') return '<span class="t-k">=&gt;</span>';
    return escapeHtml(t);
  });
}
