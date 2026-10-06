import React, { useContext, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate
} from 'react-router-dom';

import { AuthContext } from './context/AuthContext';

import {
  Activity,
  MapPin,
  LogOut,
  Home,
  FileText,
  Shield,
  Users
} from 'lucide-react';

import ReportIssue from './pages/ReportIssue';
import Dashboard from './pages/Dashboard';
import CommunityMap from './pages/CommunityMap';
import AdminDashboard from './pages/AdminDashboard';


// ========================================
// LANDING PAGE
// ========================================

const Landing = () => {
  return (
    <div
      className="container flex justify-center items-center"
      style={{
        minHeight: '80vh',
        textAlign: 'center'
      }}
    >
      <div>
        <h1 className="h1">
          Report. Prioritize. Resolve.
        </h1>

        <p
          className="text-muted"
          style={{
            margin: '1rem 0 2rem'
          }}
        >
          Empowering citizens to improve
          hyperlocal public infrastructure.
        </p>

        <Link
          to="/register"
          className="btn btn-primary"
          style={{
            marginRight: '1rem'
          }}
        >
          Get Started
        </Link>

        <Link
          to="/login"
          className="btn btn-outline"
        >
          Login
        </Link>
      </div>
    </div>
  );
};


// ========================================
// LOGIN SELECTION
// ========================================

const LoginSelection = () => {
  const navigate = useNavigate();

  return (
    <div
      className="container flex justify-center items-center"
      style={{
        minHeight: '80vh'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center'
        }}
      >
        <h1
          className="h1"
          style={{
            marginBottom: '0.5rem'
          }}
        >
          HYPER<span>LOCAL</span>
        </h1>

        <p
          className="text-muted"
          style={{
            marginBottom: '2rem'
          }}
        >
          Public Infrastructure Portal
        </p>

        <h2
          className="h2"
          style={{
            marginBottom: '1.5rem'
          }}
        >
          Choose Login
        </h2>


        {/* CITIZEN LOGIN */}

        <button
          onClick={() => navigate('/citizen-login')}
          className="btn btn-primary"
          style={{
            width: '100%',
            marginBottom: '1rem'
          }}
        >
          👤 Citizen Login
        </button>


        {/* COMMUNITY LOGIN */}

        <button
          onClick={() => navigate('/community-login')}
          className="btn btn-outline"
          style={{
            width: '100%',
            marginBottom: '1rem'
          }}
        >
          👥 Community Login
        </button>


        {/* OFFICER LOGIN */}

        <button
          onClick={() => navigate('/officer-login')}
          className="btn btn-outline"
          style={{
            width: '100%',
            marginBottom: '1rem'
          }}
        >
          👨‍💼 Officer Login
        </button>


        {/* ADMIN LOGIN */}

        <button
          onClick={() => navigate('/admin-login')}
          className="btn btn-outline"
          style={{
            width: '100%'
          }}
        >
          🛡️ Admin Login
        </button>


        <div
          style={{
            marginTop: '2rem'
          }}
        >
          <p className="text-muted">
            Don't have an account?
          </p>

          <Link
            to="/register"
            className="btn btn-primary"
          >
            Create Account
          </Link>
        </div>

      </div>
    </div>
  );
};


// ========================================
// ROLE LOGIN
// ========================================

const RoleLogin = ({
  role,
  title,
  redirect
}) => {

  const {
    login,
    error
  } = useContext(AuthContext);

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleError, setRoleError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e) => {

    e.preventDefault();

    setRoleError('');
    setLoading(true);


    try {

      // Existing AuthContext login
      const success = await login(
        email,
        password
      );


      if (!success) {
        setLoading(false);
        return;
      }


      // Get token
      const token = localStorage.getItem('token');


      if (!token) {

        setRoleError(
          'Login failed. Authentication token not found.'
        );

        setLoading(false);
        return;
      }


      // Verify actual user role
      const response = await fetch(
        'http://localhost:5000/api/auth/me',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      if (!response.ok) {

        localStorage.removeItem('token');

        setRoleError(
          'Unable to verify your account.'
        );

        setLoading(false);
        return;
      }


      const loggedUser =
        await response.json();


      // Role mismatch
      if (loggedUser.role !== role) {

        localStorage.removeItem('token');

        setRoleError(
          `Access denied. This login is only for ${role} accounts.`
        );

        setLoading(false);
        return;
      }


      // Correct role
      navigate(redirect);

    } catch (err) {

      console.error(err);

      setRoleError(
        'Something went wrong. Please try again.'
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div
      className="container flex justify-center items-center"
      style={{
        minHeight: '80vh'
      }}
    >

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px'
        }}
      >

        <h2
          className="h2 text-center"
          style={{
            marginBottom: '1.5rem'
          }}
        >
          {title}
        </h2>


        {/* ERROR */}

        {(error || roleError) && (

          <div
            style={{
              color: '#b91c1c',
              backgroundColor: '#fee2e2',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}
          >
            {roleError || error}
          </div>

        )}


        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="input-group">

            <label className="input-label">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="input-field"
              placeholder="Enter your email"
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="input-group">

            <label className="input-label">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="input-field"
              placeholder="Enter your password"
              required
            />

          </div>


          {/* LOGIN */}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%'
            }}
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Login'}
          </button>

        </form>


        {/* BACK */}

        <button
          onClick={() => navigate('/login')}
          className="btn btn-outline"
          style={{
            width: '100%',
            marginTop: '1rem'
          }}
        >
          ← Back to Login Options
        </button>

      </div>

    </div>
  );
};


// ========================================
// REGISTER
// ========================================

const Register = () => {

  const {
    register,
    error
  } = useContext(AuthContext);

  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleSubmit = async (e) => {

    e.preventDefault();

    const success = await register(
      name,
      email,
      password
    );

    if (success) {
      navigate('/dashboard');
    }
  };


  return (
    <div
      className="container flex justify-center items-center"
      style={{
        minHeight: '80vh'
      }}
    >

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '400px'
        }}
      >

        <h2
          className="h2 text-center"
          style={{
            marginBottom: '1.5rem'
          }}
        >
          Create Account
        </h2>


        {error && (

          <div
            style={{
              color: 'red',
              marginBottom: '1rem'
            }}
          >
            {error}
          </div>

        )}


        <form onSubmit={handleSubmit}>

          {/* FULL NAME */}

          <div className="input-group">

            <label className="input-label">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="input-field"
              placeholder="Enter full name"
              required
            />

          </div>


          {/* EMAIL */}

          <div className="input-group">

            <label className="input-label">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="input-field"
              placeholder="Enter email"
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="input-group">

            <label className="input-label">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="input-field"
              placeholder="Create password"
              required
            />

          </div>


          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%'
            }}
          >
            Register
          </button>

        </form>


        <div
          style={{
            marginTop: '1rem',
            textAlign: 'center'
          }}
        >
          <Link to="/login">
            ← Back to Login
          </Link>
        </div>

      </div>

    </div>
  );
};


// ========================================
// NAVBAR
// ========================================

const Navbar = () => {

  const {
    user,
    logout
  } = useContext(AuthContext);

  const navigate = useNavigate();


  const handleLogout = () => {

    logout();

    navigate('/');

  };


  return (
    <nav className="navbar">

      <div className="container">

        <Link
          to="/"
          className="logo"
        >

          <Activity
            size={24}
            color="var(--secondary-teal)"
          />

          HYPER<span>LOCAL</span>

        </Link>


        <div
          className="flex items-center gap-4"
        >

          {user ? (

            <>

              <span
                className="text-muted text-sm"
              >
                Hi, {user.name}
              </span>

              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center'
                }}
              >

                <LogOut size={16} />

                Logout

              </button>

            </>

          ) : (

            <>

              <Link
                to="/login"
                className="btn btn-outline"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="btn btn-primary"
              >
                Sign Up
              </Link>

            </>

          )}

        </div>

      </div>

    </nav>
  );
};


// ========================================
// SIDEBAR
// ========================================

const Sidebar = () => {

  const {
    user
  } = useContext(AuthContext);

  if (!user) return null;


  return (
    <aside className="sidebar">

      <ul
        className="flex flex-col gap-2"
      >

        {/* COMMON DASHBOARD */}

        <li>

          <Link
            to="/dashboard"
            className="flex items-center gap-2"
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}
          >

            <Home size={20} />

            Dashboard

          </Link>

        </li>


        {/* CITIZEN MENU */}

        {user.role === 'Citizen' && (

          <>

            <li>

              <Link
                to="/report"
                className="flex items-center gap-2"
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >

                <MapPin size={20} />

                Report Issue

              </Link>

            </li>


            <li>

              <Link
                to="/my-reports"
                className="flex items-center gap-2"
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)'
                }}
              >

                <FileText size={20} />

                My Reports

              </Link>

            </li>

          </>

        )}


        {/* OFFICER MENU */}

        {user.role === 'Officer' && (

          <li>

            <Link
              to="/officer-dashboard"
              className="flex items-center gap-2"
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)'
              }}
            >

              <Users size={20} />

              Officer Dashboard

            </Link>

          </li>

        )}


        {/* ADMIN MENU */}

        {user.role === 'Admin' && (

          <li>

            <Link
              to="/admin-dashboard"
              className="flex items-center gap-2"
              style={{
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)'
              }}
            >

              <Shield size={20} />

              Admin Dashboard

            </Link>

          </li>

        )}


        {/* COMMUNITY MAP */}

        <li>

          <Link
            to="/community"
            className="flex items-center gap-2"
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)'
            }}
          >

            <Activity size={20} />

            Community Map

          </Link>

        </li>

      </ul>

    </aside>
  );
};


// ========================================
// PRIVATE ROUTE
// ========================================

const PrivateRoute = ({ children }) => {

  const {
    user,
    loading
  } = useContext(AuthContext);


  if (loading) {
    return <div>Loading...</div>;
  }


  if (!user) {
    return <Navigate to="/login" />;
  }


  return children;
};


// ========================================
// ROLE PROTECTED ROUTE
// ========================================

const RoleRoute = ({
  children,
  allowedRole
}) => {

  const {
    user,
    loading
  } = useContext(AuthContext);


  if (loading) {
    return <div>Loading...</div>;
  }


  if (!user) {
    return <Navigate to="/login" />;
  }


  if (user.role !== allowedRole) {
    return <Navigate to="/dashboard" />;
  }


  return children;
};


// ========================================
// MAIN APP
// ========================================

function App() {

  const {
    loading
  } = useContext(AuthContext);


  if (loading) {

    return (
      <div
        className="container flex justify-center items-center"
        style={{
          height: '100vh'
        }}
      >
        Loading...
      </div>
    );

  }


  return (
    <>
      <Navbar />

      <div className="main-layout">

        <Sidebar />

        <main className="content-area">

          <Routes>

            {/* HOME */}

            <Route
              path="/"
              element={<Landing />}
            />


            {/* LOGIN SELECTION */}

            <Route
              path="/login"
              element={<LoginSelection />}
            />


            {/* CITIZEN LOGIN */}

            <Route
              path="/citizen-login"
              element={
                <RoleLogin
                  role="Citizen"
                  title="👤 Citizen Login"
                  redirect="/dashboard"
                />
              }
            />


            {/* COMMUNITY LOGIN */}

            <Route
              path="/community-login"
              element={
                <RoleLogin
                  role="Community"
                  title="👥 Community Login"
                  redirect="/community"
                />
              }
            />


            {/* OFFICER LOGIN */}

            <Route
              path="/officer-login"
              element={
                <RoleLogin
                  role="Officer"
                  title="👨‍💼 Officer Login"
                  redirect="/officer-dashboard"
                />
              }
            />


            {/* ADMIN LOGIN */}

            <Route
              path="/admin-login"
              element={
                <RoleLogin
                  role="Admin"
                  title="🛡️ Admin Login"
                  redirect="/admin-dashboard"
                />
              }
            />


            {/* REGISTER */}

            <Route
              path="/register"
              element={<Register />}
            />


            {/* GENERAL DASHBOARD */}

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />


            {/* REPORT ISSUE - CITIZEN ONLY */}

            <Route
              path="/report"
              element={
                <RoleRoute allowedRole="Citizen">
                  <ReportIssue />
                </RoleRoute>
              }
            />


            {/* MY REPORTS - CITIZEN ONLY */}

            <Route
              path="/my-reports"
              element={
                <RoleRoute allowedRole="Citizen">
                  <Dashboard />
                </RoleRoute>
              }
            />


            {/* COMMUNITY MAP */}

            <Route
              path="/community"
              element={
                <PrivateRoute>
                  <CommunityMap />
                </PrivateRoute>
              }
            />


            {/* OFFICER DASHBOARD */}

            <Route
              path="/officer-dashboard"
              element={
                <RoleRoute allowedRole="Officer">

                  <div className="container">

                    <h1 className="h1">
                      👨‍💼 Officer Dashboard
                    </h1>

                    <p className="text-muted">
                      Welcome Officer. You can manage
                      infrastructure issues assigned to
                      your department.
                    </p>

                  </div>

                </RoleRoute>
              }
            />


            {/* ADMIN DASHBOARD */}

            <Route
              path="/admin-dashboard"
              element={
                <RoleRoute allowedRole="Admin">
                  <AdminDashboard />
                </RoleRoute>
              }
            />


            {/* INVALID ROUTE */}

            <Route
              path="*"
              element={
                <Navigate to="/" />
              }
            />

          </Routes>

        </main>

      </div>
    </>
  );
}


export default App;