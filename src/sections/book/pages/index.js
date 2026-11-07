/**
 * Builds the leaves (sheets with a front and a back) of the projects book.
 *
 *   leaf 0      front: cover             back: intro (inside cover)
 *   leaf 1      front: table of contents back: opening page of project 0
 *   leaf p + 2  front: details of p      back: opening page of p + 1 (or the last page)
 *
 * So every spread from 2 on is one project: opening page on the left, details on the right.
 */
import { cover } from './cover.js';
import { intro, contents, lastPage } from './front-matter.js';
import { projectOpening, projectDetails } from './project.js';

/** First spread that holds a project (0 = closed cover, 1 = intro + contents). */
export const FIRST_PROJECT_SPREAD = 2;

export function buildLeaves(projects) {
  return [
    { front: cover(), back: intro() },
    { front: contents(projects), back: projectOpening(projects[0], 0) },
    ...projects.map((p, i) => ({
      front: projectDetails(p, i),
      back: i + 1 < projects.length ? projectOpening(projects[i + 1], i + 1) : lastPage(),
    })),
  ];
}
