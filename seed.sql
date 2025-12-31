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

-- =============================================
-- AUDIT EVENTS (creation, approval, rejection, deletion)
-- =============================================
CREATE TABLE IF NOT EXISTS public.audit_events (
	id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
	actor_id uuid NULL,
	actor_role text NULL,
	action text NOT NULL,
	target_table text NOT NULL,
	target_id uuid NULL,
	target_role text NULL,
	details jsonb NULL,
	created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT audit_events_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_audit_target ON public.audit_events USING btree (target_table, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_events USING btree (created_at DESC);

-- Sample audit events
INSERT INTO public.audit_events (actor_id, actor_role, action, target_table, target_id, target_role, details, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'approved', 'profiles', '00000000-0000-0000-0000-000000000010', 'faculty', '{"notes":"Approved during initial setup"}', NOW() - INTERVAL '29 days'),
('00000000-0000-0000-0000-000000000001', 'admin', 'approved', 'profiles', '00000000-0000-0000-0000-000000000011', 'faculty', '{"notes":"Approved during initial setup"}', NOW() - INTERVAL '24 days');

-- =============================================
-- AUDIT TRIGGERS: automatic insertion on INSERT/UPDATE/DELETE
-- =============================================
-- Function to insert an audit event for key table operations
CREATE OR REPLACE FUNCTION public.fn_audit_events_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
	v_action text;
	v_target_id uuid;
	v_target_role text;
	v_actor_id uuid;
	v_actor_role text;
	v_skip text;
	v_actor_setting text;
	v_role_setting text;
BEGIN
	-- Read session settings set via set_audit_session RPC (if any). Use current_setting with missing_ok = true.
	v_actor_setting := current_setting('audit.actor_id', true);
	v_role_setting := current_setting('audit.actor_role', true);
	v_skip := current_setting('audit.skip', true);
	IF v_actor_setting IS NOT NULL AND v_actor_setting <> '' THEN
		v_actor_id := v_actor_setting::uuid;
	ELSE
		v_actor_id := NULL;
	END IF;
	v_actor_role := CASE WHEN v_role_setting IS NOT NULL AND v_role_setting <> '' THEN v_role_setting ELSE NULL END;
	-- If audit.skip = '1' then skip inserting by trigger (app may insert its own event)
	IF v_skip = '1' THEN
		RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
	END IF;
	IF (TG_OP = 'INSERT') THEN
		v_action := 'created';
		-- Safely extract potential target ids using JSON access to avoid referencing missing columns
		v_target_id := (
			CASE
				WHEN (row_to_json(NEW)->>'id') IS NOT NULL THEN (row_to_json(NEW)->>'id')::uuid
				WHEN (row_to_json(NEW)->>'profile_id') IS NOT NULL THEN (row_to_json(NEW)->>'profile_id')::uuid
				WHEN (row_to_json(NEW)->>'user_id') IS NOT NULL THEN (row_to_json(NEW)->>'user_id')::uuid
				ELSE NULL
			END
		);
		v_target_role := (CASE WHEN TG_TABLE_NAME = 'profiles' THEN (row_to_json(NEW)->>'role') ELSE NULL END);

		INSERT INTO public.audit_events (actor_id, actor_role, action, target_table, target_id, target_role, details)
		VALUES (v_actor_id, v_actor_role, v_action, TG_TABLE_NAME, v_target_id, v_target_role, row_to_json(NEW)::jsonb);

		RETURN NEW;

	ELSIF (TG_OP = 'DELETE') THEN
		v_action := 'deleted';
		v_target_id := (
			CASE
				WHEN (row_to_json(OLD)->>'id') IS NOT NULL THEN (row_to_json(OLD)->>'id')::uuid
				WHEN (row_to_json(OLD)->>'profile_id') IS NOT NULL THEN (row_to_json(OLD)->>'profile_id')::uuid
				WHEN (row_to_json(OLD)->>'user_id') IS NOT NULL THEN (row_to_json(OLD)->>'user_id')::uuid
				ELSE NULL
			END
		);
		v_target_role := (CASE WHEN TG_TABLE_NAME = 'profiles' THEN (row_to_json(OLD)->>'role') ELSE NULL END);

		INSERT INTO public.audit_events (actor_id, actor_role, action, target_table, target_id, target_role, details)
		VALUES (v_actor_id, v_actor_role, v_action, TG_TABLE_NAME, v_target_id, v_target_role, row_to_json(OLD)::jsonb);

		RETURN OLD;

	ELSIF (TG_OP = 'UPDATE') THEN
		-- Special-case: profile approval status changes -> record approved/rejected with approver
		IF TG_TABLE_NAME = 'profiles' THEN
			IF (row_to_json(OLD)->>'approval_status') IS DISTINCT FROM (row_to_json(NEW)->>'approval_status') THEN
				v_action := (row_to_json(NEW)->>'approval_status');
				v_target_id := NEW.id;
				v_target_role := (row_to_json(NEW)->>'role');

				INSERT INTO public.audit_events (actor_id, actor_role, action, target_table, target_id, target_role, details)
				VALUES (
					CASE WHEN (row_to_json(NEW)->>'approved_by') IS NOT NULL THEN (row_to_json(NEW)->>'approved_by')::uuid ELSE NULL END,
					NULL,
					v_action, TG_TABLE_NAME, v_target_id, v_target_role, jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
				);

				RETURN NEW;
			END IF;
		END IF;

		-- Generic update event
		v_action := 'updated';
		v_target_id := (
			CASE
				WHEN (row_to_json(NEW)->>'id') IS NOT NULL THEN (row_to_json(NEW)->>'id')::uuid
				WHEN (row_to_json(NEW)->>'profile_id') IS NOT NULL THEN (row_to_json(NEW)->>'profile_id')::uuid
				WHEN (row_to_json(NEW)->>'user_id') IS NOT NULL THEN (row_to_json(NEW)->>'user_id')::uuid
				ELSE NULL
			END
		);
		v_target_role := (CASE WHEN TG_TABLE_NAME = 'profiles' THEN (row_to_json(NEW)->>'role') ELSE NULL END);

		INSERT INTO public.audit_events (actor_id, actor_role, action, target_table, target_id, target_role, details)
		VALUES (v_actor_id, v_actor_role, v_action, TG_TABLE_NAME, v_target_id, v_target_role, jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW)));

		RETURN NEW;
	END IF;

	RETURN NULL;
END;
$$;

-- Attach triggers to tables we care about (idempotent loop)
DO $$
DECLARE
	_tbl text;
	_tables text[] := ARRAY[
		'profiles',
		'students',
		'faculty',
		'faculty_student_ranges',
		'companies',
		'jobs',
		'applications',
		'interviews',
		'offer_letters',
		'notifications',
		'analytics'
	];
BEGIN
	FOREACH _tbl IN ARRAY _tables LOOP
		-- Skip audit_events to avoid recursion
		IF _tbl <> 'audit_events' THEN
			IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = format('audit_%s_trg', _tbl)) THEN
				EXECUTE format('CREATE TRIGGER audit_%s_trg AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.fn_audit_events_trigger()', _tbl, _tbl);
			END IF;
		END IF;
	END LOOP;
END$$;

-- Helper to set audit session variables so triggers can record the actor
CREATE OR REPLACE FUNCTION public.set_audit_session(p_actor_id uuid, p_actor_role text, p_skip boolean DEFAULT false)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
	-- Use set_config with is_local = true so it only affects the current transaction
	PERFORM set_config('audit.actor_id', COALESCE(p_actor_id::text, ''), true);
	PERFORM set_config('audit.actor_role', COALESCE(p_actor_role, ''), true);
	PERFORM set_config('audit.skip', CASE WHEN p_skip THEN '1' ELSE '0' END, true);
	RETURN true;
END;
$$;

-- Set audit session and update job approval in a single transaction
CREATE OR REPLACE FUNCTION public.jobs_set_approval(
  p_job_id uuid,
  p_status text,
  p_actor_id uuid,
  p_actor_role text
) RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  _is_boolean boolean := false;
BEGIN
  -- Validate allowed statuses
  IF p_status IS NULL OR p_status NOT IN ('approved','rejected','pending') THEN
    RAISE EXCEPTION 'Invalid status for is_approved: %', p_status;
  END IF;

  -- Determine whether the column type is boolean (for backwards compatibility)
  PERFORM 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name='is_approved' AND data_type = 'boolean';
  IF FOUND THEN
    _is_boolean := true;
  END IF;

  -- Set transaction-local audit settings for the triggers
  PERFORM set_audit_session(p_actor_id, p_actor_role, false);

  -- Update the job (trigger will record actor info). Also update timestamp.
  IF _is_boolean THEN
    UPDATE public.jobs
      SET is_approved = (CASE WHEN p_status = 'approved' THEN true WHEN p_status = 'rejected' THEN false ELSE NULL END),
          updated_at = NOW()
      WHERE id = p_job_id;
  ELSE
    UPDATE public.jobs
      SET is_approved = p_status,
          updated_at = NOW()
      WHERE id = p_job_id;
  END IF;

  RETURN FOUND; -- true if a row was updated
END;
$$;

-- Set audit session and update job approval in a single transaction (boolean variant)
CREATE OR REPLACE FUNCTION public.jobs_set_approval_bool(
  p_job_id uuid,
  p_is_approved boolean,
  p_actor_id uuid,
  p_actor_role text
) RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set transaction-local audit settings for the triggers
  PERFORM set_audit_session(p_actor_id, p_actor_role, false);

  UPDATE public.jobs
    SET is_approved = p_is_approved,
        updated_at = NOW()
    WHERE id = p_job_id;

  RETURN FOUND;
END;
$$;

