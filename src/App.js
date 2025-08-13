import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import './scss/examples.scss';

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Attendance = React.lazy(() => import('./views/attendance/attendance'));
const Feedback = React.lazy(() => import('./views/feedback/feedback'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));

const AppRoutes = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem('authToken')
  );

  // Listen to authentication changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!sessionStorage.getItem('authToken'));
    };

    // Initial check
    handleStorageChange();
    
    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location]);

  return (
    <Suspense
      fallback={
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/500" element={<Page500 />} />
        
        {isAuthenticated ? (
          <>
            <Route path="/" element={<DefaultLayout />} />
            <Route path="/*" element={<DefaultLayout />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Login />} />
            <Route path="/*" element={<Page404 />} />
          </>
        )}
      </Routes>
    </Suspense>
  );
};

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      setColorMode(theme);
    }

    if (isColorModeSet()) {
      return;
    }

    setColorMode(storedTheme);
  }, []);

  return (
    <BrowserRouter basename="/training">
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;