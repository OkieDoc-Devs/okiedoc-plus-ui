# 🐛 Debugging Empty Page Issue

## Quick Diagnosis Steps

Open your browser and follow these steps:

### Step 1: Check Browser Console (F12)

Press **F12** and go to the **Console** tab. Look for errors.

**Copy and paste this into the console:**

```javascript
// Check if you're logged in
console.log('Patient ID:', localStorage.getItem('patientId'));
console.log('User Type:', localStorage.getItem('userType'));

// Test API connection
fetch('http://localhost:1337/isAlive')
  .then(r => r.text())
  .then(data => console.log('✅ Backend is alive:', data))
  .catch(err => console.error('❌ Backend connection failed:', err));

// Test dashboard API
const patientId = localStorage.getItem('patientId');
if (patientId) {
  fetch(`http://localhost:1337/patient-dashboard?patient_id=${patientId}`)
    .then(r => r.json())
    .then(data => {
      console.log('✅ Dashboard API Response:', data);
      console.log('  - Appointments:', data.appointments?.length || 0);
      console.log('  - Lab Results:', data.labResults?.length || 0);
      console.log('  - Medications:', data.medications?.length || 0);
      console.log('  - Consultations:', data.consultations?.length || 0);
      console.log('  - Billings:', data.billings?.length || 0);
      console.log('  - Messages:', data.messages?.length || 0);
    })
    .catch(err => console.error('❌ Dashboard API failed:', err));
} else {
  console.error('❌ No patient ID in localStorage - you are not logged in!');
}
```

---

## Common Issues & Solutions

### Issue 1: Backend Not Running
**Symptom:** Console shows "Failed to fetch" or "net::ERR_CONNECTION_REFUSED"

**Solution:**
```bash
cd okiedoc-plus-api-feature-patient
sails lift
```

Wait for: "Server lifted in..." message

---

### Issue 2: No Patient ID in localStorage
**Symptom:** Console shows "No patient ID in localStorage"

**Solution:**
1. Try logging in again
2. Check if login is successful
3. After login, check console for: `localStorage.getItem('patientId')`

---

### Issue 3: Backend Returns Error
**Symptom:** Console shows 404, 500, or error message

**Solution:**
Check backend console (terminal where sails is running) for errors:
```bash
# Look for lines like:
Error fetching patient dashboard data: ...
```

**Common backend errors:**
- Database not connected
- Tables don't exist
- SQL syntax error

**Fix:**
```bash
# Re-run database setup
mysql -u root -p okiedoc_plus_api < okiedoc_plus_api.sql
mysql -u root -p okiedoc_plus_api < patient_dummy_data.sql
mysql -u root -p okiedoc_plus_api < patient_test_users.sql
```

---

### Issue 4: Page is Blank (White Screen)
**Symptom:** Nothing renders at all

**Possible Causes:**
1. JavaScript error breaking React rendering
2. Component import error
3. API call failing and not handling error

**Solution:**
```javascript
// Check React errors in console
// Look for:
// - "Uncaught Error"
// - "Cannot read property"
// - "undefined is not an object"
```

**Fix:**
Refresh page with cache clear: **Ctrl+Shift+R**

---

### Issue 5: Stuck on Loading
**Symptom:** Page shows "Loading..." forever

**Possible Causes:**
1. API request is hanging
2. Backend not responding
3. CORS issue

**Solution:**
```javascript
// Check Network tab (F12)
// Look for requests to localhost:1337
// Check if they're "Pending" forever
```

**Fix:**
- Restart backend server
- Check CORS is enabled in backend

---

## 🔍 Detailed Diagnosis

### Check 1: Login Response

After logging in, check console for:
```
Login successful: {success: true, patient: {...}}
```

If you see this, login worked. Patient ID should be stored.

---

### Check 2: Dashboard API Call

When you navigate to `/patient-dashboard`, check Network tab for:
```
Request URL: http://localhost:1337/patient-dashboard?patient_id=PAT_EMPTY
Status: 200 OK
Response: {...}
```

---

### Check 3: React Component Errors

Look for errors like:
```
Cannot read property 'map' of undefined
Cannot read property 'length' of undefined
```

This means the component is trying to access data that doesn't exist.

---

## 🛠️ Quick Fixes

### Fix 1: Clear Everything and Restart

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

Then login again.

---

### Fix 2: Check Backend Database Connection

```bash
# In backend terminal, you should see:
info: Sails <| 
info:    __|  __|_|
info:   /___|  /__| 
info:  |  Sails  <|
...
Server lifted in...
```

If you see database connection errors, check `config/datastores.js`

---

### Fix 3: Verify Backend Returns Data

```bash
# Test API directly:
curl "http://localhost:1337/patient-dashboard?patient_id=PAT001"
```

Should return JSON with data. If it returns error, fix backend first.

---

## 🚨 Emergency Reset

If nothing works, do a complete reset:

```bash
# 1. Stop everything (Ctrl+C in both terminals)

# 2. Reset database
mysql -u root -p
DROP DATABASE okiedoc_plus_api;
CREATE DATABASE okiedoc_plus_api;
exit;

# 3. Re-run SQL scripts
cd okiedoc-plus-api-feature-patient/assets/dumps/Patient
mysql -u root -p okiedoc_plus_api < okiedoc_plus_api.sql
mysql -u root -p okiedoc_plus_api < patient_dummy_data.sql
mysql -u root -p okiedoc_plus_api < patient_test_users.sql

# 4. Restart backend
cd ../../../
sails lift

# 5. Clear browser
# Open browser, press F12, Console tab:
localStorage.clear();
# Then hard refresh: Ctrl+Shift+R

# 6. Try login again
```

---

## 📝 What to Share for Help

If still not working, please share:

1. **Browser Console output** (F12 → Console tab)
2. **Network tab** (F12 → Network tab, filter: Fetch/XHR)
3. **Backend console output** (terminal where sails is running)
4. **Which user are you logging in as?**
5. **Any error messages you see**

---

## 🎯 Expected Behavior

### After Login (Empty User):
1. Redirects to `/patient-dashboard`
2. Shows loading states briefly
3. Shows empty states with inbox icons
4. NO errors in console

### After Login (User with Data):
1. Redirects to `/patient-dashboard`
2. Shows loading states briefly
3. Shows real data from database
4. NO errors in console

---

## 💡 Most Likely Cause

Based on the issue description, the most likely causes are:

1. **Backend API not returning data correctly** (70% probability)
   - Check backend console for errors
   - Test API with curl command

2. **PatientDashboard component error** (20% probability)
   - Check browser console for React errors
   - Look for "Cannot read property" errors

3. **API connection issue** (10% probability)
   - Backend not running
   - CORS blocking requests
   - Wrong API URL

---

## 🔧 Quick Test Script

**Run this in browser console AFTER logging in:**

```javascript
// Complete diagnostic test
(async function() {
  console.log('=== DIAGNOSTIC TEST ===');
  
  // 1. Check localStorage
  const patientId = localStorage.getItem('patientId');
  const userType = localStorage.getItem('userType');
  console.log('1. Patient ID:', patientId);
  console.log('1. User Type:', userType);
  
  if (!patientId) {
    console.error('❌ PROBLEM: No patient ID - login may have failed');
    return;
  }
  
  // 2. Test backend connection
  try {
    const alive = await fetch('http://localhost:1337/isAlive');
    const aliveText = await alive.text();
    console.log('2. Backend alive:', aliveText);
  } catch (err) {
    console.error('❌ PROBLEM: Backend not responding:', err);
    return;
  }
  
  // 3. Test dashboard API
  try {
    const response = await fetch(`http://localhost:1337/patient-dashboard?patient_id=${patientId}`);
    const data = await response.json();
    console.log('3. Dashboard API Response:', data);
    
    if (data.error) {
      console.error('❌ PROBLEM: API returned error:', data.error);
    } else {
      console.log('✅ API working! Data counts:');
      console.log('   - Appointments:', data.appointments?.length || 0);
      console.log('   - Lab Results:', data.labResults?.length || 0);
      console.log('   - Medications:', data.medications?.length || 0);
      console.log('   - Consultations:', data.consultations?.length || 0);
      console.log('   - Billings:', data.billings?.length || 0);
      console.log('   - Messages:', data.messages?.length || 0);
    }
  } catch (err) {
    console.error('❌ PROBLEM: Dashboard API failed:', err);
  }
  
  console.log('=== TEST COMPLETE ===');
})();
```

**This will tell you exactly what the problem is!**

---

Need help? Share the console output from running the diagnostic test above.

