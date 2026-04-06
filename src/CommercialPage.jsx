import { useState, useMemo, useEffect } from 'react';
import './Commercial.css';
import { useNavigate } from 'react-router';
import nurseDocImage from './assets/NurseDoc.png';
import phoneImage from './assets/phoneImage.png';
import doc1 from './assets/doc1.jpg';
import doc2 from './assets/doc2.jpg';
import doc3 from './assets/doc3.jpg';
import doc4 from './assets/doc4.jpg';
import okieDocLogo from './assets/okie-doc-logo.png';
import { FaTimes } from 'react-icons/fa';
import {
  Search,
  Phone,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Video,
  ChevronLeft,
  ChevronRight,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Stethoscope,
} from 'lucide-react';
import { fetchFeaturedSpecialists } from './api/specialistsPublicApi';
import { apiRequest } from './api/apiClient';

function CommercialPage() {
  const navigate = useNavigate();
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredCarouselIndex, setFeaturedCarouselIndex] = useState(0);
  const [featuredSpecialists, setFeaturedSpecialists] = useState([]);

  const slides = useMemo(
    () => [
      {
        id: 'how-1',
        type: 'info',
        label: 'How it works',
        title: 'Search for the right specialist',
        description:
          'Filter by doctor, hospital, or specialty and instantly see who is available today for online or in-person consultations.',
        steps: [
          'Browse verified specialists',
          'See real-time availability',
          'Compare consultation options',
        ],
        icon: <Search className='text-[#4aa7ed]' size={36} />,
      },
      {
        id: 'how-2',
        type: 'info',
        label: 'How it works',
        title: 'Book in minutes, not days',
        description:
          'Choose a time that works for you, confirm your details, and receive your appointment confirmation straight away.',
        steps: [
          'Pick a schedule that fits you',
          'Confirm your contact details',
          'Receive instant confirmation',
        ],
        icon: <Calendar className='text-[#4aa7ed]' size={36} />,
      },
      {
        id: 'how-3',
        type: 'info',
        label: 'How it works',
        title: 'Consult from wherever you are',
        description:
          'Join your consultation via mobile or desktop and keep all your records and follow-ups in one secure place.',
        steps: [
          'Join via mobile or desktop',
          'Get medical advice and e-prescriptions',
          'Track your history in OkieDoc+',
        ],
        icon: <Video className='text-[#4aa7ed]' size={36} />,
      },
    ],
    [],
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const featuredSlides = useMemo(() => {
    if (!featuredSpecialists.length) {
      return [];
    }

    const res = [];
    for (let i = 0; i < featuredSpecialists.length; i += 4) {
      res.push(featuredSpecialists.slice(i, i + 4));
    }
    return res;
  }, [featuredSpecialists]);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedSpecialists = async () => {
      try {
        const specialists = await fetchFeaturedSpecialists(12);
        if (isMounted) {
          setFeaturedSpecialists(specialists);
          setFeaturedCarouselIndex(0);
        }
      } catch (error) {
        if (isMounted) {
          setFeaturedSpecialists([]);
        }
      }
    };

    loadFeaturedSpecialists();

    return () => {
      isMounted = false;
    };
  }, []);

  const goToPrev = () =>
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const goToFeaturedPrev = () => {
    if (!featuredSlides.length) return;
    setFeaturedCarouselIndex(
      (prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length,
    );
  };
  const goToFeaturedNext = () => {
    if (!featuredSlides.length) return;
    setFeaturedCarouselIndex((prev) => (prev + 1) % featuredSlides.length);
  };
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    healthConcern: '',
    philHealthNumber: '',
    contactMethod: '',
  });
  const [callbackErrors, setCallbackErrors] = useState({});
  const [hasPhilHealth, setHasPhilHealth] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: '' });

  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: '' }), 4000);
  };

  const openCallbackModal = () => {
    setCallbackErrors({});
    setShowCallbackModal(true);
  };

  const closeCallbackModal = () => {
    setShowCallbackModal(false);
    setCallbackErrors({});
  };

  const handleCallbackChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'healthConcern' ? value.slice(0, 500) : value;
    setCallbackForm((prev) => ({ ...prev, [name]: nextValue }));
    if (callbackErrors[name]) {
      setCallbackErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhilHealthChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    let formatted = value;
    if (value.length > 2) formatted = value.slice(0, 2) + '-' + value.slice(2);
    if (value.length > 11)
      formatted =
        value.slice(0, 2) + '-' + value.slice(2, 11) + '-' + value.slice(11);
    setCallbackForm((prev) => ({ ...prev, philHealthNumber: formatted }));
    if (callbackErrors.philHealthNumber) {
      setCallbackErrors((prev) => ({ ...prev, philHealthNumber: '' }));
    }
  };

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!callbackForm.fullName.trim()) errors.fullName = 'Required';
    if (!callbackForm.email.trim()) errors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(callbackForm.email))
      errors.email = 'Invalid email';
    if (!callbackForm.contactNumber.trim()) errors.contactNumber = 'Required';
    if (!callbackForm.healthConcern.trim()) errors.healthConcern = 'Required';
    else if (callbackForm.healthConcern.length > 500)
      errors.healthConcern = 'Maximum 500 characters';
    if (!callbackForm.contactMethod)
      errors.contactMethod = 'Please select a contact method';
    if (hasPhilHealth) {
      const philRegex = /^\d{2}-\d{9}-\d$/;
      if (!callbackForm.philHealthNumber.trim()) {
        errors.philHealthNumber = 'Required';
      } else if (!philRegex.test(callbackForm.philHealthNumber)) {
        errors.philHealthNumber =
          'Incomplete or invalid format (XX-XXXXXXXXX-X)';
      }
    }
    if (Object.keys(errors).length > 0) {
      setCallbackErrors(errors);
      return;
    }
    try {
      await apiRequest('/api/callback-requests', {
        method: 'POST',
        disableAuthRedirect: true,
        body: JSON.stringify({
          fullName: callbackForm.fullName,
          email: callbackForm.email,
          contactNumber: callbackForm.contactNumber,
          healthConcern: callbackForm.healthConcern,
          philHealthNumber: hasPhilHealth ? callbackForm.philHealthNumber : '',
          contactMethod: callbackForm.contactMethod,
        }),
      });

      showToast('Your callback request has been submitted!', 'success');
      setShowCallbackModal(false);
      setCallbackForm({
        fullName: '',
        email: '',
        contactNumber: '',
        healthConcern: '',
        philHealthNumber: '',
        contactMethod: '',
      });
      setCallbackErrors({});
      setHasPhilHealth(false);
    } catch (err) {
      const message =
        (typeof err === 'string' && err) ||
        err?.message ||
        err?.error ||
        'Something went wrong. Please try again.';
      showToast(
        message,
        'error',
      );
    }
  };

  const navLinks = [
    'Products',
    'Solutions',
    'Community',
    'Resources',
    'Pricing',
    'Contact',
    'Link',
  ];

  const toggleDropdownMenu = () => {
    setIsDropdownMenuOpen(!isDropdownMenuOpen);
  };

  const doctors = [
    {
      id: 1,
      name: 'Dr. Lady Dominique Lumidao',
      credentials: 'RMT, MD - General Medicine',
      image: doc1,
      onlineConsultation: true,
      inPersonConsultation: false,
      clinicType: 'Online Clinic',
      schedule: 'Today, 09:00 AM - 10:00 PM',
      fee: '₱350.00',
    },
    {
      id: 2,
      name: 'Dr. Ciarra Isabella Liguid',
      credentials: 'RMT, MD - General Medicine',
      image: doc3,
      onlineConsultation: true,
      inPersonConsultation: false,
      clinicType: 'Online Clinic',
      schedule: 'Today, 01:00 PM - 10:00 PM',
      fee: '₱315.00',
    },
    {
      id: 3,
      name: 'Dr. Juan Carlos Santos',
      credentials: 'MD - Internal Medicine',
      image: doc2,
      onlineConsultation: true,
      inPersonConsultation: true,
      clinicType: 'Online Clinic',
      schedule: 'Today, 08:00 AM - 05:00 PM',
      fee: '₱400.00',
    },
    {
      id: 4,
      name: 'Dr. Maria Elena Cruz',
      credentials: 'MD - Pediatrics',
      image: doc4,
      onlineConsultation: true,
      inPersonConsultation: false,
      clinicType: 'Online Clinic',
      schedule: 'Today, 10:00 AM - 06:00 PM',
      fee: '₱350.00',
    },
  ];

  return (
    <div className='splash-container'>
      <header className='header'>
        <div className='logo-section'>
          <img src={okieDocLogo} alt='OkieDoc+' className='logo-image' />
        </div>

        <button
          className='mobile-nav-toggle'
          onClick={toggleDropdownMenu}
          aria-label='Toggle dropdown menu'
        >
          ☰
        </button>

        <div className='text-and-buttons'>
          <nav className='nav-links'>
            {navLinks.map((link) => (
              <a key={link} href='#' className='nav-link'>
                {link}
              </a>
            ))}
          </nav>
        </div>

        <div className='button-group'>
          <button className='btn' onClick={() => navigate('/login')}>
            Login
          </button>
          <button className='btn' onClick={() => navigate('/registration')}>
            Register
          </button>
        </div>

        <div
          className={`mobile-nav-dropdown ${isDropdownMenuOpen ? 'open' : ''}`}
        >
          {navLinks.map((link) => (
            <a key={link} href='#' className='nav-link'>
              {link}
            </a>
          ))}
        </div>
      </header>

      {/* <div className="logo-section">
        <img
          src="/okie-doc-logo.png"
          alt="OkieDoc+"
          className="logo-image"
          style={{ height: "80px", maxWidth: "none", paddingLeft: "15px" }}
        />
      </div> */}

      <main className='splash-main'>
        <div>
          <div className='background-decorative-circle'></div>
        </div>
        <div className='content-wrapper'>
          <div className='doctor-section'>
            <img
              src={nurseDocImage}
              alt='Medical Professional'
              className='doctor-image'
            />
          </div>

          <div className='info-section'>
            <div className='search-section'>
              <h1 className='main-heading'>FIND A SPECIALIST</h1>
              <p className='sub-heading'>
                Book your Appointment - Anytime, Anywhere
              </p>

              <div className='search-form'>
                <div className='search-bar'>
                  <svg
                    className='search-icon'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                  >
                    <circle cx='11' cy='11' r='8' strokeWidth='2' />
                    <path d='M21 21l-4.35-4.35' strokeWidth='2' />
                  </svg>
                  <div className='search-input'>
                    Your health starts here — search by doctor, hospital, or
                    specialty
                  </div>
                </div>
              </div>
            </div>

            <div className='cta-section'>
              <div className='cta-content'>
                <h2 className='cta-heading'>
                  Immediate access to medical professionals
                </h2>
                <p className='cta-text'>
                  Get connected to a doctor right away.
                </p>
                <div className='cta-buttons'>
                  <button
                    className='consult-now-btn'
                    onClick={() => navigate('/login')}
                  >
                    Consult Now
                  </button>
                  <button
                    className='callback-request-btn'
                    onClick={openCallbackModal}
                  >
                    Callback Request
                  </button>
                </div>
              </div>
              <div className='phone-mockup'>
                <img
                  src={phoneImage}
                  alt='Mobile App Preview'
                  className='phone-image'
                />
              </div>
            </div>
          </div>
        </div>

        <section className='carousel-section'>
          <div className='carousel-container'>
            <div className='carousel-shell'>
              <button className='carousel-arrow' onClick={goToPrev}>
                <ChevronLeft size={24} />
              </button>

              <div className='carousel-viewport'>
                <div
                  className='carousel-track'
                  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                  {slides.map((slide) => (
                    <div key={slide.id} className='carousel-slide'>
                      <div className='carousel-card carousel-card--info'>
                        <div className='carousel-card-header'>
                          <span className='carousel-pill'>{slide.label}</span>
                          {slide.icon}
                        </div>
                        <h3 className='carousel-card-title'>{slide.title}</h3>
                        <p className='carousel-card-description'>
                          {slide.description}
                        </p>
                        <ul className='carousel-card-steps'>
                          {slide.steps.map((step) => (
                            <li key={step}>
                              <CheckCircle2
                                size={16}
                                className='text-[#4aa7ed]'
                              />{' '}
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className='carousel-arrow' onClick={goToNext}>
                <ChevronRight size={24} />
              </button>
            </div>

            <div className='carousel-dots'>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`carousel-dot ${i === currentIndex ? 'carousel-dot--active' : ''}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className='featured-section'>
          <div className='featured-header'>
            <div className='featured-divider'></div>
            <h2 className='featured-title'>Featured Specialists</h2>
            <div className='featured-divider'></div>
          </div>

          <div className='featured-carousel-shell'>
            <button
              className='featured-carousel-arrow'
              onClick={goToFeaturedPrev}
              disabled={!featuredSlides.length}
            >
              <ChevronLeft size={24} />
            </button>

            <div className='featured-carousel-viewport'>
              <div
                className='featured-carousel-track'
                style={{
                  transform: `translateX(-${featuredCarouselIndex * 100}%)`,
                }}
              >
                {featuredSlides.map((group, idx) => (
                  <div key={idx} className='featured-carousel-slide'>
                    {group.map((spec) => (
                      <div key={spec.id} className='featured-specialist-card'>
                        {spec.profileUrl ? (
                          <img
                            src={spec.profileUrl}
                            alt={spec.fullName}
                            className='featured-specialist-image'
                          />
                        ) : (
                          <div className='featured-specialist-placeholder'>
                            <User size={56} color='#9ab0c2' />
                          </div>
                        )}
                        <span className='featured-specialist-badge'>
                          {spec.specialty}
                        </span>
                        <h4 className='featured-specialist-name'>
                          {spec.fullName}
                        </h4>
                        <p className='featured-specialist-bio'>
                          {spec.bio ||
                            'Specialist profile is available for consultation.'}
                        </p>
                        <button
                          className='featured-specialist-btn'
                          onClick={() =>
                            navigate(`/doctor/${spec.userId || spec.id}`)
                          }
                        >
                          Consult Now
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {!featuredSlides.length && (
                <div className='featured-empty-state'>
                  No featured specialists available at the moment.
                </div>
              )}
            </div>

            <button
              className='featured-carousel-arrow'
              onClick={goToFeaturedNext}
              disabled={!featuredSlides.length}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className='featured-cta-block'>
            <h3 className='featured-cta-title'>Be part of our team!</h3>
            <p className='featured-cta-text'>
              Know more about OkieDoc+ as a platform for specialist and proceed
              with hassle free registration.
            </p>
            <button
              className='featured-cta-btn'
              onClick={() => navigate('/specialist-registration')}
            >
              Register as a specialist!
            </button>
          </div>
        </section>

        <section className='doctors-listing-section'>
          <div className='doctors-listing-container'>
            <h2 className='doctors-listing-heading'>
              Our Available Specialists
            </h2>
            <div className='doctors-list'>
              {doctors.map((doctor) => (
                <div key={doctor.id} className='doctor-card'>
                  <div className='doctor-info'>
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className='doctor-avatar'
                    />
                    <div className='doctor-details'>
                      <h3 className='doctor-name'>{doctor.name}</h3>
                      <p className='doctor-credentials'>{doctor.credentials}</p>
                      <div className='consultation-types'>
                        <span
                          className={`consultation-badge ${
                            doctor.onlineConsultation ? 'active' : 'inactive'
                          }`}
                        >
                          {doctor.onlineConsultation ? '✓' : '✕'} Online
                          Consultation
                        </span>
                        <span
                          className={`consultation-badge ${
                            doctor.inPersonConsultation ? 'active' : 'inactive'
                          }`}
                        >
                          {doctor.inPersonConsultation ? '✓' : '✕'} In-Person
                          Consultation
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='schedule-info'>
                    <p className='schedule-label'>
                      Earliest Available Schedule
                    </p>
                    <div className='schedule-details'>
                      <div className='clinic-icon'>
                        <svg
                          width='40'
                          height='40'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='#4aa7ed'
                          strokeWidth='1.5'
                        >
                          <rect x='5' y='2' width='14' height='20' rx='2' />
                          <path d='M12 18h.01' />
                          <path d='M9 6h6' />
                          <path d='M9 10h6' />
                        </svg>
                      </div>
                      <div className='clinic-info'>
                        <p className='clinic-type'>{doctor.clinicType}</p>
                        <p className='clinic-schedule'>{doctor.schedule}</p>
                        <p className='clinic-fee'>Fee: {doctor.fee}</p>
                      </div>
                    </div>
                  </div>

                  <div className='doctor-actions'>
                    <button
                      className='book-appointment-link'
                      onClick={() => navigate('/login')}
                    >
                      BOOK APPOINTMENT
                    </button>
                    <button
                      className='view-profile-btn'
                      onClick={() => navigate('/login')}
                    >
                      VIEW PROFILE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {showCallbackModal && (
        <div className='callback-overlay'>
          <div className='callback-modal' onClick={(e) => e.stopPropagation()}>
            <form
              className='callback-form'
              onSubmit={handleCallbackSubmit}
              noValidate
            >
              <div className='callback-field'>
                <div className='cb-label-row'>
                  <label htmlFor='commercial-callback-full-name' className='cb-label'>
                    Full Name
                  </label>
                  <span className='cb-tip' tabIndex='0' data-tip='Enter your complete name as shown on your valid ID.' aria-label='Full name input help'>
                    i
                  </span>
                </div>
                {callbackErrors.fullName && (
                  <span className='cb-error'>{callbackErrors.fullName}</span>
                )}
                <input
                  id='commercial-callback-full-name'
                  type='text'
                  name='fullName'
                  placeholder='Full Name'
                  title='Enter your complete name as shown on your valid ID.'
                  value={callbackForm.fullName}
                  onChange={handleCallbackChange}
                  className={
                    callbackErrors.fullName
                      ? 'cb-input cb-input-error'
                      : 'cb-input'
                  }
                />
              </div>
              <div className='callback-field'>
                <div className='cb-label-row'>
                  <label htmlFor='commercial-callback-email' className='cb-label'>
                    Email Address
                  </label>
                  <span className='cb-tip' tabIndex='0' data-tip='Use an active email address where we can contact you.' aria-label='Email input help'>
                    i
                  </span>
                </div>
                {callbackErrors.email && (
                  <span className='cb-error'>{callbackErrors.email}</span>
                )}
                <input
                  id='commercial-callback-email'
                  type='email'
                  name='email'
                  placeholder='Email Address'
                  title='Use an active email address where we can contact you.'
                  value={callbackForm.email}
                  onChange={handleCallbackChange}
                  className={
                    callbackErrors.email
                      ? 'cb-input cb-input-error'
                      : 'cb-input'
                  }
                />
              </div>
              <div className='callback-field'>
                <div className='cb-label-row'>
                  <label
                    htmlFor='commercial-callback-contact-number'
                    className='cb-label'
                  >
                    Contact Number
                  </label>
                  <span className='cb-tip' tabIndex='0' data-tip='Enter your mobile number with area code so we can call you.' aria-label='Contact number input help'>
                    i
                  </span>
                </div>
                {callbackErrors.contactNumber && (
                  <span className='cb-error'>
                    {callbackErrors.contactNumber}
                  </span>
                )}
                <input
                  id='commercial-callback-contact-number'
                  type='tel'
                  name='contactNumber'
                  placeholder='Contact Number'
                  title='Enter your mobile number with area code so we can call you.'
                  value={callbackForm.contactNumber}
                  onChange={handleCallbackChange}
                  className={
                    callbackErrors.contactNumber
                      ? 'cb-input cb-input-error'
                      : 'cb-input'
                  }
                />
              </div>
              <div className='callback-field'>
                <div className='cb-label-row'>
                  <label
                    htmlFor='commercial-callback-health-concern'
                    className='cb-label'
                  >
                    Health Concern / Message
                  </label>
                  <span className='cb-tip' tabIndex='0' data-tip='Describe your symptoms, concern, and how long you have had them. Maximum 500 characters.' aria-label='Health concern input help'>
                    i
                  </span>
                </div>
                {callbackErrors.healthConcern && (
                  <span className='cb-error'>{callbackErrors.healthConcern}</span>
                )}
                <textarea
                  id='commercial-callback-health-concern'
                  name='healthConcern'
                  placeholder='Please describe your symptoms or health concerns...'
                  value={callbackForm.healthConcern}
                  onChange={handleCallbackChange}
                  maxLength={500}
                  title='Describe your symptoms, concern, and how long you have had them. Maximum 500 characters.'
                  className={
                    callbackErrors.healthConcern
                      ? 'cb-textarea cb-input-error'
                      : 'cb-textarea'
                  }
                />
                <span
                  className={
                    callbackForm.healthConcern.length >= 500
                      ? 'cb-char-counter is-limit'
                      : 'cb-char-counter'
                  }
                >
                  {callbackForm.healthConcern.length}/500
                </span>
              </div>
              <div className='callback-field cb-field-tight'>
                <label className='cb-checkbox-label'>
                  <input
                    type='checkbox'
                    checked={hasPhilHealth}
                    onChange={(e) => setHasPhilHealth(e.target.checked)}
                    className='cb-checkbox'
                  />
                  I have a PhilHealth ID number
                </label>
                {hasPhilHealth && (
                  <div
                    className='callback-field'
                    style={{ marginTop: '0.4rem' }}
                  >
                    <div className='cb-label-row'>
                      <label htmlFor='commercial-callback-philhealth' className='cb-label'>
                        PhilHealth ID Number
                      </label>
                      <span className='cb-tip' tabIndex='0' data-tip='Enter your PhilHealth ID in this format: XX-XXXXXXXXX-X.' aria-label='PhilHealth input help'>
                        i
                      </span>
                    </div>
                    {callbackErrors.philHealthNumber && (
                      <span className='cb-error'>
                        {callbackErrors.philHealthNumber}
                      </span>
                    )}
                    <input
                      id='commercial-callback-philhealth'
                      type='text'
                      name='philHealthNumber'
                      placeholder='Philhealth ID Number (XX-XXXXXXXXX-X)'
                      title='Enter your PhilHealth ID in this format: XX-XXXXXXXXX-X.'
                      value={callbackForm.philHealthNumber}
                      onChange={handlePhilHealthChange}
                      maxLength={14}
                      className={
                        callbackErrors.philHealthNumber
                          ? 'cb-input cb-input-error'
                          : 'cb-input'
                      }
                    />
                  </div>
                )}
              </div>
              <div className='callback-field'>
                <div className='cb-radio-group'>
                  <label className='cb-radio-label'>
                    <input
                      type='radio'
                      name='contactMethod'
                      value='mobile'
                      checked={callbackForm.contactMethod === 'mobile'}
                      onChange={handleCallbackChange}
                    />
                    Call via Mobile
                  </label>
                  <label className='cb-radio-label'>
                    <input
                      type='radio'
                      name='contactMethod'
                      value='viber'
                      checked={callbackForm.contactMethod === 'viber'}
                      onChange={handleCallbackChange}
                    />
                    Call via Viber
                  </label>
                  <label className='cb-radio-label'>
                    <input
                      type='radio'
                      name='contactMethod'
                      value='viber-video'
                      checked={callbackForm.contactMethod === 'viber-video'}
                      onChange={handleCallbackChange}
                    />
                    Video Call via Viber
                  </label>
                </div>
                {callbackErrors.contactMethod && (
                  <span className='cb-error'>
                    {callbackErrors.contactMethod}
                  </span>
                )}
              </div>
              <div className='cb-expect-box'>
                <p className='cb-expect-title'>What to expect:</p>
                <ul className='cb-expect-list'>
                  <li>Response within 24 hours</li>
                  <li>Free nurse triage consultation</li>
                  <li>Matched with appropriate specialist</li>
                  <li>Flexible scheduling options</li>
                </ul>
              </div>
              <div className='cb-actions'>
                <button
                  type='button'
                  className='cb-cancel-btn'
                  onClick={closeCallbackModal}
                >
                  Cancel
                </button>
                <button type='submit' className='cb-submit-btn'>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast.visible && (
        <div className={`cb-toast cb-toast--${toast.type}`}>
          <span>{toast.message}</span>
          <button
            className='cb-toast__close'
            onClick={() => setToast({ visible: false, message: '', type: '' })}
          >
            ✕
          </button>
        </div>
      )}

      <footer className='footer-v2'>
        <div className='footer-container'>
          <div className='footer-grid'>
            <div className='footer-brand'>
              <div className='footer-brand-logo'>
                <div className='footer-logo-icon-wrapper'>
                  <Stethoscope size={28} className='footer-logo-icon' />
                </div>
                <span className='footer-brand-name'>OkieDoc+</span>
              </div>
              <p className='footer-brand-desc'>
                Your Digital Health Partner. Connecting you with quality healthcare, anytime, anywhere.
              </p>
              <div className="footer-contact-info">
                <div className="footer-contact-item">
                  <Phone size={18} />
                  <span>(02) 8802-5555</span>
                </div>
                <div className="footer-contact-item">
                  <Mail size={18} />
                  <span>support@okiedoc.com</span>
                </div>
              </div>
            </div>

            <div className='footer-links-group'>
              <h3 className='footer-links-title'>General</h3>
              <ul className='footer-links-list'>
                <li><a href='#'>About Us</a></li>
                <li><a href='#'>How It Works</a></li>
                <li><a href='#'>Terms & Conditions</a></li>
                <li><a href='#'>Privacy Policy</a></li>
                <li><a href='#'>Contact Us</a></li>
              </ul>
            </div>

            <div className='footer-links-group'>
              <h3 className='footer-links-title'>For Doctors</h3>
              <ul className='footer-links-list'>
                <li><a href='#' onClick={(e) => { e.preventDefault(); navigate('/specialist-registration'); }}>Apply as Specialist</a></li>
                <li><a href='#'>Request Demo</a></li>
                <li><a href='#' onClick={(e) => { e.preventDefault(); navigate('/specialist-login'); }}>Doctor Login</a></li>
                <li><a href='#'>Benefits</a></li>
              </ul>
            </div>

            <div className='footer-links-group'>
              <h3 className='footer-links-title'>For Patients</h3>
              <ul className='footer-links-list'>
                <li><a href='#'>Find a Doctor</a></li>
                <li><a href='#'>Services</a></li>
                <li><a href='#' onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Patient Login</a></li>
                <li><a href='#' onClick={(e) => { e.preventDefault(); navigate('/registration'); }}>Register</a></li>
              </ul>
            </div>
          </div>

          <div className='footer-bottom'>
            <p className='footer-copyright'>
              © 2026 OkieDoc+. All rights reserved.
            </p>
            <div className='footer-social-links'>
              <a href='#' className='footer-social-link'><Facebook size={20} /></a>
              <a href='#' className='footer-social-link'><Instagram size={20} /></a>
              <a href='#' className='footer-social-link'><Linkedin size={20} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CommercialPage;
