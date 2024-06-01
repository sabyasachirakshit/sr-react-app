import React, { useState, useEffect, useRef } from "react";
import { Input, Button, List, Select, notification } from "antd";
import io from "socket.io-client";
import moment from "moment";  // Import moment.js for date formatting

const { Option } = Select;

const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef(null); // Use useRef for the socket connection

  useEffect(() => {
    // Initialize socket connection only once
    if (!socketRef.current) {
      socketRef.current = io("https://sr-express.onrender.com");
    }

    socketRef.current.emit("register", user._id);

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "https://sr-express.onrender.com/api/user/chat/users",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        notification.error({
          message: "Error",
          description: "Failed to fetch users. Please try again later.",
        });
      }
    };

    fetchUsers();

    return () => {
      // Clean up socket connection and event listeners on unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user._id]);

  const fetchMessages = async (participantId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://sr-express.onrender.com/api/user/chat/${participantId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0 && data[0].messages) {
        setMessages(data[0].messages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch messages. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (receiverId) {
      fetchMessages(receiverId);
    }
  }, [receiverId]);

  useEffect(() => {
    const handleReceiveMessage = ({
      senderId,
      receiverId: receivedReceiverId,
      message: newMessage,
    }) => {
      if (
        (newMessage.sender._id === user._id &&
          receivedReceiverId === receiverId) ||
        (newMessage.sender._id === receiverId &&
          receivedReceiverId === user._id)
      ) {
        setMessages((prevMessages) => 
          prevMessages.map((msg) => 
            msg.optimisticId && msg.message === newMessage.message ? newMessage : msg
          )
        );
      }
    };

    if (socketRef.current) {
      socketRef.current.on("receiveMessage", handleReceiveMessage);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receiveMessage", handleReceiveMessage);
      }
    };
  }, [receiverId, user._id]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const optimisticId = Date.now(); // Generate a temporary ID for the optimistic message
      const newMessage = {
        sender: { _id: user._id, username: "You" }, // Mocking the sender
        receiverId,
        message,
        timestamp: new Date().toISOString(), // Add timestamp here
        optimisticId,
      };

      // Optimistic UI update
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage("");

      try {
        if (socketRef.current) {
          socketRef.current.emit("sendMessage", {
            senderId: user._id,
            receiverId,
            message,
            optimisticId,
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
        notification.error({
          message: "Error",
          description: "Failed to send message. Please try again later.",
        });

        // Rollback optimistic UI update
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.optimisticId !== optimisticId)
        );
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat</h2>
      <Select
        placeholder="Select a user to chat"
        value={receiverId}
        onChange={(value) => setReceiverId(value)}
        style={{ width: "100%", marginBottom: "10px" }}
      >
        {users.map((user) => (
          <Option key={user._id} value={user._id}>
            {user.username}
          </Option>
        ))}
      </Select>
      <List
        loading={isLoading}
        dataSource={messages}
        renderItem={(msg) => (
          <List.Item>
            <div>
              <strong>{msg.sender._id === user._id ? "You" : msg.sender.username}:</strong> {msg.message}
              <br />
              <span style={{ fontSize: "0.8em", color: "gray" }}>{moment(msg.timestamp).format('h:mm A D MMMM YYYY')}</span>
            </div>
          </List.Item>
        )}
      />
      <Input
        placeholder="Type a message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onPressEnter={handleSendMessage}
      />
      <Button type="primary" onClick={handleSendMessage}>
        Send
      </Button>
    </div>
  );
};

export default Chat;
