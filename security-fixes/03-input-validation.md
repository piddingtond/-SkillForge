# Critical Issue #3: Input Validation

## Problem
User inputs go directly to database with ZERO validation:
- SQL injection risk
- XSS attacks
- Invalid data types
- Malicious payloads

## Solution
Use `zod` for TypeScript schema validation on every input.

### Why Zod?
- TypeScript-first
- Runtime validation
- Type inference (reduces duplication)
- Clear error messages
- Composable schemas

## Implementation

### Step 1: Install Zod

```bash
cd G:\workspace\skill-finder
npm install zod
```

### Step 2: Define Validation Schemas

```typescript
// lib/validations.ts
import { z } from 'zod'

// User validation
export const UserProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  username: z.string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, dashes, and underscores')
    .optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
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
  
  file: z.instanceof(File)
    .refine(file => file.size <= 10 * 1024 * 1024, 'File must be less than 10MB')
    .refine(
      file => ['.zip', '.tar.gz', '.tgz'].some(ext => file.name.endsWith(ext)),
      'File must be .zip, .tar.gz, or .tgz'
    ),
})

// Review validation
export const ReviewSchema = z.object({
  skill_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
})

// Search validation
export const SearchQuerySchema = z.object({
  q: z.string().max(200),
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
```

### Step 3: Apply to Skill Upload Route

```typescript
// app/api/skills/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SkillUploadSchema, validateOrError } from '@/lib/validations'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  
  // Extract data
  const data = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    long_description: formData.get('long_description'),
    subject: formData.get('subject'),
    difficulty: formData.get('difficulty'),
    price: parseFloat(formData.get('price') as string),
    is_free: formData.get('is_free') === 'true',
    file: formData.get('file'),
  }

  // Validate
  const validation = validateOrError(SkillUploadSchema, data)
  
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, details: validation.details },
      { status: 400 }
    )
  }

  // Now safe to use validated data
  const validatedData = validation.data

  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('skills')
    .upload(`${validatedData.slug}/${validatedData.file.name}`, validatedData.file)

  if (uploadError) {
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
  }

  // Insert skill to database
  const { error: dbError } = await supabase.from('skills').insert({
    name: validatedData.name,
    slug: validatedData.slug,
    description: validatedData.description,
    long_description: validatedData.long_description,
    subject: validatedData.subject,
    difficulty: validatedData.difficulty,
    price: validatedData.price,
    is_free: validatedData.is_free,
    file_url: uploadData.path,
    status: 'pending', // Requires admin approval
  })

  if (dbError) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
```

### Step 4: Apply to Review Submission

```typescript
// app/api/reviews/route.ts
import { ReviewSchema, validateOrError } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Validate
  const validation = validateOrError(ReviewSchema, body)
  
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, details: validation.details },
      { status: 400 }
    )
  }

  const { skill_id, rating, comment } = validation.data

  // Check if user purchased the skill (already in RLS policy, but double-check)
  // Insert review...
}
```

### Step 5: Client-Side Validation (Forms)

```typescript
// components/SkillUploadForm.tsx
'use client'
import { useState } from 'react'
import { SkillUploadSchema } from '@/lib/validations'

export function SkillUploadForm() {
  const [errors, setErrors] = useState<any>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})

    const formData = new FormData(e.currentTarget)
    
    // Extract and validate on client side first
    const data = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      subject: formData.get('subject'),
      difficulty: formData.get('difficulty'),
      price: parseFloat(formData.get('price') as string),
      is_free: formData.get('is_free') === 'true',
      file: formData.get('file'),
    }

    const result = SkillUploadSchema.safeParse(data)
    
    if (!result.success) {
      // Show validation errors
      setErrors(result.error.flatten().fieldErrors)
      return
    }

    // Submit to API (which will validate again server-side)
    const response = await fetch('/api/skills/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      setErrors(error.details || { _form: error.error })
      return
    }

    // Success!
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      {errors.name && <p className="text-red-500">{errors.name}</p>}
      
      {/* More fields... */}
      
      <button type="submit">Upload Skill</button>
    </form>
  )
}
```

## Validation Rules Summary

### Skill Upload
- **Name:** 3-100 chars
- **Slug:** 3-100 chars, lowercase alphanumeric + dashes
- **Description:** 20-500 chars
- **Long Description:** 100-5000 chars
- **Price:** $0-1000, cents precision
- **File:** Max 10MB, .zip/.tar.gz/.tgz only
- **Subject:** Enum (Strategy, Coding, etc.)
- **Difficulty:** Enum (Beginner, Intermediate, Advanced)

### Reviews
- **Rating:** 1-5 (integer)
- **Comment:** 10-1000 chars (optional)
- **Skill ID:** Valid UUID

### User Profile
- **Username:** 3-30 chars, alphanumeric + dashes/underscores
- **Bio:** Max 500 chars
- **Website:** Valid URL

## Benefits

✅ **Prevents SQL injection** (validated types)  
✅ **Prevents XSS** (length limits + sanitized strings)  
✅ **Clear error messages** (field-specific)  
✅ **Type safety** (TypeScript inference)  
✅ **Client + Server** (validate twice for UX + security)

## Testing

```typescript
// Test validation
import { SkillUploadSchema } from '@/lib/validations'

// Valid data
const valid = SkillUploadSchema.parse({
  name: 'My Awesome Skill',
  slug: 'my-awesome-skill',
  description: 'This is a great skill for...',
  subject: 'Coding',
  difficulty: 'Intermediate',
  price: 9.99,
  is_free: false,
  file: new File([''], 'skill.zip', { type: 'application/zip' }),
})

// Invalid data (throws error)
try {
  SkillUploadSchema.parse({
    name: 'ab', // Too short
    price: -5,  // Negative
  })
} catch (e) {
  console.error(e)
}
```

## Status: 🔄 IN PROGRESS
- [x] Design validation strategy
- [x] Document schemas
- [x] Create validations.ts
- [ ] Install zod
- [ ] Apply to all routes
- [ ] Add client-side validation
- [ ] Test edge cases
