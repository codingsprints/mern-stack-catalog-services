import { paginationLabels } from '../config/pagination';
import productModel from './product-model';
import { Filter, PaginateQuery, Product } from './product-types';

export class ProductService {
  createProduct = async (product: Product) => {
    return (await productModel.create(product)) as Product;
  };

  async updateProduct(productId: string, product: Product) {
    return (await productModel.findOneAndUpdate(
      { _id: productId },
      {
        $set: product,
      },
      {
        new: true,
      },
    )) as Product;
  }

  async getProduct(productId: string): Promise<Product | null> {
    return await productModel.findOne({ _id: productId }).lean();
  }

  async getProducts(q: string, filters: Filter, paginateQuery: PaginateQuery) {
    const searchQueryRegexp = new RegExp(q, 'i');

    const matchQuery = {
      ...filters,
      name: searchQueryRegexp,
    };

    const aggregate = productModel.aggregate([
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                attributes: 1,
                priceConfiguration: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: '$category',
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return productModel.aggregatePaginate(aggregate, {
      ...paginateQuery,
      customLabels: paginationLabels,
    });
  }

  async deleteProduct(productId: string): Promise<Product | null> {
    return await productModel.findOneAndDelete({ _id: productId });
  }
}
