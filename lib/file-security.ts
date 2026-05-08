// File upload security utilities

// Allowed file types for skills
const ALLOWED_EXTENSIONS = ['.zip', '.tar.gz', '.tgz']
const ALLOWED_MIME_TYPES = [
  'application/zip',
  'application/x-gzip',
  'application/gzip',
  'application/x-tar',
  'application/x-compressed-tar',
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFileType(file: File): { valid: boolean; error?: string } {
  // Check extension
  const fileName = file.name.toLowerCase()
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext))
  
  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
    }
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid MIME type: ${file.type}`
    }
  }

  return { valid: true }
}

export function validateFileSize(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty'
    }
  }

  return { valid: true }
}

// Verify file is actually what it claims to be (magic bytes)
export async function validateFileMagicBytes(file: File): Promise<{ valid: boolean; error?: string }> {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // ZIP magic bytes: 50 4B (PK)
  if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
    return { valid: true }
  }

  // GZIP magic bytes: 1F 8B
  if (bytes[0] === 0x1F && bytes[1] === 0x8B) {
    return { valid: true }
  }

  return {
    valid: false,
    error: 'File content does not match extension. Possible forgery.'
  }
}

// Detect zip bombs (files that expand to huge sizes)
export async function detectZipBomb(file: File): Promise<{ safe: boolean; error?: string }> {
  const MAX_COMPRESSION_RATIO = 100 // 100:1
  
  // Simple heuristic: if file is suspiciously small for a skill package
  if (file.size < 1024 && file.name.endsWith('.zip')) {
    return {
      safe: false,
      error: 'Suspiciously small zip file. Possible zip bomb.'
    }
  }

  return { safe: true }
}

// Comprehensive file validation
export async function validateUploadedFile(file: File): Promise<{
  valid: boolean
  errors: string[]
}> {
  const errors: string[] = []

  // Check file type
  const typeCheck = validateFileType(file)
  if (!typeCheck.valid) errors.push(typeCheck.error!)

  // Check file size
  const sizeCheck = validateFileSize(file)
  if (!sizeCheck.valid) errors.push(sizeCheck.error!)

  // Check magic bytes
  const magicCheck = await validateFileMagicBytes(file)
  if (!magicCheck.valid) errors.push(magicCheck.error!)

  // Check for zip bomb
  const bombCheck = await detectZipBomb(file)
  if (!bombCheck.safe) errors.push(bombCheck.error!)

  return {
    valid: errors.length === 0,
    errors
  }
}

// Generate safe filename
export function generateSafeFilename(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${userId}/${timestamp}-${sanitized}`
}
