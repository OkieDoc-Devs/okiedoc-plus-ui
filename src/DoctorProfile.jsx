import { useParams, useNavigate } from "react-router";

function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Doctor Profile</h1>
      <p>Doctor ID: {id}</p>
      <button type="button" onClick={() => navigate("/")}>
        Back to Home
      </button>
    </div>
  );
}

export default DoctorProfile;
