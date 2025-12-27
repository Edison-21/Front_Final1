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
  categoria: {
    idCategoria: null
  },
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
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  // ✅ Validar bien
 validarBien(): boolean {
  const b = this.nuevoBien;

  if (
    !b.codigoBien ||
    !b.nombreBien ||
    !b.tipoBien ||
    !b.claseBien ||
    !b.cuentaTipoBien ||
    !b.codigoInventario ||
    !b.codigoSecap ||
    !b.estado ||
    !b.ubicacion ||
    !b.provincia ||
    !b.custodio ||
    !b.valorCompraInicial ||
    !b.valorConIva ||
    !b.categoria.idCategoria
  ) {
    Swal.fire(
      'Campos incompletos',
      'Todos los campos obligatorios deben ser llenados',
      'warning'
    );
    return false;
  }

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

    this.bienesService.create(this.nuevoBien).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Bien registrado correctamente', 'success');
        this.closeAddModal();
        this.loadBienes();
      },
      error: () => {
        Swal.fire('Error', 'No se pudo guardar el bien', 'error');
      }
    });
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
