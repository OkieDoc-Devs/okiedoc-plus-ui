import React, { useState, useEffect } from 'react';
import { sanitizeInput } from '../../Specialists/utils/validationUtils';
import EmptyState from '../Components/EmptyState';
import Modal from '../Components/Modal';
import { usePSGC } from '../../hooks/usePSGC';
import { useAuth } from '../../contexts/AuthContext';
import './UserTable.css';

const ReadOnlyRow = ({ user, onView, onEdit, onDelete }) => {
  return (
    <tr>
      <td>{user.firstName}</td>
      <td>{user.lastName}</td>
      <td>{user.email}</td>
      <td>{user.mobileNumber}</td>
      <td>{user.subscription}</td>
      <td className='user-table-actions'>
        <button className='action-btn btn-view' onClick={() => onView(user)}>
          View
        </button>
        <button className='action-btn btn-edit' onClick={() => onEdit(user)}>
          Edit
        </button>
        <button
          className='action-btn btn-delete'
          onClick={() => onDelete(user)}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

/**
 * A row component that is editable.
 */
const EditableRow = ({
  editableUserData,
  onUserDataChange,
  onSave,
  onCancel,
}) => {
  return (
    <tr className='editable-row'>
      <td>
        <input
          type='text'
          name='firstName'
          value={editableUserData.firstName}
          onChange={onUserDataChange}
          placeholder='First Name'
        />
      </td>
      <td>
        <input
          type='text'
          name='lastName'
          value={editableUserData.lastName}
          onChange={onUserDataChange}
          placeholder='Last Name'
        />
      </td>
      <td>
        <input
          type='email'
          name='email'
          value={editableUserData.email}
          onChange={onUserDataChange}
          placeholder='Email Address'
        />
      </td>
      <td>
        <input
          type='text'
          name='mobileNumber'
          value={editableUserData.mobileNumber}
          onChange={onUserDataChange}
          placeholder='Mobile Number'
        />
      </td>
      <td>
        <input
          type='text'
          name='subscription'
          value={editableUserData.subscription}
          onChange={onUserDataChange}
          placeholder='Subscription'
        />
      </td>
      <td className='user-table-actions'>
        <button className='action-btn btn-save' onClick={onSave}>
          Submit
        </button>
        <button className='action-btn btn-cancel' onClick={onCancel}>
          Cancel
        </button>
      </td>
    </tr>
  );
};

const UserTable = ({
  users = [],
  onUpdate,
  onView,
  onDelete,
  onCreateStaff,
  isNurseAdmin = false,
}) => {
  const { user: currentUser } = useAuth();

  const [editingRowId, setEditingRowId] = useState(null);
  const [editableUserData, setEditableUserData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    mobileNumber: '',
    role: 'nurse',
    licenseNumber: '',
    prcExpiryDate: '',
    barangay: '',
    city: '',
    province: '',
    region: '',
    zipCode: '',
    addressLine1: '',
    addressLine2: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    regions,
    provinces,
    cities,
    barangays,
    fetchProvinces,
    fetchCities,
    fetchBarangays,
  } = usePSGC();

  // Pre-fill location fields if admin is restricted to their location
  useEffect(() => {
    if (showAddModal && currentUser) {
      console.log('Modal opened, currentUser:', currentUser);

      // First, set the form values from currentUser location
      setStaffForm((prev) => {
        const newForm = {
          ...prev,
          region: currentUser.region || prev.region,
          province: currentUser.province || prev.province,
          city: currentUser.city || prev.city,
        };
        console.log('Setting staffForm with admin location:', newForm);
        return newForm;
      });

      // Then fetch the PSGC cascade data
      const matchPreFilledLocation = async () => {
        if (!currentUser.region) {
          console.log('No region found on currentUser');
          return;
        }
        try {
          let regionCode = null;
          let provinceCode = null;
          let cityCode = null;

          // Step 1: Find region code
          if (currentUser.region) {
            const regionsRes = await fetch(
              'https://psgc.gitlab.io/api/regions.json',
            );
            const regionsData = await regionsRes.json();
            const matchedRegion = regionsData.find(
              (r) =>
                r.regionName === currentUser.region ||
                r.name === currentUser.region ||
                (r.regionName &&
                  currentUser.region &&
                  r.regionName.includes(currentUser.region)),
            );
            if (matchedRegion) {
              regionCode = matchedRegion.code;
              console.log('Found region code:', regionCode);
              // This returns a promise that completes when the fetch is done
              await fetchProvinces(regionCode);
            }
          }

          // Step 2: Find province code
          if (regionCode && currentUser.province) {
            const provRes = await fetch(
              `https://psgc.gitlab.io/api/regions/${regionCode}/provinces.json`,
            );
            const provData = await provRes.json();
            const matchedProvince = provData.find(
              (p) => p.name === currentUser.province,
            );
            if (matchedProvince) {
              provinceCode = matchedProvince.code;
              console.log('Found province code:', provinceCode);
              await fetchCities(provinceCode);
            }
          }

          // Step 3: Find city code
          if (provinceCode && currentUser.city) {
            const cityRes = await fetch(
              `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`,
            );
            const cityData = await cityRes.json();
            const matchedCity = cityData.find(
              (c) => c.name === currentUser.city,
            );
            if (matchedCity) {
              cityCode = matchedCity.code;
              console.log('Found city code:', cityCode);
              await fetchBarangays(cityCode);
            }
          }
        } catch (e) {
          console.error('Error pre-filling PSGC data:', e);
        }
      };
      matchPreFilledLocation();
    }
  }, [showAddModal, currentUser, fetchProvinces, fetchCities, fetchBarangays]);

  const handleStaffFormChange = (e) => {
    const { name, value, options, selectedIndex } = e.target;

    // We store the NAME in the DB, so our select value is the Name.
    // We look up the corresponding code from the loaded lists to fetch children.
    if (name === 'region') {
      const regionName = value;
      const regionObj = regions.find(
        (r) =>
          r.regionName === regionName ||
          r.name === regionName ||
          (r.regionName && r.regionName.includes(regionName)) ||
          `${r.regionName || ''} (${r.name || ''})` === regionName,
      );
      setStaffForm((prev) => ({
        ...prev,
        region: regionName,
        province: '',
        city: '',
        barangay: '',
      }));
      if (regionObj) fetchProvinces(regionObj.code);
    } else if (name === 'province') {
      const provinceName = value;
      const provinceObj = provinces.find((p) => p.name === provinceName);
      setStaffForm((prev) => ({
        ...prev,
        province: provinceName,
        city: '',
        barangay: '',
      }));
      if (provinceObj) fetchCities(provinceObj.code);
    } else if (name === 'city') {
      const cityName = value;
      const cityObj = cities.find((c) => c.name === cityName);
      setStaffForm((prev) => ({ ...prev, city: cityName, barangay: '' }));
      if (cityObj) fetchBarangays(cityObj.code);
    } else if (name === 'barangay') {
      const barangayName = value;
      setStaffForm((prev) => ({ ...prev, barangay: barangayName }));
    } else {
      setStaffForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submitStaffForm = async () => {
    if (
      !staffForm.firstName ||
      !staffForm.lastName ||
      !staffForm.email ||
      !staffForm.password ||
      !staffForm.mobileNumber
    ) {
      alert('Please fill all required basic fields.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(staffForm.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const mobileRegex = /^(09\d{9}|\+639\d{9})$/;
    if (!mobileRegex.test(staffForm.mobileNumber.trim())) {
      alert(
        'Mobile number must be a valid PH number (e.g., 09123456789 or +639123456789).',
      );
      return;
    }

    if (staffForm.password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
    if (
      staffForm.role === 'nurse' &&
      (!staffForm.licenseNumber || !staffForm.prcExpiryDate)
    ) {
      alert('Please provide the license details for the nurse.');
      return;
    }
    if (
      !staffForm.barangay ||
      !staffForm.city ||
      !staffForm.province ||
      !staffForm.region
    ) {
      alert(
        'Please provide all required address fields (Barangay, City, Province, and Region).',
      );
      return;
    }
    try {
      setIsSubmitting(true);
      if (onCreateStaff) {
        await onCreateStaff(staffForm);
      }
      setShowAddModal(false);
      setStaffForm({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        password: '',
        mobileNumber: '',
        role: 'nurse',
        licenseNumber: '',
        prcExpiryDate: '',
        barangay: '',
        city: '',
        province: '',
        region: '',
        zipCode: '',
        addressLine1: '',
        addressLine2: '',
      });
    } catch (error) {
      alert(error.message || 'Failed to create staff.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingRowId(user.id);
    setEditableUserData({ ...user });
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditableUserData(null);
  };

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setEditableUserData((prevData) => ({
      ...prevData,
      [name]: sanitizeInput(value),
    }));
  };

  const handleSaveEdit = () => {
    onUpdate(editableUserData);
    setEditingRowId(null);
    setEditableUserData(null);
  };

  return (
    <>
      <div id='user-management' className='tab-content active'>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2>User Management (Patients & Nurses)</h2>
          <button className='btn-primary' onClick={() => setShowAddModal(true)}>
            + Add Staff
          </button>
        </div>
        <div className='table-wrapper'>
          <table className='dashboard-table user-table'>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email Address</th>
                <th>Mobile Number</th>
                <th>Subscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <React.Fragment key={user.id}>
                    {editingRowId === user.id ? (
                      <EditableRow
                        editableUserData={editableUserData}
                        onUserDataChange={handleUserDataChange}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <ReadOnlyRow
                        user={user}
                        onView={onView}
                        onEdit={handleEditClick}
                        onDelete={onDelete}
                      />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan='6' style={{ padding: 0, border: 'none' }}>
                    <EmptyState
                      type='users'
                      message='No Users Found'
                      subMessage='There are currently no registered patients or nurses matching your search criteria.'
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <Modal
          title='Create New Staff'
          onClose={() => setShowAddModal(false)}
          contentStyle={{ maxWidth: '800px', width: '95%' }}
        >
          <div id='modal-body' className='form-grid staff-modal-form'>
            <div className='input-group full-width'>
              <label>Role</label>
              <select
                name='role'
                value={staffForm.role}
                onChange={handleStaffFormChange}
                className='input-md'
              >
                <option value='nurse'>Nurse</option>
                {!isNurseAdmin && <option value='admin'>Admin</option>}
                {!isNurseAdmin && (
                  <option value='nurse_admin'>Nurse Admin</option>
                )}
              </select>
            </div>
            <div className='input-group'>
              <label>First Name</label>
              <input
                type='text'
                name='firstName'
                value={staffForm.firstName}
                onChange={handleStaffFormChange}
                maxLength='50'
                className='input-md'
              />
            </div>
            <div className='input-group'>
              <label>Last Name</label>
              <input
                type='text'
                name='lastName'
                value={staffForm.lastName}
                onChange={handleStaffFormChange}
                maxLength='50'
                className='input-md'
              />
            </div>
            <div className='input-group'>
              <label>Middle Name (Optional)</label>
              <input
                type='text'
                name='middleName'
                value={staffForm.middleName}
                onChange={handleStaffFormChange}
                maxLength='50'
                className='input-md'
              />
            </div>
            <div className='input-group'>
              <label>Email Address</label>
              <input
                type='email'
                name='email'
                value={staffForm.email}
                onChange={handleStaffFormChange}
                maxLength='64'
                className='input-md'
              />
            </div>
            <div className='input-group'>
              <label>Mobile Number</label>
              <input
                type='text'
                name='mobileNumber'
                value={staffForm.mobileNumber}
                onChange={handleStaffFormChange}
                maxLength='13'
                className='input-md'
              />
            </div>
            <div className='input-group'>
              <label>Password</label>
              <input
                type='password'
                name='password'
                value={staffForm.password}
                onChange={handleStaffFormChange}
                maxLength='64'
                className='input-md'
              />
            </div>

            <div className='input-group full-width'>
              <h3
                style={{
                  fontSize: '14px',
                  marginTop: '10px',
                  marginBottom: '5px',
                }}
              >
                Address Information
              </h3>
            </div>
            <div className='input-group'>
              <label>Region</label>
              <select
                name='region'
                onChange={handleStaffFormChange}
                className='input-md'
                value={staffForm.region}
                disabled={!!currentUser?.region}
              >
                <option value='' disabled>
                  Select Region
                </option>
                {/* Always include the selected region as an option if it's locked and regions aren't loaded yet */}
                {!!currentUser?.region &&
                  !regions.some(
                    (r) =>
                      r.regionName === currentUser.region ||
                      r.name === currentUser.region,
                  ) && (
                    <option value={currentUser.region}>
                      {currentUser.region}
                    </option>
                  )}
                {regions.map((reg) => (
                  <option key={reg.code} value={reg.name || reg.regionName}>
                    {reg.name || reg.regionName}{' '}
                    {reg.regionName &&
                      reg.regionName !== reg.name &&
                      `(${reg.regionName})`}
                  </option>
                ))}
              </select>
            </div>
            <div className='input-group'>
              <label>Province</label>
              <select
                name='province'
                onChange={handleStaffFormChange}
                className='input-md'
                value={staffForm.province}
                disabled={
                  !!currentUser?.province ||
                  (!provinces.length && !currentUser?.province)
                }
              >
                <option value='' disabled>
                  Select Province
                </option>
                {!!currentUser?.province &&
                  !provinces.some((p) => p.name === currentUser.province) && (
                    <option value={currentUser.province}>
                      {currentUser.province}
                    </option>
                  )}
                {provinces.map((prov) => (
                  <option key={prov.code} value={prov.name}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='input-group'>
              <label>City/Municipality</label>
              <select
                name='city'
                onChange={handleStaffFormChange}
                className='input-md'
                value={staffForm.city}
                disabled={
                  !!currentUser?.city || (!cities.length && !currentUser?.city)
                }
              >
                <option value='' disabled>
                  Select City/Municipality
                </option>
                {!!currentUser?.city &&
                  !cities.some((c) => c.name === currentUser.city) && (
                    <option value={currentUser.city}>{currentUser.city}</option>
                  )}
                {cities.map((city) => (
                  <option key={city.code} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='input-group'>
              <label>Barangay</label>
              <select
                name='barangay'
                onChange={handleStaffFormChange}
                className='input-md'
                value={staffForm.barangay}
                disabled={!barangays.length}
              >
                <option value='' disabled>
                  Select Barangay
                </option>
                {barangays.map((brgy) => (
                  <option key={brgy.code} value={brgy.name}>
                    {brgy.name}
                  </option>
                ))}
              </select>
            </div>
            <div className='input-group'>
              <label>Zip Code (Optional)</label>
              <input
                type='text'
                name='zipCode'
                value={staffForm.zipCode}
                onChange={handleStaffFormChange}
                maxLength='10'
                className='input-md'
              />
            </div>
            <div className='input-group full-width'>
              <label>Address Line 1 (Optional)</label>
              <input
                type='text'
                name='addressLine1'
                value={staffForm.addressLine1}
                onChange={handleStaffFormChange}
                maxLength='100'
                className='input-md'
              />
            </div>
            <div className='input-group full-width'>
              <label>Address Line 2 (Optional)</label>
              <input
                type='text'
                name='addressLine2'
                value={staffForm.addressLine2}
                onChange={handleStaffFormChange}
                maxLength='100'
                className='input-md'
              />
            </div>

            {staffForm.role === 'nurse' && (
              <>
                <div className='input-group'>
                  <label>License Number</label>
                  <input
                    type='text'
                    name='licenseNumber'
                    value={staffForm.licenseNumber}
                    onChange={handleStaffFormChange}
                    className='input-md'
                  />
                </div>
                <div className='input-group'>
                  <label>PRC Expiry Date</label>
                  <input
                    type='date'
                    name='prcExpiryDate'
                    value={staffForm.prcExpiryDate}
                    onChange={handleStaffFormChange}
                    className='input-md'
                  />
                </div>
              </>
            )}
          </div>
          <div className='staff-modal-actions'>
            <button
              className='btn-cancel'
              onClick={() => setShowAddModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className='btn-submit'
              onClick={submitStaffForm}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Staff'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default UserTable;
