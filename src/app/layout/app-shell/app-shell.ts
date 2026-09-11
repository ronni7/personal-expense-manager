import { Component, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../auth/services/auth.service';
import { AuthState } from '../../auth/auth-state/auth.state';
import { AUTH_PERMISSIONS } from '../../auth/auth.permissions';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

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
  private readonly http = inject(HttpClient);

  protected logout(): void {
    void this.authService.logout();
  }

  protected testUserInfo(): void {
    this.http.get('http://localhost:8080/realms/PEM/protocol/openid-connect/userinfo').subscribe({
      next: (response) => {
        console.log('UserInfo:', response);
      },
      error: (error) => {
        console.error('UserInfo request failed:', error);
      },
    });
  }
  protected testConcurrentUserInfo(): void {
    const url = 'http://localhost:8080/realms/PEM/protocol/openid-connect/userinfo';

    forkJoin([this.http.get(url), this.http.get(url), this.http.get(url)]).subscribe({
      next: (responses) => {
        console.log('Concurrent requests completed:', responses);
      },
      error: (error) => {
        console.error('Concurrent request failed:', error);
      },
    });
  }
}
