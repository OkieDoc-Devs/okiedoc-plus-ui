/**
 * Featured Specialists API
 * This file handles fetching featured specialists data for the carousel
 *
 * replace with your actual API endpoint or implementation
 */

export const fetchFeaturedSpecialists = async (limit = 12) => {
  try {
    // Replace this with your actual API endpoint
    const response = await fetch(`/api/specialists/featured?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch featured specialists:', error);

    // Return empty array to prevent carousel from breaking
    return [];
  }
};
