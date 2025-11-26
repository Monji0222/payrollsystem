import { useState, useEffect } from 'react';
import { getProfile, updateUser } from '../api/userApi';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Briefcase, Building } from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/formatters';

export const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    contactNumber: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setProfile(response.data);
      setFormData({
        contactNumber: response.data.contact_number || '',
        address: response.data.address || ''
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateUser(profile.id, formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card>
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-gray-600">{profile.position}</p>
            <p className="text-sm text-gray-500">{profile.employee_id}</p>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className={`px-3 py-1 rounded-full ${
                  profile.employment_status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {profile.employment_status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Details Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Contact Number</p>
                  <p className="font-semibold">{profile.contact_number || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-semibold">{profile.position}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Building className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold">{profile.department}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Employment Details */}
          <Card title="Employment Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date Hired</p>
                <p className="font-semibold">{formatDate(profile.date_hired)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Employee Role</p>
                <p className="font-semibold capitalize">{profile.role}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Basic Salary</p>
                <p className="font-semibold">{formatCurrency(profile.basic_salary)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Employment Status</p>
                <p className="font-semibold capitalize">{profile.employment_status}</p>
              </div>
            </div>
          </Card>

          {/* Editable Information */}
          <Card title="Additional Information">
            {editing ? (
              <form onSubmit={handleSubmit}>
                <Input
                  label="Contact Number"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  placeholder="Enter contact number"
                />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="input"
                    rows="3"
                    placeholder="Enter address"
                  />
                </div>

                <div className="flex space-x-3">
                  <Button type="submit">Save Changes</Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Contact Number</p>
                    <p className="font-semibold">{profile.contact_number || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-semibold">{profile.address || 'Not provided'}</p>
                  </div>
                </div>
                
                <Button onClick={() => setEditing(true)}>
                  Edit Information
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};