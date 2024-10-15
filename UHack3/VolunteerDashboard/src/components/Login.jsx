// src/components/Login.jsx
import React, { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../UserContext'; // Import the useUser hook

const CHECK_CREDENTIALS = gql`
  query GetUserByEmailAndPassword($email: String!, $password: String!) {
    VolunteerRegForm(where: { Email: { _eq: $email }, Password: { _eq: $password } }) {
      ID
      Admin
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { setUserId } = useUser(); // Get the setUserId function from context
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [checkCredentials] = useLazyQuery(CHECK_CREDENTIALS, {
    onCompleted: (data) => {
      if (data.VolunteerRegForm.length > 0) {
        const user = data.VolunteerRegForm[0];
        setUserId(user.ID); // Set the user ID in context
        if (user.Admin) {
          navigate('/admin-dashboard');
        } else {
          navigate('/volunteer-dashboard');
        }
      } else {
        setError('Incorrect email or password. Please try again.');
      }
    },
    onError: () => {
      setError('An error occurred while checking your credentials. Please try again later.');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = formData;
    if (email && password) {
      checkCredentials({ variables: { email, password } });
    } else {
      setError('Please fill in all fields.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
        
        <label>Password</label>
        <div className="password-container">
          <input
            type={passwordVisible ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          <span className="eye-icon" onClick={() => setPasswordVisible(!passwordVisible)}>
            <FontAwesomeIcon icon={passwordVisible ? faEye : faEyeSlash} />
          </span>
        </div>
        
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
