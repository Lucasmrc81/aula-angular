import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  hidden = false;
  lastScroll = 0;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > this.lastScroll && currentScroll > 50) {
      this.hidden = true;
    } else {
      this.hidden = false;
    }

    this.lastScroll = currentScroll <= 0 ? 0 : currentScroll;
  }
}
