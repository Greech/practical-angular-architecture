import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductsService } from '@org/shop/data';
import { Product } from '@org/models';
import { ProductFilters } from '@org/shop/shared-ui';

export type ErrorMessage =
  'LOADING_CATEGORIES_FAILED' | 'LOADING_PRODUCTS_FAILED';

export interface DomainListState {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;

  categories: string[];

  loading: boolean;
  error: ErrorMessage | null;

  currentFilters: ProductFilters;
}

export const initialDomainListState: DomainListState = {
  products: [],
  totalProducts: 0,
  currentPage: 1,
  totalPages: 0,
  categories: [],

  loading: false,
  error: null,

  currentFilters: {
    searchTerm: '',
    category: '',
    inStockOnly: false,
  },
};

@Injectable()
export class DomainProductListStore {
  private readonly productsService = inject(ProductsService);
  private readonly store = signal<DomainListState>(initialDomainListState);

  readonly products = computed(() => this.store().products);
  readonly totalProducts = computed(() => this.store().totalProducts);
  readonly currentPage = computed(() => this.store().currentPage);
  readonly totalPages = computed(() => this.store().totalPages);
  readonly categories = computed(() => this.store().categories);
  readonly loading = computed(() => this.store().loading);
  readonly error = computed(() => this.store().error);

  readonly currentFilters = computed(() => this.store().currentFilters);

  readonly canGoNext = computed(
    () => this.store().currentPage < this.store().totalPages,
  );
  readonly canGoPrevious = computed(() => this.store().currentPage > 1);

  loadCategories() {
    this.store.update((state) => ({ ...state, loading: true, error: null }));

    this.productsService.getCategories().subscribe({
      next: (categories) =>
        this.store.update((state) => ({
          ...state,
          categories,
          loading: false,
        })),
      error: (err) =>
        this.store.update((state) => ({
          ...state,
          error: 'LOADING_CATEGORIES_FAILED',
          loading: false,
        })),
    });
  }

  loadProducts() {
    this.store.update((state) => ({ ...state, loading: true, error: null }));

    const filters: ProductFilters = this.store().currentFilters;
    const currentPage = this.store().currentPage;

    this.productsService.getProducts(filters, currentPage).subscribe({
      next: (response) => {
        this.store.update((state) => ({
          ...state,
          products: response.items,
          totalProducts: response.total,
          totalPages: response.totalPages,
          loading: false,
        }));
      },
      error: (err) => {
        this.store.update((state) => ({
          ...state,
          error: 'LOADING_PRODUCTS_FAILED',
          loading: false,
        }));
      },
    });
  }

  applyFilters(filters: ProductFilters): void {
    this.store.update((state) => ({
      ...state,
      currentFilters: filters,
      currentPage: 1,
    }));
  }

  clearAllFilters(): void {
    this.store.update((state) => ({
      ...state,
      currentFilters: initialDomainListState.currentFilters,
      currentPage: 1,
    }));
  }

  clearFilter(key: keyof ProductFilters): void {
    const defaults: ProductFilters = {
      searchTerm: '',
      category: '',
      inStockOnly: false,
    };
    this.store.update((state) => ({
      ...state,
      currentFilters: { ...state.currentFilters, [key]: defaults[key] },
      currentPage: 1,
    }));
  }

  openNextPage(): void {
    this.store.update((state) => ({
      ...state,
      currentPage: state.currentPage + 1,
    }));
  }

  openPreviousPage(): void {
    this.store.update((state) => ({
      ...state,
      currentPage: state.currentPage - 1,
    }));
  }
}
