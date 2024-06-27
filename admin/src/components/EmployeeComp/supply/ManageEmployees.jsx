import React, { Component } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import swal from 'sweetalert';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import FilterBox from '../FilterBox';
import { Link } from 'react-router-dom';



  class ManageEmployees extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
            employees: [],
            isAddModalOpen: false,
            isEditModalOpen: false,
            currentEmployeeId: '',
            newEmployee: {
                employeeName: '',
                contactNumber: '',
                NIC: '',
                address: '',
                email: '',
                jobCategory: '',
                basicSalary: '',
                otRate: ''
            },
            validationMessages: {
                employeeName: '',
                contactNumber: '',
                NIC: '',
                address: '',
                email: '',
                jobCategory: '',
                basicSalary: '',
                otRate: ''
            },
            searchQuery: '', 
            filteredEmployees: [],
        };
      }

      componentDidMount() {
        this.fetchEmployees();
      }
  
      fetchEmployees = async () => {
          try {
              const response = await axios.get('http://localhost:4000/employee');
              this.setState({ employees: response.data.data, filteredEmployees: response.data.data });
          } catch (error) {
              console.error("Couldn't fetch employees", error);
          }
      };

      toggleAddModal = () => {
        this.setState(prevState => ({
            isAddModalOpen: !prevState.isAddModalOpen,
            newEmployee: {
                employeeName: '',
                contactNumber: '',
                NIC: '',
                address: '',
                email: '',
                jobCategory: '',
                basicSalary: '',
                otRate: ''
            },
            validationMessages: {
                employeeName: '',
                contactNumber: '',
                NIC: '',
                address: '',
                email: '',
                jobCategory: '',
                basicSalary: '',
                otRate: ''
            }
        }));
    }

    toggleEditModal = (employeeId = '') => {
        if (employeeId) {
            const employee = this.state.employees.find(employee => employee._id === employeeId);
            this.setState({
                currentEmployeeId: employeeId,
                newEmployee: { ...employee },
                isEditModalOpen: true,
            });
        } else {
            this.setState(prevState => ({
                isEditModalOpen: !prevState.isEditModalOpen,
            }));
        }
    }

    handleDelete = async (employeeId) => {
        try {
            await axios.delete(`http://localhost:4000/employee/${employeeId}`);
            this.fetchEmployees();
            swal("Deleted!", "Your employee has been deleted successfully.", "success");
        } catch (error) {
            console.error("Couldn't delete employee", error);
            swal("Failed!", "There was a problem deleting your employee.", "error");
        }
    };

    handlePDFGeneration = async () => {
        try {
            const response = await axios.get('http://localhost:4000/employee');
            const employees = response.data.data;
    
            if (employees.length > 0) {
                const pdf = new jsPDF();
                
                pdf.setFontSize(24);
                pdf.setTextColor(44, 62, 80);
                pdf.text('Employee List', 105, 20, null, null, 'center');
    
                const tableHeaders = ['Employee Name', 'Contact Number', 'NIC', 'Address', 'Email', 'Job Category', 'Basic Salary', 'OT Rate'];
    

                const tableData = employees.map(employee => [
                    employee.employeeName,
                    employee.contactNumber,
                    employee.NIC,
                    employee.address,
                    employee.email,
                    employee.jobCategory,
                    employee.basicSalary,
                    employee.otRate
                ]);
    
                // Set up table styling
                const tableStyle = {
                    margin: { top: 40 },
                    headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 12 },
                    bodyStyles: { textColor: 44, fontSize: 10 },
                    alternateRowStyles: { fillColor: 245 },
                    startY: 30
                };
    
                // Add table to PDF
                pdf.autoTable(tableHeaders, tableData, tableStyle);
    
                // Save the PDF with title and download it
                pdf.save('Employees_List.pdf');
            } else {
                console.error('No employees found.');
                swal("No Employees", "There are no employees to generate a PDF.", "info");
            }
        } catch (error) {
            console.error("Couldn't fetch employees", error);
            swal("Error", "There was a problem fetching employees.", "error");
        }
    };

    handleSearch = (e) => {
        const { value } = e.target;
        const { employees } = this.state;
        
        // Filter employees based on employee name or job category
        const filteredEmployees = employees.filter(employee =>
            employee.employeeName.toLowerCase().includes(value.toLowerCase()) ||
            employee.jobCategory.toLowerCase().includes(value.toLowerCase())
        );
    
        this.setState({ searchQuery: value, filteredEmployees });
    };


    validateForm = () => {
        const { newEmployee } = this.state;
        let isValid = true;
        let validationMessages = {
            employeeName: '',
            contactNumber: '',
            NIC: '',
            address: '',
            email: '',
            jobCategory: '',
            basicSalary: '',
            otRate: ''
        };

        if (!newEmployee.employeeName) {
            validationMessages.employeeName = 'Employee Name cannot be empty.';
            isValid = false;
        }
        if (!newEmployee.contactNumber.match(/^\d{10}$/)) {
            validationMessages.contactNumber = 'Enter a valid contact number (10 digits).';
            isValid = false;
        }
        if (!newEmployee.NIC.match(/^\d+$/)) {
            validationMessages.NIC = 'NIC must contain only numeric values.';
            isValid = false;
        }
        if (!newEmployee.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
            validationMessages.email = 'Enter a valid email address.';
            isValid = false;
        }
        if (!newEmployee.address) {
            validationMessages.address = 'Address cannot be empty.';
            isValid = false;
        }
        if (!newEmployee.jobCategory) {
            validationMessages.jobCategory = 'Job Category cannot be empty.';
            isValid = false;
        }
        
        
        this.setState({ validationMessages });

        return isValid;
    }

    addEmployee = async () => {
        if (this.validateForm()) {
            const { newEmployee } = this.state;
            try {
                await axios.post('http://localhost:4000/employee', newEmployee);
                this.toggleAddModal();
                this.fetchEmployees();
                swal("Success!", "Employee added successfully.", "success");
            } catch (error) {
                console.error("Couldn't add employee", error);
                swal("Failed!", "There was a problem adding the employee.", "error");
            }
        }
    };

    updateEmployee = async () => {
        if (this.validateForm()) {
            const { newEmployee, currentEmployeeId } = this.state;
            try {
                await axios.put(`http://localhost:4000/employee/${currentEmployeeId}`, newEmployee);
               
                this.toggleEditModal();
                this.fetchEmployees();
                swal("Success!", "Employee updated successfully.", "success");
            } catch (error) {
                console.error("Couldn't update employee", error);
                swal("Failed!", "There was a problem updating the employee.", "error");
            }
        }
    };

    handleChange = (field, value) => {
        this.setState(prevState => ({
            newEmployee: {
                ...prevState.newEmployee,
                [field]: value
            }
        }));
    }

    handleFilterSubmit = (selectedField, sortOrder) => {
        const { employees } = this.state;
    
        let filteredEmployees = [...employees]; // Create a copy of employees array
    
        // Implement sorting logic based on selectedField and sortOrder
        if (selectedField && sortOrder) {
            filteredEmployees.sort((a, b) => {
                if (sortOrder === 'asc') {
                    return a[selectedField] > b[selectedField] ? 1 : -1;
                } else if (sortOrder === 'desc') {
                    return a[selectedField] < b[selectedField] ? 1 : -1;
                }
                return 0;
            });
        }
    
        // Update filteredEmployees state accordingly
        this.setState({ filteredEmployees });
    };

    render() {
      const {newEmployee, isAddModalOpen, isEditModalOpen, validationMessages } = this.state;
      
      const modalStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' };
      const modalContentStyle = { backgroundColor: 'white', color:  'black', padding: '40px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)', width: '400px' };
      const cardStyleAdjustment = {
          transition: 'all 0.3s',
      };
        const containerStyle = {
          position: 'relative',
          top: -40,
          left: 0,
          width: '85vw',
          overflow: 'hidden', // Prevent scrolling
        };
      
        const contentWrapperStyle = {
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '30px', // Adjust according to your header height
          padding: '20px',
          overflow: 'hidden', // Prevent scrolling
        };
      
        const contentStyle = {
          flexGrow: 1,
          backgroundColor: '#f2f2f2',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          position: 'relative',
          overflow: 'hidden', 
          maxWidth: 'auto', 
      };

      const commonStyles = {
          cardStyle: {
              display: 'relative',
              justifyContent: 'space-between',
              //alignItems: 'center',
              margin: '20px',
              marginTop: '1%',
              backgroundColor : '#fff',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              borderRadius: '10px',
              padding: '20px',
              fontFamily: 'sans-serif',
              position: 'relative',
              ...cardStyleAdjustment,
              transition: 'all 0.3s' 
          },

          tableContainer: {
            overflowX: 'auto', 
            maxWidth: '100%', 
        },
        

        tableStyle: {
          width: '100%', 
          borderCollapse: 'collapse',
          marginTop: '2px',
      },
          thStyle: {
              backgroundColor: '#ddd', color : '#333', padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #ddd', whiteSpace: 'nowrap',
          },
          tdStyle: {
              padding: ' 15px', borderBottom: '1px solid #ddd', color: '#333', textAlign: 'left',
          },
          actionStyle: {
              display: 'flex', justifyContent: 'space-around',
          },
          buttonContainerStyle: {
              position: 'relative', top: '8%', right: '20px', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          },
          inputStyle: {
              width: '98.5%', padding: '10px', marginTop: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', backgroundColor: '#fff', color: '#333',
          },
          buttonStyle: {
              width: '80%',
               padding: '2%',
                marginRight: '10px',
                 marginTop: '10px',
                  borderRadius: '5px',
                   border: 'none',
                    backgroundColor: '#009688',
                     color: '#fff', cursor: 'pointer', fontSize: '16px', textDecoration: 'none'
          },
          buttonStyle4: {
              width: '80%',
               padding: '2%',
                marginRight: '10px',
                 marginTop: '10px',
                  borderRadius: '5px',
                   border: 'none',
                    backgroundColor: '#285955',
                     color: '#fff', cursor: 'pointer', fontSize: '16px', textDecoration: 'none'
          },
          validationMessageStyle: {
              color: '#ff3860', fontSize: '0.8rem', marginTop: '0.25rem',
          },
          buttonStyle2: {
              padding: ' 10px',
              borderRadius: '5px',
              fontSize: '14px',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              marginTop: '20px',
              width: '10%',
              marginLeft: '85%'
          },
          buttonStyle3: {
              padding: ' 10px',
              borderRadius: '5px',
              fontSize: '14px',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              marginTop: '20px',
              marginBottom: '1%',
              width: '10%',
              height: '100%',
              Left: '85%'
          }
      };

  return (
    <div style={containerStyle}> {/* Apply inline styles */}
      <div style={contentWrapperStyle}> {/* Styled box for free space */}
        <div style={contentStyle}>
            <button onClick={this.handlePDFGeneration} style={{ ...commonStyles.buttonStyle2, background: '#009688' }}>
                            Generate PDF
            </button>
                         
            <button onClick={this.toggleAddModal}  style={{ ...commonStyles.buttonStyle2, background: '#009688'}}>
               <FaPlus style={{ marginRight: '8px' }} />
                            Add Employees
            </button>
            <Link to="/employee/emp-salary">
                <button  style={{ ...commonStyles.buttonStyle2, background: '#009688'}}>
                    Salary Details
                </button>
            </Link>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <FilterBox onSubmit={this.handleFilterSubmit} />
            </div>

            
                    <div style={commonStyles.cardStyle}>
                    <input
                            type="text"
                            placeholder="Search by Employee Name or Job Category"
                            style={{ ...commonStyles.inputStyle, marginBottom: '10px' }}
                            value={this.state.searchQuery}
                            onChange={this.handleSearch}
                        />
                        
                        <div style={commonStyles.tableContainer}>
                          <table id="employees-table" style={commonStyles.tableStyle}>
                            <thead>
                                <tr>
                                    <th style={commonStyles.thStyle}>NIC</th>
                                    <th style={commonStyles.thStyle}>Employee Name</th>
                                    <th style={commonStyles.thStyle}>Contact Number</th>
                                    <th style={commonStyles.thStyle}>Address</th>
                                    <th style={commonStyles.thStyle}>Email</th>
                                    <th style={commonStyles.thStyle}>Job Category</th>
                                    <th style={commonStyles.thStyle}>Total Salary</th>
                                    <th style={commonStyles.thStyle}>Action</th>
                                 
                                </tr>
                            </thead>
                            
                            <tbody>
                                {this.state.filteredEmployees.map(employee => (
                                    <tr key={employee._id}>
                                        <td style={commonStyles.tdStyle}>{employee.NIC}</td>
                                        <td style={commonStyles.tdStyle}>{employee.employeeName}</td>
                                        <td style={commonStyles.tdStyle}>{employee.contactNumber}</td>
                                        <td style={commonStyles.tdStyle}>{employee.address}</td>
                                        <td style={commonStyles.tdStyle}>{employee.email}</td>
                                        <td style={commonStyles.tdStyle}>{employee.jobCategory}</td>
                                        <td style={commonStyles.tdStyle}>{parseFloat(employee.basicSalary) + (parseFloat(employee.basicSalary) *( parseFloat(employee.otRate)/100))}
</td>



                                        <td style={commonStyles.tdStyle}>
                                            <button onClick={() => this.toggleEditModal(employee._id)} style={{ ...commonStyles.buttonStyle, background: '#2ecc71' }}>
                                                <FaEdit />
                                            </button>
                                            <button onClick={() => this.handleDelete(employee._id)} style={{ ...commonStyles.buttonStyle4, background: '#e74c3c' }}>
                                                <FaTrash />
                                            </button>
                                        </td>
                                       
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>

                {/* Add Employee Modal */}
                {isAddModalOpen && (
                    <div style={modalStyle}>
                        <div style={modalContentStyle}>
                            <span style={{ cursor: 'pointer', position: 'absolute', top: '15px', right: '20px', fontSize: '20px' }} onClick={this.toggleAddModal}>&times;</span>
                            <h2 style={{ textAlign: 'center' }}>Add Employee</h2>
                            <input
                                type="text"
                                placeholder="Employee Name"
                                style={commonStyles.inputStyle}
                                value={newEmployee.employeeName}
                                onChange={e => this.handleChange('employeeName', e.target.value)}
                            />
                            {validationMessages.employeeName && <span style={commonStyles.validationMessageStyle}>{validationMessages.employeeName}</span>}
                            <input
                                type="text"
                                placeholder="Contact Number"
                                style={commonStyles.inputStyle}
                                value={newEmployee.contactNumber}
                                onChange={e => this.handleChange('contactNumber', e.target.value)}
                            />
                            {validationMessages.contactNumber && <span style={commonStyles.validationMessageStyle}>{validationMessages.contactNumber}</span>}
                            <input
                                type="text"
                                placeholder="NIC"
                                style={commonStyles.inputStyle}
                                value={newEmployee.NIC}
                                onChange={e => this.handleChange('NIC', e.target.value)}
                            />
                            {validationMessages.NIC && <span style={commonStyles.validationMessageStyle}>{validationMessages.NIC}</span>}
                            <input
                                type="text"
                                placeholder="Address"
                                style={commonStyles.inputStyle}
                                value={newEmployee.address}
                                onChange={e => this.handleChange('address', e.target.value)}
                            />
                            {validationMessages.address && <span style={commonStyles.validationMessageStyle}>{validationMessages.address}</span>}
                            <input
                                type="email"
                                placeholder="Email"
                                style={commonStyles.inputStyle}
                                value={newEmployee.email}
                                onChange={e => this.handleChange('email', e.target.value)}
                            />
                            {validationMessages.email && <span style={commonStyles.validationMessageStyle}>{validationMessages.email}</span>}
                            <select
                                style={commonStyles.inputStyle}
                                value={newEmployee.jobCategory}
                                onChange={e => this.handleChange('jobCategory', e.target.value)}
                            >
                                <option value="">Select Job Category</option>
                                <option value="Manager">Manager</option>
                                <option value="Mechanic">Mechanic</option>
                                <option value="Electrician">Electrician</option>
                                <option value="Body Repair Technician">Body Repair Technician</option>
                                <option value="Quality Testing Engineer">Quality Testing Engineer</option>
                            </select>
                            {validationMessages.jobCategory && <span style={commonStyles.validationMessageStyle}>{validationMessages.jobCategory}</span>}
                            <input
                                type="number"
                                placeholder="Basic Salary"
                                style={commonStyles.inputStyle}
                                value={newEmployee.basicSalary}
                                onChange={e => this.handleChange('basicSalary', e.target.value)}
                            />
                            {validationMessages.basicSalary && <span style={commonStyles.validationMessageStyle}>{validationMessages.basicSalary}</span>}
                            <input
                                type="number"
                                placeholder="OT Rate"
                                style={commonStyles.inputStyle}
                                value={newEmployee.otRate}
                                onChange={e => this.handleChange('otRate', e.target.value)}
                            />
                            {validationMessages.otRate && <span style={commonStyles.validationMessageStyle}>{validationMessages.otRate}</span>}
                            <button onClick={this.addEmployee} style={{ ...commonStyles.buttonStyle, background: '#009688' }}>Add Employee</button>
                            <button onClick={this.toggleAddModal} style={{ ...commonStyles.buttonStyle, background: '#e74c3c' }}>Cancel</button>
                        </div>
                    </div>
                )}

                {/* Edit Employee Modal */}
                {isEditModalOpen && (
                    <div style={modalStyle}>
                        <div style={modalContentStyle}>
                            <span style={{ cursor: 'pointer', position: 'absolute', top: '15px', right: '20px', fontSize: '20px' }} onClick={this.toggleEditModal}>&times;</span>
                            <h2 style={{ textAlign: 'center' }}>Edit Employee</h2>
                            <input
                                type="text"
                                placeholder="Employee Name"
                                style={commonStyles.inputStyle}
                                value={newEmployee.employeeName}
                                onChange={e => this.handleChange('employeeName', e.target.value)}
                            />
                            {validationMessages.employeeName && <span style={commonStyles.validationMessageStyle}>{validationMessages.employeeName}</span>}
                            <input
                                type="text"
                                placeholder="Contact Number"
                                style={commonStyles.inputStyle}
                                value={newEmployee.contactNumber}
                                onChange={e => this.handleChange('contactNumber', e.target.value)}
                            />
                            {validationMessages.contactNumber && <span style={commonStyles.validationMessageStyle}>{validationMessages.contactNumber}</span>}
                            <input
                                type="text"
                                placeholder="NIC"
                                style={commonStyles.inputStyle}
                                value={newEmployee.NIC}
                                onChange={e => this.handleChange('NIC', e.target.value)}
                            />
                            {validationMessages.NIC && <span style={commonStyles.validationMessageStyle}>{validationMessages.NIC}</span>}
                            <input
                                type="text"
                                placeholder="Address"
                                style={commonStyles.inputStyle}
                                value={newEmployee.address}
                                onChange={e => this.handleChange('address', e.target.value)}
                            />
                            {validationMessages.address && <span style={commonStyles.validationMessageStyle}>{validationMessages.address}</span>}
                            <input
                                type="email"
                                placeholder="Email"
                                style={commonStyles.inputStyle}
                                value={newEmployee.email}
                                onChange={e => this.handleChange('email', e.target.value)}
                            />
                            {validationMessages.email && <span style={commonStyles.validationMessageStyle}>{validationMessages.email}</span>}
                            <select
                                style={commonStyles.inputStyle}
                                value={newEmployee.jobCategory}
                                onChange={e => this.handleChange('jobCategory', e.target.value)}
                            >
                                <option value="">Select Job Category</option>
                                <option value="Manager">Manager</option>
                                <option value="Mechanic">Mechanic</option>
                                <option value="Electrician">Electrician</option>
                                <option value="Body Repair Technician">Body Repair Technician</option>
                                <option value="Quality Testing Engineer">Quality Testing Engineer</option>
                            </select>
                            {validationMessages.jobCategory && <span style={commonStyles.validationMessageStyle}>{validationMessages.jobCategory}</span>}
                            <input
                                type="number"
                                placeholder="Basic Salary"
                                style={commonStyles.inputStyle}
                                value={newEmployee.basicSalary}
                                onChange={e => this.handleChange('basicSalary', e.target.value)}
                            />
                            {validationMessages.basicSalary && <span style={commonStyles.validationMessageStyle}>{validationMessages.basicSalary}</span>}
                            <input
                                type="number"
                                placeholder="OT Rate"
                                style={commonStyles.inputStyle}
                                value={newEmployee.otRate}
                                onChange={e => this.handleChange('otRate', e.target.value)}
                            />
                            {validationMessages.otRate && <span style={commonStyles.validationMessageStyle}>{validationMessages.otRate}</span>}
                            <button onClick={this.updateEmployee} style={{ ...commonStyles.buttonStyle, background: '#009688' }}>Update Employee</button>
                            <button onClick={() => this.toggleEditModal()} style={{ ...commonStyles.buttonStyle, background: '#e74c3c' }}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      
  );
};
}

export default ManageEmployees;
