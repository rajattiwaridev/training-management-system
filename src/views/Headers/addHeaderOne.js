import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormFeedback,
  CFormLabel,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableCaption,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CAvatar, CBadge, CButton, CCollapse, CSmartTable } from '@coreui/react-pro'
import axios from 'axios'
import SweetAlert from 'sweetalert2'
import ChatBot from '../chatbot/chatBot'

const AddHeaderOne = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const [validated, setValidated] = useState(false)
  const [formData, setFormData] = useState({
    headerTextOne: '',
    headerTextOneHindi: '',
    headerTextTwo: '',
    headerTextTwoHindi: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (form.checkValidity() === false) {
      event.stopPropagation()
      setValidated(true)
      return
    }

    setValidated(true)

    try {
      const response = await axios.post(`${endpoint}/add-header`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      // Handle successful response
      if (response.status === 200) {
        SweetAlert.fire({
          icon: 'success',
          title: 'Success',
          text: response.data.message,
        })
        // Reset form
        setFormData({
          headerTextOne: '',
          headerTextOneHindi: '',
          headerTextTwo: '',
          headerTextTwoHindi: '',
        })
        setValidated(false)
      } else {
        SweetAlert.fire({
          icon: 'error',
          title: 'Error',
          text: response.data.message,
        })
        setValidated(false)
      }
    } catch (error) {
      SweetAlert.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'An error occurred. Please try again.',
      })
      setValidated(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Header One</strong> <small>Form</small>
          </CCardHeader>
          <CCardBody>
            <CForm
              className="row g-3 needs-validation"
              noValidate
              validated={validated}
              onSubmit={handleSubmit}
            >
              <CCol md={6}>
                <CFormLabel htmlFor="headerTextOne">Header Text Part 1</CFormLabel>
                <CFormInput
                  type="text"
                  id="headerTextOne"
                  name="headerTextOne"
                  value={formData.headerTextOne}
                  onChange={handleChange}
                  required
                />
                <CFormFeedback invalid>Please provide a valid Header Text Part 1.</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="headerTextTwo">Header Text Part 2</CFormLabel>
                <CFormInput
                  type="text"
                  id="headerTextTwo"
                  name="headerTextTwo"
                  value={formData.headerTextTwo}
                  onChange={handleChange}
                  required
                />
                <CFormFeedback invalid>Please provide a valid Header Text Part 2.</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="headerTextOneHindi">Header Text Part 1 (In Hindi)</CFormLabel>
                <CFormInput
                  type="text"
                  id="headerTextOneHindi"
                  name="headerTextOneHindi"
                  value={formData.headerTextOneHindi}
                  onChange={handleChange}
                  required
                />
                <CFormFeedback invalid>
                  Please provide a valid Header Text Part 1 Hindi.
                </CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="headerTextTwoHindi">Header Text Part 2 (In Hindi)</CFormLabel>
                <CFormInput
                  type="text"
                  id="headerTextTwoHindi"
                  name="headerTextTwoHindi"
                  value={formData.headerTextTwoHindi}
                  onChange={handleChange}
                  required
                />
                <CFormFeedback invalid>
                  Please provide a valid Header Text Part 2 Hindi.
                </CFormFeedback>
              </CCol>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  Submit Form
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      {/* <ChatBot /> */}
      {/* <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>List</strong>
          </CCardHeader>
          <CCardBody>
            <CSmartTable
              activePage={2}
              cleaner
              clickableRows
              columns={columns}
              columnFilter
              columnSorter
              // footer
              items={items}
              itemsPerPageSelect
              itemsPerPage={5}
              pagination
              onFilteredItemsChange={(items) => {
                console.log('onFilteredItemsChange')
                console.table(items)
              }}
              onSelectedItemsChange={(items) => {
                console.log('onSelectedItemsChange')
                console.table(items)
              }}
              scopedColumns={{
                
                status: (item) => (
                  <td>
                    <CBadge color={item.status === true ? 'success' : 'danger'}>{item.status === true ? 'Active' : 'InActive'}</CBadge>
                  </td>
                ),
                show_details: (item) => {
                  return (
                    <td className="py-2">
                      <CButton
                        color="primary"
                        variant="outline"
                        shape="square"
                        size="sm"
                        onClick={() => {
                          toggleDetails(item._id)
                        }}
                      >
                        {details.includes(item._id) ? 'Hide' : 'Show'}
                      </CButton>
                    </td>
                  )
                },
                details: (item) => {
                  return (
                    <CCollapse visible={details.includes(item._id)}>
                      <div className="p-3">
                        <h4>{item.name}</h4>
                        <p className="text-body-secondary">User since: {new Date(item.createdAt).toLocaleDateString('en-GB')}</p>
                        <p className="text-body-secondary">Address: {item.address}</p>
                        <CButton size="sm" color="danger" className="ms-1" onClick={() => {
                          SweetAlert.fire({
                            title: 'Are you sure?',
                            text: "You won't be able to revert this!",
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, delete it!',
                          }).then((result) => {
                            if (result.isConfirmed) {
                              axios.patch(`${endpoint}/update-status-caretakers/${item._id}`, {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              })
                                .then((response) => {
                                  if (response.status === 200) {
                                    SweetAlert.fire( {
                                      icon: 'success',
                                      title: 'Deleted!',
                                      text: 'Caretaker has been deleted.',
                                    })
                                    setAllCaretakers(allCaretakers.filter(caretaker => caretaker._id !== item._id))
                                  } else {
                                    SweetAlert.fire({
                                      icon: 'error',
                                      title: 'Error',
                                      text: 'Failed to delete caretaker. Please try again.',
                                    })
                                  }
                                })
                                .catch((error) => {
                                  console.error('Error deleting caretaker:', error.response?.data || error.message)
                                  SweetAlert.fire({
                                    icon: 'error',
                                    title: 'Error',
                                    text: 'Failed to delete caretaker. Please try again.',
                                  })
                                })
                            }
                          })
                        }}>
                          Delete
                        </CButton>
                      </div>
                    </CCollapse>
                  )
                },
              }}
              // selectable
              // sorterValue={{ column: 'status', state: 'asc' }}
              tableFilter
              tableProps={{
                className: 'add-this-custom-class',
                responsive: true,
                striped: true,
                hover: true,
              }}
              tableBodyProps={{
                className: 'align-middle',
              }}
            />
          </CCardBody>
        </CCard>
      </CCol> */}
    </CRow>
  )
}

export default AddHeaderOne
