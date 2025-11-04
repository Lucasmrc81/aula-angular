import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { FilmesComponent } from './pages/filmes/filmes.component';
import { PersonagensComponent } from './pages/personagens/personagens.component';
import { ComunidadeComponent } from './pages/comunidade/comunidade.component';
import { LayoutComponent } from './layout/layout.component';
import { PlanetasComponent } from './pages/planetas/planetas.component';
import { EspeciesComponent } from './pages/especies/especies.component';
import { NavesComponent } from './pages/naves/naves.component';
import { VeiculosComponent } from './pages/veiculos/veiculos.component';
import { InitialLoadingComponent } from './pages/initial-loading/initial-loading.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'initial-loading', component: InitialLoadingComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'app',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'filmes', component: FilmesComponent },
      { path: 'personagens', component: PersonagensComponent },
      { path: 'planetas', component: PlanetasComponent },
      { path: 'especies', component: EspeciesComponent },
      { path: 'naves', component: NavesComponent },
      { path: 'veiculos', component: VeiculosComponent },
      { path: 'comunidade', component: ComunidadeComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  // TESTE: Acesso direto ao login para testar o preloader original
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
