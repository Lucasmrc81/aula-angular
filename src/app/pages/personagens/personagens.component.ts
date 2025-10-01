import { Component, OnInit } from '@angular/core';
import { StarwarsService } from '../../services/starwars.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './../../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-personagens',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './personagens.component.html',
  styleUrls: ['./personagens.component.scss'],
})
export class PersonagensComponent implements OnInit {
  personagens: any[] = [];
  loading = true;
  erro = '';
  selectedCharacter: any = null;

  constructor(private starwarsService: StarwarsService) {}

  ngOnInit(): void {
    const MIN_LOADING_TIME = 1500;
    const startTime = Date.now();

    this.starwarsService.getAllCharacters().subscribe({
      next: (data) => {
        this.personagens = data.map((p: any) => ({
          ...p,
          affiliations: Array.isArray(p.affiliations) ? p.affiliations : [],
          masters: Array.isArray(p.masters) ? p.masters : [],
          apprentices: Array.isArray(p.apprentices) ? p.apprentices : [],
          image: p.image || 'assets/default-character.png',
          cybernetics: p.cybernetics || 'N/A',
          alive: p.died ? false : true,
        }));

        const elapsed = Date.now() - startTime;
        const delay =
          elapsed < MIN_LOADING_TIME ? MIN_LOADING_TIME - elapsed : 0;

        setTimeout(() => {
          this.loading = false;
        }, delay);
      },
      error: (err) => {
        this.erro = 'Erro ao carregar personagens';
        console.error(err);
        const elapsed = Date.now() - startTime;
        const delay =
          elapsed < MIN_LOADING_TIME ? MIN_LOADING_TIME - elapsed : 0;
        setTimeout(() => {
          this.loading = false;
        }, delay);
      },
    });
  }

  isArray(arr: any): boolean {
    return Array.isArray(arr);
  }

  selectCharacter(character: any) {
    this.selectedCharacter = character;
  }

  closePanel() {
    this.selectedCharacter = null;
  }
}
