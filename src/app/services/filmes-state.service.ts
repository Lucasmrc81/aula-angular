import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FilmesStateService {
  private selectedFilmTitle: string | null = null;

  setSelectedFilmTitle(title: string) {
    this.selectedFilmTitle = title;
  }

  getSelectedFilmTitle(): string | null {
    return this.selectedFilmTitle;
  }

  clearSelectedFilmTitle() {
    this.selectedFilmTitle = null;
  }
}
