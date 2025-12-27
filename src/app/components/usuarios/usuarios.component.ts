import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { Rol } from '../../models/rol.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  currentUser: string = 'Administrador';
  searchTerm = '';
  showAddModal = false;
  showEditModal = false;


  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  roles: Rol[] = [];

  nuevoUsuario: Partial<Usuario> = {
    nombre: '',
    email: '',
    estado: true,
    fechaRegistro: new Date().toISOString(),
    idRol: 0
  };

  passwordTemp = '';
isEditMode: boolean = false;
usuarioEditId: number | null = null;

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
      next: roles => {
        this.roles = roles;
        if (roles.length && !this.nuevoUsuario.idRol) {
          this.nuevoUsuario.idRol = roles[0].idRol;
        }
      },
      error: err => console.error('Error cargando roles', err)
    });
  }

  loadUsuarios(): void {
    this.apiService.getUsuarios().subscribe({
      next: usuarios => {
        this.usuarios = usuarios;
        this.filteredUsuarios = [...usuarios];
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredUsuarios = [...this.usuarios];
      return;
    }

    this.filteredUsuarios = this.usuarios.filter(u =>
      u.nombre.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      this.getRolNombre(u.idRol).toLowerCase().includes(term)
    );
  }

  openEditModal(usuario: Usuario): void {
  this.usuarioEditId = usuario.idUsuario;

  this.nuevoUsuario = {
    nombre: usuario.nombre,
    email: usuario.email,
    estado: usuario.estado,
    idRol: usuario.idRol
  };

  this.showEditModal = true;
}

closeEditModal(): void {
  this.showEditModal = false;
  this.usuarioEditId = null;
}

  closeAddModal(): void {
    this.showAddModal = false;
  }

  saveUsuario(): void {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email || !this.passwordTemp) {
      return;
    }

    const usuario: Usuario = {
      idUsuario: 0,
      nombre: this.nuevoUsuario.nombre,
      email: this.nuevoUsuario.email,
      contraseña: this.passwordTemp,
      estado: this.nuevoUsuario.estado ?? true,
      fechaRegistro: this.nuevoUsuario.fechaRegistro!,
      idRol: this.nuevoUsuario.idRol!
    };

    this.apiService.createUsuario(usuario).subscribe({
      next: u => {
        this.usuarios.push(u);
        this.filteredUsuarios = [...this.usuarios];
        this.closeAddModal();
      },
      error: err => {
        console.error(err);
        alert('Error al crear usuario');
      }
    });
  }

  toggleEstado(usuario: Usuario): void {
  const payload = {
    nombre: usuario.nombre,
    email: usuario.email,
    estado: !usuario.estado,
    idRol: usuario.idRol
  };

  this.apiService.updateUsuario(usuario.idUsuario, payload).subscribe({
    next: (usuarioActualizado) => {
      usuario.estado = usuarioActualizado.estado;
    },
    error: () => {
      alert('No se pudo actualizar el estado');
    }
  });
}


  deleteUsuario(usuario: Usuario): void {
    if (!usuario.idUsuario) return;

    if (confirm(`¿Eliminar a ${usuario.nombre}?`)) {
      this.apiService.deleteUsuario(usuario.idUsuario).subscribe({
        next: () => {
          this.usuarios = this.usuarios.filter(u => u.idUsuario !== usuario.idUsuario);
          this.filteredUsuarios = [...this.usuarios];
        },
        error: err => console.error(err)
      });
    }
  }

  getRolNombre(idRol: number): string {
    const rol = this.roles.find(r => r.idRol === idRol);
    return rol ? rol.nombre : 'Sin rol';
  }

 formatDate(fecha?: string | Date): string {
  if (!fecha) {
    return '—';
  }

  const date = new Date(fecha);
  return date.toLocaleDateString('es-EC');
}
updateUsuario(): void {
  if (!this.usuarioEditId) return;

  const payload = {
    nombre: this.nuevoUsuario.nombre,
    email: this.nuevoUsuario.email,
    estado: this.nuevoUsuario.estado,
    idRol: this.nuevoUsuario.idRol
  };

  this.apiService.updateUsuario(this.usuarioEditId, payload).subscribe({
    next: (usuarioActualizado) => {
      const index = this.usuarios.findIndex(u => u.idUsuario === this.usuarioEditId);
      if (index !== -1) {
        this.usuarios[index] = usuarioActualizado;
        this.filteredUsuarios = [...this.usuarios];
      }
      this.closeEditModal();
    },
    error: () => {
      alert('Error al actualizar usuario');
    }
  });
}
openAddModal(): void {
  this.isEditMode = false;
  this.usuarioEditId = null;

  this.nuevoUsuario = {
    nombre: '',
    email: '',
    estado: true,
    fechaRegistro: new Date().toISOString(),
    idRol: this.roles.length ? this.roles[0].idRol : 0
  };

  this.passwordTemp = '';
  this.showAddModal = true;
}


editUser(usuario: any) {
  console.log('Editar usuario', usuario);
}

deleteUser(id: number) {
  console.log('Eliminar usuario', id);
}


}
