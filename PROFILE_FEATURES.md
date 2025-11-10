# Profile Features - Frontend Implementation Guide

## Backend Profile Capabilities

### User Entity Fields (from backend)
- `user_id` - UUID
- `mun_email` - Email address
- `first_name` - First name
- `last_name` - Last name (optional)
- `phone_number` - Phone number (optional)
- `profile_picture_url` - Profile picture URL (optional)
- `is_email_verified` - Email verification status
- `created_at` - Account creation date
- `last_login` - Last login timestamp
- `is_active` - Account active status

### UserProfile Entity Fields (from backend)
- `profile_id` - UUID
- `user_id` - Foreign key to User
- `bio` - Biography/About section (text)
- `rating` - User rating (0.00 to 5.00)
- `total_ratings` - Number of ratings received
- `location` - Location field (optional)
- `study_program` - Study program (optional)
- `department` - Department (optional)
- `updated_at` - Last profile update timestamp

### Available Backend Endpoints

#### Current User Profile
- `GET /api/users/me` - Get current user info
- `GET /api/users/me/profile` - Get current user profile
- `PATCH /api/users/me` - Update user (first_name, last_name, phone_number, profile_picture_url)
- `PATCH /api/users/me/profile` - Update profile (bio, rating, total_ratings, location, study_program, department)

#### Other Users' Profiles
- `GET /api/users/:id` - Get any user by ID
- `GET /api/users/:id/profile` - Get any user's profile by ID

---

## Current Frontend Implementation

### ✅ Currently Implemented
- Basic profile viewing (own profile)
- Edit mode toggle
- Update bio
- Update phone number
- Update campus (custom field, not in backend)
- Update year (custom field, not in backend)
- Update program (custom field, not in backend)
- Logout functionality

### ❌ Missing Features

#### User Fields Not Used
1. **Last Name** - Backend has `last_name`, frontend only uses `first_name`
2. **Profile Picture** - Backend supports `profile_picture_url`, not implemented
3. **Email Verification Status** - Backend has `is_email_verified`, not shown
4. **Account Creation Date** - Backend has `created_at`, not displayed
5. **Last Login** - Backend has `last_login`, not displayed

#### Profile Fields Not Used
1. **Location** - Backend has `location` field, not in frontend
2. **Study Program** - Backend has `study_program`, frontend uses custom `program`
3. **Department** - Backend has `department`, not implemented
4. **Rating System** - Backend has `rating` and `total_ratings`, not implemented
5. **Profile Updated Date** - Backend has `updated_at`, not displayed

#### Missing Functionality
1. **View Other Users' Profiles** - Backend supports it, frontend doesn't
2. **Profile Picture Upload** - No image upload functionality
3. **Profile Picture Display** - No avatar/profile picture display
4. **Rating Display** - No rating stars or rating count
5. **Profile Statistics** - No stats section

---

## Recommended Frontend Profile Features

### Priority 1: Complete Current Profile Page

#### 1. Profile Picture Support
**Backend Field:** `profile_picture_url`

**UI Components Needed:**
- Profile picture display (avatar)
- Upload/change profile picture button
- Image preview before upload
- Default avatar when no picture
- Image cropping/resizing tool

**Implementation:**
```javascript
// In ProfilePage.jsx
- Add profile picture display section
- Add image upload input
- Handle image upload (need backend endpoint or use external service)
- Update profile_picture_url via PATCH /api/users/me
```

**Backend Endpoint:** `PATCH /api/users/me` with `profile_picture_url`

#### 2. Last Name Field
**Backend Field:** `last_name`

**UI Components Needed:**
- Add last name input field in edit form
- Display full name (first_name + last_name)
- Update via `PATCH /api/users/me`

**Implementation:**
- Add `last_name` to editForm state
- Add input field in Contact Information section
- Update user with both first_name and last_name

#### 3. Location Field
**Backend Field:** `location` (in profile)

**UI Components Needed:**
- Location input field
- Display location in profile view
- Update via `PATCH /api/users/me/profile`

**Implementation:**
- Add `location` to editForm
- Add to Academic Information or new section

#### 4. Study Program & Department
**Backend Fields:** `study_program`, `department`

**UI Components Needed:**
- Study Program input (replace custom `program` field)
- Department input field
- Display both in profile

**Implementation:**
- Map frontend `program` to backend `study_program`
- Add `department` field
- Update profile with both fields

#### 5. Account Information Section
**Backend Fields:** `created_at`, `last_login`, `is_email_verified`

**UI Components Needed:**
- Account creation date display
- Last login timestamp
- Email verification badge/indicator
- Member since date

**Implementation:**
- New "Account Information" section
- Format dates nicely
- Show verification status with badge

### Priority 2: Rating System

#### 6. User Rating Display
**Backend Fields:** `rating`, `total_ratings`

**UI Components Needed:**
- Star rating display (e.g., ⭐⭐⭐⭐☆ 4.5)
- Total ratings count (e.g., "Based on 12 reviews")
- Rating breakdown (if available)
- Visual rating component

**Implementation:**
```javascript
// Display rating
<div className="flex items-center">
  <StarRating rating={profile.rating} />
  <span className="ml-2">
    {profile.rating} ({profile.total_ratings} reviews)
  </span>
</div>
```

**Note:** Rating is read-only for users (typically set by other users' reviews)

### Priority 3: View Other Users' Profiles

#### 7. Public Profile View
**Backend Endpoints:** `GET /api/users/:id`, `GET /api/users/:id/profile`

**UI Components Needed:**
- Public profile page route (`/users/:id`)
- Profile view for other users (read-only)
- Contact user button
- View user's listings link
- Share profile button

**Implementation:**
```javascript
// New component: PublicProfilePage.jsx
- Fetch user data: GET /api/users/:id
- Fetch profile: GET /api/users/:id/profile
- Display public information only
- Hide sensitive data (email, phone if private)
- Show contact button
```

**Features:**
- View any user's profile by ID
- Show public information
- Link to user's listings
- Contact seller functionality

### Priority 4: Enhanced Profile Features

#### 8. Profile Statistics Section
**Data Sources:** User listings, ratings, activity

**UI Components Needed:**
- Total listings count
- Active listings count
- Sold items count
- Response rate (if messaging exists)
- Account age

**Implementation:**
- Fetch user's listings: `GET /api/me/listings`
- Calculate statistics
- Display in dashboard-style cards

#### 9. Profile Completion Indicator
**UI Components Needed:**
- Progress bar showing profile completion
- Checklist of missing fields
- Encouragement to complete profile

**Fields to Check:**
- Profile picture
- Bio
- Phone number
- Location
- Study program
- Department

**Implementation:**
- Calculate completion percentage
- Show progress bar
- List missing fields

#### 10. Profile Activity/History
**UI Components Needed:**
- Recent listings
- Recent activity
- Profile update history

**Implementation:**
- Show user's recent listings
- Display when profile was last updated
- Show account creation date

### Priority 5: Profile Settings & Preferences

#### 11. Privacy Settings
**UI Components Needed:**
- Toggle phone number visibility
- Toggle email visibility
- Profile visibility settings

**Note:** Backend doesn't have privacy fields yet, but UI can be prepared

#### 12. Profile Picture Management
**UI Components Needed:**
- Upload new picture
- Remove current picture
- Crop/resize image
- Preview before saving

**Implementation:**
- Image upload component
- Image cropping library (react-image-crop)
- Upload to backend or external service
- Update `profile_picture_url`

#### 13. Profile Export/Download
**UI Components Needed:**
- Download profile as PDF
- Export profile data as JSON

**Implementation:**
- Generate PDF from profile data
- Export user data (GDPR compliance)

---

## Implementation Checklist

### Phase 1: Complete Basic Profile
- [ ] Add profile picture upload/display
- [ ] Add last name field
- [ ] Add location field
- [ ] Map study_program and department correctly
- [ ] Add account information section (created_at, last_login, is_email_verified)

### Phase 2: Rating System
- [ ] Create star rating component
- [ ] Display rating and total_ratings
- [ ] Add rating section to profile

### Phase 3: Public Profiles
- [ ] Create PublicProfilePage component
- [ ] Add route `/users/:id`
- [ ] Fetch and display other users' profiles
- [ ] Add contact user functionality
- [ ] Link to user's listings

### Phase 4: Enhanced Features
- [ ] Add profile statistics section
- [ ] Create profile completion indicator
- [ ] Add profile activity/history
- [ ] Add profile picture management

### Phase 5: Settings & Preferences
- [ ] Add privacy settings UI
- [ ] Profile export functionality

---

## Service Updates Needed

### Update `frontend/src/services/auth.js`

```javascript
// Add method to get other users' profiles
async getUserById(userId) {
  const response = await api.get(`/users/${userId}`);
  return response.data;
},

async getUserProfileById(userId) {
  const response = await api.get(`/users/${userId}/profile`);
  return response.data;
},

// Update user with all fields
async updateUser(userId, userData) {
  const endpoint = userId ? `/users/${userId}` : '/users/me';
  const response = await api.patch(endpoint, {
    first_name: userData.firstName,
    last_name: userData.lastName,
    phone_number: userData.phone,
    profile_picture_url: userData.profilePictureUrl,
  });
  return response.data;
},

// Update profile with all fields
async updateUserProfile(userId, profileData) {
  const endpoint = userId ? `/users/${userId}/profile` : '/users/me/profile';
  const response = await api.patch(endpoint, {
    bio: profileData.bio,
    location: profileData.location,
    study_program: profileData.studyProgram,
    department: profileData.department,
  });
  return response.data;
},
```

---

## UI Component Suggestions

### 1. Profile Picture Component
```jsx
<ProfilePicture
  src={user.profile_picture_url}
  size="large"
  editable={isOwnProfile}
  onUpload={handleImageUpload}
/>
```

### 2. Rating Display Component
```jsx
<UserRating
  rating={profile.rating}
  totalRatings={profile.total_ratings}
  showCount={true}
/>
```

### 3. Profile Stats Component
```jsx
<ProfileStats
  totalListings={stats.totalListings}
  activeListings={stats.activeListings}
  soldListings={stats.soldListings}
  rating={profile.rating}
/>
```

### 4. Profile Completion Component
```jsx
<ProfileCompletion
  completion={completionPercentage}
  missingFields={missingFields}
  onComplete={handleCompleteProfile}
/>
```

---

## Data Mapping Notes

### Current Frontend → Backend Mapping Issues

1. **fullName** - Frontend uses `fullName`, backend has `first_name` and `last_name`
   - **Fix:** Split into `first_name` and `last_name`

2. **campus** - Frontend has this, but backend doesn't
   - **Option 1:** Add to backend profile
   - **Option 2:** Store in `location` field
   - **Option 3:** Remove from frontend

3. **year** - Frontend has this, but backend doesn't
   - **Option 1:** Add to backend profile
   - **Option 2:** Store in `study_program` (e.g., "3rd Year Computer Science")
   - **Option 3:** Remove from frontend

4. **program** - Frontend uses this, backend has `study_program`
   - **Fix:** Map `program` → `study_program`

5. **university** - Frontend has this, but backend doesn't
   - **Note:** All users are MUN students, so this might be redundant
   - **Option:** Remove or hardcode as "Memorial University of Newfoundland"

6. **studentId** - Frontend has this, but backend doesn't
   - **Option 1:** Add to backend
   - **Option 2:** Remove from frontend

---

## Example: Enhanced ProfilePage Structure

```jsx
<ProfilePage>
  {/* Profile Header */}
  <ProfileHeader>
    <ProfilePicture />
    <UserName />
    <UserEmail />
    <EmailVerificationBadge />
    <EditButton />
  </ProfileHeader>

  {/* Profile Stats */}
  <ProfileStats>
    <StatCard label="Listings" value={totalListings} />
    <StatCard label="Rating" value={rating} />
    <StatCard label="Member Since" value={createdAt} />
  </ProfileStats>

  {/* Profile Sections */}
  <ProfileSection title="About">
    <Bio />
    <Location />
  </ProfileSection>

  <ProfileSection title="Contact">
    <PhoneNumber />
    <Email />
  </ProfileSection>

  <ProfileSection title="Academic">
    <StudyProgram />
    <Department />
    <Campus />
  </ProfileSection>

  <ProfileSection title="Account">
    <AccountCreated />
    <LastLogin />
    <EmailVerified />
  </ProfileSection>

  {/* User's Listings Preview */}
  <UserListingsPreview userId={userId} limit={3} />
</ProfilePage>
```

---

## Summary

### High Priority (Must Have)
1. Profile picture upload/display
2. Last name field
3. Location field
4. Study program and department mapping
5. Account information display

### Medium Priority (Should Have)
6. Rating system display
7. Public profile viewing
8. Profile statistics

### Low Priority (Nice to Have)
9. Profile completion indicator
10. Profile activity/history
11. Privacy settings
12. Profile export

All of these features can be implemented using the existing backend endpoints and fields!

