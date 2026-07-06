import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductsService } from '@org/shop/data';
import { Product, ProductFilter } from '@org/models';
import {
  ProductGridComponent,
  LoadingSpinnerComponent,
  ErrorMessageComponent,
  FilterModalComponent,
  ActiveFiltersComponent,
  ProductFilters,
} from '@org/shop/shared-ui';

@Component({
  selector: 'shop-product-list',
  imports: [
    CommonModule,
    ProductGridComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    FilterModalComponent,
    ActiveFiltersComponent,
  ],
  template: `
    <div class="product-list-container">
      <header class="page-header">
        <h1>Our Products</h1>
        <p>Explore our wide selection of high-quality products</p>
      </header>

      <div class="filter-bar">
        <button class="btn-filter" (click)="openFilterModal()">
          Filters
          @if (activeFiltersCount() > 0) {
            <span class="filter-badge">{{ activeFiltersCount() }}</span>
          }
        </button>
      </div>

      @if (activeFiltersCount() > 0) {
        <shop-active-filters
          [filters]="currentFilters()"
          (chipRemove)="clearFilter($event)"
          (filtersCleared)="clearAllFilters()"
        />
      }

      <shop-filter-modal
        [isOpen]="isFilterModalOpen()"
        [categories]="categories()"
        [initialFilters]="currentFilters()"
        (apply)="onFiltersApply($event)"
        (closed)="onFilterModalClose()"
      />

      @if (loading()) {
        <shop-loading-spinner />
      } @else if (error()) {
        <shop-error-message
          [message]="error() || undefined"
          (retry)="loadProducts()"
        />
      } @else {
        <div class="results-info">
          Showing {{ products().length }} of {{ totalProducts() }} products
        </div>

        <shop-product-grid
          [products]="products()"
          (productSelect)="onProductSelect($event)"
        />

        @if (hasMorePages()) {
          <div class="pagination">
            <button
              class="btn-secondary"
              [disabled]="currentPage() === 1"
              (click)="previousPage()"
            >
              Previous
            </button>
            <span class="page-info">
              Page {{ currentPage() }} of {{ totalPages() }}
            </span>
            <button
              class="btn-secondary"
              [disabled]="currentPage() === totalPages()"
              (click)="nextPage()"
            >
              Next
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .product-list-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 24px;
      }

      .page-header {
        text-align: center;
        margin-bottom: 48px;
      }

      .page-header h1 {
        font-size: 2.5rem;
        margin-bottom: 8px;
        color: #333;
      }

      .page-header p {
        font-size: 1.1rem;
        color: #666;
      }

      .results-info {
        color: #666;
        margin-bottom: 16px;
        font-size: 0.95rem;
      }

      .filter-bar {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 24px;
      }

      .btn-filter {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.2s;
      }

      .btn-filter:hover {
        background: #2980b9;
      }

      .filter-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        background: white;
        color: #3498db;
        border-radius: 50%;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1;
      }

      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px solid #e0e0e0;
      }

      .page-info {
        color: #666;
        font-size: 1rem;
      }

      .btn-secondary {
        padding: 8px 16px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.3s;
      }

      .btn-secondary:hover:not(:disabled) {
        background: #5a6268;
      }

      .btn-secondary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 768px) {
        .product-list-container {
          padding: 16px;
        }

        .page-header h1 {
          font-size: 2rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);

  // State signals
  readonly products = signal<Product[]>([]);
  readonly totalProducts = signal(0);
  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly categories = signal<string[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Filter state
  readonly currentFilters = signal<ProductFilters>({
    searchTerm: '',
    category: '',
    inStockOnly: false,
  });

  // Modal state
  readonly isFilterModalOpen = signal(false);

  // Computed values
  readonly hasMorePages = computed(() => this.totalPages() > 1);
  readonly activeFiltersCount = computed(() => {
    const { searchTerm, category, inStockOnly } = this.currentFilters();
    return [searchTerm, category, inStockOnly].filter(Boolean).length;
  });

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.productsService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (err) => console.error('Error loading categories:', err),
    });
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);

    const filter: ProductFilter = {};
    const { searchTerm, category, inStockOnly } = this.currentFilters();

    if (searchTerm) {
      filter.searchTerm = searchTerm;
    }
    if (category) {
      filter.category = category;
    }
    if (inStockOnly) {
      filter.inStock = true;
    }

    this.productsService.getProducts(filter, this.currentPage(), 12).subscribe({
      next: (response) => {
        this.products.set(response.items);
        this.totalProducts.set(response.total);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products. Please try again.');
        this.loading.set(false);
        console.error('Error loading products:', err);
      },
    });
  }

  openFilterModal(): void {
    this.isFilterModalOpen.set(true);
  }

  onFiltersApply(filters: ProductFilters): void {
    this.isFilterModalOpen.set(false);
    this.currentFilters.set(filters);
    this.currentPage.set(1);
    this.loadProducts();
  }

  onFilterModalClose(): void {
    this.isFilterModalOpen.set(false);
  }

  clearFilter(key: keyof ProductFilters): void {
    const defaults: ProductFilters = {
      searchTerm: '',
      category: '',
      inStockOnly: false,
    };
    this.currentFilters.update((f) => ({ ...f, [key]: defaults[key] }));
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearAllFilters(): void {
    this.currentFilters.set({
      searchTerm: '',
      category: '',
      inStockOnly: false,
    });
    this.currentPage.set(1);
    this.loadProducts();
  }

  onProductSelect(product: Product) {
    this.router.navigate(['/products', product.id]);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
      this.loadProducts();
    }
  }

  previousPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
      this.loadProducts();
    }
  }
}
