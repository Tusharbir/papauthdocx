import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, LinearProgress } from '@mui/material';
import useAuthStore from '../../store/authStore';

const ProtectedRoute = () => {
  const { isAuthenticated, token } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    token: state.token,
  }));
  const location = useLocation();

  if (!token && !isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  if (!token && isAuthenticated === undefined) {
    return (
      <Box width="100%" mt={4}>
        <LinearProgress />
      </Box>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
