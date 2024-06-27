import React, { useState, useEffect } from 'react'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import UpdateIcon from '@mui/icons-material/Update';
import axios from "axios";
import './UserList.css'

const UserList = () => {
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        fetch('http://localhost:4000/allusers')
            .then((res) => res.json())
            .then((data) => {
                setAllUsers(data);
            });
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:4000/users/${id}`);

                window.alert("user deleted successfully");
            } catch (error) {
                console.error("Error deleting user:", error);
                window.alert("Failed to delete user");
                window.location.reload()
            }
        }
    };
    return (
        <div>
            <div className="activeuser-section">
                <h2 className='ActiveUser-head'>Active Users</h2>
                <table className="UserList-table">
                    <thead>
                        <tr className='userhead'>
                            <th className='tt'>Name</th>
                            <th className='tt'>Action</th>
                        </tr>
                    </thead>
                    <tbody className='usertable-body'>
                        {allUsers.map((users, index) => (
                            <tr key={index}>
                                <td className='tt'>{users.name}</td>
                                <td className='tt'>
                                    <UpdateIcon onClick={() => naigateToUpdate(users._id)} className="updateIcn" />
                                    <DeleteOutlineIcon onClick={() => handleDelete(users._id)} className="removeIcn" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UserList