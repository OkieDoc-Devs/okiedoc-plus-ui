import React, { useState } from 'react';
import { sanitizeInput } from '../../Specialists/utils/validationUtils';
import EmptyState from '../Components/EmptyState';
import './UserTable.css';

const ReadOnlyRow = ({ user, onView, onEdit, onDelete }) => {
  return (
    <tr>
      <td style={{ fontWeight: 'bold' }}>{user.patient_number}</td>
      <td>{user.patient_name}</td>
      <td>{user.philhealth_number || 'N/A'}</td>
      <td>{user.date_updated}</td>
      <td className="user-table-actions">
        <button className="action-btn btn-view" onClick={() => onView(user)}>View</button>
        <button className="action-btn btn-edit" onClick={() => onEdit(user)}>Edit</button>
        <button className="action-btn btn-delete" onClick={() => onDelete(user)}>Delete</button>
      </td>
    </tr>
  );
};

const EditableRow = ({ user, editableUserData, onUserDataChange, onSave, onCancel }) => {
  return (
    <tr className="editable-row">
      <td>
        <input
          type="text"
          name="patient_number"
          value={editableUserData.patient_number || ''}
          onChange={onUserDataChange}
          placeholder="Patient Number"
        />
      </td>
      <td>
        <input
          type="text"
          name="patient_name"
          value={editableUserData.patient_name || ''}
          onChange={onUserDataChange}
          placeholder="Patient Name"
        />
      </td>
      <td>
        <input
          type="text"
          name="philhealth_number"
          value={editableUserData.philhealth_number || ''}
          onChange={onUserDataChange}
          placeholder="PhilHealth Number"
        />
      </td>
      <td>
        <input
          type="date"
          name="date_updated"
          value={editableUserData.date_updated || ''}
          onChange={onUserDataChange}
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
    const updatedData = {
        ...editableUserData,
        date_updated: new Date().toISOString().split('T')[0]
    };
    onUpdate(updatedData);
    setEditingRowId(null);
    setEditableUserData(null);
  };

  return (
    <div id="user-management" className="tab-content active">
      <h2>Patient Records</h2>
      <div className="table-wrapper">
        <table className="dashboard-table user-table">
          <thead>
            <tr>
              <th>Patient Number</th>
              <th>Patient Name</th>
              <th>PhilHealth Number</th>
              <th>Date Updated</th>
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
                <td colSpan="5" style={{ padding: 0, border: 'none' }}>
                  <EmptyState 
                    type="users" 
                    message="No Patient Records Found" 
                    subMessage="There are currently no patients with PhilHealth records matching your search criteria."
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