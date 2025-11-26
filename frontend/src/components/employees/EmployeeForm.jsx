import { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { DEPARTMENTS, POSITIONS } from '../../utils/constants';

export const EmployeeForm = ({ employee, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    employeeId: employee?.employee_id || '',
    email: employee?.email || '',
    password: '',
    firstName: employee?.first_name || '',
    lastName: employee?.last_name || '',
    middleName: employee?.middle_name || '',
    role: employee?.role || 'employee',
    position: employee?.position || '',
    department: employee?.department || '',
    basicSalary: employee?.basic_salary || '',
    contactNumber: employee?.contact_number || '',
    dateHired: employee?.date_hired?.split('T')[0] || '',
    dateOfBirth: employee?.date_of_birth?.split('T')[0] || '',
    address: employee?.address || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!employee;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Employee ID"
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          required
          disabled={isEditing}
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {!isEditing && (
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Minimum 6 characters"
          />
        )}

        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <Input
          label="Middle Name"
          name="middleName"
          value={formData.middleName}
          onChange={handleChange}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="input"
            required
          >
            <option value="employee">Employee</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position
          </label>
          <select
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select position</option>
            {POSITIONS.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <Input
          label="Basic Salary"
          type="number"
          name="basicSalary"
          value={formData.basicSalary}
          onChange={handleChange}
          placeholder="0.00"
        />

        <Input
          label="Contact Number"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          placeholder="+63 9XX XXX XXXX"
        />

        <Input
          label="Date Hired"
          type="date"
          name="dateHired"
          value={formData.dateHired}
          onChange={handleChange}
        />

        <Input
          label="Date of Birth"
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="input"
          rows="3"
          placeholder="Complete address"
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Update Employee' : 'Create Employee'}
        </Button>
      </div>
    </form>
  );
};
