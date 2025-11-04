import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor() {
    // Verificar se já existe um token/sessão salva no localStorage
    const token = localStorage.getItem('userToken');
    if (token) {
      this.isLoggedInSubject.next(true);
    }
  }

  // Método para fazer login
  login(email: string, password: string): boolean {
    // Aqui você pode implementar a lógica real de autenticação
    // Por ora, vamos aceitar qualquer email/senha válidos
    if (email && password && password.length >= 8) {
      localStorage.setItem('userToken', 'fake-jwt-token');
      localStorage.setItem('userEmail', email);
      this.isLoggedInSubject.next(true);
      return true;
    }
    return false;
  }

  // Método para fazer logout
  logout(): void {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    this.isLoggedInSubject.next(false);
  }

  // Verificar se está logado
  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  // Obter dados do usuário
  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }
}
