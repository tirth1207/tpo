import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const uploadSchema = z.object({
  fileType: z.enum(['resume', 'profile_pic', 'certificate', 'offer_letter']),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('fileType') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const validatedData = uploadSchema.parse({ fileType, description })

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // Validate file type based on upload type
    const allowedTypes: Record<string, string[]> = {
      resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      profile_pic: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      certificate: ['application/pdf', 'image/jpeg', 'image/png'],
      offer_letter: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }

    if (!allowedTypes[validatedData.fileType].includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type for ${validatedData.fileType}. Allowed types: ${allowedTypes[validatedData.fileType].join(', ')}` 
      }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}/${validatedData.fileType}_${timestamp}.${fileExtension}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 400 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName)

    // Update user's profile or student record based on file type
    if (validatedData.fileType === 'resume') {
      // Update student's resume URL
      const { error: updateError } = await supabase
        .from('students')
        .update({ resume_url: urlData.publicUrl })
        .eq('profile_id', user.id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update resume URL' }, { status: 400 })
      }
    } else if (validatedData.fileType === 'profile_pic') {
      // Update student's profile picture URL
      const { error: updateError } = await supabase
        .from('students')
        .update({ profile_pic_url: urlData.publicUrl })
        .eq('profile_id', user.id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update profile picture URL' }, { status: 400 })
      }
    }

    return NextResponse.json({
      url: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadType: validatedData.fileType
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }

    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get student data to fetch uploaded files
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('resume_url, profile_pic_url')
      .eq('profile_id', user.id)
      .single()

    if (studentError) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
    }

    const files = []
    
    if (student.resume_url) {
      files.push({
        type: 'resume',
        url: student.resume_url,
        name: 'Resume'
      })
    }

    if (student.profile_pic_url) {
      files.push({
        type: 'profile_pic',
        url: student.profile_pic_url,
        name: 'Profile Picture'
      })
    }

    return NextResponse.json({ files })

  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}