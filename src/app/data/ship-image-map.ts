export const SHIP_IMAGE_MAP: { [key: string]: string } = {
  // Nomes da SWAPI mapeados para suas imagens
  'CR90 corvette': 'assets/naves/CR90-corvette.webp',
  'Star Destroyer': 'assets/naves/Star-Destroyer-10-model-Imperial-I.webp',
  'Sentinel-class landing craft':
    'assets/naves/Sentinel-class-landing-craft.webp',
  'Death Star': 'assets/naves/Death-Star.webp',
  'Millennium Falcon': 'assets/naves/Millennium-Falcon-3.webp',
  'Y-wing': 'assets/naves/Y-wing.webp',
  'X-wing': 'assets/naves/X-Wing-1-model-T-65.webp',
  'TIE Advanced x1': 'assets/naves/TIE-Fighter-8-model-TIE-ln.webp',
  Executor: 'assets/naves/Executor.webp',
  'Rebel transport': 'assets/naves/Rebel-transport.webp',
  'Slave 1': 'assets/naves/Slave-I-5-model-Firespray.webp',
  'Imperial shuttle': 'assets/naves/Imperial-shuttle.webp',
  'EF76 Nebulon-B escort frigate':
    'assets/naves/EF76-Nebulon-B-escort-frigate.webp',
  'Calamari Cruiser': 'assets/naves/Calamari-Cruiser.webp',
  'A-wing': 'assets/naves/A-Wing-6-model-RZ-1.webp',
  'B-wing': 'assets/naves/B-wing.webp',
  'Republic Cruiser': 'assets/naves/Republic-Cruiser.webp',
  'Droid control ship': 'assets/naves/Droid-control-ship.webp',
  'Naboo fighter': 'assets/naves/Naboo-fighter.webp',
  'Naboo Royal Starship': 'assets/naves/Naboo-Royal-Starship.webp',
  Scimitar: 'assets/naves/scimitar.webp',
  'J-type diplomatic barge': 'assets/naves/J-type-diplomatic-barge.webp',
  'AA-9 Coruscant freighter': 'assets/naves/AA-9-Coruscant-freighter.webp',
  'Jedi starfighter': 'assets/naves/Jedi-starfighter.webp',
  'H-type Nubian yacht': 'assets/naves/H-type-Nubian-yacht.webp',
  'Republic Assault ship': 'assets/naves/Republic-Assault-ship.webp',
  'Solar Sailer': 'assets/naves/Solar-Sailer.webp',
  'Trade Federation cruiser': 'assets/naves/Trade-Federation-cruiser.webp',
  'Theta-class T-2c shuttle': 'assets/naves/Theta-class-T-2c-shuttle.webp',
  'Republic attack cruiser': 'assets/naves/republic-attack-cruiser.webp',
  'Naboo star skiff': 'assets/naves/Naboo-star-skiff.webp',
  'Jedi Interceptor': 'assets/naves/Jedi-Interceptor.webp',
  'arc-170': 'assets/naves/arc-170.webp',
  'Banking clan frigte': 'assets/naves/Banking-clan-frigate.webp',
  'Banking clan frigate': 'assets/naves/Banking-clan-frigate.webp',
  'TIE Fighter': 'assets/naves/TIE-Fighter-8-model-TIE-ln.webp',
  'X-Wing': 'assets/naves/X-Wing-1-model-T-65.webp',
  'Belbullab-22 starfighter': 'assets/naves/Belbullab-22-starfighter.webp',
  'V-wing': 'assets/naves/V-wing.webp',

  // Mapeamento antigo (fallback)
  'X-Wing 1': 'assets/naves/X-Wing-1-model-T-65.webp',
  'TIE Fighter 2': 'assets/naves/TIE-Fighter-2-model-TIE-lnjpg.webp',
  'Millennium Falcon 3': 'assets/naves/Millennium-Falcon-3.webp',
  'Star Destroyer 4': 'assets/naves/Star-Destroyer-4-model-Imperial-I.webp',
  'Slave I 5': 'assets/naves/Slave-I-5-model-Firespray.webp',
  'A-Wing 6': 'assets/naves/A-Wing-6-model-RZ-1.webp',
  'X-Wing 7': 'assets/naves/X-Wing-7-model-T-65.webp',
  'TIE Fighter 8': 'assets/naves/TIE-Fighter-8-model-TIE-ln.webp',
  'Millennium Falcon 9': 'assets/naves/Millennium-Falcon-9-model-YT-1300.webp',
  'Star Destroyer 10': 'assets/naves/Star-Destroyer-10-model-Imperial-I.webp',
};

// Correções/aliases e normalização do mapa para torná-lo mais tolerante
// a variações nos nomes recebidos pela API (case, pequenas diferenças, typos).
// Cria mapas auxiliares para lookup rápido:
//  - SHIP_IMAGE_MAP_LOWER: chaves em lower-case (preserva o destino original)
//  - SHIP_IMAGE_MAP_SLUG: chaves 'slugified' (remove caracteres não alfanuméricos)
const SHIP_IMAGE_MAP_LOWER: { [key: string]: string } = {};
const SHIP_IMAGE_MAP_SLUG: { [key: string]: string } = {};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '') // remove tudo que não for alfanumérico
    .trim();
}

// Copia as entradas existentes (mantendo o destino original)
for (const k of Object.keys(SHIP_IMAGE_MAP)) {
  const lower = k.toLowerCase();
  SHIP_IMAGE_MAP_LOWER[lower] = SHIP_IMAGE_MAP[k];
  const slug = slugify(k);
  SHIP_IMAGE_MAP_SLUG[slug] = SHIP_IMAGE_MAP[k];
}

// Aliases / correções manuais úteis
// Corrige typo 'Banking clan frigte' para 'Banking clan frigate'
if (
  !SHIP_IMAGE_MAP_LOWER['banking clan frigate'] &&
  SHIP_IMAGE_MAP_LOWER['banking clan frigte']
) {
  SHIP_IMAGE_MAP_LOWER['banking clan frigate'] =
    SHIP_IMAGE_MAP_LOWER['banking clan frigte'];
  SHIP_IMAGE_MAP_SLUG[slugify('banking clan frigate')] =
    SHIP_IMAGE_MAP_LOWER['banking clan frigte'];
}

// Corrige mapeamento óbvio: 'Imperial shuttle' deve usar o arquivo 'Imperial-shuttle.webp'
// (evita referência errada a um arquivo TIE) — usa arquivo existente em assets.
SHIP_IMAGE_MAP_LOWER['imperial shuttle'] = 'assets/naves/Imperial-shuttle.webp';
SHIP_IMAGE_MAP_SLUG[slugify('imperial shuttle')] =
  'assets/naves/Imperial-shuttle.webp';

/**
 * Retorna a imagem mapeada para o nome fornecido, tentando em ordem:
 *  1) lookup por chave exata em `SHIP_IMAGE_MAP`
 *  2) lookup por chave lower-case em `SHIP_IMAGE_MAP_LOWER`
 *  3) lookup por chave 'slug' em `SHIP_IMAGE_MAP_SLUG` (remove espaços, hífens, etc)
 *  4) undefined se não encontrar
 */
export function getShipImage(name: string | undefined): string | undefined {
  if (!name) return undefined;
  // 1) chave exata
  if (SHIP_IMAGE_MAP[name]) return SHIP_IMAGE_MAP[name];

  // 2) busca por lower-case no mapa normalizado
  const lower = name.toLowerCase();
  if (SHIP_IMAGE_MAP_LOWER[lower]) return SHIP_IMAGE_MAP_LOWER[lower];

  // 3) busca por slug (remove espaços/hífens/pontuação)
  const slug = slugify(name);
  if (SHIP_IMAGE_MAP_SLUG[slug]) return SHIP_IMAGE_MAP_SLUG[slug];

  // não encontrado
  return undefined;
}
