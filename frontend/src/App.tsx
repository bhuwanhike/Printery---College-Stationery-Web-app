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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/order-files" element={<Orderfiles />} />
        <Route path="/your-orders" element={<YourOrders />} />
        <Route path="/help" element={<Help />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      {!hideNavbar && <Footer />}
    </>
  );
}

export default App;
