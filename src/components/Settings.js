import React, { useState } from "react";
import { Modal, Button, message } from "antd";
import { Navigate } from "react-router-dom";

function Settings({ userData }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  if (redirectToLogin) {
    return <Navigate to="/login" />;
  }

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
      message.error("Error deleting account. Please try again", 3);
    } finally {
      msg();
    }
  };

  const handleOk = () => {
    handleDeleteAccount();
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  return (
    <div style={{padding:20}}>
      <h2>Welcome, {userData.username}</h2>
      <p>First Name: {userData.firstname}</p>
      <p>Last Name: {userData.lastname}</p>
      <p>Phone Number: {userData.number}</p>
      <Button type="primary" href="/logout">
        Logout
      </Button>
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
    </div>
  );
}

export default Settings;
