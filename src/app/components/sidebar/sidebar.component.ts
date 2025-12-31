import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  route: string;
  label: string;
  icon?: string;
  roles: number[]; // IDs de roles que pueden ver este item: 1=Admin, 2=Coordinador, 3=Docente, 4=Usuario
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  currentUser = '';
  userRole = '';
  currentRoute: string = '';
  showConfirmLogout: boolean = false;
  isCollapsed: boolean = false;
  menuItems: MenuItem[] = [
    // Menú para Admin
    { route: '/usuarios', label: 'Gestión de Usuarios', roles: [1] },
    { route: '/inventario', label: 'Inventario', roles: [1, 2] },
    { route: '/asignacion-aula', label: 'Asignación de Aula', roles: [1, 2] },
    { route: '/solicitudes-cambio', label: 'Solicitudes de Cambio', roles: [1, 2] },
    { route: '/reportes', label: 'Reportes', roles: [1] },
    // Menú para Docente
    { route: '/portal-docente', label: 'Portal Docente', roles: [3] },
    { route: '/mi-aula-asignada', label: 'Mi Aula Asignada', roles: [3] }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user.nombre;
      this.userRole = this.authService.getCurrentUserRole();
    }
    
    this.currentRoute = this.router.url;
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  getVisibleMenuItems(): MenuItem[] {
    const userRoleId = this.authService.getCurrentUserRoleId();
    return this.menuItems.filter(item => item.roles.includes(userRoleId));
  }

  canSeeMenuItem(item: MenuItem): boolean {
    const userRoleId = this.authService.getCurrentUserRoleId();
    return item.roles.includes(userRoleId);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(route + '/');
  }

  cerrarSesion(): void {
    this.showConfirmLogout = true;
  }

  confirmarCerrarSesion(): void {
    this.showConfirmLogout = false;
    this.authService.logout();
  }

  cancelarCerrarSesion(): void {
    this.showConfirmLogout = false;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    // Actualizar clase en body para que otros componentes se adapten
    if (this.isCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }
}


