import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Navigate ,Link} from 'react-router-dom';

const Container = styled.div`
  padding: 20px;
`;

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setRedirectToLogin(true); // Set state to trigger redirect
        return;
      }
      try {
        const response = await fetch('https://sr-express.onrender.com/api/user/data', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          setUserData(data);
        } else {
          localStorage.removeItem('token'); // Remove expired token 
          setRedirectToLogin(true); // Redirect to login on failure
        }
      } catch (err) {
        console.error('Error:', err);
        alert(err);
        setRedirectToLogin(true); // Redirect to login on error
      }
    };

    fetchUserData();
  }, []);

  if (redirectToLogin) {
    return <Navigate to="/login" />; // Perform the redirect
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
      <Link to="/logout"><button>Logout</button></Link>
      {/* Add more user-related data as needed */}
    </Container>
  );
};

export default Dashboard;
