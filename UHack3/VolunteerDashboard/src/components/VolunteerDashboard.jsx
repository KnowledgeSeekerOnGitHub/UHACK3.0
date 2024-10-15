import React, { useState } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { GET_ASSIGNMENTS, GET_ASSIGNMENT_BY_ID, VOLUNTEER_UPDATE_ASSIGNMENT } from '../graphql/queries';
import { useUser } from '../UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './VolunteerDashboard.css';

const VolunteerDashboard = () => {
    const [showAssignments, setShowAssignments] = useState(false);
    const [showRegisteredAssignments, setShowRegisteredAssignments] = useState(false);
    const [showRegisterAssignments, setShowRegisterAssignments] = useState(false); // New state for register assignments
    const [showUpdateAssignments, setShowUpdateAssignments] = useState(false); // New state for update assignments
    const [selectedArea, setSelectedArea] = useState('');
    const [sortField, setSortField] = useState('ID');
    const [sortOrder, setSortOrder] = useState('asc');
    const [assignmentId, setAssignmentId] = useState('');
    const [assignmentDetails, setAssignmentDetails] = useState(null);
    const [assignmentsToUpdate, setAssignmentsToUpdate] = useState([]); // New state for assignments to update
    const client = useApolloClient();
    const { loading, error, data, refetch } = useQuery(GET_ASSIGNMENTS);
    const { userId } = useUser();
    const navigate = useNavigate(); // Initialize useNavigate
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [updateAssignment] = useMutation(VOLUNTEER_UPDATE_ASSIGNMENT, {
        refetchQueries: [{ query: GET_ASSIGNMENTS }],
        onCompleted: () => {
            alert("Assignment updated successfully!");
            setAssignmentId('');
            setAssignmentDetails(null);
            refetch();
        },
        onError: (error) => {
            alert(`Error updating assignment: ${error.message}`);
        }
    });

    // Logout function to clear state and navigate to '/'
    const handleLogout = () => {
        navigate('/'); // Navigate to root
    };

    const handleViewAssignments = () => {
        setShowAssignments(!showAssignments);
        setShowRegisteredAssignments(false); // Ensure registered assignments are closed
        setShowRegisterAssignments(false); // Ensure register assignments are closed
        setShowUpdateAssignments(false); // Ensure update assignments are closed
    };

    const handleShowRegisteredAssignments = () => {
        setShowRegisteredAssignments(!showRegisteredAssignments);
        setShowAssignments(false); // Ensure assignments are closed
        setShowRegisterAssignments(false); // Ensure register assignments are closed
        setShowUpdateAssignments(false); // Ensure update assignments are closed
    };

    const handleShowRegisterAssignments = () => {
        setShowRegisterAssignments(!showRegisterAssignments);
        setShowAssignments(false); // Ensure assignments are closed
        setShowRegisteredAssignments(false); // Ensure registered assignments are closed
        setShowUpdateAssignments(false); // Ensure update assignments are closed
    };

    const handleShowUpdateAssignments = () => {
        setShowUpdateAssignments(!showUpdateAssignments);
        setShowAssignments(false); // Ensure assignments are closed
        setShowRegisteredAssignments(false); // Ensure registered assignments are closed
        setShowRegisterAssignments(false); // Ensure register assignments are closed
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const filteredAssignments = data?.Assignments.filter(
        (assignment) =>
            !assignment.Assignment_Taken &&
            (selectedArea === '' || assignment.Assignment_Area === selectedArea)
    );

    const sortedAssignments = [...(filteredAssignments || [])].sort((a, b) => {
        const aValue = sortField === 'ID' ? a.ID : a.Assignment_Name.toLowerCase();
        const bValue = sortField === 'ID' ? b.ID : b.Assignment_Name.toLowerCase();
        return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    const totalPages = Math.ceil((sortedAssignments.length || 0) / itemsPerPage);
    const currentAssignments = sortedAssignments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const fetchAssignmentDetails = async () => {
        try {
            const idAsInt = parseInt(assignmentId, 10);
            const { data } = await client.query({
                query: GET_ASSIGNMENT_BY_ID,
                variables: { id: idAsInt },
                fetchPolicy: 'network-only',
            });

            if (data.Assignments.length > 0) {
                const assignment = data.Assignments[0];
                console.log('Fetched Assignment:', assignment);

                if (!assignment.Assignment_Taken) {
                    setAssignmentDetails(assignment);
                } else {
                    alert('This assignment has already been taken.');
                    setAssignmentDetails(null);
                }
            } else {
                alert('Assignment not found!');
            }
        } catch (error) {
            alert(`Error fetching assignment details: ${error.message}`);
        }
    };

    const registerAssignment = async () => {
        const { data } = await client.query({
            query: GET_ASSIGNMENTS,
            variables: { takenId: userId },
        });

        const alreadyAssigned = data.Assignments.some(assignment => assignment.Assignment_Status === "Assigned");

        if (alreadyAssigned) {
            alert('You can only have one assignment assigned at a time.');
            return;
        }

        if (!assignmentId || assignmentId.trim() === '') {
            alert('Please enter a valid Assignment ID.');
            return;
        }

        if (assignmentDetails) {
            try {
                await updateAssignment({
                    variables: {
                        id: parseInt(assignmentId, 10),
                        Assignment_Taken: true,
                        Assignment_Status: "Assigned",
                        Taken_ID: userId,
                    },
                });
            } catch (error) {
                alert(`Error registering assignment: ${error.message}`);
            }
        } else {
            alert('No assignment details to register.');
        }
    };

    // Fetch assignments for updating
    const fetchAssignmentsToUpdate = () => {
        const assignments = data?.Assignments.filter(assignment => assignment.Taken_ID === userId && assignment.Assignment_Status === 'Assigned') || [];
        setAssignmentsToUpdate(assignments);
    };

    // Function to update the status of an assignment
    const handleUpdateAssignment = async (assignmentId) => {
        try {
            await updateAssignment({
                variables: {
                    id: assignmentId,
                    Assignment_Taken: true,
                    Assignment_Status: "Processing",
                    Taken_ID: userId,
                },
            });
        } catch (error) {
            alert(`Error updating assignment: ${error.message}`);
        }
    };

    if (loading) return <p>Loading assignments...</p>;
    if (error) return <p>Error fetching assignments: {error.message}</p>;

    const uniqueAreas = Array.from(new Set(data?.Assignments.map(a => a.Assignment_Area))) || [];

    // Registered assignments based on Taken_ID
    const registeredAssignments = data?.Assignments.filter(assignment => assignment.Taken_ID === userId) || [];
    const sortedRegisteredAssignments = [...registeredAssignments].sort((a, b) => {
        const aValue = a.Assignment_Status.toLowerCase();
        const bValue = b.Assignment_Status.toLowerCase();
        return aValue.localeCompare(bValue);
    });

    const totalRegisteredPages = Math.ceil((sortedRegisteredAssignments.length || 0) / itemsPerPage);
    const currentRegisteredAssignments = sortedRegisteredAssignments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderPagination = (totalPages, currentPage) => (
        <div className="pagination">
            <button className="page-button" onClick={() => handlePageChange(1)}>
                START
            </button>
            <button className="page-button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                {'<'}
            </button>
            <span className="current-page">{currentPage}</span>
            <button className="page-button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                {'>'}
            </button>
            <button className="page-button" onClick={() => handlePageChange(totalPages)}>
                END
            </button>
        </div>
    );

    return (
        <div className="volunteer-dashboard">
            <button className="logout-button" onClick={handleLogout}>
                Logout
            </button>

            {!showAssignments && !showRegisteredAssignments && !showRegisterAssignments && !showUpdateAssignments && <h1>Volunteer Dashboard</h1>}

            {!showRegisteredAssignments && !showRegisterAssignments && !showUpdateAssignments && (
                <button className="view-assignments-button" onClick={handleViewAssignments}>
                    View Assignments
                </button>
            )}

            {showAssignments && (
                <div className="assignments-container">
                    <h2>Available Assignments</h2>
                    <div className="filter-sort-container">
                        <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)}>
                            <option value="">All Areas</option>
                            {uniqueAreas.map((area) => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                        <select
                            value={sortField}
                            onChange={(e) => {
                                setSortField(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="ID">Sort by ID</option>
                            <option value="Assignment_Name">Sort by Name</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>

                    {currentAssignments.length > 0 ? (
                        <>
                            <table className="assignments-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Created At</th>
                                        <th>Assignment Name</th>
                                        <th>Assignment Area</th>
                                        <th>Assignment Description</th>
                                        <th>Assignment Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAssignments.map((assignment) => (
                                        <tr key={assignment.ID}>
                                            <td>{assignment.ID}</td>
                                            <td>{assignment.Created_At}</td>
                                            <td>{assignment.Assignment_Name}</td>
                                            <td>{assignment.Assignment_Area}</td>
                                            <td>{assignment.Assignment_Description}</td>
                                            <td>{assignment.Assignment_Address}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {renderPagination(totalPages, currentPage)}
                        </>
                    ) : (
                        <p>No assignments available.</p>
                    )}
                    <button className="close-button" onClick={handleViewAssignments}>
                        Close
                    </button>
                </div>
            )}

            {showRegisteredAssignments && (
                <div className="registered-assignments-container">
                    <h2>Registered Assignments</h2>
                    {currentRegisteredAssignments.length > 0 ? (
                        <>
                            <table className="assignments-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Assignment Name</th>
                                        <th>Assignment Status</th>
                                        <th>Assignment Description</th>
                                        <th>Assignment Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRegisteredAssignments.map((assignment) => (
                                        <tr key={assignment.ID}>
                                            <td>{assignment.ID}</td>
                                            <td>{assignment.Assignment_Name}</td>
                                            <td>{assignment.Assignment_Status}</td>
                                            <td>{assignment.Assignment_Description}</td>
                                            <td>{assignment.Assignment_Address}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {renderPagination(totalRegisteredPages, currentPage)}
                        </>
                    ) : (
                        <p>No registered assignments found.</p>
                    )}
                    <button className="close-button" onClick={handleShowRegisteredAssignments}>
                        Close
                    </button>
                </div>
            )}

            {showRegisterAssignments && (
                <div className="register-assignments-container">
                    <h2>Register Assignment</h2>
                    <input
                        type="text"
                        value={assignmentId}
                        onChange={(e) => setAssignmentId(e.target.value)}
                        placeholder="Enter Assignment ID"
                    />
                    <button onClick={fetchAssignmentDetails}>Fetch Details</button>
                    {assignmentDetails && (
                        <div>
                            <p>Description: {assignmentDetails.Assignment_Description}</p>
                            <p>Address: {assignmentDetails.Assignment_Address}</p>
                            <button onClick={registerAssignment}>REGISTER</button>
                        </div>
                    )}
                    <button className="close-button" onClick={handleShowRegisterAssignments}>
                        Close
                    </button>
                </div>
            )}

            {showUpdateAssignments && (
                <div className="update-assignments-container">
                    <h2>Update Assignments</h2>
                    <button onClick={fetchAssignmentsToUpdate}>Fetch Assignments</button>
                    {assignmentsToUpdate.length > 0 ? (
                        <table className="assignments-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Assignment Name</th>
                                    <th>Assignment Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignmentsToUpdate.map((assignment) => (
                                    <tr key={assignment.ID}>
                                        <td>{assignment.ID}</td>
                                        <td>{assignment.Assignment_Name}</td>
                                        <td>{assignment.Assignment_Status}</td>
                                        <td>
                                            <button onClick={() => handleUpdateAssignment(assignment.ID)}>
                                                Update to Processing
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No assignments to update found.</p>
                    )}
                    <button className="close-button" onClick={handleShowUpdateAssignments}>
                        Close
                    </button>
                </div>
            )}

            {!showAssignments && !showRegisteredAssignments && !showRegisterAssignments && !showUpdateAssignments && (
                <>
                    <button className="registered-assignments-button" onClick={handleShowRegisteredAssignments}>
                        Registered Assignments
                    </button>
                    <button className="registered-assignments-button" onClick={handleShowRegisterAssignments}>
                        Register Assignments
                    </button>
                    <button className="registered-assignments-button" onClick={handleShowUpdateAssignments}>
                        Update Assignments
                    </button>
                </>
            )}
        </div>
    );
};

export default VolunteerDashboard;
