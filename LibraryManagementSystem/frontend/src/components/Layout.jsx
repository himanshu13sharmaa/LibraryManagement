import { useContext } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogOut, Home, User, Settings, FileText, ArrowLeft, Activity } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation Bar */}
            <nav className="bg-white border-b border-gray-200">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center space-x-2">
                                <Activity className="h-8 w-8 text-blue-600" />
                                <span className="font-bold text-xl text-gray-900 tracking-tight">LibSys</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700">
                                Welcome, {user?.firstName} ({user?.role})
                            </span>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none transition-colors"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Layout Area */}
            <div className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
                 <div className="mb-4 flex space-x-4">
                      <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
                          <ArrowLeft className="h-4 w-4 mr-1" /> Back
                      </button>
                      <Link to="/" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800">
                          <Home className="h-4 w-4 mr-1" /> Home
                      </Link>
                 </div>
                 
                 <div className="bg-white rounded-lg shadow min-h-[500px] border border-gray-200 p-6">
                     <Outlet />
                 </div>
            </div>
        </div>
    );
};

export default Layout;
