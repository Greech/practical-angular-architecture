import {
  Component,
  input,
  output,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ProductFilters {
  searchTerm: string;
  category: string;
  inStockOnly: boolean;
}

@Component({
  selector: 'shop-product-filters',
  imports: [FormsModule],
  template: `
    <div class="filters-section">
      <div class="search-box">
        <input
          type="text"
          placeholder="Search products..."
          [(ngModel)]="searchTerm"
          (ngModelChange)="onFiltersChange()"
          class="search-input"
        />
      </div>

      <div class="filter-controls">
        <select
          [(ngModel)]="selectedCategory"
          (ngModelChange)="onFiltersChange()"
          class="filter-select"
        >
          <option value="">All Categories</option>
          @for (category of categories(); track category) {
            <option [value]="category">{{ category }}</option>
          }
        </select>

        <label class="checkbox-label">
          <input
            type="checkbox"
            [(ngModel)]="inStockOnly"
            (ngModelChange)="onFiltersChange()"
          />
          In Stock Only
        </label>
      </div>
    </div>
  `,
  styles: [
    `
      .filters-section {
        background: #f8f9fa;
        padding: 24px;
        border-radius: 8px;
        margin-bottom: 32px;
      }

      .search-box {
        margin-bottom: 16px;
      }

      .search-input {
        width: 100%;
        padding: 12px 16px;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        transition: border-color 0.3s;
      }

      .search-input:focus {
        outline: none;
        border-color: #3498db;
      }

      .filter-controls {
        display: flex;
        gap: 16px;
        align-items: center;
        flex-wrap: wrap;
      }

      .filter-select {
        padding: 8px 16px;
        font-size: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
      }

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-size: 1rem;
      }

      .checkbox-label input {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      @media (max-width: 768px) {
        .filter-controls {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFiltersComponent implements OnInit {
  readonly categories = input<string[]>([]);
  readonly initialFilters = input<ProductFilters>({
    searchTerm: '',
    category: '',
    inStockOnly: false,
  });
  readonly filtersChange = output<ProductFilters>();

  searchTerm = '';
  selectedCategory = '';
  inStockOnly = false;

  ngOnInit(): void {
    const f = this.initialFilters();
    this.searchTerm = f.searchTerm;
    this.selectedCategory = f.category;
    this.inStockOnly = f.inStockOnly;
  }

  onFiltersChange(): void {
    this.filtersChange.emit({
      searchTerm: this.searchTerm,
      category: this.selectedCategory,
      inStockOnly: this.inStockOnly,
    });
  }
}
