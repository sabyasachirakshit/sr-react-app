import React, { useState, useEffect } from "react";
import { Input, Button, List, Select } from "antd";
import io from "socket.io-client";

const { Option } = Select;
const socket = io("https://sr-express.onrender.com/");

const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    socket.emit("register", user._id);

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
  }, [user._id]);

  const fetchMessages = async (participantId) => {
    console.log(participantId);
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
          }
        }
      );
      const data = await response.json();
      // Assuming data is an array and the first object contains the messages
      if (Array.isArray(data) && data.length > 0 && data[0].messages) {
        console.log("These are messages:", data[0].messages);
        setMessages(data[0].messages);
      } else {
        setMessages([]); // If no messages, clear the list
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
    socket.on("receiveMessage", ({ senderId, receiverId: recId, message: newMessage }) => {
      console.log("senderId:", senderId, ", receiverId:", recId, ", message:", newMessage);
      if (
        (senderId === user._id && recId === receiverId) ||
        (senderId === receiverId && recId === user._id)
      ) {
        console.log("Is this new message in UI:", newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else {
        console.log("This is newMessage.sender._id:", newMessage.sender._id);
        console.log("This is user._id:", user._id);
        console.log("This is receiverId:", receiverId);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [receiverId, user._id]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        senderId: user._id,
        receiverId,
        message,
      };

      socket.emit("sendMessage", newMessage);
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
            <strong>{msg.sender._id === user._id ? "You" : msg.sender.username}: </strong>
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
