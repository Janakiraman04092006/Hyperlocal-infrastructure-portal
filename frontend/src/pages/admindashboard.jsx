import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { API_URL } = useContext(AuthContext);

  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [creatingOfficer, setCreatingOfficer] = useState(false);
  const [deletingOfficer, setDeletingOfficer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    phone: '',
    department: '',
  });

  // ==========================================
  // GET TOKEN
  // ==========================================

  const getToken = () => {
    return localStorage.getItem('token');
  };

  // ==========================================
  // FETCH OFFICERS
  // ==========================================

  const fetchOfficers = async () => {
    try {
      const token = getToken();

      const res = await axios.get(
        `${API_URL}/admin/officers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOfficers(res.data.officers || []);
    } catch (err) {
      console.error(
        'Fetch Officers Error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to load officers.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH DEPARTMENTS
  // ==========================================

  const fetchDepartments = async () => {
    try {
      const token = getToken();

      const res = await axios.get(
        `${API_URL}/admin/departments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDepartments(
        res.data.departments || []
      );
    } catch (err) {
      console.error(
        'Fetch Departments Error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to load departments.'
      );
    } finally {
      setLoadingDepartments(false);
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    fetchOfficers();
    fetchDepartments();
  }, []);

  // ==========================================
  // HANDLE FORM INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // CREATE OFFICER
  // ==========================================

  const handleCreateOfficer = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (
      !formData.name ||
      !formData.email ||
      !formData.employeeId ||
      !formData.department
    ) {
      setError(
        'Please fill all required fields.'
      );
      return;
    }

    try {
      setCreatingOfficer(true);

      const token = getToken();

      const res = await axios.post(
        `${API_URL}/admin/officers`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage(
        res.data.message ||
          'Officer created successfully.'
      );

      setFormData({
        name: '',
        email: '',
        employeeId: '',
        phone: '',
        department: '',
      });

      setShowForm(false);

      await fetchOfficers();
    } catch (err) {
      console.error(
        'Create Officer Error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to create officer account.'
      );
    } finally {
      setCreatingOfficer(false);
    }
  };

  // ==========================================
  // DELETE OFFICER
  // ==========================================

  const handleDeleteOfficer = async (officer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${officer.name}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage('');
      setError('');
      setDeletingOfficer(officer._id);

      const token = getToken();

      await axios.delete(
        `${API_URL}/admin/officers/${officer._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        `Officer ${officer.name} deleted successfully.`
      );

      setOfficers((previous) =>
        previous.filter(
          (item) =>
            item._id !== officer._id
        )
      );
    } catch (err) {
      console.error(
        'Delete Officer Error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to delete officer.'
      );
    } finally {
      setDeletingOfficer(null);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Arial, sans-serif',
          background: '#f5f7fb',
        }}
      >
        <h2>
          Loading Admin Dashboard...
        </h2>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: '30px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >

        {/* ==================================
            HEADER
        ================================== */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: '#1f2937',
              }}
            >
              Officer Management
            </h1>

            <p
              style={{
                color: '#6b7280',
                marginTop: '8px',
              }}
            >
              Manage officers registered by
              the administrator.
            </p>
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setMessage('');
              setError('');
            }}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
            }}
          >
            {showForm
              ? 'Cancel'
              : '+ Create Officer'}
          </button>
        </div>

        {/* ==================================
            SUCCESS MESSAGE
        ================================== */}

        {message && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '20px',
              border:
                '1px solid #bbf7d0',
            }}
          >
            ✓ {message}
          </div>
        )}

        {/* ==================================
            ERROR MESSAGE
        ================================== */}

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '14px',
              borderRadius: '8px',
              marginBottom: '20px',
              border:
                '1px solid #fecaca',
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* ==================================
            CREATE OFFICER FORM
        ================================== */}

        {showForm && (
          <div
            style={{
              background: '#ffffff',
              padding: '25px',
              borderRadius: '12px',
              marginBottom: '30px',
              boxShadow:
                '0 2px 10px rgba(0,0,0,0.08)',
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: '#1f2937',
              }}
            >
              Create Officer Account
            </h2>

            <form
              onSubmit={handleCreateOfficer}
            >

              {/* NAME */}

              <div
                style={{
                  marginBottom: '18px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter officer name"
                  required
                  style={inputStyle}
                />
              </div>

              {/* EMAIL */}

              <div
                style={{
                  marginBottom: '18px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="officer@example.com"
                  required
                  style={inputStyle}
                />
              </div>

              {/* EMPLOYEE ID */}

              <div
                style={{
                  marginBottom: '18px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  Employee ID *
                </label>

                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="EMP001"
                  required
                  style={inputStyle}
                />
              </div>

              {/* PHONE */}

              <div
                style={{
                  marginBottom: '18px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  style={inputStyle}
                />
              </div>

              {/* DEPARTMENT */}

              <div
                style={{
                  marginBottom: '22px',
                }}
              >
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: '600',
                    color: '#374151',
                  }}
                >
                  Department *
                </label>

                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  disabled={loadingDepartments}
                  style={inputStyle}
                >
                  <option value="">
                    {loadingDepartments
                      ? 'Loading departments...'
                      : 'Select Department'}
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={department._id}
                        value={department._id}
                      >
                        {department.name}
                      </option>
                    )
                  )}
                </select>

                {!loadingDepartments &&
                  departments.length === 0 && (
                    <p
                      style={{
                        color: '#dc2626',
                        fontSize: '14px',
                        marginTop: '6px',
                      }}
                    >
                      No departments found
                      in the database.
                    </p>
                  )}
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  creatingOfficer ||
                  loadingDepartments ||
                  departments.length === 0
                }
                style={{
                  background:
                    creatingOfficer ||
                    departments.length === 0
                      ? '#9ca3af'
                      : '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor:
                    creatingOfficer ||
                    departments.length === 0
                      ? 'not-allowed'
                      : 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                }}
              >
                {creatingOfficer
                  ? 'Creating...'
                  : 'Create Officer'}
              </button>
            </form>
          </div>
        )}

        {/* ==================================
            OFFICER LIST
        ================================== */}

        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '25px',
            boxShadow:
              '0 2px 10px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                margin: 0,
                color: '#1f2937',
              }}
            >
              Registered Officers
            </h2>

            <span
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                padding: '8px 14px',
                borderRadius: '20px',
                fontWeight: '600',
              }}
            >
              {officers.length} Officers
            </span>
          </div>

          {officers.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '50px 20px',
                color: '#6b7280',
              }}
            >
              <div
                style={{
                  fontSize: '45px',
                  marginBottom: '10px',
                }}
              >
                👮
              </div>

              <h3>
                No officers found
              </h3>

              <p>
                Create the first officer
                account using the button
                above.
              </p>
            </div>
          ) : (
            <div
              style={{
                overflowX: 'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse:
                    'collapse',
                  minWidth: '900px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f9fafb',
                    }}
                  >
                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Name
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Email
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Employee ID
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Department
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Status
                    </th>

                    <th
                      style={
                        tableHeaderStyle
                      }
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {officers.map(
                    (officer) => (
                      <tr
                        key={officer._id}
                        style={{
                          borderBottom:
                            '1px solid #e5e7eb',
                        }}
                      >
                        {/* NAME */}

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {officer.name}
                        </td>

                        {/* EMAIL */}

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {officer.email}
                        </td>

                        {/* EMPLOYEE ID */}

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {officer.employeeId}
                        </td>

                        {/* DEPARTMENT */}

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          {officer.department
                            ?.name ||
                            'Not assigned'}
                        </td>

                        {/* STATUS */}

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <span
                            style={{
                              display:
                                'inline-block',
                              padding:
                                '5px 10px',
                              borderRadius:
                                '15px',
                              background:
                                officer.isActive
                                  ? '#dcfce7'
                                  : '#fee2e2',
                              color:
                                officer.isActive
                                  ? '#166534'
                                  : '#991b1b',
                              fontSize:
                                '13px',
                              fontWeight:
                                '600',
                            }}
                          >
                            {officer.isActive
                              ? 'Active'
                              : 'Inactive'}
                          </span>
                        </td>

                        {/* DELETE */}

                        <td
                          style={
                            tableCellStyle
                          }
                        >
                          <button
                            onClick={() =>
                              handleDeleteOfficer(
                                officer
                              )
                            }
                            disabled={
                              deletingOfficer ===
                              officer._id
                            }
                            style={{
                              background:
                                deletingOfficer ===
                                officer._id
                                  ? '#9ca3af'
                                  : '#dc2626',
                              color:
                                '#ffffff',
                              border: 'none',
                              padding:
                                '8px 15px',
                              borderRadius:
                                '6px',
                              cursor:
                                deletingOfficer ===
                                officer._id
                                  ? 'not-allowed'
                                  : 'pointer',
                              fontSize:
                                '13px',
                              fontWeight:
                                '600',
                            }}
                          >
                            {deletingOfficer ===
                            officer._id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// INPUT STYLE
// ==========================================

const inputStyle = {
  width: '100%',
  padding: '11px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '7px',
  fontSize: '15px',
  boxSizing: 'border-box',
  outline: 'none',
};

// ==========================================
// TABLE HEADER STYLE
// ==========================================

const tableHeaderStyle = {
  textAlign: 'left',
  padding: '13px',
  fontSize: '14px',
  color: '#374151',
  whiteSpace: 'nowrap',
};

// ==========================================
// TABLE CELL STYLE
// ==========================================

const tableCellStyle = {
  padding: '14px 13px',
  fontSize: '14px',
  color: '#4b5563',
  whiteSpace: 'nowrap',
};

// ==========================================
// EXPORT
// ==========================================

export default AdminDashboard;