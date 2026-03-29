import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaGoogle,
  FaFacebookF,
} from 'react-icons/fa';
import './SpecialistAuth.css';
import { useAuth } from '../contexts/AuthContext';

const SpecialistLogin = () => {
  const navigate = useNavigate();
  const { login: contextLogin, isAuthenticated, user, getRedirectPathForRole } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'specialist') {
      navigate(getRedirectPathForRole('specialist'));
    }
  }, [isAuthenticated, user, navigate, getRedirectPathForRole]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email.trim() || !password) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const loggedInUser = await contextLogin({
        email: email.trim(),
        password: password,
        roleMode: 'allow',
        role: 'specialist',
      });

      if (loggedInUser) {
        alert(
          'Welcome, Dr. ' +
            (loggedInUser.lastName || loggedInUser.firstName || '') +
            ' 👋',
        );
        navigate(getRedirectPathForRole('specialist') || '/specialist-dashboard');
      }
    } catch (error) {
      alert(error.message || 'An error occurred during login. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      alert('Please fill in all fields.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      alert('Please enter a valid email.');
      return;
    }

    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      alert(
        'Registration successful! Redirecting to login so you can use your mock QA credentials.',
      );
      setIsSignUp(false);
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (error) {
      alert('An error occurred during registration.');
      console.error(error);
    }
  };

  return (
    <div className='specialist-auth-body'>
      <div className='login-container'>
        {!isSignUp ? (
          <div id='signinView'>
            <h1 className='form-title'>Okiedoc+ Specialist Login</h1>
            <form onSubmit={handleLogin}>
              <div className='login-input-group'>
                <FaEnvelope />
                <input
                  type='email'
                  name='email'
                  placeholder='Email'
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='login-input-group'>
                <FaLock />
                <input
                  type='password'
                  name='password'
                  placeholder='Password'
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type='submit' className='btn'>
                Sign In
              </button>
            </form>
            <button className='social-btn google-btn'>
              <FaGoogle /> Sign in with Google
            </button>
            <button className='social-btn fb-btn'>
              <FaFacebookF /> Sign in with Facebook
            </button>
            <div className='links'>
              <p>
                Don't have an account?{' '}
                <button type='button' onClick={() => setIsSignUp(true)}>
                  Sign Up
                </button>
              </p>
            </div>
            <div className='other-login-link'>
              <p>
                Patient or Nurse?{' '}
                <button type='button' onClick={() => navigate('/login')}>
                  Login Here
                </button>
              </p>
            </div>
          </div>
        ) : (
          // Sign Up Form
          <div id='signupView'>
            <h1 className='form-title'>Create your account</h1>
            <form onSubmit={handleSignUp}>
              <div className='login-input-group'>
                <FaUser />
                <input
                  type='text'
                  name='firstName'
                  placeholder='First name'
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='login-input-group'>
                <FaUser />
                <input
                  type='text'
                  name='lastName'
                  placeholder='Last name'
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='login-input-group'>
                <FaEnvelope />
                <input
                  type='email'
                  name='email'
                  placeholder='Email'
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='login-input-group'>
                <FaLock />
                <input
                  type='password'
                  name='password'
                  placeholder='Password (min 3 chars)'
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className='login-input-group'>
                <FaLock />
                <input
                  type='password'
                  name='confirmPassword'
                  placeholder='Confirm password'
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type='submit' className='btn'>
                Create Account
              </button>
            </form>
            <div className='links'>
              <p>
                Already have an account?{' '}
                <button type='button' onClick={() => setIsSignUp(false)}>
                  Back to Sign In
                </button>
              </p>
            </div>
            <div className='other-login-link'>
              <p>
                Patient or Nurse?{' '}
                <button type='button' onClick={() => navigate('/login')}>
                  Login Here
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialistLogin;
