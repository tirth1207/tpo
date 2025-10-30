# TODO: Update Company Page to Show Jobs with Approval Status

## Tasks
- [x] Update src/lib/types/database.ts to include missing fields in jobs table: is_approved, skills_required, posted_by, is_active (instead of status)
- [x] In src/app/company/page.tsx: Import and use useAuth hook to get authenticated user
- [x] In src/app/company/page.tsx: Fetch company_id dynamically from companies table using user.id
- [x] In src/app/company/page.tsx: Update fetchRecentDrives to fetch jobs with is_approved and display approval badges instead of active/inactive
- [x] In src/app/company/page.tsx: Change "Recent Drives" title to "My Drives"
- [x] In src/app/company/page.tsx: Update the badge logic to show approval status (approved/rejected/pending) like admin page

## Followup Steps
- [x] Test the updated page to ensure jobs display with correct approval status
- [x] Verify company_id is fetched correctly from auth
