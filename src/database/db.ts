import mongoose from 'mongoose';
import { configENV } from '../config/config';

export const initDB = async () => {
  await mongoose.connect(configENV.database_Url);
};
