export type UserRole = "admin" | "student" | "company" | "faculty"
export type ApprovalStatus = "pending" | "approved" | "rejected"
export type JobStatus = "open" | "closed" | "filled"
export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "rejected"
  | "selected"
  | "offer_accepted"
  | "offer_rejected"
export type NotificationType =
  | "job_posted"
  | "application_received"
  | "application_status"
  | "approval_status"
  | "interview_scheduled"
  | "offer_letter"
  | "system_alert"

export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  profile_picture_url: string | null
  is_active: boolean
  approval_status: ApprovalStatus
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  user_id: string
  enrollment_number: string | null
  department: string | null
  semester: number | null
  cgpa: number | null
  resume_url: string | null
  skills: string[] | null
  bio: string | null
  date_of_birth: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  created_at: string
  updated_at: string
}

export interface Company {
  id: string
  user_id: string
  company_name: string
  company_website: string | null
  company_logo_url: string | null
  industry: string | null
  company_size: string | null
  headquarters_location: string | null
  description: string | null
  contact_person_name: string | null
  contact_person_email: string | null
  contact_person_phone: string | null
  created_at: string
  updated_at: string
}

export interface Faculty {
  id: string
  user_id: string
  employee_id: string | null
  department: string | null
  designation: string | null
  specialization: string | null
  office_location: string | null
  office_phone: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  company_id: string
  job_title: string
  job_description: string
  required_skills: string[] | null
  minimum_cgpa: number | null
  salary_range: string | null
  job_location: string | null
  job_type: string | null
  status: JobStatus
  application_deadline: string | null
  posted_date: string
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  student_id: string
  job_id: string
  status: ApplicationStatus
  applied_date: string
  resume_url: string | null
  cover_letter: string | null
  created_at: string
  updated_at: string
}

export interface Interview {
  id: string
  application_id: string
  interview_date: string | null
  interview_type: string | null
  interview_location: string | null
  interviewer_name: string | null
  interviewer_email: string | null
  feedback: string | null
  rating: number | null
  status: string
  created_at: string
  updated_at: string
}

export interface OfferLetter {
  id: string
  application_id: string
  job_id: string
  student_id: string
  company_id: string
  salary: string | null
  joining_date: string | null
  offer_letter_url: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  notification_type: NotificationType
  title: string
  message: string
  related_id: string | null
  is_read: boolean
  created_at: string
  updated_at: string
}
