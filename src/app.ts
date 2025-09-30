import express, { Request, Response } from 'express';
import { globalErrorHandler } from './common/middlewares/globalMiddleware';
import cookieParser from 'cookie-parser';
import categoryRouter from './categories/category-router';
import productRouter from './product/product-router';
import toppingRouter from './topping/topping-router';
import cors from 'cors';
import { configENV } from './config/config';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  }),
);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from catalog service');
});

app.use(`/categories`, categoryRouter);
app.use(`/products`, productRouter);
app.use(`/toppings`, toppingRouter);

app.use(globalErrorHandler);

export default app;
