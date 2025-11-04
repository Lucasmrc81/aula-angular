import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SHIP_IMAGE_MAP, getShipImage } from '../../data/ship-image-map';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { StarwarsService } from '../../services/starwars.service';

@Component({
  selector: 'app-naves',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './naves.component.html',
  styleUrls: ['./naves.component.scss'],
})
export class NavesComponent implements OnInit {
  defaultImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect fill="%23000000" width="400" height="240"/></svg>';

  ships: any[] = [];
  shipsVisiveis: any[] = [];
  proximoLoteBuffer: any[] = [];
  loading = true;
  loadingMais = false;
  lote = 14;
  indiceAtual = 0;
  temMaisPersonagens = true;
  private mobileBreakpoint = 640;

  constructor(private starwarsService: StarwarsService) {}

  ngOnInit() {
    this.loadStarships();
  }

  loadStarships() {
    this.starwarsService.getAllStarships().subscribe({
      next: (starships) => {
        console.log(
          'Nomes das naves da API:',
          starships.map((ship) => ship.name)
        );
        this.ships = starships.map((ship) => {
          const mapped = getShipImage(ship.name);
          const exact = SHIP_IMAGE_MAP[ship.name];
          const img = mapped || exact || this.defaultImage;

          // diagnostico: warn quando não encontramos uma imagem (ajuda a completar o mapa)
          if (!mapped && !exact) {
            console.warn(`Nenhuma imagem mapeada para a nave: "${ship.name}"`);
          }

          return {
            ...ship,
            image: typeof img === 'string' ? encodeURI(img) : img,
          };
        });

        // Prepara exibição em lotes: mostra primeiro lote e prepara buffer
        const primeiroLoteSize = this.getEffectiveLote();
        const primeiroLote = this.ships.slice(0, primeiroLoteSize);
        this.shipsVisiveis.push(...primeiroLote);
        this.indiceAtual = primeiroLoteSize;

        // Diagnóstico: agrupa por imagem e avisa se várias naves estão usando a mesma imagem
        const imageToNames: { [img: string]: string[] } = {};
        for (const s of this.ships) {
          const img = s.image || this.defaultImage;
          imageToNames[img] = imageToNames[img] || [];
          if (!imageToNames[img].includes(s.name))
            imageToNames[img].push(s.name);
        }
        for (const img of Object.keys(imageToNames)) {
          const names = imageToNames[img];
          if (names.length > 1) {
            console.warn(
              `Imagem compartilhada (${img}) usada por ${names.length} naves:`,
              names
            );
          }
        }
        // preparar buffer do próximo lote
        this.prepararProximoLote();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar naves:', error);
        this.loading = false;
        // Fallback para dados mock se a API falhar
        this.ships = this.createMockShips();
        // exibe primeiro lote do fallback
        const primeiroLoteSize = this.getEffectiveLote();
        this.shipsVisiveis = this.ships.slice(0, primeiroLoteSize);
        this.indiceAtual = this.shipsVisiveis.length;
        this.prepararProximoLote();
      },
    });
  }

  createMockShips() {
    return Array.from({ length: 10 }).map((_, i) => {
      const name =
        [
          'X-Wing',
          'TIE Fighter',
          'Millennium Falcon',
          'Star Destroyer',
          'Slave I',
          'A-Wing',
        ][i % 6] +
        ' ' +
        (i + 1);

      const model = [
        'T-65',
        'TIE/ln',
        'YT-1300',
        'Imperial I',
        'Firespray',
        'RZ-1',
      ][i % 6];

      const manufacturer = [
        'Incom Corporation',
        'Sienar Fleet Systems',
        'Corellian Engineering Corporation',
        'Kuat Drive Yards',
        'Kuat Systems Engineering',
        'Alliance Underground Engineering',
      ][i % 6];

      // tenta mapear o nome para um arquivo em /assets/naves
      const image = SHIP_IMAGE_MAP[name] || this.defaultImage;

      return { name, model, manufacturer, image };
    });
  }

  selectedShip: any = null;

  openPanel(ship: any) {
    this.selectedShip = ship;
  }

  closePanel() {
    this.selectedShip = null;
  }

  carregarMais() {
    this.loadingMais = true;
    const loteAtual = this.getEffectiveLote();

    // Usa buffer se disponível
    if (this.proximoLoteBuffer.length > 0) {
      const novoLote = this.proximoLoteBuffer.slice(0, loteAtual);
      this.proximoLoteBuffer = this.proximoLoteBuffer.slice(loteAtual);
      this.shipsVisiveis.push(...novoLote);
      this.indiceAtual += loteAtual;

      if (this.indiceAtual >= this.ships.length) {
        this.temMaisPersonagens = false;
      }

      this.loadingMais = false;
      if (this.proximoLoteBuffer.length === 0) {
        this.prepararProximoLote();
      }
      return;
    }

    // pega novo lote direto da lista principal
    const novoLote = this.ships.slice(
      this.indiceAtual,
      this.indiceAtual + loteAtual
    );

    this.shipsVisiveis.push(...novoLote);
    this.indiceAtual += loteAtual;

    if (this.indiceAtual >= this.ships.length) {
      this.temMaisPersonagens = false;
    }

    this.loadingMais = false;
    this.prepararProximoLote();
  }

  private prepararProximoLote() {
    const loteAtual = this.getEffectiveLote();
    const proximoLote = this.ships.slice(
      this.indiceAtual,
      this.indiceAtual + loteAtual * 2
    );

    if (proximoLote.length === 0) return;

    // pre-popula buffer (não há processing de filmes necessário aqui)
    this.proximoLoteBuffer = proximoLote;
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
    if (this.shipsVisiveis.length > loteAtual) {
      const extras = this.shipsVisiveis.splice(loteAtual);
      this.proximoLoteBuffer = [...extras, ...this.proximoLoteBuffer];
      this.indiceAtual = Math.min(this.indiceAtual, loteAtual);
    }
  }
}
