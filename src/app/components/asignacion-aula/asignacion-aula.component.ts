import { Component, OnInit } from '@angular/core';
import { Asignacion } from '../../models/asignacion.model';
import { Aula } from '../../models/aula.model';
import { Usuario } from '../../models/usuario.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-asignacion-aula',
  standalone: false,
  templateUrl: './asignacion-aula.component.html',
  styleUrls: ['./asignacion-aula.component.scss']
})
export class AsignacionAulaComponent implements OnInit {
  currentUser: string = 'Administrador';
  
  // Listas
  aulas: Aula[] = [];
  usuarios: Usuario[] = [];
  asignaciones: Asignacion[] = [];
 // Modal editar
showEditModal = false;
asignacionEditando: Asignacion | null = null;

  // Formulario
  selectedUsuarioId: number = 0;
  selectedAulaId: number = 0;
  fechaSolicitud: string = new Date().toISOString().split('T')[0];
nuevoUsuarioId: number  | null = null;
nuevaAulaId: number  | null = null;
nuevaFecha: string = new Date().toISOString().split('T')[0];
editUsuarioId: number = 0;
editAulaId: number = 0;
editFecha: string = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user.nombre || 'Administrador';
    } else {
      this.currentUser = 'Administrador';
    }
    this.loadAulas();
    this.loadUsuarios();
    this.loadAsignaciones();
  }

  loadAulas(): void {
    this.apiService.getAulas().subscribe({
      next: (aulas) => {
        this.aulas = aulas;
      },
      error: (error) => {
        console.error('Error cargando aulas:', error);
      }
    });
  }

  loadUsuarios(): void {
    this.apiService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
      }
    });
  }

  loadAsignaciones(): void {
    this.apiService.getAsignaciones().subscribe({
      next: (asignaciones) => {
        this.asignaciones = asignaciones;
      },
      error: (error) => {
        console.error('Error cargando asignaciones:', error);
      }
    });
  }

registrarAsignacion(): void {
  if (this.nuevoUsuarioId === null || this.nuevaAulaId === null) {
    alert('Por favor seleccione un usuario y un aula');
    return;
  }

  const body = {
    idAula: this.nuevaAulaId,
    idUsuario: this.nuevoUsuarioId
  };

  this.apiService.createAsignacion(body).subscribe({
    next: (asignacionCreada) => {
      this.asignaciones.push(asignacionCreada);
      alert('Asignación registrada exitosamente');
      this.resetForm();
    },
    error: () => alert('Error al guardar la asignación')
  });
}


 resetForm(): void {
  this.nuevoUsuarioId = null;
  this.nuevaAulaId = null;
  this.nuevaFecha = new Date().toISOString().split('T')[0];
}


  getUsuarioNombre(id_usuario: number): string {
    const usuario = this.usuarios.find(u => u.idUsuario === id_usuario);
    return usuario ? usuario.nombre : 'N/A';
  }

  getAulaNombre(idAula: number): string {
  const aula = this.aulas.find(a => a.idAula === idAula);
  return aula ? aula.nombre : 'N/A';
}



getAulasDisponibles(): Aula[] {
  const aulasAsignadas = this.asignaciones
    .filter(a => a.estado)
    .map(a => a.id_aula);

  return this.aulas.filter(
    a => !aulasAsignadas.includes(a.idAula) && a.estado
  );
}

toggleEstadoAsignacion(asignacion: Asignacion): void {
  const body = {
    idUsuario: asignacion.usuario?.idUsuario,
    idAula: asignacion.aula?.idAula,
    estado: !asignacion.estado
  };

  this.apiService
    .updateAsignacion(asignacion.idAsignacion!, body)
    .subscribe({
      next: (res) => {
        const index = this.asignaciones.findIndex(
          a => a.idAsignacion === res.idAsignacion
        );

        if (index !== -1) {
          this.asignaciones[index] = res;
        }
      },
      error: (error) => {
        console.error('Error actualizando asignación:', error);
        alert('Error al actualizar la asignación.');
      }
    });
}


  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES');
  }
  
openEditModal(asignacion: Asignacion): void {
  this.asignacionEditando = asignacion;

  this.editUsuarioId = asignacion.usuario.idUsuario;
  this.editAulaId = asignacion.aula.idAula;
  if (asignacion.fechaSolicitud) {
    this.editFecha = asignacion.fechaSolicitud
      .toString()
      .substring(0, 10);
  } else {
    this.editFecha = '';
  }
  this.showEditModal = true;
}




closeEditModal(): void {
  this.showEditModal = false;
  this.asignacionEditando = null;
}


eliminarAsignacion(id: number): void {
  if (!confirm('¿Seguro que deseas eliminar esta asignación?')) return;

  this.apiService.deleteAsignacion(id).subscribe({
    next: () => {
      this.asignaciones = this.asignaciones.filter(a => a.idAsignacion !== id);
      alert('Asignación eliminada');
    },
    error: () => alert('Error al eliminar la asignación')
  });
}
updateAsignacion(): void {
  if (!this.asignacionEditando) return;

  const body = {
    idUsuario: this.editUsuarioId,
    idAula: this.editAulaId,
    estado: this.asignacionEditando.estado
  };

  this.apiService
    .updateAsignacion(this.asignacionEditando.idAsignacion!, body)
    .subscribe({
      next: (res) => {
        const i = this.asignaciones.findIndex(
          a => a.idAsignacion === res.idAsignacion
        );
        if (i !== -1) this.asignaciones[i] = res;

        alert('Asignación actualizada');
        this.closeEditModal();
      },
      error: () => alert('Error al actualizar')
    });
}




}

