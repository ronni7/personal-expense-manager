import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { test, vi } from 'vitest';
import { AuthState } from '../../auth/auth.state';
import { AppShell } from './app-shell';

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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShell);
    component = fixture.componentInstance;
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
