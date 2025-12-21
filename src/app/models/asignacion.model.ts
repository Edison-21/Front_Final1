import { Aula } from './aula.model';
import { Usuario } from './usuario.model';

export interface Asignacion {
  id_asignacion: number;
  id_usuario: number;
  id_aula: number;
  fecha_solicitud: Date | string;
  estado: boolean;
  usuario?: Usuario;
  aula?: Aula;
}
