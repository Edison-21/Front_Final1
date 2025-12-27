import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  selectedRole: number = 1; // 1=Admin, 2=Coordinador, 3=Docente, 4=Usuario
  showPassword: boolean = false;
  errorMessage: string = '';
  isLoading: boolean = false;

  roleOptions = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Coordinador' },
    { id: 3, name: 'Docente' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
  this.errorMessage = '';

  if (!this.email || !this.password) {
    this.errorMessage = 'Por favor, ingrese email y contraseña';
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    this.errorMessage = 'Por favor, ingrese un email válido';
    return;
  }

  this.isLoading = true;

this.authService.login(this.email, this.password).subscribe({
    next: (usuario) => {
      this.isLoading = false;

      const rol = usuario.idRol;

      if (rol === 1 || rol === 2) {
        this.router.navigate(['/inventario']);
      } 
      else if (rol === 3) {
        this.router.navigate(['/portal-docente']);
      } 
      else {
        this.router.navigate(['/portal-usuario']);
      }
    },
    error: () => {
      this.isLoading = false;
      this.errorMessage = 'Email o contraseña incorrectos';
    }
});

}

}

