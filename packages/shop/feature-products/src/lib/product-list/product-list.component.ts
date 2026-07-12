import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '@org/models';
import {
  ProductGridComponent,
  LoadingSpinnerComponent,
  ErrorMessageComponent,
  FilterModalComponent,
  ActiveFiltersComponent,
  ProductFilters,
  InfiniteScrollDirective,
} from '@org/shop/shared-ui';
import { FeatureListFacade } from './feature-list.facade';
import { FeatureProductListEffects } from './feature-list.effects';
import { provideDomainProductList } from './domain/provide-domain-product-list';

@Component({
  selector: 'shop-product-list',
  imports: [
    CommonModule,
    ProductGridComponent,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    FilterModalComponent,
    ActiveFiltersComponent,
    InfiniteScrollDirective,
  ],
  providers: [
    ...provideDomainProductList(),
    FeatureListFacade,
    FeatureProductListEffects,
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
        (apply)="onModalFiltersApply($event)"
        (closed)="onFilterModalClose()"
      />

      @if (loading()) {
        <shop-loading-spinner />
      } @else if (error()) {
        <shop-error-message
          [message]="error() || undefined"
          (retry)="retryLoad()"
        />
      } @else {
        <div class="results-info">
          Showing {{ products().length }} of {{ totalProducts() }} products
        </div>

        <shop-product-grid
          [products]="products()"
          (productSelect)="onProductSelect($event)"
        />

        <!-- Sentinel element — becomes visible when user reaches the end of the list -->
        <div
          shopInfiniteScroll
          [disabled]="!canGoNext() || loading()"
          (scrolledToEnd)="loadMore()"
          class="scroll-sentinel"
        ></div>

        @if (loading()) {
          <shop-loading-spinner />
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

      .scroll-sentinel {
        height: 1px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  private readonly featureListFacade = inject(FeatureListFacade);
  // Effects must be injected to be instantiated — Angular DI is lazy.
  // This triggers the constructor which sets up subscriptions.
  private readonly effects = inject(FeatureProductListEffects);

  readonly products = this.featureListFacade.products;
  readonly totalProducts = this.featureListFacade.totalProducts;
  readonly currentPage = this.featureListFacade.currentPage;
  readonly totalPages = this.featureListFacade.totalPages;
  readonly categories = this.featureListFacade.categories;
  readonly loading = this.featureListFacade.loading;
  readonly error = this.featureListFacade.error;

  readonly currentFilters = this.featureListFacade.currentFilters;

  readonly isFilterModalOpen = this.featureListFacade.isFilterModalOpen;

  readonly hasMorePages = this.featureListFacade.hasMorePages;
  readonly activeFiltersCount = this.featureListFacade.activeFiltersCount;
  readonly canGoNext = this.featureListFacade.canGoNext;

  ngOnInit() {
    this.featureListFacade.loadCategories();
    this.featureListFacade.loadProducts();
  }

  retryLoad(): void {
    this.featureListFacade.loadProducts();
  }

  onProductSelect(product: Product): void {
    this.featureListFacade.selectProduct(product);
  }

  openFilterModal(): void {
    this.featureListFacade.openFilterModal();
  }

  onModalFiltersApply(filters: ProductFilters): void {
    this.featureListFacade.applyModalFilters(filters);
  }

  onFilterModalClose(): void {
    this.featureListFacade.closeFilterModal();
  }

  clearFilter(key: keyof ProductFilters): void {
    this.featureListFacade.clearFilter(key);
  }

  clearAllFilters(): void {
    this.featureListFacade.clearAllFilters();
  }

  loadMore(): void {
    this.featureListFacade.loadMore();
  }
}
