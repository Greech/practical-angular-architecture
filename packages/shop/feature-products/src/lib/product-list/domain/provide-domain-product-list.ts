import { DomainProductListStore } from './domain-product-list.store';
import { ProductListCacheService } from './product-list-cache.service';

export function provideDomainProductList() {
  return [DomainProductListStore, ProductListCacheService];
}
