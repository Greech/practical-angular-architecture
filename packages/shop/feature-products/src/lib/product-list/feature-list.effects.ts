import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FeatureListFacade } from './feature-list.facade';
import { ShopRefreshService } from '@org/shop/data';

@Injectable()
export class FeatureProductListEffects {
  private readonly onDestroyRef = inject(DestroyRef);
  private readonly refreshService = inject(ShopRefreshService);
  private readonly store = inject(FeatureListFacade);

  constructor() {
    this.onShellRefreshProducts();
  }

  private onShellRefreshProducts(): void {
    this.refreshService.refresh$
      .pipe(takeUntilDestroyed(this.onDestroyRef))
      .subscribe(() => {
        this.store.refreshProducts();
      });
  }
}
