import { describe, expect, it } from 'vitest';
import { ItemDataError } from '../data/loader';
import { renderFatalError } from './errorScreen';

describe('renderFatalError', () => {
  it('lists every data problem', () => {
    const root = document.createElement('div');
    renderFatalError(root, new ItemDataError('movies.json', ['a: bad', 'b: worse']));

    expect(root.querySelector('[role="alert"] h1')?.textContent).toBe('Pixel Town could not start');
    expect(root.textContent).toContain('movies.json');
    expect([...root.querySelectorAll('li')].map((li) => li.textContent)).toEqual([
      'a: bad',
      'b: worse',
    ]);
  });

  it('shows the message of any other error', () => {
    const root = document.createElement('div');
    renderFatalError(root, new Error('WebGL unavailable'));
    expect(root.textContent).toContain('WebGL unavailable');
  });
});
