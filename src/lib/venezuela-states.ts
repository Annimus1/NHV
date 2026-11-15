export const STATE_SLUGS = [
  "amazonas",
  "anzoategui",
  "apure",
  "aragua",
  "barinas",
  "bolivar",
  "carabobo",
  "cojedes",
  "delta-amacuro",
  "distrito-capital",
  "falcon",
  "guarico",
  "la-guaira",
  "lara",
  "merida",
  "miranda",
  "monagas",
  "nueva-esparta",
  "portuguesa",
  "sucre",
  "tachira",
  "trujillo",
  "yaracuy",
  "zulia",
  "dependencias-federales",
] as const;

export type StateSlug = (typeof STATE_SLUGS)[number];

export const STATE_NAMES: Record<StateSlug, string> = {
  amazonas: "Amazonas",
  anzoategui: "Anzoátegui",
  apure: "Apure",
  aragua: "Aragua",
  barinas: "Barinas",
  bolivar: "Bolívar",
  carabobo: "Carabobo",
  cojedes: "Cojedes",
  "delta-amacuro": "Delta Amacuro",
  "distrito-capital": "Distrito Capital",
  falcon: "Falcón",
  guarico: "Guárico",
  "la-guaira": "La Guaira",
  lara: "Lara",
  merida: "Mérida",
  miranda: "Miranda",
  monagas: "Monagas",
  "nueva-esparta": "Nueva Esparta",
  portuguesa: "Portuguesa",
  sucre: "Sucre",
  tachira: "Táchira",
  trujillo: "Trujillo",
  yaracuy: "Yaracuy",
  zulia: "Zulia",
  "dependencias-federales": "Dependencias Federales",
};

export function isStateSlug(value: string): value is StateSlug {
  return (STATE_SLUGS as readonly string[]).includes(value);
}

export function getStateName(slug: StateSlug): string {
  return STATE_NAMES[slug];
}
