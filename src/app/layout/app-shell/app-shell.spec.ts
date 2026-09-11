import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HttpClient } from '@angular/common/http';
import { test, vi } from 'vitest';
import { AuthState } from '../../auth/auth-state/auth.state';
import { AppShell } from './app-shell';
import { KEYCLOAK } from '../../auth/services/keycloak.token';
import Keycloak from 'keycloak-js';
import { keycloakConfig } from '../../auth/auth.config';

describe('AppShell', () => {
  let component: AppShell;
  let fixture: ComponentFixture<AppShell>;

  const authStateMock = {
    hasPermission: vi.fn(),
  };
  authStateMock.hasPermission = vi.fn().mockReturnValue(true);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShell, RouterTestingModule],
      providers: [
        {
          provide: AuthState,
          useValue: authStateMock,
        },
        {
          provide: HttpClient,
          useValue: {},
        },
        {
          provide: KEYCLOAK,
          useFactory: () => new Keycloak(keycloakConfig),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShell);
    component = fixture.componentInstance;
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
