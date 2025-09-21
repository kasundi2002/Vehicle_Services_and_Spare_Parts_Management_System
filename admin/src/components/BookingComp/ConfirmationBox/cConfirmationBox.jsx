import React, { useState } from 'react';

function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="popup">
      <div className="popup-inner">
        <p>{message}</p>
        <div>
          <button onClick={onConfirm}>Reject</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
