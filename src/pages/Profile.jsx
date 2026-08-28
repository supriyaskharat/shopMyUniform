// src/pages/Profile.jsx
// Profile page — lets users update their name, school, and grade.
// Loads all available schools from the backend for the dropdown.

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

function Profile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [selectedSchool, setSelectedSchool] = useState(user?.school?._id || user?.school || '');
  const [selectedGrade, setSelectedGrade] = useState(user?.grade || '');
  const [schools, setSchools] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all schools when the page loads
  useEffect(() => {
    api.get('/schools').then((res) => setSchools(res.data.data));
  }, []);

  // When the selected school changes, update the list of available grades
  useEffect(() => {
    const school = schools.find((s) => s._id === selectedSchool);
    setAvailableGrades(school ? school.grades : []);
    // Reset grade if the new school doesn't have the previously selected grade
    if (school && !school.grades.includes(selectedGrade)) {
      setSelectedGrade('');
    }
  }, [selectedSchool, schools]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await api.put('/auth/me', {
        name,
        school: selectedSchool,
        grade: selectedGrade,
      });
      updateUser(res.data.data); // Update context + localStorage
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Update your school and grade to see relevant products</p>
      </div>

      <div className="card" style={{ maxWidth: '500px' }}>
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={user?.email}
              disabled // Email cannot be changed
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <input
              type="text"
              className="form-input"
              value={user?.role}
              disabled // Role cannot be changed after registration
            />
          </div>

          <div className="form-group">
            <label className="form-label">School</label>
            <select
              className="form-select"
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
            >
              <option value="">-- Select your school --</option>
              {schools.map((school) => (
                <option key={school._id} value={school._id}>
                  {school.name} ({school.city})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Grade</label>
            <select
              className="form-select"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              disabled={!selectedSchool}
            >
              <option value="">-- Select your grade --</option>
              {availableGrades.map((grade) => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
