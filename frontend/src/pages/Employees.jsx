import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../api/userApi';
import { Card } from '../components/common/Card';
import { Table } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import toast from 'react-hot-toast';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

export const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    position: '',
    department: '',
    basicSalary: '',
    contactNumber: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setEmployees(response.data.users);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingEmployee) {
        await updateUser(editingEmployee.id, formData);
        toast.success('Employee updated successfully');
      } else {
        await createUser(formData);
        toast.success('Employee created successfully');
      }
      
      setShowModal(false);
      fetchEmployees();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employeeId: employee.employee_id,
      email: employee.email,
      password: '',
      firstName: employee.first_name,
      lastName: employee.last_name,
      role: employee.role,
      position: employee.position || '',
      department: employee.department || '',
      basicSalary: employee.basic_salary || '',
      contactNumber: employee.contact_number || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteUser(id);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'employee',
      position: '',
      department: '',
      basicSalary: '',
      contactNumber: ''
    });
    setEditingEmployee(null);
  };

  const columns = [
    { key: 'employee_id', label: 'Employee ID' },
    { 
      key: 'name', 
      label: 'Name',
      render: (row) => `${row.first_name} ${row.last_name}`
    },
    { key: 'email', label: 'Email' },
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { 
      key: 'role', 
      label: 'Role',
      render: (row) => (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
          {row.role}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => setShowModal(true)}>
          <UserPlus className="w-4 h-4 inline mr-2" />
          Add Employee
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={employees} loading={loading} />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
              required
              disabled={!!editingEmployee}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            {!editingEmployee && (
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            )}
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              required
            />
            <Input
              label="Position"
              name="position"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
            />
            <Input
              label="Department"
              name="department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            />
            <Input
              label="Basic Salary"
              type="number"
              name="basicSalary"
              value={formData.basicSalary}
              onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
            />
            <Input
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="input"
                required
              >
                <option value="employee">Employee</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => { setShowModal(false); resetForm(); }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingEmployee ? 'Update' : 'Create'} Employee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};