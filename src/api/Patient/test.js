export const dummyPatientCredentials = {
  email: "patient@okiedocplus.com",
  password: "patientOkDoc123",
};

export const dummySpecialists = [
  { id: "spec-01", name: "Dr. Smith", specialty: "Cardiology" },
  { id: "spec-02", name: "Dr. Jones", specialty: "Dermatology" },
  { id: "spec-03", name: "Dr. Strange", specialty: "Neurology" },
  { id: "spec-04", name: "Dr. Quinn", specialty: "Pediatrics" },
  { id: "spec-05", name: "Dr. House", specialty: "Nephrology" },
];

export const patientDummyData = {
  id: "dummy-patient-id-01",
  email: "patient@okiedocplus.com",
  userType: "patient",
  globalId: "PAT-DUMMY-001",
  fullName: "Jane Doe",
  firstName: "Jane",
  lastName: "Doe",
  dateOfBirth: "1990-05-15",
  gender: "Female",
  contactNumber: "123-456-7890",
  address: "123 Health St, Wellness City, 12345",
  appointments: [
    {
      id: "appt-001",
      specialist: "Dr. Smith",
      specialty: "Cardiology",
      date: "2026-03-10",
      time: "10:00",
      status: "Confirmed",
      title: "Cardiology Consultation",
      description: "Follow-up check for heart palpitations.",
    },
    {
      id: "appt-002",
      specialist: "Dr. Jones",
      specialty: "Dermatology",
      date: "2026-03-15",
      time: "14:30",
      status: "Completed",
      title: "Dermatology Check-up",
      description: "Annual skin check.",
    },
    {
      id: "appt-003",
      specialist: "Dr. Strange",
      specialty: "Neurology",
      date: "2026-03-20",
      time: "09:00",
      status: "Active",
      title: "Neurology Consultation",
      description: "Follow-up on previous diagnosis.",
    },
    {
      id: "appt-004",
      specialist: "Dr. Quinn",
      specialty: "Pediatrics",
      date: "2026-03-22",
      time: "11:00",
      status: "For Payment",
      title: "Pediatric Check-up",
      description: "Regular monthly check-up.",
    },
  ],
  medicalRecords: [
    {
      recordId: "rec-001",
      date: "2026-03-15T14:30:00Z",
      specialist: "Dr. Jones",
      diagnosis: "Acne Vulgaris",
      prescription: "Topical Benzoyl Peroxide",
    },
  ],
  chatHistory: [
    {
      ticketId: 'TKT-001',
      with: 'Dr. Christina',
      lastMessage: 'I will ask some supporting details',
      timestamp: '13:12 PM',
    }
  ]
};