import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Navigate } from "react-router-dom";

import Navbar from "./Navbar";
import Todo from "./ToDo";
import Chat from "./Chat";
import Settings from "./Settings"; // Assume you have a Settings component

const Container = styled.div`
  padding: 0px;
`;

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  const [activeComponent, setActiveComponent] = useState(localStorage.getItem("activeComponent"));

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setRedirectToLogin(true);
        return;
      }
      try {
        const response = await fetch("https://sr-express.onrender.com/api/user/data", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUserData(data);
        } else {
          localStorage.removeItem("token");
          setRedirectToLogin(true);
        }
      } catch (err) {
        console.error("Error:", err);
        alert(err);
        setRedirectToLogin(true);
      }
    };

    fetchUserData();
  }, []);


  useEffect(() => {
    // Retrieve the activeComponent state from localStorage on component mount
    const savedActiveComponent = localStorage.getItem("activeComponent");
    if (savedActiveComponent) {
      setActiveComponent(savedActiveComponent);
    } else {
      setActiveComponent("settings");
      localStorage.setItem("activeComponent", "settings"); // Set localStorage here
    }
  }, []);
  

  if (redirectToLogin) {
    return <Navigate to="/login" />;
  }

  if (!userData) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <Navbar onNavClick={setActiveComponent} />
      {activeComponent === "home" && <Settings userData={userData} />}
      {activeComponent === "todo" && <Todo />}
      {activeComponent === "chat" && <Chat user={userData} />}
      {activeComponent === "settings" && <Settings userData={userData} />}
    </Container>
  );
};

export default Dashboard;
