import { Category } from './categoies.types';
import CategoryModel from './categoies.model';

export class CategoryService {
  async create(category: Category) {
    const newCategory = new CategoryModel(category);
    return await newCategory.save();
  }

  async getAll() {
    return await CategoryModel.find();
  }

  async getOne(categoryId: string) {
    return await CategoryModel.findOne({ _id: categoryId });
  }

  async delete(categoryId: string) {
    return await CategoryModel.findByIdAndDelete({ _id: categoryId });
  }

  async update(
    categoryId: string,
    updateData: Partial<Category>,
  ): Promise<({ _id: string } & Category) | null> {
    return await CategoryModel.findByIdAndUpdate(
      categoryId,
      { $set: updateData },
      { new: true },
    );
  }
}
