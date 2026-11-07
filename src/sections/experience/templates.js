/** Rows of the git log and the header of `git show` for each job. */

/** Short, stable pseudo commit hash for a label. */
export function hash(label) {
  let h = 0x811c9dc5;
  for (const ch of label) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
  return h.toString(16).padStart(8, '0').slice(0, 7);
}

const commitRow = (job, [type, msg], k) =>
  `<div class="git-row git-commit" data-job="${job.id}" data-lane="${job.lane}">
    <span class="git-hash">${hash(`${job.id}${k}`)}</span>
    <span class="git-msg"><b class="t-${type}">${type}:</b> ${msg}</span>
  </div>`;

/** A job: (merge into main) + branch tip + its commits. */
export function jobRows(job, i) {
  const merge = job.current
    ? ''
    : `<div class="git-row git-merge" data-job="${job.id}" data-lane="0">
        <span class="git-hash">${hash(`merge${job.id}`)}</span>
        <span class="git-msg">Merge branch '${job.branch}'</span>
      </div>`;
  const refs = `${job.current ? '<span class="ref head">HEAD →</span>' : ''}<span class="ref br">${job.branch}</span>`;
  return `${merge}<button class="git-row git-tip" role="tab" id="git-${job.id}" data-job="${job.id}" data-lane="${job.lane}"
      aria-controls="gitShow" aria-selected="${!i}" tabindex="${i ? -1 : 0}">
      <span class="git-hash">${hash(job.id)}</span>
      <span class="git-refs">${refs}</span>
      <span class="git-msg"><b>${job.company}</b> · ${job.role}</span>
      <span class="git-date">${job.period}</span>
    </button>${job.commits.map((c, k) => commitRow(job, c, k)).join('')}`;
}

export function rootRow() {
  return `<div class="git-row git-root" data-lane="0">
    <span class="git-hash">${hash('root')}</span>
    <span class="git-refs"><span class="ref main">main</span></span>
    <span class="git-msg"><b class="t-chore">init:</b> primeras líneas de código en CIBERTEC</span>
  </div>`;
}

export function showHead(job) {
  return `<p class="gs-commit">commit <b>${hash(job.id)}</b> <span>(${job.current ? 'HEAD → ' : ''}${job.branch})</span></p>
    <dl class="gs-meta">
      <div><dt>Empresa</dt><dd>${job.company}</dd></div>
      <div><dt>Rol</dt><dd>${job.role}</dd></div>
      <div><dt>Fecha</dt><dd>${job.period}</dd></div>
    </dl>`;
}
