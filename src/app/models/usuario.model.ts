import { Rol } from './rol.model';

export interface Usuario {
  idUsuario: number;          // viene del backend
  nombre: string;
  email: string;
  contraseña?: string;         // solo para crear / editar
  estado: boolean;
  fechaRegistro?: string;      // backend usa LocalDateTime
  idRol: number;               // 🔴 CLAVE: backend espera idRol
  rol?: Rol;                   // solo para mostrar
}
