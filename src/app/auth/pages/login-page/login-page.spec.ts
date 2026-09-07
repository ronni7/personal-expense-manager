import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPage } from './login-page';
import { AuthService } from '../../auth.service';
import { ActivatedRoute, Router } from '@angular/router';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  const fakeActivatedRoute = {
    snapshot: { data: {} },
  } as ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [{ provide: ActivatedRoute, useValue: fakeActivatedRoute }, Router, AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
