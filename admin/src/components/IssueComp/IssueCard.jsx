import React from 'react';
import { Link } from 'react-router-dom';
import { PiBookOpenTextLight } from 'react-icons/pi';
import { BiUserCircle } from 'react-icons/bi';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import IssueSingleCard from './IssueSingleCard';

const IssueCard = ({ issues }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            maxWidth: '1000px',
            margin: 'auto',
        }}>
            {issues.map((item) => (
                <IssueSingleCard key={item._id} issues={item} />
            ))}
        </div>
    );
};

export default IssueCard;
