import "./index.css";
import { Footer } from "./components/ui/Footer";
import OkieDocLogo from "./assets/okie-doc-logo.png";
import LandingImage from "./assets/landingimage.jpg";
import LandingImageSpecialist from "./assets/specialist-landing.png";
import Doc1 from "./assets/doc-1.jpg";
import Doc2 from "./assets/doc-2.jpg";
import Doc3 from "./assets/doc-3.jpg";
import Doc4 from "./assets/doc-4.jpg";
import Carousel1 from "./assets/carousel-1.jpg";
import Carousel2 from "./assets/carousel-2.jpg";
import Carousel3 from "./assets/carousel-3.jpg";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Menu,
  MapPin,
  Bell,
  ChevronDown,
  Search,
  MessageSquare,
  Phone,
  CheckCircle,
  Lock,
  Users,
  BabyIcon,
  Brain,
  Stethoscope,
  HeartPulse,
  Heart,
  MoveRight,
  Building2Icon,
  Hospital,
  Shield,
  Star,
  Eye,
  Bone,
  Ear,
  Smile,
  Users2Icon,
  User,
  Video,
  UserIcon,
  PhoneCallIcon,
  PhoneCall,
  Mail,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  MoveRightIcon,
  TrendingUp,
  Clock,
  NotepadText,
  Calendar,
  Coins,
  ScrollText,
  PillBottle,
} from "lucide-react";
import { SpecialtyCard } from "./components/ui/specialtyCard";
import { SpecialtyCardWide } from "./components/ui/specialtyCardWide";
import { SpecialistCard } from "./components/ui/specialistCard";
import { Link, useNavigate } from "react-router";
import { apiRequest, API_BASE_URL } from "./api/apiClient";
import { PartnerCard } from "./components/ui/partnerCard";

type CallbackRequestProps = {
  isOpen: boolean;
  onClose: () => void;
};

function CallbackRequest({ isOpen, onClose }: CallbackRequestProps) {
  const MAX_CHARS = 250;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleOverlayClick = () => {
    // Mobile: close only through Cancel button. Desktop/tablet: allow backdrop close.
    if (window.matchMedia("(min-width: 768px)").matches) {
      onClose();
    }
  };

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    if (
      !fullName.trim() ||
      !email.trim() ||
      !contactNumber.trim() ||
      !message.trim()
    ) {
      setErrorMessage("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    // Filipino phone number validation
    const phoneRegex = /^(\+63|09)\d{9,10}$/;
    if (!phoneRegex.test(contactNumber.trim())) {
      setErrorMessage("Please enter a valid Filipino phone number (+63 or 09)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("/api/callback-requests", {
        method: "POST",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          contactNumber: contactNumber.trim(),
          contactMethod: "phone",
          message: message.trim(),
        }),
      });

      if (response?.success) {
        setSuccessMessage("Callback request submitted successfully!");
        setTimeout(() => {
          setFullName("");
          setEmail("");
          setContactNumber("");
          setMessage("");
          setSuccessMessage("");
          onClose();
        }, 2000);
      } else {
        setErrorMessage(
          response?.message || "Failed to submit callback request",
        );
      }
    } catch (error) {
      console.error("Error submitting callback request:", error);
      setErrorMessage("Failed to submit callback request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const sanitized = textarea.value
      .replace(/<[^>]*>/g, "")
      .replace(/[<>'"]/g, "")
      .slice(0, MAX_CHARS);

    setMessage(sanitized);

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0  bg-gray-500/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:w-full"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-xl rounded-lg  bg-white p-8 border border-gray-400"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-center items-center flex-col gap-2">
          <div className="bg-green-100 size-10 rounded-full flex items-center justify-center shrink-0">
            <MessageSquare className="size-6 text-green-600" />
          </div>
          <h1 className="font-bold text-2xl ">Request a Callback</h1>
          <p className="font-light text-gray-600 text-center">
            Our medical team will contact you to discuss your health concerns
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        <div className="p-2 flex flex-col gap-4 ">
          <div>
            <span className="font-semibold text-sm">Full Name*</span>
            <div className="flex items-center relative">
              <div className="absolute flex pl-2 items-center pointer-events-none">
                <UserIcon className="text-gray-500" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                placeholder="Juan Dela Cruz"
                className="w-full rounded-lg bg-gray-100 p-2 pl-10 placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <span className="font-semibold text-sm">Email Address *</span>
            <div className="flex items-center relative">
              <div className="absolute flex pl-3 items-center pointer-events-none">
                <Mail className="text-gray-500 size-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="juan@example.com"
                className="w-full rounded-lg bg-gray-100 p-2 pl-10 placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <span className="font-semibold text-sm">Contact Number *</span>
            <div className="flex items-center relative">
              <div className="absolute flex pl-3 items-center pointer-events-none">
                <Phone className="text-gray-500 size-5" />
              </div>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => {
                  let value = e.target.value.trim();

                  // Remove all non-digits except the initial + sign
                  if (value.startsWith("+")) {
                    value = "+" + value.substring(1).replace(/\D/g, "");
                  } else {
                    value = value.replace(/\D/g, "");
                  }

                  // Auto-add + if user types 63 at the start
                  if (value.startsWith("63") && !value.startsWith("+")) {
                    value = "+" + value;
                  }

                  // Enforce length limits
                  if (value.startsWith("+63") && value.length > 13) {
                    return;
                  }
                  if (value.startsWith("09") && value.length > 11) {
                    return;
                  }

                  setContactNumber(value);
                }}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (
                    ![
                      "0",
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "+",
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "Tab",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                placeholder="+63 or 09 followed by numbers"
                className="w-full rounded-lg bg-gray-100 p-2 pl-10 placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50"
              />
            </div>
          </div>
          <div>
            <span className="font-semibold text-sm">
              Health Concern / Message *
            </span>
            <div className="relative">
              <textarea
                value={message}
                onChange={handleMessageChange}
                disabled={isLoading}
                placeholder="Please describe your symptoms or health concerns..."
                rows={4}
                className="w-full rounded-lg bg-gray-100 p-2 pl-4 placeholder:text-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none overflow-hidden disabled:opacity-50"
              />
              <span
                className={`text-xs absolute bottom-2 right-3 ${message.length >= MAX_CHARS ? "text-red-400" : "text-gray-400"}`}
              >
                {message.length}/{MAX_CHARS}
              </span>
            </div>
          </div>
          <div className="p-2 border border-green-400 rounded-lg bg-green-50 ">
            <div className="p-3 flex flex-col gap-0.5">
              <span className="font-semibold text-green-900">
                What to expect:
              </span>
              <p className="text-green-700 text-[15px]">
                • Response within 24 hours
              </p>
              <p className="text-green-700 text-[15px]">
                • Free nurse triage consultation
              </p>
              <p className="text-green-700 text-[15px]">
                • Matched with appropriate specialist
              </p>
              <p className="text-green-700 text-[15px]">
                • Flexible scheduling options
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              className="bg-white w-full rounded-lg p-2 border border-gray-200 hover:cursor-pointer hover:bg-gray-200 transition-all disabled:opacity-50"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="bg-blue-400 text-white w-full rounded-lg hover:bg-blue-600 p-2 transition-all hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorView() {
  const [current, setCurrent] = useState(1); // start at 1 to account for prepended clone
  const [dragOffset, setDragOffset] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      goTo(current + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, [isDragging, current]);

  const goTo = (index) => {
    setIsTransitioning(true);
    setCurrent(index);
  };

  // After transitioning to a clone, silently snap to the real slide
  useEffect(() => {
    if (!isTransitioning) return;
    const timer = setTimeout(() => {
      setIsTransitioning(false);
      if (current === 0) {
        setCurrent(slides.length); // snapped to cloned first (last real)
      } else if (current === infiniteSlides.length - 1) {
        setCurrent(1); // snapped to cloned last (first real)
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [current, isTransitioning]);

  const handleDragStart = (e) => {
    setDragStart(e.type === "touchstart" ? e.touches[0].clientX : e.clientX);
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    if (dragStart === null) return;
    const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
    setDragOffset(clientX - dragStart);
  };

  const handleDragEnd = () => {
    if (Math.abs(dragOffset) > 80) {
      goTo(dragOffset < 0 ? current + 1 : current - 1);
    }
    setDragOffset(0);
    setDragStart(null);
    setIsDragging(false);
  };

  const slides = [
    {
      image: Carousel1,
      title: "Join the Future of Healthcare",
      button: "Learn More",
    },
    {
      image: Carousel2,
      title: "Seamless Virtual Consultations",
      button: "Get Started",
    },
    {
      image: Carousel3,
      title: "Track Your Growth And Earnings",
      button: "View Demo",
    },
  ];

  const infiniteSlides = [slides[slides.length - 1], ...slides, slides[0]];

  const partners = [
    {
      label: "LGU Naga",
      icon: Building2Icon,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Bicol Medical Center",
      icon: Hospital,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "PhilHealth",
      icon: Heart,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      label: "Maxicare",
      icon: Shield,
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Medicard",
      icon: Shield,
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Intellicare",
      icon: Shield,
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
    },
  ];
  const specialtiesExtended = [
    {
      label: "Opthalmology",
      icon: Eye,
      bgColor: "bg-indigo-50",
      hoverColor: "hover:bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Orthopedics",
      icon: Bone,
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "ENT",
      icon: Ear,
      bgColor: "bg-yellow-50",
      hoverColor: "hover:bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "Dermatology",
      icon: Smile,
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "OB-GYN",
      icon: Users2Icon,
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-50",
      textColor: "text-red-600",
    },
    {
      label: "General Practice",
      icon: User,
      bgColor: "bg-gray-50",
      hoverColor: "hover:bg-gray-50",
      textColor: "text-gray-600",
    },
  ];
  const specialties = [
    {
      label: "Pediatrics",
      icon: BabyIcon,
      bgColor: "bg-pink-50",
      hoverColor: "hover:bg-pink-50",
      textColor: "text-pink-600",
    },
    {
      label: "Psychiatry",
      icon: Brain,
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Internal Medicine",
      icon: Stethoscope,
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Pulmonology",
      icon: HeartPulse,
      bgColor: "bg-cyan-50",
      hoverColor: "hover:bg-cyan-50",
      textColor: "text-cyan-600",
    },
    {
      label: "Cardiology",
      icon: Heart,
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-50",
      textColor: "text-red-600",
    },
  ];
  const specialists = [
    {
      id: 1,
      name: "Dr. Maria Santos",
      specialization: "Pediatrician",
      experience:
        "Board-certified with 15 years experience in child healthcare",
      rating: 4.9,
      reviewCount: 127,
      imageUrl: undefined,
    },
    {
      id: 2,
      name: "Dr. Juan Reyes",
      specialization: "Cardiologist",
      experience: "Specialist in heart disease prevention and treatment",
      rating: 4.8,
      reviewCount: 98,
      imageUrl: undefined,
    },
    {
      id: 3,
      name: "Dr. Ana Cruz",
      specialization: "Psychiatrist",
      experience: "Expert in mental health and wellness counseling",
      rating: 5,
      reviewCount: 156,
      imageUrl: undefined,
    },
    {
      id: 4,
      name: "Dr. Pedro Garcia",
      specialization: "Internal Medicine",
      experience: "General practitioner specializing in adult healthcare",
      rating: 4.7,
      reviewCount: 89,
      imageUrl: undefined,
    },
  ];
  const stats = [
    {
      icon: <Users className="text-blue-600" />,
      value: "5,000+",
      label: "Active Doctors",
    },
    {
      icon: <TrendingUp className="text-blue-600" />,
      value: "300%",
      label: "Patient Reach",
    },
    {
      icon: <Shield className="text-blue-600" />,
      value: "100%",
      label: "HIPAA Compliant",
    },
    {
      icon: <Clock className="text-blue-600" />,
      value: "24/7",
      label: "Support Available",
    },
  ];
  const tools = [
    {
      icon: <ScrollText className="text-blue-600" />,
      title: "EMR Access",
      description:
        "Complete electronic medical records with secure cloud storage and instant retrieval",
    },
    {
      icon: <Video className="text-blue-600" />,
      title: "Virtual Consultations",
      description:
        "High-quality video calls with built-in SOAP notes and prescription tools",
    },
    {
      icon: <Calendar className="text-blue-600" />,
      title: "Schedule Management",
      description:
        "Flexible scheduling across multiple clinics with automatic booking system",
    },
    {
      icon: <Coins className="text-blue-600" />,
      title: "Billing & Invoicing",
      description:
        "Automated billing, payment processing, and detailed financial reports",
    },
    {
      icon: <NotepadText className="text-blue-600" />,
      title: "SOAP Notes",
      description:
        "Structured documentation with customizable templates and voice-to-text",
    },
    {
      icon: <PillBottle className="text-blue-600" />,
      title: "E-Prescriptions",
      description:
        "Digital prescriptions with pharmacy integration and medication tracking",
    },
  ];
  const specialistsFeedback = [
    {
      image: <img src={Doc1} className="size-20 rounded-full object-contain" />,
      name: "Dr. Sloane Mercer",
      specialty: "Internal Medicine",
      schedule: "Mon-Fri, 9AM-5PM",
      feedback:
        "OkieDoc+ has transformed how I practice medicine. I can now reach patients across the Philippines.",
    },
    {
      image: <img src={Doc2} className="size-20 rounded-full object-contain" />,
      name: "Dr. Arnav Menon",
      specialty: "Pediatrics",
      schedule: "Tue-Sat, 10AM-6PM",
      feedback:
        "The EMR system is intuitive and the scheduling tool saves me hours every week.",
    },
    {
      image: <img src={Doc3} className="size-20 rounded-full object-contain" />,
      name: "Dr. Beatriz Cárdenas",
      specialty: "Psychiatry",
      schedule: "Mon-Fri, 9AM-5PM",
      feedback:
        "My practice has grown 250% since joining. The platform is professional and reliable.",
    },
    {
      image: <img src={Doc4} className="size-20 rounded-full object-contain" />,
      name: "Dr. Carlos Mendoza",
      specialty: "Cardiology",
      schedule: "Mon-Fri, 9AM-5PM",
      feedback:
        "Excellent support team and the billing system makes financial management effortless.",
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      {/*News Ticker*/}
      <div className="flex items-center w-full overflow-hidden whitespace-nowrap border-b border-green-200 ">
        <ul className="flex flex-1  bg-blue-600 text-white font-semibold text-sm gap-5 pl-2 py-2 animate-infinite-scroll">
          <li>
            <span>• Join 5,000+ doctors already on OkieDoc+</span>
          </li>
          <li>
            <span>• Increase your patient reach by 300%</span>
          </li>
          <li>
            <span>• Now supporting multi-clinic schedules</span>
          </li>
          <li>
            <span>• Track your earnings in real-time centers</span>
          </li>
          <li>
            <span>• Rated 4.9/5 by healthcare professionals</span>
          </li>
          <li>
            <span>• New EMR integration now available</span>
          </li>
          <li>
            <span>• Join 5,000+ doctors already on OkieDoc+</span>
          </li>
          <li>
            <span>• Increase your patient reach by 300%</span>
          </li>
          <li>
            <span>• Now supporting multi-clinic schedules</span>
          </li>
          <li>
            <span>• Track your earnings in real-time centers</span>
          </li>
          <li>
            <span>• Rated 4.9/5 by healthcare professionals</span>
          </li>
          <li>
            <span>• New EMR integration now available</span>
          </li>
        </ul>
      </div>
      {/*Info-1*/}
      <div className="bg-linear-to-b from-blue-50 to-white py-10">
        <div className="flex flex-row justify-center p-4 md:pt-6 gap-12 pb-22">
          <div className="flex-1 max-w-3xl">
            <div className="flex flex-col items-center justify-center text-center w-full pt-10 md:pt-20 pb-8 lg:items-start lg:text-left">
              <div className="w-full flex-1 pl-2">
                <div className="text-5xl md:text-7xl text-left font-extrabold">
                  <p className="text-gray-900">
                    Grow Your Practice With{" "}
                    <span className="text-blue-600">OkieDoc+</span>
                  </p>
                </div>
                <p className="pt-4 text-lg md:text-xl text-left font-normal text-gray-600">
                  Reach more patients, manage consultations effortlessly, and
                  earn online with the Philippines' leading telemedicine
                  platform.
                </p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row w-full md:w-120 gap-4">
              <button className=" group flex items-center font-semibold justify-center gap-2 flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all cursor-pointer">
                Join as a Specialist
                <MoveRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button className="flex items-center justify-center gap-2 flex-1 py-2 px-3 bg-white border border-gray-600 text-black font-semibold hover:bg-gray-200  rounded-lg transition-all cursor-pointer">
                Request Demo
              </button>
            </div>
            <div className="grid grid-cols-2 xl:flex gap-4 mt-6">
              {stats.map(({ icon, value, label }) => (
                <div
                  key={label}
                  className="flex flex-col w-full border bg-white border-gray-200 rounded-xl p-4 shadow-md"
                >
                  {icon}
                  <div className="flex flex-col mt-2">
                    <span className="font-bold text-xl">{value}</span>
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden xl:flex mp-4 mt-8 shrink-0 transition-all">
            <img
              src={LandingImageSpecialist}
              alt="Doctor typing on laptop"
              className="rounded-xl object-cover shadow-xl w-150 2xl:w-170 2xl:h-120  saturate-120"
            />
          </div>
        </div>
      </div>
      {/*Carousel*/}
      <section className="py-20 bg-linear-to-t from-white to-gray-50">
        <div className="w-full mt-6 flex flex-col items-center px-5 md:px-20 xl:px-50  gap-5">
          {/* Banner */}
          <div
            className="relative w-full h-80 xl:h-100 rounded-2xl overflow-hidden shadow-md cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div
              ref={containerRef}
              className="flex h-full"
              style={{
                width: `${infiniteSlides.length * 100}%`,
                transform: `translateX(calc(-${(current / infiniteSlides.length) * 100}% + ${dragOffset / infiniteSlides.length}px))`,
                transition: isDragging
                  ? "none"
                  : isTransitioning
                    ? "transform 500ms ease-in-out"
                    : "none",
              }}
            >
              {infiniteSlides.map((slide, i) => (
                <div
                  key={i}
                  className="relative h-full"
                  style={{ width: `${100 / infiniteSlides.length}%` }}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover brightness-90"
                    draggable="false"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-center px-8 gap-4">
                    <span className="text-white font-bold text-3xl max-w-lg">
                      {slide.title}
                    </span>
                    <button className="flex items-center hover:cursor-pointer  gap-1 bg-white text-blue-600 text-sm font-medium px-4 py-2 rounded-lg w-fit hover:bg-blue-50 transition-colors">
                      {slide.button} <MoveRight className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i + 1)}
                className={`rounded-full hover:bg-gray-800 hover:cursor-pointer transition-all duration-300 ${
                  (current === 0
                    ? slides.length
                    : current === infiniteSlides.length - 1
                      ? 1
                      : current) ===
                  i + 1
                    ? "bg-gray-800 w-1.75 h-1.75"
                    : "bg-gray-300 w-1.75 h-1.75"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/*Info-2*/}
      <section className="py-15 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Grow Your Practice
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Comprehensive tools designed specifically for healthcare
            professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6 lg:px-16">
          {tools.map(({ icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col w-full hover:shadow-lg transition-all bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="bg-blue-100 rounded-xl p-3 w-fit mb-4">
                {icon}
              </div>
              <span className="font-bold text-xl text-gray-900">{title}</span>
              <span className="text-base text-gray-500 mt-1">
                {description}
              </span>
            </div>
          ))}
        </div>
      </section>
      {/*Specialists-Feedback*/}
      <section className="bg-gray-50">
        <div className="flex flex-col justify-center items-center ">
          <div className="flex flex-col items-center p-6 gap-3 mt-15">
            <span className="text-3xl md:text-4xl text-center font-bold">
              Trusted by Healthcare Professionals
            </span>
            <span className="text-gray-600 text-lg">
              See what doctors are saying about OkieDoc+
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-6 px-4 md:px-20 xl:px-25 2xl:px-60 mb-20">
            {specialistsFeedback.map(
              ({ image, name, specialty, schedule, feedback }) => (
                <div
                  key={name}
                  className="flex flex-col w-full hover:shadow-md  transition-all bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                >
                  <div className="pb-2">{image}</div>
                  <div className="font-bold  text-[17px] text-black">
                    {name}
                  </div>
                  <span className="font-light text-[15px] text-blue-600">
                    {specialty}
                  </span>
                  <span className="font-light text-[15px] text-gray-700">
                    {schedule}
                  </span>
                  <span className="text-[14px] italic  text-gray-500 mt-1">
                    <span>"{feedback}"</span>
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>
      {/*Apply Now*/}
      <section className="py-20 px-8 bg-linear-to-b from-blue-600 to-blue-800">
        <div className="flex justify-center items-center">
          <div className="flex flex-col justify-center items-center gap-6">
            <h2 className="text-4xl md:text-[52px] md:w-150 text-center font-extrabold text-white">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-white text-center text-lg w-110 md:w-full md:text-lg">
              Join thousands of doctors who are already growing their practice
              with OkieDoc+
            </p>
            <button className="group gap-2 hover:cursor-pointer transition-all bg-white rounded-xl p-2 px-4 font-semibold text-lg items-center flex hover:bg-gray-200 text-blue-600">
              Apply Now{" "}
              <MoveRightIcon className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function PatientView({
  setActiveView,
}: {
  setActiveView: (view: "patient" | "specialist") => void;
}) {
  const navigate = useNavigate();
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [searchType, setSearchType] = useState("Doctor");
  const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false);
  const searchTypeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        searchTypeRef.current &&
        !searchTypeRef.current.contains(event.target as Node)
      ) {
        setIsSearchTypeOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const isExternalLink = (href: string) => /^https?:\/\//i.test(href);
  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const partners = [
    {
      label: "LGU Naga",
      href: "https://www2.naga.gov.ph/",
      icon: Building2Icon,
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Bicol Medical Center",
      href: "https://bmc.doh.gov.ph/",
      icon: Hospital,
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "PhilHealth",
      href: "https://www.philhealth.gov.ph/",
      icon: Heart,
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-50",
      textColor: "text-red-600",
    },
    {
      label: "Maxicare",
      href: "https://www.maxicare.com.ph/",
      icon: Shield,
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Medicard",
      href: "https://www.medicardphils.com/home/",
      icon: Shield,
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Intellicare",
      href: "https://site.intellicare.com.ph/",
      icon: Shield,
      bgColor: "bg-cyan-50",
      hoverColor: "hover:bg-cyan-50",
      textColor: "text-cyan-600",
    },
  ];
  const specialtiesExtended = [
    {
      label: "Opthalmology",
      icon: Eye,
      bgColor: "bg-indigo-50",
      hoverColor: "hover:bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Orthopedics",
      icon: Bone,
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "ENT",
      icon: Ear,
      bgColor: "bg-yellow-50",
      hoverColor: "hover:bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "Dermatology",
      icon: Smile,
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "OB-GYN",
      icon: Users2Icon,
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-50",
      textColor: "text-red-600",
    },
    {
      label: "General Practice",
      icon: User,
      bgColor: "bg-gray-50",
      hoverColor: "hover:bg-gray-50",
      textColor: "text-gray-600",
    },
  ];
  const specialties = [
    {
      label: "Pediatrics",
      icon: BabyIcon,
      bgColor: "bg-pink-50",
      hoverColor: "hover:bg-pink-50",
      textColor: "text-pink-600",
    },
    {
      label: "Psychiatry",
      icon: Brain,
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Internal Medicine",
      icon: Stethoscope,
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Pulmonology",
      icon: HeartPulse,
      bgColor: "bg-cyan-50",
      hoverColor: "hover:bg-cyan-50",
      textColor: "text-cyan-600",
    },
    {
      label: "Cardiology",
      icon: Heart,
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-50",
      textColor: "text-red-600",
    },
  ];
  const specialists = [
    {
      id: 1,
      name: "Dr. Maria Santos",
      specialization: "Pediatrician",
      experience:
        "Board-certified with 15 years experience in child healthcare",
      rating: 4.9,
      reviewCount: 127,
      imageUrl: undefined,
    },
    {
      id: 2,
      name: "Dr. Juan Reyes",
      specialization: "Cardiologist",
      experience: "Specialist in heart disease prevention and treatment",
      rating: 4.8,
      reviewCount: 98,
      imageUrl: undefined,
    },
    {
      id: 3,
      name: "Dr. Ana Cruz",
      specialization: "Psychiatrist",
      experience: "Expert in mental health and wellness counseling",
      rating: 5,
      reviewCount: 156,
      imageUrl: undefined,
    },
    {
      id: 4,
      name: "Dr. Pedro Garcia",
      specialization: "Internal Medicine",
      experience: "General practitioner specializing in adult healthcare",
      rating: 4.7,
      reviewCount: 89,
      imageUrl: undefined,
    },
  ];
  return (
    <div className="animate-in fade-in duration-500">
      {/*Location*/}
      <div className="flex items-center gap-2 text-sm border-b border-gray-100 text-gray-700 bg-blue-50 p-3 lg:pl-8 2xl:pl-52 transition-all">
        <MapPin className="text-blue-500 size-4" />
        <div>
          Serving
          <a className="font-semibold text-blue-500"> Naga City</a>
        </div>
      </div>
      {/*News Ticker*/}
      <div className="flex items-center w-full overflow-hidden whitespace-nowrap border-b border-green-200 ">
        <div className="relative z-10 shrink-0 flex items-center overflow-hidden gap-2 pl-3 pr-3 lg:pl-8 lg:pr-8 text-sm py-2  bg-green-200 text-green-800 font-semibold transition-all">
          <Bell className="size-4 text-green-800" />
          HEALTH UPDATES
        </div>
        <ul className="flex flex-1  bg-green-100 text-gray-700 text-sm gap-5 pl-2 py-2 animate-infinite-scroll">
          <li>
            <span>
              • Free COVID-19 vaccination available at all barangay health
              centers
            </span>
          </li>
          <li>
            <span>
              • PhilHealth Update: New benefit package now includes
              teleconsultation services centers
            </span>
          </li>
          <li>
            <span>
              • Health Advisory: Dengue cases reported in some barangays —
              please ensure proper sanitation centers
            </span>
          </li>
          <li>
            <span>
              • Announcement: OkieDoc+ now accepts PhilHealth e-konsulta program
              centers
            </span>
          </li>
          <li>
            <span>
              • Free COVID-19 vaccination available at all barangay health
              centers
            </span>
          </li>
          <li>
            <span>
              • PhilHealth Update: New benefit package now includes
              teleconsultation services centers
            </span>
          </li>
          <li>
            <span>
              • Health Advisory: Dengue cases reported in some barangays —
              please ensure proper sanitation centers
            </span>
          </li>
          <li>
            <span>
              • Announcement: OkieDoc+ now accepts PhilHealth e-konsulta program
              centers
            </span>
          </li>
        </ul>
      </div>
      {/*Info-1*/}
      <div className="bg-linear-to-r from-blue-50 to-white">
        <div className="flex flex-row justify-center p-4 pt-8 gap-12 pb-20">
          <div className="hidden xl:flex mp-4 mt-5 shrink-0 transition-all">
            <img
              src={LandingImage}
              alt="Doctor performing examination on patient"
              className=" rounded-xl object-cover shadow-xl size-150"
            ></img>
          </div>
          <div className="flex-1 max-w-3xl">
            <div className="flex flex-col items-center justify-center text-center w-full pt-10 md:pt-20 pb-8 lg:items-start lg:text-left">
              <div className="w-full flex-1 pl-2">
                <div className="text-5xl md:text-7xl font-extrabold">
                  <p className="text-gray-900">
                    Healthcare for Everyone —{" "}
                    <span className="text-blue-600">Anytime, Anywhere</span>
                  </p>
                </div>
                <p className="pt-4 text-lg md:text-xl font-normal text-gray-600">
                  Connect with licensed doctors, health services, and trusted
                  care providers.
                </p>
              </div>
            </div>
            <div className="flex flex-col w-full max-w-7xl mx-auto border bg-white border-gray-200 rounded-xl p-8 shadow-xl">
              <div className="w-full space-y-4">
                {/*Dropdown and Search Input*/}
                <div className="flex flex-col md:flex-row w-full gap-4">
                  <div ref={searchTypeRef} className="relative flex-1">
                    <button
                      type="button"
                      onClick={() => setIsSearchTypeOpen((prev) => !prev)}
                      aria-expanded={isSearchTypeOpen}
                      className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3 bg-gray-100 rounded-lg"
                    >
                      <span>{searchType}</span>
                      <ChevronDown
                        className={`size-4 text-gray-400 transition-transform ${
                          isSearchTypeOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <ul
                      className={`absolute w-full z-20 mt-1 top-full origin-top-left rounded-lg border border-gray-200 bg-gray-50 shadow-md transition-all duration-200 p-4 ${
                        isSearchTypeOpen
                          ? "visible opacity-100 scale-100"
                          : "invisible opacity-0 scale-95 pointer-events-none"
                      }`}
                    >
                      <li
                        onClick={() => {
                          setSearchType("Doctor");
                          setIsSearchTypeOpen(false);
                        }}
                        className="pb-2 hover:bg-gray-100 rounded px-2 cursor-pointer"
                      >
                        Doctor
                      </li>
                      <li
                        onClick={() => {
                          setSearchType("Specialty");
                          setIsSearchTypeOpen(false);
                        }}
                        className="pb-2 hover:bg-gray-100 rounded px-2 cursor-pointer"
                      >
                        Specialty
                      </li>
                      <li
                        onClick={() => {
                          setSearchType("Hospital");
                          setIsSearchTypeOpen(false);
                        }}
                        className="pb-2 hover:bg-gray-100 rounded px-2 cursor-pointer"
                      >
                        Hospital
                      </li>
                      <li
                        onClick={() => {
                          setSearchType("Clinic");
                          setIsSearchTypeOpen(false);
                        }}
                        className="pb-2 hover:bg-gray-100 rounded px-2 cursor-pointer"
                      >
                        Clinic
                      </li>
                      <li
                        onClick={() => {
                          setSearchType("HMO");
                          setIsSearchTypeOpen(false);
                        }}
                        className="hover:bg-gray-100 rounded px-2 cursor-pointer"
                      >
                        HMO
                      </li>
                    </ul>
                  </div>

                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 flex pl-3 items-center pointer-events-none">
                      <Search className="size-4 text-gray-400" />
                    </div>
                    <input
                      type="search"
                      placeholder={`Search for ${searchType.toLowerCase()}...`}
                      className="bg-gray-100 text-gray-400 rounded-lg py-3 pl-10 w-full outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/*Action Buttons*/}
                <div className="flex flex-col md:flex-row w-full gap-4">
                  <button className="flex items-center justify-center gap-2 flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all cursor-pointer">
                    <Search className="size-4" />
                    Search Now
                  </button>

                  <button
                    className="flex items-center justify-center gap-2 flex-1 py-3 px-4 bg-white border border-green-500 text-green-500 hover:bg-green-100 hover:text-green-700 rounded-lg transition-all cursor-pointer"
                    onClick={() => setIsCallbackModalOpen(true)}
                  >
                    <MessageSquare className="size-4" />
                    Request Callback
                  </button>
                  <CallbackRequest
                    isOpen={isCallbackModalOpen}
                    onClose={() => setIsCallbackModalOpen(false)}
                  />
                </div>
              </div>
            </div>
            <div className="p-4 pt-8 flex-col flex sm:flex-row items-center justify-center  gap-4">
              <div className="flex items-center gap-2 ">
                <Phone className="size-5 text-blue-500" />
                <span className="font-light text-sm sm:text-base">
                  24/7 Hotline:{" "}
                  <span className="text-blue-600 font-medium">
                    (02) 8802-5555
                  </span>
                </span>
              </div>
              <span className="text-gray-400 hidden sm:flex ">•</span>
              <span className="text-gray-600 text-sm sm:text-base">
                Available for urgent medical concerns
              </span>
            </div>
            <div>
              <div className="grid grid-cols-2 sm:flex sm:justify-between justify-items-center  sm:items-center gap-4 p-2">
                <div className="flex items-center gap-2">
                  <div className="bg-green-200 size-10 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="text-green-700 size-4 sm:size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs sm:text-sm">
                      Licensed Doctors
                    </span>
                    <span className="text-xs sm:text-sm">PRC-verified</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-blue-200 size-10 rounded-full flex items-center justify-center shrink-0">
                    <Lock className="text-blue-700 size-4 sm:size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs sm:text-sm">
                      Secure Platform
                    </span>
                    <span className="text-xs sm:text-sm">Data protected</span>
                  </div>
                </div>

                <div className="col-span-2 sm:col-auto flex items-center gap-2">
                  <div className="bg-purple-200 size-10 rounded-full flex items-center justify-center shrink-0">
                    <Users className="text-purple-700 size-4 sm:size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs sm:text-sm">
                      Community Health
                    </span>
                    <span className="text-xs sm:text-sm">Integrated care</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*Info-2*/}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find the Right Specialist
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Browse by medical specialty and connect with expert doctors
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-3">
          {/* Row 1 — 5 tall cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {specialties.map((item, index) => (
              <SpecialtyCard key={index} {...item} />
            ))}
          </div>

          {/* Row 2 — 6 shorter cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {specialtiesExtended.map((item, index) => (
              <SpecialtyCardWide key={index} {...item} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center mt-8">
          <span className="text-blue-500 hover:text-blue-600 cursor-pointer transition-all text-base sm:text-lg font-semibold flex items-center gap-2">
            View All Specialties
            <MoveRight className="size-5" />
          </span>
        </div>
      </section>
      {/*Featured-Specialists*/}
      <section className="bg-gray-50">
        <div className="flex flex-col justify-center items-center ">
          <div className="flex flex-col items-center p-6 gap-3 mt-15">
            <span className="text-3xl md:text-4xl font-bold">
              Featured Specialists
            </span>
            <span className="text-gray-600 text-lg">
              Trusted healthcare providers ready to serve you
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-6 p-6">
            {specialists.map((doctor) => (
              <SpecialistCard
                key={doctor.id}
                name={doctor.name}
                specialization={doctor.specialization}
                experience={doctor.experience}
                rating={doctor.rating}
                reviewCount={doctor.reviewCount}
                imageUrl={doctor.imageUrl}
                onConsult={() => null}
              />
            ))}
            {/*Network Card*/}
            <div
              className="flex flex-col rounded-xl overflow-hidden group justify-center items-center bg-blue-600
            h-60 gap-5 w-full md:col-span-2 2xl:col-span-4"
            >
              <div className="flex-col flex items-center justify-center gap-2 px-4">
                <p className="text-white font-bold text-3xl text-center">
                  Be Part of Our Growing Network
                </p>
                <p className="text-gray-100 font-light text-center">
                  Join OkieDoc+ and connect with thousands of patients seeking
                  quality healthcare. Expand your practice with our telemedicine
                  platform.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveView("specialist");
                  navigate("/");
                }}
                className="cursor-pointer hover:bg-gray-100 transition-all bg-white w-50 p-3 rounded-xl text-[15px] text-blue-600"
              >
                Register as Specialist
              </button>
            </div>
          </div>
        </div>
      </section>
      {/*Reviews*/}
      <section className="py-15 px-8 bg-white">
        <div className="flex justify-center items-center">
          <div className="flex flex-col justify-center items-center">
            <h2 className="text-3xl md:text-4xl  font-extrabold text-gray-900 mb-4">
              Stories from Our Community
            </h2>
            <p className="text-gray-600  text-sm md:text-lg">
              See what Nagueños are saying about their OkieDoc+ experience
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4 p-8">
          <div className="group hover:shadow-lg transition-all w-full md:w-80 lg:w-96 md:flex-none border border-blue-200 bg-blue-50 rounded-lg p-6">
            <div className="flex flex-col gap-2 p-2">
              <span className="flex">
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
              </span>
              <span className="pt-2 pb-2 text-gray-700">
                "OkieDoc+ made it so easy to consult with a pediatrician for my
                son. The doctor was professional and caring. Highly
                recommended!"
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-500 text-white text-base rounded-full size-12 flex items-center justify-center font-bold">
                MD
              </span>
              <div className="flex flex-col w-30">
                <span className="text-base">Maria Dela Cruz</span>
                <span className="font-light text-gray-600">Naga City</span>
              </div>
            </div>
          </div>
          <div className="group hover:shadow-lg transition-all w-full md:w-80 lg:w-96 md:flex-none border border-blue-200 bg-blue-50 rounded-lg p-6">
            <div className="flex flex-col gap-2 p-2">
              <span className="flex">
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
              </span>
              <span className="pt-2 pb-2 text-gray-700">
                "As a senior citizen, I appreciate how convenient this service
                is. I can consult with my doctor without leaving home. Thank
                you, OkieDoc+!"
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-500 text-white text-lg rounded-full size-12 flex items-center justify-center font-bold">
                RS
              </span>
              <div className="flex flex-col w-30">
                <span>Roberto Santos</span>
                <span className="font-light text-gray-600">Naga City</span>
              </div>
            </div>
          </div>
          <div className="group hover:shadow-lg transition-all w-full md:w-80 lg:w-96 md:flex-none border border-blue-200 bg-blue-50 rounded-lg p-6">
            <div className="flex flex-col gap-2 p-2">
              <span className="flex">
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
                <Star className="fill-yellow-400 text-yellow-400" />
              </span>
              <span className="pt-2 pb-2 text-gray-700">
                "Fast, reliable, and affordable healthcare. The teleconsultation
                saved me time and money. Will definitely use this again"
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-500 text-white text-lg rounded-full size-12 flex items-center justify-center font-bold">
                AR
              </span>
              <div className="flex flex-col w-30">
                <span>Angela Reyes</span>
                <span className="font-light text-gray-600">Naga City</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/*Trusted-Partners*/}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl  font-extrabold text-gray-900 mb-4">
            Trusted by Healthcare Partners
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Collaborating with leading institutions to serve you better
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-fit mx-auto">
          {partners.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={(e) => {
                if (!isExternalLink(item.href)) {
                  e.preventDefault();
                  handleNavigate(item.href);
                }
              }}
              target={isExternalLink(item.href) ? "_blank" : undefined}
              rel={
                isExternalLink(item.href) ? "noopener noreferrer" : undefined
              }
              className="text-left rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <PartnerCard
                icon={item.icon}
                label={item.label}
                bgColor={item.bgColor}
                hoverColor={item.hoverColor}
                textColor={item.textColor}
              />
            </a>
          ))}
        </div>

        <div className="flex flex-col justify-center items-center p-14 gap-2">
          <span>Interested in partnering with OkieDoc+?</span>
          <span className="text-blue-500 hover:text-blue-600 hover:cursor-pointer transition-all items-center justify-center flex  text-base  font-semibold">
            Request Partnership Info
            <span className="pl-2">
              <MoveRight className="size-5" />
            </span>
          </span>
        </div>
      </section>
    </div>
  );
}

type LandingPageProps = {
  activeView: "patient" | "specialist";
  setActiveView: (view: "patient" | "specialist") => void;
};

export function LandingPage({ activeView, setActiveView }: LandingPageProps) {
  return (
    <div className="pt-20">
      <main>
        {activeView === "patient" ? (
          <PatientView setActiveView={setActiveView} />
        ) : (
          <DoctorView />
        )}
      </main>
    </div>
  );
}

export default LandingPage;
