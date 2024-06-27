import React, { useState, useEffect } from 'react';
import backgroundImage from '../../assets/iss2.jpg'; // import your background image
import BackButton from '../../Components/Issues/BackButton';
import Spinner from '../../Components/Issues/Spinner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateIssues = () => {
  const [cid, setcid] = useState('');
  const [Cname, setCname] = useState('');
  const [Cnic, setCnic] = useState('');
  const [Ccontact, setCcontact] = useState('');
  const [Clocation, setClocation] = useState('');
  const [Cstatus, setCstatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    generateIssueID();
  }, []);

  const generateIssueID = () => {
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
      .post('http://localhost:4000/issues', data)
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
      <div style={styles.background}>
        <div style={styles.content}>
          <BackButton />
          <h1 style={styles.title}>Create General Issue</h1>
          {loading ? <Spinner /> : ''}
          <div style={styles.formContainer}>
            <form>
              <div style={styles.formField}>
                <label style={styles.label}>Issue ID:</label>
                <input
                  type='text'
                  value={cid}
                  onChange={(e) => setcid(e.target.value)}
                  style={styles.input}
                />
                {errors.cid && <p style={styles.error}>{errors.cid}</p>}
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Customer Name:</label>
                <input
                  type='text'
                  value={Cname}
                  onChange={(e) => setCname(e.target.value)}
                  style={styles.input}
                />
                {errors.Cname && <p style={styles.error}>{errors.Cname}</p>}
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>NIC:</label>
                <input
                  type='text'
                  value={Cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  style={styles.input}
                />
                {errors.Cnic && <p style={styles.error}>{errors.Cnic}</p>}
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Contact Number:</label>
                <input
                  type='text'
                  value={Ccontact}
                  onChange={(e) => setCcontact(e.target.value)}
                  style={styles.input}
                />
                {errors.Ccontact && <p style={styles.error}>{errors.Ccontact}</p>}
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Location:</label>
                <input
                  type='text'
                  value={Clocation}
                  onChange={(e) => setClocation(e.target.value)}
                  style={styles.input}
                />
                {errors.Clocation && <p style={styles.error}>{errors.Clocation}</p>}
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Action:</label>
                <input
                  type='text'
                  value={Cstatus}
                  onChange={(e) => setCstatus(e.target.value)}
                  style={styles.input}
                  placeholder="Enter Action"
                />
                {errors.Cstatus && <p style={styles.error}>{errors.Cstatus}</p>}
              </div>



              <button style={styles.saveButton} onClick={handleSaveIssue}>
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
  },
  background: {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '10px',
    padding: '40px',
    width: '70%',
    maxWidth: '700px',

  },
  title: {
    textAlign: 'center',
    fontSize: '30px',
    marginBottom: '20px',
  },
  formContainer: {
    marginTop: '20px',
  },
  formField: {
    marginBottom: '15px',
    marginRight: '2rem',

  },
  label: {
    display: 'block',
    fontSize: '18px',
    marginBottom: '5px',
    color: '#ffffff',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  error: {
    color: '#e53e3e',
    fontSize: '14px',
    marginTop: '5px',
  },
  saveButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '20px',
  },
};

export default CreateIssues;
