import React from 'react';
import OkieDocLogo from '@/assets/okie-doc-logo.png';
import {
  Phone,
  Mail,
  MapPin,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
} from 'lucide-react';
import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className='bg-footer'>
      <div className='max-w-400 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[3fr_1fr_1fr_1fr] gap-10 px-8 md:px-16 py-16 items-start'>
        <div className='flex flex-col w-full gap-4'>
          <div className='w-32'>
            <img src={OkieDocLogo} alt='OkieDoc Logo' className='' />
          </div>
          <p className='text-gray-400 text-[16px] max-w-sm md:max-w-l leading-relaxed'>
            Your Digital Health Partner. Connecting you with quality healthcare,
            anytime, anywhere.
          </p>
          <div className='flex flex-col gap-3'>
            <span className='text-gray-200 font-light flex items-center gap-2 text-[14px]'>
              <Phone className='size-4 text-blue-500' />
              (02) 8802-5555
            </span>
            <span className='text-gray-200 font-light flex items-center gap-2 text-[14px]'>
              <Mail className='text-blue-500 size-4' /> support@okiedoc.com
            </span>
            <span className='text-gray-200 font-light flex items-center gap-2 text-[14px]'>
              <MapPin className='text-blue-500 size-4' /> Manila, Philippines
            </span>
          </div>
        </div>
        <div className='flex flex-col w-full gap-2 '>
          <p className='font-bold text-white text-lg mb-1'>General</p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            <Link to='/aboutUs'>About Us</Link>
          </p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            How It Works
          </p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            Terms & Conditions
          </p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            Privacy Policy
          </p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            Contact Us
          </p>
        </div>
        <div className='flex flex-col w-full gap-3'>
          <p className='font-bold text-white text-lg mb-1'>For Doctors</p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            Apply as Specialist
          </p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            Request Demo
          </p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            Doctor Login
          </p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            Benefits
          </p>
        </div>
        <div className='flex flex-col w-full gap-3'>
          <p className='font-bold text-white text-lg mb-1'>For Patients</p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            Find a Doctor
          </p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            Services
          </p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            Patient Login
          </p>
          <p className='text-gray-300 text-[14px] hover:text-blue-600 transition-colors cursor-pointer'>
            Register
          </p>
        </div>
      </div>

      <div className='max-w-400 mx-auto border-t border-slate-800 px-8 md:px-16 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-gray-400 text-sm'>
          &copy; 2026 OkieDoc+. All rights reserved.
        </p>
        <div className='flex items-center gap-3'>
          <a
            href='https://www.facebook.com/share/1KzqWD82pz/'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='OkieDoc on Facebook'
            className='size-10 rounded-full bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700 hover:cursor-pointer transition-colors flex items-center justify-center'
          >
            <FacebookIcon className='size-4' />
          </a>
          <a
            href='#'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='OkieDoc on Instagram'
            className='size-10 rounded-full bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700 hover:cursor-pointer transition-colors flex items-center justify-center'
          >
            <InstagramIcon className='size-4' />
          </a>
          <a
            href='https://www.linkedin.com/company/okiedocplus/'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='OkieDoc on LinkedIn'
            className='size-10 rounded-full bg-slate-800 text-gray-300 hover:text-white hover:bg-slate-700 hover:cursor-pointer transition-colors flex items-center justify-center'
          >
            <LinkedinIcon className='size-4' />
          </a>
        </div>
      </div>
    </footer>
  );
}
