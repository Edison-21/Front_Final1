import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Bien } from '../models/bien.model';
import { Categoria } from '../models/categoria.model';
import { Usuario } from '../models/usuario.model';
import { Rol } from '../models/rol.model';
import { Aula } from '../models/aula.model';
import { Asignacion } from '../models/asignacion.model';
import { Docente } from '../models/docente.model';
import { Solicitud } from '../models/solicitud.model';
import { Notificacion } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  // TODO: Reemplazar con llamadas HTTP reales a la API
  
  // Simulación de datos para desarrollo
  private categorias: Categoria[] = [
    { id_categoria: 1, nombre: 'Equipos de Cómputo' },
    { id_categoria: 2, nombre: 'Mobiliario' },
    { id_categoria: 3, nombre: 'Equipos de Laboratorio' },
    { id_categoria: 4, nombre: 'Equipos Audiovisuales' }
  ];

  private roles: Rol[] = [
    { id_rol: 1, nombre: 'Admin' },
    { id_rol: 2, nombre: 'Coordinador' },
    { id_rol: 3, nombre: 'Docente' },
    { id_rol: 4, nombre: 'Usuario' }
  ];

  // Métodos para Categorías
  getCategorias(): Observable<Categoria[]> {
    return of(this.categorias).pipe(delay(300));
  }

  getCategoriaById(id: number): Observable<Categoria | null> {
    const categoria = this.categorias.find(c => c.id_categoria === id);
    return of(categoria || null).pipe(delay(300));
  }

  createCategoria(categoria: Categoria): Observable<Categoria> {
    categoria.id_categoria = this.categorias.length + 1;
    this.categorias.push(categoria);
    return of(categoria).pipe(delay(300));
  }

  updateCategoria(categoria: Categoria): Observable<Categoria> {
    const index = this.categorias.findIndex(c => c.id_categoria === categoria.id_categoria);
    if (index >= 0) {
      this.categorias[index] = categoria;
    }
    return of(categoria).pipe(delay(300));
  }

  deleteCategoria(id: number): Observable<boolean> {
    const index = this.categorias.findIndex(c => c.id_categoria === id);
    if (index >= 0) {
      this.categorias.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  // Métodos para Roles
  getRoles(): Observable<Rol[]> {
    return of(this.roles).pipe(delay(300));
  }

  // Métodos para Usuarios
  getUsuarios(): Observable<Usuario[]> {
    // TODO: Implementar con datos reales
    return of([]).pipe(delay(300));
  }

  getUsuarioById(id: number): Observable<Usuario | null> {
    return of(null).pipe(delay(300));
  }

  createUsuario(usuario: Usuario): Observable<Usuario> {
    return of(usuario).pipe(delay(300));
  }

  updateUsuario(usuario: Usuario): Observable<Usuario> {
    return of(usuario).pipe(delay(300));
  }

  deleteUsuario(id: number): Observable<boolean> {
    return of(true).pipe(delay(300));
  }

  // Métodos para Bienes
  getBienes(): Observable<Bien[]> {
    return of([]).pipe(delay(300));
  }

  getBienById(id: number): Observable<Bien | null> {
    return of(null).pipe(delay(300));
  }

  createBien(bien: Bien): Observable<Bien> {
    return of(bien).pipe(delay(300));
  }

  updateBien(bien: Bien): Observable<Bien> {
    return of(bien).pipe(delay(300));
  }

  deleteBien(id: number): Observable<boolean> {
    return of(true).pipe(delay(300));
  }

  // Métodos para Aulas
  getAulas(): Observable<Aula[]> {
    return of([]).pipe(delay(300));
  }

  createAula(aula: Aula): Observable<Aula> {
    return of(aula).pipe(delay(300));
  }

  updateAula(aula: Aula): Observable<Aula> {
    return of(aula).pipe(delay(300));
  }

  // Métodos para Asignaciones
  getAsignaciones(): Observable<Asignacion[]> {
    return of([]).pipe(delay(300));
  }

  createAsignacion(asignacion: Asignacion): Observable<Asignacion> {
    return of(asignacion).pipe(delay(300));
  }

  updateAsignacion(asignacion: Asignacion): Observable<Asignacion> {
    return of(asignacion).pipe(delay(300));
  }

  // Métodos para Docentes
  getDocentes(): Observable<Docente[]> {
    return of([]).pipe(delay(300));
  }

  // Métodos para Solicitudes
  getSolicitudes(): Observable<Solicitud[]> {
    return of([]).pipe(delay(300));
  }

  updateSolicitud(solicitud: Solicitud): Observable<Solicitud> {
    return of(solicitud).pipe(delay(300));
  }

  // Métodos para Notificaciones
  getNotificaciones(): Observable<Notificacion[]> {
    return of([]).pipe(delay(300));
  }

  marcarNotificacionLeida(id: number): Observable<boolean> {
    return of(true).pipe(delay(300));
  }
}
