import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../../components/IssueComp/BackButton';
import Spinner from '../../components/IssueComp/Spinner';

const ShowIssue = () => {
  const [issue, setIssue] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:4000/issues/${id}`)
      .then((response) => {
        setIssue(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.container}>
      <BackButton />
      <h1 style={styles.title}>Show Issue</h1>
      {loading ? (
        <Spinner />
      ) : (
        <div style={styles.issueContainer}>
          
          <div style={styles.row}>
            <span style={styles.label}>Issue ID</span>
            <span>{issue.cid}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Customer Name</span>
            <span>{issue.Cname}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>NIC</span>
            <span>{issue.Cnic}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Contact Number</span>
            <span>{issue.Ccontact}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Location</span>
            <span>{issue.Clocation}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Status</span>
            <span>{issue.Cstatus}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Create Time</span>
            <span>{new Date(issue.createdAt).toString()}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Last Update Time</span>
            <span>{new Date(issue.updatedAt).toString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '50px',
  },
  title: {
    fontSize: '1.875rem',
    margin: '16px 0',
  },
  issueContainer: {
    display: 'flex',
    flexDirection: 'column',
    border: '2px solid #00BFFF',
    borderRadius: '0.5rem',
    width: '600px',
    padding: '32px',
    margin: 'auto',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  label: {
    fontSize: '1.25rem',
    marginRight: '16px',
    color: '#808080',
  },
};

export default ShowIssue;
