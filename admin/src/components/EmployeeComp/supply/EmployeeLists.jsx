import React, { Component } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import swal from 'sweetalert';
import jsPDF from 'jspdf';
import { Link } from 'react-router-dom';
import 'jspdf-autotable'; 

class EmployeeLists extends Component {
    constructor(props) {
        super(props);
        this.state = {
            employees: [],
            newEmployee: {
                employeeName:'',
                contactNumber:'',
                NIC:'',
                address:'',
                email:'',
                jobCategory:'',
                basicSalary:'',
                otRate:'',
            },
            validationMessages: {
                employeeName:'',
                contactNumber:'',
                NIC:'',
                address:'',
                email:'',
                jobCategory:'',
                basicSalary:'',
                otRate:'',
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
    
                const tableStyle = {
                    margin: { top: 40 },
                    headStyles: { fillColor: [44, 62, 80], textColor: 255, fontSize: 12 },
                    bodyStyles: { textColor: 44, fontSize: 10 },
                    alternateRowStyles: { fillColor: 245 },
                    startY: 30
                };
    
                pdf.autoTable(tableHeaders, tableData, tableStyle);
    
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

    validateForm = () => {
        const { newEmployee } = this.state;
        let isValid = true;
        let validationMessages = {
            employeeName:'',
            contactNumber:'',
            NIC:'',
            address:'',
            email:'',
            jobCategory:'',
            basicSalary:'',
            otRate:''
        };

        if (!newEmployee.employeeName) {
            validationMessages.companyName = 'Employee Name cannot be empty.';
            isValid = false;
        }
        if (!newEmployee.contactNumber.match(/^\d{10}$/)) {
            validationMessages.contactNumber = 'Enter a valid contact number (10 digits).';
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

    handleChange = (field, value) => {
        this.setState(prevState => ({
            newEmployee: {
                ...prevState.newEmployee,
                [field]: value
            }
        }));
    }

    handleSearch = (event) => {
        const searchQuery = event.target.value;
        const { employees } = this.state;
        const filteredEmployees = employees.filter(employee =>
            employee.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.jobCategory.toLowerCase().includes(searchQuery.toLowerCase())
        );
        this.setState({ searchQuery, filteredEmployees });
    }

    render() {
        const { filteredEmployees, searchQuery } = this.state;
        const tableContainerStyle = {};
        const commonStyles = {
            cardStyle: {
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '20px',
                marginTop: '1%',
                backgroundColor: '#fff',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                padding: '40px',
                width: '90%',
                fontFamily: 'sans-serif',
                position: 'relative', 
            },
            tableStyle: {
                width: '97%',
                borderCollapse: 'collapse',
                marginTop: '2px',
            },
            thStyle: {
                backgroundColor: '#ddd',
                color: '#333',
                padding: '12px 15px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd',
                whiteSpace: 'nowrap',
            },
            tdStyle: {
                padding: '15px',
                borderBottom: '1px solid #ddd',
                color: '#333',
                textAlign: 'left',
            },
            buttonStyle: {
                width: '15%',
                height: '50px', 
                borderRadius: '20px',
                marginLeft: '20px',
                border: 'none',
                backgroundColor: '#009688',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '16px',
                textDecoration: 'none',
                marginBottom: '10px', 
            },

            
            validationMessageStyle: {
                color: '#ff3860',
                fontSize: '0.8rem',
                marginTop: '0.25rem',
            },
            buttonContainer: {
                display: 'flex',
                width: '83vw',
                flexDirection: 'column', 
                alignItems: 'flex-end', 
                marginBottom: '20px', 
            },
            searchInput: {
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                width: '90%',
                marginBottom: '10px',
                boxSizing: 'border-box',
                fontSize: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                outline: 'none',
            },
        };

        return (
            <div className="container" style={{ marginTop: '4%' }}>
                <div style={commonStyles.buttonContainer}>
                    <button onClick={this.handlePDFGeneration} style={{ ...commonStyles.buttonStyle, }}>
                        Generate PDF
                    </button>
                    <Link to="/employee/manage-employees">
                        <button style={{ width: '130%',height: '50px',borderRadius: '20px',border: 'none',backgroundColor: '#009688',color: '#fff',cursor: 'pointer',fontSize: '16px',textDecoration: 'none',marginBottom: '10px', marginLeft: '-34%',
                }}>Employee manage</button>
                    </Link>
                </div>
                <div className="home">
                    <div style={commonStyles.cardStyle}>
                        <input
                            type="text"
                            placeholder="Search by Employee Name or Address"
                            style={commonStyles.searchInput}
                            value={searchQuery}
                            onChange={this.handleSearch}
                        />
                        <div style={tableContainerStyle}>
                            <table id="employees-table" style={commonStyles.tableStyle}>
                                <thead>
                                    <tr>
                                        <th style={commonStyles.thStyle}>Employee Name</th>
                                        <th style={commonStyles.thStyle}>Contact Number</th>
                                        <th style={commonStyles.thStyle}>NIC</th>
                                        <th style={commonStyles.thStyle}>Address</th>
                                        <th style={commonStyles.thStyle}>Email</th>
                                        <th style={commonStyles.thStyle}>Job Category</th>
                                        <th style={commonStyles.thStyle}>Basic Salary</th>
                                        <th style={commonStyles.thStyle}>OT Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map(employee => (
                                        <tr key={employee._id}>
                                            <td style={commonStyles.tdStyle}>{employee.employeeName}</td>
                                            <td style={commonStyles.tdStyle}>{employee.contactNumber}</td>
                                            <td style={commonStyles.tdStyle}>{employee.NIC}</td>
                                            <td style={commonStyles.tdStyle}>{employee.address}</td>
                                            <td style={commonStyles.tdStyle}>{employee.email}</td>
                                            <td style={commonStyles.tdStyle}>{employee.jobCategory}</td>
                                            <td style={commonStyles.tdStyle}>{employee.basicSalary}</td>
                                            <td style={commonStyles.tdStyle}>{employee.otRate}</td>
                                        </tr>
                                    ))}
                                </tbody>    
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default EmployeeLists;
