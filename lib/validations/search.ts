import { z } from 'zod'

export const searchQuerySchema = z
  .string()
  .max(500, 'Search query must be 500 characters or less')
  .transform((val) => val.trim())
  .refine((val) => val.length > 0 || val.length === 0, {
    message: 'Search query cannot be empty',
  })

export const departmentIdSchema = z
  .number()
  .int('Department ID must be an integer')
  .positive('Department ID must be positive')
  .optional()

export const mediumSchema = z
  .string()
  .max(200, 'Medium must be 200 characters or less')
  .transform((val) => val.trim())
  .refine((val) => val.length === 0 || val.length >= 1, {
    message: 'Medium cannot be empty',
  })
  .optional()

export const geoLocationSchema = z
  .string()
  .max(200, 'Geographic location must be 200 characters or less')
  .transform((val) => val.trim())
  .refine((val) => val.length === 0 || val.length >= 1, {
    message: 'Geographic location cannot be empty',
  })
  .optional()

export const dateBeginSchema = z
  .number()
  .int('Date must be an integer')
  .min(-5000, 'Date cannot be earlier than 5000 BCE')
  .max(new Date().getFullYear(), 'Date cannot be in the future')
  .optional()

export const dateEndSchema = z
  .number()
  .int('Date must be an integer')
  .min(-5000, 'Date cannot be earlier than 5000 BCE')
  .max(new Date().getFullYear(), 'Date cannot be in the future')
  .optional()

export const booleanFilterSchema = z.boolean().optional()

export const searchFiltersSchema = z
  .object({
    departmentId: departmentIdSchema,
    medium: mediumSchema,
    geoLocation: geoLocationSchema,
    dateBegin: dateBeginSchema,
    dateEnd: dateEndSchema,
    hasImages: booleanFilterSchema,
    isHighlight: booleanFilterSchema,
    isOnView: booleanFilterSchema,
  })
  .refine(
    (data) => {
      if (data.dateBegin !== undefined && data.dateEnd !== undefined) {
        return data.dateBegin <= data.dateEnd
      }
      return true
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['dateBegin'],
    }
  )

export type ValidatedSearchQuery = z.infer<typeof searchQuerySchema>
export type ValidatedSearchFilters = z.infer<typeof searchFiltersSchema>
