import { Injectable, computed, inject, signal } from '@angular/core';
import { ProductFilters } from '@org/shop/shared-ui';
import { DomainProductListStore } from './domain/domain-product-list.store';
import { Router } from '@angular/router';
import { Product } from '@org/models';

@Injectable()
export class FeatureListFacade {
  private readonly store = inject(DomainProductListStore);
  private readonly router = inject(Router);

  readonly products = this.store.products;
  readonly totalProducts = this.store.totalProducts;
  readonly currentPage = this.store.currentPage;
  readonly totalPages = this.store.totalPages;
  readonly categories = this.store.categories;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  // Filter state
  readonly currentFilters = this.store.currentFilters;

  // Navigation guards
  readonly canGoNext = this.store.canGoNext;
  readonly canGoPrevious = this.store.canGoPrevious;

  // UI state (DOES NOT belong to the domain store, but is part of the feature state)
  readonly isFilterModalOpen = signal(false);

  // Derived / computed state
  readonly hasMorePages = computed(() => this.totalPages() > 1);
  readonly activeFiltersCount = computed(() => {
    const { searchTerm, category, inStockOnly } = this.currentFilters();
    return (searchTerm ? 1 : 0) + (category ? 1 : 0) + (inStockOnly ? 1 : 0);
  });

  loadCategories() {
    this.store.loadCategories();
  }

  loadProducts() {
    this.store.loadProducts();
  }

  invalidateCache(): void {
    this.store.invalidateCache();
  }

  openFilterModal(): void {
    this.isFilterModalOpen.set(true);
  }

  closeFilterModal(): void {
    this.isFilterModalOpen.set(false);
  }

  applyModalFilters(filters: ProductFilters): void {
    this.isFilterModalOpen.set(false);
    this.store.applyFilters(filters);
    this.store.loadProducts();
  }

  clearFilter(key: keyof ProductFilters): void {
    this.store.clearFilter(key);
    this.store.loadProducts();
  }

  clearAllFilters(): void {
    this.store.clearAllFilters();
    this.store.loadProducts();
  }

  openNextPage(): void {
    if (this.store.canGoNext()) {
      this.store.openNextPage();
      this.store.loadProducts();
    }
  }

  openPreviousPage(): void {
    if (this.store.canGoPrevious()) {
      this.store.openPreviousPage();
      this.store.loadProducts();
    }
  }

  selectProduct(product: Product): void {
    this.router.navigate(['/products', product.id]);
  }
}
