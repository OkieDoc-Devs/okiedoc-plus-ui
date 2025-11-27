import "./auth.css";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    confirmPassword: "",
    specialty: "",
    licenseNumber: "",
    experience: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginWithAPI = async (email, password) => {
    const response = await fetch("http://localhost:1337/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;
  };

  const handleInputChange = (e) => {
    const { name, id, value } = e.target;
    const fieldName = name || id;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const dummyCredentials = {
    nurse: { email: "nurse@okiedoc.com", password: "nurse123" },
    admin: { email: "admin@okiedoc.com", password: "admin123" },
    patient: { email: "patient@okiedoc.com", password: "patient123" },
    specialist: { email: "specialist@okiedoc.com", password: "specialist123" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await loginWithAPI(formData.email, formData.password);

      if (result.success) {
        // Store general user data
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: result.user.id,
            email: result.user.email,
            userType: result.user.userType,
            globalId: result.user.globalId || null,
          })
        );

        // If nurse, store nurse-specific data for the nurse module
        if (result.user.userType === "nurse") {
          // Check different possible field names for the nurse's name
          const firstName =
            result.user.firstName ||
            result.user.first_name ||
            result.user.name?.split(" ")[0] ||
            result.user.fullName?.split(" ")[0] ||
            "Nurse";

          const lastName =
            result.user.lastName ||
            result.user.last_name ||
            result.user.name?.split(" ")[1] ||
            result.user.fullName?.split(" ")[1] ||
            "";

          localStorage.setItem("nurse.id", result.user.id);
          localStorage.setItem("nurse.email", result.user.email);
          localStorage.setItem("nurse.firstName", firstName);
          localStorage.setItem("nurse.lastName", lastName);

          console.log("Nurse data stored in localStorage:", {
            id: result.user.id,
            email: result.user.email,
            firstName: firstName,
            lastName: lastName,
            rawUserObject: result.user, // Log the raw object to see all available fields
          });
        }

        navigate(result.user.dashboardRoute);
        return;
      }
    } catch (apiError) {
      console.warn(
        "API login failed, trying fallback credentials:",
        apiError.message
      );

      if (
        formData.email === dummyCredentials.nurse.email &&
        formData.password === dummyCredentials.nurse.password
      ) {
        setError("");
        navigate("/nurse-dashboard");
        return;
      } else if (
        formData.email === dummyCredentials.admin.email &&
        formData.password === dummyCredentials.admin.password
      ) {
        setError("");
        navigate("/admin/specialist-dashboard");
        return;
      } else if (
        formData.email === dummyCredentials.patient.email &&
        formData.password === dummyCredentials.patient.password
      ) {
        setError("");
        navigate("/patient-dashboard");
        return;
      } else if (
        formData.email === dummyCredentials.specialist.email &&
        formData.password === dummyCredentials.specialist.password
      ) {
        setError("");
        navigate("/specialist-dashboard");
        return;
      }

      const registeredUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      const user = registeredUsers.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        setError("");
        navigate("/dashboard");
        return;
      }

      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-container">
        <div className="header-inside-container">
          <button
            className="back-btn login-back-btn"
            onClick={() => navigate("/")}
          >
            <span className="material-symbols-outlined">arrow_back_2</span>
          </button>
          <img src="/okie-doc-logo.png" alt="OkieDoc+" className="logo-image" />
          <div style={{ width: "2.5rem" }}></div>
        </div>

        {/* Regular Patient/Nurse Login */}
        <>
          <h2 className="login-title">Sign in</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
            )}
            <label className="login-label" htmlFor="email">
              Email address
            </label>
            <input
              className="login-input"
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <label className="login-label">Password</label>
            <div className="login-password">
              <input
                className="login-input"
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            <button className="login-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
            <p className="login-text">
              Don't have an Okie-Doc+ account?{" "}
              <a href="/registration">Register</a>
            </p>
            <p className="specialist-text">
              Are you a specialist?{" "}
              <a
                href="/specialist-login"
                className="specialist-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/specialist-login");
                }}
              >
                Login Here
              </a>
            </p>
            <p className="specialist-text">
              Need to register as a specialist?{" "}
              <a
                href="/specialist-registration"
                className="specialist-register-link"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/specialist-registration");
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
