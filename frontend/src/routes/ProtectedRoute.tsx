import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireUser?: boolean; // Restricts admins from accessing user routes
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireUser = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/me`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setIsAdmin(data.isAdmin || false);
        } else {
          setIsAuthenticated(false);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // User route required but user is admin - show restriction notice
  if (requireUser && isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 xs:px-6 sm:px-8">
        <div className="w-full max-w-xs xs:max-w-sm xxs:max-w-md xsm:max-w-lg sm:max-w-xl md:max-w-2xl bg-white rounded-lg shadow-lg p-4 xs:p-6 sm:p-8 text-center">
          <div className="mb-4 xs:mb-6 md:px-10">
            <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 xs:mb-4 ">
              <span className="text-xl xs:text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Access Restricted
            </h2>
            <p className="text-sm xs:text-base text-gray-600 px-2 xs:px-0 md:text-xl">
              Admin cannot access user features like uploads and file orders.
            </p>
          </div>

          <div className="flex items-center justify-center xs:flex-col xs:gap-2 xsl:flex-row md:gap-12">
            <a
              href="/login"
              className="flex-1 xs:w-full items-center justify-center bg-gray-500 !text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition text-sm xs:text-base md:text-lg"
            >
              User login
            </a>
            <a
              href="/admin/dashboard"
              className="flex-1 xs:w-full items-center justify-center bg-purple-600 !text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition text-center text-sm xs:text-base md:text-lg"
            >
              Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // All checks passed - render the component
  return <>{children}</>;
};

export default ProtectedRoute;
