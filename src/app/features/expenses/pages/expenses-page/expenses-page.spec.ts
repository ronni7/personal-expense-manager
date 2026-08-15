import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpensesPage } from './expenses-page';
import { test } from 'vitest';

describe('ExpensesPage', () => {
  let component: ExpensesPage;
  let fixture: ComponentFixture<ExpensesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpensesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  test('should create', () => {
    expect(component).toBeTruthy();
  });
});
