import { Link } from 'react-router-dom';
import { PiBookOpenTextLight } from 'react-icons/pi';
import { BiUserCircle } from 'react-icons/bi';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';

const BookSingleCard = ({ issues }) => {
  const styles = {
    card: {
      border: '2px solid #A0AEC0',
      borderRadius: '8px',
      padding: '8px 16px',
      margin: '16px',
      position: 'relative',
      transition: 'box-shadow 0.3s ease',
    },
    header: {
      position: 'absolute',
      top: '8px',
      right: '16px',
      backgroundColor: '#FEB2B2',
      borderRadius: '8px',
      padding: '4px 8px',
    },
    text: {
      margin: '8px 0',
      color: '#4A5568',
    },
    iconContainer: {
      display: 'flex',
      justifyContent: 'start',
      alignItems: 'center',
      gap: '8px',
    },
    icon: {
      fontSize: '24px',
      color: '#E53E3E',
    },
    hoverIcon: {
      color: '#000000',
    },
  };

  return (
    <div style={styles.card} key={issues._id}>
      <h2 style={styles.header}>
        {issues.cid}
      </h2>
      <h4 style={styles.text}>
        {issues._id}
      </h4>
      <div style={styles.iconContainer}>
        <PiBookOpenTextLight style={styles.icon} />
        <h2 style={styles.text}>
          {issues.Cstatus}
        </h2>
      </div>
      <div style={styles.iconContainer}>
        <BiUserCircle style={styles.icon} />
        <h2 style={styles.text}>
          {issues.Cname}
        </h2>
      </div>
      <div style={{ ...styles.iconContainer, justifyContent: 'space-between', marginTop: '16px', padding: '16px' }}>
        <Link to={`/issues/details/${issues._id}`}>
          <BsInfoCircle style={{ ...styles.icon, ...styles.hoverIcon }} />
        </Link>
        <Link to={`/issues/edit/${issues._id}`}>
          <AiOutlineEdit style={{ ...styles.icon, color: '#D69E2E' }} />
        </Link>
        <Link to={`/issues/delete/${issues._id}`}>
          <MdOutlineDelete style={{ ...styles.icon, color: '#E53E3E' }} />
        </Link>
      </div>
    </div>
  );
};

export default BookSingleCard;
