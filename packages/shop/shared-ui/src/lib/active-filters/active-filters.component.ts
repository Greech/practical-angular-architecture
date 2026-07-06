import {
  Component,
  computed,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ProductFilters } from '../product-filters/product-filters.component';

interface FilterChip {
  key: keyof ProductFilters;
  label: string;
}

@Component({
  selector: 'shop-active-filters',
  template: `
    <div class="active-filters">
      <span class="active-filters-label">Active filters:</span>
      <div class="chips">
        @for (chip of activeChips(); track chip.key) {
          <span class="filter-chip">
            {{ chip.label }}
            <button
              class="chip-remove"
              [attr.aria-label]="'Remove ' + chip.label + ' filter'"
              (click)="chipRemove.emit(chip.key)"
            >
              ✕
            </button>
          </span>
        }
      </div>

      <button class="btn-clear-all" (click)="filtersCleared.emit()">
        Clear all
      </button>
    </div>
  `,
  styles: [
    `
      .active-filters {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        padding: 12px 16px;
        background: #eef6fd;
        border: 1px solid #bee3f8;
        border-radius: 6px;
        margin-bottom: 24px;
      }

      .active-filters-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #2c5282;
        white-space: nowrap;
      }

      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        flex: 1;
      }

      .filter-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: #3498db;
        color: white;
        border-radius: 999px;
        font-size: 0.875rem;
        white-space: nowrap;
      }

      .chip-remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        background: rgba(255, 255, 255, 0.3);
        border: none;
        border-radius: 50%;
        color: white;
        font-size: 0.625rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        transition: background 0.15s;
      }

      .chip-remove:hover {
        background: rgba(255, 255, 255, 0.5);
      }

      .btn-clear-all {
        margin-left: auto;
        background: none;
        border: none;
        color: #c0392b;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        white-space: nowrap;
        transition: background 0.15s;
      }

      .btn-clear-all:hover {
        background: #fdecea;
      }

      @media (max-width: 768px) {
        .btn-clear-all {
          margin-left: 0;
          width: 100%;
          text-align: left;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveFiltersComponent {
  readonly filters = input.required<ProductFilters>();

  readonly chipRemove = output<keyof ProductFilters>();
  readonly filtersCleared = output<void>();

  readonly activeChips = computed<FilterChip[]>(() => {
    console.log('Computing active chips for filters:', this.filters());
    const { searchTerm, category, inStockOnly } = this.filters();
    const chips: FilterChip[] = [];

    if (searchTerm) {
      chips.push({ key: 'searchTerm', label: `Search: "${searchTerm}"` });
    }
    if (category) {
      chips.push({ key: 'category', label: `Category: ${category}` });
    }
    if (inStockOnly) {
      chips.push({ key: 'inStockOnly', label: 'In Stock Only' });
    }

    return chips;
  });
}
