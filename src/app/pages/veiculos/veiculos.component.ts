import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { StarwarsService } from '../../services/starwars.service';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { FilmesStateService } from '../../services/filmes-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-veiculos',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './veiculos.component.html',
  styleUrls: ['./veiculos.component.scss'],
})
export class VeiculosComponent implements OnInit {
  veiculos: any[] = [];
  veiculosVisiveis: any[] = [];
  proximoLoteBuffer: any[] = [];
  loading = true;
  loadingMais = false;
  erro = '';
  selectedVehicle: any = null;

  lote = 14;
  indiceAtual = 0;
  temMaisVeiculos = true;

  private mobileBreakpoint = 640;

  defaultImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect fill="%23000000" width="400" height="240"/></svg>';

  constructor(
    private sw: StarwarsService,
    private filmesState: FilmesStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sw.getAllVehicles().subscribe({
      next: (list: any[]) => {
        this.veiculos = list.map((v: any) => {
          const idMatch = /\/api\/vehicles\/(\d+)\/?/.exec(v.url || '');
          const id = idMatch ? idMatch[1] : 'unknown';
          const slug = this.slug(v.name || `vehicle-${id}`);
          const imgPath = `assets/veiculos/${id}-${slug}.webp`;
          return {
            name: v.name,
            model: v.model,
            manufacturer: v.manufacturer,
            image: imgPath,
            raw: v,
            processed: false,
          };
        });

        const primeiroLoteSize = this.getEffectiveLote();
        const primeiroLote = this.veiculos.slice(0, primeiroLoteSize);
        this.veiculosVisiveis.push(...primeiroLote);
        this.indiceAtual = primeiroLoteSize;
        this.loading = false;
        this.prepararProximoLote();
      },
      error: (err) => {
        console.error('Erro ao carregar veículos:', err);
        this.erro = 'Erro ao carregar veículos';
        this.loading = false;
      },
    });
  }

  private slug(s: string): string {
    return (s || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private processarLoteDeVeiculos(loteParaProcessar: any[]): Observable<any[]> {
    if (!loteParaProcessar || loteParaProcessar.length === 0) {
      return of([]);
    }

    const filmRequests: any[] = [];
    for (const p of loteParaProcessar) {
      if (
        !p.processed &&
        p.raw &&
        Array.isArray(p.raw.films) &&
        p.raw.films.length > 0 &&
        typeof p.raw.films[0] === 'string' &&
        p.raw.films[0].startsWith('http')
      ) {
        for (const filmUrl of p.raw.films) {
          // evitar duplicatas
          if (!filmRequests.some((r: any) => (r as any).__url === filmUrl)) {
            const req$ = this.sw.getFilm(filmUrl) as Observable<any>;
            // marque a url para comparação simples (não altera o observable em runtime)
            (req$ as any).__url = filmUrl;
            filmRequests.push(req$);
          }
        }
      }
    }

    if (filmRequests.length === 0) {
      loteParaProcessar.forEach((p: any) => {
        if (!p.processed) {
          p.filmTitles = p.raw && p.raw.films ? p.raw.films : [];
          p.processed = true;
        }
      });
      return of(loteParaProcessar);
    }

    return forkJoin(filmRequests).pipe(
      map((filmsData: any[]) => {
        const filmMap = filmsData.reduce((acc: any, film: any) => {
          acc[film.url] = film.title;
          return acc;
        }, {});

        loteParaProcessar.forEach((p: any) => {
          if (!p.processed && p.raw && Array.isArray(p.raw.films)) {
            p.filmTitles = p.raw.films.map(
              (url: string) => filmMap[url] || url
            );
            p.processed = true;
          }
        });

        return loteParaProcessar;
      })
    );
  }

  carregarMais() {
    this.loadingMais = true;
    const loteAtual = this.getEffectiveLote();

    if (this.proximoLoteBuffer.length > 0) {
      const novoLote = this.proximoLoteBuffer.slice(0, loteAtual);
      this.proximoLoteBuffer = this.proximoLoteBuffer.slice(loteAtual);
      this.veiculosVisiveis.push(...novoLote);
      this.indiceAtual += loteAtual;

      if (this.indiceAtual >= this.veiculos.length)
        this.temMaisVeiculos = false;

      this.loadingMais = false;
      if (this.proximoLoteBuffer.length === 0) this.prepararProximoLote();
      return;
    }

    const novoLote = this.veiculos.slice(
      this.indiceAtual,
      this.indiceAtual + loteAtual
    );
    this.processarLoteDeVeiculos(novoLote).subscribe({
      next: (veiculosProcessados) => {
        this.veiculosVisiveis.push(...veiculosProcessados);
        this.indiceAtual += loteAtual;
        if (this.indiceAtual >= this.veiculos.length)
          this.temMaisVeiculos = false;
        this.loadingMais = false;
        this.prepararProximoLote();
      },
      error: (err) => {
        console.error('Erro ao processar lote de veículos:', err);
        this.erro = 'Erro ao carregar veículos.';
        this.loadingMais = false;
      },
    });
  }

  private prepararProximoLote() {
    const loteAtual = this.getEffectiveLote();
    const proximoLote = this.veiculos.slice(
      this.indiceAtual,
      this.indiceAtual + loteAtual * 2
    );
    if (proximoLote.length === 0) return;
    this.processarLoteDeVeiculos(proximoLote).subscribe({
      next: (veiculosProcessados) => {
        this.proximoLoteBuffer = veiculosProcessados;
      },
      error: (err) => console.error('Erro ao preparar próximo lote:', err),
    });
  }

  selectVehicle(vehicle: any) {
    this.selectedVehicle = vehicle;

    if (
      !vehicle.processed &&
      vehicle.raw &&
      vehicle.raw.films &&
      vehicle.raw.films.length
    ) {
      this.processarLoteDeVeiculos([vehicle]).subscribe((processados) => {
        this.selectedVehicle = processados[0];
      });
    }
  }

  closePanel() {
    this.selectedVehicle = null;
  }

  openFilm(filmTitle: string) {
    this.filmesState.setSelectedFilmTitle(filmTitle);
    this.router.navigate(['/app/filmes']);
  }

  private getEffectiveLote(): number {
    try {
      return window.innerWidth <= this.mobileBreakpoint ? 9 : this.lote;
    } catch (e) {
      return this.lote;
    }
  }

  @HostListener('window:resize')
  onResize() {
    const loteAtual = this.getEffectiveLote();
    if (this.veiculosVisiveis.length > loteAtual) {
      const extras = this.veiculosVisiveis.splice(loteAtual);
      this.proximoLoteBuffer = [...extras, ...this.proximoLoteBuffer];
      this.indiceAtual = Math.min(this.indiceAtual, loteAtual);
    }
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img && img.src !== this.defaultImage) {
      img.src = this.defaultImage;
    }
  }
}
