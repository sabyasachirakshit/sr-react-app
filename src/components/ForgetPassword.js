import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const Error = styled.p`
  color: red;
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
  &:hover {
    background-color: #0056b3;
  }
`;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [errors, setErrors] = useState({});
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  const [showSecurityQuestion, setShowSecurityQuestion] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleFetchSecurityQuestion = async () => {
    const msg=message.loading("Trying to get you in..",0);
    const response = await fetch(
      "https://sr-express.onrender.com/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      }
    );
    const data = await response.json();
    if (response.ok) {
      setSecurityQuestion(data.securityQuestion);
      setShowSecurityQuestion(true);
      message.success("Found you!",3);
      msg();
    } else {
      message.error(data.msg,3);
      console.log(data.msg);
      msg();
    }
  };

  const validate = (data) => {
    let errors = {};
    if (!data) errors.password = "Password is required";
    else if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{10,}$/.test(data)
    ) {
      errors.password =
        "Password must be at least 10 characters long, contain a number, an uppercase letter, a special character, and no spaces";
    } else if (data !== newConfirmPassword) {
      errors.confirmPass = "Passwords do not match!";
    }
    return errors;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const msg=message.loading("Trying to reset password..",3);
    const errors = validate(newPassword);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
    } else {
      const response = await fetch(
        "https://sr-express.onrender.com/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, securityAnswer, newPassword }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        message.success(data.msg,3);
        
        console.log(data.msg);
        navigate("/login");
      } else {
        message.error(data.msg,3);
        console.log(data.msg);
      }
      msg();
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  return (
    <Container>
      <Form onSubmit={handleResetPassword}>
        <h2>Forgot Password</h2>
        {!showSecurityQuestion ? (
          <>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button type="button" onClick={handleFetchSecurityQuestion}>
              Next
            </Button>
          </>
        ) : (
          <>
            <p>{securityQuestion}</p>
            <Input
              type="text"
              placeholder="Security Answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />
            <InputContainer>
              <Input
                type={passwordVisible ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                value={newConfirmPassword}
                onChange={(e) => setNewConfirmPassword(e.target.value)}
              />
              <ToggleButton
                type="button"
                onClick={toggleConfirmPasswordVisibility}
              >
                {confirmPasswordVisible ? "🙈" : "👁️"}
              </ToggleButton>
            </InputContainer>
            {errors.confirmPass && <Error>{errors.confirmPass}</Error>}
            <Button type="submit">Reset Password</Button>
          </>
        )}
      </Form>
    </Container>
  );
};

export default ForgotPassword;
