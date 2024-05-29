import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { Spin,message } from "antd"; // Import Ant Design spinner

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  flex: 1;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #0056b3;
  }
`;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setRedirectToDashboard(true); // Set state to trigger redirect
      return;
    }
  }, []);

  if (redirectToDashboard) {
    navigate("/dashboard"); // Perform the redirect
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = message.loading("Trying to login..",0);
    const userData = {
      username,
      password,
    };

    try {
      const response = await fetch(
        "https://sr-express.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        message.success(`Login Successful! Welcome ${userData.username}`,3)
        localStorage.setItem("token", data.token); // Store the token
        navigate("/dashboard"); // Redirect to dashboard
      } else {
        console.log("Login failed", data);
        message.error(data.msg,3);
        // Handle login failure (e.g., display error message)
      }
    } catch (err) {
      console.error("Error:", err);
      // Handle error (e.g., display error message)
    } finally {
      msg(); // Set loading state to false when the request ends
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <Input
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <InputContainer>
          <Input
            type={passwordVisible ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ToggleButton type="button" onClick={togglePasswordVisibility}>
            {passwordVisible ? "🙈" : "👁️"}
          </ToggleButton>
        </InputContainer>
        <Button>
          Login
        </Button>
        <p>
          New here? <Link to="/register">register yourself</Link>
        </p>
        <p>
          <Link to="/forgetpass">Forgot Password?</Link>
        </p>
      </Form>
    </Container>
  );
};

export default Login;
