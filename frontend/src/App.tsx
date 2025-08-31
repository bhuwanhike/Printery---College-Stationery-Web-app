import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import "./App.css";
import Login from "./routes/Login";
import Signup from "./routes/Signup";
import Dashboard from "./routes/Dashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminDashboard from "./routes/AdminDashboard";
import Orderfiles from "./routes/OrderFiles";
import ErrorPage from "./routes/ErrorPage";
import YourOrders from "./routes/YourOrders";
import Help from "./routes/Help";
import Account from "./routes/Account";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const location = useLocation();
  const hideNavbar = ["/login", "/sign-up", "/admin/dashboard"].includes(
    location.pathname
  );
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireUser={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-files"
          element={
            <ProtectedRoute requireUser={true}>
              <Orderfiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/your-orders"
          element={
            <ProtectedRoute requireUser={true}>
              <YourOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute requireUser={true}>
              <Help />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute requireUser={true}>
              <Account />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      {!hideNavbar && <Footer />}
    </>
  );
}

export default App;
