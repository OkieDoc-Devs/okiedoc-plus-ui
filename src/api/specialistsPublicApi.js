/**
 * Featured Specialists API
 * This file handles fetching featured specialists data for the carousel
 *
 * replace with your actual API endpoint or implementation
 */

export const fetchFeaturedSpecialists = async (limit = 12) => {
  try {
    // Return dummy data since real endpoint doesn't exist yet
    return [
      { id: 1, name: "Dr. Maria Santos", specialty: "Cardiologist", image: "https://randomuser.me/api/portraits/women/1.jpg" },
      { id: 2, name: "Dr. Juan dela Cruz", specialty: "Dermatologist", image: "https://randomuser.me/api/portraits/men/2.jpg" },
      { id: 3, name: "Dr. Elena Reyes", specialty: "Pediatrician", image: "https://randomuser.me/api/portraits/women/3.jpg" },
      { id: 4, name: "Dr. Roberto Gomez", specialty: "Neurologist", image: "https://randomuser.me/api/portraits/men/4.jpg" },
      { id: 5, name: "Dr. Sarah Johnson", specialty: "General Practitioner", image: "https://randomuser.me/api/portraits/women/5.jpg" },
      { id: 6, name: "Dr. Michael Chen", specialty: "Orthopedic", image: "https://randomuser.me/api/portraits/men/6.jpg" }
    ];
  } catch (error) {
    console.error('Failed to fetch featured specialists:', error);
    return [];
  }
};
