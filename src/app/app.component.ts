// app.component.ts
import { Component, NgZone } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // <-- Import necessário
import { PreloaderComponent } from './components/preloader/preloader.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    PreloaderComponent,
    HeaderComponent,
    FooterComponent,
    RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  preloaderVisible = false;
  showLogo = false;

  constructor(private router: Router, private ngZone: NgZone) {
    this.updateLogoVisibility(this.router.url ?? '/');

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateLogoVisibility(event.urlAfterRedirects);
        if (event.urlAfterRedirects === '/login') {
          this.showPreloader();
        }
      }
    });
  }

  private showPreloader() {
    this.preloaderVisible = true;
    setTimeout(() => {
      this.ngZone.run(() => (this.preloaderVisible = false));
    }, 5000);
  }

  private updateLogoVisibility(url: string) {
    this.showLogo = !url.startsWith('/login');
  }
}
