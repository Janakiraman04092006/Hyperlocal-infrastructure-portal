import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import MapComponent from '../components/MapComponent';
import { AuthContext } from '../context/AuthContext';

const CommunityMap = () => {
  const { API_URL } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        // Fetch all issues for community map (publicly viewable or authenticated, depending on strictness. We use auth token here since user is logged in)
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/issues`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setIssues(res.data);
      } catch (err) {
        console.error("Failed to fetch issues", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [API_URL]);

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
        <h2 className="h2">Community Issues Map</h2>
        <div className="flex gap-2">
           <span className="badge badge-low">Low Priority</span>
           <span className="badge badge-medium">Medium</span>
           <span className="badge badge-high">High</span>
           <span className="badge badge-critical">Critical</span>
        </div>
      </div>
      
      {loading ? (
        <div>Loading map data...</div>
      ) : (
        <div style={{ flex: 1, minHeight: '600px' }}>
           {/* Center broadly around India or adjust based on user location */}
          <MapComponent issues={issues} height="100%" />
        </div>
      )}
    </div>
  );
};

export default CommunityMap;
