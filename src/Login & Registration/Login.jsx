import './auth.css';
import { useNavigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import authService from '../Specialists/authService';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login({
        email: formData.email,
        password: formData.password,
        roleMode: 'deny',
        role: 'specialist',
      });

      const role = user.role;
      localStorage.setItem('okiedoc_user_type', role);
      localStorage.setItem('okiedoc_specialist_user', JSON.stringify(user));

      const { getRedirectPathForRole } = await import('../contexts/AuthContext');
      const redirectPath = getRedirectPathForRole(role);
      navigate(redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='login-page-wrapper'>
      <div className='login-container'>
        <div className='header-inside-container'>
          <button
            className='back-btn login-back-btn'
            onClick={() => navigate('/')}
          >
            <span className='material-symbols-outlined'>arrow_back_2</span>
          </button>
          <img src='/okie-doc-logo.png' alt='OkieDoc+' className='logo-image' />
          <div style={{ width: '2.5rem' }}></div>
        </div>

        <>
          <h2 className='login-title'>Sign in</h2>
          <p className='login-subtitle'>
            Welcome back! Please enter your details.
          </p>
          <form className='login-form' onSubmit={handleSubmit}>
            {error && <p className='auth-alert auth-alert--error'>{error}</p>}
            <label className='login-label' htmlFor='email'>
              Email address
            </label>
            <input
              className='login-input'
              id='email'
              type='email'
              placeholder='Enter your email address'
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <label className='login-label'>Password</label>
            <div className='login-password'>
              <input
                className='login-input'
                id='password'
                type='password'
                placeholder='Enter your password'
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <button className='login-btn' type='submit' disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
            <p className='login-text'>
              Don't have an OkieDoc+ account?{' '}
              <a href='/registration'>Register</a>
            </p>
            <p className='specialist-text'>
              Are you a specialist?{' '}
              <a
                href='/specialist-login'
                className='specialist-link'
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/specialist-login');
                }}
              >
                Login Here
              </a>
            </p>
            <p className='specialist-text'>
              Need to register as a specialist?{' '}
              <a
                href='/specialist-registration'
                className='specialist-register-link'
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/specialist-registration');
                }}
              >
                Register as Specialist
              </a>
            </p>
          </form>
        </>
      </div>
    </div>
  );
}
