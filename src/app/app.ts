import { Component, inject, signal } from '@angular/core';
import { AppShell } from './layout/app-shell/app-shell';
import { AuthService } from './auth/auth.service';
import { AuthState } from './auth/auth.state';
import { LoginPage } from './auth/pages/login-page/login-page';

@Component({
  selector: 'app-root',
  imports: [AppShell, LoginPage],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('personal-expense-manager');
  protected readonly authService = inject(AuthService);
  readonly authState = inject(AuthState);

  protected login(): void {
    void this.authService.login();
  }

  protected logout(): void {
    void this.authService.logout();
  }
}
