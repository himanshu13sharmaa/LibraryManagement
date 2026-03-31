import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalItems: '--', activeIssues: '--', overdue: '--' });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const itemsReq = axios.get('http://localhost:5000/api/reports?type=master_items');
                const activeReq = axios.get('http://localhost:5000/api/reports?type=active_issues');
                const overdueReq = axios.get('http://localhost:5000/api/reports?type=overdue_returns');
                const [itemsRes, activeRes, overdueRes] = await Promise.all([itemsReq, activeReq, overdueReq]);
                setStats({
                    totalItems: itemsRes.data.length,
                    activeIssues: activeRes.data.length,
                    overdue: overdueRes.data.length
                });
            } catch (error) {}
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm flex flex-col items-center justify-center">
                    <h3 className="text-lg font-medium text-blue-800">Total Books/Movies</h3>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalItems}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm flex flex-col items-center justify-center">
                    <h3 className="text-lg font-medium text-blue-800">Active Issues</h3>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{stats.activeIssues}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 shadow-sm flex flex-col items-center justify-center">
                    <h3 className="text-lg font-medium text-blue-800">Overdue Returns</h3>
                    <p className="text-3xl font-bold text-blue-900 mt-2">{stats.overdue}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Maintenance Module</h2>
                    <ul className="space-y-3">
                         <li><Link to="/admin/items" className="text-blue-600 hover:text-blue-800 font-medium font-bold block bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors">📦 Manage Books & Movies</Link></li>
                         <li><Link to="/admin/users" className="text-blue-600 hover:text-blue-800 font-medium font-bold block bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors">👥 Manage Users</Link></li>
                         <li><Link to="/admin/memberships" className="text-blue-600 hover:text-blue-800 font-medium font-bold block bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors">💳 Manage Memberships</Link></li>
                    </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Reports Module</h2>
                    <ul className="space-y-3">
                         <li><Link to="/admin/reports" className="text-blue-600 hover:text-blue-800 font-medium font-bold block bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors">📊 View Data & Reports Grid</Link></li>
                    </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Transactions Module</h2>
                    <ul className="flex space-x-6">
                         <li><Link to="/admin/transactions" className="inline-block text-white bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-medium shadow">Go to Transactions Panel</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
