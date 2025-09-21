import React, { useState, useEffect } from 'react';
import BackButton from '../../components/IssueComp/BackButton';
import Spinner from '../../components/IssueComp/Spinner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateIssues = () => {
  const [cid, setcid] = useState('');
  const [Cname, setCname] = useState('');
  const [Cnic, setCnic] = useState('');
  const [Ccontact, setCcontact] = useState('');
  const [Clocation, setClocation] = useState('');
  const [Cstatus, setCstatus] = useState('');
  const [points, setPoints] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    generateIssueID();
  }, []);

  const generateIssueID = () => {
    // Generate ID with a prefix and a random number between 1000 and 9999
    const randomID = `ID${Math.floor(1000 + Math.random() * 9000)}`;
    setcid(randomID);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!cid.trim()) {
      newErrors.cid = 'Issue ID is required';
      valid = false;
    }

    if (!Cname.trim()) {
      newErrors.Cname = 'Customer Name is required';
      valid = false;
    }

    if (!Cnic.trim()) {
      newErrors.Cnic = 'NIC is required';
      valid = false;
    }

    if (!Ccontact.trim()) {
      newErrors.Ccontact = 'Contact Number is required';
      valid = false;
    } else if (!/^\d{10}$/.test(Ccontact.trim())) {
      newErrors.Ccontact = 'Contact Number should contain exactly 10 numbers';
      valid = false;
    }

    if (!Clocation.trim()) {
      newErrors.Clocation = 'Location is required';
      valid = false;
    }

    if (!Cstatus.trim()) {
      newErrors.Cstatus = 'Status is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const calculatePoints = (status) => {
    // Calculation logic remains the same
    // ...
  };

  const handleSaveIssue = () => {
    if (!validateForm()) {
      return;
    }

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
      .post('https://vehicle-sever.onrender.com/issues', data)
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
      <h1 style={styles.title}><center>Create Emergency Issue</center></h1>
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
          {errors.cid && <p style={styles.error}>{errors.cid}</p>}
        </div>

        <div style={styles.formField}>
          <label style={styles.label}>Customer Name</label>
          <input
            type='text'
            value={Cname}
            onChange={(e) => setCname(e.target.value)}
            style={styles.input}
          />
          {errors.Cname && <p style={styles.error}>{errors.Cname}</p>}
        </div>

        <div style={styles.formField}>
          <label style={styles.label}>NIC</label>
          <input
            type='text'
            value={Cnic}
            onChange={(e) => setCnic(e.target.value)}
            style={styles.input}
          />
          {errors.Cnic && <p style={styles.error}>{errors.Cnic}</p>}
        </div>

        <div style={styles.formField}>
          <label style={styles.label}>Contact Number</label>
          <input
            type='text'
            value={Ccontact}
            onChange={(e) => setCcontact(e.target.value)}
            style={styles.input}
          />
          {errors.Ccontact && <p style={styles.error}>{errors.Ccontact}</p>}
        </div>

        <div style={styles.formField}>
          <label style={styles.label}>Location</label>
          <input
            type='text'
            value={Clocation}
            onChange={(e) => setClocation(e.target.value)}
            style={styles.input}
          />
          {errors.Clocation && <p style={styles.error}>{errors.Clocation}</p>}
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
          {errors.Cstatus && <p style={styles.error}>{errors.Cstatus}</p>}
        </div>


        <button style={styles.saveButton} onClick={handleSaveIssue}>
          Save
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
    borderRadius: '3.5rem',
    width: '650px',
    padding: '2rem',
    margin: '40px',
  },
  formField: {
    marginBottom: '1rem',
  },
  label: {
    fontSize: '1.25rem',  // Equivalent to 20px
    marginRight: '1.5rem',
    color: '#4a5568',
  },
  input: {
    border: '2px solid #cbd5e0',
    padding: '0.5rem',
    width: '100%',
    borderRadius: '0.25rem',
  },
  error: {
    color: '#e53e3e',
    fontSize: '0.875rem',  // Equivalent to 14px
    marginTop: '0.5rem',
  },
  saveButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#4299e1',
    borderRadius: '0.25rem',
    margin: '0.5rem 0',
    cursor: 'pointer',
  },
};

export default CreateIssues;
