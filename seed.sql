-- =============================================
-- SEED PROFILES (Auth users)
-- =============================================
INSERT INTO public.profiles (id, email, role, full_name, phone, is_active, email_verified) VALUES
-- Admin
('00000000-0000-0000-0000-000000000001', 'admin@rcti.edu', 'admin', 'System Administrator', '+91-9876543210', true, true),

-- Faculty
('00000000-0000-0000-0000-000000000010', 'faculty1@rcti.edu', 'faculty', 'Dr. Rajesh Kumar', '+91-9876543211', true, true),
('00000000-0000-0000-0000-000000000011', 'faculty2@rcti.edu', 'faculty', 'Prof. Meena Sharma', '+91-9876543212', true, true),

-- Mentors
('00000000-0000-0000-0000-000000000020', 'mentor1@rcti.edu', 'mentor', 'Amit Patel', '+91-9876543213', true, true),
('00000000-0000-0000-0000-000000000021', 'mentor2@rcti.edu', 'mentor', 'Priya Singh', '+91-9876543214', true, true),
('00000000-0000-0000-0000-000000000022', 'mentor3@rcti.edu', 'mentor', 'Vikram Desai', '+91-9876543215', true, true),

-- Students
('00000000-0000-0000-0000-000000000100', 'student1@rcti.edu', 'student', 'Rahul Verma', '+91-9876543220', true, true),
('00000000-0000-0000-0000-000000000101', 'student2@rcti.edu', 'student', 'Priyanka Mehta', '+91-9876543221', true, true),
('00000000-0000-0000-0000-000000000102', 'student3@rcti.edu', 'student', 'Arjun Reddy', '+91-9876543222', true, true),
('00000000-0000-0000-0000-000000000103', 'student4@rcti.edu', 'student', 'Sneha Iyer', '+91-9876543223', true, true),
('00000000-0000-0000-0000-000000000104', 'student5@rcti.edu', 'student', 'Karthik Nair', '+91-9876543224', true, true),
('00000000-0000-0000-0000-000000000105', 'student6@rcti.edu', 'student', 'Aisha Khan', '+91-9876543225', true, true),
('00000000-0000-0000-0000-000000000106', 'student7@rcti.edu', 'student', 'Rohan Malhotra', '+91-9876543226', true, true),
('00000000-0000-0000-0000-000000000107', 'student8@rcti.edu', 'student', 'Divya Agarwal', '+91-9876543227', true, true),

-- Companies
('00000000-0000-0000-0000-000000000200', 'hr@techcorp.com', 'company', 'TechCorp HR', '+91-9876543230', true, true),
('00000000-0000-0000-0000-000000000201', 'recruitment@innovate.io', 'company', 'Innovate Solutions', '+91-9876543231', true, true),
('00000000-0000-0000-0000-000000000202', 'careers@datatech.com', 'company', 'DataTech Analytics', '+91-9876543232', true, true),
('00000000-0000-0000-0000-000000000203', 'jobs@cloudnine.com', 'company', 'CloudNine Systems', '+91-9876543233', true, true);


-- =============================================
-- FACULTY
-- =============================================
INSERT INTO public.faculty (user_id, employee_id, department, designation, is_approved, approved_by, approved_at) VALUES
('00000000-0000-0000-0000-000000000010', 'FAC001', 'Computer Science', 'Professor & HOD', true, '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days'),
('00000000-0000-0000-0000-000000000011', 'FAC002', 'Electronics', 'Associate Professor', true, '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '25 days');


-- =============================================
-- MENTORS
-- =============================================
INSERT INTO public.mentors (user_id, expertise, department, assigned_faculty_id) VALUES
('00000000-0000-0000-0000-000000000020', 'Web Development', 'Computer Science', '00000000-0000-0000-0000-000000000010'),
('00000000-0000-0000-0000-000000000021', 'Data Science', 'Computer Science', '00000000-0000-0000-0000-000000000010'),
('00000000-0000-0000-0000-000000000022', 'Cloud & DevOps', 'Electronics', '00000000-0000-0000-0000-000000000011');


-- =============================================
-- STUDENTS
-- =============================================
INSERT INTO public.students (user_id, student_id, department, batch_year, current_cgpa, tenth_percentage, twelfth_percentage, active_backlogs, skills, linkedin_url, github_url, mentor_id, is_approved, approved_by, approved_at) VALUES
('00000000-0000-0000-0000-000000000100', 'RCTI2021001', 'Computer Science', 2021, 8.5, 92, 88.5, 0, ARRAY['React','Node.js','Python','SQL','AWS'], 'https://linkedin.com/in/rahulverma','https://github.com/rahulverma','00000000-0000-0000-0000-000000000020', true, '00000000-0000-0000-0000-000000000010', NOW() - INTERVAL '15 days'),
('00000000-0000-0000-0000-000000000101', 'RCTI2021002', 'Computer Science', 2021, 9.2, 95.5, 91, 0, ARRAY['Java','Spring Boot','Angular','Docker','Kubernetes'], 'https://linkedin.com/in/priyankamehta','https://github.com/priyankam','00000000-0000-0000-0000-000000000020', true, '00000000-0000-0000-0000-000000000010', NOW() - INTERVAL '15 days'),
('00000000-0000-0000-0000-000000000106', 'RCTI2021007', 'Computer Science', 2021, 7.5, 80, 78.5, 1, ARRAY['HTML','CSS','JavaScript','React','MySQL'], 'https://linkedin.com/in/rohanmalhotra','https://github.com/rohanm', NULL, false, NULL, NULL);


-- =============================================
-- COMPANIES
-- =============================================
INSERT INTO public.companies (user_id, company_name, industry, website, location, company_size, description, is_approved, approved_by, approved_at) VALUES
('00000000-0000-0000-0000-000000000200', 'TechCorp India Pvt. Ltd.', 'Information Technology', 'https://techcorp.com','Bangalore','1000-5000','Leading IT services and consulting company.', true, '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days'),
('00000000-0000-0000-0000-000000000201', 'Innovate Solutions', 'Software', 'https://innovate.io','Mumbai','200-500','Innovative software solutions.', true, '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '18 days'),
('00000000-0000-0000-0000-000000000202', 'DataTech Analytics', 'Analytics', 'https://datatech.com','Delhi','500-1000','Data analytics and AI solutions.', false, NULL, NULL),
('00000000-0000-0000-0000-000000000203', 'CloudNine Systems', 'Cloud Services', 'https://cloudnine.com','Hyderabad','100-200','Cloud infrastructure and DevOps solutions company.', true, '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days');


-- =============================================
-- JOBS
-- =============================================
INSERT INTO public.jobs (company_id, title, description, requirements, skills_required, salary_min, salary_max, job_type, location, posted_by, is_active) VALUES
((SELECT id FROM public.companies WHERE company_name='TechCorp India Pvt. Ltd.'),'Full Stack Developer','Build scalable web applications', ARRAY['React','Node.js','PostgreSQL','AWS','Docker'], ARRAY['React','Node.js'], 600000,800000,'Full-time','Bangalore','00000000-0000-0000-0000-000000000200', true),
((SELECT id FROM public.companies WHERE company_name='Innovate Solutions'),'Data Analyst','Analyze datasets and provide insights', ARRAY['Python','SQL','Tableau'], ARRAY['Python','SQL'], 400000,600000,'Full-time','Mumbai','00000000-0000-0000-0000-000000000201', true);


-- =============================================
-- APPLICATIONS
-- =============================================
INSERT INTO public.applications (job_id, student_id, status, applied_at, reviewed_by) VALUES
((SELECT id FROM public.jobs WHERE title='Full Stack Developer' LIMIT 1), (SELECT id FROM public.students WHERE student_id='RCTI2021001'), 'shortlisted', NOW() - INTERVAL '5 days', '00000000-0000-0000-0000-000000000020'),
((SELECT id FROM public.jobs WHERE title='Data Analyst' LIMIT 1), (SELECT id FROM public.students WHERE student_id='RCTI2021002'), 'applied', NOW() - INTERVAL '3 days', NULL);


-- =============================================
-- INTERVIEWS
-- =============================================
INSERT INTO public.interviews (application_id, interview_date, mode, interviewer_id, status, feedback) VALUES
((SELECT id FROM public.applications WHERE status='shortlisted' LIMIT 1), NOW() + INTERVAL '2 days', 'Online', '00000000-0000-0000-0000-000000000020', 'scheduled', NULL),
((SELECT id FROM public.applications WHERE status='applied' LIMIT 1), NOW() + INTERVAL '5 days', 'Offline', '00000000-0000-0000-0000-000000000021', 'pending', NULL);


-- =============================================
-- NOTIFICATIONS
-- =============================================
INSERT INTO public.notifications (user_id, message, is_read, created_at) VALUES
('00000000-0000-0000-0000-000000000100', 'Your application for Full Stack Developer has been shortlisted.', false, NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000101', 'Your application for Data Analyst is under review.', false, NOW() - INTERVAL '2 days'),
('00000000-0000-0000-0000-000000000010', 'You have a new mentorship request from Rahul Verma.', false, NOW() - INTERVAL '3 days');


-- =============================================
-- ANALYTICS (sample)
-- =============================================
INSERT INTO public.analytics (user_id, action, metadata, created_at) VALUES
('00000000-0000-0000-0000-000000000100', 'login', '{"ip":"103.21.45.12"}', NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000101', 'job_applied', '{"job_id":"1"}', NOW() - INTERVAL '2 days');


-- =============================================
-- ADMIN LOGS
-- =============================================
INSERT INTO public.admin_logs (admin_id, action, target_table, target_id, old_values, new_values, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'approved_faculty', 'faculty', (SELECT id FROM public.faculty WHERE employee_id='FAC002'), NULL, '{"is_approved":true}', NOW()),
('00000000-0000-0000-0000-000000000001', 'approved_company', 'companies', (SELECT id FROM public.companies WHERE company_name='DataTech Analytics'), NULL, '{"is_approved":true}', NOW());
