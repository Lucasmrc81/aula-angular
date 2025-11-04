import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PreloaderComponent } from '../../components/preloader/preloader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PreloaderComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  [x: string]: any;

  loginForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isRegisterMode = false;
  isUpdatePasswordMode = false;
  showPreloader = true; // Mostrar preloader inicialmente
  // Flags para alternar visibilidade das senhas
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: [''],
    });
  }

  ngOnInit() {
    // Mostrar preloader por 2 segundos, depois mostrar formulário de login
    setTimeout(() => {
      this.showPreloader = false;
    }, 2000);
  }

  toggleRegisterMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.isUpdatePasswordMode = false;
    this.clearMessages();
  }

  toggleUpdatePasswordMode() {
    this.isUpdatePasswordMode = !this.isUpdatePasswordMode;
    this.isRegisterMode = false;
    this.clearMessages();
  }

  toggleShowPassword(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loginForm.get('confirmPassword')?.setValue('');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { email, password, confirmPassword } = this.loginForm.value;

      if (this.isRegisterMode) {
        if (password !== confirmPassword) {
          this.errorMessage = 'As senhas não coincidem!';
          return;
        }
        this.successMessage = 'Cadastro concluído com sucesso!';
        console.log('Cadastro realizado com sucesso:', { email, password });

        setTimeout(() => {
          this.toggleRegisterMode();
        }, 2000);
      } else if (this.isUpdatePasswordMode) {
        if (password !== confirmPassword) {
          this.errorMessage = 'As senhas não coincidem!';
          return;
        }
        this.successMessage = 'Senha atualizada com sucesso!';
        console.log('Senha atualizada com sucesso:', { email, password });

        setTimeout(() => {
          this.toggleUpdatePasswordMode();
        }, 2000);
      } else {
        // Login usando o AuthService
        if (this.authService.login(email, password)) {
          console.log('Login realizado com sucesso:', { email, password });
          this.router.navigate(['/app/home']);
        } else {
          this.errorMessage = 'Credenciais inválidas! Verifique email e senha.';
        }
      }
    } else {
      this.errorMessage = 'Formulário inválido!';
    }
  }

  isFormValid(): boolean {
    return (
      this.loginForm.valid && (this.isRegisterMode || this.isUpdatePasswordMode)
    );
  }
}
