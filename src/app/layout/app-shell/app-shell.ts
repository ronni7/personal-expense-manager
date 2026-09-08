import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { AuthState } from '../../auth/auth.state';
import { AUTH_PERMISSIONS } from '../../auth/auth.permissions';

@Component({
  selector: 'app-shell',
  imports: [MatListModule, RouterLink, RouterLinkActive, RouterOutlet, MatSidenavModule],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell {
  protected readonly authState = inject(AuthState);
  protected readonly AUTH_PERMISSIONS = AUTH_PERMISSIONS;
  private readonly authService = inject(AuthService);

  protected logout(): void {
    void this.authService.logout();
  }
}
