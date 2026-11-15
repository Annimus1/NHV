import { isStateSlug } from "./venezuela-states";

const COMBINING_MARKS = /[\u0300-\u036f]/g;

export function slugifyStateName(name: string): string {
  return name
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

export function addStateMetadata(svg: string): string {
  return svg.replace(/<path\b([^>]*)>/g, (match, attributes: string) => {
    const name = /name="([^"]+)"/.exec(attributes)?.[1];
    if (!name) return match;

    const state = slugifyStateName(name);
    if (!isStateSlug(state)) {
      console.warn(
        `[venezuela-map] Unknown state slug "${state}" for "${name}". ` +
          "Update src/lib/venezuela-states.ts to match the SVG.",
      );
    }

    return `<path${attributes} data-state="${state}" data-name="${name}" role="button" tabindex="0" aria-label="${name}" aria-pressed="false">`;
  });
}
