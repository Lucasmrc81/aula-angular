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
  loginForm: FormGroup;
  errorMessage = '';
  successMessage = ''; // Mensagem de sucesso
  isRegisterMode = false; // Define se está no modo de cadastro
  isUpdatePasswordMode = false; // Define se está no modo de atualização de senha

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: [''], // Campo opcional, só será validado no modo de cadastro ou atualização
    });
  }

  toggleRegisterMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.isUpdatePasswordMode = false; // Sai do modo de atualização de senha
    this.clearMessages();
  }

  toggleUpdatePasswordMode() {
    this.isUpdatePasswordMode = !this.isUpdatePasswordMode;
    this.isRegisterMode = false; // Sai do modo de cadastro
    this.clearMessages();
  }

  clearMessages() {
    this.errorMessage = ''; // Limpa mensagens de erro
    this.successMessage = ''; // Limpa mensagens de sucesso
    this.loginForm.get('confirmPassword')?.setValue(''); // Limpa o campo
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

        // Exibe a mensagem de sucesso e retorna ao modo de login após 2 segundos
        setTimeout(() => {
          this.toggleRegisterMode(); // Volta ao modo de login
        }, 2000);
      } else if (this.isUpdatePasswordMode) {
        if (password !== confirmPassword) {
          this.errorMessage = 'As senhas não coincidem!';
          return;
        }
        this.successMessage = 'Senha atualizada com sucesso!';
        console.log('Senha atualizada com sucesso:', { email, password });

        // Exibe a mensagem de sucesso e retorna ao modo de login após 2 segundos
        setTimeout(() => {
          this.toggleUpdatePasswordMode(); // Volta ao modo de login
        }, 2000);
      } else {
        // Login de apresentação: redireciona diretamente para /home
        console.log('Login realizado com sucesso:', { email, password });
        localStorage.setItem('token', 'fake-token'); // Apenas para simulação
        console.log('Redirecionando para /home'); // Log para depuração
        this.router.navigate(['/home']); // Redireciona para a tela "Home"
      }
    } else {
      this.errorMessage = 'Formulário inválido!';
    }
  }

  isFormValid(): boolean {
    // Verifica se o formulário é válido no modo de cadastro ou atualização de senha
    return (
      this.loginForm.valid && (this.isRegisterMode || this.isUpdatePasswordMode)
    );
  }
}
