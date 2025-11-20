import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const RoleRoute = ({ allowedRoles = [] }) => {
  const role = useAuthStore((state) => state.role);

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    // Redirect to their appropriate dashboard
    const dashboardMap = {
      superadmin: '/dashboard/superadmin',
      admin: '/dashboard/admin',
      user: '/dashboard/user',
      verifier: '/dashboard/user',
    };
    return <Navigate to={dashboardMap[role] || '/login'} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
