import { ScrollTrigger, lenis } from '../../core/scroll.js';
import { $, $$ } from '../../core/dom.js';
import { JOBS } from '../../data/experience.js';
import { jobRows, rootRow, showHead } from './templates.js';
import { drawGraph, jobColor } from './graph.js';
import { initHub, playDetail } from './diagrams.js';

/**
 * Experience as a git log: every job is a branch with its commits. Choosing a branch shows
 * its `git show` on the right: what I did there, with a diagram for the bigger jobs.
 *   templates.js  rows of the log and the git show header
 *   graph.js      the branch lines drawn next to the rows
 *   diagrams.js   architecture, chatbot and integrations diagrams
 */
export function initExperience() {
  const rowsEl = $('#gitRows');
  const svg = $('#gitGraph');
  rowsEl.innerHTML = JOBS.map(jobRows).join('') + rootRow();
  JOBS.forEach((job, j) =>
    $$(`[data-job="${job.id}"]`, rowsEl).forEach((r) => r.style.setProperty('--c', jobColor(j))),
  );

  const tips = $$('.git-tip', rowsEl);
  const bodies = Object.fromEntries($$('.gs-body').map((b) => [b.dataset.job, b]));
  const head = $('#gsHead');
  let current = -1;

  const select = (i, { focus = false, reveal = false } = {}) => {
    if (i === current) return;
    current = i;
    const job = JOBS[i];
    tips.forEach((t, k) => {
      t.setAttribute('aria-selected', k === i);
      t.tabIndex = k === i ? 0 : -1;
    });
    $$('.git-row', rowsEl).forEach((r) => r.classList.toggle('is-sel', r.dataset.job === job.id));
    $$('.git-lane', svg).forEach((g) => g.classList.toggle('is-sel', g.dataset.job === job.id));
    Object.values(bodies).forEach((b) => (b.hidden = b !== bodies[job.id]));
    head.innerHTML = showHead(job);
    if (focus) tips[i].focus();
    playDetail(bodies[job.id]);
    // on phones the detail sits under the log: bring it into view
    if (reveal && matchMedia('(max-width: 900px)').matches) {
      const target = $('#gitShow');
      if (lenis) lenis.scrollTo(target, { offset: -80 });
      else target.scrollIntoView();
    }
  };

  rowsEl.addEventListener('click', (e) => {
    const row = e.target.closest('[data-job]');
    if (row)
      select(
        JOBS.findIndex((j) => j.id === row.dataset.job),
        { reveal: true },
      );
  });
  rowsEl.addEventListener('keydown', (e) => {
    const step = { ArrowDown: 1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    select((current + step + JOBS.length) % JOBS.length, { focus: true });
  });

  const redraw = () => {
    drawGraph(svg, rowsEl, JOBS);
    if (current >= 0)
      $$('.git-lane', svg).forEach((g) => g.classList.toggle('is-sel', g.dataset.job === JOBS[current].id));
  };
  new ResizeObserver(redraw).observe(rowsEl);
  document.fonts?.ready.then(redraw);

  initHub();
  current = -1;
  select(0);
  // replay the first job's animation when the section actually comes into view
  ScrollTrigger.create({
    trigger: '.git',
    start: 'top 70%',
    once: true,
    onEnter: () => playDetail(bodies[JOBS[0].id]),
  });
}
