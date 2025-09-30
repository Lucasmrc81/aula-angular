import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  template: `
    <app-header></app-header>
    <div class="content-container">
      <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  `,
  styleUrls: ['./layout.component.scss'],
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
})
export class LayoutComponent {}
