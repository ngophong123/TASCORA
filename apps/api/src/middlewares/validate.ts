import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

type RequestValidationSchema = z.ZodType<{
  body?: unknown;
  query?: unknown;
  params?: unknown;
}>;

export const validate = (schema: RequestValidationSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if (parsed.query !== undefined) {
        req.query = parsed.query as Request['query'];
      }
      if (parsed.params !== undefined) {
        req.params = parsed.params as Request['params'];
      }
      return next();
    } catch (error) {
      return res.status(400).json({ success: false, error });
    }
  };
