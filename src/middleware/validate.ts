import { ZodObject, ZodError } from 'zod';

export const validate = (schema: ZodObject) => async (req: any, res: any, next: any) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(422).json({
        error: 'Validation Failed',
        details: (error as ZodError).issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    return res.status(500).json({ error: 'Internal Server Error during validation' });
  }
};