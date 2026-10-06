import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';

const ReportIssue = () => {
  const { user, API_URL } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Pothole',
    description: '',
    severity: 'Medium',
    address: ''
  });
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Try to get user's current location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (err) => {
          console.warn("Could not get geolocation", err);
          // Set default to center of map or let them click
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setError("Please select a location on the map.");
      return;
    }

    setLoading(true);
    setError('');

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('category', formData.category);
    submitData.append('description', formData.description);
    submitData.append('severity', formData.severity);
    submitData.append('address', formData.address);
    submitData.append('latitude', location.lat);
    submitData.append('longitude', location.lng);
    if (photo) {
      submitData.append('photo', photo);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/issues`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      navigate('/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h2 className="h2" style={{ marginBottom: '1.5rem' }}>Report an Issue</h2>
      
      {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="input-field" placeholder="e.g., Deep Pothole on Main St" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input-field" required>
                <option value="Pothole">Pothole</option>
                <option value="Damaged Road">Damaged Road</option>
                <option value="Broken Streetlight">Broken Streetlight</option>
                <option value="Garbage">Garbage Dump</option>
                <option value="Water Leakage">Water Leakage</option>
                <option value="Drainage">Drainage</option>
                <option value="Traffic Signal">Traffic Signal</option>
                <option value="Electricity">Electricity</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Severity</label>
              <select name="severity" value={formData.severity} onChange={handleChange} className="input-field" required>
                <option value="Low">Low - Causes minor inconvenience</option>
                <option value="Medium">Medium - Needs attention soon</option>
                <option value="High">High - Dangerous or causing major disruption</option>
              </select>
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="input-field" rows="4" placeholder="Describe the issue in detail..." required></textarea>
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Address (Optional)</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="Approximate address or landmark" />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Location (Click on map to set pinpoint)</label>
            <MapComponent 
              interactive={true} 
              onLocationSelect={setLocation} 
              selectedLocation={location} 
              center={location ? [location.lat, location.lng] : [20.5937, 78.9629]}
              zoom={location ? 15 : 5}
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Upload Photo</label>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="input-field" style={{ padding: '0.4rem' }} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
