import React from 'react';
import { FiEye } from 'react-icons/fi';

const UserTable = ({ users = [], onView, searchBar }) => {
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <>
      <div className="admin-toolbar">
        {searchBar}
      </div>
      
      <table className="admin-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Role</th>
            <th>Email Address</th>
            <th>Mobile Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {safeUsers.length > 0 ? (
            safeUsers.map((user) => {
              const roleStr = String(user.role || user.userType || 'user').toLowerCase().replace('_', ' ');
              let pillClass = 'status-completed'; // patient
              if (roleStr.includes('admin')) pillClass = 'status-processing';
              if (roleStr.includes('nurse')) pillClass = 'status-active';

              return (
                <tr key={user.id || Math.random()}>
                  <td style={{fontWeight: 500}}>{user.firstName} {user.lastName}</td>
                  <td>
                    <span className={`status-pill ${pillClass}`} style={{textTransform: 'capitalize'}}>
                      {roleStr}
                    </span>
                  </td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.mobileNumber || 'N/A'}</td>
                  <td>
                    <button className="view-btn" onClick={() => onView(user)}>
                      <FiEye style={{marginBottom: '-2px'}}/> View
                    </button>
                  </td>
                </tr>
              )
            })
          ) : (
            <tr>
              <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                No users found in this category.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default UserTable;