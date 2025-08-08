import React, { useEffect, useState, useRef, useMemo } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormFeedback,
  CFormLabel,
  CRow,
  CFormSelect,
} from '@coreui/react'
import { CButton, CSmartTable } from '@coreui/react-pro'
import axios from 'axios'
import SweetAlert from 'sweetalert2'

const AddDivision = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const token = sessionStorage.getItem('authToken')
  const [validated, setValidated] = useState(false)
  const [districtValidated, setDistrictValidated] = useState(false)
  const [formData, setFormData] = useState({
    state: '',
    divisionCode: '',
    name: '',
  })
  const [stateFormData, setStateFormData] = useState({
    stateName: '',
  })
  const [districtFormData, setDistrictFormData] = useState({
    division: '',
    sName: '',
    districtName: '',
    districtNameEng: '',
    LGDCode: 0,
  })
  const [stateeditMode, setStateEditMode] = useState(false)
  const [stateeditId, setStateEditId] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState(null)
  const [districtEditMode, setDistrictEditMode] = useState(false)
  const [districtEditId, setDistrictEditId] = useState(null)
  const [states, setStates] = useState([])
  const [divisions, setDivisions] = useState([])
  const [districts, setDistricts] = useState([])
  const [details, setDetails] = useState([])
  const districtFormRef = useRef(null)
  const divisionFormRef = useRef(null)
  const [expandedStates, setExpandedStates] = useState([])
  const [expandedDivisions, setExpandedDivisions] = useState([])
  const fetchStates = async () => {
    try {
      const response = await axios.get(`${endpoint}/states`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStates(response.data)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to fetch states', 'error')
    }
  }

  const fetchDivisions = async () => {
    try {
      const response = await axios.get(`${endpoint}/divisions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDivisions(response.data)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to fetch divisions', 'error')
    }
  }

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${endpoint}/districts`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDistricts(response.data)
    } catch (error) {
      SweetAlert.fire('Error', 'Failed to fetch districts', 'error')
    }
  }

  useEffect(() => {
    fetchDivisions()
    fetchDistricts()
    fetchStates()
  }, [])

  const stateData = useMemo(() => {
    return states.map((state) => {
      const stateDivisions = divisions.filter((div) => div.state === state._id)
      return {
        ...state,
        divisionCount: stateDivisions.length,
        divisions: stateDivisions.map((division) => {
          const divisionDistricts = districts.filter(
            (district) => district.division && district.division._id === division._id,
          )
          return {
            ...division,
            districtCount: divisionDistricts.length,
            districts: divisionDistricts,
          }
        }),
      }
    })
  }, [states, divisions, districts])
  // Toggle state expansion
  const toggleState = (id) => {
    setExpandedStates((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  // Toggle division expansion
  const toggleDivision = (id) => {
    setExpandedDivisions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }
  const handleStateChange = (e) => {
    const { name, value } = e.target
    setStateFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleDistrictChange = (e) => {
    const { name, value } = e.target
    setDistrictFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleStateSubmit = async (event) => {
    event.preventDefault()
    if (event.currentTarget.checkValidity() === false) {
      setValidated(true)
      return
    }
    setValidated(true)

    try {
      const url = stateeditMode ? `${endpoint}/states/${stateeditId}` : `${endpoint}/states`
      const method = stateeditMode ? 'put' : 'post'
      const response = await axios[method](url, stateFormData, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      if ([200, 201].includes(response.status)) {
        SweetAlert.fire(
          'Success',
          `State ${stateeditMode ? 'updated' : 'added'} successfully!`,
          'success',
        )
        fetchStates()
        setStateFormData({ stateName: '' })
        setStateEditMode(false)
        setValidated(false)
      } else {
        throw new Error()
      }
    } catch (err) {
      SweetAlert.fire('Error', 'Failed to save states.', 'error')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (event.currentTarget.checkValidity() === false) {
      setValidated(true)
      return
    }
    setValidated(true)

    try {
      const url = editMode ? `${endpoint}/divisions/${editId}` : `${endpoint}/divisions`
      const method = editMode ? 'put' : 'post'
      console.log(formData)
      const response = await axios[method](url, formData, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      if ([200, 201].includes(response.status)) {
        SweetAlert.fire(
          'Success',
          `Division ${editMode ? 'updated' : 'added'} successfully!`,
          'success',
        )
        fetchDivisions()
        setFormData({ divisionCode: '', name: '', state: '' })
        setEditMode(false)
        setValidated(false)
      } else {
        throw new Error()
      }
    } catch (err) {
      SweetAlert.fire('Error', 'Failed to save division.', 'error')
    }
  }

  const handleDistrictSubmit = async (event) => {
    event.preventDefault()
    if (event.currentTarget.checkValidity() === false) {
      setDistrictValidated(true)
      return
    }
    setDistrictValidated(true)

    try {
      const url = districtEditMode
        ? `${endpoint}/districts/${districtEditId}`
        : `${endpoint}/districts`
      const method = districtEditMode ? 'put' : 'post'
      const response = await axios[method](
        url,
        {
          ...districtFormData,
          division: districtFormData.division,
        },
        {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        },
      )
      if ([200, 201].includes(response.status)) {
        SweetAlert.fire(
          'Success',
          `District ${districtEditMode ? 'updated' : 'added'} successfully!`,
          'success',
        )
        fetchDistricts()
        setDistrictFormData({
          division: '',
          districtNameEng: '',
          districtName: '',
          LGDCode: '',
          sName: '',
        })
        setDistrictEditMode(false)
        setDistrictValidated(false)
      } else {
        throw new Error()
      }
    } catch (err) {
      SweetAlert.fire('Error', 'Failed to save district.', 'error')
    }
  }

  const handleStateEdit = (item) => {
    setStateEditMode(true)
    setStateEditId(item._id)
    setStateFormData({ stateName: item.stateName })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleEdit = (item) => {
    setEditMode(true)
    setEditId(item._id)
    setFormData({ divisionCode: item.divisionCode, name: item.name, state: item.state })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDistrictEdit = (item) => {
    setDistrictEditMode(true)
    setDistrictEditId(item._id)
    setDistrictFormData({
      division: item.division._id,
      sName: item.sName,
      districtName: item.districtName,
      districtNameEng: item.districtNameEng,
      LGDCode: item.LGDCode,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // if (districtFormRef.current) {
    //   districtFormRef.current.scrollIntoView({ top: 0,behavior: 'smooth', block: 'start' })
    // }
  }

  const toggleDetails = (id) => {
    setDetails((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const prepareDivisionData = () => {
    return divisions.map((division) => {
      const divisionDistricts = districts.filter(
        (district) => district.division && district.division._id === division._id,
      )
      return {
        ...division,
        _id: division._id,
        districtCount: divisionDistricts.length,
        districts: divisionDistricts,
      }
    })
  }

  return (
    <CRow>
      <CCol xs={6} ref={divisionFormRef}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>{stateeditMode ? 'Update' : 'Add'} State</strong>
          </CCardHeader>
          <CCardBody>
            <CForm
              className="row g-3 needs-validation"
              noValidate
              validated={validated}
              onSubmit={handleStateSubmit}
            >
              <CCol xs={12} className="d-flex align-items-end">
                <div className="me-3 flex-grow-1">
                  <CFormLabel htmlFor="stateName">State Name</CFormLabel>
                  <CFormInput
                    type="text"
                    id="stateName"
                    name="stateName"
                    value={stateFormData.stateName}
                    onChange={handleStateChange}
                    required
                  />
                  <CFormFeedback invalid>Provide a state name.</CFormFeedback>
                </div>

                <div>
                  <CButton color="primary" type="submit">
                    {stateeditMode ? 'Update' : 'Add'} State
                  </CButton>
                </div>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>

        <CCard className="mb-4">
          <CCardHeader>
            <strong>{editMode ? 'Update' : 'Add'} Division</strong>
          </CCardHeader>
          <CCardBody>
            <CForm
              className="row g-3 needs-validation"
              noValidate
              validated={validated}
              onSubmit={handleSubmit}
            >
              <CCol md={4}>
                <CFormLabel htmlFor="state">State</CFormLabel>
                <CFormSelect
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.stateName}
                    </option>
                  ))}
                </CFormSelect>
                <CFormFeedback invalid>Select a state.</CFormFeedback>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="divisionCode">Division Code</CFormLabel>
                <CFormInput
                  type="number"
                  id="divisionCode"
                  name="divisionCode"
                  value={formData.divisionCode}
                  onChange={handleChange}
                  required
                />
                <CFormFeedback invalid>Provide a valid code.</CFormFeedback>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="name">Division Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <CFormFeedback invalid>Provide a valid name.</CFormFeedback>
              </CCol>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  {editMode ? 'Update' : 'Add'} Division
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol xs={6}>
        <CCard className="mb-4" ref={districtFormRef}>
          <CCardHeader>
            <strong>{districtEditMode ? 'Update' : 'Add'} District</strong>
          </CCardHeader>
          <CCardBody>
            <CForm
              className="row g-3 needs-validation"
              noValidate
              validated={districtValidated}
              onSubmit={handleDistrictSubmit}
            >
              <CCol md={12}>
                <CFormLabel htmlFor="division">Division</CFormLabel>
                <CFormSelect
                  id="division"
                  name="division"
                  value={districtFormData.division}
                  onChange={handleDistrictChange}
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map((division) => (
                    <option key={division._id} value={division._id}>
                      {division.name}
                    </option>
                  ))}
                </CFormSelect>
                <CFormFeedback invalid>Select a division.</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="sName">Short Name</CFormLabel>
                <CFormInput
                  type="text"
                  id="sName"
                  name="sName"
                  value={districtFormData.sName}
                  onChange={handleDistrictChange}
                  required
                />
                <CFormFeedback invalid>Provide a Short Name.</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="districtNameEng">District Name (In English)</CFormLabel>
                <CFormInput
                  type="text"
                  id="districtNameEng"
                  name="districtNameEng"
                  value={districtFormData.districtNameEng}
                  onChange={handleDistrictChange}
                  required
                />
                <CFormFeedback invalid>Provide a valid name.</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="districtName">District Name (In Hindi)</CFormLabel>
                <CFormInput
                  type="text"
                  id="districtName"
                  name="districtName"
                  value={districtFormData.districtName}
                  onChange={handleDistrictChange}
                  required
                />
                <CFormFeedback invalid>Provide a valid name in hindi.</CFormFeedback>
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="LGDCode">LGD Code</CFormLabel>
                <CFormInput
                  type="number"
                  id="LGDCode"
                  name="LGDCode"
                  value={districtFormData.LGDCode}
                  onChange={handleDistrictChange}
                  required
                />
                <CFormFeedback invalid>Provide a valid LGD Code.</CFormFeedback>
              </CCol>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  {districtEditMode ? 'Update' : 'Add'} District
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>

      {/* <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Divisions List</strong>
          </CCardHeader>
          <CCardBody>
            <CSmartTable
              columns={[
                { key: 'divisionCode', label: 'Code', filter: false },
                { key: 'name', label: 'Division Name' },
                { key: 'districtCount', label: 'Districts Count', filter: false },
                {
                  key: 'show_details',
                  label: 'Actions',
                  sorter: false,
                  filter: false,
                },
              ]}
              items={prepareDivisionData()}
              columnFilter
              columnSorter
              pagination
              itemsPerPage={5}
              itemsPerPageSelect
              scopedColumns={{
                show_details: (item) => (
                  <td className="py-2">
                    <CButton size="sm" color="warning" onClick={() => handleEdit(item)}>
                      Edit
                    </CButton>{' '}
                    <CButton size="sm" color="primary" onClick={() => toggleDetails(item._id)}>
                      {details.includes(item._id) ? 'Hide Districts' : 'Show Districts'}
                    </CButton>
                  </td>
                ),
                details: (item) => (
                  <td>
                    {details.includes(item._id) && (
                      <div className="p-3">
                        <h5>Districts in {item.name}</h5>
                        <CSmartTable
                          items={item.districts}
                          columns={[
                            { key: 'sName', label: 'Short Name' },
                            { key: 'LGDCode', label: 'LGD Code' },
                            { key: 'districtNameEng', label: 'District Name (English)' },
                            { key: 'districtName', label: 'District Name (Hindi)' },
                            {
                              key: 'actions',
                              label: 'Actions',
                              sorter: false,
                              filter: false,
                            },
                          ]}
                          scopedColumns={{
                            actions: (district) => (
                              <td className="py-2">
                                <CButton
                                  size="sm"
                                  color="warning"
                                  onClick={() => handleDistrictEdit(district)}
                                >
                                  Edit
                                </CButton>
                              </td>
                            ),
                          }}
                          tableProps={{
                            striped: true,
                            hover: true,
                            responsive: true,
                          }}
                          tableBodyProps={{ className: 'align-middle' }}
                          pagination={item.districts.length > 5}
                          itemsPerPage={5}
                        />
                      </div>
                    )}
                  </td>
                ),
              }}
              tableProps={{
                striped: true,
                hover: true,
                responsive: true,
              }}
              tableBodyProps={{ className: 'align-middle' }}
              activePage={1}
            />
          </CCardBody>
        </CCard>
      </CCol> */}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>All List</strong>
          </CCardHeader>
          <CCardBody>
            <CSmartTable
              columns={[
                { key: 'stateName', label: 'State Name' },
                { key: 'divisionCount', label: 'Divisions Count', filter: false },
                {
                  key: 'show_details',
                  label: 'Actions',
                  sorter: false,
                  filter: false,
                },
              ]}
              items={stateData}
              columnFilter
              columnSorter
              pagination
              itemsPerPage={10}
              itemsPerPageSelect
              scopedColumns={{
                show_details: (item) => (
                  <td className="py-2">
                    <CButton size="sm" color="warning" onClick={() => handleStateEdit(item)}>
                      Edit
                    </CButton>{' '}
                    <CButton size="sm" color="primary" onClick={() => toggleState(item._id)}>
                      {expandedStates.includes(item._id) ? 'Hide Divisions' : 'Show Divisions'}
                    </CButton>
                  </td>
                ),
                details: (item) => (
                  <td>
                    {expandedStates.includes(item._id) && (
                      <div className="p-3">
                        <h5 className="mb-3">Divisions in {item.stateName}</h5>
                        <CSmartTable
                          items={item.divisions}
                          columns={[
                            { key: 'divisionCode', label: 'Division Code' },
                            { key: 'name', label: 'Division Name' },
                            { key: 'districtCount', label: 'Districts Count' },
                            {
                              key: 'show_districts',
                              label: 'Actions',
                              sorter: false,
                              filter: false,
                            },
                          ]}
                          scopedColumns={{
                            show_districts: (division) => (
                              <td className="py-2">
                                <CButton
                                  size="sm"
                                  color="warning"
                                  onClick={() => handleEdit(division)}
                                >
                                  Edit
                                </CButton>{' '}
                                <CButton
                                  size="sm"
                                  color="primary"
                                  onClick={() => toggleDivision(division._id)}
                                >
                                  {expandedDivisions.includes(division._id)
                                    ? 'Hide Districts'
                                    : 'Show Districts'}
                                </CButton>
                              </td>
                            ),
                            details: (division) => (
                              <td>
                                {expandedDivisions.includes(division._id) && (
                                  <div className="p-3">
                                    <h6 className="mb-3">Districts in {division.name}</h6>
                                    <CSmartTable
                                      items={division.districts}
                                      columns={[
                                        { key: 'sName', label: 'Short Name' },
                                        {
                                          key: 'districtNameEng',
                                          label: 'District Name (English)',
                                        },
                                        { key: 'districtName', label: 'District Name (Hindi)' },
                                        { key: 'LGDCode', label: 'LGD Code' },
                                        {
                                          key: 'actions',
                                          label: 'Actions',
                                          sorter: false,
                                          filter: false,
                                        },
                                      ]}
                                      scopedColumns={{
                                        actions: (district) => (
                                          <td className="py-2">
                                            <CButton
                                              size="sm"
                                              color="warning"
                                              onClick={() => handleDistrictEdit(district)}
                                            >
                                              Edit
                                            </CButton>
                                          </td>
                                        ),
                                      }}
                                      tableProps={{
                                        striped: true,
                                        responsive: true,
                                      }}
                                      pagination={division.districts.length > 5}
                                      itemsPerPage={5}
                                    />
                                  </div>
                                )}
                              </td>
                            ),
                          }}
                          tableProps={{
                            striped: true,
                            responsive: true,
                          }}
                          pagination={item.divisions.length > 5}
                          itemsPerPage={5}
                        />
                      </div>
                    )}
                  </td>
                ),
              }}
              tableProps={{
                striped: true,
                hover: true,
                responsive: true,
              }}
              tableBodyProps={{ className: 'align-middle' }}
              activePage={1}
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddDivision
