import React from 'react';
import IssueSingleCard from './IssueSingleCard';

const IssueCard = ({ issues, userID }) => {
    // Filter issues based on the userID
    const userIssues = issues.filter(issue => issue.userID === userID);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            maxWidth: '1000px',
            margin: 'auto',
        }}>
            {userIssues.map((item) => (
                <IssueSingleCard key={item._id} issues={item} />
            ))}
        </div>
    );
};

export default IssueCard;
