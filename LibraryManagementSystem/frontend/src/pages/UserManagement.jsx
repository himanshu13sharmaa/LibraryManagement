import { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', 
        contactAddress: '', aadharNo: '',
        role: 'User', active: true
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('http://localhost:5000/api/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`http://localhost:5000/api/users/${currentUserId}`, formData);
            } else {
                await axios.post('http://localhost:5000/api/users', formData);
            }
            fetchUsers();
            resetForm();
        } catch (error) {
            alert(error.response?.data?.message || 'Error occurred');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to completely delete this user? This cannot be undone.")) return;
        try {
            await axios.delete(`http://localhost:5000/api/users/${userId}`);
            fetchUsers();
            alert("User deleted!");
        } catch(error) {
            alert(error.response?.data?.message || 'Error deleting user');
        }
    };

    const editUser = (u) => {
        setIsEditing(true);
        setCurrentUserId(u._id);
        setFormData({
            firstName: u.firstName, lastName: u.lastName, email: u.email, password: '', 
            contactAddress: u.contactAddress || '', aadharNo: u.aadharNo || '',
            role: u.role, active: u.active
        });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentUserId(null);
        setFormData({
            firstName: '', lastName: '', email: '', password: '', 
            contactAddress: '', aadharNo: '',
            role: 'User', active: true
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">{isEditing ? 'Edit User' : 'Add New User'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div><label className="block text-sm">First Name</label><input type="text" required className="mt-1 block w-full p-2 border rounded-md" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
                    <div><label className="block text-sm">Last Name</label><input type="text" required className="mt-1 block w-full p-2 border rounded-md" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
                    <div><label className="block text-sm">Email</label><input type="email" required className="mt-1 block w-full p-2 border rounded-md" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isEditing} /></div>
                    {!isEditing && <div><label className="block text-sm">Password</label><input type="password" required className="mt-1 block w-full p-2 border rounded-md" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>}
                    <div><label className="block text-sm">Contact Address</label><input type="text" className="mt-1 block w-full p-2 border rounded-md" value={formData.contactAddress} onChange={e => setFormData({...formData, contactAddress: e.target.value})} /></div>
                    <div><label className="block text-sm">Aadhar No</label><input type="text" className="mt-1 block w-full p-2 border rounded-md" value={formData.aadharNo} onChange={e => setFormData({...formData, aadharNo: e.target.value})} /></div>
                    
                    <div><label className="block text-sm">Role</label>
                        <select className="mt-1 block w-full p-2 border rounded-md" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                            <option value="User">User</option><option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div className="flex items-center mt-6">
                        <label className="inline-flex items-center">
                            <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="form-checkbox text-blue-600 h-5 w-5 rounded" />
                            <span className="ml-2 text-sm font-medium text-gray-700">Account Active</span>
                        </label>
                    </div>
                    
                    <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-3 mt-4">
                        {isEditing && <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50">Cancel</button>}
                        <button type="submit" className="px-4 py-2 border rounded-md text-white bg-blue-600 hover:bg-blue-700">
                            {isEditing ? 'Update User' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">User Master List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role / Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr> : 
                             users.map(u => (
                                <tr key={u._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{u.role}</span>
                                        {!u.active && <span className="ml-2 text-xs text-red-500">Inactive</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button onClick={() => editUser(u)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                        <button onClick={() => handleDelete(u._id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
