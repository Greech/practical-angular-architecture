import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductsService } from '@org/shop/data';
import { Product } from '@org/models';
import { ProductFilters } from '@org/shop/shared-ui';
import { ProductListCacheService } from './product-list-cache.service';

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

enum FetchPageMode {
  /** Replaces the current product list — used on initial load and filter changes */
  Replace = 'replace',
  /** Appends to the current product list — used for infinite scroll / load more */
  Append = 'append',
}

@Injectable()
export class DomainProductListStore {
  private readonly productsService = inject(ProductsService);
  private readonly cache = inject(ProductListCacheService);
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
    this.fetchPage(FetchPageMode.Replace);
  }

  loadMoreProducts(): void {
    if (!this.canGoNext()) return;

    const nextPage = this.store().currentPage + 1;
    this.fetchPage(FetchPageMode.Append, nextPage);
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

  invalidateCache(): void {
    this.cache.invalidate();
  }

  private fetchPage(
    mode: FetchPageMode,
    page = this.store().currentPage,
  ): void {
    const filters = this.store().currentFilters;

    const cached = this.cache.get(filters, page);
    if (cached) {
      this.store.update((state) => ({
        ...state,
        currentPage: page,
        products:
          mode === FetchPageMode.Append
            ? [...state.products, ...cached.items]
            : cached.items,
        totalProducts: cached.total,
        totalPages: cached.totalPages,
        loading: false,
        error: null,
      }));
      return;
    }

    this.store.update((state) => ({ ...state, loading: true, error: null }));

    this.productsService.getProducts(filters, page).subscribe({
      next: (response) => {
        this.cache.set(filters, page, {
          items: response.items,
          total: response.total,
          totalPages: response.totalPages,
        });
        this.store.update((state) => ({
          ...state,
          currentPage: page,
          products:
            mode === FetchPageMode.Append
              ? [...state.products, ...response.items]
              : response.items,
          totalProducts: response.total,
          totalPages: response.totalPages,
          loading: false,
        }));
      },
      error: (_err) => {
        // No rollback needed — currentPage was never changed
        this.store.update((state) => ({
          ...state,
          error: 'LOADING_PRODUCTS_FAILED',
          loading: false,
        }));
      },
    });
  }
}
