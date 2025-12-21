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
    { id: 4, name: 'Usuario' }
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

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.errorMessage = 'Por favor, ingrese un email válido';
      return;
    }

    this.isLoading = true;

    // Usar el servicio de autenticación
    if (this.authService.login(this.email, this.password, this.selectedRole)) {
      setTimeout(() => {
        this.isLoading = false;
        // Redirigir según el rol
        const roleId = this.selectedRole;
        if (roleId === 3) {
          // Docente
          this.router.navigate(['/portal-docente']);
        } else if (roleId === 1 || roleId === 2) {
          // Admin o Coordinador
          this.router.navigate(['/inventario']);
        } else {
          // Usuario
          this.router.navigate(['/login']);
        }
      }, 500);
    } else {
      this.isLoading = false;
      this.errorMessage = 'Email o contraseña incorrectos';
    }
  }
}

