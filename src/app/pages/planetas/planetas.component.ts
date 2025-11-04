import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarwarsService } from '../../services/starwars.service';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { PLANET_IMAGE_MAP } from '../../data/planet-image-map';

@Component({
  selector: 'app-planetas',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './planetas.component.html',
  styleUrls: ['./planetas.component.scss'],
})
export class PlanetasComponent implements OnInit {
  planets: any[] = [];
  loading = true;

  // lista visível e buffer para paginação responsiva (igual aos personagens)
  planetsVisiveis: any[] = [];
  proximoLoteBuffer: any[] = [];
  loadingMais = false;
  lote = 14;
  indiceAtual = 0;
  temMaisPlanetas = true;
  private mobileBreakpoint = 640;

  selectedPlanet: any = null;
  @ViewChild('sidePanel', { read: ElementRef }) sidePanel?: ElementRef;
  private _originalParent: Node | null = null;
  private _placeholder: Comment | null = null;
  private _bodyBackdrop: HTMLElement | null = null;
  // small inline SVG placeholder (data URI) used when an image fails to load
  defaultImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect fill="%23eef2f7" width="400" height="240"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23929eab" font-family="Arial, Helvetica, sans-serif" font-size="20">Imagem indisponível</text></svg>';

  constructor(private swService: StarwarsService) {}

  ngOnInit(): void {
    const MIN_LOADING_TIME = 600;
    const start = Date.now();

    this.swService.getAllPlanets().subscribe({
      next: (res) => {
        // res is an array of planet objects from SWAPI
        // Use o mapa central `PLANET_IMAGE_MAP` definido em src/app/data/planet-image-map.ts
        this.planets = res.map((p: any) => {
          let image = this.resolvePlanetImage(p);
          if (typeof image === 'string' && image) image = encodeURI(image);
          return {
            name: p.name,
            url: p.url,
            climate: p.climate,
            terrain: p.terrain,
            population: p.population,
            diameter: p.diameter,
            gravity: p.gravity,
            orbital_period: p.orbital_period,
            rotation_period: p.rotation_period,
            surface_water: p.surface_water,
            image: image,
          };
        });

        const elapsed = Date.now() - start;
        const delay =
          elapsed < MIN_LOADING_TIME ? MIN_LOADING_TIME - elapsed : 0;
        setTimeout(() => {
          this.loading = false;

          // preparar visualização paginada responsiva
          const primeiroLote = this.getEffectiveLote();
          this.planetsVisiveis.push(...this.planets.slice(0, primeiroLote));
          this.indiceAtual = primeiroLote;

          // preparar buffer (próximos lotes)
          this.prepararProximoLote();

          // DEBUG leve
          try {
            console.log(
              'Planetas (nome -> image):',
              this.planets.map((x) => ({ name: x.name, image: x.image }))
            );
            const missing = this.planets
              .filter((x) => !x.image)
              .map((x) => x.name);
            if (missing.length)
              console.warn('Planetas sem imagem (fallback usado):', missing);
          } catch (e) {
            // ignore debug errors
          }
        }, delay);
      },
      error: (err) => {
        console.error('Erro ao buscar planetas:', err);
        const elapsed = Date.now() - start;
        const delay =
          elapsed < MIN_LOADING_TIME ? MIN_LOADING_TIME - elapsed : 0;
        setTimeout(() => (this.loading = false), delay);
      },
    });
  }

  openPanel(planet: any) {
    this.selectedPlanet = planet;
    // move painel para o body para escapar de stacking contexts (transform/position em ancestrais)
    try {
      if (this.sidePanel && this.sidePanel.nativeElement) {
        const el = this.sidePanel.nativeElement as HTMLElement;
        if (!this._originalParent && el.parentNode) {
          this._originalParent = el.parentNode;
          this._placeholder = document.createComment('side-panel-placeholder');
          this._originalParent.insertBefore(this._placeholder, el);
          document.body.appendChild(el);
        }
      }
      // create a backdrop attached to body so clicks outside close the panel
      try {
        if (!this._bodyBackdrop) {
          const bd = document.createElement('div');
          bd.className = 'side-panel-backdrop body-backdrop';
          // inline styles to ensure backdrop is transparent but still captures clicks when appended to body
          bd.style.position = 'fixed';
          bd.style.top = '0';
          bd.style.left = '0';
          bd.style.width = '100%';
          bd.style.height = '100%';
          bd.style.background = 'rgba(0,0,0,0)'; // transparent so the screen stays "viva"
          bd.style.zIndex = '100000';
          bd.style.pointerEvents = 'auto';
          bd.style.opacity = '0';
          bd.style.transition = 'opacity 0.2s ease';
          bd.addEventListener('click', () => this.closePanel());
          document.body.appendChild(bd);
          this._bodyBackdrop = bd;
          // animate to visible state (still transparent visually)
          setTimeout(() => (bd.style.opacity = '1'), 10);
        }
      } catch (e) {
        console.warn('Could not create body backdrop:', e);
      }
    } catch (e) {
      // fail silently — panel still opens but may be under header
      console.warn('Could not move side-panel to body:', e);
    }
  }

  closePanel() {
    this.selectedPlanet = null;
    // move o painel de volta para o seu contêiner original
    try {
      if (
        this.sidePanel &&
        this.sidePanel.nativeElement &&
        this._originalParent
      ) {
        const el = this.sidePanel.nativeElement as HTMLElement;
        if (
          document.body.contains(el) &&
          this._placeholder &&
          this._originalParent
        ) {
          this._originalParent.insertBefore(el, this._placeholder);
          if (this._placeholder.parentNode)
            this._placeholder.parentNode.removeChild(this._placeholder);
        }
        this._originalParent = null;
        this._placeholder = null;
      }
    } catch (e) {
      console.warn('Could not restore side-panel position:', e);
    }
    // remove any backdrop appended to body
    try {
      if (this._bodyBackdrop && this._bodyBackdrop.parentNode) {
        this._bodyBackdrop.parentNode.removeChild(this._bodyBackdrop);
        this._bodyBackdrop = null;
      }
    } catch (e) {
      console.warn('Could not remove body backdrop:', e);
    }
  }

  ngOnDestroy(): void {
    // cleanup if component destroyed while panel open
    try {
      if (this._bodyBackdrop && this._bodyBackdrop.parentNode) {
        this._bodyBackdrop.parentNode.removeChild(this._bodyBackdrop);
        this._bodyBackdrop = null;
      }
    } catch (e) {
      // ignore
    }
    try {
      if (
        this.sidePanel &&
        this.sidePanel.nativeElement &&
        this._originalParent
      ) {
        const el = this.sidePanel.nativeElement as HTMLElement;
        if (
          document.body.contains(el) &&
          this._placeholder &&
          this._originalParent
        ) {
          this._originalParent.insertBefore(el, this._placeholder);
          if (this._placeholder.parentNode)
            this._placeholder.parentNode.removeChild(this._placeholder);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Attempt several strategies to find an image for the planet:
  // 1) exact name lookup in PLANET_IMAGE_MAP
  // 2) normalized name lookup (remove spaces/punctuation/diacritics)
  // 3) fallback to starwars-visualguide by SWAPI id
  private resolvePlanetImage(p: any): string {
    if (!p) return '';
    const exact = PLANET_IMAGE_MAP[p.name];
    if (exact) return exact;

    const normalizedKey = this.normalizeName(p.name);
    const normalized = PLANET_IMAGE_MAP[normalizedKey];
    if (normalized) return normalized;

    // try to match by normalizing the keys in the map (handles keys like 'PolisMassa' or 'CatoNeimoidia')
    for (const k of Object.keys(PLANET_IMAGE_MAP)) {
      try {
        if (this.normalizeName(k) === normalizedKey) {
          return PLANET_IMAGE_MAP[k];
        }
      } catch (e) {
        // ignore any normalization issues for odd keys
      }
    }

    // try to extract id from SWAPI url: /api/planets/:id/
    const idMatch = /\/api\/planets\/(\d+)\/?$/.exec(p.url);
    if (idMatch) {
      const id = idMatch[1];
      // visualguide common pattern
      return `https://starwars-visualguide.com/assets/img/planets/${id}.jpg`;
    }

    return '';
  }

  private normalizeName(name: string): string {
    if (!name) return '';
    // remove diacritics, spaces, and non-alphanumeric characters, then lower-case
    return name
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (!img) return;

    // if we've already fallen back to the placeholder, do nothing
    if (img.src === this.defaultImage) return;

    // try visualguide fallback once using the SWAPI id (if available)
    const planetUrl = img.getAttribute('data-planet-url');
    if (planetUrl) {
      const idMatch = /\/api\/planets\/(\d+)\/?$/.exec(planetUrl);
      if (idMatch) {
        const id = idMatch[1];
        const visualUrl = `https://starwars-visualguide.com/assets/img/planets/${id}.jpg`;
        // avoid infinite loop: if we already tried visualUrl, go to placeholder
        if (img.src !== visualUrl) {
          img.setAttribute('data-tried-visualguide', '1');
          img.src = visualUrl;
          return;
        }
      }
    }

    // final fallback: placeholder
    img.src = this.defaultImage;
  }

  // Retorna o tamanho do lote de acordo com largura atual
  private getEffectiveLote(): number {
    try {
      return window.innerWidth <= this.mobileBreakpoint ? 9 : this.lote;
    } catch (e) {
      return this.lote;
    }
  }

  carregarMais() {
    this.loadingMais = true;
    const loteAtual = this.getEffectiveLote();

    if (this.proximoLoteBuffer.length > 0) {
      const novoLote = this.proximoLoteBuffer.slice(0, loteAtual);
      this.proximoLoteBuffer = this.proximoLoteBuffer.slice(loteAtual);
      this.planetsVisiveis.push(...novoLote);
      this.indiceAtual += loteAtual;

      if (this.indiceAtual >= this.planets.length) {
        this.temMaisPlanetas = false;
      }

      this.loadingMais = false;
      if (this.proximoLoteBuffer.length === 0) this.prepararProximoLote();
      return;
    }

    const novoLote = this.planets.slice(
      this.indiceAtual,
      this.indiceAtual + loteAtual
    );
    this.planetsVisiveis.push(...novoLote);
    this.indiceAtual += novoLote.length;

    if (this.indiceAtual >= this.planets.length) this.temMaisPlanetas = false;

    this.loadingMais = false;
    this.prepararProximoLote();
  }

  private prepararProximoLote() {
    const loteAtual = this.getEffectiveLote();
    const proximoLote = this.planets.slice(
      this.indiceAtual,
      this.indiceAtual + loteAtual * 2
    );
    this.proximoLoteBuffer = proximoLote;
  }

  @HostListener('window:resize')
  onResize() {
    const loteAtual = this.getEffectiveLote();
    if (this.planetsVisiveis.length > loteAtual) {
      const extras = this.planetsVisiveis.splice(loteAtual);
      this.proximoLoteBuffer = [...extras, ...this.proximoLoteBuffer];
      this.indiceAtual = Math.min(this.indiceAtual, loteAtual);
    }
    // no-op for side-panel sizing (panel now occupies full viewport height)
  }
}
