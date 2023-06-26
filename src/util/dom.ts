export function createElement(
  type: string,
  target: HTMLElement | null = null
): HTMLElement {
  const element = document.createElement(type);
  if (target) {
    target.appendChild(element);
  }
  return element;
}

export function styleElement(
  el: HTMLElement,
  styles: Record<keyof CSSStyleDeclaration, string>
): void {
  for (let key in styles) {
    el.style[key] = styles[key];
  }
}

export function createStylesheet(styles: string): void {
  const style = document.createElement('style');
  style.innerText = styles;
  document.head.appendChild(style);
}
