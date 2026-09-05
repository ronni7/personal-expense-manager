import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { CategoriesApiService } from '../api/category-api.service';
import { Category } from '../model/category.model';
import { CategoriesStore } from './category.store';

describe('CategoriesStore', () => {
  let store: InstanceType<typeof CategoriesStore>;
  let categoriesApi: {
    getCategories: ReturnType<typeof vi.fn>;
  };

  const categories: Category[] = [
    { id: 'food', name: 'Food' },
    { id: 'bills', name: 'Bills' },
  ];

  beforeEach(() => {
    categoriesApi = {
      getCategories: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CategoriesStore,
        {
          provide: CategoriesApiService,
          useValue: categoriesApi,
        },
      ],
    });

    store = TestBed.inject(CategoriesStore);
  });

  test('should initialize with empty state', () => {
    expect(store.categories()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.loaded()).toBe(false);
  });

  test('should load categories when not loaded', () => {
    const response$ = new Subject<Category[]>();

    categoriesApi.getCategories.mockReturnValue(response$);

    store.ensureLoaded();

    expect(categoriesApi.getCategories).toHaveBeenCalledTimes(1);
    expect(store.loading()).toBe(true);
    expect(store.loaded()).toBe(false);

    response$.next(categories);
    response$.complete();

    expect(store.categories()).toEqual(categories);
    expect(store.loading()).toBe(false);
    expect(store.loaded()).toBe(true);
    expect(store.error()).toBeNull();
  });
  test('should not load categories when already loaded', () => {
    categoriesApi.getCategories.mockReturnValue(of(categories));

    store.ensureLoaded();

    expect(categoriesApi.getCategories).toHaveBeenCalledTimes(1);
    expect(store.loaded()).toBe(true);

    store.ensureLoaded();

    expect(categoriesApi.getCategories).toHaveBeenCalledTimes(1);
  });

  test('should not load categories when loading is already in progress', () => {
    const response$ = new Subject<Category[]>();

    categoriesApi.getCategories.mockReturnValue(response$);

    store.ensureLoaded();
    store.ensureLoaded();

    expect(categoriesApi.getCategories).toHaveBeenCalledTimes(1);

    response$.next(categories);
    response$.complete();

    expect(store.loaded()).toBe(true);
  });
  test('should mark store as loaded when API returns an empty array', () => {
    categoriesApi.getCategories.mockReturnValue(of([]));

    store.ensureLoaded();

    expect(store.categories()).toEqual([]);
    expect(store.loaded()).toBe(true);
    expect(store.loading()).toBe(false);
  });
  test('should keep store unloaded when loading fails', () => {
    categoriesApi.getCategories.mockReturnValue(throwError(() => new Error('API error')));

    store.ensureLoaded();

    expect(store.loading()).toBe(false);
    expect(store.loaded()).toBe(false);
    expect(store.error()).toBe('Failed to load categories.');
  });
  test('should call loadCategories twice', async () => {
    categoriesApi.getCategories.mockReturnValue(of(categories));

    store.loadCategories();
    store.loadCategories();

    await Promise.resolve();

    expect(categoriesApi.getCategories).toHaveBeenCalledTimes(2);
  });
  test('should load categories successfully', () => {
    categoriesApi.getCategories.mockReturnValue(of(categories));

    store.loadCategories();

    expect(categoriesApi.getCategories).toHaveBeenCalledTimes(1);
    expect(store.categories()).toEqual(categories);
    expect(store.loaded()).toBe(true);
  });
  test('should handle loading error', () => {
    categoriesApi.getCategories.mockReturnValue(throwError(() => new Error('API error')));

    store.loadCategories();

    expect(categoriesApi.getCategories).toHaveBeenCalledTimes(1);
    expect(store.loading()).toBe(false);
    expect(store.loaded()).toBe(false);
    expect(store.error()).toBe('Failed to load categories.');
  });
  test('should not load categories when already loaded', () => {
    categoriesApi.getCategories.mockReturnValue(of(categories));

    store.loadCategories();

    expect(store.loaded()).toBe(true);
    expect(categoriesApi.getCategories).toHaveBeenCalledTimes(1);

    store.ensureLoaded();

    expect(categoriesApi.getCategories).toHaveBeenCalledTimes(1);
  });
  test('should not load categories when loading is already in progress', () => {
    const response$ = new Subject<Category[]>();

    categoriesApi.getCategories.mockReturnValue(response$);

    store.ensureLoaded();

    expect(store.loading()).toBe(true);
    expect(categoriesApi.getCategories).toHaveBeenCalledTimes(1);

    store.ensureLoaded();

    expect(categoriesApi.getCategories).toHaveBeenCalledTimes(1);

    response$.next(categories);
    response$.complete();
  });
});
