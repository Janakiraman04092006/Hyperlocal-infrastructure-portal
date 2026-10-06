import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CitizenLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (data.role !== "Citizen") {
        alert("This account is not a Citizen account.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));

      navigate("/dashboard");
    } catch (error) {
      alert("Unable to connect to server");
    }
  };

  return (
    <div>
      <h2>Citizen Login</h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login as Citizen</button>
      </form>

      <button onClick={() => navigate("/community/login")}>
        Community Login
      </button>

      <button onClick={() => navigate("/admin/login")}>
        Admin Login
      </button>
    </div>
  );
}

export default CitizenLogin;