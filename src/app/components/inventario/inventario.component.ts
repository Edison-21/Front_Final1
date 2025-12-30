import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { BienesService } from '../../services/bienes.service';
import { CategoriasService } from '../../services/categorias.service';
import { AulasService } from '../../services/aulas.service';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent implements OnInit {

  // 👤 Usuario
  currentUser: string = 'Administrador';

  // 🆕 Nuevo bien
  nuevoBien: any = {
  codigoBien: '',
  nombreBien: '',
  tipoBien: '',
  claseBien: '',
  cuentaTipoBien: '',
  codigoInventario: '',
  codigoSecap: '',
  descripcion: '',
  especificaciones: '',
  marca: '',
  modelo: '',
  serie: '',
  valorCompraInicial: null,
  valorConIva: null,
  estado: '',
  detalleEstado: '',
  custodio: '',
  ubicacion: '',
  provincia: '',
  observaciones: '',
  observaciones2: '',
  origen: 'INVENTARIO',
  idCategoria: null,
  idAula: null
};
    aulas: any[] = [];


  // 📊 Contadores
  totalBienes = 0;
  totalCategorias = 0;
  bienesDisponibles = 0;
  bienesAsignados = 0;

  // 🔽 Filtros
  selectedFilter: string = 'Mostrar todos';
  showFilterDropdown = false;
  selectedBien: any = {
  categoria: { idCategoria: null },
  aula: { idAula: null }
};

  filterOptions: string[] = [
    'Mostrar todos',
    'Disponible',
    'Asignado',
    'En Mantenimiento',
    'Dañado',
    'Baja'
  ];

  // 📋 Datos
  bienes: any[] = [];
  filteredBienes: any[] = [];
  categorias: any[] = [];

  // 🪟 Modales
  showAddModal = false;
  showCategoryModal = false;
  showDetailModal = false;

  searchTerm = '';

  nuevaCategoria: any = { nombre: '' };

  constructor(
    private bienesService: BienesService,
    private categoriasService: CategoriasService,
      private aulasService: AulasService

  ) {}

  ngOnInit(): void {
    this.loadBienes();
    this.loadCategorias();
      this.loadAulas();
  }

  // 📦 Cargar bienes
  loadBienes() {
    this.bienesService.getAll().subscribe(data => {
      this.bienes = data;
      this.filteredBienes = data;
      this.totalBienes = data.length;
    });
  }

  // 📂 Cargar categorías
  loadCategorias() {
    this.categoriasService.getAll().subscribe(data => {
      this.categorias = data;
      this.totalCategorias = data.length;
    });
  }

  // 🏷️ Nombre categoría
  getCategoriaNombre(categoria: any): string {
    return categoria?.nombre || 'Sin categoría';
  }

  // 🔍 Buscar
  onSearch() {
    this.applyFilters();
  }

  // ➕ Modal Bien
  openAddModal() {
    this.resetForm();
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  // ✅ Validar bien
 validarBien(): boolean {
  const b = this.nuevoBien;

  // Validar campos de texto
  if (!b.codigoBien || b.codigoBien.trim() === '') {
    Swal.fire('Campos incompletos', 'El campo "Código del bien" es obligatorio', 'warning');
    return false;
  }
  if (!b.nombreBien || b.nombreBien.trim() === '') {
    Swal.fire('Campos incompletos', 'El campo "Nombre del bien" es obligatorio', 'warning');
    return false;
  }
  if (!b.tipoBien || b.tipoBien.trim() === '') {
    Swal.fire('Campos incompletos', 'El campo "Tipo de bien" es obligatorio', 'warning');
    return false;
  }
  if (!b.claseBien || b.claseBien.trim() === '') {
    Swal.fire('Campos incompletos', 'El campo "Clase del bien" es obligatorio', 'warning');
    return false;
  }
  if (!b.cuentaTipoBien || b.cuentaTipoBien.trim() === '') {
    Swal.fire('Campos incompletos', 'El campo "Cuenta tipo bien" es obligatorio', 'warning');
    return false;
  }
  if (!b.codigoInventario || b.codigoInventario.trim() === '') {
    Swal.fire('Campos incompletos', 'El campo "Código inventario" es obligatorio', 'warning');
    return false;
  }
  if (!b.codigoSecap || b.codigoSecap.trim() === '') {
    Swal.fire('Campos incompletos', 'El campo "Código SECAP" es obligatorio', 'warning');
    return false;
  }
  if (!b.estado || b.estado.trim() === '') {
    Swal.fire('Campos incompletos', 'El campo "Estado" es obligatorio', 'warning');
    return false;
  }
  if (!b.ubicacion || b.ubicacion.trim() === '') {
    Swal.fire('Campos incompletos', 'El campo "Ubicación" es obligatorio', 'warning');
    return false;
  }
  if (!b.provincia || b.provincia.trim() === '') {
    Swal.fire('Campos incompletos', 'El campo "Provincia" es obligatorio', 'warning');
    return false;
  }
  if (!b.custodio || b.custodio.trim() === '') {
    Swal.fire('Campos incompletos', 'El campo "Custodio" es obligatorio', 'warning');
    return false;
  }

  // Validar valores numéricos (pueden ser 0, pero no null/undefined/vacío)
  if (b.valorCompraInicial === null || b.valorCompraInicial === undefined || b.valorCompraInicial === '') {
    Swal.fire('Campos incompletos', 'El campo "Valor compra inicial" es obligatorio', 'warning');
    return false;
  }
  if (isNaN(Number(b.valorCompraInicial))) {
    Swal.fire('Campos incompletos', 'El campo "Valor compra inicial" debe ser un número válido', 'warning');
    return false;
  }

  if (b.valorConIva === null || b.valorConIva === undefined || b.valorConIva === '') {
    Swal.fire('Campos incompletos', 'El campo "Valor con IVA" es obligatorio', 'warning');
    return false;
  }
  if (isNaN(Number(b.valorConIva))) {
    Swal.fire('Campos incompletos', 'El campo "Valor con IVA" debe ser un número válido', 'warning');
    return false;
  }

  // Validar categoría
  if (!b.idCategoria || b.idCategoria === null || b.idCategoria === undefined || b.idCategoria === '') {
    Swal.fire('Campos incompletos', 'Debe seleccionar una categoría', 'warning');
    return false;
  }

  console.log('✅ Validación exitosa');
  return true;
}

  loadAulas() {
  this.aulasService.getAll().subscribe(data => {
    this.aulas = data;
  });
}

  // 💾 Guardar bien
  saveBien() {
    if (!this.validarBien()) return;

    // Convertir valores numéricos explícitamente
    const valorCompra = Number(this.nuevoBien.valorCompraInicial) || 0;
    const valorIva = Number(this.nuevoBien.valorConIva) || 0;

    // Mapear los campos al formato que espera el backend
    const bienParaEnviar = {
      codigo_bien: (this.nuevoBien.codigoBien || '').trim(),
      codigo_inventario: (this.nuevoBien.codigoInventario || '').trim(),
      codigo_secap: (this.nuevoBien.codigoSecap || '').trim(),
      nombre_bien: (this.nuevoBien.nombreBien || '').trim(),
      descripcion: (this.nuevoBien.descripcion || '').trim(),
      tipo_bien: (this.nuevoBien.tipoBien || '').trim(),
      clase_bien: (this.nuevoBien.claseBien || '').trim(),
      cuenta_tipo_bien: (this.nuevoBien.cuentaTipoBien || '').trim(),
      marca: (this.nuevoBien.marca || '').trim(),
      modelo: (this.nuevoBien.modelo || '').trim(),
      serie: (this.nuevoBien.serie || '').trim(),
      especificaciones: (this.nuevoBien.especificaciones || '').trim(),
      estado: (this.nuevoBien.estado || '').trim(),
      detalle_estado: (this.nuevoBien.detalleEstado || '').trim(),
      origen: this.nuevoBien.origen || 'INVENTARIO',
      provincia: (this.nuevoBien.provincia || '').trim(),
      ubicacion: (this.nuevoBien.ubicacion || '').trim(),
      custodio: (this.nuevoBien.custodio || '').trim(),
      valor_compra_inicial: valorCompra,
      valor_con_iva: valorIva,
      observaciones: (this.nuevoBien.observaciones || '').trim(),
      observaciones2: (this.nuevoBien.observaciones2 || '').trim(),
      id_categoria: this.nuevoBien.idCategoria || null,
      id_aula: this.nuevoBien.idAula || null
    };

    this.bienesService.create(bienParaEnviar).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Bien registrado correctamente', 'success');
        this.closeAddModal();
        this.loadBienes();
      },
      error: (err) => {
        console.error('Error al guardar bien:', err);
        Swal.fire('Error', 'No se pudo guardar el bien', 'error');
      }
    });
  }

  resetForm() {
    this.nuevoBien = {
      codigoBien: '',
      nombreBien: '',
      tipoBien: '',
      claseBien: '',
      cuentaTipoBien: '',
      codigoInventario: '',
      codigoSecap: '',
      descripcion: '',
      especificaciones: '',
      marca: '',
      modelo: '',
      serie: '',
      valorCompraInicial: null,
      valorConIva: null,
      estado: '',
      detalleEstado: '',
      custodio: '',
      ubicacion: '',
      provincia: '',
      observaciones: '',
      observaciones2: '',
      origen: 'INVENTARIO',
      idCategoria: null,
      idAula: null
    };
  }

  // 👁️ Detalles
openEditModal(bien: any) {

  this.selectedBien = JSON.parse(JSON.stringify(bien));

  // 🔥 ASEGURAR CATEGORIA
  if (!this.selectedBien.categoria) {
    this.selectedBien.categoria = { idCategoria: null };
  }

  // 🔥 ASEGURAR AULA
  if (!this.selectedBien.aula) {
    this.selectedBien.aula = { idAula: null };
  }

  this.showDetailModal = true;
}





  closeDetailModal() {
    this.showDetailModal = false;
  }

  // 🗑️ Eliminar
  deleteBien(bien: any) {
    Swal.fire({
      title: '¿Eliminar bien?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then(result => {
      if (result.isConfirmed) {
        this.bienesService.delete(bien.idBien).subscribe(() => {
          Swal.fire('Eliminado', 'Bien eliminado', 'success');
          this.loadBienes();
        });
      }
    });
  }

  // 📂 Categoría
  openCategoryModal() {
    this.showCategoryModal = true;
  }

  closeCategoryModal() {
    this.showCategoryModal = false;
  }

  saveCategoria() {
    if (!this.nuevaCategoria.nombre) {
      Swal.fire('Atención', 'Ingrese el nombre de la categoría', 'warning');
      return;
    }

    this.categoriasService.create(this.nuevaCategoria).subscribe(() => {
      Swal.fire('Éxito', 'Categoría creada', 'success');
      this.nuevaCategoria = { nombre: '' };
      this.closeCategoryModal();
      this.loadCategorias();
    });
  }

  // 🔽 Filtros
  toggleFilterDropdown() {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  selectFilter(option: string) {
    this.selectedFilter = option;
    this.showFilterDropdown = false;
    this.applyFilters();
  }

  applyFilters() {
    const texto = this.searchTerm.toLowerCase();

    this.filteredBienes = this.bienes.filter(b =>
      (
        b.codigoBien?.toLowerCase().includes(texto) ||
        b.nombreBien?.toLowerCase().includes(texto) ||
        b.descripcion?.toLowerCase().includes(texto)
      ) &&
      (
        this.selectedFilter === 'Mostrar todos' ||
        b.estado === this.selectedFilter
      )
    );
  }
  updateBien() {
  this.bienesService.update(this.selectedBien.idBien, this.selectedBien)
    .subscribe({
      next: () => {
        Swal.fire('Actualizado', 'Bien actualizado correctamente', 'success');
        this.showDetailModal = false;
        this.loadBienes();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo actualizar el bien', 'error');
      }
    });
}

}
