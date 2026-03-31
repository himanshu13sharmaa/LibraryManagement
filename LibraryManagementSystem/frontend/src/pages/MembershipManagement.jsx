import { useState, useEffect } from 'react';
import axios from 'axios';

const MembershipManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '',
        contactAddress: '', aadharNo: '',
        startDate: '', endDate: '',
        duration: '6 months',
        removeMembership: false
    });

    useEffect(() => { fetchMemberships(); }, []);

    const fetchMemberships = async () => {
        setLoading(true);
        try {
            // Get all normal users
            const { data } = await axios.get('http://localhost:5000/api/users');
            setUsers(data.filter(u => u.role === 'User'));
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const calculateEndDate = (start, dur) => {
        let d = new Date(start || Date.now());
        if (dur === '6 months') d.setMonth(d.getMonth() + 6);
        else if (dur === '1 year') d.setFullYear(d.getFullYear() + 1);
        else if (dur === '2 years') d.setFullYear(d.getFullYear() + 2);
        return d.toISOString().split('T')[0];
    };

    const handleDurationChange = (val) => {
        setFormData({
            ...formData, 
            duration: val, 
            endDate: calculateEndDate(formData.startDate, val)
        });
    };
    
    const handleStartDateChange = (val) => {
        setFormData({
            ...formData, 
            startDate: val, 
            endDate: calculateEndDate(val, formData.duration)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Update Membership logic
                const payload = {
                    membership: formData.removeMembership ? null : {
                        startDate: formData.startDate,
                        endDate: formData.endDate,
                        duration: formData.duration
                    }
                };
                await axios.put(`http://localhost:5000/api/users/${currentUserId}`, payload);
                alert('Membership updated successfully!');
            } else {
                // Add Membership natively creates a User with that membership active
                const payload = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: 'defaultpassword123', // Admin creates users with default pw
                    contactAddress: formData.contactAddress,
                    aadharNo: formData.aadharNo,
                    role: 'User',
                    membership: {
                        startDate: formData.startDate,
                        endDate: formData.endDate,
                        duration: formData.duration
                    }
                };
                await axios.post('http://localhost:5000/api/users', payload);
                alert('Membership created successfully!');
            }
            fetchMemberships();
            resetForm();
        } catch (error) {
            alert(error.response?.data?.message || 'Error occurred');
        }
    };

    const editMembership = (u) => {
        setIsEditing(true);
        setCurrentUserId(u._id);
        const mem = u.membership || {};
        const sDate = mem.startDate ? new Date(mem.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        setFormData({
            firstName: u.firstName, lastName: u.lastName, email: u.email,
            contactAddress: u.contactAddress || '', aadharNo: u.aadharNo || '',
            startDate: sDate,
            duration: mem.duration || '6 months',
            endDate: mem.endDate ? new Date(mem.endDate).toISOString().split('T')[0] : calculateEndDate(sDate, mem.duration || '6 months'),
            removeMembership: false
        });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentUserId(null);
        setFormData({
            firstName: '', lastName: '', email: '',
            contactAddress: '', aadharNo: '',
            startDate: '', endDate: '',
            duration: '6 months', removeMembership: false
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Membership Management</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-green-700">{isEditing ? 'Update Membership' : 'Add New Membership'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isEditing && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b pb-4">
                            <div><label className="block text-sm">First Name *</label><input type="text" required className="mt-1 block w-full p-2 border rounded-md" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
                            <div><label className="block text-sm">Last Name *</label><input type="text" required className="mt-1 block w-full p-2 border rounded-md" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
                            <div><label className="block text-sm">Email (Used for Login) *</label><input type="email" required className="mt-1 block w-full p-2 border rounded-md" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
                            <div><label className="block text-sm">Contact Address</label><input type="text" className="mt-1 block w-full p-2 border rounded-md" value={formData.contactAddress} onChange={e => setFormData({...formData, contactAddress: e.target.value})} /></div>
                            <div><label className="block text-sm">Aadhar No</label><input type="text" className="mt-1 block w-full p-2 border rounded-md" value={formData.aadharNo} onChange={e => setFormData({...formData, aadharNo: e.target.value})} /></div>
                        </div>
                    )}
                    
                    {isEditing && (
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-600 mb-4 border tracking-tight">
                            Editing Membership for: <strong>{formData.firstName} {formData.lastName}</strong> ({formData.email})
                        </div>
                    )}

                    {!formData.removeMembership && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Start Date *</label>
                            <input type="date" required className="mt-1 block w-full p-2 border rounded-md shadow-sm" value={formData.startDate} onChange={e => handleStartDateChange(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Membership {isEditing ? 'Extension' : 'Duration'}</label>
                            <div className="mt-2 space-x-4">
                                {['6 months', '1 year', '2 years'].map(dur => (
                                    <label key={dur} className="inline-flex items-center">
                                        <input type="radio" value={dur} checked={formData.duration === dur} onChange={e => handleDurationChange(e.target.value)} className="text-green-600 focus:ring-green-500" />
                                        <span className="ml-2 text-sm">{dur}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">End Date (Auto-calculated)</label>
                            <input type="date" required readOnly className="mt-1 block w-full p-2 border bg-gray-100 rounded-md" value={formData.endDate} />
                        </div>
                    </div>
                    )}

                    {isEditing && (
                        <div className="flex items-center mt-6 p-4 border rounded bg-red-50 border-red-200">
                            <label className="inline-flex items-center">
                                <input type="checkbox" checked={formData.removeMembership} onChange={e => setFormData({...formData, removeMembership: e.target.checked})} className="form-checkbox text-red-600 h-5 w-5 rounded" />
                                <span className="ml-2 text-sm font-bold text-red-700">Remove Membership (Revoke Access)</span>
                            </label>
                        </div>
                    )}
                    
                    <div className="flex justify-end space-x-3 mt-4 pt-4 border-t">
                        {isEditing && <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-md bg-white text-gray-700 hover:bg-gray-50 font-medium">Cancel Edit</button>}
                        <button type="submit" className="px-6 py-2 border border-transparent rounded-md text-white bg-green-600 hover:bg-green-700 font-bold shadow-sm">
                            {isEditing ? 'Save Membership Status' : 'Add Membership'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4">Membership Active Roster</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Membership Window</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(u => {
                                const hasMem = u.membership && u.membership.endDate;
                                const isActive = hasMem && new Date(u.membership.endDate) >= new Date();
                                return (
                                <tr key={u._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.firstName} {u.lastName} <div className="text-xs text-gray-400 font-normal">{u.email}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {hasMem ? (
                                            <>
                                                <span className="text-xs">Start:</span> {new Date(u.membership.startDate).toLocaleDateString()}<br/>
                                                <span className="text-xs">End:</span> {new Date(u.membership.endDate).toLocaleDateString()}
                                            </>
                                        ) : 'None'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {isActive ? <span className="px-2 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span> : 
                                         hasMem ? <span className="px-2 text-xs font-semibold rounded-full bg-red-100 text-red-800">Expired</span> : 
                                         <span className="px-2 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => editMembership(u)} className="text-blue-600 hover:text-blue-900">Update Membership</button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MembershipManagement;
