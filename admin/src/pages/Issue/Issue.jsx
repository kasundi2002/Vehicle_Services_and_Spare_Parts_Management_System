import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '../../components/IssueComp/Spinner';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';
import IssuesTable from '../../components/IssueComp/IssuesTable';
import IssueCard from '../../components/IssueComp/IssueCard';

const Home = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showType, setShowType] = useState('table');

  useEffect(() => {
    setLoading(true);
    axios
      .get('http://localhost:4000/issues')
      .then((response) => {
        setIssues(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}> Dashboard / Emergency Issues </h2>

      </div>

      {/* Navigation bar */}
      <div style={styles.navbar}>
        <button
          style={{ ...styles.navButton, backgroundColor: showType === 'table' ? '#595959' : '#999999' }}
          onClick={() => setShowType('table')}
        >
          Table
        </button>
        <button
          style={{ ...styles.navButton, backgroundColor: showType === 'card' ? '#595959' : '#999999' }}
          onClick={() => setShowType('card')}
        >
          Card
        </button>
        {/* New button for Dashboard */}
        <Link to='/dashboard'>
          <button
            style={{ ...styles.navButton, backgroundColor: showType === 'dashboard' ? '#595959' : '#999999' }}
            onClick={() => setShowType('dashboard')}
          >
            Dashboard
          </button>
        </Link>
        <button onClick={() => { window.location.href = '/issues/create'; }}
          style={styles.createButton}
        >
          Create
        </button>

      </div>


      {/* Content based on showType */}
      {loading ? (
        <Spinner />
      ) : showType === 'table' ? (
        <IssuesTable issues={issues} />
      ) : (
        <IssueCard issues={issues} />
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '78%',
    marginRight: '0.5rem',
    backgroundPosition: 'right',
    borderRadius: '8px',
    margin: '1px',
  },
  navbar: {
    display: 'flex',
    marginBottom: '2rem',
    marginTop: '0rem',
  },
  navButton: {
    backgroundColor: '#999999',
    padding: '1rem 5rem',
    borderRadius: '0rem',
    cursor: 'pointer',
    border: 'none',
    marginRight: '0rem',
    outline: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.1rem',
  },
  title: {
    fontSize: '1.875rem',
    margin: '0',
  },
  addButton: {
    color: '#2c5282',
    fontSize: '2.5rem',
  },
  title: {
    width: '120%',
    fontSize: '1.5rem',
    marginTop: '0.8rem',
    marginLeft: '0.02rem',
    backgroundColor: '#90cdf4',
    padding: '0.4rem ',
    borderRadius: '0.3rem',

  },
  createButton: {
    backgroundColor: '#2c5282',
    color: 'white',
    padding: '0.85rem 5rem',
    borderRadius: '0rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
  }


};

export default Home;
