import React, { useState } from 'react';
import './UserInfoModal.css'; // Ensure this path is correct

const UserInfoModal = ({ userAvatarUrl, username, userEmail, userDetails, onClose }) => {
    const [showDetails, setShowDetails] = useState(false); // State to manage details visibility

    return (
        <div className="modal-overlay"> {/* Overlay for the modal */}
            <div className="modal-container">
                <div
                    className="avatar"
                    style={{
                        backgroundImage: `url(${userAvatarUrl || "./avatar.png"})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }} // Avatar image
                ></div>
                <div className="user-info">
                    <h2>{username || 'Unknown User'}</h2>  {/* Display user's name */}
                    <p>{userEmail || 'Email not available'}</p>    {/* Display user's email */}
                    <button onClick={() => setShowDetails(prev => !prev)}>
                        {showDetails ? 'Hide Info' : 'Show Info'}
                    </button>
                    {showDetails && (
                        <div className="additional-details">
                            <p>{userDetails || 'No additional details available'}</p> {/* Display additional user details */}
                        </div>
                    )}
                </div>
                <button className="close-button" onClick={onClose}>Close</button> {/* Close button */}
            </div>
        </div>
    );
};

export default UserInfoModal;
