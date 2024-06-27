import React, { useState, useEffect } from 'react';
import axios from 'axios';
import swal from 'sweetalert';

const EmpSalary = () => {
  const [employees, setEmployees] = useState([]);
  const [otHours, setOtHours] = useState({});
  const [insensitive, setInsensitive] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:4000/employee');
      setEmployees(response.data.data);
    } catch (error) {
      console.error("Couldn't fetch employees", error);
    }
  };

  const handleOtHoursChange = (employeeId, value) => {
    setOtHours({ ...otHours, [employeeId]: value });
  };

  const handleInsensitiveChange = (employeeId, value) => {
    setInsensitive({ ...insensitive, [employeeId]: value });
  };

  const calculateNetSalary = (basicSalary, otRate, otHours, insensitive) => {
    // Perform net salary calculation here
    const otAmount = otRate * otHours;
    const netSalary = basicSalary + otAmount + parseFloat(insensitive);
    return netSalary;
  };

  const handleSubmit = (employee) => {
    const netSalary = calculateNetSalary(employee.basicSalary, employee.otRate, otHours[employee._id] || 0, insensitive[employee._id] || 0);
    swal({
      title: "Employee Details",
      text: `NIC: ${employee.NIC}\nName: ${employee.employeeName}\nNet Salary: ${netSalary}`,
      icon: "success",
      buttons: false,
    });
  };

  // Filter employees based on search query
  const filteredEmployees = employees.filter(employee =>
    employee.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.NIC.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', top: 0, left: 0, width: '87vw', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0px', padding: '20px', overflow: 'hidden' }}>
        <div style={{ width: '83.4vw', background: '#fff', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', padding: '20px', borderRadius: '5px' }}>
          <h2>Employee Salary</h2>
          {/* Search Bar */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or NIC..."
            style={{ marginBottom: '20px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}
          />
          <div style={{ width: '100%', overflow: 'auto', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', borderRadius: '5px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', borderRadius: '5px' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th>NIC</th>
                  <th>Name</th>
                  <th>Basic Salary</th>
                  <th>OT Rate</th>
                  <th>OT hours</th>
                  <th>Insensitive</th>
                  <th>Net Salary</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(employee => (
                  <tr key={employee._id}>
                    <td>{employee.NIC}</td>
                    <td>{employee.employeeName}</td>
                    <td>{employee.basicSalary}</td>
                    <td>{employee.otRate}</td>
                    <td>
                      <input type="number" value={otHours[employee._id] || ''} onChange={(e) => handleOtHoursChange(employee._id, e.target.value)} />
                    </td>
                    <td>
                      <input type="number" value={insensitive[employee._id] || ''} onChange={(e) => handleInsensitiveChange(employee._id, e.target.value)} />
                    </td>
                    <td>{calculateNetSalary(employee.basicSalary, employee.otRate, otHours[employee._id] || 0, insensitive[employee._id] || 0)}</td>
                    <td>
                      <button onClick={() => handleSubmit(employee)} style={{ borderRadius: '5px', background: '#009688' }}>Submit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpSalary;
