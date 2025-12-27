import { Component, OnInit } from '@angular/core';
import { Solicitud } from '../../models/solicitud.model';
import { Asignacion } from '../../models/asignacion.model';
import { Bien } from '../../models/bien.model';
import { Aula } from '../../models/aula.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BienesService } from '../../services/bienes.service';

@Component({
  selector: 'app-portal-docente',
  templateUrl: './portal-docente.component.html',
  styleUrls: ['./portal-docente.component.scss']
})
export class PortalDocenteComponent implements OnInit {
  currentUser = 'Docente';
  currentUserId: number = 0;

  // Formulario
  aulaSeleccionada: number | null = null;
  tipoSolicitud: string = '';
  detalleProblema?: string ;
bienSeleccionado: number | null = null;

  // Datos
  bienes: Bien[] = [];
  asignaciones: Asignacion[] = [];
  misSolicitudes: Solicitud[] = [];
  aulasAsignadas: Aula[] = [];
  tiposSolicitud: string[] = [
    'Mobiliario (sillas, mesas, pizarrón)',
    'Equipamiento (proyector, PCs, red)',
    'Infraestructura (paredes, luz, aire acondicionado)',
    'Otros (Limpieza, seguridad, etc.)'
  ];
  bienesAsignados: Bien[] = [];

  
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private bienesService: BienesService
  ) {}

 ngOnInit(): void {
  const user = this.authService.getCurrentUser();
  if (user) {
    this.currentUser = user.nombre;
    this.currentUserId = user.idUsuario;
    this.loadAsignaciones(); // Esto iniciará la cadena: asignaciones -> bienes -> aulas
  }
}

onAulaChange(): void {
  if (this.aulaSeleccionada) {
    this.bienesAsignados = this.bienes.filter(
      b => b.aula && b.aula.idAula === this.aulaSeleccionada
    );
  } else {
    this.bienesAsignados = [];
  }
  this.bienSeleccionado = null;
}

loadAsignaciones(): void {
  this.apiService.getAsignaciones().subscribe((asignaciones: Asignacion[]) => {
    this.asignaciones = asignaciones.filter(a => a.usuario.idUsuario === this.currentUserId && a.estado);
    this.loadBienes(); // cargamos bienes primero
  });
}

loadBienes(): void {
  this.apiService.getBienes().subscribe({
    next: (bienes: Bien[]) => {
      this.bienes = bienes;
      this.loadAulas();
      this.loadMisSolicitudes(); // ahora ya tenemos los bienes
    },
    error: (err) => console.error('Error cargando bienes:', err)
  });
}




loadAulas(): void {
  this.aulasAsignadas = [];

  this.bienes.forEach(b => {
    const aula = b.aula;
    if (aula && !this.aulasAsignadas.some(a => a.idAula === aula.idAula)) {
      this.aulasAsignadas.push(aula);
    }
  });

  if (this.aulasAsignadas.length > 0) {
    this.aulaSeleccionada = this.aulasAsignadas[0].idAula;
    this.onAulaChange(); // actualizar bienes asignados
  }
}






loadMisSolicitudes(): void {
  this.apiService.getSolicitudesDocente(this.currentUserId).subscribe({
    next: (solicitudes: Solicitud[]) => {
      this.misSolicitudes = solicitudes;
    },
    error: (err) => console.error('Error cargando solicitudes:', err)
  });
}


 getBienesAsignados(): Bien[] {
  return this.bienes.filter(b => b.aula?.idAula === this.aulaSeleccionada);
}


enviarSolicitud(): void {
  if (!this.bienSeleccionado || !this.tipoSolicitud || !this.detalleProblema) {
    alert('Por favor complete todos los campos');
    return;
  }

  const bienRelacionado = this.bienes.find(b => b.idBien === this.bienSeleccionado);
  if (!bienRelacionado) {
    alert('No se encontró el bien seleccionado');
    return;
  }

  const body = {
    idBien: bienRelacionado.idBien,
    descripcion: `${this.tipoSolicitud}: ${this.detalleProblema}`,
    estado: 'PENDIENTE'
  };

  this.apiService.createSolicitud(body).subscribe({
    next: (res) => {
      (res as any).bien = bienRelacionado;
      this.misSolicitudes.unshift(res);
      alert('Solicitud enviada correctamente');

      // Limpiar formulario
      this.detalleProblema = '';
      this.tipoSolicitud = '';
      this.bienSeleccionado = null;
    },
    error: (err) => {
      console.error('Error al enviar la solicitud:', err);
      alert('Error al enviar la solicitud');
    }
  });
}
}


