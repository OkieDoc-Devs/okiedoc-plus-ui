import { useState, useMemo, useEffect } from 'react';
import './Commercial.css';
import { useNavigate } from 'react-router';
import nurseDocImage from './assets/NurseDoc.png';
import phoneImage from './assets/phoneImage.png';
import doc1 from './assets/doc1.jpg';
import doc2 from './assets/doc2.jpg';
import doc3 from './assets/doc3.jpg';
import doc4 from './assets/doc4.jpg';
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
} from 'lucide-react';
import { fetchFeaturedSpecialists } from './api/specialistsPublicApi';

function CommercialPage() {
  const navigate = useNavigate();
  const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);

  // ===== CAROUSEL STATE =====
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredCarouselIndex, setFeaturedCarouselIndex] = useState(0);
  const [featuredSpecialists, setFeaturedSpecialists] = useState([]);

  // ===== CAROUSEL SLIDES (How It Works) =====
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

  // ===== AUTO-ROTATE CAROUSEL =====
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // ===== FEATURED SPECIALISTS STATE =====
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

  // ===== FETCH FEATURED SPECIALISTS =====
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

  // ===== CAROUSEL NAVIGATION =====
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
          <img src='/okie-doc-logo.png' alt='OkieDoc+' className='logo-image' />
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
                <button
                  className='consult-now-btn'
                  onClick={() => navigate('/login')}
                >
                  Consult Now
                </button>
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

        {/* ===== HOW IT WORKS CAROUSEL SECTION ===== */}
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

            {/* Carousel Dots */}
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

        {/* ===== FEATURED SPECIALISTS CAROUSEL SECTION ===== */}
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

          {/* Featured CTA Block */}
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
    </div>
  );
}

export default CommercialPage;
