import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PreloaderComponent } from '../../components/preloader/preloader.component';

@Component({
  selector: 'app-initial-loading',
  standalone: true,
  imports: [PreloaderComponent],
  template: ` <app-preloader></app-preloader> `,
  styles: [
    `
      :host {
        display: block;
        width: 100vw;
        height: 100vh;
      }
    `,
  ],
})
export class InitialLoadingComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    console.log('🚀 InitialLoadingComponent iniciado!');
    console.log('📱 Preloader deveria estar aparecendo agora...');

    // Simula um tempo de carregamento e depois verifica autenticação
    setTimeout(() => {
      const isLoggedIn = this.authService.isLoggedIn();
      console.log('🔐 Usuário está logado?', isLoggedIn);

      if (isLoggedIn) {
        console.log('✅ Redirecionando para /app/home');
        this.router.navigate(['/app/home']);
      } else {
        console.log('🔑 Redirecionando para /login');
        this.router.navigate(['/login']);
      }
    }, 2000); // 2 segundos - mais rápido
  }
}
