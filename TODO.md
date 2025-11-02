# Student Pages Database Integration Plan

## Current Status
- Student pages are using hardcoded data instead of fetching from database
- API routes have inconsistent foreign key references (profile_id vs user_id)
- Missing API routes for dashboard stats and offers

## Tasks
1. **Fix API route foreign key references**
   - [x] Update `/api/students/applications/route.ts` to use `user_id` instead of `profile_id`

2. **Create API route for student dashboard stats**
   - [x] Create `/api/students/dashboard/route.ts` to fetch applications count, interviews count, offers count

3. **Create API route for student offers**
   - [x] Create `/api/students/offers/route.ts` to fetch offer letters with job and company details

4. **Update dashboard page**
   - [x] Replace hardcoded stats with API calls
   - [x] Replace hardcoded recent applications with real data
   - [x] Add loading states and error handling

5. **Update applications table component**
   - [x] Fetch real applications data from API
   - [x] Handle loading and error states
   - [x] Update data structure to match API response

6. **Update offer letters component**
   - [x] Fetch real offers data from API
   - [x] Handle loading and error states
   - [x] Update data structure to match API response

7. **Add proper error handling and loading states**
   - [x] Add loading skeletons to all components
   - [x] Implement error boundaries
   - [x] Add retry mechanisms for failed requests

## Testing
- [ ] Test all API endpoints with real data
- [ ] Verify data relationships and joins work correctly
- [ ] Test loading states and error handling
- [ ] Verify authentication and authorization

## Progress
- [x] Started implementation
- [x] Fixed API foreign key references
- [x] Created dashboard API route
- [x] Created offers API route
- [x] Updated dashboard page with real data
- [x] Updated applications table with real data
- [x] Updated offer letters with real data
- [x] Added loading states and error handling
