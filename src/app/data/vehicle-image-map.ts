// Mapa heurístico de veículos -> caminhos de assets locais
// Apenas entradas com correspondência razoavelmente confiável foram adicionadas.
const VEHICLE_IMAGE_MAP: { [name: string]: string } = {
  'TIE/LN starfighter': 'assets/naves/TIE-Fighter-2-model-TIE-lnjpg.webp',
  'TIE bomber': 'assets/naves/TIE-Fighter-2-model-TIE-lnjpg.webp',
  'Sail barge': 'assets/naves/Solar-Sailer.webp',
  'Bantha-II cargo skiff': 'assets/naves/Naboo-star-skiff.webp',
  'TIE/IN interceptor': 'assets/naves/TIE-Fighter-2-model-TIE-lnjpg.webp',
  'Vulture Droid': 'assets/naves/Droid-control-ship.webp',
  'Multi-Troop Transport': 'assets/naves/Rebel-transport.webp',
  'Armored Assault Tank': 'assets/naves/Republic-Assault-ship.webp',
  'C-9979 landing craft': 'assets/naves/Sentinel-class-landing-craft.webp',
  'Neimoidian shuttle': 'assets/naves/Imperial-shuttle.webp',
  'Geonosian starfighter': 'assets/naves/Belbullab-22-starfighter.webp',
  'Droid tri-fighter': 'assets/naves/Droid-control-ship.webp',
  'Corporate Alliance tank droid': 'assets/naves/Droid-control-ship.webp',
  'Droid gunship': 'assets/naves/Droid-control-ship.webp',
  'Sith speeder': 'assets/naves/scimitar.webp',
};

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const VEHICLE_IMAGE_MAP_LOWER: { [k: string]: string } = {};
const VEHICLE_IMAGE_MAP_SLUG: { [k: string]: string } = {};
Object.keys(VEHICLE_IMAGE_MAP).forEach((k) => {
  VEHICLE_IMAGE_MAP_LOWER[k.toLowerCase()] = VEHICLE_IMAGE_MAP[k];
  VEHICLE_IMAGE_MAP_SLUG[slug(k)] = VEHICLE_IMAGE_MAP[k];
});

export function getVehicleImage(name?: string): string | undefined {
  if (!name) return undefined;
  if (VEHICLE_IMAGE_MAP[name]) return VEHICLE_IMAGE_MAP[name];
  const low = name.toLowerCase();
  if (VEHICLE_IMAGE_MAP_LOWER[low]) return VEHICLE_IMAGE_MAP_LOWER[low];
  const s = slug(name);
  if (VEHICLE_IMAGE_MAP_SLUG[s]) return VEHICLE_IMAGE_MAP_SLUG[s];
  return undefined;
}

export { VEHICLE_IMAGE_MAP };
