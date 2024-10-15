import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useQuery, useMutation } from '@apollo/client';
import { GET_ASSIGNMENTS, ADD_ASSIGNMENT, UPDATE_ASSIGNMENT } from '../graphql/queries';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeButton, setActiveButton] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [searchByField, setSearchByField] = useState('ID');
  const [currentPage, setCurrentPage] = useState(1);
  const [assignmentsPerPage] = useState(10);
  const [sortField, setSortField] = useState('ID');
  const [sortOrder, setSortOrder] = useState('asc');
  const navigate = useNavigate();
  const [searchCriteria, setSearchCriteria] = useState('ID'); // Default search criteria

  const handleLogout = () => {
    navigate('/');
  };

  const [assignmentTaken, setAssignmentTaken] = useState(false);

  const { data, loading, error } = useQuery(GET_ASSIGNMENTS);

  useEffect(() => {
    if (data && data.Assignments) {
      setAssignments(data.Assignments);
      setFilteredAssignments(data.Assignments);
    }
  }, [data]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredAssignments(
        assignments.filter(assignment => {
          switch (searchByField) {
            case 'ID':
              return assignment.ID.toString().includes(searchTerm);
            case 'Name':
              return assignment.Assignment_Name.toLowerCase().includes(searchTerm.toLowerCase());
            case 'Status':
              return assignment.Assignment_Status && assignment.Assignment_Status.toLowerCase().includes(searchTerm.toLowerCase());
            case 'Taken_ID':
              return assignment.Taken_ID && assignment.Taken_ID.toString().includes(searchTerm);
            default:
              return false;
          }
        })
      );
    } else {
      setFilteredAssignments(assignments);
    }
  }, [searchTerm, assignments, searchByField]);

  const [addAssignment] = useMutation(ADD_ASSIGNMENT, {
    refetchQueries: [{ query: GET_ASSIGNMENTS }],
  });

  const [updateAssignment] = useMutation(UPDATE_ASSIGNMENT, {
    refetchQueries: [{ query: GET_ASSIGNMENTS }],
  });

  const handleAddAssignments = () => {
    setActiveButton('add');
    setSelectedAssignment(null);
  };

  const handleUpdateAssignments = () => {
    setActiveButton('update');
    setSelectedAssignment(null);
  };

  const handleViewAssignments = () => {
    setActiveButton('view');
  };

  const handleAddAssignment = async (event) => {
    event.preventDefault();
    const assignmentName = event.target.assignmentName.value;
    const assignmentArea = event.target.assignmentArea.value;
    const assignmentAddress = event.target.assignmentAddress.value;
    const assignmentDescription = event.target.assignmentDescription.value;

    try {
      await addAssignment({
        variables: { name: assignmentName, area: assignmentArea, address: assignmentAddress, description: assignmentDescription },
      });
      event.target.reset();
      setActiveButton(null);
    } catch (error) {
      console.error("Error adding assignment:", error);
    }
  };

  const handleUpdateAssignment = async (event) => {
    event.preventDefault();
    const assignmentName = event.target.assignmentName.value;
    const assignmentArea = event.target.assignmentArea.value;
    const assignmentAddress = event.target.assignmentAddress.value; 
    const assignmentDescription = event.target.assignmentDescription.value; 
    const takenID = assignmentTaken ? event.target.takenID.value : null;

    let assignmentStatus = assignmentTaken ? event.target.assignmentStatus.value : 'Not Assigned';

    const filteredAssignments = assignments.filter((assignment) => {
      const { ID, Assignment_Name, Taken_ID } = assignment;
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      
      if (searchCriteria === 'ID') {
          return ID.toString().includes(lowerCaseSearchTerm);
      } else if (searchCriteria === 'Name') {
          return Assignment_Name.toLowerCase().includes(lowerCaseSearchTerm);
      } else if (searchCriteria === 'TakenID') {
          return Taken_ID.toString().includes(lowerCaseSearchTerm);
      }
      return false;
  });
  

  // Get current assignments for pagination based on filtered results
  const currentAssignments = sortAssignments(filteredAssignments).slice(indexOfFirstAssignment, indexOfLastAssignment);


    try {
      await updateAssignment({
        variables: {
          id: selectedAssignment.ID,
          Assignment_Name: assignmentName,
          Assignment_Area: assignmentArea,
          Assignment_Taken: assignmentTaken,
          Assignment_Status: assignmentStatus,
          Assignment_Address: assignmentAddress,
          Assignment_Description: assignmentDescription, 
          Taken_ID: takenID,
        },
      });

      event.target.reset();
      setSelectedAssignment(null);
      setActiveButton('update');
    } catch (error) {
      console.error("Error updating assignment:", error);
    }
  };

  const handleSelectAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setSearchTerm(''); // Clear search term on select
  };

  const handleAssignmentTakenChange = (event) => {
    setAssignmentTaken(event.target.value === 'True');
  };

  const handleClose = () => {
    setActiveButton(null);
    setSelectedAssignment(null);
    setSearchTerm('');
    setFilteredAssignments(assignments);
    setAssignmentTaken(false);
  };

  // Sorting function
  const sortAssignments = (assignments) => {
    return [...assignments].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'ID':
          comparison = a.ID - b.ID;
          break;
        case 'Name':
          comparison = a.Assignment_Name.localeCompare(b.Assignment_Name);
          break;
        case 'Assignment_Status':
          comparison = a.Assignment_Status.localeCompare(b.Assignment_Status);
          break;
        case 'Taken_ID':
          comparison = (a.Taken_ID || 0) - (b.Taken_ID || 0);
          break;
        default:
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  // Get current assignments for pagination
  const indexOfLastAssignment = currentPage * assignmentsPerPage;
  const indexOfFirstAssignment = indexOfLastAssignment - assignmentsPerPage;
  const currentAssignments = sortAssignments(filteredAssignments).slice(indexOfFirstAssignment, indexOfLastAssignment);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get total number of pages
  const totalPages = Math.ceil(filteredAssignments.length / assignmentsPerPage);

  // Calculate the current pagination range
  const getPaginationButtons = () => {
    const buttons = [];
    if (totalPages > 1) {
      buttons.push(
        <button key="start" onClick={() => paginate(1)} disabled={currentPage === 1}>
          Start
        </button>
      );
      buttons.push(
        <button key="prev" onClick={() => paginate(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>
          &lt;
        </button>
      );
      buttons.push(
        <span key="current" className="current-page">
          {currentPage}
        </span>
      );
      buttons.push(
        <button key="next" onClick={() => paginate(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}>
          &gt;
        </button>
      );
      buttons.push(
        <button key="end" onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>
          End
        </button>
      );
    }
    return buttons;
  };

  if (loading) return <p>Loading assignments...</p>;
  if (error) return <p>Error fetching assignments: {error.message}</p>;

  // Inside the AdminDashboard component
  return (
    <div className="admin-dashboard">
      {activeButton === null && <h1>Admin Dashboard</h1>}
      
      <button className="logout-button" onClick={handleLogout}>Logout</button>

      {activeButton === null && (
        <div className="assignments-menu">
          <button className="main-button" onClick={handleAddAssignments}>Add Assignments</button>
          <button className="main-button" onClick={handleUpdateAssignments}>Update Assignments</button>
          <button className="main-button" onClick={handleViewAssignments}>View Assignments</button>
        </div>
      )}

      {/* Add Assignments */}
      {activeButton === 'add' && (
        <form onSubmit={handleAddAssignment} className="assignment-form">
          <input type="text" name="assignmentName" placeholder="Assignment Name" required />
          <input type="text" name="assignmentArea" placeholder="Assignment Area" required />
          <input type="text" name="assignmentAddress" placeholder="Assignment Address" required />
          <input type="text" name="assignmentDescription" placeholder="Assignment Description" required />
          <button type="submit">Add Assignment</button>
          <button className="close-button" onClick={handleClose}>Close</button>
        </form>
      )}

      {activeButton === 'update' && (
      <div>
        {/* Search Bar for Updating Assignments */}
        <input
          type="text"
          placeholder="Search by ID"
          value={searchTerm}
          onChange={(e) => {
            console.log("New Search Term:", e.target.value);
            setSearchTerm(e.target.value);
          }}
          className="search-input"
        />
        
        {searchTerm && filteredAssignments.length > 0 && (
          <ul className="assignment-suggestions">
            {filteredAssignments.map((assignment) => (
              <li key={assignment.ID} onClick={() => handleSelectAssignment(assignment)}>
                {assignment.Assignment_Name} (ID: {assignment.ID})
              </li>
            ))}
          </ul>
        )}

        {selectedAssignment && (
          <form onSubmit={handleUpdateAssignment} className="assignment-form">
            <h2>Update Assignment {selectedAssignment.ID}</h2>
            <input type="text" name="assignmentName" defaultValue={selectedAssignment.Assignment_Name} required />
            <input type="text" name="assignmentArea" defaultValue={selectedAssignment.Assignment_Area} required />
            <input type="text" name="assignmentAddress" defaultValue={selectedAssignment.Assignment_Address} required />
            <input type="text" name="assignmentDescription" defaultValue={selectedAssignment.Assignment_Description} required />
            
            <label>
              Assignment Taken:
              <select onChange={handleAssignmentTakenChange}>
                <option value="False">No</option>
                <option value="True">Yes</option>
              </select>
            </label>
            {assignmentTaken && (
              <input type="text" name="takenID" placeholder="Taken ID" required />
            )}
            
            <label>
              Assignment Status:
              <input type="text" name="assignmentStatus" defaultValue={selectedAssignment.Assignment_Status} required />
            </label>
            
            <button type="submit">Update Assignment</button>
            <button type="button" className="close-button" onClick={handleClose}>Close</button>
          </form>
        )}
      </div>
    )}

      {/* View Assignments */}
      {activeButton === 'view' && (
        <div className="view-assignments">
          <h2>View Assignments</h2>

          <input
            type="text"
            placeholder={`Search by ${searchByField}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={searchByField}
            onChange={(e) => setSearchByField(e.target.value)}
            className="search-select"
          >
            <option value="ID">ID</option>
            <option value="Name">Name</option>
            <option value="Status">Status</option>
            <option value="Taken_ID">Taken ID</option>
          </select>

          <table className="assignments-table">
            <thead>
              <tr>
                <th onClick={() => {
                  setSortField('ID');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>ID</th>
                <th onClick={() => {
                  setSortField('Name');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>Name</th>
                <th onClick={() => {
                  setSortField('Area');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>Area</th>
                <th onClick={() => {
                  setSortField('Assignment_Taken');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>Assignment Taken</th>
                <th onClick={() => {
                  setSortField('Assignment_Status');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>Status</th>
                <th onClick={() => {
                  setSortField('Taken_ID');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>Taken ID</th>
                <th onClick={() => {
                  setSortField('Assignment_Address');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>Address</th>
                <th onClick={() => {
                  setSortField('Assignment_Description');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {currentAssignments.map((assignment) => (
                <tr key={assignment.ID}>
                  <td>{assignment.ID}</td>
                  <td>{assignment.Assignment_Name}</td>
                  <td>{assignment.Assignment_Area}</td>
                  <td>{assignment.Assignment_Taken ? 'Yes' : 'No'}</td>
                  <td>{assignment.Assignment_Status}</td>
                  <td>{assignment.Taken_ID || 'N/A'}</td>
                  <td>{assignment.Assignment_Address || 'N/A'}</td>
                  <td>{assignment.Assignment_Description || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            {getPaginationButtons()}
          </div>

          {/* Close Button */}
          <button className="close-button" onClick={handleClose}>Close</button>
        </div>
      )}


    </div>
  );
};

export default AdminDashboard;
