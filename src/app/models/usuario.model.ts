import { Rol } from './rol.model';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  contraseña: string;
  estado: boolean;
  fecha_registro: Date | string;
  id_rol: number;
  rol?: Rol;
}
