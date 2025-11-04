import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('🛡️ AuthGuard verificando login:', isLoggedIn);

    if (isLoggedIn) {
      console.log('✅ AuthGuard: Usuário autenticado, permitindo acesso');
      return true;
    } else {
      console.log(
        '❌ AuthGuard: Usuário não autenticado, redirecionando para login'
      );
      this.router.navigate(['/login']);
      return false;
    }
  }
}
