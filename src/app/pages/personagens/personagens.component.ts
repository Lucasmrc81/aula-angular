import { Component, OnInit, HostListener } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { StarwarsService } from '../../services/starwars.service';
import { LoadingSpinnerComponent } from '../../loading-spinner/loading-spinner.component';
import { FilmesStateService } from '../../services/filmes-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-personagens',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  // não forçamos OnPush aqui por segurança; trackBy é aplicado para reduzir re-render
  templateUrl: './personagens.component.html',
  styleUrls: ['./personagens.component.scss'],
})
export class PersonagensComponent implements OnInit {
  personagens: any[] = [];
  personagensVisiveis: any[] = [];
  proximoLoteBuffer: any[] = [];
  loading = true;
  loadingMais = false;
  erro = '';
  selectedCharacter: any = null;

  // lote padrão usado como referência (desktop). O valor efetivo é responsivo via getEffectiveLote()
  lote = 14;
  indiceAtual = 0;
  temMaisPersonagens = true;

  // breakpoint (px) para considerar tela pequena
  private mobileBreakpoint = 640;

  constructor(
    private swService: StarwarsService,
    private filmesState: FilmesStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Busca todos os personagens
    forkJoin({
      akabab: this.swService.getAllCharacters(),
      swapi: this.swService.getAllSwapiPeople(),
    })
      .pipe(
        map(({ akabab, swapi }: any) => {
          return akabab.map((akaChar: any) => {
            const swChar = swapi.find(
              (sw: any) => sw.name.toLowerCase() === akaChar.name.toLowerCase()
            );
            return {
              ...akaChar,
              films: swChar ? swChar.films : akaChar.films,
              processed: false,
            };
          });
        })
      )
      .subscribe({
        next: (data: any[]) => {
          this.personagens = data;

          // Mostra o primeiro lote imediatamente usando tamanho responsivo
          const primeiroLoteSize = this.getEffectiveLote();
          const primeiroLoteCru = this.personagens.slice(0, primeiroLoteSize);
          this.personagensVisiveis.push(...primeiroLoteCru);
          this.indiceAtual = primeiroLoteSize;
          this.loading = false;

          // Prepara próximos lotes
          this.prepararProximoLote();
        },
        error: (err: any) => {
          console.error('Erro ao carregar personagens:', err);
          this.erro = 'Erro ao carregar personagens';
          this.loading = false;
        },
      });
  }

  private processarLoteDePersonagens(
    loteParaProcessar: any[]
  ): Observable<any[]> {
    if (!loteParaProcessar || loteParaProcessar.length === 0) {
      return of([]);
    }

    const filmRequests: any[] = [];

    loteParaProcessar.forEach((p: any) => {
      if (
        !p.processed &&
        p.films &&
        p.films.length &&
        typeof p.films[0] === 'string' &&
        p.films[0].startsWith('http')
      ) {
        p.films.forEach((filmUrl: string) => {
          if (!filmRequests.find((req) => req.url === filmUrl)) {
            filmRequests.push(this.swService.getFilm(filmUrl));
          }
        });
      }
    });

    if (filmRequests.length > 0) {
      return forkJoin(filmRequests).pipe(
        map((filmsData: any[]) => {
          const filmMap = filmsData.reduce((acc: any, film: any) => {
            acc[film.url] = film.title;
            return acc;
          }, {});

          loteParaProcessar.forEach((p: any) => {
            if (
              !p.processed &&
              p.films &&
              p.films.length &&
              p.films[0].startsWith('http')
            ) {
              p.filmTitles = p.films.map((url: string) => filmMap[url] || url);
              p.processed = true;
            } else if (!p.processed) {
              p.filmTitles = p.films || [];
              p.processed = true;
            }
          });

          return loteParaProcessar;
        })
      );
    } else {
      loteParaProcessar.forEach((p) => {
        if (!p.processed) {
          p.filmTitles = p.films || [];
          p.processed = true;
        }
      });
      return of(loteParaProcessar);
    }
  }

  carregarMais() {
    this.loadingMais = true;
    const loteAtual = this.getEffectiveLote();

    // Usa buffer se disponível
    if (this.proximoLoteBuffer.length > 0) {
      const novoLote = this.proximoLoteBuffer.slice(0, loteAtual);
      this.proximoLoteBuffer = this.proximoLoteBuffer.slice(loteAtual);
      this.personagensVisiveis.push(...novoLote);
      this.indiceAtual += loteAtual;

      if (this.indiceAtual >= this.personagens.length) {
        this.temMaisPersonagens = false;
      }

      this.loadingMais = false;
      if (this.proximoLoteBuffer.length === 0) {
        this.prepararProximoLote();
      }
      return;
    }

    // Processa lote novo
    const novoLote = this.personagens.slice(
      this.indiceAtual,
      this.indiceAtual + loteAtual
    );

    this.processarLoteDePersonagens(novoLote).subscribe({
      next: (personagensProcessados) => {
        this.personagensVisiveis.push(...personagensProcessados);
        this.indiceAtual += loteAtual;

        if (this.indiceAtual >= this.personagens.length) {
          this.temMaisPersonagens = false;
        }

        this.loadingMais = false;
        this.prepararProximoLote();
      },
      error: (err) => {
        console.error('Erro ao processar lote:', err);
        this.erro = 'Erro ao carregar personagens.';
        this.loadingMais = false;
      },
    });
  }

  private prepararProximoLote() {
    const loteAtual = this.getEffectiveLote();
    const proximoLote = this.personagens.slice(
      this.indiceAtual,
      this.indiceAtual + loteAtual * 2
    );

    if (proximoLote.length === 0) return;

    this.processarLoteDePersonagens(proximoLote).subscribe({
      next: (personagensProcessados) => {
        this.proximoLoteBuffer = personagensProcessados;
      },
      error: (err) => {
        console.error('Erro ao preparar próximo lote:', err);
      },
    });
  }

  // Ao clicar num personagem
  selectCharacter(character: any) {
    this.selectedCharacter = character;

    // Processa filmes do personagem selecionado (se não estiverem prontos)
    if (!character.processed && character.films && character.films.length) {
      this.processarLoteDePersonagens([character]).subscribe((processados) => {
        this.selectedCharacter = processados[0];
      });
    }
  }

  closePanel() {
    this.selectedCharacter = null;
  }

  // Ao clicar no ícone de filme 🎬
  openFilm(filmTitle: string) {
    this.filmesState.setSelectedFilmTitle(filmTitle);
    this.router.navigate(['/app/filmes']);
  }
  /**
   * Retorna o tamanho do lote de acordo com a largura atual da janela.
   * - telas pequenas (<= mobileBreakpoint): 9
   * - telas maiores: 14
   */
  private getEffectiveLote(): number {
    try {
      return window.innerWidth <= this.mobileBreakpoint ? 9 : this.lote;
    } catch (e) {
      // fallback
      return this.lote;
    }
  }

  @HostListener('window:resize')
  onResize() {
    // Se a tela ficou pequena e já tínhamos mais itens visíveis do que o permitido,
    // movemos os extras para o buffer para que rolem quando o usuário pedir "carregar mais".
    const loteAtual = this.getEffectiveLote();
    if (this.personagensVisiveis.length > loteAtual) {
      const extras = this.personagensVisiveis.splice(loteAtual);
      // coloca extras no início do buffer para manter ordem
      this.proximoLoteBuffer = [...extras, ...this.proximoLoteBuffer];
      // ajustar indiceAtual para refletir quantos itens foram exibidos da lista principal
      this.indiceAtual = Math.min(this.indiceAtual, loteAtual);
    }
  }

  // trackBy para listas grandes — reduz re-render quando a lista muda
  trackByPerson(index: number, item: any) {
    return item.url || item.id || item.name || index;
  }
}
