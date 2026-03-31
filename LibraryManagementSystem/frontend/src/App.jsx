import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext, { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Layout from './components/Layout';
import ItemsManagement from './pages/ItemsManagement';
import UserManagement from './pages/UserManagement';
import MembershipManagement from './pages/MembershipManagement';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import SearchAndRequests from './pages/SearchAndRequests';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useContext(AuthContext);
    
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    
    if (!user) return <Navigate to="/login" replace />;
    
    if (role && user.role !== role) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

const DefaultRoute = () => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    
    if (!user) return <Navigate to="/login" replace />;
    
    return user.role === 'Admin' ? <Navigate to="/admin" replace /> : <Navigate to="/user" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
             <Route index element={<DefaultRoute />} />
             
             {/* Admin Routes */}
             <Route path="admin" element={<ProtectedRoute role="Admin"><AdminDashboard /></ProtectedRoute>} />
             <Route path="admin/items" element={<ProtectedRoute role="Admin"><ItemsManagement /></ProtectedRoute>} />
             <Route path="admin/users" element={<ProtectedRoute role="Admin"><UserManagement /></ProtectedRoute>} />
             <Route path="admin/memberships" element={<ProtectedRoute role="Admin"><MembershipManagement /></ProtectedRoute>} />
             <Route path="admin/transactions" element={<ProtectedRoute role="Admin"><Transactions /></ProtectedRoute>} />
             <Route path="admin/reports" element={<ProtectedRoute role="Admin"><Reports /></ProtectedRoute>} />
             
             {/* User Routes */}
             <Route path="user" element={<ProtectedRoute role="User"><UserDashboard /></ProtectedRoute>} />
             <Route path="user/search" element={<ProtectedRoute role="User"><SearchAndRequests /></ProtectedRoute>} />
             <Route path="user/transactions" element={<ProtectedRoute role="User"><Transactions /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
