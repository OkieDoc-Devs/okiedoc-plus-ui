# Specialists Utilities

This directory contains modular utility functions extracted from the specialists codebase to follow clean coding and modularity principles.

## Structure

### `dateUtils.js`
Date and time utility functions:
- `formatDateLabel(dt, timeLabel)` - Format date with time label
- `getDaysInMonth(year, month)` - Get number of days in a month
- `getFirstDayOfMonth(year, month)` - Get first day of month (0-6)
- `getMonthName(month)` - Get month name from index
- `formatDateKey(year, month, day)` - Format date key for storage
- `parseTicketDate(whenField)` - Parse ticket date from when field
- `isToday(year, month, day)` - Check if date is today
- `isPastDate(year, month, day)` - Check if date is in the past

### `dataUtils.js`
Data management utilities:
- `generateId()` - Generate unique ID
- `loadFromStorage(key, defaultValue)` - Load data from localStorage with error handling
- `saveToStorage(key, data)` - Save data to localStorage with error handling
- `removeFromStorage(key)` - Remove data from localStorage
- `loadTickets()` - Load tickets from localStorage
- `saveTickets(tickets)` - Save tickets to localStorage
- `loadProfileData(email)` - Load profile data for user
- `saveProfileData(email, profileData)` - Save profile data for user
- `loadServicesData(email)` - Load services data for user
- `saveServicesData(email, servicesData)` - Save services data for user
- `loadAccountData(email)` - Load account data for user
- `saveAccountData(email, accountData)` - Save account data for user
- `loadScheduleData(email)` - Load schedule data for user
- `saveScheduleData(email, scheduleData)` - Save schedule data for user
- `loadEncounterData(ticketId)` - Load encounter data for ticket
- `saveEncounterData(ticketId, encounterData)` - Save encounter data for ticket
- `loadMedicalHistoryData(ticketId)` - Load medical history data for ticket
- `saveMedicalHistoryData(ticketId, mhData)` - Save medical history data for ticket
- `getCurrentUserEmail()` - Get current user email from localStorage
- `setCurrentUserEmail(email)` - Set current user email in localStorage

### `uiUtils.js`
UI utility functions:
- `getStatusBadgeClass(status)` - Get status badge CSS class
- `filterTicketsByStatus(tickets, filter)` - Filter tickets by status
- `filterBySearchTerm(data, searchTerm, searchFields)` - Filter data by search term
- `filterBySpecialization(data, specialization, fieldPath)` - Filter data by specialization
- `getNestedValue(obj, path)` - Get nested object value by path
- `filterTransactions(transactions, filters)` - Filter transactions by multiple criteria
- `getAllSpecializations(data, fieldPath)` - Get all unique specializations from data
- `formatFileSize(bytes)` - Format file size for display
- `generateUserInitials(firstName, lastName)` - Generate user initials from name
- `validateFormData(data, rules)` - Validate form data

### `medicalUtils.js`
Medical utility functions:
- `SUB_SPECIALIZATIONS` - Medical specializations and sub-specializations
- `createDefaultEncounter()` - Create default encounter data
- `createDefaultMedicineForm()` - Create default medicine form
- `createDefaultLabForm()` - Create default lab form
- `validateMedicine(medicine)` - Validate medicine data
- `validateLabRequest(labRequest)` - Validate lab request data
- `addMedicineToEncounter(encounter, medicine)` - Add medicine to encounter
- `removeMedicineFromEncounter(encounter, index)` - Remove medicine from encounter
- `addLabRequestToEncounter(encounter, labRequest)` - Add lab request to encounter
- `removeLabRequestFromEncounter(encounter, index)` - Remove lab request from encounter
- `createMedicalHistoryRequest(data)` - Create medical history request
- `updateMedicalHistoryStatus(request, status)` - Update medical history request status
- `formatMedicineDisplay(medicine)` - Format medicine for display
- `formatLabRequestDisplay(labRequest)` - Format lab request for display
- `getSubSpecializations(specialization)` - Get sub-specializations for specialization
- `isValidSpecialization(specialization)` - Check if specialization exists
- `isValidSubSpecialization(specialization, subSpecialization)` - Check if sub-specialization is valid

### `exportUtils.js`
Export utility functions:
- `exportToCSV(data, headers, filename)` - Export data to CSV format
- `exportTransactionsToCSV(transactions, filename)` - Export transactions to CSV
- `generateMedicalHistoryHTML(request, ticket)` - Generate medical history HTML
- `openPrintWindow(html, title)` - Open print window with HTML content
- `downloadMedicalHistoryPDF(request, ticket)` - Download medical history as PDF
- `generateEncounterSummaryHTML(encounter, ticket)` - Generate encounter summary HTML
- `downloadEncounterSummaryPDF(encounter, ticket)` - Download encounter summary as PDF
- `exportToJSON(data, filename)` - Export data to JSON format

### `validationUtils.js`
Validation utility functions:
- `validateEmail(email)` - Validate email address
- `validatePassword(password)` - Validate password strength
- `validatePhone(phone)` - Validate phone number
- `validatePRCLicense(licenseNumber)` - Validate PRC license number
- `validateSpecialistProfile(profileData)` - Validate specialist profile data
- `validatePasswordChange(passwordData)` - Validate password change data
- `validateServiceFee(serviceData)` - Validate service fee data
- `validateAccountDetails(accountData)` - Validate account details
- `validateScheduleData(scheduleData)` - Validate schedule data
- `validateMedicalHistoryRequest(mhData)` - Validate medical history request
- `sanitizeInput(input)` - Sanitize input string
- `validateFileUpload(file, options)` - Validate file upload

## Usage

Import the utilities you need:

```javascript
import { 
  formatDateLabel, 
  loadTickets, 
  saveTickets,
  validateSpecialistProfile 
} from './utils';
```

Or import specific utilities from individual files:

```javascript
import { formatDateLabel } from './dateUtils';
import { loadTickets } from './dataUtils';
import { validateSpecialistProfile } from './validationUtils';
```

## Benefits

1. **Modularity**: Functions are organized by purpose and can be imported individually
2. **Reusability**: Functions can be used across different components
3. **Maintainability**: Changes to utility functions only need to be made in one place
4. **Testability**: Individual functions can be easily unit tested
5. **Clean Code**: Main components focus on UI logic while utilities handle business logic
6. **Type Safety**: Functions have clear input/output contracts
7. **Error Handling**: Centralized error handling for common operations
8. **Validation**: Consistent validation across all forms and data operations
