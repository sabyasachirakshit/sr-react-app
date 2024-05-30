import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Navigate, Link } from "react-router-dom";
import { Modal, Button, message } from "antd";
import Todo from "./ToDo";

const Container = styled.div`
  padding: 20px;
`;

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const handleDeleteAccount = async () => {
    const msg = message.loading("Deleting Account..");
    const token = localStorage.getItem("token");
    if (!token) {
      setRedirectToLogin(true);
      return;
    }
    try {
      const response = await fetch("https://sr-express.onrender.com/api/user/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        message.success("Account deleted", 3);
        setRedirectToLogin(true);
      } else {
        message.error("Failed to delete account", 3);
      }
    } catch (err) {
      console.error("Error:", err);
      message.error("Error deleting account. Please try again",3);
    } finally {
      msg();
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    handleDeleteAccount();
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (redirectToLogin) {
    return <Navigate to="/login" />;
  }

  if (!userData) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      <h2>Welcome, {userData.username}</h2>
      <p>First Name: {userData.firstname}</p>
      <p>Last Name: {userData.lastname}</p>
      <p>Phone Number: {userData.number}</p>
      <Link to="/logout">
        <button>Logout</button>
      </Link>
      
      <Button type="danger" onClick={showModal}>
        Delete Account
      </Button>
      <Modal
        title="Delete Account"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Yes, Delete"
        cancelText="No, Cancel"
      >
        <p>
          Are you sure you want to delete your account? This action cannot be
          undone.
        </p>
      </Modal>
      <Todo />
    </Container>
  );
};

export default Dashboard;
