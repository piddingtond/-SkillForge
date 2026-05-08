import { z } from 'zod'

// Auth validation
export const PasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character')

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: PasswordSchema,
  full_name: z.string().min(2).max(100).optional(),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// User validation
export const UserProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  username: z.string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, dashes, and underscores')
    .optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
})

// Skill upload validation
export const SkillUploadSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  
  slug: z.string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and dashes only'),
  
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  
  long_description: z.string()
    .min(100, 'Long description must be at least 100 characters')
    .max(5000, 'Long description cannot exceed 5000 characters')
    .optional(),
  
  subject: z.enum([
    'Strategy',
    'Coding',
    'Communication',
    'Creative',
    'Science',
    'Planning',
    'Security',
    'DevOps',
    'Marketing',
    'Finance'
  ]),
  
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  
  price: z.number()
    .min(0, 'Price cannot be negative')
    .max(1000, 'Price cannot exceed $1000')
    .multipleOf(0.01, 'Price must be in cents'),
  
  is_free: z.boolean(),
})

// Review validation
export const ReviewSchema = z.object({
  skill_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
})

// Search validation
export const SearchQuerySchema = z.object({
  q: z.string().max(200).optional(),
  subject: z.string().optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
  min_price: z.number().min(0).optional(),
  max_price: z.number().min(0).max(1000).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

// Stripe checkout validation
export const CheckoutSchema = z.object({
  skill_id: z.string().uuid(),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
})

// Helper: Validate and return typed data or error response
export function validateOrError<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string; details?: any } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return {
    success: false,
    error: 'Validation failed',
    details: result.error.flatten().fieldErrors,
  }
}
