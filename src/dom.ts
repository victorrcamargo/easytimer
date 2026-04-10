export function requireElement<T extends Element>(selector: string): T {
    const el = document.querySelector<T>(selector);
    if (!el) throw new Error(`Element ${selector} not found`);
    return el;
}
