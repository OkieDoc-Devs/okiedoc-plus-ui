import './index.css';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  MessageSquare,
  Phone,
  Shield,
  Video,
  UserIcon,
  Mail,
  MoveRightIcon,
  Award,
  Search,
  Users,
  UserCheck,
  Pill,
  Activity,
  Stethoscope,
  CalendarDays,
  FolderOpen,
  ChartColumnIncreasing,
  Calendar,
  TrendingUp,
  Clock,
  CreditCard,
} from 'lucide-react';
import AboutUsImage from './assets/aboutUs-image.jpg';
import Pharmacy from './assets/pharmacy.jpg';
import PhysicalTherapy from './assets/physicalTherapy.jpg';
import patientDoctor from './assets/patientDoctor.jpg';
import nursePatient from './assets/nursePatient.jpg';
import doctorConsultation from './assets/doctorConsultation.jpg';
import emrPicture from './assets/emrPicture.jpg';
import { useNavigate } from 'react-router';
import { StepsCard } from './components/ui/stepsCard';
import { ServiceCard } from './components/ui/serviceCard';

type CallbackRequestProps = {
  isOpen: boolean;
  onClose: () => void;
};

function CallbackRequest({ isOpen, onClose }: CallbackRequestProps) {
  const MAX_CHARS = 250;
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOverlayClick = () => {
    // Mobile: close only through Cancel button. Desktop/tablet: allow backdrop close.
    if (window.matchMedia('(min-width: 768px)').matches) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (
      !fullName.trim() ||
      !email.trim() ||
      !contactNumber.trim() ||
      !message.trim()
    ) {
      setErrorMessage('All fields are required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    // Filipino phone number validation
    const phoneRegex = /^(\+63|09)\d{9,10}$/;
    if (!phoneRegex.test(contactNumber.trim())) {
      setErrorMessage('Please enter a valid Filipino phone number (+63 or 09)');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/api/callback-requests', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          contactNumber: contactNumber.trim(),
          contactMethod: 'phone',
          message: message.trim(),
        }),
      });

      if (response?.success) {
        setSuccessMessage('Callback request submitted successfully!');
        setTimeout(() => {
          setFullName('');
          setEmail('');
          setContactNumber('');
          setMessage('');
          setSuccessMessage('');
          onClose();
        }, 2000);
      } else {
        setErrorMessage(
          response?.message || 'Failed to submit callback request',
        );
      }
    } catch (error) {
      console.error('Error submitting callback request:', error);
      setErrorMessage('Failed to submit callback request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const sanitized = textarea.value
      .replace(/<[^>]*>/g, '')
      .replace(/[<>'"]/g, '')
      .slice(0, MAX_CHARS);

    setMessage(sanitized);

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0  bg-gray-500/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:w-full'
      onClick={handleOverlayClick}
    >
      <div
        className='w-full max-w-xl rounded-lg  bg-white p-8 border border-gray-400'
        onClick={(event) => event.stopPropagation()}
      >
        <div className='flex justify-center items-center flex-col gap-2'>
          <div className='bg-green-100 size-10 rounded-full flex items-center justify-center shrink-0'>
            <MessageSquare className='size-6 text-green-600' />
          </div>
          <h1 className='font-bold text-2xl '>Request a Callback</h1>
          <p className='font-light text-gray-600 text-center'>
            Our medical team will contact you to discuss your health concerns
          </p>
        </div>

        {errorMessage && (
          <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-red-700 text-sm'>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
            <p className='text-green-700 text-sm'>{successMessage}</p>
          </div>
        )}

        <div className='p-2 flex flex-col gap-4 '>
          <div>
            <span className='font-semibold text-sm'>Full Name*</span>
            <div className='flex items-center relative'>
              <div className='absolute flex pl-2 items-center pointer-events-none'>
                <UserIcon className='text-gray-500' />
              </div>
              <input
                type='text'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                placeholder='Juan Dela Cruz'
                className='w-full rounded-lg bg-gray-100 p-2 pl-10 placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50'
              />
            </div>
          </div>
          <div>
            <span className='font-semibold text-sm'>Email Address *</span>
            <div className='flex items-center relative'>
              <div className='absolute flex pl-3 items-center pointer-events-none'>
                <Mail className='text-gray-500 size-5' />
              </div>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder='juan@example.com'
                className='w-full rounded-lg bg-gray-100 p-2 pl-10 placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50'
              />
            </div>
          </div>
          <div>
            <span className='font-semibold text-sm'>Contact Number *</span>
            <div className='flex items-center relative'>
              <div className='absolute flex pl-3 items-center pointer-events-none'>
                <Phone className='text-gray-500 size-5' />
              </div>
              <input
                type='tel'
                value={contactNumber}
                onChange={(e) => {
                  let value = e.target.value.trim();

                  // Remove all non-digits except the initial + sign
                  if (value.startsWith('+')) {
                    value = '+' + value.substring(1).replace(/\D/g, '');
                  } else {
                    value = value.replace(/\D/g, '');
                  }

                  // Auto-add + if user types 63 at the start
                  if (value.startsWith('63') && !value.startsWith('+')) {
                    value = '+' + value;
                  }

                  // Enforce length limits
                  if (value.startsWith('+63') && value.length > 13) {
                    return;
                  }
                  if (value.startsWith('09') && value.length > 11) {
                    return;
                  }

                  setContactNumber(value);
                }}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (
                    ![
                      '0',
                      '1',
                      '2',
                      '3',
                      '4',
                      '5',
                      '6',
                      '7',
                      '8',
                      '9',
                      '+',
                      'Backspace',
                      'Delete',
                      'ArrowLeft',
                      'ArrowRight',
                      'Tab',
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                placeholder='+63 or 09 followed by numbers'
                className='w-full rounded-lg bg-gray-100 p-2 pl-10 placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50'
              />
            </div>
          </div>
          <div>
            <span className='font-semibold text-sm'>
              Health Concern / Message *
            </span>
            <div className='relative'>
              <textarea
                value={message}
                onChange={handleMessageChange}
                disabled={isLoading}
                placeholder='Please describe your symptoms or health concerns...'
                rows={4}
                className='w-full rounded-lg bg-gray-100 p-2 pl-4 placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none overflow-hidden disabled:opacity-50'
              />
              <span
                className={`text-xs absolute bottom-2 right-3 ${message.length >= MAX_CHARS ? 'text-red-400' : 'text-gray-400'}`}
              >
                {message.length}/{MAX_CHARS}
              </span>
            </div>
          </div>
          <div className='p-2 border border-green-400 rounded-lg bg-green-50 '>
            <div className='p-3 flex flex-col gap-0.5'>
              <span className='font-semibold text-green-900'>
                What to expect:
              </span>
              <p className='text-green-700 text-[15px]'>
                • Response within 24 hours
              </p>
              <p className='text-green-700 text-[15px]'>
                • Free nurse triage consultation
              </p>
              <p className='text-green-700 text-[15px]'>
                • Matched with appropriate specialist
              </p>
              <p className='text-green-700 text-[15px]'>
                • Flexible scheduling options
              </p>
            </div>
          </div>
          <div className='flex items-center justify-center gap-2'>
            <button
              className='bg-white w-full rounded-lg p-2 border border-gray-200 hover:cursor-pointer hover:bg-gray-200 transition-all disabled:opacity-50'
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className='bg-blue-400 text-white w-full rounded-lg hover:bg-blue-600 p-2 transition-all hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorView() {
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const navigate = useNavigate();

  const steps = [
    {
      step: 1,
      title: 'Search or Describe Symptoms',
      description:
        'Tell us what you need or browse our specialists by category.',
      icon: Search,
      iconBgClassName: 'bg-blue-500',
    },
    {
      step: 2,
      title: 'Nurse Triage (AI + Human)',
      description:
        'Our AI-assisted nurse triage system helps assess your needs quickly.',
      icon: Users,
      iconBgClassName: 'bg-purple-500',
    },
    {
      step: 3,
      title: 'Choose Doctor',
      description:
        'Select from General Practitioners or Specialists based on your needs.',
      icon: UserCheck,
      iconBgClassName: 'bg-green-500',
    },
    {
      step: 4,
      title: 'Consultation',
      description:
        'Connect via video call or chat for a convenient consultation.',
      icon: Video,
      iconBgClassName: 'bg-orange-500',
    },
    {
      step: 5,
      title: 'Prescription + Pharmacy',
      description:
        'Get your prescription and order directly from partner pharmacies.',
      icon: Pill,
      iconBgClassName: 'bg-red-500',
    },
    {
      step: 6,
      title: 'Follow-up Care',
      description:
        'Schedule physical therapy or follow-up appointments as needed.',
      icon: Activity,
      iconBgClassName: 'bg-teal-500',
    },
  ];

  const services = [
    {
      title: 'General Consultation',
      description:
        'Connect with licensed general practitioners for common health concerns and medical advice.',
      icon: Stethoscope,
      imageUrl: doctorConsultation,
    },
    {
      title: 'Specialist Booking',
      description:
        'Book appointments with specialists in cardiology, dermatology, psychiatry, and more.',
      icon: Users,
      imageUrl: patientDoctor,
    },
    {
      title: 'Pharmacy Delivery / Pickup',
      description:
        'Get your prescriptions filled and delivered to your door or pick up from partner pharmacies.',
      icon: Pill,
      imageUrl: Pharmacy,
    },
    {
      title: 'Physical Therapy Services',
      description:
        'Access licensed physical therapists for rehabilitation and recovery programs.',
      icon: Activity,
      imageUrl: PhysicalTherapy,
    },
    {
      title: 'Follow-up Care with Nurses',
      description:
        'Schedule follow-up consultations with our nursing team for continued care and monitoring.',
      icon: CalendarDays,
      imageUrl: nursePatient,
    },
    {
      title: 'Electronic Medical Records',
      description:
        'Seamless EMR integration with LGU and iClinicSys for complete health record management.',
      icon: FolderOpen,
      imageUrl: emrPicture,
    },
  ];

  return (
    <div>
      {/*Info-1*/}
      <div className='bg-linear-to-b from-blue-50 to-white py-10'>
        <div className='flex flex-row justify-center p-4 md:pt-6 gap-12 pb-22'>
          <div className='flex-1 max-w-3xl'>
            <div className='flex flex-col items-center justify-center text-center w-full pt-10 md:pt-20 pb-8 lg:items-start lg:text-left'>
              <div className='w-full flex-1 pl-2'>
                <div className='text-4xl md:text-6xl text-left font-extrabold'>
                  <p className='text-gray-900'>
                    Find and Book Trusted{' '}
                    <span className='text-blue-600'>Medical Specialists</span>{' '}
                    Anytime, Anywhere
                  </p>
                </div>
                <p className='pt-4 text-lg md:text-xl text-left font-normal text-gray-600'>
                  Connect instantly with licensed doctors, therapists, and
                  healthcare professionals
                </p>
              </div>
            </div>
            <div className='flex flex-col md:flex-row w-full md:w-120 gap-4'>
              <button
                onClick={() => navigate('/registration')}
                className=' group flex items-center font-semibold justify-center gap-2 flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all cursor-pointer'
              >
                Consult Now
                <MoveRightIcon className='size-4 transition-transform duration-200 group-hover:translate-x-1' />
              </button>
              <button
                className='flex items-center justify-center gap-2 flex-1 py-3 px-4 bg-white border border-gray-700 text-black hover:bg-gray-100 hover:text-gray-800 rounded-xl transition-all cursor-pointer'
                onClick={() => setIsCallbackModalOpen(true)}
              >
                <MessageSquare className='size-4' />
                Request Callback
              </button>
              <CallbackRequest
                isOpen={isCallbackModalOpen}
                onClose={() => setIsCallbackModalOpen(false)}
              />
            </div>
            <div className='mt-5'>
              <div className='grid grid-cols-2 sm:flex md:gap-18  sm:items-center gap-4 p-2'>
                <div className='flex items-center gap-2'>
                  <div className='bg-sky-200 size-10 rounded-full flex items-center justify-center shrink-0'>
                    <Shield className='text-sky-700 size-4 sm:size-5' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-semibold text-xs sm:text-sm'>
                      PhilHealth-ready
                    </span>
                    <span className='text-xs sm:text-sm'>Integrated</span>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <div className='bg-green-200 size-10 rounded-full flex items-center justify-center shrink-0'>
                    <Award className='text-green-700 size-4 sm:size-5' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-semibold text-xs sm:text-sm'>
                      Licensed Doctors
                    </span>
                    <span className='text-xs sm:text-sm'>Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='hidden xl:flex mp-4 mt-8 shrink-0 transition-all'>
            <img
              src={AboutUsImage}
              alt='Doctor talking to patient'
              className='rounded-xl object-cover shadow-xl w-150 2xl:w-170 2xl:h-120  saturate-120'
            />
          </div>
        </div>
      </div>

      {/*Info-2*/}
      <section className='py-15 px-6 bg-white'>
        <div className='max-w-7xl mx-auto text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            How It Works
          </h2>
          <p className='text-gray-600 text-base md:text-lg'>
            Getting the care you need is simple and straightforward with
            OkieDoc+
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 md:px-12 lg:px-48'>
          {steps.map((step) => (
            <StepsCard
              key={step.step}
              step={step.step}
              title={step.title}
              description={step.description}
              icon={step.icon}
              iconBgClassName={step.iconBgClassName}
            />
          ))}
        </div>
      </section>

      {/*Our Services*/}
      <section className='py-15 px-6 bg-white'>
        <div className='max-w-7xl mx-auto text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            Our Services
          </h2>
          <p className='text-gray-600 text-base md:text-lg'>
            Comprehensive healthcare solutions designed for your convenience
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 px-2 md:px-12 lg:px-32'>
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              icon={service.icon}
              imageUrl={service.imageUrl}
              onClick={() => console.log(`Clicked: ${service.title}`)}
            />
          ))}
        </div>
      </section>

      {/*Apply Now*/}
      <section className='py-20 px-4 bg-linear-to-b from-blue-600 to-blue-800'>
        <div className='flex-col lg:flex lg:flex-row items-center xl:px-20'>
          <div className='flex justify-center items-center w-full p-12'>
            <div className='flex flex-col gap-6'>
              <h2 className='text-4xl md:text-[52px] md:w-150 font-extrabold text-white'>
                Join OkieDoc+ as a Healthcare Provider
              </h2>
              <p className='text-gray-200 text-lg w-110 md:w-full md:text-lg'>
                Be part of a growing network of healthcare professionals
                delivering quality care to patients nationwide.
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                {[
                  {
                    icon: Users,
                    title: 'Get More Patients',
                    desc: 'Expand your reach and connect with patients across the country.',
                  },
                  {
                    icon: Clock,
                    title: 'Flexible Schedule',
                    desc: 'Choose your availability and work on your own terms.',
                  },
                  {
                    icon: TrendingUp,
                    title: 'Grow Your Practice',
                    desc: 'Build your reputation and grow your professional network.',
                  },
                  {
                    icon: CreditCard,
                    title: 'Secure Payments',
                    desc: 'Get paid quickly and securely through our integrated system.',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className='flex gap-4'>
                    <div className='bg-white/15 rounded-xl p-2 items-center h-fit w-fit'>
                      <Icon className='text-white size-8 p-1' />
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-white font-semibold text-[18px]'>
                        {title}
                      </span>
                      <span className='text-gray-200 text-[14px]'>{desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/specialist-registration')}
                className='group gap-2 w-fit hover:cursor-pointer transition-all bg-white rounded-xl p-2 px-4 font-semibold text-[15px] items-center flex hover:bg-gray-200 text-blue-600'
              >
                Register as Specialist{' '}
                <MoveRightIcon className='size-4 transition-transform duration-200 group-hover:translate-x-1' />
              </button>
            </div>
          </div>
          <div className='bg-white p-5 rounded-xl mt-4 w-full h-fit'>
            <div className='flex justify-between items-center mb-4'>
              <span className='font-bold text-lg'>Specialist Dashboard</span>
              <span className='bg-green-100 text-[14px] text-green-700 px-3 py-1 rounded-xl'>
                Active
              </span>
            </div>
            <div className='flex gap-2'>
              <div className='flex w-full bg-blue-50 p-4 rounded-xl'>
                <div className='flex flex-col gap-2'>
                  <span className='flex items-center gap-1 text-[13px]'>
                    <Calendar className='size-5 text-blue-600' /> Today
                  </span>
                  <span className='font-bold text-2xl'>8</span>
                  <span className='text-[14px] text-gray-700'>
                    Appointments
                  </span>
                </div>
              </div>
              <div className='flex w-full bg-green-50 p-4 rounded-xl'>
                <div className='flex flex-col gap-2'>
                  <span className='flex items-center gap-1 text-[13px]'>
                    <TrendingUp className='size-5 text-green-600' /> This Month
                  </span>
                  <span className='font-bold text-2xl'>₱45,680</span>
                  <span className='text-[14px] text-gray-700'>Earnings</span>
                </div>
              </div>
            </div>

            <div className='gap-2 flex flex-col mt-4'>
              <span className='font-semibold text-[15px]'>
                Upcoming Patients
              </span>
              <div className='flex justify-between p-3 bg-gray-50 rounded-xl items-center gap-2'>
                <div className='flex items-center gap-3'>
                  <div className='bg-linear-to-r from-blue-400 to-blue-500 rounded-full size-10 flex items-center justify-center shrink-0'>
                    <span className='text-white font-semibold text-sm'>M</span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-semibold text-sm text-slate-900'>
                      Maria Santos
                    </span>
                    <span className='text-xs text-gray-500'>
                      10:00 AM • Video
                    </span>
                  </div>
                </div>
                <ChartColumnIncreasing className='size-5 text-gray-400 shrink-0' />
              </div>
              <div className='flex justify-between p-3 bg-gray-50 rounded-xl items-center gap-2'>
                <div className='flex items-center gap-3'>
                  <div className='bg-linear-to-r from-blue-400 to-blue-500 rounded-full size-10 flex items-center justify-center shrink-0'>
                    <span className='text-white font-semibold text-sm'>J</span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-semibold text-sm text-slate-900'>
                      Juan Cruz
                    </span>
                    <span className='text-xs text-gray-500'>
                      11:30 AM • Chat
                    </span>
                  </div>
                </div>
                <ChartColumnIncreasing className='size-5 text-gray-400 shrink-0' />
              </div>
              <div className='flex justify-between p-3 bg-gray-50 rounded-xl items-center gap-2'>
                <div className='flex items-center gap-3'>
                  <div className='bg-linear-to-r from-blue-400 to-blue-500 rounded-full size-10 flex items-center justify-center shrink-0'>
                    <span className='text-white font-semibold text-sm'>A</span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-semibold text-sm text-slate-900'>
                      Ana Reyes
                    </span>
                    <span className='text-xs text-gray-500'>
                      2:00 PM • Video
                    </span>
                  </div>
                </div>
                <ChartColumnIncreasing className='size-5 text-gray-400 shrink-0' />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function AboutUs() {
  return (
    <div className='pt-20'>
      <main>
        <DoctorView />
      </main>
    </div>
  );
}

export default AboutUs;
