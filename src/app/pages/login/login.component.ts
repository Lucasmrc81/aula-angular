import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  [x: string]: any;

  loginForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isRegisterMode = false;
  isUpdatePasswordMode = false;

  isLoading = true;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: [''],
    });
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
        console.log('Login realizado com sucesso:', { email, password });
        localStorage.setItem('token', 'fake-token');
        console.log('Redirecionando para /home');
        this.router.navigate(['/home']);
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
