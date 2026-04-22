import React, { useState } from 'react';
import OkieDocLogo from '@/assets/okie-doc-logo.png';
import { Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

interface NavBarProps {
  activeView: 'patient' | 'specialist';
  setActiveView: (view: 'patient' | 'specialist') => void;
}

export function NavBar({ activeView, setActiveView }: NavBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const secondaryBtn =
    activeView === 'patient'
      ? {
        label: 'Register as Patient',
        onClick: () => navigate('/registration'),
      }
      : {
        label: 'Find a Doctor',
        onClick: () => {
          setActiveView('patient');
          navigate('/');
        }
      };

  const primaryBtn =
    activeView === 'patient'
      ? {
        label: 'Join as a Specialist',
        onClick: () => {
          setActiveView('specialist');
          navigate('/');
        },
      }
      : {
        label: 'Register as Specialist',
        onClick: () => navigate('/specialist-registration'),
      };

  return (
    <>
      <nav className='fixed top-0 left-0 right-0 z-40 bg-white flex items-center justify-between shadow 2xl:border-b border-gray-100 h-20 px-4 text-base'>
        <Link to='/'>
          <img
            src={OkieDocLogo}
            alt='OkieDoc Logo'
            className='h-10 xl:h-12 xl:pl-4 2xl:pl-48 transition-all'
          />
        </Link>
        {activeView === 'patient' && (
          <ul className='hidden lg:flex items-center text-base xl:text-base gap-4 xl:gap-8 pl-6 xl:pl-12 '>
            <li className='hover:cursor-pointer hover:text-blue-700 transition-all'>
              <Link to='/search'>Find a Doctor</Link>
            </li>
            <li className='hover:cursor-pointer hover:text-blue-700 transition-all'>
              <a>Services</a>
            </li>
            <li className='hover:cursor-pointer hover:text-blue-700 transition-all'>
              <a>Community</a>
            </li>
            <li className='hover:cursor-pointer hover:text-blue-700 transition-all'>
              <a>For Doctors</a>
            </li>
            <li className='hover:cursor-pointer hover:text-blue-700 transition-all'>
              <a>About</a>
            </li>
          </ul>
        )}

        <div className='hidden lg:flex justify-between text-sm xl:text-base gap-1 xl:gap-2 xl:pr-4 2xl:pr-48'>
          <button
            onClick={() =>
              navigate(activeView === 'patient' ? '/login' : '/specialist-login')
            }
            className='hover:cursor-pointer rounded hover:bg-gray-300 px-4 py-2 transition-all'
          >
            Login
          </button>
          <button
            onClick={secondaryBtn.onClick}
            className='hover:cursor-pointer text-blue-500 hover:text-black border border-blue-500 rounded hover:bg-blue-50 px-4 py-2 transition-all'
          >
            {secondaryBtn.label}
          </button>
          <button
            onClick={primaryBtn.onClick}
            className='hover:cursor-pointer text-white rounded bg-blue-600 hover:bg-blue-700 px-4 py-2 transition-all'
          >
            {primaryBtn.label}
          </button>
        </div>

        <button
          className='lg:hidden'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className='size-6 hover:cursor-pointer' />
        </button>
      </nav>

      {isMobileMenuOpen && (
        <nav className='fixed top-20 left-0 right-0 z-30 p-4 bg-white block w-full text-base border-b border-gray-200 lg:hidden shadow-lg'>
          {activeView === 'patient' && (
            <ul className='flex flex-col rounded-lg gap-3 text-gray-700 py-2'>
              {[
                'Find a Doctor',
                'Services',
                'Community',
                'For Doctors',
                'About',
              ].map((item) => (
                <li key={item} className='hover:cursor-pointer transition-all'>
                  {item === 'Find a Doctor' ? (
                    <Link
                      to='/search'
                      onClick={() => setIsMobileMenuOpen(false)}
                      className='block w-full rounded px-3 py-3 hover:bg-gray-50'
                    >
                      {item}
                    </Link>
                  ) : (
                    <a className='block w-full rounded px-3 py-3 hover:bg-gray-50'>
                      {item}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className='flex flex-col w-full gap-2 mt-2'>
            <button
              onClick={() => {
                navigate(activeView === 'patient' ? '/login' : '/specialist-login');
                setIsMobileMenuOpen(false);
              }}
              className='hover:cursor-pointer rounded-lg border border-gray-200 hover:bg-gray-200 px-4 py-2 transition-all'
            >
              Login
            </button>
            <button
              onClick={() => {
                secondaryBtn.onClick();
                setIsMobileMenuOpen(false);
              }}
              className='hover:cursor-pointer rounded text-blue-500 hover:text-black border border-blue-500 hover:bg-blue-50 px-4 py-2 transition-all'
            >
              {secondaryBtn.label}
            </button>
            <button
              onClick={() => {
                primaryBtn.onClick();
                setIsMobileMenuOpen(false);
              }}
              className='hover:cursor-pointer rounded-lg text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 transition-all'
            >
              {primaryBtn.label}
            </button>
          </div>
        </nav>
      )}
    </>
  );
}