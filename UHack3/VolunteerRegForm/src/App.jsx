import React, { useState } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './App.css';

// Define CHECK_VOLUNTEER query
const CHECK_VOLUNTEER = gql`
  query CheckVolunteer($First_Name: String!, $Last_Name: String!, $Address: String, $Email: String!) {
    VolunteerRegForm(where: {
      _and: [
        { First_Name: { _eq: $First_Name } },
        { Last_Name: { _eq: $Last_Name } },
        { _or: [
            { Address: { _eq: $Address } },
            { Email: { _eq: $Email } }
          ]
        }
      ]
    }) {
      ID
    }
  }
`;

// Define CHECK_EMAIL_PASSWORD query
const CHECK_EMAIL_PASSWORD = gql`
  query CheckEmailPassword($Email: String!, $Password: String!) {
    VolunteerRegForm(where: { 
      _and: [
        { Email: { _eq: $Email } }, 
        { Password: { _eq: $Password } }
      ]
    }) {
      ID
    }
  }
`;

// Define ADD_VOLUNTEER mutation
const ADD_VOLUNTEER = gql`
  mutation AddVolunteer($firstName: String!, $lastName: String!, $area: String!, $address: String, $email: String!, $password: String!) {
    insert_VolunteerRegForm(objects: { First_Name: $firstName, Last_Name: $lastName, Area: $area, Address: $address, Email: $email, Password: $password }) {
      returning {
        ID
      }
    }
  }
`;

function App() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    area: '',
    address: '',
    email: '',
    password: '',
    showPassword: false,
  });

  const [errors, setErrors] = useState({});
  const [checkVolunteer] = useLazyQuery(CHECK_VOLUNTEER);
  const [checkEmailPassword] = useLazyQuery(CHECK_EMAIL_PASSWORD);
  const [addVolunteer] = useMutation(ADD_VOLUNTEER);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.firstName) {
      formErrors.firstName = 'First Name is required.';
    }
    if (!formData.lastName) {
      formErrors.lastName = 'Last Name is required.';
    }
    if (!formData.area) {
      formErrors.area = 'Area is required.';
    }
    if (!formData.email) {
      formErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = 'Email address is invalid.';
    }
    if (!formData.password) {
      formErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      formErrors.password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(formData.password)) {
      formErrors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[0-9]/.test(formData.password)) {
      formErrors.password = 'Password must contain at least one number.';
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      formErrors.password = 'Password must contain at least one special character.';
    }
    return formErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const { data: checkVolunteerData } = await checkVolunteer({
          variables: {
            First_Name: formData.firstName,
            Last_Name: formData.lastName,
            Address: formData.address,
            Email: formData.email,
          }
        });

        if (checkVolunteerData.VolunteerRegForm.length > 0) {
          alert('A volunteer with this name, address, or email already exists.');
          return;
        }

        const { data: checkEmailPasswordData } = await checkEmailPassword({
          variables: {
            Email: formData.email,
            Password: formData.password,
          }
        });

        if (checkEmailPasswordData.VolunteerRegForm.length > 0) {
          alert('A volunteer with this email and password already exists.');
          return;
        }

        await addVolunteer({ variables: { 
          firstName: formData.firstName, 
          lastName: formData.lastName, 
          area: formData.area, 
          address: formData.address, 
          email: formData.email, 
          password: formData.password 
        }});

        alert('Volunteer registered successfully!');
        
        setFormData({
          firstName: '',
          lastName: '',
          area: '',
          address: '',
          email: '',
          password: '',
          showPassword: false,
        });

      } catch (error) {
        console.error('Error checking or adding volunteer:', error);
        alert('Failed to submit the form. Please try again.');
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="App">
      <h1>Volunteer Form</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          {errors.firstName && <p className="error">{errors.firstName}</p>}
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && <p className="error">{errors.lastName}</p>}
        </div>
        <div>
          <label>Area of Work</label>
          <input
            type="text"
            name="area"
            value={formData.area}
            onChange={handleChange}
          />
          {errors.area && <p className="error">{errors.area}</p>}
        </div>
        <div>
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          {errors.address && <p className="error">{errors.address}</p>}
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>
        <div>
          <label>Password</label>
          <div className="password-container">
            <input
              type={formData.showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              pattern="(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}"
              autoComplete='off'
            />
            <span onClick={togglePasswordVisibility} className="eye-icon">
              <FontAwesomeIcon icon={formData.showPassword ? faEyeSlash : faEye} />
            </span>
            {/* Tooltip for password requirements */}
            <div className="password-tooltip">
              Password must contain:
              <ul>
                <li>At least 8 characters</li>
                <li>At least one uppercase letter</li>
                <li>At least one number</li>
                <li>At least one special character (!@#$%^&*)</li>
              </ul>
            </div>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
