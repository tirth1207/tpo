// D:\v0-tpo-portal-main\app\api\auth\register\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema - MUST match the data sent from the frontend
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['student', 'faculty', 'company'], {
    errorMap: () => ({ message: 'Invalid role selected' }),
  }),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  // Role-specific optional fields - these will be present only if the frontend sends them
  rollNumber: z.string().optional(),
  branch: z.string().optional(),
  year: z.number().optional(), // Ensure this is a number from frontend
  employeeId: z.string().optional(),
  department: z.string().optional(),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
});

// Helper function to insert role-specific data into Supabase
async function insertRoleSpecificData(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  validatedData: z.infer<typeof registerSchema>
) {
  if (validatedData.role === 'student') {
    // Validate required fields for students
    if (!validatedData.rollNumber || !validatedData.branch) {
      throw new Error('Roll number and branch are required for students');
    }
    
    const { error: studentError } = await supabase.from('students').insert({
      profile_id: userId,
      roll_number: validatedData.rollNumber,
      branch: validatedData.branch,
      year: validatedData.year || 1,
      cgpa: 0.0,
      phone: validatedData.phone || '',
      address: '',
      skills: [],
      certifications: [],
    });
    if (studentError) {
      throw new Error(`Student record creation failed: ${studentError.message}`);
    }
  } else if (validatedData.role === 'faculty') {
    // Validate required fields for faculty
    if (!validatedData.employeeId || !validatedData.department) {
      throw new Error('Employee ID and department are required for faculty');
    }
    
    const { error: facultyError } = await supabase.from('faculty').insert({
      profile_id: userId,
      employee_id: validatedData.employeeId,
      department: validatedData.department,
      designation: 'Professor',
      phone: validatedData.phone || '',
    });
    if (facultyError) {
      throw new Error(`Faculty record creation failed: ${facultyError.message}`);
    }
  } else if (validatedData.role === 'company') {
    // Validate required fields for companies
    if (!validatedData.companyName || !validatedData.industry || !validatedData.contactPerson) {
      throw new Error('Company name, industry, and contact person are required for companies');
    }
    
    const { error: companyError } = await supabase.from('companies').insert({
      profile_id: userId,
      company_name: validatedData.companyName,
      industry: validatedData.industry,
      contact_person: validatedData.contactPerson,
      phone: validatedData.phone || '',
    });
    if (companyError) {
      throw new Error(`Company record creation failed: ${companyError.message}`);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const supabase = createClient();
    const adminSupabase = createAdminClient();

    // 1. Create user in Supabase Auth with email verification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${request.headers.get('origin')}/auth/callback`,
      },
    });

    if (authError) {
      console.error('Supabase Auth error:', authError.message);
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 400 }
      );
    }

    const user = authData.user;
    if (!user) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 400 });
    }

    // 2. Insert into 'profiles' table using admin client
    const { error: profileError } = await adminSupabase.from('profiles').insert({
      id: user.id,
      email: validatedData.email,
      role: validatedData.role,
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      is_approved: false, // All new users require approval
    });

    if (profileError) {
      console.error(`Profile creation failed for user ${user.id}: ${profileError.message}`);
      // Cleanup auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        { error: 'Profile creation failed', details: profileError.message },
        { status: 400 }
      );
    }

    // 3. Insert into role-specific tables
    try {
      await insertRoleSpecificData(adminSupabase, user.id, validatedData);
    } catch (roleSpecificError: any) {
      console.error(`Role-specific record creation failed for user ${user.id}: ${roleSpecificError.message}`);
      // Cleanup auth user AND profile if role-specific record creation fails
      await adminSupabase.auth.admin.deleteUser(user.id);
      await adminSupabase.from('profiles').delete().eq('id', user.id);
      return NextResponse.json(
        { error: 'Failed to create role-specific record', details: roleSpecificError.message },
        { status: 400 }
      );
    }

    // 4. Create notification for admin about new registration
    await adminSupabase.from('notifications').insert({
      user_id: user.id, // This will be updated to admin user ID when we have one
      title: 'New User Registration',
      message: `New ${validatedData.role} registered: ${validatedData.firstName} ${validatedData.lastName} (${validatedData.email})`,
      type: 'info',
    });

    // Success response
    return NextResponse.json({
      message: 'Registration successful. Please check your email for verification.',
      user: {
        id: user.id,
        email: user.email,
        role: validatedData.role,
        emailConfirmed: user.email_confirmed_at !== null,
      },
      requiresEmailVerification: !user.email_confirmed_at,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}