import { Link } from 'react-router-dom';

const UserDashboard = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">User Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
                    <ul className="flex flex-wrap gap-4">
                         <li><Link to="/user/search" className="inline-block text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-medium shadow transition-colors">Search Books & Movies</Link></li>
                    </ul>
                </div>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">My Activities</h2>
                    <ul className="space-y-3">
                         <li><Link to="/user/transactions" className="text-blue-600 hover:text-blue-800 font-medium font-bold block bg-gray-50 p-3 rounded hover:bg-gray-100 transition-colors">💳 View My Transactions & Pay Fines</Link></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
