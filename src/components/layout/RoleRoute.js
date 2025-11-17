import { Navigate, Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import useAuthStore from '../../store/authStore';

const RoleRoute = ({ allowedRoles = [] }) => {
  const role = useAuthStore((state) => state.role);

  if (!role) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(role)) {
    return (
      <Box p={6} textAlign="center">
        <Typography variant="h5" color="text.secondary">
          You do not have access to this surface.
        </Typography>
      </Box>
    );
  }

  return <Outlet />;
};

export default RoleRoute;
