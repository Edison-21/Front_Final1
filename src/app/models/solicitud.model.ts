import { Bien } from './bien.model';

export interface Solicitud {
  id_solicitud: number;
  id_detalle: number;
  id_bien: number;
  estado: string;
  bien?: Bien;
}
