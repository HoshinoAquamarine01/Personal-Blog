import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/Authcontext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./component/Varbar";
import Footer from "./component/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminEmailSettings from "./pages/AdminEmailSettings";
import CreatePost from "./pages/CreatePost";
import EditPost from "./pages/EditPost";
import PostDetail from "./pages/PostDetail";
import UserProfile from "./pages/UserProfile";
import ChangePassword from "./pages/ChangePassword";
import EditProfile from "./pages/EditProfile";
import SearchUsers from "./pages/SearchUsers";
import Chat from "./pages/Chat";
import Inbox from "./pages/Inbox";
import Notifications from "./pages/Notifications";
import VipPurchase from "./pages/VipPurchase";
import PaymentConfirm from "./pages/PaymentConfirm";
import PaymentReturn from "./pages/PaymentReturn";
import PaymentBank from "./pages/PaymentBank";
import ThemeSettings from "./pages/ThemeSettings";
import Quests from "./pages/Quests";
import Shop from "./pages/Shop";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <Router>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-post/:id"
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            }
          />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route
            path="/admin/email-settings"
            element={
              <ProtectedRoute>
                <AdminEmailSettings />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:userId/edit" element={<EditProfile />} />
          <Route
            path="/search-users"
            element={
              <ProtectedRoute>
                <SearchUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <ProtectedRoute>
                <Inbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:userId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vip"
            element={
              <ProtectedRoute>
                <VipPurchase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/:paymentId"
            element={
              <ProtectedRoute>
                <PaymentConfirm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/return/:paymentId"
            element={
              <ProtectedRoute>
                <PaymentReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment/bank/:paymentId"
            element={
              <ProtectedRoute>
                <PaymentBank />
              </ProtectedRoute>
            }
          />
          <Route
            path="/theme-settings"
            element={
              <ProtectedRoute>
                <ThemeSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quests"
            element={
              <ProtectedRoute>
                <Quests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shop"
            element={
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
