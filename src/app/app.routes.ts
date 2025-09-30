import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { FilmesComponent } from './pages/filmes/filmes.component';
import { PersonagensComponent } from './pages/personagens/personagens.component';
import { ComunidadeComponent } from './pages/comunidade/comunidade.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'filmes', component: FilmesComponent },
      { path: 'personagens', component: PersonagensComponent },
      { path: 'comunidade', component: ComunidadeComponent },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
