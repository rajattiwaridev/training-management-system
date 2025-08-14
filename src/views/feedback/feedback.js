import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilStar, cilUser } from '@coreui/icons'
import axios from 'axios'
import SweetAlert from 'sweetalert2'

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          className="star-btn"
          onClick={() => setRating(value)}
          onMouseEnter={(e) => e.currentTarget.focus()}
        >
          <CIcon
            icon={cilStar}
            className={rating >= value ? 'text-warning' : 'text-muted'}
            size="xl"
          />
          {/* {value % 1 === 0 && (
            <span className="position-absolute top-100 start-50 translate-x-n50 mt-1 fs-xs">
              {value}
            </span>
          )} */}
        </button>
      ))}
    </div>
  )
}

const Feedback = () => {
  const endpoint = import.meta.env.VITE_BACKEND_API
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [username, setUsername] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [trainerRating, setTrainerRating] = useState(0)
  const [contentRating, setContentRating] = useState(0)
  const [suggestions, setSuggestions] = useState('')
  const [linkDetails, setLinkDetails] = useState(null)

  useEffect(() => {
    const fetchLinkStatus = async () => {
      if (!token) return

      try {
        const response = await axios.get(`${endpoint}/training/feedback-status?token=${token}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.status === 200) {
          setLinkDetails(response.data.status)
          if (response.data.status === true) {
            SweetAlert.fire(
              'Error',
              'Link is expired. Feedback already submitted for this training.',
              'error',
            ).then(() => {
              console.log('Redirecting to homepage...')
              window.location.href = 'https://cgtransport.gov.in/'
            })
          }
        } else {
          SweetAlert.fire('Error', response.data.msg, 'error')
        }
      } catch (error) {
        console.error('Error fetching training details:', error)
        SweetAlert.fire('Error', 'Failed to fetch training details.', 'error')
      }
    }

    fetchLinkStatus()
  }, [token])
  const handleNameChange = (e) => {
    const value = e.target.value
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setUsername(value)
    }
  }

  const handleNumberChange = (e) => {
    const value = e.target.value
    if (value === '' || /^[6-9][0-9]{0,9}$/.test(value)) {
      setPhoneNumber(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      alert('No training session specified')
      return
    }

    if (!trainerRating || !contentRating) {
      SweetAlert.fire('Error', 'Please rate both trainer and content', 'error')
      return
    }

    try {
      const response = await axios.post(
        `${endpoint}/training/feedback`,
        {
          token: token,
          trainerRating,
          contentRating,
          suggestions,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      if (response.status === 200) {
        SweetAlert.fire('Success', 'Feedback submitted successfully!', 'success')
        setUsername('')
        setPhoneNumber('')
        setTrainerRating(0)
        setContentRating(0)
        setSuggestions('')
        window.location.reload() // Reload to reset the form and state
      } else {
        SweetAlert.fire('Error', response.data.msg, 'error')
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error.response?.data?.message || 'Failed to submit feedback.')
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4" style={{ display: linkDetails ? 'none' : 'block' }}>
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Training Feedback</h1>

                  <div className="mb-4">
                    <label className="form-label d-block">Trainer Rating</label>
                    <StarRating rating={trainerRating} setRating={setTrainerRating} />
                    {/* <br/>
                    <div className="text-center mt-2 fw-medium">
                      {trainerRating > 0 ? trainerRating.toFixed(1) : '0'} / 5
                    </div> */}
                  </div>

                  <div className="mb-4">
                    <label className="form-label d-block">Training Content Rating</label>
                    <StarRating rating={contentRating} setRating={setContentRating} />
                    {/* <br/>
                    <div className="text-center mt-2 fw-medium">
                      {contentRating > 0 ? contentRating.toFixed(1) : '0'} / 5
                    </div> */}
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Your Suggestions</label>
                    <CFormTextarea
                      placeholder="Share your suggestions for improvement..."
                      rows={3}
                      value={suggestions}
                      onChange={(e) => setSuggestions(e.target.value)}
                    />
                  </div>

                  <div className="d-grid">
                    <CButton color="success" type="submit">
                      Submit Feedback
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

      <style>
        {`
          .star-rating {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          .star-btn {
            background: none;
            border: none;
            padding: 0.25rem;
            position: relative;
            cursor: pointer;
          }
          .star-btn:focus {
            outline: none;
          }
        `}
      </style>
    </div>
  )
}

export default Feedback
