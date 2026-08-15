import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { App } from './app';
import { test } from 'vitest';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    }).compileComponents();
  });

  test('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
