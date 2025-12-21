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
  currentUser = '';
  
  // Listas
  aulas: Aula[] = [];
  usuarios: Usuario[] = [];
  asignaciones: Asignacion[] = [];
  
  // Formulario
  selectedUsuarioId: number = 0;
  selectedAulaId: number = 0;
  fechaSolicitud: string = new Date().toISOString().split('T')[0];

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user.nombre;
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
    if (!this.selectedUsuarioId || !this.selectedAulaId) {
      alert('Por favor seleccione un usuario y un aula');
      return;
    }

    const asignacion: Asignacion = {
      id_asignacion: 0,
      id_usuario: this.selectedUsuarioId,
      id_aula: this.selectedAulaId,
      fecha_solicitud: this.fechaSolicitud,
      estado: true
    };

    this.apiService.createAsignacion(asignacion).subscribe({
      next: (asignacionCreada) => {
        this.asignaciones.push(asignacionCreada);
        alert('Asignación registrada exitosamente');
        this.resetForm();
      },
      error: (error) => {
        console.error('Error guardando asignación:', error);
        alert('Error al guardar la asignación. Por favor, intente nuevamente.');
      }
    });
  }

  resetForm(): void {
    this.selectedUsuarioId = 0;
    this.selectedAulaId = 0;
    this.fechaSolicitud = new Date().toISOString().split('T')[0];
  }

  getUsuarioNombre(id_usuario: number): string {
    const usuario = this.usuarios.find(u => u.id_usuario === id_usuario);
    return usuario ? usuario.nombre : 'N/A';
  }

  getAulaNombre(id_aula: number): string {
    const aula = this.aulas.find(a => a.id_aula === id_aula);
    return aula ? aula.nombre : 'N/A';
  }

  getAulasDisponibles(): Aula[] {
    const aulasAsignadas = this.asignaciones
      .filter(a => a.estado)
      .map(a => a.id_aula);
    return this.aulas.filter(a => !aulasAsignadas.includes(a.id_aula) && a.estado);
  }

  toggleEstadoAsignacion(asignacion: Asignacion): void {
    const asignacionActualizada = { ...asignacion, estado: !asignacion.estado };
    this.apiService.updateAsignacion(asignacionActualizada).subscribe({
      next: (asignacionActualizada) => {
        const index = this.asignaciones.findIndex(a => a.id_asignacion === asignacion.id_asignacion);
        if (index > -1) {
          this.asignaciones[index] = asignacionActualizada;
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
}

