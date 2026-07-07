import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ShopRefreshService } from '@org/shop/data';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = 'Nx Shop Demo';
  private readonly refreshService = inject(ShopRefreshService);

  refresh(): void {
    this.refreshService.triggerRefresh();
  }
}
