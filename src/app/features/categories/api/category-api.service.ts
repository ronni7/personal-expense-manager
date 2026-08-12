import { Injectable } from '@angular/core';
import { delay, map, Observable, of } from 'rxjs';

import { mapCategoryDtoToCategory } from './category.mapper';
import { Category } from '../model/category.model';
import { MOCK_CATEGORIES } from './category.mock';

@Injectable({
  providedIn: 'root',
})
export class CategoriesApiService {
  getCategories(): Observable<Category[]> {
    return of(MOCK_CATEGORIES).pipe(
      delay(300),
      map((categories) => categories.map(mapCategoryDtoToCategory)),
    );
  }
}
