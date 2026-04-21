# Medication Module UI Flow Documentation

## User Flows

### 1. View Medications List

**Entry Point:** Dashboard → Medications

**Steps:**
1. User navigates to `/medications`
2. System loads medications list with default filters
3. User can:
   - Search by code, generic name, or brand
   - Filter by status (Available, Out of Stock, Unavailable)
   - Filter by location
   - Click "Add Medication" to create new
   - Click on a medication row to view details
4. System displays paginated table with medications

**UI Elements:**
- PageHeader with title and "Add Medication" button
- Search input field
- Status filter dropdown
- Location filter dropdown
- Search button
- Medications table with columns: Code, Generic Name, Brand Name, Status, Location, Updated At, Actions
- Pagination info (total count, page number)

**Role Considerations:**
- All roles can view the list
- Only SYSTEM_ADMIN and MEDICATION_MANAGER see "Add Medication" button

---

### 2. Create New Medication

**Entry Point:** Medications List → "Add Medication" button

**Steps:**
1. User clicks "Add Medication" button
2. System navigates to `/medications/new`
3. User fills in required fields:
   - Code (required, must be unique)
   - Generic Name (required)
   - Brand Name (required)
   - Strength (required)
   - Dosage Form (required)
   - Category (required)
   - Manufacturer (required)
   - Description (optional)
   - Location ID (required)
   - Status (optional, defaults to Available)
4. User clicks "Create Medication" or "Cancel"
5. On success, system navigates back to medications list
6. On error, system displays inline validation errors

**UI Elements:**
- PageHeader with title "Create Medication" and Cancel button
- MedicationForm component with all fields
- Submit button with loading state
- Inline error messages for validation failures

**Validation:**
- All required fields must be filled
- Code must be unique
- Location ID must be valid

**Role Considerations:**
- Only SYSTEM_ADMIN and MEDICATION_MANAGER can access this page
- Other users are redirected or see unauthorized message

---

### 3. View Medication Details

**Entry Point:** Medications List → Click on medication row

**Steps:**
1. User clicks on a medication row
2. System navigates to `/medications/[id]`
3. System displays medication information in cards:
   - Basic Information (code, status, generic name, brand name, strength, dosage form, category, manufacturer, location, description)
   - Metadata (created by, created at, updated by, updated at)
   - Status History table (old status, new status, reason, changed by, changed at)
4. User can:
   - Click "Edit" to modify medication (if authorized)
   - Click "Change Status" to update status (if authorized)
   - Click "Back" to return to list

**UI Elements:**
- PageHeader with medication code and generic name as title
- Action buttons: Edit, Change Status, Back
- Card with Basic Information (grid layout)
- Card with Metadata (grid layout)
- Card with Status History table
- Status badges with color coding (green for Available, yellow for Out of Stock, red for Unavailable)

**Role Considerations:**
- All roles can view details
- Only SYSTEM_ADMIN and MEDICATION_MANAGER see Edit and Change Status buttons

---

### 4. Edit Medication

**Entry Point:** Medication Details → "Edit" button

**Steps:**
1. User clicks "Edit" button
2. System navigates to `/medications/[id]/edit`
3. System pre-fills form with current medication data
4. User modifies desired fields (all optional except status)
5. User clicks "Save Changes" or "Cancel"
6. On success, system navigates back to medication details
7. On error, system displays inline validation errors

**UI Elements:**
- PageHeader with title "Edit [code]" and Cancel button
- MedicationForm component with pre-filled values
- Submit button with loading state
- Inline error messages for validation failures

**Validation:**
- If code is changed, must be unique
- All provided fields must be valid

**Role Considerations:**
- Only SYSTEM_ADMIN and MEDICATION_MANAGER can access this page
- Other users are redirected or see unauthorized message

---

### 5. Change Medication Status

**Entry Point:** Medication Details → "Change Status" button

**Steps:**
1. User clicks "Change Status" button
2. System opens ChangeStatusModal overlay
3. Modal displays:
   - Current status (read-only)
   - New status dropdown
   - Reason text input
4. User selects new status and enters reason
5. User clicks "Change Status" or "Cancel"
6. On success, modal closes and medication details refresh
7. On error, modal displays validation errors

**UI Elements:**
- Modal overlay with semi-transparent background
- Card with modal content
- Current status display (gray background)
- New status dropdown (Available, Out of Stock, Unavailable)
- Reason input field
- Submit and Cancel buttons
- Inline error messages

**Validation:**
- New status must be different from current status
- Reason is required

**Role Considerations:**
- Only SYSTEM_ADMIN and MEDICATION_MANAGER can change status
- Modal only shows for authorized users

---

### 6. View Status History

**Entry Point:** Medication Details page (always visible)

**Steps:**
1. User is on medication details page
2. Status History card displays all status changes
3. Table shows:
   - Old status with badge
   - New status with badge
   - Reason for change
   - User who made the change
   - Timestamp of change
4. If no history exists, displays "No status history available"

**UI Elements:**
- Card with "Status History" heading
- Table with columns: Old Status, New Status, Reason, Changed By, Changed At
- Status badges with color coding
- Empty state message when no history

**Role Considerations:**
- All roles can view status history

---

## Error States

### Loading States
- List page: Shows "Loading medications..." spinner
- Detail page: Shows "Loading medication details..." spinner
- Create/Edit pages: Button shows "Saving..." during submission
- Status change modal: Button shows "Changing..." during submission

### Error States
- List page: Shows error message with red text
- Detail page: Shows "Error loading medication details" with back button
- Create/Edit pages: Shows inline validation errors under fields
- Status change modal: Shows validation errors under fields

### Empty States
- List page: Shows "No medications found" with "Add Medication" button
- Status history: Shows "No status history available" in gray text

---

## Navigation Flow

```
Dashboard
  ↓
Medications List (/medications)
  ↓ (click row)
Medication Details (/medications/[id])
  ↓ (click Edit)
Edit Medication (/medications/[id]/edit)
  ↓ (save)
Medication Details (/medications/[id])
  ↓ (click Change Status)
Change Status Modal
  ↓ (submit)
Medication Details (/medications/[id])
  ↓ (click Back)
Medications List (/medications)
  ↓ (click Add Medication)
Create Medication (/medications/new)
  ↓ (submit)
Medications List (/medications)
```

---

## Color Coding

### Status Badges
- **AVAILABLE** (Green): Medication is available for use
- **OUT_OF_STOCK** (Yellow): Medication is temporarily out of stock
- **UNAVAILABLE** (Red): Medication is unavailable

### Button Variants
- **Primary**: Main actions (Create, Save, Change Status)
- **Secondary**: Secondary actions (Cancel, Back, Edit)

---

## Responsive Design

- Tables scroll horizontally on small screens
- Forms stack vertically on small screens
- Modals are centered with maximum width
- Grid layouts adjust from 2 columns to 1 column on mobile

---

## Accessibility

- All form fields have associated labels
- Error messages are clearly associated with fields
- Buttons have descriptive text
- Status badges use color plus text for clarity
- Modals can be closed with Escape key (future enhancement)
- Focus management in modals (future enhancement)
