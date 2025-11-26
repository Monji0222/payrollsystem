import { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const PayrollGenerate = ({ employees, onGenerate, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    periodStart: '',
    periodEnd: '',
    employeeIds: []
  });

  const [selectAll, setSelectAll] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setFormData(prev => ({ ...prev, employeeIds: [] }));
    } else {
      setFormData(prev => ({ ...prev, employeeIds: employees.map(e => e.id) }));
    }
    setSelectAll(!selectAll);
  };

  const handleEmployeeToggle = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(employeeId)
        ? prev.employeeIds.filter(id => id !== employeeId)
        : [...prev.employeeIds, employeeId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.employeeIds.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    if (new Date(formData.periodEnd) < new Date(formData.periodStart)) {
      alert('End date must be after start date');
      return;
    }

    onGenerate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Input
          label="Period Start"
          type="date"
          name="periodStart"
          value={formData.periodStart}
          onChange={handleChange}
          required
        />

        <Input
          label="Period End"
          type="date"
          name="periodEnd"
          value={formData.periodEnd}
          onChange={handleChange}
          required
          min={formData.periodStart}
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Select Employees <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {selectAll ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto border rounded-lg p-4 space-y-2">
          {employees.map(employee => (
            <label
              key={employee.id}
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.employeeIds.includes(employee.id)}
                onChange={() => handleEmployeeToggle(employee.id)}
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-xs text-gray-600">
                  {employee.employee_id} - {employee.position}
                </p>
              </div>
            </label>
          ))}
        </div>

        <p className="text-sm text-gray-600 mt-2">
          Selected: {formData.employeeIds.length} / {employees.length} employees
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading || formData.employeeIds.length === 0}>
          {loading ? 'Generating...' : 'Generate Payroll'}
        </Button>
      </div>
    </form>
  );
};