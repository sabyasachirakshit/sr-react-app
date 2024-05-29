// src/App.js
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/DashBoard';
import Logout from './components/Logout';
import ForgotPassword from './components/ForgetPassword';


const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path:"/logout",
    element:<Logout />
  },
  {
    path:"/forgetpass",
    element:<ForgotPassword />
  }
]);

const App = () => {
  return (
    <RouterProvider router={router} />
  );
};

export default App;
