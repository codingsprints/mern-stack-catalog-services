import { NextFunction, Response, Request } from 'express';
import { UploadedFile } from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import { FileStorage } from '../common/types/storage';
import { ToppingService } from './topping-service';
import { CreataeRequestBody, Topping, ToppingEvents } from './topping-types';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { AuthRequest } from '../common/types/types';
import {
  Roles,
  TOPIC_NAME,
  TOPPING_IMAGE,
} from '../common/constants/constants';
import { MessageProducerBroker } from '../common/types/broker';

export class ToppingController {
  constructor(
    private readonly storage: FileStorage,
    private readonly toppingService: ToppingService,
    private readonly Broker: MessageProducerBroker,
  ) {}

  create = async (
    req: Request<object, object, CreataeRequestBody>,
    res: Response,
    next: NextFunction,
  ) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(createHttpError(400, result.array()[0]?.msg as string));
    }

    const image = req.files!.image as UploadedFile;
    const fileUuid = uuidv4();

    // todo: add error handling
    await this.storage.upload(TOPPING_IMAGE, {
      filename: fileUuid,
      fileData: image.data.buffer,
    });

    const { name, price, tenantId } = req.body;

    // const topping = { name, price, tenantId } as Topping;

    // if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
    //   const tenant = (req as AuthRequest).auth.tenant;
    //   if (topping.tenantId !== tenant) {
    //     return next(
    //       createHttpError(403, 'You are not allowed to access this product'),
    //     );
    //   }
    // }

    const savedTopping = await this.toppingService.create({
      name,
      price,
      tenantId: tenantId ? tenantId : null,
      image: fileUuid,
    } as Topping);

    // Send topping to kafka.
    // todo: move topic name to the config
    await this.Broker.sendMessage(
      TOPIC_NAME.topping,
      JSON.stringify({
        event_type: ToppingEvents.TOPPING_CREATE,
        data: {
          id: savedTopping._id,
          price: savedTopping.price,
          tenantId: savedTopping.tenantId,
        },
      }),
    );

    res.json({
      code: 200,
      status: 'success',
      message: 'create topping successfully!!',
      data: { toppingDto: savedTopping },
      error: false,
    });
  };

  get = async (req: Request, res: Response) => {
    const toppings = await this.toppingService.getAll(
      req.query.tenantId as string,
    );

    // todo: add error handling
    const readyToppings = toppings.map((topping) => {
      return {
        id: topping._id,
        name: topping.name,
        price: topping.price,
        tenantId: topping.tenantId,
        image: this.storage.getObjectUri(TOPPING_IMAGE, topping.image),
      };
    });
    res.json({
      code: 200,
      status: 'success',
      message: 'Getting toppings list successfully!!',
      data: { toppingDto: readyToppings },
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

    const { toppingId } = req.params;

    if (!toppingId) {
      return next(createHttpError(404, 'topping id can not found!!'));
    }

    const topping = await this.toppingService.getOne(toppingId);
    if (!topping) {
      return next(createHttpError(404, 'Topping not found'));
    }

    // if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
    //   const tenant = (req as AuthRequest).auth.tenant;
    //   if (topping.tenantId !== tenant) {
    //     return next(
    //       createHttpError(403, 'You are not allowed to access this topping'),
    //     );
    //   }
    // }

    if (req.files?.image) {
      oldImage = topping.image;

      const image = req.files.image as UploadedFile;
      imageName = uuidv4();

      await this.storage.upload(TOPPING_IMAGE, {
        filename: imageName,
        fileData: image.data.buffer,
      });

      await this.storage.delete(oldImage);
    }

    const { name, price, tenantId } = req.body as Topping;

    // created topping tenantId and update request tenantId sould different
    if (
      tenantId &&
      (req as AuthRequest).auth.role !== Roles.ADMIN &&
      tenantId !== topping.tenantId
    ) {
      return next(createHttpError(403, 'You are not allowed to change tenant'));
    }

    const updateToTopping = {
      name,
      price,
      tenantId,
      image: imageName ? imageName : (oldImage as string),
    };

    const updatedTopping = await this.toppingService.update(
      toppingId,
      updateToTopping,
    );

    // Send topping to kafka
    await this.Broker.sendMessage(
      TOPIC_NAME.topping,
      JSON.stringify({
        event_type: ToppingEvents.TOPPING_CREATE,
        data: {
          price: updateToTopping.price,
          tenantId: updateToTopping.tenantId,
          id: toppingId,
        },
      }),
    );

    res.json({
      code: 200,
      status: 'success',
      message: 'update topping successfully!!',
      data: { toppingDto: updatedTopping },
      error: false,
    });
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    const { toppingId } = req.params;
    if (!toppingId) {
      return next(createHttpError(404, 'topping id can not found!!'));
    }

    const topping = await this.toppingService.getOne(toppingId);
    if (!topping) {
      return next(createHttpError(404, 'Topping not found'));
    }

    const imageUri = this.storage.getObjectUri(TOPPING_IMAGE, topping.image);
    const newTopping = {
      ...topping,
      image: imageUri,
    };

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'fetch topping successfully!!',
      data: { productDto: newTopping },
      error: false,
    });
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    const { toppingId } = req.params;

    if (!toppingId) {
      return next(createHttpError(404, 'topping id can not found!!'));
    }

    const topping = await this.toppingService.getOne(toppingId);
    if (!topping) {
      return next(createHttpError(404, 'Topping not found'));
    }

    const deletedTopping = await this.toppingService.deleteTopping(toppingId);
    if (!deletedTopping) {
      return next(createHttpError(404, 'Topping not found'));
    }

    await this.storage.delete(topping.image);

    res.status(200).json({
      code: 200,
      status: 'success',
      message: 'delete topping successfully!!',
      data: { toppingDto: deletedTopping },
      error: false,
    });
  };
}
