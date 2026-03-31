/**
 * Featured Specialists API
 * This file handles fetching featured specialists data for the carousel
 */

export const fetchFeaturedSpecialists = async (limit = 12) => {
  try {
    // Use the actual admin specialists endpoint
    const response = await fetch('/api/v1/admin/specialists');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle both array and object responses
    const specialists = Array.isArray(data) 
      ? data 
      : data?.specialists || data?.data || [];
    
    // Return limited list of featured specialists
    return specialists.slice(0, limit).map((specialist) => ({
      id: specialist.id,
      firstName: specialist.firstName,
      lastName: specialist.lastName,
      specialization: specialist.specialization,
      profileImage: specialist.profileImage || specialist.profileUrl,
      email: specialist.email,
      status: specialist.status || specialist.applicationStatus,
    }));
  } catch (error) {
    console.error('Failed to fetch featured specialists:', error);

    // Return empty array to prevent carousel from breaking
    return [];
  }
};
