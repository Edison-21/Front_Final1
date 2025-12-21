import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const requiredRole = route.data['role'] as number[];
    if (requiredRole && !requiredRole.includes(user.id_rol)) {
      // Redirigir según el rol del usuario
      const roleId = user.id_rol;
      if (roleId === 3) {
        this.router.navigate(['/portal-docente']);
      } else if (roleId === 1 || roleId === 2) {
        this.router.navigate(['/inventario']);
      } else {
        this.router.navigate(['/login']);
      }
      return false;
    }

    return true;
  }
}
