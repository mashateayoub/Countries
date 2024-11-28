import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appLazyLoad]'
})
export class LazyLoadDirective implements OnInit {
  @Input('appLazyLoad') imgSrc: string = '';

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          this.el.nativeElement.src = this.imgSrc;
          obs.unobserve(this.el.nativeElement);
        }
      });
    });

    obs.observe(this.el.nativeElement);
  }
} 