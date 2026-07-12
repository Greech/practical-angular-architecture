import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
  output,
  input,
} from '@angular/core';

/**
 * Directive that emits `scrolledToEnd` when the host element enters the viewport.
 * Place it on a sentinel element at the bottom of a list to implement infinite scroll.
 *
 * Usage:
 *   <div shopInfiniteScroll (scrolledToEnd)="loadMore()" [disabled]="!canGoNext()"></div>
 */
@Directive({
  selector: '[shopInfiniteScroll]',
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  readonly disabled = input<boolean>(false);
  readonly scrolledToEnd = output<void>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private observer: IntersectionObserver | null = null;

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.disabled()) {
          this.scrolledToEnd.emit();
        }
      },
      { threshold: 0.1 },
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
