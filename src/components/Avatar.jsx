import React from 'react';
import './Avatar.css';
import { API_BASE_URL } from '../api/apiClient';

/**
 * Avatar component that displays either a profile image or user initials in a colored circle
 * 
 * @param {Object} props
 * @param {string} props.profileImageUrl - URL to the profile image (can be relative or absolute)
 * @param {string} props.firstName - User's first name (required for generating initials)
 * @param {string} props.lastName - User's last name (required for generating initials)
 * @param {string} props.userType - User type: 'patient', 'nurse', 'nurse_admin', 'specialist', 'admin'
 * @param {number|string} props.size - Size in pixels (default: 80)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.alt - Alt text for the image
 */
const Avatar = ({
  profileImageUrl,
  firstName = '',
  lastName = '',
  userType = 'patient',
  size = 80,
  className = '',
  alt = 'User Avatar',
}) => {
  // Generate initials from first and last name
  const generateInitials = () => {
    const firstInitial = firstName.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName.charAt(0)?.toUpperCase() || '';
    return (firstInitial + lastInitial) || 'U';
  };

  // Get color based on user type
  const getColorByUserType = (type) => {
    const colorMap = {
      patient: '#add8e6',
      nurse: '#4169e1',
      nurse_admin: '#00bfff',
      nurseadmin: '#00bfff',
      na: '#00bfff',
      specialist: '#126180',
      admin: '#324ab2', // align admin with existing Specialist color styling
    };
    return colorMap[type?.toLowerCase()] || colorMap.patient;
  };

  // Resolve the image URL (handle relative and absolute paths)
  const resolveImageUrl = () => {
    if (!profileImageUrl) return null;
    if (profileImageUrl.startsWith('http')) return profileImageUrl;
    if (profileImageUrl.startsWith('data:')) return profileImageUrl;
    return `${API_BASE_URL}${profileImageUrl}`;
  };

  const imageUrl = resolveImageUrl();
  const initials = generateInitials();
  const backgroundColor = getColorByUserType(userType);
  const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size;

  // If profile image exists, show it
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={`app-avatar app-avatar-image ${className}`.trim()}
        style={{
          width: `${sizeNum}px`,
          height: `${sizeNum}px`,
        }}
      />
    );
  }

  // Otherwise, show initials in a colored circle
  const fontSize = sizeNum * 0.5; // Proportional font size + bigger as per UI sample

  return (
    <div
      className={`app-avatar app-avatar-initials ${className}`.trim()}
      style={{
        width: `${sizeNum}px`,
        height: `${sizeNum}px`,
        backgroundColor,
        fontSize: `${fontSize}px`,
      }}
      title={`${firstName} ${lastName}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
