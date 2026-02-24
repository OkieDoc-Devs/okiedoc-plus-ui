import { http, HttpResponse } from 'msw'

// Dummy accounts for testing
const accounts = [
    {
        "id": 1,
        "fullName": "Sarah Lee",
        "email": "admin@okiedoc.com",
        "password": "qaPassword123",
        "role": "admin",
        "userType": "admin",
        "profile": {
            "mobileNumber": "09170001111",
            "department": "Administration HQ"
        }
    },
    {
        "id": 2,
        "fullName": "Maria Santos",
        "email": "nurse1@okiedoc.com",
        "password": "qaPassword123",
        "role": "nurse",
        "userType": "nurse",
        "profile": {
            "mobileNumber": "09170002222",
            "licenseNumber": "NURSE-9912",
            "prcExpiryDate": "2027-01-01"
        }
    },
    {
        "id": 3,
        "fullName": "Dr. Emily Smith",
        "email": "drsmith@okiedoc.com",
        "password": "qaPassword123",
        "role": "specialist",
        "userType": "specialist",
        "profile": {
            "mobileNumber": "09170003333",
            "licenseNumber": "MD-334455",
            "primarySpecialty": "Neurology",
            "subSpecialties": "Surgery",
            "bio": "Expert in neurological disorders with 10 years experience.",
            "feeInitialWithoutCert": 800,
            "feeInitialWithCert": 1000
        }
    },
    {
        "id": 4,
        "fullName": "Dr. Gregory House",
        "email": "drhouse@okiedoc.com",
        "password": "qaPassword123",
        "role": "specialist",
        "userType": "specialist",
        "profile": {
            "mobileNumber": "09170004444",
            "licenseNumber": "MD-998877",
            "primarySpecialty": "Diagnostic Medicine",
            "bio": "It's never lupus."
        }
    },
    {
        "id": 5,
        "fullName": "Michael Smith",
        "email": "patient1@example.com",
        "password": "qaPassword123",
        "role": "patient",
        "userType": "patient",
        "profile": {
            "mobileNumber": "09170005555",
            "gender": "Male",
            "dateOfBirth": "1992-08-10",
            "bloodType": "O+",
            "allergies": "Penicillin",
            "hmoCompany": "Maxicare",
            "hmoMemberId": "MAX-12345"
        },
        "dummyData": {
            "activeTickets": [
                {
                    "ticketNumber": "OD-20231101-ABCD",
                    "chiefComplaint": "Persistent back pain",
                    "status": "processing"
                }
            ]
        }
    }
]

export const handlers = [
    http.post('http://localhost:1337/api/v1/auth/login', async ({ request }) => {
        const { email, password } = await request.json()

        console.log('[MSW] Login attempt:', email, password)

        const user = accounts.find((user) => user.email === email && user.password === password)

        if (!user) {
            return HttpResponse.json(
                {
                    code: 'badCombo',
                    message: 'Invalid email or password.',
                    statusCode: 401,
                },
                { status: 401 }
            )
        }

        // Set a dummy session token
        sessionStorage.setItem('session_user', JSON.stringify(user))

        return HttpResponse.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                fullName: user.fullName,
                role: user.role,
                userType: user.userType,
            },
        })
    }),

    http.get('http://localhost:1337/api/v1/auth/me', () => {
        const sessionStr = sessionStorage.getItem('session_user')
        console.log('[MSW] Auth check:', sessionStr)

        if (!sessionStr) {
            return HttpResponse.json(
                {
                    statusCode: 401,
                    code: 'E_UNAUTHORIZED',
                    error: 'You are not permitted to perform this action.',
                },
                { status: 401 }
            )
        }

        const user = JSON.parse(sessionStr)

        return HttpResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
            },
        })
    }),

    http.post('http://localhost:1337/api/v1/auth/logout', () => {
        sessionStorage.removeItem('session_user')

        return HttpResponse.json({
            success: true,
            message: 'Logged out successfully',
        })
    }),

    // Nurse Endpoints
    http.get('http://localhost:1337/api/v1/nurse/profile', () => {
        const sessionStr = sessionStorage.getItem('session_user')
        if (!sessionStr) return HttpResponse.json({ success: false }, { status: 401 })

        const user = JSON.parse(sessionStr)
        return HttpResponse.json({
            success: true,
            data: {
                id: user.id,
                firstName: user.fullName.split(' ')[0],
                lastName: user.fullName.split(' ')[1] || '',
                email: user.email,
                mobileNumber: user.profile?.mobileNumber,
                licenseNumber: user.profile?.licenseNumber
            }
        })
    }),

    http.get('http://localhost:1337/api/v1/nurse/dashboard', () => {
        const sessionStr = sessionStorage.getItem('session_user')
        if (!sessionStr) return HttpResponse.json({ success: false }, { status: 401 })

        const user = JSON.parse(sessionStr)
        return HttpResponse.json({
            success: true,
            data: {
                nurse: {
                    First_Name: user.fullName.split(' ')[0],
                    Profile_Image_Data_URL: null
                },
                tickets: [
                    {
                        id: 101,
                        patientName: "Michael Torres",
                        patientBirthdate: "1992-08-10",
                        email: "patient1@example.com",
                        mobile: "09170005555",
                        assignedNurse: user.fullName,
                        chiefComplaint: "Persistent back pain",
                        status: "Processing",
                        createdAt: new Date().toISOString()
                    }
                ],
                notifications: [
                    { id: 1, message: "New ticket assigned", unread: true }
                ]
            }
        })
    }),

    // Tickets Endpoints
    http.get('http://localhost:1337/api/v1/tickets/unclaimed', () => {
        const sessionStr = sessionStorage.getItem('session_user')
        if (!sessionStr) return HttpResponse.json({ success: false }, { status: 401 })

        return HttpResponse.json([
            {
                id: 123,
                ticketNumber: "OD-20231101-ABCD",
                patientName: "John Patient",
                chiefComplaint: "High Fever",
                consultationChannel: "chat",
                status: "unclaimed"
            }
        ])
    }),

    http.post('http://localhost:1337/api/v1/tickets/create', async ({ request }) => {
        const sessionStr = sessionStorage.getItem('session_user')
        if (!sessionStr) return HttpResponse.json({ success: false }, { status: 401 })

        const data = await request.json()

        return HttpResponse.json({
            message: "Your appointment is being processed. Nurses will review your details shortly.",
            ticketNumber: `OD-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-ABCD`
        })
    }),

    // Specialist Endpoints
    http.get('http://localhost:1337/api/v1/specialist/view-available', () => {
        const sessionStr = sessionStorage.getItem('session_user')
        if (!sessionStr) return HttpResponse.json({ success: false }, { status: 401 })

        // Mock available tickets for specialist
        return HttpResponse.json([
            {
                id: 124,
                ticketNumber: "OD-20231102-WXYZ",
                patientName: "Jane Doe",
                chiefComplaint: "Migraine",
                consultationChannel: "video",
                status: "processing", // Triaged by nurse, waiting for specialist
                targetSpecialty: "Neurology",
                urgency: "medium"
            }
        ])
    }),

    // Admin Endpoints
    http.get('http://localhost:1337/api/v1/admin/view-pending', () => {
        const sessionStr = sessionStorage.getItem('session_user')
        if (!sessionStr) return HttpResponse.json({ success: false }, { status: 401 })

        return HttpResponse.json([
            {
                id: 6,
                user: {
                    fullName: "Dr. Pending Doc",
                    email: "pending@example.com"
                },
                applicationStatus: "pending"
            }
        ])
    })
]
