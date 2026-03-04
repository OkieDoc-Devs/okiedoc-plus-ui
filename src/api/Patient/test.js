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
  emergencyContact: "John Doe",
  emergencyPhone: "098-765-4321",
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

export const dummyConversations = [
  {
    id: "convo-01",
    name: "Dr. Smith",
    avatar: "#", // Placeholder avatar
    isOnline: true,
    timestamp: "10:30 AM",
    lastMessage: "See you then!",
    lastMessageSentByMe: true,
    unreadCount: 0,
    role: "Cardiology",
    otherUserType: "d",
  },
  {
    id: "convo-02",
    name: "Dr. Jones",
    avatar: "#", // Placeholder avatar
    isOnline: false,
    timestamp: "Yesterday",
    lastMessage: "Please upload the results when you can.",
    lastMessageSentByMe: false,
    lastMessageSenderName: "Dr. Jones",
    unreadCount: 2,
    role: "Dermatology",
    otherUserType: "d",
  },
  {
    id: "convo-03",
    name: "Nurse Triage",
    avatar: "#", // Placeholder avatar
    isOnline: true,
    timestamp: "1:15 PM",
    lastMessage: "I'm connecting you with a specialist now.",
    lastMessageSentByMe: false,
    lastMessageSenderName: "Nurse",
    unreadCount: 0,
    role: "Nurse",
    otherUserType: "n",
  },
];

export const dummyMessages = {
  "convo-01": [
    {
      id: "msg-01-01",
      isSent: false,
      sender: "d",
      text: "Hello! Just confirming our appointment for tomorrow at 10:00 AM.",
      timestamp: "10:28 AM",
      avatar: "#",
      senderName: "Dr. Smith",
    },
    {
      id: "msg-01-02",
      isSent: true,
      sender: "p",
      text: "Yes, confirmed. Thank you!",
      timestamp: "10:29 AM",
    },
    {
      id: "msg-01-03",
      isSent: false,
      sender: "d",
      text: "Great. Is there anything you'd like to discuss beforehand?",
      timestamp: "10:29 AM",
      avatar: "#",
      senderName: "Dr. Smith",
    },
    {
      id: "msg-01-04",
      isSent: true,
      sender: "p",
      text: "No, I think I'm all set. See you then!",
      timestamp: "10:30 AM",
    },
  ],
  "convo-02": [
    {
      id: "msg-02-01",
      isSent: false,
      sender: "d",
      text: "Please upload the results when you can.",
      timestamp: "Yesterday",
      avatar: "#",
      senderName: "Dr. Jones",
    },
  ],
  "convo-03": [
     {
      id: "msg-03-01",
      isSent: false,
      sender: "n",
      text: "Hello, thank you for contacting OkieDoc+. How can I help you today?",
      timestamp: "1:10 PM",
      avatar: "#",
      senderName: "Nurse",
    },
    {
      id: "msg-03-02",
      isSent: true,
      sender: "p",
      text: "I'd like to speak with a specialist about a persistent headache.",
      timestamp: "1:12 PM",
    },
    {
      id: "msg-03-03",
      isSent: false,
      sender: "n",
      text: "I'm connecting you with a specialist now.",
      timestamp: "1:15 PM",
      avatar: "#",
      senderName: "Nurse",
    },
  ],
};

export const dummyUsers = [
    ...dummySpecialists.map(s => ({...s, userType: 'd'})),
    { id: "user-nurse-01", name: "Nurse Triage", userType: "n", specialty: "General" },
    { id: "user-admin-01", name: "Admin User", userType: "a", specialty: "System" },
];

export const dummyMedicalRecords = {
  activeDiseases: [
    { id: 1, name: "Hypertension", date: "2022-05-10", description: "Managed with medication", severity: "Moderate", status: "Active" },
    { id: 2, name: "Asthma", date: "2018-03-15", description: "Seasonal flare-ups", severity: "Mild", status: "Active" }
  ],
  pastDiseases: [
    { id: 3, name: "Chickenpox", date: "1995-08-20", description: "Childhood illness", severity: "Mild", status: "Resolved" },
    { id: 4, name: "Acute Bronchitis", date: "2021-11-02", description: "Treated with antibiotics", severity: "Moderate", status: "Resolved" }
  ],
  medications: [
    { id: 5, name: "Lisinopril", description: "10mg", date: "2022-05-11", severity: "Daily" },
    { id: 6, name: "Albuterol Inhaler", description: "90mcg", date: "2018-03-16", severity: "As needed" }
  ],
  surgeries: [
    { id: 7, name: "Appendectomy", date: "2010-11-15", description: "Laparoscopic removal of appendix", severity: "Dr. Surgeon", status: "City Hospital" },
    { id: 8, name: "Tonsillectomy", date: "2005-06-20", description: "Removal of tonsils", severity: "Dr. Specialist", status: "General Hospital" }
  ],
  familyHistory: [
    { id: 9, name: "Diabetes Type 2", severity: "Father", description: "Diagnosed at age 50" },
    { id: 10, name: "Breast Cancer", severity: "Maternal Grandmother", description: "Diagnosed at age 65" }
  ],
  socialHistory: [
    { id: 11, name: "Smoking", description: "Never smoked", date: "2023-01-01" },
    { id: 12, name: "Alcohol", description: "Occasional social drinking", date: "2023-01-01" }
  ],
  allergies: [
    { id: 13, name: "Penicillin", severity: "Severe", description: "Hives and swelling", date: "2005-03-10" }
  ]
};

export const dummyLabResults = [
  {
    id: "lab-001",
    name: "Complete Blood Count (CBC)",
    date: "2023-10-15",
    status: "Available",
    fileUrl: "#",
  },
  {
    id: "lab-002",
    name: "Lipid Profile",
    date: "2023-09-20",
    status: "Available",
    fileUrl: "#",
  },
  {
    id: "lab-003",
    name: "Urinalysis",
    date: "2023-08-05",
    status: "Available",
    fileUrl: "#",
  },
  {
    id: "lab-004",
    name: "X-Ray Chest PA",
    date: "2023-07-12",
    status: "Pending",
    fileUrl: null,
  }
];

export const dummyBillingTickets = [
  {
    id: 'bill-001',
    service: 'Medical Certificate',
    amount: 150.00,
    status: 'For Payment',
  },
  {
    id: 'bill-002',
    service: 'Doctor\'s Note for School',
    amount: 100.00,
    status: 'For Payment',
  },
  {
    id: 'bill-003',
    service: 'Lab Test Interpretation',
    amount: 250.00,
    status: 'Completed',
  },
];

export const dummyConsultationHistory = [
  {
    id: "cons-001",
    ticketNumber: "TKT-2023-001",
    date: "2023-10-01",
    time: "10:00 AM",
    status: "Completed",
    specialist: "Dr. Smith",
    nurse: "Nurse Joy",
    chiefComplaint: "Severe Migraine",
    duration: "45 mins",
    rating: 5,
  },
  {
    id: "cons-002",
    ticketNumber: "TKT-2023-005",
    date: "2023-09-15",
    time: "02:30 PM",
    status: "Completed",
    specialist: "Dr. Jones",
    nurse: "Nurse Jackie",
    chiefComplaint: "Skin Rash",
    duration: "30 mins",
    rating: 4,
  },
];

export const dummyPendingApprovals = [
  {
    id: "req-001",
    doctorName: "Dr. Strange",
    specialty: "Neurology",
    requestDate: "2023-10-20",
  },
];

export const dummyConsultationSummary = {
  medicalTeam: {
    assignedNurse: "Nurse Joy",
    assignedSpecialist: "Dr. Smith",
    specialistSpecialty: "Cardiology",
  },
  chiefComplaint: "Patient reported experiencing palpitations and shortness of breath.",
  status: "Completed",
  medicalRecords: [
    "ECG performed - Normal Sinus Rhythm",
    "Blood Pressure: 130/85",
  ],
  ros: {
    subjective: "Patient denies chest pain but feels 'fluttering' sensation.",
    objective: "Heart rate regular, no murmurs heard.",
    assessment: "Palpitations, likely stress-related.",
    plan: "Monitor symptoms, reduce caffeine intake.",
  },
  medications: [
    { name: "Propranolol", dosage: "10mg", duration: "As needed" },
  ],
  laboratory: [
    { test: "CBC", status: "Completed", result: "Normal" },
    { test: "Thyroid Panel", status: "Pending" },
  ],
  treatmentPlan: [
    "Follow up in 2 weeks if symptoms persist.",
    "Lifestyle modifications: stress management.",
  ],
};