import { Category } from '../model/category.model';
import { CategoryDto } from './category.dto';

export function mapCategoryDtoToCategory(dto: CategoryDto): Category {
  return {
    id: dto.id,
    name: dto.name,
  };
}
