import { z } from 'zod'

export const collectionNameSchema = z
  .string()
  .min(1, 'Collection name is required')
  .max(100, 'Collection name must be 100 characters or less')
  .transform((val) => val.trim())
  .refine((val) => val.length >= 3, {
    message: 'Collection name must be at least 3 characters',
  })

export const collectionDescriptionSchema = z
  .string()
  .min(1, 'Description is required')
  .max(1000, 'Description must be 1000 characters or less')
  .transform((val) => val.trim())
  .refine((val) => val.length >= 10, {
    message: 'Description must be at least 10 characters',
  })

export const collectionFormSchema = z.object({
  name: collectionNameSchema,
  description: collectionDescriptionSchema,
})

export type ValidatedCollectionForm = z.infer<typeof collectionFormSchema>