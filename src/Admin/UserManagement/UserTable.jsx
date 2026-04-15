import React from 'react';
import { FiEye } from 'react-icons/fi';

const UserTable = ({ users, onView, searchBar }) => {
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
          {users && users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id}>
                <td style={{fontWeight: 500}}>{user.firstName} {user.lastName}</td>
                <td>
                  <span className={`status-pill ${user.role === 'admin' ? 'status-processing' : user.role === 'nurse' ? 'status-active' : 'status-completed'}`}>
                    {(user.role || 'user').replace('_', ' ')}
                  </span>
                </td>
                <td>{user.email}</td>
                <td>{user.mobileNumber || 'N/A'}</td>
                <td>
                  <button className="view-btn" onClick={() => onView(user)}>
                    <FiEye style={{marginBottom: '-2px'}}/> View
                  </button>
                </td>
              </tr>
            ))
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