import { Bien } from './bien.model';

export interface Solicitud {
  idSolicitud?: number;
  bien: any;
  descripcion: string;
  estado: string;
  
}
