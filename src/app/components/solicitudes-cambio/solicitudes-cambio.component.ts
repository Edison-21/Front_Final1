import { Component, OnInit } from '@angular/core';
import { Solicitud } from '../../models/solicitud.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-solicitudes-cambio',
  standalone: false,
  templateUrl: './solicitudes-cambio.component.html',
  styleUrls: ['./solicitudes-cambio.component.scss']
})
export class SolicitudesCambioComponent implements OnInit {
  currentUser = '';
  showDetailModal: boolean = false;
  selectedSolicitud: Solicitud | null = null;
  showConfirmModal: boolean = false;
  confirmMessage: string = '';
  confirmAction: 'aceptar' | 'rechazar' | null = null;
  solicitudToProcess: Solicitud | null = null;

  solicitudes: Solicitud[] = [];
  filteredSolicitudes: Solicitud[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user.nombre;
    }
    this.loadSolicitudes();
  }

  loadSolicitudes(): void {
    this.apiService.getSolicitudes().subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes;
        this.filteredSolicitudes = [...solicitudes];
      },
      error: (error) => {
        console.error('Error cargando solicitudes:', error);
      }
    });
  }

  viewDetails(solicitud: Solicitud): void {
    this.selectedSolicitud = solicitud;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedSolicitud = null;
  }

  openConfirmModal(solicitud: Solicitud, action: 'aceptar' | 'rechazar'): void {
    this.solicitudToProcess = solicitud;
    this.confirmAction = action;
    if (action === 'aceptar') {
      this.confirmMessage = `¿Está seguro de aceptar la solicitud #${solicitud.id_solicitud}?`;
    } else {
      this.confirmMessage = `¿Está seguro de rechazar la solicitud #${solicitud.id_solicitud}?`;
    }
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.confirmMessage = '';
    this.confirmAction = null;
    this.solicitudToProcess = null;
  }

  confirmActionExecute(): void {
    if (!this.solicitudToProcess || !this.confirmAction) return;

    const solicitudActualizada: Solicitud = {
      ...this.solicitudToProcess,
      estado: this.confirmAction === 'aceptar' ? 'Aceptada' : 'Rechazada'
    };

    this.apiService.updateSolicitud(solicitudActualizada).subscribe({
      next: (solicitud) => {
        const index = this.solicitudes.findIndex(s => s.id_solicitud === solicitud.id_solicitud);
        if (index > -1) {
          this.solicitudes[index] = solicitud;
          this.filteredSolicitudes = [...this.solicitudes];
          this.showSuccessMessage(
            this.confirmAction === 'aceptar' 
              ? 'Solicitud aceptada exitosamente' 
              : 'Solicitud rechazada'
          );
        }
        this.closeDetailModal();
        this.closeConfirmModal();
      },
      error: (error) => {
        console.error('Error actualizando solicitud:', error);
        alert('Error al procesar la solicitud. Por favor, intente nuevamente.');
      }
    });
  }

  aceptarSolicitud(solicitud: Solicitud): void {
    this.openConfirmModal(solicitud, 'aceptar');
  }

  rechazarSolicitud(solicitud: Solicitud): void {
    this.openConfirmModal(solicitud, 'rechazar');
  }

  aceptarDesdeTabla(solicitud: Solicitud): void {
    this.openConfirmModal(solicitud, 'aceptar');
  }

  rechazarDesdeTabla(solicitud: Solicitud): void {
    this.openConfirmModal(solicitud, 'rechazar');
  }

  showSuccessToast: boolean = false;
  successMessage: string = '';

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
      this.successMessage = '';
    }, 3000);
  }

  closeSuccessMessage(): void {
    this.showSuccessToast = false;
    this.successMessage = '';
  }
}

