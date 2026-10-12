import { Navigate } from 'react-router';

export default function AdminPortal() {
  return <Navigate to="/admin-panel?tab=bot" replace />;
}
