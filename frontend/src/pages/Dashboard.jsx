import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1d4ed8', '#f59e0b', '#10b981', '#ef4444']; // Blue, Amber, Emerald, Red

const Dashboard = () => {
  const { user, API_URL } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = `${API_URL}/issues`;
        if (user.role === 'Citizen') {
          url += '?myReports=true';
        }
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIssues(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, [user, API_URL]);

  if (loading) return <div>Loading dashboard data...</div>;

  // Compute Metrics
  const total = issues.length;
  const pending = issues.filter(i => i.status === 'Pending').length;
  const inProgress = issues.filter(i => i.status === 'In Progress').length;
  const resolved = issues.filter(i => i.status === 'Resolved').length;

  const priorityData = [
    { name: 'Low', value: issues.filter(i => i.priorityLevel === 'Low').length },
    { name: 'Medium', value: issues.filter(i => i.priorityLevel === 'Medium').length },
    { name: 'High', value: issues.filter(i => i.priorityLevel === 'High').length },
    { name: 'Critical', value: issues.filter(i => i.priorityLevel === 'Critical').length },
  ];

  const statusData = [
    { name: 'Pending', value: pending },
    { name: 'In Progress', value: inProgress },
    { name: 'Resolved', value: resolved },
  ];

  return (
    <div className="container">
      <h2 className="h2" style={{ marginBottom: '1.5rem' }}>
        {user.role === 'Citizen' ? 'My Dashboard' : 'Officer Dashboard'}
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '2rem' }}>
        <div className="card text-center">
          <h3 className="h3" style={{ color: 'var(--text-muted)' }}>Total Reports</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-navy)' }}>{total}</p>
        </div>
        <div className="card text-center" style={{ borderBottom: '4px solid var(--status-pending)' }}>
          <h3 className="h3" style={{ color: 'var(--text-muted)' }}>Pending</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--status-pending)' }}>{pending}</p>
        </div>
        <div className="card text-center" style={{ borderBottom: '4px solid var(--status-resolved)' }}>
          <h3 className="h3" style={{ color: 'var(--text-muted)' }}>Resolved</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--status-resolved)' }}>{resolved}</p>
        </div>
      </div>

      {user.role !== 'Citizen' && (
        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h3 className="h3" style={{ marginBottom: '1rem' }}>Issues by Priority</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value">
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card">
            <h3 className="h3" style={{ marginBottom: '1rem' }}>Issues by Status</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Issues Table (Simplified) */}
      <div className="card">
        <h3 className="h3" style={{ marginBottom: '1rem' }}>{user.role === 'Citizen' ? 'My Recent Reports' : 'Recent Issues'}</h3>
        {issues.length === 0 ? (
          <p className="text-muted">No issues found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                  <th style={{ padding: '0.75rem' }}>Title</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Priority</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {issues.slice(0, 5).map(issue => (
                  <tr key={issue._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{issue.title}</td>
                    <td style={{ padding: '0.75rem' }}>{issue.category}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge badge-${issue.priorityLevel.toLowerCase()}`}>{issue.priorityLevel}</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge badge-${issue.status.split(' ')[0].toLowerCase()}`}>{issue.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{new Date(issue.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
