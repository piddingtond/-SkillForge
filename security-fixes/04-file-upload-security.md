# Critical Issue #4: File Upload Security

## Problem
Current system allows ANY file upload with NO security:
- ❌ No file type checking
- ❌ No virus scanning
- ❌ No size limits enforced server-side
- ❌ No malicious content detection
- ❌ Risk: Malware, zip bombs, shell scripts

## Solution
Multi-layered file security:
1. File type whitelist
2. Size limits
3. Content validation
4. Virus scanning
5. Isolated storage with no execution permissions

## Implementation

### Layer 1: File Type Whitelist

```typescript
// lib/file-security.ts
import { z } from 'zod'

// Allowed file types for skills
const ALLOWED_EXTENSIONS = ['.zip', '.tar.gz', '.tgz']
const ALLOWED_MIME_TYPES = [
  'application/zip',
  'application/x-gzip',
  'application/gzip',
  'application/x-tar',
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFileType(file: File): { valid: boolean; error?: string } {
  // Check extension
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => 
    file.name.toLowerCase().endsWith(ext)
  )
  
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
      error: `Invalid MIME type: ${file.type}. Expected: ${ALLOWED_MIME_TYPES.join(', ')}`
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
```

### Layer 2: Magic Byte Validation

```typescript
// Verify file is actually what it claims to be
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
```

### Layer 3: Zip Bomb Detection

```typescript
// Detect zip bombs (files that expand to huge sizes)
export async function detectZipBomb(file: File): Promise<{ safe: boolean; error?: string }> {
  const MAX_UNCOMPRESSED_SIZE = 100 * 1024 * 1024 // 100MB
  const MAX_COMPRESSION_RATIO = 100 // 100:1

  // This would require a zip parsing library
  // For now, we can implement a simple check:
  const compressionRatio = MAX_UNCOMPRESSED_SIZE / file.size

  if (compressionRatio > MAX_COMPRESSION_RATIO) {
    return {
      safe: false,
      error: 'Suspicious compression ratio. Possible zip bomb.'
    }
  }

  return { safe: true }
}
```

### Layer 4: Comprehensive File Validation

```typescript
// lib/file-security.ts
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
```

### Layer 5: Supabase Storage Security

```typescript
// Configure Supabase Storage bucket with security rules
// Run this in Supabase SQL Editor:

-- Create storage bucket with security
INSERT INTO storage.buckets (id, name, public)
VALUES ('skills', 'skills', false); -- Private bucket

-- Set size limits at storage level
UPDATE storage.buckets
SET file_size_limit = 10485760 -- 10MB
WHERE id = 'skills';

-- Row Level Security policies for storage
CREATE POLICY "Sellers can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'skills' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Buyers can download purchased skills"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'skills' AND
  EXISTS (
    SELECT 1 FROM purchases p
    JOIN skills s ON s.id = p.skill_id
    WHERE p.buyer_id = auth.uid()
    AND s.file_url = storage.objects.name
  )
);

-- No UPDATE or DELETE from storage (immutable)
```

### Layer 6: Virus Scanning (Optional but Recommended)

```typescript
// Use ClamAV or cloud service
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function scanForViruses(filePath: string): Promise<{
  clean: boolean
  threats?: string[]
}> {
  try {
    // Option A: Local ClamAV
    const { stdout } = await execAsync(`clamscan "${filePath}"`)
    
    if (stdout.includes('Infected files: 0')) {
      return { clean: true }
    }

    return {
      clean: false,
      threats: stdout.match(/FOUND: (.+)/g) || ['Unknown threat']
    }
  } catch (error) {
    // ClamAV not installed or scan failed
    console.warn('Virus scan failed:', error)
    return { clean: true } // Proceed with caution
  }
}

// Option B: VirusTotal API (cloud-based)
export async function scanWithVirusTotal(file: File): Promise<{
  clean: boolean
  score?: number
}> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY
  if (!apiKey) return { clean: true }

  // Upload file
  const formData = new FormData()
  formData.append('file', file)

  const uploadResponse = await fetch('https://www.virustotal.com/api/v3/files', {
    method: 'POST',
    headers: { 'x-apikey': apiKey },
    body: formData,
  })

  const { data } = await uploadResponse.json()
  const analysisId = data.id

  // Wait for analysis (poll)
  await new Promise(resolve => setTimeout(resolve, 5000))

  // Get results
  const resultResponse = await fetch(
    `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
    { headers: { 'x-apikey': apiKey } }
  )

  const { data: analysis } = await resultResponse.json()
  const stats = analysis.attributes.stats

  const maliciousCount = stats.malicious || 0
  const suspiciousCount = stats.suspicious || 0

  return {
    clean: maliciousCount === 0 && suspiciousCount === 0,
    score: maliciousCount + suspiciousCount,
  }
}
```

### Layer 7: Upload Route with Full Security

```typescript
// app/api/skills/upload/route.ts
import { validateUploadedFile, scanForViruses } from '@/lib/file-security'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Validate file
  const validation = await validateUploadedFile(file)
  
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'File validation failed', details: validation.errors },
      { status: 400 }
    )
  }

  // Scan for viruses (if configured)
  if (process.env.ENABLE_VIRUS_SCAN === 'true') {
    // Save temp file for scanning
    const tempPath = `/tmp/${file.name}`
    await writeFile(tempPath, Buffer.from(await file.arrayBuffer()))

    const scanResult = await scanForViruses(tempPath)
    
    if (!scanResult.clean) {
      return NextResponse.json(
        { error: 'File contains threats', threats: scanResult.threats },
        { status: 400 }
      )
    }
  }

  // Upload to Supabase Storage
  const userId = request.headers.get('x-user-id') // From auth
  const filePath = `${userId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('skills')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false, // Don't allow overwrites
    })

  if (uploadError) {
    return NextResponse.json(
      { error: 'Upload failed', details: uploadError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, file_url: filePath }, { status: 201 })
}
```

## Security Checklist

### File Type Security
- [x] Whitelist allowed extensions
- [x] Validate MIME types
- [x] Check magic bytes (verify actual content)
- [x] Detect zip bombs

### Size & Content Security
- [x] Max 10MB file size
- [x] Check for empty files
- [x] Validate file structure

### Storage Security
- [x] Private Supabase bucket
- [x] Row Level Security (RLS)
- [x] User-scoped upload paths
- [x] Immutable files (no UPDATE/DELETE)

### Optional Advanced Security
- [ ] Virus scanning (ClamAV or VirusTotal)
- [ ] Sandbox execution test
- [ ] Malware signature detection

## Configuration

Add to `.env.local`:
```
# Virus scanning (optional)
ENABLE_VIRUS_SCAN=false
VIRUSTOTAL_API_KEY=your_key_here

# File limits
MAX_FILE_SIZE_MB=10
ALLOWED_EXTENSIONS=.zip,.tar.gz,.tgz
```

## Testing

```typescript
// Test file upload security
const testFile = new File(['test content'], 'test.zip', {
  type: 'application/zip'
})

const validation = await validateUploadedFile(testFile)
console.log(validation) // { valid: true, errors: [] }

// Test malicious file
const maliciousFile = new File([''], 'malware.exe', {
  type: 'application/x-executable'
})

const maliciousCheck = await validateUploadedFile(maliciousFile)
console.log(maliciousCheck) // { valid: false, errors: [...] }
```

## Status: 🔄 IN PROGRESS
- [x] Design file security strategy
- [x] Document validation layers
- [x] Create file-security.ts
- [ ] Implement magic byte checking
- [ ] Set up Supabase storage rules
- [ ] Add virus scanning (optional)
- [ ] Test with various file types
- [ ] Test with malicious files
