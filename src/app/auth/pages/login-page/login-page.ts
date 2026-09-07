import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  protected login(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';

    const safeReturnUrl = returnUrl.startsWith('/') ? returnUrl : '/dashboard';

    void this.authService.login(`${window.location.origin}${safeReturnUrl}`);
  }
}
