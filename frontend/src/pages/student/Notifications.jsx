import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const NotificationDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // You need the current student's ID to check if it exists in 'readBy'
  // Replace this with your actual Auth hook or context logic
  const currentStudentId = localStorage.getItem('userId'); 

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notification/my');

      // Ensure we set an empty array if data is missing
      setNotifications(response.data.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to fetch notifications.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post('/api/notification/read', { notificationId });
      toast.success('Marked as read');
      fetchNotifications();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to mark as read.";
      toast.error(msg);
    }
  };

  useEffect(() => { 
    fetchNotifications(); 
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Notifications</h1>

      <div className="space-y-4" role="list">

        {/* Use optional chaining to prevent map errors */}
        {notifications?.length > 0 ? (
          notifications.map((n) => {
            // Check if the current user's ID is in the readBy array
            // We use .some() for safer comparison of ObjectIDs
            const isRead = n.readBy.some(id => id.toString() === currentStudentId?.toString());
            
            return (
              <div 
                key={n._id} 
                className={`p-4 border rounded shadow ${isRead ? 'bg-gray-50' : 'bg-white border-l-4 border-blue-500'}`}
              >
                <h2 className="font-semibold text-lg">{n.title}</h2>
                <p className="text-gray-600 mb-2">{n.message}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                  {!isRead && (
                    <button 
                      onClick={() => markAsRead(n._id)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No notifications found.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationDashboard;