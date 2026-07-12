import { Injectable } from '@angular/core';
import { Product } from '@org/models';
import { ProductFilters } from '@org/shop/shared-ui';

export interface CachedProductPage {
  items: Product[];
  total: number;
  totalPages: number;
}

@Injectable()
export class ProductListCacheService {
  private readonly cache = new Map<string, CachedProductPage>();

  buildKey(filters: ProductFilters, page: number): string {
    return JSON.stringify({ filters, page });
  }

  get(filters: ProductFilters, page: number): CachedProductPage | null {
    return this.cache.get(this.buildKey(filters, page)) ?? null;
  }

  set(filters: ProductFilters, page: number, value: CachedProductPage): void {
    this.cache.set(this.buildKey(filters, page), value);
  }

  invalidate(): void {
    this.cache.clear();
  }
}
