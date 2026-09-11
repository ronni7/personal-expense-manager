import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, test } from 'vitest';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import { KnowledgePage } from './knowledge-page';
import { placeholderValues } from '../knowledge-page-placeholder-values';
registerLocaleData(localePl, 'pl');

describe('KnowledgePage', () => {
  let fixture: ComponentFixture<KnowledgePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgePage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgePage);
    fixture.detectChanges();
  });

  test('renders the main semantic document structure', () => {
    const native = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance).toBeTruthy();
    expect(native.querySelector('main')).not.toBeNull();
    expect(native.querySelector('header')).not.toBeNull();
    expect(native.querySelector('nav')).not.toBeNull();
    expect(native.querySelector('h1')?.textContent).toContain('Personal Finance Knowledge Base');
    expect(native.querySelectorAll('article').length).toBeGreaterThanOrEqual(3);
    expect(native.querySelector('section#facts')).not.toBeNull();
    expect(native.querySelector('section#faq')).not.toBeNull();
  });

  test('renders the budget data visualizations', () => {
    const native = fixture.nativeElement as HTMLElement;

    expect(native.querySelector('data')).not.toBeNull();
    expect(native.querySelector('progress')).not.toBeNull();
    expect(native.querySelector('meter')).not.toBeNull();
    expect(native.querySelector('table')).not.toBeNull();
    expect(native.querySelector('caption')?.textContent).toContain(
      'Example monthly household allocation',
    );
    expect(native.querySelector('thead')).not.toBeNull();
    expect(native.querySelector('tbody')).not.toBeNull();
    expect(native.querySelector('tfoot')).not.toBeNull();
  });

  test('renders the glossary and expandable FAQ', () => {
    const native = fixture.nativeElement as HTMLElement;

    expect(native.querySelector('dl')).not.toBeNull();
    expect(native.querySelectorAll('dt').length).toBeGreaterThanOrEqual(5);
    expect(native.querySelectorAll('dd').length).toBeGreaterThanOrEqual(5);
    expect(native.querySelector('details')).not.toBeNull();
    expect(native.querySelector('summary')?.textContent).toContain('Why track irregular expenses?');
  });

  test('renders the native form controls and validation attributes', () => {
    const native = fixture.nativeElement as HTMLElement;
    const form = native.querySelector('form');

    expect(form).not.toBeNull();
    expect(form?.getAttribute('method')).toBe('post');
    expect(native.querySelector('input[type="text"]')).not.toBeNull();
    expect(native.querySelector('input[type="email"]')).not.toBeNull();
    expect(native.querySelector('input[type="number"]')).not.toBeNull();
    expect(native.querySelector('input[type="range"]')).not.toBeNull();
    expect(native.querySelector('textarea')).not.toBeNull();
    expect(native.querySelector('select')).not.toBeNull();
    expect(native.querySelector('datalist')).not.toBeNull();
    expect(native.querySelector('output')).not.toBeNull();
    expect(native.querySelector('button[type="submit"]')).not.toBeNull();
  });

  test('updates budget values and recalculates totals', () => {
    const native = fixture.nativeElement as HTMLElement;
    const plannedInputs = native.querySelectorAll<HTMLInputElement>('input[data-field="planned"]');
    const actualInputs = native.querySelectorAll<HTMLInputElement>('input[data-field="actual"]');

    expect(plannedInputs).toHaveLength(3);
    expect(actualInputs).toHaveLength(3);

    fixture.detectChanges();

    const footer = native.querySelector('tfoot');
    const planned = placeholderValues.budgetRows.reduce(
      (total, current) => total + current.planned,
      0,
    );
    const actual = placeholderValues.budgetRows.reduce(
      (total, current) => total + current.actual,
      0,
    );
    const currencyPipe = new CurrencyPipe('en-us', 'PLN');
    expect(footer?.textContent).toContain(currencyPipe.transform(planned));
    expect(footer?.textContent).toContain(currencyPipe.transform(actual));
    expect(footer?.textContent).toContain(planned - actual);
  });

  test('updates the range output on input', () => {
    const native = fixture.nativeElement as HTMLElement;
    const rangeInput = native.querySelector('input[type="range"]') as HTMLInputElement;
    const output = native.querySelector('output') as HTMLOutputElement;

    rangeInput.value = '80';
    rangeInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(output.textContent?.trim()).toBe('80%');
  });
});
