import React, { useState, useEffect } from 'react';
import BackButton from '../../components/IssueComp/BackButton';
import Spinner from '../../components/IssueComp/Spinner';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditIssue = () => {
  const [cid, setcid] = useState('');
  const [Cname, setCname] = useState('');
  const [Cnic, setCnic] = useState('');
  const [Ccontact, setCcontact] = useState('');
  const [Clocation, setClocation] = useState('');
  const [Cstatus, setCstatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:4000/issues/${id}`)
      .then((response) => {
        setcid(response.data.cid);
        setCname(response.data.Cname)
        setCnic(response.data.Cnic)
        setCcontact(response.data.Ccontact)
        setClocation(response.data.Clocation)
        setCstatus(response.data.Cstatus)
        setLoading(false);
      }).catch((error) => {
        setLoading(false);
        alert('An error happened. Please Check console');
        console.log(error);
      });
  }, []);

  const handleEditIssue = () => {
    const data = {
      cid,
      Cname,
      Cnic,
      Ccontact,
      Clocation,
      Cstatus,
    };
    setLoading(true);
    axios
      .put(`http://localhost:4000/issues/${id}`, data)
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
      <h1 style={styles.title}><center>Update Issue</center></h1>
      {loading ? <Spinner /> : ''}
      <div style={styles.formContainer}>
        <div style={styles.formField}>
          <label style={styles.label}>Issue ID</label>
          <input
            type='text'
            value={cid}
            onChange={(e) => setcid(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Customer Name</label>
          <input
            type='text'
            value={Cname}
            onChange={(e) => setCname(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>NIC</label>
          <input
            type='text'
            value={Cnic}
            onChange={(e) => setCnic(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Contact Number</label>
          <input
            type='text'
            value={Ccontact}
            onChange={(e) => setCcontact(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Location</label>
          <input
            type='text'
            value={Clocation}
            onChange={(e) => setClocation(e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Status</label>
          <select
            value={Cstatus}
            onChange={(e) => setCstatus(e.target.value)}
            style={styles.input}
          >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <button style={styles.saveButton} onClick={handleEditIssue}>
          Update
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
  },
  title: {
    fontSize: '1.875rem',  // Equivalent to 30px
    marginBottom: '1rem',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    border: '2px solid #90cdf4',
    borderRadius: '0.5rem',
    width: '600px',
    padding: '2rem',
    margin: 'auto',
    margin: '50px',

  },
  formField: {
    marginBottom: '1rem',
  },
  label: {
    fontSize: '1.25rem',  // Equivalent to 20px
    marginRight: '0.5rem',
    color: '#4a5568',
    
  },
  input: {
    border: '2px solid #cbd5e0',
    padding: '0.5rem',
    width: '100%',
    borderRadius: '0.25rem',
  },
  saveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4299e1',
    borderRadius: '0.25rem',
    margin: '0.5rem 0',
    cursor: 'pointer',
  },
};

export default EditIssue;
