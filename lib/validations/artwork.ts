import { z } from 'zod'

export const artworkIdSchema = z
  .string()
  .regex(/^\d+$/, 'Artwork ID must be a positive integer')
  .transform((val) => Number(val))
  .pipe(z.number().int().positive('Artwork ID must be positive'))
