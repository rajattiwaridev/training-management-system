import React, { useState } from 'react'
import axios from 'axios'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilPhone } from '@coreui/icons'
import logo from 'src/assets/images/cg-transport.png'
import { useNavigate } from 'react-router-dom'
/*function getBrowserInfo() {
  const userAgent = navigator.userAgent
  let browserName = 'Unknown'
  let fullVersion = 'Unknown'
  let os = 'Unknown'

  // Browser detection
  if (/chrome|crios|crmo/i.test(userAgent) && !/edg/i.test(userAgent)) {
    browserName = 'Chrome'
    fullVersion = userAgent.match(/Chrome\/([\d.]+)/)?.[1] ?? 'Unknown'
  } else if (/firefox|fxios/i.test(userAgent)) {
    browserName = 'Firefox'
    fullVersion = userAgent.match(/Firefox\/([\d.]+)/)?.[1] ?? 'Unknown'
  } else if (/safari/i.test(userAgent) && !/chrome|crios|crmo/i.test(userAgent)) {
    browserName = 'Safari'
    fullVersion = userAgent.match(/Version\/([\d.]+)/)?.[1] ?? 'Unknown'
  } else if (/edg/i.test(userAgent)) {
    browserName = 'Edge'
    fullVersion = userAgent.match(/Edg\/([\d.]+)/)?.[1] ?? 'Unknown'
  } else if (/msie|trident/i.test(userAgent)) {
    browserName = 'Internet Explorer'
    fullVersion = userAgent.match(/(MSIE |rv:)([\d.]+)/)?.[2] ?? 'Unknown'
  }

  // OS detection
  if (/windows nt 10/i.test(userAgent)) os = 'Windows 10'
  else if (/windows nt 6.3/i.test(userAgent)) os = 'Windows 8.1'
  else if (/windows nt 6.2/i.test(userAgent)) os = 'Windows 8'
  else if (/windows nt 6.1/i.test(userAgent)) os = 'Windows 7'
  else if (/macintosh|mac os x/i.test(userAgent)) os = 'macOS'
  else if (/android/i.test(userAgent)) os = 'Android'
  else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS'
  else if (/linux/i.test(userAgent)) os = 'Linux'

  return {
    name: browserName,
    version: fullVersion,
    userAgent: userAgent,
    os: os,
  }
}
function detectIncognitoMode() {
  return new Promise((resolve) => {
    const fs = window.RequestFileSystem || window.webkitRequestFileSystem

    if (!fs) {
      // Safari uses private mode differently
      const isSafariPrivate = () => {
        try {
          window.openDatabase(null, null, null, null)
          return false
        } catch (e) {
          return true
        }
      }
      resolve(isSafariPrivate())
      return
    }

    fs(
      window.TEMPORARY,
      100,
      () => resolve(false),
      () => resolve(true),
    )
  })
}*/

const Login = () => {
  const navigate = useNavigate();
  // (async () => {
  //   const browserInfo = getBrowserInfo()
  //   const isIncognito = await detectIncognitoMode()

  //   const fullInfo = {
  //     ...browserInfo,
  //     incognito: isIncognito ? 'Yes' : 'No',
  //   }

  //   console.log(fullInfo)

  //   // You can now send `fullInfo` to your backend login log
  // })()
  const endpoint = import.meta.env.VITE_BACKEND_API
  const [loginType, setLoginType] = useState('regular') // 'regular' or 'employee'
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors = {}

    if (loginType === 'regular') {
      if (!formData.email) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid'
      }
    } else {
      if (!formData.mobile) {
        newErrors.mobile = 'Mobile number is required'
      } else if (!/^[6789]\d{9}$/.test(formData.mobile)) {
        newErrors.mobile = 'Enter a valid 10-digit mobile number'
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const switchToEmployeeLogin = () => {
    setLoginType('employee')
    setFormData({
      email: '',
      mobile: '',
      password: '',
    })
    setErrors({})
  }

  const switchToRegularLogin = () => {
    setLoginType('regular')
    setFormData({
      email: '',
      mobile: '',
      password: '',
    })
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const loginData =
        loginType === 'regular'
          ? { email: formData.email, password: formData.password }
          : { mobile: formData.mobile, password: formData.password }
      const endpointPath = loginType === 'regular' ? '/login' : '/employee-login'
      const response = await axios.post(`${endpoint}${endpointPath}`, loginData)
      if (response.status === 200) {
        const { token, user, role, state, id } = response.data
        const identifier = typeof user === 'object' ? user.user : user
        sessionStorage.setItem('authToken', token)
        sessionStorage.setItem('user', identifier)
        sessionStorage.setItem('role', role)
        sessionStorage.setItem('loginType', loginType)
        sessionStorage.setItem('id', id)
        if (state) {
          sessionStorage.setItem('stateName', state.name || state.stateName)
          sessionStorage.setItem('stateId', state.id || state._id)
        } else {
          // For SUPERADMIN or users without state
          sessionStorage.removeItem('stateName')
          sessionStorage.removeItem('stateId')
        }

        navigate('/dashboard');
      } else {
        console.warn('Unexpected response status:', response.status)
      }
    } catch (error) {
      console.error('Error logging in:', error.response?.data || error.message)
      alert(error.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={5}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <div className="text-center mb-4">
                      <h1>Welcome</h1>
                      <img src={logo} style={{ width: '50%', height: '20%' }} />
                      <br />
                      <br />
                    </div>

                    {loginType === 'regular' ? (
                      <>
                        <CInputGroup className="mb-3">
                          <CInputGroupText>
                            <CIcon icon={cilUser} />
                          </CInputGroupText>
                          <CFormInput
                            placeholder="Email"
                            type="text"
                            name="email"
                            autoComplete="username"
                            value={formData.email}
                            onChange={handleChange}
                            invalid={!!errors.email}
                          />
                          {errors.email && <div className="text-danger small">{errors.email}</div>}
                        </CInputGroup>
                      </>
                    ) : (
                      <>
                        <CInputGroup className="mb-3">
                          <CInputGroupText>
                            <CIcon icon={cilPhone} />
                          </CInputGroupText>
                          <CFormInput
                            placeholder="Mobile Number"
                            type="tel"
                            name="mobile"
                            autoComplete="tel"
                            value={formData.mobile}
                            onChange={handleChange}
                            invalid={!!errors.mobile}
                          />
                          {errors.mobile && (
                            <div className="text-danger small">{errors.mobile}</div>
                          )}
                        </CInputGroup>
                      </>
                    )}

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        name="password"
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        invalid={!!errors.password}
                      />
                      {errors.password && (
                        <div className="text-danger small">{errors.password}</div>
                      )}
                    </CInputGroup>
                    <CRow className="align-items-center">
                      <CCol xs={6}>
                        <CButton
                          color={loginType === 'regular' ? 'primary' : 'success'}
                          className="px-4 me-2"
                          type="submit"
                          disabled={loading}
                        >
                          {loading
                            ? 'Logging in...'
                            : loginType === 'regular'
                              ? 'Login'
                              : 'Employee Login'}
                        </CButton>
                        {loginType === 'regular' ? (
                          <CButton
                            color="link"
                            size="sm"
                            onClick={switchToEmployeeLogin}
                            className="ps-0"
                          >
                            Login as Employee
                          </CButton>
                        ) : (
                          <CButton color="link" size="sm" onClick={switchToRegularLogin}>
                            Login with Email
                          </CButton>
                        )}
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
