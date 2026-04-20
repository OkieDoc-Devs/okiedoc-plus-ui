import "./auth.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaPlus,
  FaRegAddressCard,
  FaTrash,
  FaShieldAlt,
  FaStethoscope,
  FaRegClock,
  FaUpload,
  FaUser,
} from "react-icons/fa";
import { usePSGC } from "../hooks/usePSGC";
import { apiRequest } from "../api/apiClient";

export default function SpecialistRegistration() {
  const navigate = useNavigate();
  const {
    regions,
    provinces,
    cities,
    barangays,
    fetchProvinces,
    fetchCities,
    fetchBarangays,
  } = usePSGC();

  const emptyForm = {
    specialistType: "",
    firstName: "",
    lastName: "",
    middleName: "",
    gender: "",
    email: "",
    facebookProfileLink: "",
    password: "",
    confirmPassword: "",
    bMonth: "",
    bDay: "",
    bYear: "",
    primarySpecialty: "",
    subSpecialties: "",
    hospitalName: "",
    licenseNumber: "",
    prcExpiryMonth: "",
    prcExpiryDay: "",
    prcExpiryYear: "",
    s2Number: "",
    ptrNumber: "",
    mobileNumber: "",
    barangay: "",
    city: "",
    province: "",
    region: "",
    zipCode: "4402",
    addressLine1: "",
    addressLine2: "",
    country: "Philippines",
    initialConsultationFee: "",
    followUpConsultationFee: "",
    medicalCertificateFee: "",
    seniorDiscount: "20",
    pwdDiscount: "20",
    disbursementMethod: "Bank Transfer",
    bankName: "",
    accountName: "",
    accountNumber: "",
  };

  const [formData, setFormData] = useState(emptyForm);
  const [eSignatureFile, setESignatureFile] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [prcIdFile, setPrcIdFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [practiceSchedule, setPracticeSchedule] = useState({
    monday: { start: "", end: "" },
    tuesday: { start: "", end: "" },
    wednesday: { start: "", end: "" },
    thursday: { start: "", end: "" },
    friday: { start: "", end: "" },
    saturday: { start: "", end: "" },
    sunday: { start: "", end: "" },
  });
  const [hmoPartnerships, setHmoPartnerships] = useState([
    { hmoName: "", details: "", billingContact: "" },
  ]);
  const [hospitalAffiliations, setHospitalAffiliations] = useState([
    { hospitalName: "", address: "" },
  ]);
  const [clinicAffiliations, setClinicAffiliations] = useState([
    { clinicName: "", address: "" },
  ]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  useEffect(() => {
    if (regions.length > 0 && !formData.region) {
      const defaultRegion = regions.find((r) => /bicol/i.test(r.name)) || regions[0];
      setFormData((prev) => ({ ...prev, region: defaultRegion.name }));
      fetchProvinces(defaultRegion.code);
    }
  }, [regions, formData.region, fetchProvinces]);

  useEffect(() => {
    if (provinces.length > 0 && !formData.province) {
      const defaultProvince = provinces.find((p) => /camarines sur/i.test(p.name)) || provinces[0];
      setFormData((prev) => ({ ...prev, province: defaultProvince.name }));
      fetchCities(defaultProvince.code);
    }
  }, [provinces, formData.province, fetchCities]);

  useEffect(() => {
    if (cities.length > 0 && !formData.city) {
      const defaultCity =
        cities.find((c) => /naga/i.test(c.name) || c.name === "City of Naga") || cities[0];
      setFormData((prev) => ({ ...prev, city: defaultCity.name }));
      fetchBarangays(defaultCity.code);
    }
  }, [cities, formData.city, fetchBarangays]);

  useEffect(() => {
    if (barangays.length > 0 && !formData.barangay) {
      const defaultBarangay = barangays.find((b) => /san vicente/i.test(b.name)) || barangays[0];
      setFormData((prev) => ({ ...prev, barangay: defaultBarangay.name }));
    }
  }, [barangays, formData.barangay]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    let filteredValue = value;

    if (["firstName", "lastName", "middleName"].includes(id)) {
      filteredValue = value.replace(/[^a-zA-Z\s-]/g, "");
    } else if (id === "mobileNumber") {
      filteredValue = value.replace(/[^0-9+]/g, "");
    } else if (id === "zipCode") {
      filteredValue = value.replace(/[^0-9]/g, "").slice(0, 4);
    } else if (["addressLine1", "addressLine2"].includes(id)) {
      filteredValue = value.replace(/[^a-zA-Z0-9\s,]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [id]: filteredValue,
    }));

    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.bMonth || !formData.bDay || !formData.bYear) {
      newErrors.birthday = "Complete birthday is required";
    } else {
      const birthDate = new Date(`${formData.bYear}-${formData.bMonth}-${formData.bDay}`);
      if (birthDate > new Date()) {
        newErrors.birthday = "Birthday cannot be in the future";
      }
    }

    if (!formData.specialistType) {
      newErrors.specialistType = "Choose a registration type";
    }

    if (formData.specialistType === "specialist" && !formData.primarySpecialty.trim()) {
      newErrors.primarySpecialty = "Medical specialty is required";
    }

    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "License number is required";
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else {
      const mobileRegex = /^(09\d{9}|\+639\d{9})$/;
      if (!mobileRegex.test(formData.mobileNumber.trim())) {
        newErrors.mobileNumber =
          "Must be a valid PH number (e.g., 09123456789 or +639123456789)";
      }
    }

    if (formData.prcExpiryMonth && formData.prcExpiryDay && formData.prcExpiryYear) {
      const expiry = new Date(
        `${formData.prcExpiryYear}-${formData.prcExpiryMonth}-${formData.prcExpiryDay}`,
      );
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + 15);
      minDate.setHours(0, 0, 0, 0);

      if (expiry < minDate) {
        newErrors.prcExpiryDate = "Expiry date must be at least 15 days from today";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const payload = new FormData();
      const appendIfValue = (key, value) => {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          payload.append(key, value);
        }
      };

      payload.append("firstName", formData.firstName);
      payload.append("lastName", formData.lastName);
      appendIfValue("middleName", formData.middleName);
      appendIfValue("gender", formData.gender);
      payload.append("email", formData.email);
      appendIfValue("facebookProfileLink", formData.facebookProfileLink);
      payload.append("mobileNumber", formData.mobileNumber);
      payload.append("password", formData.password);
      payload.append("licenseNumber", formData.licenseNumber);
      appendIfValue("specialistType", formData.specialistType);
      appendIfValue("hospitalName", formData.hospitalName);
      appendIfValue("country", formData.country);
      payload.append("practiceSchedule", JSON.stringify(practiceSchedule));
      payload.append("hmoPartnerships", JSON.stringify(hmoPartnerships));
      payload.append("hospitalAffiliations", JSON.stringify(hospitalAffiliations));
      payload.append("clinicAffiliations", JSON.stringify(clinicAffiliations));
      appendIfValue("initialConsultationFee", formData.initialConsultationFee);
      appendIfValue("followUpConsultationFee", formData.followUpConsultationFee);
      appendIfValue("medicalCertificateFee", formData.medicalCertificateFee);
      appendIfValue("seniorDiscount", formData.seniorDiscount);
      appendIfValue("pwdDiscount", formData.pwdDiscount);
      appendIfValue("disbursementMethod", formData.disbursementMethod);
      appendIfValue("bankName", formData.bankName);
      appendIfValue("accountName", formData.accountName);
      appendIfValue("accountNumber", formData.accountNumber);

      appendIfValue(
        "primarySpecialty",
        formData.primarySpecialty || (formData.specialistType === "gp" ? "General Practice" : ""),
      );
      appendIfValue("subSpecialties", formData.subSpecialties);
      if (formData.s2Number) payload.append("s2Number", formData.s2Number);

      payload.append("birthday", `${formData.bYear}-${formData.bMonth}-${formData.bDay}`);

      appendIfValue("ptrNumber", formData.ptrNumber);
      appendIfValue("barangay", formData.barangay);
      appendIfValue("city", formData.city);
      appendIfValue("province", formData.province);
      appendIfValue("region", formData.region);
      appendIfValue("zipCode", formData.zipCode);
      appendIfValue("addressLine1", formData.addressLine1);
      appendIfValue("addressLine2", formData.addressLine2);
      if (profilePictureFile) payload.append("profilePicture", profilePictureFile);
      if (prcIdFile) payload.append("prcId", prcIdFile);
      if (eSignatureFile) payload.append("eSignature", eSignatureFile);

      const result = await apiRequest("/api/v1/auth/specialist-register", {
        method: "POST",
        disableAuthRedirect: true,
        body: payload,
      });

      if (result.success || result.message) {
        const approvedUser = result.user
          ? {
              ...result.user,
              role: result.user.role || "specialist",
              userType: result.user.userType || result.user.role || "specialist",
            }
          : null;

        if (approvedUser) {
          localStorage.setItem("okiedoc_specialist_user", JSON.stringify(approvedUser));
          localStorage.setItem("okiedoc_user_type", "specialist");
        }

        // Full reload so the auth provider sees the new session immediately.
        window.location.assign("/specialist-dashboard");
      } else {
        setErrors({ email: result.message || "Registration failed." });
        if (result.emailAlreadyInUse) {
          setErrors({
            email: result.emailAlreadyInUse.message || "Email already in use/Application submitted.",
          });
        }
        window.scrollTo(0, 0);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      const errorMessage =
        error?.emailAlreadyInUse?.message ||
        error?.message ||
        error?.error ||
        (typeof error === "string" ? error : "");

      if (/already been submitted|already in use|conflict/i.test(errorMessage)) {
        window.location.assign("/specialist-dashboard");
        return;
      }

      setErrors({
        email: errorMessage || "Network error. Please try again later.",
      });
      window.scrollTo(0, 0);
    }
  };

  const showSpecialistFields = formData.specialistType === "specialist";
  const currentYear = new Date().getFullYear();
  const birthdayDays = new Date(formData.bYear || 2000, formData.bMonth || 1, 0).getDate();
  const expiryDays = new Date(
    formData.prcExpiryYear || currentYear,
    formData.prcExpiryMonth || 1,
    0,
  ).getDate();

  const stepItems = [
    {
      id: "personal-data",
      title: "Personal Data",
      caption: "Step 1",
      icon: <FaUser />,
    },
    {
      id: "medical-data",
      title: "Medical Data",
      caption: "Step 2",
      icon: <FaStethoscope />,
    },
    {
      id: "hmo-affiliations",
      title: "HMO / Affiliations",
      caption: "Step 3",
      icon: <FaRegAddressCard />,
    },
    {
      id: "professional-fees",
      title: "Professional Fees",
      caption: "Step 4",
      icon: <FaStethoscope />,
    },
    {
      id: "terms-conditions",
      title: "Terms & Conditions",
      caption: "Step 5",
      icon: <FaShieldAlt />,
    },
  ];

  const activeStepId = stepItems[currentStep]?.id || stepItems[0].id;
  const progressValue = Math.round((currentStep / stepItems.length) * 100);

  const validateStep = (stepIndex) => {
    const stepErrors = {};

    if (stepIndex === 0) {
      if (!formData.firstName.trim()) stepErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) stepErrors.lastName = "Last name is required";

      if (!formData.mobileNumber.trim()) {
        stepErrors.mobileNumber = "Mobile number is required";
      } else {
        const mobileRegex = /^(09\d{9}|\+639\d{9})$/;
        if (!mobileRegex.test(formData.mobileNumber.trim())) {
          stepErrors.mobileNumber =
            "Must be a valid PH number (e.g., 09123456789 or +639123456789)";
        }
      }

      if (!formData.email.trim()) {
        stepErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        stepErrors.email = "Please enter a valid email address";
      }

      if (!formData.bMonth || !formData.bDay || !formData.bYear) {
        stepErrors.birthday = "Complete birthday is required";
      }

      if (!formData.gender) {
        stepErrors.gender = "Gender is required";
      }

      if (!formData.region) {
        stepErrors.region = "Region is required";
      }
      if (!formData.province) {
        stepErrors.province = "Province is required";
      }
      if (!formData.city) {
        stepErrors.city = "City is required";
      }
      if (!formData.barangay) {
        stepErrors.barangay = "Barangay is required";
      }
      if (!formData.addressLine1.trim()) {
        stepErrors.addressLine1 = "Address line is required";
      }

      if (!formData.password) {
        stepErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        stepErrors.password = "Password must be at least 6 characters long";
      }

      if (formData.password !== formData.confirmPassword) {
        stepErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (stepIndex === 1) {
      if (!formData.specialistType) {
        stepErrors.specialistType = "Choose a registration type";
      }
      if (!formData.licenseNumber.trim()) {
        stepErrors.licenseNumber = "License number is required";
      }
      if (!formData.prcExpiryMonth || !formData.prcExpiryDay || !formData.prcExpiryYear) {
        stepErrors.prcExpiryDate = "PRC expiration date is required";
      }
      if (formData.specialistType === "specialist" && !formData.primarySpecialty.trim()) {
        stepErrors.primarySpecialty = "Medical specialty is required";
      }
      if (!formData.hospitalName.trim()) {
        stepErrors.hospitalName = "Hospital name is required";
      }
      if (!prcIdFile) {
        stepErrors.prcId = "PRC ID upload is required";
      }
    }

    if (stepIndex === 3) {
      if (!formData.initialConsultationFee) {
        stepErrors.initialConsultationFee = "Initial consultation fee is required";
      }
      if (!formData.followUpConsultationFee) {
        stepErrors.followUpConsultationFee = "Follow-up consultation fee is required";
      }
      if (!formData.medicalCertificateFee) {
        stepErrors.medicalCertificateFee = "Medical certificate fee is required";
      }
      if (!formData.bankName.trim()) {
        stepErrors.bankName = "Bank name is required";
      }
      if (!formData.accountName.trim()) {
        stepErrors.accountName = "Account name is required";
      }
      if (!formData.accountNumber.trim()) {
        stepErrors.accountNumber = "Account number is required";
      }
    }

    if (stepIndex === 4) {
      if (!acceptedTerms) {
        stepErrors.acceptedTerms = "You must accept the Terms & Conditions";
      }
      if (!acceptedPrivacy) {
        stepErrors.acceptedPrivacy = "You must accept the Data Privacy Policy";
      }
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...stepErrors }));
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, stepItems.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scheduleDays = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const updateListItem = (setter, index, key, value) => {
    setter((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [key]: value } : item
    )));
  };

  return (
    <div className="login-page-wrapper specialist-registration-page">
      <div className="specialist-shell">
        <aside className="specialist-sidebar-card">
          <div className="header-inside-container specialist-sidebar-header">
            <button className="back-btn login-back-btn" onClick={() => navigate("/")}>
              <span className="material-symbols-outlined">arrow_back_2</span>
            </button>
            <img src="/okie-doc-logo.png" alt="OkieDoc+" className="logo-image" />
            <div style={{ width: "2.5rem" }} />
          </div>

          <div className="specialist-step-list">
            {stepItems.map((step, index) => (
              <div
                key={step.id}
                className={`specialist-step-card ${
                  step.id === activeStepId ? "active" : ""
                } ${index < currentStep ? "done" : ""}`}
              >
                <span className="specialist-step-icon">{index < currentStep ? <FaCheck /> : step.icon}</span>
                <span className="specialist-step-copy">
                  <span className="specialist-step-caption">{step.caption}</span>
                  <span className="specialist-step-title">{step.title}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="specialist-progress-card">
            <div className="specialist-progress-meta">
              <span>Progress</span>
              <strong>{progressValue}%</strong>
            </div>
            <div className="specialist-progress-track">
              <span className="specialist-progress-bar" style={{ width: `${progressValue}%` }} />
            </div>
            <p className="specialist-progress-note">
              Complete the required sections to submit your specialist application.
            </p>
          </div>
        </aside>

        <div className="specialist-form-card">
          <div className="specialist-hero">
            <div>
              <p className="specialist-eyebrow">Medical Professional Registration</p>
              <h1 className="login-title specialist-title">Create your specialist profile</h1>
              <p className="login-subtitle specialist-subtitle">
              </p>
            </div>
          </div>

          <form className="login-form specialist-form-layout" onSubmit={handleSubmit}>
            {errors.email && (
              <div className="auth-alert auth-alert--error">{errors.email}</div>
            )}

            {currentStep === 0 && (
            <section className="specialist-form-section" id="personal-data">
              <div className="specialist-section-header">
                <div>
                  <h2>Personal Data</h2>
                  <p>Please provide your personal information to get started.</p>
                </div>
                <span className="specialist-section-chip">
                  <FaRegAddressCard />
                  Identity
                </span>
              </div>

              <div className="specialist-grid specialist-grid--two">
                <div className="specialist-field">
                  <label className="login-label" htmlFor="firstName">
                    First Name <span>*</span>
                  </label>
                  <input
                    className={`login-input ${errors.firstName ? "error" : ""}`}
                    id="firstName"
                    type="text"
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    maxLength={150}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="lastName">
                    Last Name <span>*</span>
                  </label>
                  <input
                    className={`login-input ${errors.lastName ? "error" : ""}`}
                    id="lastName"
                    type="text"
                    placeholder="Dela Cruz"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    maxLength={150}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="middleName">
                    Middle Name
                  </label>
                  <input
                    className="login-input"
                    id="middleName"
                    type="text"
                    placeholder="Santos"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    maxLength={150}
                  />
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="mobileNumber">
                    Mobile Number <span>*</span>
                  </label>
                  <input
                    className={`login-input ${errors.mobileNumber ? "error" : ""}`}
                    id="mobileNumber"
                    type="tel"
                    placeholder="+639123456789"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    maxLength={13}
                  />
                  {errors.mobileNumber && (
                    <span className="error-message">{errors.mobileNumber}</span>
                  )}
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="email">
                    Email Address <span>*</span>
                  </label>
                  <input
                    className={`login-input ${errors.email ? "error" : ""}`}
                    id="email"
                    type="email"
                    placeholder="juan.delacruz@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="region">
                    Region <span>*</span>
                  </label>
                  <select
                    className={`login-input ${errors.region ? "error" : ""}`}
                    id="region"
                    value={formData.region}
                    onChange={(e) => {
                      const selectedRegion = regions.find((region) => region.name === e.target.value);
                      handleInputChange(e);
                      fetchProvinces(selectedRegion?.code);
                      setFormData((prev) => ({ ...prev, province: "", city: "", barangay: "" }));
                    }}
                  >
                    <option value="">Select Region</option>
                    {regions.map((region) => (
                      <option key={region.code} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                  {errors.region && <span className="error-message">{errors.region}</span>}
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="province">
                    Province <span>*</span>
                  </label>
                  <select
                    className={`login-input ${errors.province ? "error" : ""}`}
                    id="province"
                    value={formData.province}
                    onChange={(e) => {
                      const selectedProvince = provinces.find(
                        (province) => province.name === e.target.value,
                      );
                      handleInputChange(e);
                      fetchCities(selectedProvince?.code);
                      setFormData((prev) => ({ ...prev, city: "", barangay: "" }));
                    }}
                    disabled={!formData.region}
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  {errors.province && <span className="error-message">{errors.province}</span>}
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="city">
                    City / Municipality <span>*</span>
                  </label>
                  <select
                    className={`login-input ${errors.city ? "error" : ""}`}
                    id="city"
                    value={formData.city}
                    onChange={(e) => {
                      const selectedCity = cities.find((city) => city.name === e.target.value);
                      handleInputChange(e);
                      fetchBarangays(selectedCity?.code);
                      setFormData((prev) => ({ ...prev, barangay: "" }));
                    }}
                    disabled={!formData.province}
                  >
                    <option value="">Select City / Municipality</option>
                    {cities.map((city) => (
                      <option key={city.code} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="barangay">
                    Barangay <span>*</span>
                  </label>
                  <select
                    className={`login-input ${errors.barangay ? "error" : ""}`}
                    id="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    disabled={!formData.city}
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map((barangay) => (
                      <option key={barangay.code} value={barangay.name}>
                        {barangay.name}
                      </option>
                    ))}
                  </select>
                  {errors.barangay && <span className="error-message">{errors.barangay}</span>}
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="zipCode">
                    ZIP Code
                  </label>
                  <input
                    className={`login-input ${errors.zipCode ? "error" : ""}`}
                    id="zipCode"
                    type="text"
                    placeholder="4400"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    maxLength={4}
                  />
                  {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                </div>

                <div className="specialist-field specialist-field--full">
                  <label className="login-label" htmlFor="addressLine1">
                    Address Line <span>*</span>
                  </label>
                  <input
                    className={`login-input ${errors.addressLine1 ? "error" : ""}`}
                    id="addressLine1"
                    type="text"
                    placeholder="House No., Street"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    maxLength={150}
                  />
                  {errors.addressLine1 && (
                    <span className="error-message">{errors.addressLine1}</span>
                  )}
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="gender">
                    Gender <span>*</span>
                  </label>
                  <select
                    className={`login-input ${errors.gender ? "error" : ""}`}
                    id="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && <span className="error-message">{errors.gender}</span>}
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="password">
                    Password <span>*</span>
                  </label>
                  <div className="login-password">
                    <input
                      className={`login-input ${errors.password ? "error" : ""}`}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className={`password-toggle ${showPassword ? "visible" : "hidden"}`}
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="confirmPassword">
                    Confirm Password <span>*</span>
                  </label>
                  <div className="login-password">
                    <input
                      className={`login-input ${errors.confirmPassword ? "error" : ""}`}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className={`password-toggle ${showConfirmPassword ? "visible" : "hidden"}`}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword}</span>
                  )}
                </div>

                <div className="specialist-field specialist-field--full">
                  <label className="login-label" htmlFor="facebookProfileLink">
                    Facebook Profile Link
                  </label>
                  <input
                    className="login-input"
                    id="facebookProfileLink"
                    type="url"
                    placeholder="https://facebook.com/yourprofile"
                    value={formData.facebookProfileLink}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="specialist-field">
                  <label className="login-label">
                    Birth Date <span>*</span>
                  </label>
                  <div className="specialist-date-grid">
                    <select
                      className={`login-input ${errors.birthday ? "error" : ""}`}
                      id="bMonth"
                      value={formData.bMonth}
                      onChange={handleInputChange}
                    >
                      <option value="">Month</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month.toString().padStart(2, "0")}>
                          {new Date(0, month - 1).toLocaleString("en-US", { month: "short" })}
                        </option>
                      ))}
                    </select>
                    <select
                      className={`login-input ${errors.birthday ? "error" : ""}`}
                      id="bDay"
                      value={formData.bDay}
                      onChange={handleInputChange}
                    >
                      <option value="">Day</option>
                      {Array.from({ length: birthdayDays }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day.toString().padStart(2, "0")}>
                          {day}
                        </option>
                      ))}
                    </select>
                    <select
                      className={`login-input ${errors.birthday ? "error" : ""}`}
                      id="bYear"
                      value={formData.bYear}
                      onChange={handleInputChange}
                    >
                      <option value="">Year</option>
                      {Array.from({ length: currentYear - 1920 + 1 }, (_, i) => currentYear - i).map(
                        (year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  {errors.birthday && <span className="error-message">{errors.birthday}</span>}
                </div>
              </div>
              <div className="specialist-grid specialist-grid--uploads">
                <div className="specialist-field">
                  <label className="login-label" htmlFor="profilePicture">
                    Profile Picture
                  </label>
                  <label htmlFor="profilePicture" className="specialist-upload-card specialist-upload-card--action">
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/jpeg,image/png"
                      className="specialist-hidden-input"
                      onChange={(event) => {
                        const file = event.target.files[0];
                        if (!file) {
                          setProfilePictureFile(null);
                          return;
                        }
                        setProfilePictureFile(file);
                      }}
                    />
                    <div className="specialist-upload-icon">
                      <FaUser />
                    </div>
                    <h3>
                      {profilePictureFile ? profilePictureFile.name : "Click to upload profile picture"}
                    </h3>
                    <p>JPG or PNG, maximum 5MB recommended.</p>
                  </label>
                </div>

                <div className="specialist-field">
                  <label className="login-label" htmlFor="eSignature">
                    E-Signature Upload
                  </label>
                  <label
                    htmlFor="eSignature"
                    className={`specialist-upload-card specialist-upload-card--action ${
                      errors.eSignature ? "error" : ""
                    }`}
                  >
                    <input
                      id="eSignature"
                      type="file"
                      accept="image/png"
                      className="specialist-hidden-input"
                      onChange={(event) => {
                        const file = event.target.files[0];
                        if (file && file.type !== "image/png") {
                          setErrors((prev) => ({
                            ...prev,
                            eSignature: "Only PNG files are accepted for e-signature",
                          }));
                          setESignatureFile(null);
                          event.target.value = "";
                        } else {
                          setErrors((prev) => ({ ...prev, eSignature: "" }));
                          setESignatureFile(file);
                        }
                      }}
                    />
                    <div className="specialist-upload-icon">
                      <FaUpload />
                    </div>
                    <h3>{eSignatureFile ? eSignatureFile.name : "Click to upload e-signature"}</h3>
                    <p>PNG format only, maximum 2MB recommended.</p>
                  </label>
                  {errors.eSignature && <span className="error-message">{errors.eSignature}</span>}
                </div>
              </div>
            </section>
            )}

            {currentStep === 1 && (
            <section className="specialist-form-section" id="medical-data">
              <div className="specialist-section-header">
                <div>
                  <h2>Medical Data</h2>
                  <p>Provide your professional credentials and practice information.</p>
                </div>
                <span className="specialist-section-chip">
                  <FaStethoscope />
                  Credentials
                </span>
              </div>

              <div className="practitioner-type-grid specialist-role-grid">
                <button
                  type="button"
                  className={`practitioner-card ${formData.specialistType === "gp" ? "selected" : ""}`}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      specialistType: "gp",
                      primarySpecialty: "",
                      subSpecialties: "",
                      s2Number: "",
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      specialistType: "",
                      primarySpecialty: "",
                      s2Number: "",
                    }));
                  }}
                >
                  <div className="practitioner-card-icon">
                    <FaUser />
                  </div>
                  {formData.specialistType === "gp" && (
                    <span className="practitioner-card-badge">
                      <FaCheck />
                    </span>
                  )}
                  <h3 className="practitioner-card-title">General Practitioner</h3>
                  <p className="practitioner-card-description">
                    Primary care physician providing comprehensive day-to-day healthcare.
                  </p>
                </button>

                <button
                  type="button"
                  className={`practitioner-card ${
                    formData.specialistType === "specialist" ? "selected" : ""
                  }`}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      specialistType: "specialist",
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      specialistType: "",
                    }));
                  }}
                >
                  <div className="practitioner-card-icon">
                    <FaStethoscope />
                  </div>
                  {formData.specialistType === "specialist" && (
                    <span className="practitioner-card-badge">
                      <FaCheck />
                    </span>
                  )}
                  <h3 className="practitioner-card-title">Specialist Doctor</h3>
                  <p className="practitioner-card-description">
                    Medical specialist with focused expertise in a specific field.
                  </p>
                </button>
              </div>
              {errors.specialistType && <span className="error-message">{errors.specialistType}</span>}

              <div className="specialist-subsection">
                <h3 className="specialist-subsection-title">PRC License Information</h3>
                <div className="specialist-grid specialist-grid--two">
                  <div className="specialist-field">
                    <label className="login-label" htmlFor="licenseNumber">
                      PRC License Number <span>*</span>
                    </label>
                    <input
                      className={`login-input ${errors.licenseNumber ? "error" : ""}`}
                      id="licenseNumber"
                      type="text"
                      placeholder="0000000"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      maxLength={10}
                    />
                    {errors.licenseNumber && (
                      <span className="error-message">{errors.licenseNumber}</span>
                    )}
                  </div>

                  <div className="specialist-field">
                    <label className="login-label">PRC Expiration Date <span>*</span></label>
                    <div className="specialist-date-grid">
                      <select
                        className={`login-input ${errors.prcExpiryDate ? "error" : ""}`}
                        id="prcExpiryMonth"
                        value={formData.prcExpiryMonth}
                        onChange={handleInputChange}
                      >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <option key={month} value={month.toString().padStart(2, "0")}>
                            {new Date(0, month - 1).toLocaleString("en-US", { month: "short" })}
                          </option>
                        ))}
                      </select>
                      <select
                        className={`login-input ${errors.prcExpiryDate ? "error" : ""}`}
                        id="prcExpiryDay"
                        value={formData.prcExpiryDay}
                        onChange={handleInputChange}
                      >
                        <option value="">Day</option>
                        {Array.from({ length: expiryDays }, (_, i) => i + 1).map((day) => (
                          <option key={day} value={day.toString().padStart(2, "0")}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <select
                        className={`login-input ${errors.prcExpiryDate ? "error" : ""}`}
                        id="prcExpiryYear"
                        value={formData.prcExpiryYear}
                        onChange={handleInputChange}
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 20 }, (_, i) => currentYear + 10 - i).map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.prcExpiryDate && (
                      <span className="error-message">{errors.prcExpiryDate}</span>
                    )}
                  </div>

                  <div className="specialist-field">
                    <label className="login-label" htmlFor="s2Number">
                      S2 Number
                    </label>
                    <input
                      className="login-input"
                      id="s2Number"
                      type="text"
                      placeholder="S2-000000"
                      value={formData.s2Number}
                      onChange={handleInputChange}
                      maxLength={20}
                    />
                  </div>

                  <div className="specialist-field">
                    <label className="login-label" htmlFor="ptrNumber">
                      PTR Number
                    </label>
                    <input
                      className="login-input"
                      id="ptrNumber"
                      type="text"
                      placeholder="PTR-000000"
                      value={formData.ptrNumber}
                      onChange={handleInputChange}
                      maxLength={12}
                    />
                  </div>
                </div>
              </div>

              <div className="specialist-subsection">
                <h3 className="specialist-subsection-title">Specialization</h3>
                <div className="specialist-grid">
                  <div className="specialist-field specialist-field--full">
                    <label className="login-label" htmlFor="primarySpecialty">
                      Primary Specialty <span>*</span>
                    </label>
                    <input
                      className={`login-input ${errors.primarySpecialty ? "error" : ""}`}
                      id="primarySpecialty"
                      type="text"
                      placeholder="e.g., Internal Medicine"
                      value={formData.primarySpecialty}
                      onChange={handleInputChange}
                      maxLength={100}
                      disabled={!showSpecialistFields}
                    />
                    {errors.primarySpecialty && (
                      <span className="error-message">{errors.primarySpecialty}</span>
                    )}
                  </div>

                  <div className="specialist-field specialist-field--full">
                    <label className="login-label" htmlFor="subSpecialties">
                      Sub Specialty (Optional)
                    </label>
                    <input
                      className="login-input"
                      id="subSpecialties"
                      type="text"
                      placeholder="e.g., Cardiology"
                      value={formData.subSpecialties}
                      onChange={handleInputChange}
                      maxLength={255}
                      disabled={!showSpecialistFields}
                    />
                  </div>
                </div>
              </div>

              <div className="specialist-subsection">
                <h3 className="specialist-subsection-title">Medical Practice</h3>
                <div className="specialist-grid specialist-grid--two">
                  <div className="specialist-field specialist-field--full">
                    <label className="login-label" htmlFor="hospitalName">
                      Hospital Name <span>*</span>
                    </label>
                    <input
                      className={`login-input ${errors.hospitalName ? "error" : ""}`}
                      id="hospitalName"
                      type="text"
                      placeholder="Manila General Hospital"
                      value={formData.hospitalName}
                      onChange={handleInputChange}
                      maxLength={150}
                    />
                    {errors.hospitalName && (
                      <span className="error-message">{errors.hospitalName}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="specialist-subsection">
                <h3 className="specialist-subsection-title">Practice Schedule</h3>
                <div className="specialist-schedule-grid">
                  {scheduleDays.map((day) => (
                    <div key={day.key} className="specialist-schedule-row">
                      <span className="specialist-schedule-day">{day.label}</span>
                      <div className="specialist-schedule-time-group">
                        <div className="specialist-time-input-wrap">
                          <input
                            className="login-input specialist-time-input"
                            type="time"
                            value={practiceSchedule[day.key].start}
                            onChange={(e) =>
                              setPracticeSchedule((prev) => ({
                                ...prev,
                                [day.key]: { ...prev[day.key], start: e.target.value },
                              }))
                            }
                          />
                          <FaRegClock className="specialist-time-icon" />
                        </div>
                        <div className="specialist-time-input-wrap">
                          <input
                            className="login-input specialist-time-input"
                            type="time"
                            value={practiceSchedule[day.key].end}
                            onChange={(e) =>
                              setPracticeSchedule((prev) => ({
                                ...prev,
                                [day.key]: { ...prev[day.key], end: e.target.value },
                              }))
                            }
                          />
                          <FaRegClock className="specialist-time-icon" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="specialist-subsection specialist-subsection--last">
                <div className="specialist-field specialist-field--full">
                  <label className="login-label" htmlFor="prcId">
                    Upload PRC ID <span>*</span>
                  </label>
                  <label
                    htmlFor="prcId"
                    className={`specialist-upload-card specialist-upload-card--action ${
                      errors.prcId ? "error" : ""
                    }`}
                  >
                    <input
                      id="prcId"
                      type="file"
                      accept="image/jpeg,image/png"
                      className="specialist-hidden-input"
                      onChange={(event) => {
                        const file = event.target.files[0];
                        if (!file) {
                          setPrcIdFile(null);
                          return;
                        }
                        setErrors((prev) => ({ ...prev, prcId: "" }));
                        setPrcIdFile(file);
                      }}
                    />
                    <div className="specialist-upload-icon">
                      <FaUpload />
                    </div>
                    <h3>{prcIdFile ? prcIdFile.name : "Click to upload PRC ID"}</h3>
                    <p>JPG, PNG (Max 5MB)</p>
                  </label>
                  {errors.prcId && <span className="error-message">{errors.prcId}</span>}
                </div>
              </div>
            </section>
            )}

            {currentStep === 2 && (
            <section className="specialist-form-section" id="hmo-affiliations">
              <div className="specialist-section-header">
                <div>
                  <h2>HMO & Affiliations</h2>
                  <p>Add your HMO partnerships and hospital/clinic affiliations.</p>
                </div>
                <span className="specialist-section-chip">
                  <FaRegAddressCard />
                  Network
                </span>
              </div>

              <div className="specialist-subsection">
                <div className="specialist-inline-header">
                  <h3 className="specialist-subsection-title">HMO Partnerships</h3>
                  <button
                    type="button"
                    className="specialist-inline-add-btn"
                    onClick={() =>
                      setHmoPartnerships((prev) => [
                        ...prev,
                        { hmoName: "", details: "", billingContact: "" },
                      ])
                    }
                  >
                    <FaPlus />
                    Add HMO
                  </button>
                </div>

                <div className="specialist-card-list">
                  {hmoPartnerships.map((item, index) => (
                    <div key={`hmo-${index}`} className="specialist-affiliation-card">
                      <div className="specialist-affiliation-header">
                        <h4>HMO #{index + 1}</h4>
                        {index > 0 && (
                          <button
                            type="button"
                            className="specialist-delete-btn"
                            onClick={() =>
                              setHmoPartnerships((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
                            }
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                      <div className="specialist-grid">
                        <div className="specialist-field specialist-field--full">
                          <label className="login-label" htmlFor={`hmoName-${index}`}>
                            HMO Name
                          </label>
                          <input
                            className="login-input"
                            id={`hmoName-${index}`}
                            type="text"
                            placeholder="e.g., PhilHealth, MaxiCare, Medicard"
                            value={item.hmoName}
                            onChange={(e) =>
                              updateListItem(setHmoPartnerships, index, "hmoName", e.target.value)
                            }
                          />
                        </div>

                        <div className="specialist-field specialist-field--full">
                          <label className="login-label" htmlFor={`hmoDetails-${index}`}>
                            Details
                          </label>
                          <input
                            className="login-input"
                            id={`hmoDetails-${index}`}
                            type="text"
                            placeholder="Plan details or notes"
                            value={item.details}
                            onChange={(e) =>
                              updateListItem(setHmoPartnerships, index, "details", e.target.value)
                            }
                          />
                        </div>

                        <div className="specialist-field specialist-field--full">
                          <label className="login-label" htmlFor={`hmoBilling-${index}`}>
                            Billing Contact
                          </label>
                          <input
                            className="login-input"
                            id={`hmoBilling-${index}`}
                            type="text"
                            placeholder="Email or phone number"
                            value={item.billingContact}
                            onChange={(e) =>
                              updateListItem(
                                setHmoPartnerships,
                                index,
                                "billingContact",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="specialist-subsection">
                <div className="specialist-inline-header">
                  <h3 className="specialist-subsection-title">Hospital Affiliations</h3>
                  <button
                    type="button"
                    className="specialist-inline-add-btn"
                    onClick={() =>
                      setHospitalAffiliations((prev) => [
                        ...prev,
                        { hospitalName: "", address: "" },
                      ])
                    }
                  >
                    <FaPlus />
                    Add Hospital
                  </button>
                </div>

                <div className="specialist-card-list">
                  {hospitalAffiliations.map((item, index) => (
                    <div key={`hospital-${index}`} className="specialist-affiliation-card">
                      <div className="specialist-affiliation-header">
                        <h4>Hospital #{index + 1}</h4>
                        {index > 0 && (
                          <button
                            type="button"
                            className="specialist-delete-btn"
                            onClick={() =>
                              setHospitalAffiliations((prev) =>
                                prev.filter((_, itemIndex) => itemIndex !== index),
                              )
                            }
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                      <div className="specialist-grid specialist-grid--two">
                        <div className="specialist-field">
                          <label className="login-label" htmlFor={`hospitalName-${index}`}>
                            Hospital Name
                          </label>
                          <input
                            className="login-input"
                            id={`hospitalName-${index}`}
                            type="text"
                            placeholder="Hospital name"
                            value={item.hospitalName}
                            onChange={(e) =>
                              updateListItem(
                                setHospitalAffiliations,
                                index,
                                "hospitalName",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="specialist-field">
                          <label className="login-label" htmlFor={`hospitalAddress-${index}`}>
                            Address
                          </label>
                          <input
                            className="login-input"
                            id={`hospitalAddress-${index}`}
                            type="text"
                            placeholder="Full address"
                            value={item.address}
                            onChange={(e) =>
                              updateListItem(
                                setHospitalAffiliations,
                                index,
                                "address",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="specialist-subsection specialist-subsection--last">
                <div className="specialist-inline-header">
                  <h3 className="specialist-subsection-title">Clinic Affiliations</h3>
                  <button
                    type="button"
                    className="specialist-inline-add-btn"
                    onClick={() =>
                      setClinicAffiliations((prev) => [...prev, { clinicName: "", address: "" }])
                    }
                  >
                    <FaPlus />
                    Add Clinic
                  </button>
                </div>

                <div className="specialist-card-list">
                  {clinicAffiliations.map((item, index) => (
                    <div key={`clinic-${index}`} className="specialist-affiliation-card">
                      <div className="specialist-affiliation-header">
                        <h4>Clinic #{index + 1}</h4>
                        {index > 0 && (
                          <button
                            type="button"
                            className="specialist-delete-btn"
                            onClick={() =>
                              setClinicAffiliations((prev) =>
                                prev.filter((_, itemIndex) => itemIndex !== index),
                              )
                            }
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                      <div className="specialist-grid specialist-grid--two">
                        <div className="specialist-field">
                          <label className="login-label" htmlFor={`clinicName-${index}`}>
                            Clinic Name
                          </label>
                          <input
                            className="login-input"
                            id={`clinicName-${index}`}
                            type="text"
                            placeholder="Clinic name"
                            value={item.clinicName}
                            onChange={(e) =>
                              updateListItem(
                                setClinicAffiliations,
                                index,
                                "clinicName",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="specialist-field">
                          <label className="login-label" htmlFor={`clinicAddress-${index}`}>
                            Address
                          </label>
                          <input
                            className="login-input"
                            id={`clinicAddress-${index}`}
                            type="text"
                            placeholder="Full address"
                            value={item.address}
                            onChange={(e) =>
                              updateListItem(
                                setClinicAffiliations,
                                index,
                                "address",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            )}

            {currentStep === 3 && (
            <section className="specialist-form-section" id="professional-fees">
              <div className="specialist-section-header">
                <div>
                  <h2>Professional Fees</h2>
                  <p>Set your consultation fees and payment preferences.</p>
                </div>
                <span className="specialist-section-chip">
                  <FaStethoscope />
                  Pricing
                </span>
              </div>

              <div className="specialist-subsection">
                <h3 className="specialist-subsection-title">Consultation Types</h3>
                <div className="specialist-fee-panel">
                  <div className="specialist-grid specialist-grid--three">
                    <div className="specialist-field">
                      <label className="login-label" htmlFor="initialConsultationFee">
                        Initial Consultation <span>*</span>
                      </label>
                      <div className="specialist-money-input">
                        <span className="specialist-money-prefix">P</span>
                        <input
                          className={`login-input ${errors.initialConsultationFee ? "error" : ""}`}
                          id="initialConsultationFee"
                          type="text"
                          placeholder="1000"
                          value={formData.initialConsultationFee}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.initialConsultationFee && (
                        <span className="error-message">{errors.initialConsultationFee}</span>
                      )}
                    </div>

                    <div className="specialist-field">
                      <label className="login-label" htmlFor="followUpConsultationFee">
                        Follow-up Consultation <span>*</span>
                      </label>
                      <div className="specialist-money-input">
                        <span className="specialist-money-prefix">P</span>
                        <input
                          className={`login-input ${errors.followUpConsultationFee ? "error" : ""}`}
                          id="followUpConsultationFee"
                          type="text"
                          placeholder="800"
                          value={formData.followUpConsultationFee}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.followUpConsultationFee && (
                        <span className="error-message">{errors.followUpConsultationFee}</span>
                      )}
                    </div>

                    <div className="specialist-field">
                      <label className="login-label" htmlFor="medicalCertificateFee">
                        Medical Certificate <span>*</span>
                      </label>
                      <div className="specialist-money-input">
                        <span className="specialist-money-prefix">P</span>
                        <input
                          className={`login-input ${errors.medicalCertificateFee ? "error" : ""}`}
                          id="medicalCertificateFee"
                          type="text"
                          placeholder="200"
                          value={formData.medicalCertificateFee}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.medicalCertificateFee && (
                        <span className="error-message">{errors.medicalCertificateFee}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="specialist-subsection">
                <h3 className="specialist-subsection-title">Discounts</h3>
                <div className="specialist-grid specialist-grid--two">
                  <div className="specialist-field">
                    <label className="login-label" htmlFor="seniorDiscount">
                      Senior Citizen Discount (%) <span>*</span>
                    </label>
                    <div className="specialist-percent-input">
                      <input
                        className="login-input"
                        id="seniorDiscount"
                        type="text"
                        value={formData.seniorDiscount}
                        onChange={handleInputChange}
                      />
                      <span className="specialist-percent-suffix">%</span>
                    </div>
                    <span className="specialist-helper-text">Philippine law requires 20% discount</span>
                  </div>

                  <div className="specialist-field">
                    <label className="login-label" htmlFor="pwdDiscount">
                      PWD Discount (%) <span>*</span>
                    </label>
                    <div className="specialist-percent-input">
                      <input
                        className="login-input"
                        id="pwdDiscount"
                        type="text"
                        value={formData.pwdDiscount}
                        onChange={handleInputChange}
                      />
                      <span className="specialist-percent-suffix">%</span>
                    </div>
                    <span className="specialist-helper-text">Philippine law requires 20% discount</span>
                  </div>
                </div>
              </div>

              <div className="specialist-subsection">
                <h3 className="specialist-subsection-title">Payment Disbursement</h3>
                <div className="specialist-field specialist-field--full">
                  <label className="login-label" htmlFor="disbursementMethod">
                    Preferred Disbursement Method
                  </label>
                  <select
                    className="login-input"
                    id="disbursementMethod"
                    value={formData.disbursementMethod}
                    onChange={handleInputChange}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="GCash">GCash</option>
                    <option value="PayMaya">PayMaya</option>
                  </select>
                </div>

                <div className="specialist-bank-card">
                  <h4>Bank Details</h4>
                  <div className="specialist-grid">
                    <div className="specialist-field specialist-field--full">
                      <label className="login-label" htmlFor="bankName">
                        Bank Name <span>*</span>
                      </label>
                      <input
                        className={`login-input ${errors.bankName ? "error" : ""}`}
                        id="bankName"
                        type="text"
                        placeholder="e.g., BDO, BPI, Metrobank"
                        value={formData.bankName}
                        onChange={handleInputChange}
                      />
                      {errors.bankName && <span className="error-message">{errors.bankName}</span>}
                    </div>

                    <div className="specialist-field specialist-field--full">
                      <label className="login-label" htmlFor="accountName">
                        Account Name <span>*</span>
                      </label>
                      <input
                        className={`login-input ${errors.accountName ? "error" : ""}`}
                        id="accountName"
                        type="text"
                        placeholder="Dr. Juan Dela Cruz"
                        value={formData.accountName}
                        onChange={handleInputChange}
                      />
                      {errors.accountName && (
                        <span className="error-message">{errors.accountName}</span>
                      )}
                    </div>

                    <div className="specialist-field specialist-field--full">
                      <label className="login-label" htmlFor="accountNumber">
                        Account Number <span>*</span>
                      </label>
                      <input
                        className={`login-input ${errors.accountNumber ? "error" : ""}`}
                        id="accountNumber"
                        type="text"
                        placeholder="0123456789"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                      />
                      {errors.accountNumber && (
                        <span className="error-message">{errors.accountNumber}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="specialist-summary-card">
                  <h4>Fee Summary</h4>
                  <div className="specialist-summary-row">
                    <span>Initial Consultation:</span>
                    <strong>P{formData.initialConsultationFee || 0}</strong>
                  </div>
                  <div className="specialist-summary-row">
                    <span>Follow-up Consultation:</span>
                    <strong>P{formData.followUpConsultationFee || 0}</strong>
                  </div>
                  <div className="specialist-summary-row">
                    <span>Medical Certificate:</span>
                    <strong>P{formData.medicalCertificateFee || 0}</strong>
                  </div>
                </div>
              </div>
            </section>
            )}

            {currentStep === 4 && (
            <section className="specialist-form-section" id="terms-conditions">
              <div className="specialist-section-header">
                <div>
                  <h2>Terms & Conditions</h2>
                  <p>Please review and accept our terms to complete your registration.</p>
                </div>
                <span className="specialist-section-chip">
                  <FaShieldAlt />
                  Legal
                </span>
              </div>

              <div className="specialist-subsection">
                <h3 className="specialist-legal-heading">Terms & Conditions</h3>
                <div className="specialist-legal-card">
                  <div className="specialist-legal-scroll">
                    <h4>1. Introduction</h4>
                    <p>
                      Welcome to OkieDoc+. These Terms and Conditions govern your use of our
                      telemedicine platform and the services provided to healthcare professionals.
                      By registering as a specialist, you agree to be bound by these terms.
                    </p>

                    <h4>2. Professional Conduct</h4>
                    <p>As a healthcare professional on OkieDoc+, you agree to:</p>
                    <ul>
                      <li>Maintain all required licenses and certifications in good standing</li>
                      <li>Provide accurate and truthful information about your credentials</li>
                      <li>Uphold the highest standards of medical ethics and professionalism</li>
                      <li>Comply with all applicable laws and regulations</li>
                      <li>Maintain patient confidentiality and privacy</li>
                    </ul>

                    <h4>3. Service Obligations</h4>
                    <p>You are responsible for:</p>
                    <ul>
                      <li>Maintaining accurate availability and schedule information</li>
                      <li>Responding to patient consultations in a timely manner</li>
                      <li>Providing quality medical care within your scope of practice</li>
                      <li>Keeping your profile, credentials, and contact information up to date</li>
                    </ul>

                    <h4>4. Platform Usage</h4>
                    <p>
                      You agree to use the OkieDoc+ platform solely for its intended purpose of
                      providing telemedicine services. Prohibited activities include:
                    </p>
                    <ul>
                      <li>Sharing your account credentials with others</li>
                      <li>Engaging in fraudulent or deceptive practices</li>
                      <li>Violating patient privacy or confidentiality</li>
                      <li>Misrepresenting your qualifications or expertise</li>
                    </ul>

                    <h4>5. Fees and Payments</h4>
                    <p>
                      OkieDoc+ charges a platform fee of 15% on all consultations. Payment
                      disbursements are processed within 7-10 business days. You are responsible
                      for all applicable taxes on your earnings.
                    </p>

                    <h4>6. Liability and Insurance</h4>
                    <p>
                      You maintain sole responsibility for the medical care you provide. OkieDoc+
                      is not liable for any medical malpractice or professional negligence. You
                      must maintain adequate professional liability insurance.
                    </p>

                    <h4>7. Termination</h4>
                    <p>
                      Either party may terminate this agreement with 30 days written notice.
                      OkieDoc+ reserves the right to immediately suspend or terminate accounts for
                      violations of these terms or for professional misconduct.
                    </p>

                    <h4>8. Amendments</h4>
                    <p>
                      OkieDoc+ reserves the right to modify these terms at any time. You will be
                      notified of material changes and continued use of the platform constitutes
                      acceptance of modified terms.
                    </p>

                    <h4>9. Governing Law</h4>
                    <p>
                      These terms are governed by the laws of the Republic of the Philippines. Any
                      disputes shall be resolved in the courts of Metro Manila.
                    </p>

                    <h4>10. Contact</h4>
                    <p>
                      For questions about these terms, contact us at legal@okiedoc.com or call
                      +63 (02) 1234-5678.
                    </p>
                  </div>
                </div>
              </div>

              <div className="specialist-subsection">
                <h3 className="specialist-legal-heading specialist-legal-heading--privacy">
                  Data Privacy Policy
                </h3>
                <div className="specialist-legal-card">
                  <div className="specialist-legal-scroll">
                    <h4>1. Information We Collect</h4>
                    <p>
                      We collect and process the following information from healthcare
                      professionals:
                    </p>
                    <ul>
                      <li>Personal information (name, contact details, birthdate)</li>
                      <li>Professional credentials (PRC license, specialization, affiliations)</li>
                      <li>Financial information (bank accounts, payment details)</li>
                      <li>Practice information (schedules, fees, clinic locations)</li>
                      <li>Usage data and platform interactions</li>
                    </ul>

                    <h4>2. How We Use Your Data</h4>
                    <p>Your information is used to:</p>
                    <ul>
                      <li>Verify your credentials and maintain your profile</li>
                      <li>Facilitate patient consultations and appointments</li>
                      <li>Process payments and financial transactions</li>
                      <li>Improve our platform and services</li>
                      <li>Comply with legal and regulatory requirements</li>
                    </ul>

                    <h4>3. Data Security</h4>
                    <p>
                      We implement industry-standard security measures including encryption,
                      secure servers, and access controls. All data is stored in compliance with
                      Philippine data privacy laws and HIPAA standards.
                    </p>

                    <h4>4. Data Sharing</h4>
                    <p>We do not sell your personal information. Your data may be shared with:</p>
                    <ul>
                      <li>Patients who book consultations with you</li>
                      <li>Payment processors for financial transactions</li>
                      <li>Regulatory authorities when required by law</li>
                      <li>Service providers who support our platform operations</li>
                    </ul>

                    <h4>5. Your Rights</h4>
                    <p>Under the Data Privacy Act of 2012, you have the right to:</p>
                    <ul>
                      <li>Access your personal information</li>
                      <li>Correct inaccurate or incomplete data</li>
                      <li>Request deletion of your data subject to legal requirements</li>
                      <li>Object to certain data processing activities</li>
                      <li>Port your data to another service</li>
                    </ul>

                    <h4>6. Data Retention</h4>
                    <p>
                      We retain your information for as long as your account is active, and for 7
                      years thereafter to comply with medical record retention requirements and
                      legal obligations.
                    </p>

                    <h4>7. Contact</h4>
                    <p>
                      For privacy concerns, contact our Data Protection Officer at
                      privacy@okiedoc.com.
                    </p>
                  </div>
                </div>
              </div>

              <div className="specialist-consent-panel">
                <label className="specialist-consent-row">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      if (errors.acceptedTerms) {
                        setErrors((prev) => ({ ...prev, acceptedTerms: "" }));
                      }
                    }}
                  />
                  <span>
                    I have read and agree to the <strong>Terms & Conditions</strong>. I
                    understand my obligations as a healthcare professional on the OkieDoc+
                    platform.
                  </span>
                </label>
                {errors.acceptedTerms && (
                  <span className="error-message">{errors.acceptedTerms}</span>
                )}

                <label className="specialist-consent-row">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => {
                      setAcceptedPrivacy(e.target.checked);
                      if (errors.acceptedPrivacy) {
                        setErrors((prev) => ({ ...prev, acceptedPrivacy: "" }));
                      }
                    }}
                  />
                  <span>
                    I have read and agree to the <strong>Data Privacy Policy</strong>. I consent
                    to the collection and processing of my personal and professional information
                    as described.
                  </span>
                </label>
                {errors.acceptedPrivacy && (
                  <span className="error-message">{errors.acceptedPrivacy}</span>
                )}
              </div>

            </section>
            )}

            <div className="specialist-form-footer">
              <div className="specialist-footer-actions">
                {currentStep > 0 && (
                  <button
                    className="specialist-secondary-btn"
                    type="button"
                    onClick={handlePreviousStep}
                  >
                    Back
                  </button>
                )}
                {currentStep < stepItems.length - 1 ? (
                  <button className="login-btn specialist-submit-btn" type="button" onClick={handleNextStep}>
                    Next Step
                  </button>
                ) : (
                  <button className="login-btn specialist-submit-btn" type="submit">
                    Submit Application
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
