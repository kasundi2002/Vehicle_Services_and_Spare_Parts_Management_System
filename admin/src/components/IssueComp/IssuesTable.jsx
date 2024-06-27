import React, { useState } from 'react';
import logo from '../../assets/newlogo.png';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const IssuesTable = ({ issues }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter issues based on search term
  const filteredIssues = issues.filter(issue =>
    issue.cid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count the number of issues according to status
  const statusCounts = filteredIssues.reduce((counts, issue) => {
    counts[issue.Cstatus] = (counts[issue.Cstatus] || 0) + 1;
    return counts;
  }, {});

  // Function to generate the report
  const generateReport = () => {
    const pdf = new jsPDF();
    const table = document.getElementById('issueTable');

    // Get current date and time
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const currentDateTime = `${currentDate} ${currentTime}`;

    // Add header
    pdf.setFontSize(16);
    pdf.text('P & D Auto Engineers', 50, 20);
    pdf.addImage(logo, 'PNG', 10, 1, 40, 40); // Add logo image
    pdf.setFontSize(12);
    pdf.text(currentDateTime, 50, 40);
    pdf.text('Emergency Issues Report', 70, 30);

    html2canvas(table).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 50); // Adjust y position to leave space for header
      pdf.save('issues_report.pdf');
    });
  };

  return (
    <div>
      {/* Display counts for each status */}
      <div style={styles.statusCountsContainer}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} style={styles.statusCountBox}>
            <p>{status}</p>
            <p>{count}</p>
          </div>
        ))}
      </div>
     
      {/* Search input */}
      <input
        type="text"
        placeholder="Search by Issue ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.issueSearch}
      />
       {/* Button to generate report */}
       <button style={styles.pdfButton} onClick={generateReport}>Generate PDF Report</button>
      {/* Table */}
      <table id="issueTable" style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>No</th>
            <th style={styles.th}>Issue Id</th>
            <th style={styles.th}>Customer Name</th>
            <th style={styles.th}>NIC</th>
            <th style={styles.th}>Contact Number</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Operations</th>
          </tr>
        </thead>
        <tbody>
          {filteredIssues.map((issue, index) => (
            <tr key={issue._id} style={styles.tr}>
              <td style={styles.td}>{index + 1}</td>
              <td style={styles.td}>{issue.cid}</td>
              <td style={styles.td}>{issue.Cname}</td>
              <td style={styles.td}>{issue.Cnic}</td>
              <td style={styles.td}>{issue.Ccontact}</td>
              <td style={styles.td}>{issue.Clocation}</td>
              <td style={styles.td}>{issue.Cstatus}</td>
              <td style={styles.td}>
                <div style={styles.iconsContainer}>
                  <Link to={`/issues/details/${issue._id}`} style={styles.iconLink}>
                    <BsInfoCircle style={styles.infoIcon} />
                  </Link>
                  <Link to={`/issues/edit/${issue._id}`} style={styles.iconLink}>
                    <AiOutlineEdit style={styles.editIcon} />
                  </Link>
                  <Link to={`/issues/delete/${issue._id}`} style={styles.iconLink}>
                    <MdOutlineDelete style={styles.deleteIcon} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  statusCountsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '1rem',
  },
  statusCountBox: {
    padding: '2rem',
    background: '#4299e1',
    border: '6px solid #90cdf4',
    borderRadius: '1.5rem',
    textAlign: 'center',
    color: '#ffffff'
  },
  issueSearch: {
    width: '30%',
    padding: '0.5rem',
    marginBottom: '4rem',
    marginTop: '4rem',
    marginLeft: '3rem',
    marginRight: '24rem',
    border: '2px solid #cbd5e0',
    borderRadius: '0.25rem',
    fontSize: '1rem',
  },
  table: {
    width: '100%',
    marginLeft: '1rem',
    borderCollapse: 'collapse',
  },
  th: {
    border: '1px solid #4A5568',
    padding: '8px',
    textAlign: 'center',
  },
  tr: {
    height: '40px',
  },
  td: {
    border: '1px solid #4A5568',
    padding: '8px',
    textAlign: 'center',
  },
  iconsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  iconLink: {
    textDecoration: 'none',
    transition: 'color 0.3s ease',
  },
  infoIcon: {
    fontSize: '20px',
    verticalAlign: 'middle',
    color: '#4299E1',
    transition: 'transform 0.3s ease',
  },
  editIcon: {
    fontSize: '20px',
    verticalAlign: 'middle',
    color: '#F6E05E',
    transition: 'transform 0.3s ease',
  },
  deleteIcon: {
    fontSize: '20px',
    verticalAlign: 'middle',
    color: '#E53E3E',
    transition: 'transform 0.3s ease',
  },
  pdfButton: {
    backgroundColor: '#339933',
    width:'20%',
    color: 'Black',
    margin: '8px 17px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
  },
};

export default IssuesTable;
