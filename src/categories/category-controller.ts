import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { CategoryService } from './category-service';
import { Logger } from 'winston';
import { Category, PriceConfiguration } from './categoies.types';

export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly logger: Logger,
  ) {
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.index = this.index.bind(this);
    this.getOne = this.getOne.bind(this);
    this.delete = this.delete.bind(this);
  }

  async create(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result?.array()[0]?.msg as string));
    }

    const { name, priceConfiguration, attributes } = req.body as Category;

    const category = await this.categoryService.create({
      name,
      priceConfiguration,
      attributes,
    });

    this.logger.info(`Created category`, { id: category._id });
    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'create category successfully!!',
      data: { categoryDto: category },
      error: false,
    });
  }

  async update(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0]?.msg as string));
    }

    const categoryId = req.params.id;
    if (!categoryId) {
      return next(createHttpError(404, 'category id can not found!!'));
    }

    const updateData = req.body as Partial<Category>;

    // Check if category exists
    const existingCategory = await this.categoryService.getOne(categoryId);

    if (!existingCategory) {
      return next(createHttpError(404, 'Category not found'));
    }

    if (updateData.priceConfiguration) {
      // Convert existing Map to object if it's a Map
      const existingConfig =
        existingCategory.priceConfiguration instanceof Map
          ? Object.fromEntries(existingCategory.priceConfiguration)
          : existingCategory.priceConfiguration;

      // Merge configurations
      const mergedConfig: PriceConfiguration = {
        ...existingConfig,
        ...updateData.priceConfiguration,
      };

      updateData.priceConfiguration = mergedConfig;
    }

    const updatedCategory = await this.categoryService.update(
      categoryId,
      updateData,
    );

    this.logger.info(`Updated category`, { id: categoryId });

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'update category successfully!!',
      data: { categoryDto: updatedCategory },
      error: false,
    });
  }

  async index(req: Request, res: Response) {
    // const sleep = (ms: number) =>
    //     new Promise((resolve) => setTimeout(resolve, ms));
    // await sleep(5000);
    const categories = await this.categoryService.getAll();
    this.logger.info(`Getting categories list`);

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Getting categories list successfully!!',
      data: { categoryDto: categories },
      error: false,
    });
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const { categoryId } = req.params;
    if (!categoryId) {
      return next(createHttpError(404, 'category id can not found!!'));
    }
    const category = await this.categoryService.getOne(categoryId);
    if (!category) {
      return next(createHttpError(404, 'Category not found'));
    }
    this.logger.info(`Getting category`, { id: category._id });
    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'Getting category successfully!!',
      data: { categoryDto: category },
      error: false,
    });
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    const { categoryId } = req.params;
    if (!categoryId) {
      return next(createHttpError(404, 'category id can not found!!'));
    }
    const category = await this.categoryService.delete(categoryId);
    if (!category) {
      return next(createHttpError(404, 'Category not found'));
    }
    this.logger.info(`delete category`, { id: category._id });
    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'delete category successfully!!',
      data: { categoryDto: category },
      error: false,
    });
  }
}
