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
    return `<path${attributes} data-state="${state}" data-name="${name}" role="button" tabindex="0" aria-label="${name}" aria-pressed="false">`;
  });
}
