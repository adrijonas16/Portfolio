/**
 * Draws the branch graph next to the log rows: `main` runs down the first lane, every job
 * forks off main below its first commit and merges back above its tip (the current job stays open).
 */
export const LANE_COLORS = ['#9d9a94', '#b79cff', '#7fae5e', '#e0405a', '#5b8de0', '#e7c35a', '#4fc1b0'];
const LANE_X = (lane) => 16 + lane * 20;

/** Colour of the j-th job's branch (lane colour 0 is reserved for main). */
export const jobColor = (j) => LANE_COLORS[(j % (LANE_COLORS.length - 1)) + 1];

export function drawGraph(svg, rowsEl, jobs) {
  const rows = [...rowsEl.children];
  const box = rowsEl.getBoundingClientRect();
  // dots sit on the first line of each row, even when the row wraps
  const y = (row) => row.getBoundingClientRect().top - box.top + Math.min(row.offsetHeight / 2, 17);
  const height = rowsEl.scrollHeight;
  svg.setAttribute('viewBox', `0 0 90 ${height}`);
  svg.style.height = `${height}px`;

  const parts = [];
  const x0 = LANE_X(0);
  parts.push(`<line x1="${x0}" y1="${y(rows[0])}" x2="${x0}" y2="${y(rows.at(-1))}" stroke="${LANE_COLORS[0]}"/>`);

  jobs.forEach((job, j) => {
    const own = rows.filter((r) => r.dataset.job === job.id && !r.classList.contains('git-merge'));
    const merge = rows.find((r) => r.dataset.job === job.id && r.classList.contains('git-merge'));
    const color = jobColor(j);
    const x = LANE_X(job.lane);
    const top = y(own[0]);
    const bottom = y(own.at(-1));
    const fork = bottom + own.at(-1).offsetHeight;
    parts.push(`<g class="git-lane" data-job="${job.id}" stroke="${color}" fill="${color}">`);
    parts.push(`<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}"/>`);
    parts.push(`<path d="M${x} ${bottom} C${x} ${fork - 6} ${x0} ${bottom + 8} ${x0} ${fork}" fill="none"/>`);
    if (merge) {
      const m = y(merge);
      parts.push(`<path d="M${x} ${top} C${x} ${m + 6} ${x0} ${top - 6} ${x0} ${m}" fill="none"/>`);
    }
    own.forEach((r, k) => parts.push(`<circle cx="${x}" cy="${y(r)}" r="${k ? 3.5 : 5.5}"/>`));
    parts.push('</g>');
    if (merge)
      parts.push(`<circle class="git-merge-dot" cx="${x0}" cy="${y(merge)}" r="4.5" fill="${LANE_COLORS[0]}"/>`);
  });
  parts.push(`<circle cx="${x0}" cy="${y(rows.at(-1))}" r="5.5" fill="${LANE_COLORS[0]}"/>`);
  svg.innerHTML = parts.join('');
}
