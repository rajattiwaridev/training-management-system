import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CCol,
  CRow,
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
  CBadge
} from '@coreui/react';
import axios from 'axios';
import SweetAlert from 'sweetalert2';

const AddDepartment = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API;
  const token = sessionStorage.getItem('authToken');
  
  // State management
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ departmentName: '' });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = departments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(departments.length / itemsPerPage);

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${endpoint}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data);
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to fetch departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.departmentName.trim()) {
      newErrors.departmentName = 'Department name is required';
    } else if (formData.departmentName.trim().length < 2) {
      newErrors.departmentName = 'Department name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${endpoint}/departments`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.status === 201) {
        setSuccessMessage('Department added successfully!');
        setFormData({ departmentName: '' });
        fetchDepartments(); // Refresh the list
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setErrors({ departmentName: 'Department name already exists' });
      } else {
        SweetAlert.fire('Error', 'Failed to add department', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

//   const handleDelete = async (id) => {
//     try {
//       const result = await SweetAlert.fire({
//         title: 'Are you sure?',
//         text: 'You won\'t be able to revert this!',
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#d33',
//         cancelButtonColor: '#3085d6',
//         confirmButtonText: 'Yes, delete it!'
//       });
      
//       if (result.isConfirmed) {
//         await axios.delete(`${endpoint}/departments/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
        
//         SweetAlert.fire('Deleted!', 'Department has been deleted.', 'success');
//         fetchDepartments(); // Refresh the list
//       }
//     } catch (error) {
//       SweetAlert.fire('Error', 'Failed to delete department', 'error');
//     }
//   };

  // Function to render pagination items
  
  const renderPaginationItems = () => {
    const items = [];
    
    // Previous button
    items.push(
      <CPaginationItem 
        key="prev" 
        disabled={currentPage === 1} 
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        Previous
      </CPaginationItem>
    );
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <CPaginationItem
          key={i}
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </CPaginationItem>
      );
    }
    
    // Next button
    items.push(
      <CPaginationItem 
        key="next" 
        disabled={currentPage === totalPages} 
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        Next
      </CPaginationItem>
    );
    
    return items;
  };

  return (
    <CRow>
      <CCol xs={12}>
        {/* Add Department Form */}
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add New Department</strong>
          </CCardHeader>
          <CCardBody>
            {successMessage && (
              <CAlert color="success" className="mb-3">
                {successMessage}
              </CAlert>
            )}
            
            <CForm onSubmit={handleSubmit}>
              <CRow className="align-items-end">
                <CCol md={8}>
                  <CFormLabel htmlFor="departmentName">
                    Department Name <span className="text-danger">*</span>
                  </CFormLabel>
                  <CFormInput
                    type="text"
                    id="departmentName"
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleInputChange}
                    placeholder="Enter department name"
                    invalid={!!errors.departmentName}
                  />
                  {errors.departmentName && (
                    <div className="text-danger small mt-1">{errors.departmentName}</div>
                  )}
                </CCol>
                <CCol md={2} className="mt-md-0 mt-2">
                  <CButton 
                    type="submit" 
                    color="primary" 
                    disabled={submitting}
                    className="w-100"
                  >
                    {submitting ? <CSpinner size="sm" /> : 'Add Department'}
                  </CButton>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>

        {/* Departments List */}
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Departments List</strong>
            <CBadge color="info">{departments.length} Departments</CBadge>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center">
                <CSpinner />
                <p className="mt-2">Loading departments...</p>
              </div>
            ) : departments.length > 0 ? (
              <>
                <CTable striped responsive hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Department Name</CTableHeaderCell>
                      {/* <CTableHeaderCell>Actions</CTableHeaderCell> */}
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentItems.map((dept, index) => (
                      <CTableRow key={dept._id}>
                        <CTableDataCell>{indexOfFirstItem + index + 1}</CTableDataCell>
                        <CTableDataCell>{dept.departmentName}</CTableDataCell>
                        {/* <CTableDataCell>
                          <CButton
                            color="danger"
                            size="sm"
                            onClick={() => handleDelete(dept._id)}
                          >
                            Delete
                          </CButton>
                        </CTableDataCell> */}
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, departments.length)} of {departments.length} entries
                    </div>
                    <CPagination>
                      {renderPaginationItems()}
                    </CPagination>
                  </div>
                )}
              </>
            ) : (
              <CAlert color="info" className="text-center">
                No departments found. Add your first department above.
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default AddDepartment;