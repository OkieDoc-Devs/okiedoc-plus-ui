import React, { useState } from 'react';
import { sanitizeInput } from '../../Specialists/utils/validationUtils';
import EmptyState from '../Components/EmptyState';
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
const EditableRow = ({ user, editableUserData, onUserDataChange, onSave, onCancel }) => {
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

const UserTable = ({ users = [], onUpdate, onView, onDelete }) => {
  const [editingRowId, setEditingRowId] = useState(null);
  const [editableUserData, setEditableUserData] = useState(null);

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
    <div id="user-management" className="tab-content active">
      <h2>User Management (Patients & Nurses)</h2>
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
                      user={user}
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
  );
};

export default UserTable;