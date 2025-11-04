import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [RouterModule, CommonModule],
})
export class HeaderComponent {
  public menuOpen = false;
  public moreOpen = false;

  constructor(private router: Router, private authService: AuthService) {}

  toggleMore(event: Event) {
    event.stopPropagation();
    this.moreOpen = !this.moreOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/initial-loading']);
    this.menuOpen = false;
  }
  @HostListener('document:click')
  closeMore() {
    this.moreOpen = false;
  }
}
