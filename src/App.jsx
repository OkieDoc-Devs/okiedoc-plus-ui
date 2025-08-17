import "./App.css";
import { useNavigate } from "react-router";

function App() {
  const navigate = useNavigate();
  return (
    <>
      <div class="container1">
        <div class="header">
          <h1>Okie-Doc</h1>
          <h1 class="plus">+</h1>
        </div>
        <div className="button-group">
          <button className="btn" onClick={() => navigate("/registration")}>Register</button>
          <button className="btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </div>

      <div class="container2">
        <div class="content-section">
          <h2>The go-to platform for specialists</h2>
          <button className="btn" onClick={() => navigate("/registration")}>
            Join Okie-Doc+
          </button>
        </div>
        <div class="imageContainer">
          <img
            src="stockPhoto.jpg"
            alt="Picture of a specialist and a patient"
          ></img>
        </div>
      </div>
    </>
  );
}

export default App;
