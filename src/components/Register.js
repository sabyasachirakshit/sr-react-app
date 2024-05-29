import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f2f5;
`;

const Select = styled.select`
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 20px;
  border-radius: 6px;
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
  &:hover {
    background-color: #0056b3;
  }
`;

const Error = styled.p`
  color: red;
`;

const securityQuestions = [
  "What was your childhood nickname?",
  "What is the name of your favorite childhood friend?",
  "What was the name of your first pet?",
  "What is your mother’s maiden name?",
  "What is the name of the town where you were born?",
];

const Register = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    firstname: "",
    lastname: "",
    number: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = (data) => {
    let errors = {};
    if (!data.username) errors.username = "Username is required";
    else if (data.username.length < 6)
      errors.username = "Username must be 6 characters long";
    if (!data.firstname) errors.firstname = "First name is required";
    else if (data.firstname.length < 3 || data.firstname.length > 50)
      errors.firstname = "First name must be between 3 and 50 characters";
    if (!data.lastname) errors.lastname = "Last name is required";
    else if (data.lastname.length < 3 || data.lastname.length > 50)
      errors.lastname = "Last name must be between 3 and 50 characters";
    if (!data.number) errors.number = "Number is required";
    else if (!/^\d{10}$/.test(data.number))
      errors.number = "Number must be 10 digits";
    if (!data.password) errors.password = "Password is required";
    else if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{10,}$/.test(
        data.password
      )
    ) {
      errors.password =
        "Password must be at least 10 characters long, contain a number, an uppercase letter, a special character, and no spaces";
    }
    if (data.password !== data.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = message.loading("Registering...",0);
    const errors = validate(formData);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
    } else {
      try {
        const response = await fetch(
          "https://sr-express.onrender.com/api/auth/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        const data = await response.json();

        if (response.ok) {
          message.success(
            `Registered successfully ${formData.firstname}. Please login now`,3
          );
          navigate("/login");
          // Handle successful login (e.g., store token, redirect, etc.)
        } else {
          message.error(data.msg,3);
          // Handle login failure (e.g., display error message)
        }
      } catch (err) {
        message.error(err,3); 
        console.error("Error:", err);
        // Handle error (e.g., display error message)
      }finally{
        msg();
      }
    }

    console.log("Registering", formData);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <h2>Register</h2>
        <Input
          type="text"
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <Error>{errors.username}</Error>}
        <Input
          type="text"
          placeholder="First Name"
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
        />
        {errors.firstname && <Error>{errors.firstname}</Error>}
        <Input
          type="text"
          placeholder="Last Name"
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
        />
        {errors.lastname && <Error>{errors.lastname}</Error>}
        <Input
          type="text"
          placeholder="Number"
          name="number"
          value={formData.number}
          onChange={handleChange}
        />
        {errors.number && <Error>{errors.number}</Error>}
        <InputContainer>
          <Input
            type={passwordVisible ? "text" : "password"}
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          <ToggleButton type="button" onClick={togglePasswordVisibility}>
            {passwordVisible ? "🙈" : "👁️"}
          </ToggleButton>
        </InputContainer>
        {errors.password && <Error>{errors.password}</Error>}
        <InputContainer>
          <Input
            type={confirmPasswordVisible ? "text" : "password"}
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <ToggleButton type="button" onClick={toggleConfirmPasswordVisibility}>
            {confirmPasswordVisible ? "🙈" : "👁️"}
          </ToggleButton>
        </InputContainer>
        {errors.confirmPassword && <Error>{errors.confirmPassword}</Error>}
        <Select
          name="securityQuestion"
          value={formData.securityQuestion}
          onChange={handleChange}
          required
        >
          <option value="">Select a security question</option>
          {securityQuestions.map((question, index) => (
            <option key={index} value={question}>
              {question}
            </option>
          ))}
        </Select>
        <Input
          type="text"
          placeholder="Security Answer"
          name="securityAnswer"
          value={formData.securityAnswer}
          onChange={handleChange}
          required
        />
        <Button type="submit">Register</Button>
        <p>
          Already a user? <Link to="/login">login</Link>
        </p>
      </Form>
    </Container>
  );
};

export default Register;
