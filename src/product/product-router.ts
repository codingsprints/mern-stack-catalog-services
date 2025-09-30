import express from 'express';
import { validate } from '../common/utils/ValidationChain';
import { asyncWrapper } from '../common/utils/wrapper';
import authenticate from '../common/middlewares/authenticate';
import { canAccess } from '../common/middlewares/canAccess';
import { Roles } from '../common/constants/constants';
import categoryUpdateValidator from './create-product-validator';
import { ProductController } from './product-controller';
import { ProductService } from './product-service';
import createHttpError from 'http-errors';
import { S3Storage } from '../common/services/S3Storage';
import fileUpload from 'express-fileupload';
import updateProductValidator from './update-product-validator';

const router = express.Router();

const productService = new ProductService();
const s3Storage = new S3Storage();
const productController = new ProductController(productService, s3Storage);

router.post(
  '/',
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  fileUpload({
    limits: { fileSize: 500 * 1024 }, // 500kb
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
      const error = createHttpError(400, 'File size exceeds the limit');
      next(error);
    },
  }),
  validate(categoryUpdateValidator),
  asyncWrapper(productController.create),
);

router.put(
  '/:productId',
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  fileUpload({
    limits: { fileSize: 500 * 1024 }, // 500kb
    abortOnLimit: true,
    limitHandler: (req, res, next) => {
      const error = createHttpError(400, 'File size exceeds the limit');
      next(error);
    },
  }),
  validate(updateProductValidator),
  asyncWrapper(productController.update),
);

router.get('/', asyncWrapper(productController.index));
router.get('/:productId', asyncWrapper(productController.getProductById));
router.delete(
  '/:productId',
  authenticate,
  canAccess([Roles.ADMIN, Roles.MANAGER]),
  asyncWrapper(productController.deleteProduct),
);

export default router;
