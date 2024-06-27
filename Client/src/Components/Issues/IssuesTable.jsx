import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsInfoCircle } from 'react-icons/bs';
import { AiOutlineEdit } from 'react-icons/ai';
import { MdOutlineDelete } from 'react-icons/md';

const IssuesTable = ({ issues, currentUserID }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter issues based on searchTerm and currentUserID
  const filteredIssues = issues.filter(issue =>
    (issue.Cname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.Clocation.toLowerCase().includes(searchTerm.toLowerCase())) &&
    issue.userID === currentUserID
  );

  return (
    <div>
      {/* Table */}
      <table id="issueTable" style={styles.table}>
        {/* Table header */}
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
        {/* Table body */}
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
                {/* Operations icons */}
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
};

export default IssuesTable;
