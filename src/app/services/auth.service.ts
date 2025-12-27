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
  private redirectByRole(roleId: number): void {
  switch (roleId) {
    case 1:
      this.router.navigate(['/admin']);
      break;
    case 2:
      this.router.navigate(['/coordinador']);
      break;
    case 3:
      this.router.navigate(['/docente']);
      break;
    default:
      this.router.navigate(['/usuario']);
      break;
  }
}

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    {
  window.addEventListener('beforeunload', () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  });
  } }

 login(email: string, contraseña: string): Observable<Usuario> {
  return this.apiService.post<any>('auth/login', {
    email: email,
    password: contraseña
  }).pipe(
    map(response => {

      const usuario: Usuario = {
        idUsuario: 0, // no viene del back
        nombre: '',
        email: response.email,
        contraseña: '',
        estado: true,
        fechaRegistro: new Date().toISOString(),
        idRol: this.mapRolToId(response.rol)
      };

      this.currentUser = usuario;
      localStorage.setItem('currentUser', JSON.stringify(usuario));
      localStorage.setItem('token', response.token);

            this.redirectByRole(usuario.idRol);

      return usuario;
    })
  );
}
private mapRolToId(rol: string): number {
  switch (rol) {
    case 'ADMIN': return 1;
    case 'COORDINADOR': return 2;
    case 'DOCENTE': return 3;
    default: return 4;
  }
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
      return this.rolesMap.get(user.idRol) || 'Usuario';
    }
    return 'Usuario';
  }

  getCurrentUserRoleId(): number {
    const user = this.getCurrentUser();
    return user ? user.idRol : 4; // Default: Usuario
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
