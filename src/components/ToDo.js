import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Modal, Button, Input, List, Checkbox, message } from "antd";

const Container = styled.div`
  padding: 20px;
`;

const TodoItem = styled.div`
  text-decoration: ${(props) => (props.completed ? "line-through" : "none")};
`;

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editTodo, setEditTodo] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch("https://sr-express.onrender.com/api/todo", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setTodos(data);
  };

  const handleAddTodo = async () => {
    const msg = message.loading("Adding task..", 3);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("https://sr-express.onrender.com/api/todo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTodo }),
      });
      const todo = await response.json();
      setTodos([...todos, todo]);
      message.success("Task successfully added!", 3);
    } catch (err) {
      message.error(err, 3);
    } finally {
      msg();
    }

    setNewTodo("");
  };

  const handleDeleteTodo = async (id) => {
    const token = localStorage.getItem("token");
    const msg = message.loading("Deleting Task..", 3);
    try {
      const response = await fetch(`https://sr-express.onrender.com/api/todo/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success("Task deleted successfully!", 3);
    } catch (error) {
      message.error(error, 3);
    } finally {
      msg();
    }

    setTodos(todos.filter((todo) => todo._id !== id));
  };

  const handleToggleComplete = async (todo) => {
    const token = localStorage.getItem("token");
    const msg = message.loading("Updating Task..", 3);
    try {
      const response = await fetch(
        `https://sr-express.onrender.com/api/todo/${todo._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ completed: !todo.completed }),
        }
      );
      const updatedTodo = await response.json();
      setTodos(todos.map((t) => (t._id === updatedTodo._id ? updatedTodo : t)));
      message.success("Task updated!",3)
    } catch (err) {
      message.error(err, 3);
    } finally {
      msg();
    }
  };

  const handleEditTodo = (todo) => {
    setEditTodo(todo);
    setIsModalVisible(true);
  };

  const handleSaveEditTodo = async () => {
    const token = localStorage.getItem("token");
    const msg = message.loading("Editing Task..", 3);
    try {
      const response = await fetch(
        `https://sr-express.onrender.com/api/todo/${editTodo._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: editTodo.title }),
        }
      );
      const updatedTodo = await response.json();
      setTodos(todos.map((t) => (t._id === updatedTodo._id ? updatedTodo : t)));
      message.success("Task edited successfully!", 3);
    } catch (err) {
      message.error(err, 3);
    } finally {
      msg();
      setIsModalVisible(false);
    }
  };

  return (
    <Container>
      <h2>To-Do List</h2>
      <Input
        placeholder="Add a new to-do"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        onPressEnter={handleAddTodo}
      />
      <Button type="primary" onClick={handleAddTodo} style={{ marginTop: 10 }}>
        Add
      </Button>
      <List
        dataSource={todos}
        renderItem={(todo) => (
          <List.Item
            actions={[
              <Checkbox
                checked={todo.completed}
                onChange={() => handleToggleComplete(todo)}
              >
                Complete
              </Checkbox>,
              <Button type="link" onClick={() => handleEditTodo(todo)}>
                Edit
              </Button>,
              <Button
                type="link"
                danger
                onClick={() => handleDeleteTodo(todo._id)}
              >
                Delete
              </Button>,
            ]}
          >
            <TodoItem completed={todo.completed}>{todo.title}</TodoItem>
          </List.Item>
        )}
      />
      <Modal
        title="Edit To-Do"
        visible={isModalVisible}
        onOk={handleSaveEditTodo}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          value={editTodo?.title}
          onChange={(e) => setEditTodo({ ...editTodo, title: e.target.value })}
        />
      </Modal>
    </Container>
  );
};

export default Todo;
