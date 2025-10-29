export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'student' | 'faculty' | 'admin' | 'company'
          first_name: string
          last_name: string
          created_at: string
          updated_at: string
          is_approved: boolean
          approved_by?: string
          approved_at?: string
        }
        Insert: {
          id: string
          email: string
          role: 'student' | 'faculty' | 'admin' | 'company'
          first_name: string
          last_name: string
          created_at?: string
          updated_at?: string
          is_approved?: boolean
          approved_by?: string
          approved_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'student' | 'faculty' | 'admin' | 'company'
          first_name?: string
          last_name?: string
          created_at?: string
          updated_at?: string
          is_approved?: boolean
          approved_by?: string
          approved_at?: string
        }
      }
      students: {
        Row: {
          id: string
          profile_id: string
          roll_number: string
          branch: string
          year: number
          cgpa: number
          phone: string
          address: string
          profile_pic_url?: string
          resume_url?: string
          skills: string[]
          certifications: string[]
          training_experience?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          roll_number: string
          branch: string
          year: number
          cgpa: number
          phone: string
          address: string
          profile_pic_url?: string
          resume_url?: string
          skills?: string[]
          certifications?: string[]
          training_experience?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          roll_number?: string
          branch?: string
          year?: number
          cgpa?: number
          phone?: string
          address?: string
          profile_pic_url?: string
          resume_url?: string
          skills?: string[]
          certifications?: string[]
          training_experience?: string
          created_at?: string
          updated_at?: string
        }
      }
      faculty: {
        Row: {
          id: string
          profile_id: string
          employee_id: string
          department: string
          designation: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          employee_id: string
          department: string
          designation: string
          phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          employee_id?: string
          department?: string
          designation?: string
          phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          profile_id: string
          company_name: string
          industry: string
          contact_person: string
          phone: string
          website?: string
          description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          company_name: string
          industry: string
          contact_person: string
          phone: string
          website?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          company_name?: string
          industry?: string
          contact_person?: string
          phone?: string
          website?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          requirements: string[]
          location: string
          salary_min: number
          salary_max: number
          job_type: 'full-time' | 'part-time' | 'internship'
          status: 'active' | 'inactive' | 'closed'
          application_deadline: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          requirements: string[]
          location: string
          salary_min: number
          salary_max: number
          job_type: 'full-time' | 'part-time' | 'internship'
          status?: 'active' | 'inactive' | 'closed'
          application_deadline: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string
          requirements?: string[]
          location?: string
          salary_min?: number
          salary_max?: number
          job_type?: 'full-time' | 'part-time' | 'internship'
          status?: 'active' | 'inactive' | 'closed'
          application_deadline?: string
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          student_id: string
          job_id: string
          status: 'applied' | 'under_review' | 'shortlisted' | 'rejected' | 'selected'
          applied_at: string
          reviewed_at?: string
          reviewed_by?: string
          notes?: string
        }
        Insert: {
          id?: string
          student_id: string
          job_id: string
          status?: 'applied' | 'under_review' | 'shortlisted' | 'rejected' | 'selected'
          applied_at?: string
          reviewed_at?: string
          reviewed_by?: string
          notes?: string
        }
        Update: {
          id?: string
          student_id?: string
          job_id?: string
          status?: 'applied' | 'under_review' | 'shortlisted' | 'rejected' | 'selected'
          applied_at?: string
          reviewed_at?: string
          reviewed_by?: string
          notes?: string
        }
      }
      offer_letters: {
        Row: {
          id: string
          application_id: string
          file_url: string
          file_name: string
          file_size: number
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          id?: string
          application_id: string
          file_url: string
          file_name: string
          file_size: number
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          id?: string
          application_id?: string
          file_url?: string
          file_name?: string
          file_size?: number
          uploaded_at?: string
          uploaded_by?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
