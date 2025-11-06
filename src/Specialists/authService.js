// Centralized Authentication Service
class AuthService {
  constructor() {
    this.storageKeys = {
      specialists: 'okiedoc_specialists',
      currentUser: 'okiedoc_current_user',
      userType: 'okiedoc_user_type'
    };
    
    // Initialize dummy data
    this.initializeDummySpecialists();
  }

  // Specialist Management
  registerSpecialist(specialistData) {
    try {
      const specialists = this.getAllSpecialists();
      
      // Check if specialist already exists
      const existingSpecialist = specialists.find(
        s => s.email.toLowerCase() === specialistData.email.toLowerCase()
      );
      
      if (existingSpecialist) {
        throw new Error('A specialist with this email already exists');
      }

      const newSpecialist = {
        id: Date.now() + Math.random(),
        ...specialistData,
        registeredAt: new Date().toISOString(),
        isActive: true
      };

      specialists.push(newSpecialist);
      localStorage.setItem(this.storageKeys.specialists, JSON.stringify(specialists));
      
      return {
        success: true,
        specialist: newSpecialist
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  getAllSpecialists() {
    try {
      const specialists = localStorage.getItem(this.storageKeys.specialists);
      return specialists ? JSON.parse(specialists) : [];
    } catch (error) {
      console.error('Error loading specialists:', error);
      return [];
    }
  }

  // Authentication Methods
  loginSpecialist(email, password) {
    try {
      const specialists = this.getAllSpecialists();
      const specialist = specialists.find(
        s => s.email.toLowerCase() === email.toLowerCase() && s.password === password
      );

      if (!specialist) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      if (!specialist.isActive) {
        return {
          success: false,
          error: 'Account is deactivated'
        };
      }

      // Set current user session
      this.setCurrentUser(specialist, 'specialist');
      
      return {
        success: true,
        user: specialist
      };
    } catch (error) {
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  loginUser(email, password) {
    try {
      // Check regular users first
      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      const user = registeredUsers.find(
        u => u.email === email && u.password === password
      );

      if (user) {
        this.setCurrentUser(user, 'patient');
        return {
          success: true,
          user: user,
          userType: 'patient'
        };
      }

      // Check specialist users
      const specialistResult = this.loginSpecialist(email, password);
      if (specialistResult.success) {
        return {
          success: true,
          user: specialistResult.user,
          userType: 'specialist'
        };
      }

      return {
        success: false,
        error: 'Invalid email or password'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Login failed. Please try again.'
      };
    }
  }

  // Session Management
  setCurrentUser(user, userType) {
    localStorage.setItem(this.storageKeys.currentUser, JSON.stringify(user));
    localStorage.setItem(this.storageKeys.userType, userType);
  }

  getCurrentUser() {
    try {
      const user = localStorage.getItem(this.storageKeys.currentUser);
      const userType = localStorage.getItem(this.storageKeys.userType);
      
      if (!user || !userType) {
        return null;
      }

      return {
        user: JSON.parse(user),
        userType: userType
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  isLoggedIn() {
    const currentUser = this.getCurrentUser();
    return currentUser !== null;
  }

  logout() {
    localStorage.removeItem(this.storageKeys.currentUser);
    localStorage.removeItem(this.storageKeys.userType);
  }

  // Route redirection based on user type
  getRedirectPath(userType) {
    const paths = {
      'specialist': '/specialist-dashboard',
      'patient': '/patient-dashboard',
      'nurse': '/nurse-dashboard',
      'admin': '/admin/specialist-dashboard'
    };
    return paths[userType] || '/dashboard';
  }

  // Validation helpers
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePassword(password) {
    return password && password.length >= 6;
  }

  validateSpecialistData(data) {
    const errors = {};

    if (!data.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!data.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!data.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!this.validateEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!data.password) {
      errors.password = 'Password is required';
    } else if (!this.validatePassword(data.password)) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!data.specialty?.trim()) {
      errors.specialty = 'Medical specialty is required';
    }

    if (!data.licenseNumber?.trim()) {
      errors.licenseNumber = 'License number is required';
    }

    if (!data.experience) {
      errors.experience = 'Years of experience is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Initialize dummy data
  initializeDummySpecialists() {
    const existingSpecialists = this.getAllSpecialists();
    if (existingSpecialists.length > 0) {
      return existingSpecialists;
    }

    const dummySpecialists = [
      {
        id: 'dummy-specialist-1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'specialist@okiedocplus.com',
        password: 'specialistOkDoc123',
        specialty: 'Cardiology',
        licenseNumber: 'MD-12345',
        experience: 10,
        phone: '+63 912 345 6789',
        isActive: true,
        registeredAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    localStorage.setItem(this.storageKeys.specialists, JSON.stringify(dummySpecialists));
    return dummySpecialists;
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
