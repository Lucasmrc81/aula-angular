import { Component, OnInit } from '@angular/core';
import { StarwarsService } from '../../services/starwars.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './../../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-filmes',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './filmes.component.html',
  styleUrls: ['./filmes.component.scss'],
})
export class FilmesComponent implements OnInit {
  films: any[] = [];
  loading = true;

  // Painel lateral
  selectedFilm: any = null;
  sidePanelOpen = false;

  filmImages: { [key: string]: string } = {
    'A New Hope':
      'https://i.pinimg.com/736x/75/bc/45/75bc451a0c5b591e7033427ebeb03049.jpg',
    'The Empire Strikes Back':
      'https://i.pinimg.com/1200x/ef/b9/4b/efb94b356f51d1d01c6f9dedae6fc470.jpg',
    'Return of the Jedi':
      'https://i.pinimg.com/736x/97/d9/ac/97d9ac92a0afdb2209505fdb4df97851.jpg',
    'The Phantom Menace':
      'https://i.pinimg.com/1200x/62/31/df/6231df4efd0906d649a3cf26dd9693ef.jpg',
    'Attack of the Clones':
      'https://i.pinimg.com/1200x/1c/ed/91/1ced9190de3053c50d951562a094debd.jpg',
    'Revenge of the Sith':
      'https://i.pinimg.com/736x/9d/6a/23/9d6a232c628e4aaaecfaf3dbdb1d9653.jpg',
    'The Force Awakens':
      'https://i.pinimg.com/1200x/ea/31/dd/ea31dd389949611e8237fe90ea53a09c.jpg',
    'The Last Jedi':
      'https://i.pinimg.com/1200x/c7/d1/e6/c7d1e62f702ad701bbe4c233e3eb404f.jpg',
    'The Rise of Skywalker':
      'https://i.pinimg.com/736x/3a/dd/b5/3addb5f14076afb509a247b7815ed081.jpg',
  };

  extraFilms = [
    {
      title: 'The Force Awakens',
      director: 'J.J. Abrams',
      release_date: '2015-12-18',
      opening_crawl: 'A long time ago in a galaxy far, far away...',
      cover:
        'https://i.pinimg.com/1200x/ea/31/dd/ea31dd389949611e8237fe90ea53a09c.jpg',
    },
    {
      title: 'The Last Jedi',
      director: 'Rian Johnson',
      release_date: '2017-12-15',
      opening_crawl: 'Luke Skywalker has disappeared...',
      cover:
        'https://i.pinimg.com/1200x/c7/d1/e6/c7d1e62f702ad701bbe4c233e3eb404f.jpg',
    },
    {
      title: 'The Rise of Skywalker',
      director: 'J.J. Abrams',
      release_date: '2019-12-20',
      opening_crawl: 'The dead speak! The galaxy has fallen...',
      cover:
        'https://i.pinimg.com/736x/3a/dd/b5/3addb5f14076afb509a247b7815ed081.jpg',
    },
  ];

  constructor(private swService: StarwarsService) {}

  ngOnInit(): void {
    const MIN_LOADING_TIME = 1500; // tempo mínimo do spinner em ms
    const startTime = Date.now();

    this.swService.getFilms().subscribe({
      next: (res) => {
        const swapiFilms = res.results.map((f: any) => ({
          title: f.title,
          director: f.director,
          release_date: f.release_date,
          opening_crawl: f.opening_crawl,
          cover: this.filmImages[f.title] || '',
          synopsis: f.opening_crawl,
        }));

        this.films = [...swapiFilms, ...this.extraFilms];
        this.films.sort(
          (a, b) =>
            new Date(a.release_date).getTime() -
            new Date(b.release_date).getTime()
        );

        const elapsed = Date.now() - startTime;
        const delay =
          elapsed < MIN_LOADING_TIME ? MIN_LOADING_TIME - elapsed : 0;
        setTimeout(() => {
          this.loading = false;
        }, delay);
      },
      error: (err) => {
        console.error('Erro ao buscar filmes:', err);
        const elapsed = Date.now() - startTime;
        const delay =
          elapsed < MIN_LOADING_TIME ? MIN_LOADING_TIME - elapsed : 0;
        setTimeout(() => {
          this.loading = false;
        }, delay);
      },
    });
  }

  // Abrir painel lateral
  openPanel(film: any) {
    this.selectedFilm = film;
    this.sidePanelOpen = true;
  }

  // Fechar painel lateral
  closePanel() {
    this.sidePanelOpen = false;
    setTimeout(() => (this.selectedFilm = null), 300); // espera a animação terminar
  }
}
