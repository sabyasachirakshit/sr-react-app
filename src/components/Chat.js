import React, { useState, useEffect, useRef } from "react";
import { Input, Button, List, Select } from "antd";
import io from "socket.io-client";

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
      socketRef.current = io("https://sr-express.onrender.com/");
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
        setMessages((prevMessages) => [...prevMessages, newMessage]);
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
      const newMessage = {
        senderId: user._id,
        receiverId,
        message,
      };

      if (socketRef.current) {
        socketRef.current.emit("sendMessage", newMessage);
      }
      setMessage("");
    }
  };

  return (
    <div>
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
            <strong>
              {msg.sender._id === user._id ? "You" : msg.sender.username}:{" "}
            </strong>
            {msg.message}
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
