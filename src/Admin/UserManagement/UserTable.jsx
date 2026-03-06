import React, { useState } from 'react';
import { sanitizeInput } from '../../Specialists/utils/validationUtils';
import EmptyState from '../Components/EmptyState';
import Modal from '../Components/Modal';
import './UserTable.css';

const ReadOnlyRow = ({ user, onView, onEdit, onDelete }) => {
  return (
    <tr>
      <td>{user.firstName}</td>
      <td>{user.lastName}</td>
      <td>{user.email}</td>
      <td>{user.mobileNumber}</td>
      <td>{user.subscription}</td>
      <td className="user-table-actions">
        <button className="action-btn btn-view" onClick={() => onView(user)}>View</button>
        <button className="action-btn btn-edit" onClick={() => onEdit(user)}>Edit</button>
        <button className="action-btn btn-delete" onClick={() => onDelete(user)}>Delete</button>
      </td>
    </tr>
  );
};

/**
 * A row component that is editable.
 */
const EditableRow = ({ editableUserData, onUserDataChange, onSave, onCancel }) => {
  return (
    <tr className="editable-row">
      <td>
        <input
          type="text"
          name="firstName"
          value={editableUserData.firstName}
          onChange={onUserDataChange}
          placeholder="First Name"
        />
      </td>
      <td>
        <input
          type="text"
          name="lastName"
          value={editableUserData.lastName}
          onChange={onUserDataChange}
          placeholder="Last Name"
        />
      </td>
      <td>
        <input
          type="email"
          name="email"
          value={editableUserData.email}
          onChange={onUserDataChange}
          placeholder="Email Address"
        />
      </td>
      <td>
        <input
          type="text"
          name="mobileNumber"
          value={editableUserData.mobileNumber}
          onChange={onUserDataChange}
          placeholder="Mobile Number"
        />
      </td>
      <td>
        <input
          type="text"
          name="subscription"
          value={editableUserData.subscription}
          onChange={onUserDataChange}
          placeholder="Subscription"
        />
      </td>
      <td className="user-table-actions">
        <button className="action-btn btn-save" onClick={onSave}>Submit</button>
        <button className="action-btn btn-cancel" onClick={onCancel}>Cancel</button>
      </td>
    </tr>
  );
};

const UserTable = ({ users = [], onUpdate, onView, onDelete, onCreateStaff }) => {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editableUserData, setEditableUserData] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    password: "",
    mobileNumber: "",
    role: "nurse",
    licenseNumber: "",
    prcExpiryDate: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStaffFormChange = (e) => {
    const { name, value } = e.target;
    setStaffForm(prev => ({ ...prev, [name]: value }));
  };

  const submitStaffForm = async () => {
    if (!staffForm.firstName || !staffForm.lastName || !staffForm.email || !staffForm.password || !staffForm.mobileNumber) {
      alert("Please fill all required basic fields.");
      return;
    }
    if (staffForm.role === 'nurse' && (!staffForm.licenseNumber || !staffForm.prcExpiryDate)) {
      alert("Please provide the license details for the nurse.");
      return;
    }
    try {
      setIsSubmitting(true);
      if (onCreateStaff) {
        await onCreateStaff(staffForm);
      }
      setShowAddModal(false);
      setStaffForm({
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        password: "",
        mobileNumber: "",
        role: "nurse",
        licenseNumber: "",
        prcExpiryDate: ""
      });
    } catch (error) {
      alert(error.message || "Failed to create staff.");
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
    setEditableUserData(prevData => ({
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
      <div id="user-management" className="tab-content active">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>User Management (Patients & Nurses)</h2>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Staff
          </button>
        </div>
        <div className="table-wrapper">
          <table className="dashboard-table user-table">
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
                users.map(user => (
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
                  <td colSpan="6" style={{ padding: 0, border: 'none' }}>
                    <EmptyState
                      type="users"
                      message="No Users Found"
                      subMessage="There are currently no registered patients or nurses matching your search criteria."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <Modal title="Create New Staff" onClose={() => setShowAddModal(false)}>
          <div id="modal-body" className="form-grid">
            <div className="input-group full-width">
              <label>Role</label>
              <select name="role" value={staffForm.role} onChange={handleStaffFormChange} className="input-md">
                <option value="nurse">Nurse</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="input-group">
              <label>First Name</label>
              <input type="text" name="firstName" value={staffForm.firstName} onChange={handleStaffFormChange} className="input-md" />
            </div>
            <div className="input-group">
              <label>Last Name</label>
              <input type="text" name="lastName" value={staffForm.lastName} onChange={handleStaffFormChange} className="input-md" />
            </div>
            <div className="input-group">
              <label>Middle Name (Optional)</label>
              <input type="text" name="middleName" value={staffForm.middleName} onChange={handleStaffFormChange} className="input-md" />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" name="email" value={staffForm.email} onChange={handleStaffFormChange} className="input-md" />
            </div>
            <div className="input-group">
              <label>Mobile Number</label>
              <input type="text" name="mobileNumber" value={staffForm.mobileNumber} onChange={handleStaffFormChange} className="input-md" />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" value={staffForm.password} onChange={handleStaffFormChange} className="input-md" />
            </div>
            {staffForm.role === 'nurse' && (
              <>
                <div className="input-group">
                  <label>License Number</label>
                  <input type="text" name="licenseNumber" value={staffForm.licenseNumber} onChange={handleStaffFormChange} className="input-md" />
                </div>
                <div className="input-group">
                  <label>PRC Expiry Date</label>
                  <input type="date" name="prcExpiryDate" value={staffForm.prcExpiryDate} onChange={handleStaffFormChange} className="input-md" />
                </div>
              </>
            )}
          </div>
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button className="action-btn btn-primary" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="action-btn btn-success" onClick={submitStaffForm} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Staff"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default UserTable;