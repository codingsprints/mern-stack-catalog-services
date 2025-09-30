import { NextFunction, Response } from 'express';
import { Request } from 'express-jwt';
import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { ProductService } from './product-service';
import { Filter, Product } from './product-types';
import { UploadedFile } from 'express-fileupload';
import { FileStorage } from '../common/types/storage';
import { AuthRequest } from '../common/types/types';
import { PRODUCT_IMAGE, Roles } from '../common/constants/constants';
import mongoose from 'mongoose';

export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly storage: FileStorage,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0]?.msg as string));
    }

    console.log('image ------->', req.files!.image);

    const image = req.files!.image as UploadedFile;
    const imageName = uuidv4();

    await this.storage.upload(PRODUCT_IMAGE, {
      filename: imageName,
      fileData: image.data.buffer,
    });

    const {
      name,
      description,
      priceConfiguration,
      attributes,
      tenantId,
      categoryId,
      isPublish,
    } = req.body;

    const product = {
      name,
      description,
      priceConfiguration: JSON.parse(priceConfiguration as string),
      attributes: JSON.parse(attributes as string),
      tenantId,
      categoryId,
      isPublish,
      image: imageName,
    };

    if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
      const tenant = (req as AuthRequest).auth.tenant;

      if (product.tenantId !== tenant) {
        return next(
          createHttpError(403, 'You are not allowed to access this product'),
        );
      }
    }

    const newProduct = await this.productService.createProduct(
      product as unknown as Product,
    );

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'create product successfully!!',
      data: { productDto: newProduct },
      error: false,
    });
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    let imageName: string | undefined;
    let oldImage: string | undefined;

    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0]?.msg as string));
    }

    const { productId } = req.params;
    if (!productId) {
      return next(createHttpError(404, 'product id can not found!!'));
    }

    const product = await this.productService.getProduct(productId);
    if (!product) {
      return next(createHttpError(404, 'Product not found'));
    }

    if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
      const tenant = (req as AuthRequest).auth.tenant;
      console.log('tenant ----->', tenant);
      console.log('product.tenantId ----->', product.tenantId);
      if (product.tenantId !== tenant) {
        return next(
          createHttpError(403, 'You are not allowed to access this product'),
        );
      }
    }

    if (req.files?.image) {
      oldImage = product.image;

      const image = req.files.image as UploadedFile;
      imageName = uuidv4();

      await this.storage.upload(PRODUCT_IMAGE, {
        filename: imageName,
        fileData: image.data.buffer,
      });

      await this.storage.delete(oldImage);
    }

    const {
      name,
      description,
      priceConfiguration,
      attributes,
      tenantId,
      categoryId,
      isPublish,
    } = req.body;

    const productToUpdate = {
      name,
      description,
      priceConfiguration: JSON.parse(priceConfiguration as string),
      attributes: JSON.parse(attributes as string),
      tenantId,
      categoryId,
      isPublish,
      image: imageName ? imageName : (oldImage as string),
    };

    const updatedProduct = await this.productService.updateProduct(
      productId,
      productToUpdate,
    );

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'update product successfully!!',
      data: { productDto: updatedProduct },
      error: false,
    });
  };

  index = async (req: Request, res: Response) => {
    const { q, tenantId, categoryId, isPublish } = req.query;

    const filters: Filter = {};

    if (isPublish === 'true') {
      filters.isPublish = true;
    }

    if (tenantId) filters.tenantId = tenantId as string;

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId as string)) {
      filters.categoryId = new mongoose.Types.ObjectId(categoryId as string);
    }

    // todo: add logging
    const products = await this.productService.getProducts(
      q as string,
      filters,
      {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      },
    );

    console.log('products ----->', products);

    const finalProducts = (products.data as Product[]).map(
      (product: Product) => {
        return {
          ...product,
          image: this.storage.getObjectUri(PRODUCT_IMAGE, product.image),
        };
      },
    );

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'fetch product successfully!!',
      data: {
        productDto: finalProducts,
        total: products.total,
        pageSize: products.pageSize,
        currentPage: products.currentPage,
      },
      error: false,
    });
  };

  getProductById = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    if (!productId) {
      return next(createHttpError(404, 'product id can not found!!'));
    }
    const product = await this.productService.getProduct(productId);
    if (!product) {
      return next(createHttpError(404, 'Product not found'));
    }
    console.log('products ----->', product);
    const imageUri = this.storage.getObjectUri(PRODUCT_IMAGE, product.image);
    const newProduct = {
      ...product,
      image: imageUri,
    };

    console.log('newProducts ----->', newProduct);

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'fetch product successfully!!',
      data: { productDto: newProduct },
      error: false,
    });
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    if (!productId) {
      return next(createHttpError(404, 'product id can not found!!'));
    }
    const product = await this.productService.getProduct(productId);
    if (!product) {
      return next(createHttpError(404, 'Product not found'));
    }

    if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
      const tenant = (req as AuthRequest).auth.tenant;

      if (product.tenantId !== tenant) {
        return next(
          createHttpError(403, 'You are not allowed to access this product'),
        );
      }
    }
    const deletedProduct = await this.productService.deleteProduct(productId);
    if (!deletedProduct) {
      return next(createHttpError(404, 'Product not found'));
    }

    await this.storage.delete(deletedProduct.image);

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'delete product successfully!!',
      data: { productDto: deletedProduct },
      error: false,
    });
  };
}
