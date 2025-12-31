import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

// Global Styles
import './styles/GlobalDesign.css';

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import LandingPage from "./pages/LandingPage";
import Projects from "./pages/Projects";
import MyProjects from "./pages/MyProjects";
import ProjectDetails from "./pages/ProjectDetails";
import Profile from "./pages/UserProfile";
import UserDashboard from "./pages/UserDashboard";
import Navbar from "./components/Navbar";
// Admin Pages
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import ProjectsManagement from "./pages/admin/ProjectsManagement";
import JoinRequestsManagement from "./pages/admin/JoinRequestsManagement";

/**
 * 🔐 Protected Route
 */
const ProtectedRoute = ({ children }) => {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.isVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

/**
 * 🛡️ Admin Route Guard
 */
const AdminRoute = () => {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if role is admin (assuming user object has role)
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout />;
};

/**
 * 🌐 App Routes
 */
const AppRoutes = () => {
  const { token } = useAuth();

  // Helper to determine if we are in admin section to optionally hide regular navbar
  // But for now, AdminLayout has its own Navbar, so we should probably NOT show use Navbar if in admin route
  // We can handle this by route structure below.
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  return (
    <>
      {token && !isAdminRoute && <Navbar />}

      <div style={{ paddingTop: !isAdminRoute ? "80px" : "0" }}>
        <Routes>
          {/* Public pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Protected pages */}
          {/* Post-login landing dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-projects"
            element={
              <ProtectedRoute>
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 🛡️ Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="projects" element={<ProjectsManagement />} />
            <Route path="requests" element={<JoinRequestsManagement />} />
            {/* Analytics can be a placeholder or reuse Dashboard for now */}
            <Route path="analytics" element={<AdminDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/landing" replace />} />
        </Routes>
      </div>
    </>

  );
};

/**
 * 🚀 App Root
 */
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
