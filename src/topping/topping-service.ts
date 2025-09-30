import toppingModel from './topping-model';
import { Topping } from './topping-types';

export class ToppingService {
  async create(topping: Topping) {
    return await toppingModel.create(topping);
  }

  async getAll(tenantId: string) {
    // todo: !Important, add pagination
    return await toppingModel.find({ tenantId });
  }

  async getOne(toppingId: string) {
    return await toppingModel.findOne({ _id: toppingId }).lean();
  }

  async update(
    toppingId: string,
    topping: Topping,
  ): Promise<({ _id: string } & Topping) | null> {
    return await toppingModel.findByIdAndUpdate(
      toppingId,
      { $set: topping },
      { new: true },
    );
  }

  async deleteTopping(toppingId: string) {
    return await toppingModel.findByIdAndDelete({ _id: toppingId });
  }
}
