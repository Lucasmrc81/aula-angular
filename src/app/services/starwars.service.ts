import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Film } from '../models/film.model';

@Injectable({ providedIn: 'root' })
export class StarwarsService {
  private akababUrl = 'https://akabab.github.io/starwars-api/api/all.json';
  private swapiPeopleUrl = 'https://swapi.dev/api/people/';
  private swapiVehiclesUrl = 'https://swapi.dev/api/vehicles/';
  private filmsUrl = 'https://swapi.dev/api/films/';
  private swapiPlanetsUrl = 'https://swapi.dev/api/planets/';
  private swapiStarshipsUrl = 'https://swapi.dev/api/starships/';

  constructor(private http: HttpClient) {}

  getAllCharacters(): Observable<any[]> {
    return this.http.get<any[]>(this.akababUrl);
  }

  getFilms(): Observable<{ results: Film[] }> {
    return this.http.get<{ results: Film[] }>(this.filmsUrl);
  }

  getFilm(url: string): Observable<Film> {
    return this.http.get<Film>(url);
  }

  // Busca todos personagens da SWAPI (paginação)
  getAllSwapiPeople(): Observable<any[]> {
    const results: any[] = [];

    const fetchPage = (pageUrl: string): Observable<any[]> => {
      return this.http.get<any>(pageUrl).pipe(
        mergeMap((res: any) => {
          results.push(...res.results);
          if (res.next) {
            return fetchPage(res.next);
          } else {
            return [results];
          }
        })
      );
    };

    return fetchPage(this.swapiPeopleUrl);
  }

  // Busca todos planetas da SWAPI (paginação)
  getAllPlanets(): Observable<any[]> {
    const results: any[] = [];

    const fetchPage = (pageUrl: string): Observable<any[]> => {
      return this.http.get<any>(pageUrl).pipe(
        mergeMap((res: any) => {
          results.push(...res.results);
          if (res.next) {
            return fetchPage(res.next);
          } else {
            return [results];
          }
        })
      );
    };

    return fetchPage(this.swapiPlanetsUrl);
  }

  // Busca todas starships da SWAPI (paginação)
  getAllStarships(): Observable<any[]> {
    const results: any[] = [];

    const fetchPage = (pageUrl: string): Observable<any[]> => {
      return this.http.get<any>(pageUrl).pipe(
        mergeMap((res: any) => {
          results.push(...res.results);
          if (res.next) {
            return fetchPage(res.next);
          } else {
            return [results];
          }
        })
      );
    };

    return fetchPage(this.swapiStarshipsUrl);
  }

  // Busca todos veículos da SWAPI (paginação)
  getAllVehicles(): Observable<any[]> {
    const results: any[] = [];

    const fetchPage = (pageUrl: string): Observable<any[]> => {
      return this.http.get<any>(pageUrl).pipe(
        mergeMap((res: any) => {
          results.push(...res.results);
          if (res.next) {
            return fetchPage(res.next);
          } else {
            return [results];
          }
        })
      );
    };

    return fetchPage(this.swapiVehiclesUrl);
  }
}
