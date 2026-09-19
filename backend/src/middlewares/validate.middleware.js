import { ZodError } from 'zod';
import { apiResponse } from '../utils/apiResponse.js';

/**
 * Middleware pemvalidasi input berbasis skema Zod
 * @param {import('zod').ZodSchema | { body?: import('zod').ZodSchema, query?: import('zod').ZodSchema, params?: import('zod').ZodSchema }} schema
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      if (schema.shape || schema._def?.typeName) {
        req.body = await schema.parseAsync(req.body);
      } else {
        if (schema.body) {
          req.body = await schema.body.parseAsync(req.body);
        }
        if (schema.query) {
          req.query = await schema.query.parseAsync(req.query);
        }
        if (schema.params) {
          req.params = await schema.params.parseAsync(req.params);
        }
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return apiResponse.error(res, {
          statusCode: 400,
          message: 'Validasi input gagal',
          errors: formattedErrors,
        });
      }
      return next(error);
    }
  };
}
