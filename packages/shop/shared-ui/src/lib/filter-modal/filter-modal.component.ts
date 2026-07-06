import {
  Component,
  effect,
  input,
  output,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  ProductFiltersComponent,
  ProductFilters,
} from '../product-filters/product-filters.component';

@Component({
  selector: 'shop-filter-modal',
  imports: [ProductFiltersComponent],
  template: `
    @if (isOpen()) {
      <div
        class="modal-overlay"
        role="presentation"
        (click)="onCancel()"
        (keydown.escape)="onCancel()"
      >
        <div
          class="modal-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabindex="-1"
          (click)="$event.stopPropagation()"
          (keydown.escape)="onCancel()"
        >
          <div class="modal-header">
            <h2 class="modal-title" id="modal-title">Filter Products</h2>
            <button class="modal-close-btn" (click)="onCancel()">✕</button>
          </div>

          <div class="modal-body">
            <shop-product-filters
              [categories]="categories()"
              [initialFilters]="initialFilters()"
              (filtersChange)="onDraftChange($event)"
            />
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" (click)="onCancel()">Cancel</button>
            <button class="btn-apply" (click)="onApply()">Apply</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }

      .modal-container {
        background: white;
        border-radius: 8px;
        width: 90%;
        max-width: 480px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e0e0e0;
      }

      .modal-title {
        margin: 0;
        font-size: 1.25rem;
        color: #333;
      }

      .modal-close-btn {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: #666;
        line-height: 1;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background 0.2s;
      }

      .modal-close-btn:hover {
        background: #f0f0f0;
        color: #333;
      }

      .modal-body {
        padding: 8px 0;
        overflow-y: auto;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
      }

      .btn-cancel {
        padding: 10px 24px;
        background: white;
        color: #333;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.2s;
      }

      .btn-cancel:hover {
        background: #f5f5f5;
      }

      .btn-apply {
        padding: 10px 24px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.2s;
      }

      .btn-apply:hover {
        background: #2980b9;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly categories = input<string[]>([]);
  readonly initialFilters = input<ProductFilters>({
    searchTerm: '',
    category: '',
    inStockOnly: false,
  });

  readonly apply = output<ProductFilters>();
  readonly closed = output<void>();

  private readonly draft = signal<ProductFilters>({
    searchTerm: '',
    category: '',
    inStockOnly: false,
  });

  constructor() {
    // Reset draft to the current applied filters every time the modal opens
    effect(() => {
      if (this.isOpen()) {
        this.draft.set(this.initialFilters());
      }
    });
  }

  onDraftChange(filters: ProductFilters): void {
    this.draft.set(filters);
  }

  onApply(): void {
    this.apply.emit(this.draft());
  }

  onCancel(): void {
    this.closed.emit();
  }
}
