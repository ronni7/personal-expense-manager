import { TestBed } from '@angular/core/testing';
import { patchState } from '@ngrx/signals';
import { unprotected } from '@ngrx/signals/testing';
import { of, Subject } from 'rxjs';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { CreateExpenseRequest } from '../api/create-expense-request.model';
import { ExpensesApiService } from '../api/expense-api-service';
import { ExpenseDto } from '../api/expense.dto';
import { Expense } from '../model/expense.model';
import { ExpensesStore } from './expense.store';
import { mapExpenseDtoToExpense } from '../api/expense.mapper';
import { UpdateExpenseRequest } from '../api/update-expense-request.model';

describe('ExpensesStore', () => {
  const negativeExpenses: Expense[] = [
    {
      id: '1',
      amountInMinorUnits: -1000,
      currency: 'PLN',
      description: 'Electricity bill refund',
      categoryId: 'bills',
      date: '2026-08-12',
      createdAt: '2026-08-12T22:30:00Z',
      updatedAt: '2026-08-12T22:30:00Z',
    },
  ];
  const mockExpenses: Expense[] = [
    {
      id: '1',
      amountInMinorUnits: 4599,
      currency: 'PLN',
      description: 'Groceries',
      categoryId: 'food',
      date: '2026-08-10',
      createdAt: '2026-08-10T18:30:00Z',
      updatedAt: '2026-08-10T18:30:00Z',
    },
    {
      id: '2',
      amountInMinorUnits: 12500,
      currency: 'PLN',
      description: 'Electricity bill',
      categoryId: 'bills',
      date: '2026-08-08',
      createdAt: '2026-08-08T09:00:00Z',
      updatedAt: '2026-08-08T09:00:00Z',
    },
    {
      id: '3',
      amountInMinorUnits: 1599,
      currency: 'PLN',
      description: 'Coffee',
      categoryId: 'food',
      date: '2026-08-07',
      createdAt: '2026-08-07T07:45:00Z',
      updatedAt: '2026-08-07T07:45:00Z',
    },
  ];
  const updatedExpenseDto: ExpenseDto = {
    ...mockExpenses[0],
    description: 'Updated groceries',
    amountInMinorUnits: 5000,
    updatedAt: '2026-08-20T20:00:00Z',
  };
  const expensesApi = {
    getExpenses: vi.fn(() => of(mockExpenses)),
    getNegativeExpenses: vi.fn(() => of(negativeExpenses)),
    createExpense: vi.fn(),
    updateExpense: vi.fn(),
  };
  const now = new Date().toISOString();
  const createExpenseRequest: CreateExpenseRequest = {
    amountInMinorUnits: 2500,
    currency: 'PLN',
    description: 'Lunch',
    categoryId: 'food',
    date: '2026-08-10',
  };

  const updateExpenseRequest: UpdateExpenseRequest = {
    amountInMinorUnits: 2500,
    currency: 'PLN',
    description: 'Lunch',
    categoryId: 'food',
    date: '2026-08-10',
  };
  const expenseDto: ExpenseDto = {
    id: '1',
    amountInMinorUnits: 2500,
    currency: 'PLN',
    description: 'Lunch',
    categoryId: 'food',
    date: '2026-08-10',
    createdAt: now,
    updatedAt: now,
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExpensesStore,
        {
          provide: ExpensesApiService,
          useValue: expensesApi,
        },
      ],
    });
    vi.clearAllMocks();
  });

  test('should have an empty initial state', () => {
    const store = TestBed.inject(ExpensesStore);

    expect(store.creating()).toBe(false);
    expect(store.createError()).toBeNull();
    expect(store.updating()).toBe(false);
    expect(store.updateError()).toBeNull();
    expect(store.expenses()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  test('should calculate expense count and total amount', () => {
    const store = TestBed.inject(ExpensesStore);

    patchState(unprotected(store), {
      expenses: [
        {
          id: '1',
          amountInMinorUnits: 4599,
          currency: 'PLN',
          description: 'Groceries',
          categoryId: 'food',
          date: '2026-08-10',
          createdAt: '2026-08-10T18:30:00Z',
          updatedAt: '2026-08-10T18:30:00Z',
        },
        {
          id: '2',
          amountInMinorUnits: 12500,
          currency: 'PLN',
          description: 'Electricity bill',
          categoryId: 'bills',
          date: '2026-08-08',
          createdAt: '2026-08-08T09:00:00Z',
          updatedAt: '2026-08-08T09:00:00Z',
        },
        {
          id: '3',
          amountInMinorUnits: 1599,
          currency: 'PLN',
          description: 'Coffee',
          categoryId: 'food',
          date: '2026-08-07',
          createdAt: '2026-08-07T07:45:00Z',
          updatedAt: '2026-08-07T07:45:00Z',
        },
      ],
    });

    expect(store.expenseCount()).toBe(3);
    expect(store.totalExpensesAmountInMinorUnits()).toBe(18698);
  });

  test('should recalculate derived values when expenses change', () => {
    const store = TestBed.inject(ExpensesStore);

    patchState(unprotected(store), {
      expenses: [
        {
          id: '1',
          amountInMinorUnits: 1000,
          currency: 'PLN',
          description: 'Coffee',
          categoryId: 'food',
          date: '2026-08-10',
          createdAt: '2026-08-10T10:00:00Z',
          updatedAt: '2026-08-10T10:00:00Z',
        },
      ],
    });

    expect(store.expenseCount()).toBe(1);
    expect(store.totalExpensesAmountInMinorUnits()).toBe(1000);

    patchState(unprotected(store), {
      expenses: [
        {
          id: '1',
          amountInMinorUnits: 1000,
          currency: 'PLN',
          description: 'Coffee',
          categoryId: 'food',
          date: '2026-08-10',
          createdAt: '2026-08-10T10:00:00Z',
          updatedAt: '2026-08-10T10:00:00Z',
        },
        {
          id: '2',
          amountInMinorUnits: 2500,
          currency: 'PLN',
          description: 'Lunch',
          categoryId: 'food',
          date: '2026-08-10',
          createdAt: '2026-08-10T13:00:00Z',
          updatedAt: '2026-08-10T13:00:00Z',
        },
      ],
    });

    expect(store.expenseCount()).toBe(2);
    expect(store.totalExpensesAmountInMinorUnits()).toBe(3500);
  });

  test('should load expenses from the API', () => {
    const store = TestBed.inject(ExpensesStore);
    const subject = new Subject<Expense[]>();

    vi.mocked(expensesApi.getExpenses).mockReturnValue(subject);

    store.loadExpenses();

    expect(store.loading()).toBe(true);
    expect(expensesApi.getExpenses).toHaveBeenCalledTimes(1);

    subject.next(mockExpenses);
    subject.complete();

    expect(store.expenses()).toEqual(mockExpenses);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  test('should expose an error when loading expenses fails', () => {
    const store = TestBed.inject(ExpensesStore);
    const subject = new Subject<Expense[]>();
    vi.mocked(expensesApi.getExpenses).mockReturnValue(subject);

    store.loadExpenses();

    expect(store.loading()).toBe(true);

    subject.error(new Error('API failure'));

    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('Failed to load expenses.');
  });

  test('should ignore the previous request when loading expenses again', () => {
    const store = TestBed.inject(ExpensesStore);

    const firstRequest$ = new Subject<Expense[]>();
    const secondRequest$ = new Subject<Expense[]>();

    vi.mocked(expensesApi.getExpenses)
      .mockReturnValueOnce(firstRequest$)
      .mockReturnValueOnce(secondRequest$);

    store.loadExpenses();
    store.loadExpenses();

    firstRequest$.next([mockExpenses[0]]);

    expect(store.expenses()).toEqual([]);

    secondRequest$.next([mockExpenses[1]]);

    expect(store.expenses()).toEqual([mockExpenses[1]]);

    firstRequest$.complete();
    secondRequest$.complete();
  });

  test('should clear a previous error when loading starts', () => {
    const store = TestBed.inject(ExpensesStore);

    patchState(unprotected(store), {
      error: 'Previous error',
    });

    const response$ = new Subject<Expense[]>();
    vi.mocked(expensesApi.getExpenses).mockReturnValue(response$);

    store.loadExpenses();

    expect(store.error()).toBeNull();
    expect(store.loading()).toBe(true);
  });

  test('should preserve existing expenses when loading fails', () => {
    const store = TestBed.inject(ExpensesStore);

    patchState(unprotected(store), {
      expenses: mockExpenses,
    });

    const response$ = new Subject<Expense[]>();
    vi.mocked(expensesApi.getExpenses).mockReturnValue(response$);

    store.loadExpenses();

    response$.error(new Error('API failure'));

    expect(store.expenses()).toEqual(mockExpenses);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBe('Failed to load expenses.');
  });

  test('should handle an empty expense list', () => {
    const store = TestBed.inject(ExpensesStore);

    const response$ = new Subject<Expense[]>();
    vi.mocked(expensesApi.getExpenses).mockReturnValue(response$);

    store.loadExpenses();

    response$.next([]);
    response$.complete();

    expect(store.expenses()).toEqual([]);
    expect(store.expenseCount()).toBe(0);
    expect(store.totalExpensesAmountInMinorUnits()).toBe(0);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  test('should handle negative expense amounts', () => {
    const store = TestBed.inject(ExpensesStore);

    const response$ = new Subject<Expense[]>();
    vi.mocked(expensesApi.getExpenses).mockReturnValue(response$);

    store.loadExpenses();

    response$.next(negativeExpenses);
    response$.complete();

    expect(store.expenses()).toEqual(negativeExpenses);
    expect(store.totalExpensesAmountInMinorUnits()).toBe(-1000);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  test('should set creating state while creating an expense', () => {
    const response$ = new Subject<ExpenseDto>();

    vi.mocked(expensesApi.createExpense).mockReturnValue(response$);

    const store = TestBed.inject(ExpensesStore);

    store.addExpense(createExpenseRequest);

    expect(store.creating()).toBe(true);

    response$.next(expenseDto);
    response$.complete();

    expect(store.creating()).toBe(false);
  });
  test('should send create expense request to API', () => {
    const response$ = new Subject<ExpenseDto>();

    vi.mocked(expensesApi.createExpense).mockReturnValue(response$);

    const store = TestBed.inject(ExpensesStore);

    store.addExpense(createExpenseRequest);

    expect(expensesApi.createExpense).toHaveBeenCalledTimes(1);
    expect(expensesApi.createExpense).toHaveBeenCalledWith(createExpenseRequest);

    response$.complete();
  });

  test('should add created expense to state', () => {
    const response$ = new Subject<ExpenseDto>();

    vi.mocked(expensesApi.createExpense).mockReturnValue(response$);

    const store = TestBed.inject(ExpensesStore);

    store.addExpense(createExpenseRequest);

    response$.next(expenseDto);
    response$.complete();

    expect(store.expenses()).toEqual([mapExpenseDtoToExpense(expenseDto)]);
  });

  test('should handle create expense error', () => {
    const response$ = new Subject<ExpenseDto>();

    vi.mocked(expensesApi.createExpense).mockReturnValue(response$);

    const store = TestBed.inject(ExpensesStore);

    store.addExpense(createExpenseRequest);

    expect(store.creating()).toBe(true);

    response$.error(new Error('API failure'));

    expect(store.creating()).toBe(false);
    expect(store.createError()).toBe('Failed to create expense.');
  });

  test('should preserve existing expenses when creating expense fails', () => {
    const response$ = new Subject<ExpenseDto>();

    vi.mocked(expensesApi.createExpense).mockReturnValue(response$);

    const store = TestBed.inject(ExpensesStore);

    patchState(unprotected(store), {
      expenses: mockExpenses,
    });

    store.addExpense(createExpenseRequest);

    response$.error(new Error('API failure'));

    expect(store.expenses()).toEqual(mockExpenses);
  });

  test('should clear previous create error when creating starts', () => {
    const response$ = new Subject<ExpenseDto>();

    vi.mocked(expensesApi.createExpense).mockReturnValue(response$);

    const store = TestBed.inject(ExpensesStore);

    patchState(unprotected(store), {
      createError: 'Previous create error',
    });

    store.addExpense(createExpenseRequest);

    expect(store.createError()).toBeNull();
    expect(store.creating()).toBe(true);

    response$.complete();
  });
  test('should clear create error before a subsequent create attempt', () => {
    const firstResponse$ = new Subject<ExpenseDto>();
    const secondResponse$ = new Subject<ExpenseDto>();

    vi.mocked(expensesApi.createExpense)
      .mockReturnValueOnce(firstResponse$)
      .mockReturnValueOnce(secondResponse$);

    const store = TestBed.inject(ExpensesStore);

    store.addExpense(createExpenseRequest);

    firstResponse$.error(new Error('API failure'));

    expect(store.createError()).toBe('Failed to create expense.');

    store.addExpense(createExpenseRequest);

    expect(expensesApi.createExpense).toHaveBeenCalledTimes(2);
    expect(store.createError()).toBeNull();
    expect(store.creating()).toBe(true);

    secondResponse$.complete();
  });
  test('should add created expense to state', () => {
    const response$ = new Subject<ExpenseDto>();

    vi.mocked(expensesApi.createExpense).mockReturnValue(response$);

    const store = TestBed.inject(ExpensesStore);

    store.addExpense(createExpenseRequest);

    response$.next(expenseDto);
    response$.complete();

    expect(store.expenses()).toEqual([mapExpenseDtoToExpense(expenseDto)]);

    expect(store.creating()).toBe(false);
    expect(store.createError()).toBeNull();
  });

  test('should update existing expense in state', () => {
    const response$ = new Subject<ExpenseDto>();

    vi.mocked(expensesApi.updateExpense).mockReturnValue(response$);

    const store = TestBed.inject(ExpensesStore);

    patchState(unprotected(store), {
      expenses: mockExpenses,
    });

    store.updateExpense({
      id: '1',
      request: updateExpenseRequest,
    });

    response$.next(updatedExpenseDto);
    response$.complete();

    expect(store.expenses()).toEqual([
      mapExpenseDtoToExpense(updatedExpenseDto),
      mockExpenses[1],
      mockExpenses[2],
    ]);

    expect(store.updating()).toBe(false);
    expect(store.updateError()).toBeNull();
  });

  test('should preserve expenses when updating a non-existing expense fails', () => {
    const response$ = new Subject<ExpenseDto>();

    vi.mocked(expensesApi.updateExpense).mockReturnValue(response$);

    const store = TestBed.inject(ExpensesStore);

    patchState(unprotected(store), {
      expenses: mockExpenses,
    });

    store.updateExpense({
      id: 'non-existing-id',
      request: updateExpenseRequest,
    });

    response$.error(new Error('Expense not found'));

    expect(store.expenses()).toEqual(mockExpenses);
    expect(store.updating()).toBe(false);
    expect(store.updateError()).toBe('Failed to update expense.');
  });
});
