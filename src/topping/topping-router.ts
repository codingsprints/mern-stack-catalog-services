import express from 'express';
import fileUpload from 'express-fileupload';
import { asyncWrapper } from '../common/utils/wrapper';

import { S3Storage } from '../common/services/S3Storage';
import createHttpError from 'http-errors';
import createToppingValidator from './create-topping-validator';
import { ToppingService } from './topping-service';
import { ToppingController } from './topping-controller';
import authenticate from '../common/middlewares/authenticate';
import { canAccess } from '../common/middlewares/canAccess';
import { Roles } from '../common/constants/constants';
import { validate } from '../common/utils/ValidationChain';
import { createMessageProducerBroker } from '../common/factories/brokerFactory';

const router = express.Router();

const toppingService = new ToppingService();
const broker = createMessageProducerBroker();
const toppingController = new ToppingController(
  new S3Storage(),
  toppingService,
  broker,
);

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
  validate(createToppingValidator),
  asyncWrapper(toppingController.create),
);

router.put(
  '/:toppingId',
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
  validate(createToppingValidator),
  asyncWrapper(toppingController.update),
);

router.get('/', asyncWrapper(toppingController.get));
router.get('/:toppingId', asyncWrapper(toppingController.getById));
router.delete('/:toppingId', asyncWrapper(toppingController.delete));

export default router;
