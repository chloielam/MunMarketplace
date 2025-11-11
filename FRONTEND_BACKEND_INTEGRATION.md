# Frontend-Backend Integration Analysis

## Backend API Endpoints Overview

### Authentication Endpoints (`/api/auth`)
1. `POST /api/auth/send-otp` - Send OTP to email
2. `POST /api/auth/verify-otp` - Verify OTP code
3. `POST /api/auth/register` - Register new user
4. `POST /api/auth/login` - Login user
5. `GET /api/auth/session` - Get current session user
6. `POST /api/auth/logout` - Logout user
7. `POST /api/auth/forgot-password` - Request password reset
8. `POST /api/auth/reset-password` - Reset password with code

### User Endpoints (`/api/users`)
1. `GET /api/users/me` - Get current user info
2. `GET /api/users/me/profile` - Get current user profile
3. `GET /api/users/:id` - Get user by ID
4. `GET /api/users/:id/profile` - Get user profile by ID
5. `PATCH /api/users/me` - Update current user
6. `PATCH /api/users/:id` - Update user by ID
7. `PATCH /api/users/me/profile` - Update current user profile
8. `PATCH /api/users/:id/profile` - Update user profile by ID

### Listing Endpoints (`/api/listings`)
1. `GET /api/listings` - Get all listings (with query filters)
   - Query params: `q`, `category`, `city`, `campus`, `priceMin`, `priceMax`, `sortBy`, `order`, `page`, `limit`
   - Returns: `{ items: [], total, page, limit, hasNext }`

### User Listing Management (`/api/me/listings`)
1. `GET /api/me/listings` - Get user's own listings
   - Query params: All from `/listings` plus `status`, `includeDeleted`
2. `POST /api/me/listings` - Create new listing
3. `GET /api/me/listings/:listingId` - Get specific listing (owned by user)
4. `PATCH /api/me/listings/:listingId` - Update listing
5. `DELETE /api/me/listings/:listingId` - Delete listing (soft delete)

---

## Current Frontend Implementation Status

### ✅ Implemented Features

#### Authentication
- ✅ Login (`/auth/login`)
- ✅ Register (`/auth/register`, `/auth/send-otp`, `/auth/verify-otp`)
- ✅ Session management (`/auth/session`)
- ✅ Logout (`/auth/logout`)
- ✅ User profile viewing (`/users/me`, `/users/me/profile`)
- ✅ User profile editing (`/users/me`, `/users/me/profile`)

#### Listings
- ✅ Browse listings (`/listings`) - Basic implementation
- ✅ View listings with basic filtering (category, search)

### ❌ Missing Frontend Features

#### Authentication Features
1. **Forgot Password Flow**
   - `POST /api/auth/forgot-password` - Not implemented
   - `POST /api/auth/reset-password` - Not implemented
   - **UI Needed**: Forgot password page with email input
   - **UI Needed**: Reset password page with code and new password inputs

#### Listing Features
1. **Advanced Listing Search & Filters**
   - Backend supports: `priceMin`, `priceMax`, `city`, `campus`, `sortBy`, `order`, `page`, `limit`
   - Frontend only uses: `category`, basic search
   - **UI Needed**: 
     - Price range slider/filters
     - City filter dropdown
     - Campus filter dropdown
     - Sort options (price, date, title)
     - Pagination controls

2. **Create Listing**
   - `POST /api/me/listings` - Not implemented
   - **UI Needed**: 
     - "Post a Listing" form/page
     - Fields: title, description, price, currency, category, city, campus, imageUrls
     - Image upload functionality
     - Form validation

3. **View Own Listings**
   - `GET /api/me/listings` - Not implemented
   - **UI Needed**: 
     - "My Listings" page
     - Show all user's listings
     - Filter by status (ACTIVE, SOLD, HIDDEN)
     - Show deleted listings option

4. **Edit Listing**
   - `GET /api/me/listings/:listingId` - Not implemented
   - `PATCH /api/me/listings/:listingId` - Not implemented
   - **UI Needed**: 
     - Edit listing form/page
     - Pre-populate with existing data
     - Update all fields
     - Status change (mark as SOLD, HIDE, etc.)

5. **Delete Listing**
   - `DELETE /api/me/listings/:listingId` - Not implemented
   - **UI Needed**: 
     - Delete button on listing cards
     - Confirmation dialog
     - Soft delete (can restore if needed)

6. **Listing Detail View**
   - No dedicated listing detail page
   - **UI Needed**: 
     - Individual listing page (`/listings/:id`)
     - Show full details, images, seller info
     - Contact seller button
     - Share listing functionality

7. **Pagination**
   - Backend returns pagination info (`page`, `limit`, `total`, `hasNext`)
   - Frontend doesn't use pagination
   - **UI Needed**: 
     - Page numbers
     - Next/Previous buttons
     - Items per page selector

---

## Recommended Frontend UI Additions

### Priority 1: Core Listing Management

#### 1. Create Listing Page (`/create-listing`)
**Features:**
- Form with all required fields
- Image upload (multiple images, max 10)
- Category dropdown
- City and Campus dropdowns
- Price input with currency selector
- Rich text editor for description
- Preview before posting
- Form validation

**Backend Endpoint:** `POST /api/me/listings`

#### 2. My Listings Page (`/my-listings`)
**Features:**
- Grid/list view of user's listings
- Filter by status (ACTIVE, SOLD, HIDDEN)
- Search within own listings
- Quick actions: Edit, Delete, Mark as Sold
- Show deleted listings toggle
- Statistics (total listings, active, sold)

**Backend Endpoint:** `GET /api/me/listings`

#### 3. Edit Listing Page (`/edit-listing/:id`)
**Features:**
- Pre-populated form
- Update all fields
- Change status
- Update images
- Save changes

**Backend Endpoints:** 
- `GET /api/me/listings/:listingId`
- `PATCH /api/me/listings/:listingId`

#### 4. Listing Detail Page (`/listings/:id`)
**Features:**
- Full listing information
- Image gallery
- Seller information and profile link
- Contact seller button
- Share functionality
- Similar listings section
- Report listing option

**Backend Endpoint:** Need to add `GET /api/listings/:id` (currently only available for own listings)

### Priority 2: Enhanced Search & Filtering

#### 5. Advanced Search Filters
**Features:**
- Price range slider (min/max)
- City filter (multi-select)
- Campus filter (multi-select)
- Sort by: Price (low to high, high to low), Date (newest, oldest), Title (A-Z, Z-A)
- Clear all filters button
- Save search preferences

**Backend Endpoint:** `GET /api/listings` (with query params)

#### 6. Pagination Component
**Features:**
- Page numbers
- Next/Previous buttons
- Items per page selector (20, 50, 100)
- Total results count
- "Showing X-Y of Z results"

**Backend Endpoint:** `GET /api/listings` (returns pagination info)

### Priority 3: User Experience Enhancements

#### 7. Forgot Password Flow
**Features:**
- Forgot password link on login page
- Email input form
- OTP code input form
- New password form
- Success message

**Backend Endpoints:**
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

#### 8. User Profile Enhancements
**Features:**
- View other users' profiles (`/users/:id/profile`)
- Public profile view
- User's listings on their profile
- Contact user button

**Backend Endpoints:**
- `GET /api/users/:id`
- `GET /api/users/:id/profile`

#### 9. Listing Status Management
**Features:**
- Quick status change buttons (Mark as Sold, Hide Listing)
- Status badges on listings
- Filter by status in My Listings

**Backend Endpoint:** `PATCH /api/me/listings/:listingId` (with status field)

### Priority 4: Additional Features

#### 10. Image Upload Service
**Features:**
- Multiple image upload
- Image preview
- Image reordering
- Image deletion
- Image compression/optimization

**Note:** Backend accepts `imageUrls` array, but no upload endpoint exists. Need to:
- Add image upload endpoint, OR
- Use third-party service (Cloudinary, AWS S3, etc.)

#### 11. Favorites/Wishlist (Future)
**Backend:** Not implemented yet
**UI Needed:** Save listings for later

#### 12. Messaging System (Future)
**Backend:** Not implemented yet
**UI Needed:** Contact sellers, negotiate prices

---

## Implementation Checklist

### Phase 1: Core Listing Management
- [ ] Create listing service (`frontend/src/services/listings.js`)
- [ ] Create Listing Form component
- [ ] Create My Listings page
- [ ] Create Edit Listing page
- [ ] Add delete listing functionality
- [ ] Update Items component to use pagination

### Phase 2: Enhanced Search
- [ ] Add price range filter
- [ ] Add city/campus filters
- [ ] Add sort options
- [ ] Implement pagination component
- [ ] Update Items service to handle query params

### Phase 3: User Experience
- [ ] Forgot password flow
- [ ] Reset password flow
- [ ] Listing detail page
- [ ] User profile viewing (other users)

### Phase 4: Polish
- [ ] Image upload integration
- [ ] Loading states
- [ ] Error handling
- [ ] Success messages
- [ ] Responsive design improvements

---

## Service File Structure

### Recommended: `frontend/src/services/listings.js`

```javascript
import api from './api';

export const listingService = {
  // Get all listings with filters
  async getListings(query = {}) {
    const response = await api.get('/listings', { params: query });
    return response.data;
  },

  // Get single listing (need backend endpoint)
  async getListing(id) {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  // Get user's own listings
  async getMyListings(query = {}) {
    const response = await api.get('/me/listings', { params: query });
    return response.data;
  },

  // Get single own listing
  async getMyListing(id) {
    const response = await api.get(`/me/listings/${id}`);
    return response.data;
  },

  // Create listing
  async createListing(data) {
    const response = await api.post('/me/listings', data);
    return response.data;
  },

  // Update listing
  async updateListing(id, data) {
    const response = await api.patch(`/me/listings/${id}`, data);
    return response.data;
  },

  // Delete listing
  async deleteListing(id) {
    await api.delete(`/me/listings/${id}`);
  },
};
```

---

## Notes

1. **Backend Missing Endpoint**: `GET /api/listings/:id` for viewing any listing (not just own listings)
2. **Image Upload**: Backend accepts imageUrls but doesn't handle upload. Consider adding upload endpoint or using external service
3. **Pagination**: Backend supports it, frontend needs to implement UI
4. **Status Management**: Backend supports ACTIVE, SOLD, HIDDEN statuses - frontend should utilize these

