import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { Rol } from '../../models/rol.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  currentUser = '';
  searchTerm: string = '';
  showAddModal: boolean = false;
  
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  filteredUsuarios: Usuario[] = [];

  nuevoUsuario: Partial<Usuario> = {
    nombre: '',
    email: '',
    contraseña: '', // Mantenemos el nombre del modelo, pero usamos una variable temporal en el template
    estado: true,
    fecha_registro: new Date().toISOString().split('T')[0],
    id_rol: 0
  };

  // Variable temporal para evitar problemas con caracteres especiales en templates
  passwordTemp: string = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user.nombre;
    }
    this.loadRoles();
    this.loadUsuarios();
  }

  loadRoles(): void {
    this.apiService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        if (roles.length > 0 && !this.nuevoUsuario.id_rol) {
          this.nuevoUsuario.id_rol = roles[0].id_rol;
        }
      },
      error: (error) => {
        console.error('Error cargando roles:', error);
      }
    });
  }

  loadUsuarios(): void {
    this.apiService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.filteredUsuarios = [...usuarios];
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsuarios = [...this.usuarios];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsuarios = this.usuarios.filter(usuario =>
      usuario.email?.toLowerCase().includes(term) ||
      usuario.nombre?.toLowerCase().includes(term) ||
      this.getRolNombre(usuario.id_rol)?.toLowerCase().includes(term)
    );
  }

  openAddModal(): void {
    this.nuevoUsuario = {
      nombre: '',
      email: '',
      contraseña: '',
      estado: true,
      fecha_registro: new Date().toISOString().split('T')[0],
      id_rol: this.roles.length > 0 ? this.roles[0].id_rol : 0
    };
    this.passwordTemp = '';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  saveUsuario(): void {
    if (this.nuevoUsuario.nombre && this.nuevoUsuario.email && 
        this.passwordTemp && this.nuevoUsuario.id_rol) {
      const usuario: Usuario = {
        id_usuario: 0,
        nombre: this.nuevoUsuario.nombre || '',
        email: this.nuevoUsuario.email || '',
        contraseña: this.passwordTemp || '',
        estado: this.nuevoUsuario.estado ?? true,
        fecha_registro: this.nuevoUsuario.fecha_registro || new Date().toISOString(),
        id_rol: this.nuevoUsuario.id_rol || 0
      };

      this.apiService.createUsuario(usuario).subscribe({
        next: (usuarioCreado) => {
          this.usuarios.push(usuarioCreado);
          this.filteredUsuarios = [...this.usuarios];
          this.closeAddModal();
        },
        error: (error) => {
          console.error('Error guardando usuario:', error);
          alert('Error al guardar el usuario. Por favor, intente nuevamente.');
        }
      });
    }
  }

  toggleEstado(usuario: Usuario): void {
    const usuarioActualizado = { ...usuario, estado: !usuario.estado };
    this.apiService.updateUsuario(usuarioActualizado).subscribe({
      next: (usuarioActualizado) => {
        const index = this.usuarios.findIndex(u => u.id_usuario === usuario.id_usuario);
        if (index > -1) {
          this.usuarios[index] = usuarioActualizado;
          this.filteredUsuarios = [...this.usuarios];
        }
      },
      error: (error) => {
        console.error('Error actualizando usuario:', error);
        alert('Error al actualizar el estado del usuario.');
      }
    });
  }

  deleteUsuario(usuario: Usuario): void {
    if (confirm(`¿Está seguro de eliminar al usuario ${usuario.nombre}?`)) {
      this.apiService.deleteUsuario(usuario.id_usuario).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.id_usuario !== usuario.id_usuario);
          this.filteredUsuarios = [...this.usuarios];
        },
        error: (error) => {
          console.error('Error eliminando usuario:', error);
          alert('Error al eliminar el usuario. Por favor, intente nuevamente.');
        }
      });
    }
  }

  getRolNombre(id_rol: number): string {
    const rol = this.roles.find(r => r.id_rol === id_rol);
    return rol ? rol.nombre : 'Sin rol';
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES');
  }
}

