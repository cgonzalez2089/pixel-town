type Child = Node | string | null | undefined | false;

/**
 * Creates an element with attributes and children. Strings become text
 * nodes, so data from JSON is never parsed as HTML.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  for (const child of children) {
    if (child) element.append(child);
  }
  return element;
}

export function getElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id} element in index.html`);
  return element;
}
