import { Component, OnInit } from '@angular/core';
import { Bien } from '../../models/bien.model';
import { Categoria } from '../../models/categoria.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inventario',
  standalone: false,
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent implements OnInit {
  currentUser = '';
  searchTerm: string = '';
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  showDetailModal: boolean = false;
  showCategoryModal: boolean = false;
  selectedBien: Bien | null = null;
  
  bienes: Bien[] = [];
  categorias: Categoria[] = [];
  filteredBienes: Bien[] = [];
  
  // Estadísticas
  totalBienes: number = 0;
  totalCategorias: number = 0;
  bienesDisponibles: number = 0;
  bienesAsignados: number = 0;
  
  // Formulario para nuevo bien
  nuevoBien: Partial<Bien> = {
    codigo_bien: '',
    codigo_inventario: '',
    codigo_secap: '',
    nombre_bien: '',
    descripcion: '',
    tipo_bien: '',
    clase_bien: '',
    cuenta_tipo_bien: '',
    marca: '',
    modelo: '',
    serie: '',
    especificaciones: '',
    estado: 'Disponible',
    detalle_estado: '',
    origen: '',
    provincia: '',
    ubicacion: '',
    custodio: '',
    valor_compra_inicial: 0,
    valor_con_iva: 0,
    observaciones: '',
    observaciones2: '',
    id_categoria: 0
  };

  nuevaCategoria: Categoria = {
    id_categoria: 0,
    nombre: ''
  };

  // Filtros
  showFilterDropdown: boolean = false;
  selectedFilter: string = 'Mostrar Todos';
  estados: string[] = ['Disponible', 'Asignado', 'En Mantenimiento', 'Dañado', 'Baja'];
  filterOptions: string[] = [
    'Mostrar Todos',
    'Disponible',
    'Asignado',
    'En Mantenimiento',
    'Dañado',
    'Baja'
  ];

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user.nombre;
    }
    this.loadCategorias();
    this.loadBienes();
    
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', (event: any) => {
      if (!event.target.closest('.filter-dropdown-wrapper')) {
        this.showFilterDropdown = false;
      }
    });
  }

  loadCategorias(): void {
    this.apiService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.totalCategorias = categorias.length;
      },
      error: (error) => {
        console.error('Error cargando categorías:', error);
      }
    });
  }

  loadBienes(): void {
    this.apiService.getBienes().subscribe({
      next: (bienes) => {
        this.bienes = bienes;
        this.filteredBienes = [...bienes];
        this.updateStatistics();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error cargando bienes:', error);
      }
    });
  }

  updateStatistics(): void {
    this.totalBienes = this.bienes.length;
    this.bienesDisponibles = this.bienes.filter(b => b.estado === 'Disponible').length;
    this.bienesAsignados = this.bienes.filter(b => b.estado === 'Asignado').length;
  }

  onSearch(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.bienes];

    // Aplicar búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(bien =>
        bien.codigo_bien?.toLowerCase().includes(term) ||
        bien.codigo_inventario?.toLowerCase().includes(term) ||
        bien.nombre_bien?.toLowerCase().includes(term) ||
        bien.descripcion?.toLowerCase().includes(term) ||
        bien.ubicacion?.toLowerCase().includes(term)
      );
    }

    // Aplicar filtro de estado
    if (this.selectedFilter !== 'Mostrar Todos') {
      filtered = filtered.filter(bien => bien.estado === this.selectedFilter);
    }

    this.filteredBienes = filtered;
  }

  selectFilter(filter: string): void {
    this.selectedFilter = filter;
    this.showFilterDropdown = false;
    this.applyFilters();
  }

  toggleFilterDropdown(): void {
    this.showFilterDropdown = !this.showFilterDropdown;
  }

  openAddModal(): void {
    this.nuevoBien = {
      codigo_bien: '',
      codigo_inventario: '',
      codigo_secap: '',
      nombre_bien: '',
      descripcion: '',
      tipo_bien: '',
      clase_bien: '',
      cuenta_tipo_bien: '',
      marca: '',
      modelo: '',
      serie: '',
      especificaciones: '',
      estado: 'Disponible',
      detalle_estado: '',
      origen: '',
      provincia: '',
      ubicacion: '',
      custodio: '',
      valor_compra_inicial: 0,
      valor_con_iva: 0,
      observaciones: '',
      observaciones2: '',
      id_categoria: this.categorias.length > 0 ? this.categorias[0].id_categoria : 0
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  openCategoryModal(): void {
    this.nuevaCategoria = { id_categoria: 0, nombre: '' };
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }

  saveBien(): void {
    if (this.nuevoBien.nombre_bien && this.nuevoBien.codigo_bien && this.nuevoBien.id_categoria) {
      const bien: Bien = {
        id_bien: 0,
        codigo_bien: this.nuevoBien.codigo_bien || '',
        codigo_inventario: this.nuevoBien.codigo_inventario || '',
        codigo_secap: this.nuevoBien.codigo_secap || '',
        nombre_bien: this.nuevoBien.nombre_bien || '',
        descripcion: this.nuevoBien.descripcion || '',
        tipo_bien: this.nuevoBien.tipo_bien || '',
        clase_bien: this.nuevoBien.clase_bien || '',
        cuenta_tipo_bien: this.nuevoBien.cuenta_tipo_bien || '',
        marca: this.nuevoBien.marca || '',
        modelo: this.nuevoBien.modelo || '',
        serie: this.nuevoBien.serie || '',
        especificaciones: this.nuevoBien.especificaciones || '',
        estado: this.nuevoBien.estado || 'Disponible',
        detalle_estado: this.nuevoBien.detalle_estado || '',
        origen: this.nuevoBien.origen || '',
        provincia: this.nuevoBien.provincia || '',
        ubicacion: this.nuevoBien.ubicacion || '',
        custodio: this.nuevoBien.custodio || '',
        valor_compra_inicial: this.nuevoBien.valor_compra_inicial || 0,
        valor_con_iva: this.nuevoBien.valor_con_iva || 0,
        observaciones: this.nuevoBien.observaciones || '',
        observaciones2: this.nuevoBien.observaciones2 || '',
        id_categoria: this.nuevoBien.id_categoria || 0
      };

      this.apiService.createBien(bien).subscribe({
        next: (bienCreado) => {
          this.bienes.push(bienCreado);
          this.updateStatistics();
          this.applyFilters();
          this.closeAddModal();
        },
        error: (error) => {
          console.error('Error guardando bien:', error);
          alert('Error al guardar el bien. Por favor, intente nuevamente.');
        }
      });
    }
  }

  saveCategoria(): void {
    if (this.nuevaCategoria.nombre) {
      this.apiService.createCategoria(this.nuevaCategoria).subscribe({
        next: (categoria) => {
          this.categorias.push(categoria);
          this.totalCategorias = this.categorias.length;
          this.closeCategoryModal();
        },
        error: (error) => {
          console.error('Error guardando categoría:', error);
          alert('Error al guardar la categoría. Por favor, intente nuevamente.');
        }
      });
    }
  }

  viewDetails(bien: Bien): void {
    this.selectedBien = bien;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedBien = null;
  }

  getCategoriaNombre(id_categoria: number): string {
    const categoria = this.categorias.find(c => c.id_categoria === id_categoria);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  deleteBien(bien: Bien): void {
    if (confirm(`¿Está seguro de eliminar el bien ${bien.nombre_bien}?`)) {
      this.apiService.deleteBien(bien.id_bien).subscribe({
        next: () => {
          this.bienes = this.bienes.filter(b => b.id_bien !== bien.id_bien);
          this.updateStatistics();
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error eliminando bien:', error);
          alert('Error al eliminar el bien. Por favor, intente nuevamente.');
        }
      });
    }
  }
}

