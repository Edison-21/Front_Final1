import { Component, OnInit } from '@angular/core';
import { Solicitud } from '../../models/solicitud.model';
import { Asignacion } from '../../models/asignacion.model';
import { Bien } from '../../models/bien.model';
import { Aula } from '../../models/aula.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-portal-docente',
  standalone: false,
  templateUrl: './portal-docente.component.html',
  styleUrls: ['./portal-docente.component.scss']
})
export class PortalDocenteComponent implements OnInit {
  currentUser = '';
  currentUserId: number = 0;
  
  // Formulario
  selectedBienId: number = 0;
  detalleProblema: string = '';
  aulaSeleccionada: string = '';
  tipoSolicitud: string = '';
  
  // Datos
  bienes: Bien[] = [];
  asignaciones: Asignacion[] = [];
  misSolicitudes: Solicitud[] = [];
  aulas: Aula[] = [];
  tiposSolicitud: string[] = [
    'Mobiliario (sillas, mesas, pizarrón)',
    'Equipamiento (proyector, PCs, red)',
    'Infraestructura (paredes, luz, aire acondicionado)',
    'Otros (Limpieza, seguridad, etc.)'
  ];
  
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user.nombre;
      this.currentUserId = user.id_usuario;
      this.loadAsignaciones();
      this.loadBienes();
      this.loadMisSolicitudes();
    }
  }

  loadAsignaciones(): void {
    this.apiService.getAsignaciones().subscribe({
      next: (asignaciones) => {
        this.asignaciones = asignaciones.filter(a => a.id_usuario === this.currentUserId && a.estado);
        // Cargar aulas después de tener asignaciones
        this.loadAulas();
      },
      error: (error) => {
        console.error('Error cargando asignaciones:', error);
      }
    });
  }

  loadAulas(): void {
    this.apiService.getAulas().subscribe({
      next: (aulas) => {
        // Obtener solo las aulas asignadas al usuario
        const misAulasIds = this.asignaciones.map(a => a.id_aula);
        this.aulas = aulas.filter(a => misAulasIds.includes(a.id_aula));
      },
      error: (error) => {
        console.error('Error cargando aulas:', error);
      }
    });
  }

  loadBienes(): void {
    this.apiService.getBienes().subscribe({
      next: (bienes) => {
        this.bienes = bienes;
      },
      error: (error) => {
        console.error('Error cargando bienes:', error);
      }
    });
  }

  loadMisSolicitudes(): void {
    this.apiService.getSolicitudes().subscribe({
      next: (solicitudes) => {
        // Filtrar solicitudes relacionadas con bienes asignados al usuario
        const misBienesIds = this.getBienesAsignados().map(b => b.id_bien);
        this.misSolicitudes = solicitudes.filter(s => misBienesIds.includes(s.id_bien));
      },
      error: (error) => {
        console.error('Error cargando solicitudes:', error);
      }
    });
  }

  getBienesAsignados(): Bien[] {
    // Obtener bienes asignados a las aulas del docente
    const misAulasIds = this.asignaciones.map(a => a.id_aula);
    return this.bienes.filter(b => {
      // Aquí asumimos que los bienes tienen una relación con aulas
      // Ajustar según la lógica real de negocio
      return true; // Por ahora mostrar todos los bienes disponibles
    });
  }

  enviarSolicitud(): void {
    if (!this.aulaSeleccionada || !this.tipoSolicitud || !this.detalleProblema) {
      alert('Por favor complete todos los campos');
      return;
    }

    // Encontrar un bien relacionado con el aula seleccionada
    const aula = this.aulas.find(a => a.nombre === this.aulaSeleccionada);
    const bienRelacionado = this.bienes.find(b => b.ubicacion === this.aulaSeleccionada);
    
    if (!bienRelacionado) {
      alert('No se encontró un bien relacionado con el aula seleccionada');
      return;
    }

    this.selectedBienId = bienRelacionado.id_bien;

    const nuevaSolicitud: Solicitud = {
      id_solicitud: 0,
      id_detalle: 0,
      id_bien: this.selectedBienId,
      estado: 'Pendiente'
    };

    // TODO: Implementar creación de solicitud con detalle
    this.misSolicitudes.unshift(nuevaSolicitud);
    
    // Resetear formulario
    this.selectedBienId = 0;
    this.aulaSeleccionada = '';
    this.tipoSolicitud = '';
    this.detalleProblema = '';
    
    alert('Solicitud enviada exitosamente');
  }
}








