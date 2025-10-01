import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StarwarsService {
  private filmsUrl = 'https://swapi.dev/api/films/';
  private charactersUrl = 'https://akabab.github.io/starwars-api/api/all.json';

  constructor(private http: HttpClient) {}

  getFilms(): Observable<any> {
    return this.http.get<any>(this.filmsUrl);
  }

  getAllCharacters(): Observable<any[]> {
    return this.http.get<any[]>(this.charactersUrl);
  }
}
