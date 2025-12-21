import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';
import { ApiService } from './api.service';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: Usuario | null = null;
  private rolesMap: Map<number, string> = new Map([
    [1, 'Admin'],
    [2, 'Coordinador'],
    [3, 'Docente'],
    [4, 'Usuario']
  ]);

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  login(email: string, contraseña: string, id_rol: number = 1): boolean {
    // TODO: Implementar autenticación real con API
    // Por ahora, simulación de login
    // id_rol: 1=Admin, 2=Coordinador, 3=Docente, 4=Usuario
    if (email && contraseña) {
      this.currentUser = {
        id_usuario: 1,
        nombre: 'Usuario Demo',
        email: email,
        contraseña: contraseña,
        estado: true,
        fecha_registro: new Date(),
        id_rol: id_rol
      };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): Usuario | null {
    if (!this.currentUser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  getCurrentUserRole(): string {
    const user = this.getCurrentUser();
    if (user) {
      return this.rolesMap.get(user.id_rol) || 'Usuario';
    }
    return 'Usuario';
  }

  getCurrentUserRoleId(): number {
    const user = this.getCurrentUser();
    return user ? user.id_rol : 4; // Default: Usuario
  }

  isAdmin(): boolean {
    return this.getCurrentUserRoleId() === 1;
  }

  isCoordinador(): boolean {
    return this.getCurrentUserRoleId() === 2;
  }

  isDocente(): boolean {
    return this.getCurrentUserRoleId() === 3;
  }

  isUsuario(): boolean {
    return this.getCurrentUserRoleId() === 4;
  }

  hasAccessToRoute(route: string): boolean {
    const roleId = this.getCurrentUserRoleId();
    
    // Rutas solo para Admin
    const adminOnlyRoutes = ['/usuarios', '/reportes'];
    if (adminOnlyRoutes.includes(route) && roleId !== 1) {
      return false;
    }
    
    // Rutas para Admin y Coordinador
    const adminCoordinadorRoutes = ['/inventario', '/asignacion-aula', '/solicitudes-cambio'];
    if (adminCoordinadorRoutes.includes(route) && (roleId !== 1 && roleId !== 2)) {
      return false;
    }
    
    // Rutas para Docente
    const docenteRoutes = ['/portal-docente', '/mi-aula-asignada'];
    if (docenteRoutes.includes(route) && roleId !== 3) {
      return false;
    }
    
    return true;
  }
}
