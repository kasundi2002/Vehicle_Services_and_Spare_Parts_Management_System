import React, { useState } from 'react';
import BackButton from '../../components/IssueComp/BackButton';
import Spinner from '../../components/IssueComp/Spinner';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const DeleteIssue = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const handleDeleteIssue = () => {
    setLoading(true);
    axios
      .delete(`https://vehicle-sever.onrender.com/issues/${id}`)
      .then(() => {
        setLoading(false);
        navigate('/issue');
      })
      .catch((error) => {
        setLoading(false);
        alert('An error happened. Please Check console');
        console.log(error);
      });
  };

  return (
    <div style={styles.container}>
      <BackButton />
      <h1 style={styles.title}><center>Delete Issue</center></h1>
      {loading ? <Spinner /> : ''}
      <div style={styles.deleteBox}>
        <h3 style={styles.confirmText}>Are You Sure You want to delete this Issue?</h3>

        <button
          style={styles.deleteButton}
          onClick={handleDeleteIssue}
        >
          Yes, Delete it
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px',
  },
  title: {
    fontSize: '1.875rem',
    margin: '16px 0',
  },
  deleteBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '2px solid #00BFFF',
    borderRadius: '0.5rem',
    width: '600px',
    padding: '100px',
    margin: '30px',
  },
  confirmText: {
    fontSize: '1.25rem',
    marginBottom: '52px',
  },
  deleteButton: {
    padding: '16px',
    backgroundColor: '#FF0000',
    color: '#FFFFFF',
    margin: '8px',
    width: '100%',
    cursor: 'pointer',
    borderRadius: '0.5rem',
  },
};

export default DeleteIssue;
