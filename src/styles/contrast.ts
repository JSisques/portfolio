/**
 * WCAG 2.x relative luminance and contrast ratio.
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */

export function hexToRgb(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  const captured = match?.[1];
  if (captured === undefined) {
    throw new Error(`Expected a 6-digit hex color, got: ${hex}`);
  }
  const value = Number.parseInt(captured, 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  const linearize = (channel: number): number => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(hexA: string, hexB: string): number {
  const luminanceA = relativeLuminance(hexA);
  const luminanceB = relativeLuminance(hexB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);
  return (lighter + 0.05) / (darker + 0.05);
}
