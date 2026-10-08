import { ItemDataError } from '../data/loader';
import { h } from './dom';

/** Replaces the page content with a readable explanation of a startup failure. */
export function renderFatalError(root: HTMLElement, error: unknown): void {
  const details =
    error instanceof ItemDataError
      ? h(
          'div',
          {},
          h('p', {}, `The data in ${error.source} has problems:`),
          h('ul', {}, ...error.problems.map((problem) => h('li', {}, h('code', {}, problem)))),
        )
      : h('p', {}, error instanceof Error ? error.message : String(error));

  root.replaceChildren(
    h(
      'section',
      { class: 'fatal-error', role: 'alert' },
      h('h1', {}, 'Pixel Town could not start'),
      details,
    ),
  );
}
