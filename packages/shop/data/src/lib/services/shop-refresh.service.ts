import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShopRefreshService {
  private readonly _refresh$ = new Subject<void>();
  readonly refresh$ = this._refresh$.asObservable();

  triggerRefresh(): void {
    this._refresh$.next();
  }
}
