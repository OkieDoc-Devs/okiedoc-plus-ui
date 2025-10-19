# Patient Module - Clean Code Refactoring

## Overview

This Patient module has been refactored following clean-coding and modularity principles. All non-HTML functions have been separated into dedicated modules for improved readability, reusability, and scalability.

## Project Structure

```
src/Patient/
├── constants/                  # Static data and configuration
│   ├── appointmentConstants.js # Appointment-related constants
│   ├── profileConstants.js     # Profile-related constants
│   └── index.js               # Central export point
├── utils/                      # Utility functions
│   ├── formatters.js          # Formatting functions (dates, currency, etc.)
│   ├── statusHelpers.js       # Status-related utilities
│   ├── deviceHelpers.js       # Device detection utilities
│   ├── validators.js          # Validation functions
│   └── index.js               # Central export point
├── hooks/                      # Custom React hooks
│   ├── useDeviceDetection.js  # Device type detection hook
│   ├── useLocalStorage.js     # localStorage management hook
│   ├── useForm.js             # Form state management hook
│   ├── useAppointments.js     # Appointment management hook
│   └── index.js               # Central export point
├── services/                   # API and business logic services
│   └── appointmentService.js  # Appointment service (existing)
├── jsx/                        # React components
│   ├── PatientDashboard.jsx
│   ├── Appointments.jsx
│   ├── MedicalRecords.jsx
│   ├── Messages.jsx
│   ├── LabResults.jsx
│   ├── Billing.jsx
│   ├── MyAccount.jsx
│   ├── ConsultationHistory.jsx
│   └── HotlineBooking.jsx
└── css/                        # Stylesheets
    ├── PatientDashboard.css
    └── AppointmentBooking.css
```

## Module Documentation

### 1. Constants Module

Located in `/constants`

#### appointmentConstants.js

Contains all appointment-related static data:

```javascript
import { 
  SPECIALISTS, 
  SPECIALIZATIONS, 
  CONSULTATION_CHANNELS,
  APPOINTMENT_STATUSES,
  PAYMENT_METHODS,
  HMO_PROVIDERS 
} from '../constants';

// Usage example
console.log(SPECIALISTS); // Array of all specialists
console.log(APPOINTMENT_STATUSES.CONFIRMED); // 'Confirmed'
```

**Available exports:**
- `SPECIALISTS` - List of all specialists
- `SPECIALIZATIONS` - Unique list of specializations
- `CONSULTATION_CHANNELS` - Available consultation methods
- `APPOINTMENT_STATUSES` - Status constants
- `BOOKING_METHODS` - Booking method types
- `PAYMENT_METHODS` - Payment options
- `HMO_PROVIDERS` - List of HMO providers
- `COMMON_SYMPTOMS` - Pre-defined symptoms list
- `TIME_SLOTS` - Available appointment times
- `FILE_UPLOAD_CONFIG` - File upload settings
- `DEFAULT_APPOINTMENT_FORM` - Default form values

#### profileConstants.js

Contains profile-related constants:

```javascript
import { 
  DEFAULT_PROFILE_DATA, 
  BLOOD_TYPES, 
  GENDER_OPTIONS 
} from '../constants';
```

**Available exports:**
- `DEFAULT_PROFILE_DATA` - Default profile structure
- `BLOOD_TYPES` - Blood type options
- `GENDER_OPTIONS` - Gender selection options
- `PROFILE_VALIDATION_RULES` - Validation rules
- `PASSWORD_VALIDATION_RULES` - Password requirements
- `LANGUAGE_OPTIONS` - Language preferences

---

### 2. Utils Module

Located in `/utils`

#### formatters.js

Formatting utility functions:

```javascript
import { 
  formatFileSize, 
  formatDate, 
  formatCurrency 
} from '../utils/formatters';

// Usage examples
formatFileSize(1024000); // "1000 KB"
formatDate('2024-01-15'); // "January 15, 2024"
formatCurrency(1500); // "₱1,500.00"
```

**Available functions:**
- `formatFileSize(bytes)` - Format bytes to KB/MB/GB
- `formatDate(date)` - Format date to readable string
- `formatDateShort(date)` - Format date to MM/DD/YYYY
- `formatTime(time)` - Format time to 12-hour format
- `formatRelativeTime(timestamp)` - Format as "X hours ago"
- `formatPhoneNumber(phone)` - Format phone number
- `formatCurrency(amount, currency)` - Format currency
- `truncateText(text, maxLength)` - Truncate long text
- `getFileTypeIcon(fileName)` - Get icon class for file type
- `getInitials(fullName)` - Generate initials from name

#### statusHelpers.js

Status-related utilities:

```javascript
import { 
  getStatusIcon, 
  getStatusColor, 
  isChatEnabled 
} from '../utils/statusHelpers';

// Usage examples
getStatusIcon('Confirmed'); // Returns <FaCheckCircle /> component
getStatusColor('Pending'); // Returns 'patient-status-pending'
isChatEnabled('Active'); // Returns true
```

**Available functions:**
- `getStatusIcon(status)` - Get React icon for status
- `getStatusColor(status)` - Get CSS class for status
- `getStatusLabel(status)` - Get human-readable label
- `getStatusDescription(status)` - Get status description
- `isChatEnabled(status)` - Check if chat is available
- `isFileUploadEnabled(status)` - Check if file upload is available
- `isCancellationAllowed(status)` - Check if cancellation is allowed
- `requiresPayment(status)` - Check if payment is required

#### deviceHelpers.js

Device detection utilities:

```javascript
import { 
  isMobileDevice, 
  getDeviceType, 
  debounce 
} from '../utils/deviceHelpers';

// Usage examples
isMobileDevice(); // Returns true/false
getDeviceType(); // Returns 'mobile', 'tablet', or 'desktop'

const handleResize = debounce(() => {
  console.log('Window resized');
}, 250);
```

**Available functions:**
- `isMobileDevice(breakpoint)` - Check if mobile
- `isTabletDevice()` - Check if tablet
- `isDesktopDevice()` - Check if desktop
- `getDeviceType()` - Get device type string
- `isTouchDevice()` - Check touch support
- `debounce(func, wait)` - Debounce function calls
- `throttle(func, limit)` - Throttle function calls

#### validators.js

Validation functions:

```javascript
import { 
  isValidEmail, 
  validatePassword, 
  validateAppointmentForm 
} from '../utils/validators';

// Usage examples
isValidEmail('test@example.com'); // Returns true

const result = validatePassword('MyPass123');
// Returns { isValid: true/false, errors: [...] }

const formValidation = validateAppointmentForm(formData);
// Returns { isValid: true/false, errors: {...} }
```

**Available functions:**
- `isValidEmail(email)` - Validate email format
- `isValidPhone(phone)` - Validate phone number
- `validatePassword(password)` - Validate password strength
- `passwordsMatch(pass1, pass2)` - Check password match
- `validateDateOfBirth(dob)` - Validate date of birth
- `validateFileUpload(file)` - Validate file upload
- `validateAppointmentForm(formData)` - Validate appointment form
- `validateProfileForm(profileData)` - Validate profile form
- `validateRequired(value, fieldName)` - Check required field
- `validateMinLength(value, min, fieldName)` - Check min length
- `validateMaxLength(value, max, fieldName)` - Check max length
- `validatePattern(value, pattern, message)` - Validate regex pattern

---

### 3. Hooks Module

Located in `/hooks`

#### useDeviceDetection.js

Device detection hook:

```javascript
import { useDeviceDetection } from '../hooks';

function MyComponent() {
  const { isMobile, isDesktop, windowWidth } = useDeviceDetection();
  
  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
      Window width: {windowWidth}px
    </div>
  );
}
```

**Returns:**
- `isMobile` - Boolean
- `isDesktop` - Boolean
- `windowWidth` - Number
- `windowHeight` - Number

#### useLocalStorage.js

localStorage management hook:

```javascript
import { useLocalStorage } from '../hooks';

function MyComponent() {
  const [userData, setUserData] = useLocalStorage('user', {});
  
  const updateUser = () => {
    setUserData({ name: 'John Doe' });
  };
  
  return <button onClick={updateUser}>Update</button>;
}
```

**Returns:**
- `[storedValue, setValue]` - Same as useState, but synced with localStorage

#### useForm.js

Form state management hook:

```javascript
import { useForm } from '../hooks';
import { validateAppointmentForm } from '../utils';

function BookingForm() {
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm(
    { name: '', email: '' }, 
    validateAppointmentForm
  );
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      {errors.name && <span>{errors.name}</span>}
    </form>
  );
}
```

**Returns:**
- `values` - Form values object
- `errors` - Validation errors object
- `touched` - Touched fields object
- `isSubmitting` - Boolean
- `handleChange` - Input change handler
- `handleBlur` - Input blur handler
- `handleSubmit` - Form submit handler
- `resetForm` - Reset form function
- `setFieldValue` - Set single field value
- `setFieldError` - Set single field error

#### useAppointments.js

Appointment management hook:

```javascript
import { useAppointments } from '../hooks';

function AppointmentsList() {
  const {
    appointments,
    loading,
    error,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    refreshAppointments
  } = useAppointments();
  
  const handleAdd = (data) => {
    addAppointment(data);
  };
  
  return (
    <div>
      {loading ? <Spinner /> : <List items={appointments} />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}
```

**Returns:**
- `appointments` - Array of appointments
- `loading` - Boolean
- `error` - Error message or null
- `loadAppointments` - Load function
- `addAppointment(data)` - Add appointment
- `updateAppointment(id, updates)` - Update appointment
- `deleteAppointment(id)` - Delete appointment
- `getAppointmentsByStatus(status)` - Filter by status
- `refreshAppointments()` - Refresh data

---

## Usage Examples

### Example 1: Using Multiple Utilities

```javascript
import React from 'react';
import { 
  formatDate, 
  formatCurrency, 
  getStatusIcon 
} from '../utils';
import { APPOINTMENT_STATUSES } from '../constants';

function AppointmentCard({ appointment }) {
  return (
    <div className="appointment-card">
      <h3>{formatDate(appointment.date)}</h3>
      <p>{getStatusIcon(appointment.status)}</p>
      <p>{formatCurrency(appointment.amount)}</p>
      <span className={appointment.status === APPOINTMENT_STATUSES.CONFIRMED ? 'confirmed' : ''}>
        {appointment.status}
      </span>
    </div>
  );
}
```

### Example 2: Form with Validation

```javascript
import React from 'react';
import { useForm } from '../hooks';
import { validateAppointmentForm } from '../utils';
import { DEFAULT_APPOINTMENT_FORM } from '../constants';

function BookingForm({ onSubmit }) {
  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    isSubmitting
  } = useForm(DEFAULT_APPOINTMENT_FORM, validateAppointmentForm);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        name="chiefComplaint"
        value={values.chiefComplaint}
        onChange={handleChange}
        placeholder="Chief Complaint"
      />
      {errors.chiefComplaint && <span>{errors.chiefComplaint}</span>}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Example 3: Responsive Component

```javascript
import React from 'react';
import { useDeviceDetection } from '../hooks';

function Dashboard() {
  const { isMobile } = useDeviceDetection();
  
  return (
    <div>
      {isMobile ? (
        <MobileDashboard />
      ) : (
        <DesktopDashboard />
      )}
    </div>
  );
}
```

---

## Migration Guide

### Before (Inline Functions)

```javascript
// Old way - functions defined in component
const PatientDashboard = () => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    // ... implementation
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <FaClock />;
      // ... more cases
    }
  };
  
  // Component JSX
  return <div>...</div>;
};
```

### After (Modular Imports)

```javascript
// New way - import from modules
import React from 'react';
import { formatFileSize } from '../utils';
import { getStatusIcon } from '../utils';

const PatientDashboard = () => {
  // Component JSX - cleaner and more focused
  return <div>...</div>;
};
```

---

## Best Practices

1. **Import from index files**
   ```javascript
   // ✅ Good
   import { formatDate, formatCurrency } from '../utils';
   
   // ❌ Avoid
   import { formatDate } from '../utils/formatters';
   import { formatCurrency } from '../utils/formatters';
   ```

2. **Use constants instead of magic strings**
   ```javascript
   // ✅ Good
   import { APPOINTMENT_STATUSES } from '../constants';
   if (status === APPOINTMENT_STATUSES.CONFIRMED) { ... }
   
   // ❌ Avoid
   if (status === 'Confirmed') { ... }
   ```

3. **Leverage custom hooks for stateful logic**
   ```javascript
   // ✅ Good - reusable hook
   const { appointments, addAppointment } = useAppointments();
   
   // ❌ Avoid - repeated logic in each component
   const [appointments, setAppointments] = useState([]);
   const loadAppointments = () => { ... };
   ```

4. **Validate forms using utility functions**
   ```javascript
   // ✅ Good
   import { validateAppointmentForm } from '../utils';
   const validation = validateAppointmentForm(formData);
   
   // ❌ Avoid - inline validation
   const isValid = formData.name && formData.email && ...;
   ```

---

## Testing

Each module can be tested independently:

```javascript
// Example test for formatters
import { formatFileSize } from '../utils/formatters';

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1048576)).toBe('1 MB');
  });
});
```

---

## Benefits

✅ **Improved Readability** - Components focus on UI, not business logic  
✅ **Better Reusability** - Functions used across multiple components  
✅ **Easier Testing** - Pure functions easier to test  
✅ **Maintainability** - Changes in one place affect all components  
✅ **Scalability** - Easy to add new utilities and hooks  
✅ **Type Safety** - Easier to add TypeScript later  
✅ **Code Organization** - Clear separation of concerns  

---

## Contributing

When adding new functionality:

1. Add utility functions to appropriate `/utils` file
2. Add constants to appropriate `/constants` file
3. Create custom hooks in `/hooks` if state management is needed
4. Export from index files for easy imports
5. Update this README with usage examples
6. Write tests for new functions

---

## Support

For questions or issues with the modular structure, contact the frontend development team.

**Last Updated:** October 18, 2025  
**Version:** 1.0.0  
**Maintained by:** Patient Frontend Team

