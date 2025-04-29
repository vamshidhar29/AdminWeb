import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const ProtectedRoute = () => {
    const location = useLocation();

    const sessionTime = localStorage.getItem('SessionTime');
    const currentTime = new Date().getTime();

    if (!sessionTime) {
        Cookies.set('path', `${location.pathname}`, { expires: 5 / (24 * 60), path: '/' });
        return <Navigate to="/" state={'Please Login to activate your session'} replace />;

    } else if (currentTime >= parseInt(sessionTime, 10)) {
        Cookies.set('path', `${location.pathname}`, { expires: 5 / (24 * 60), path: '/' });
        localStorage.clear();
        return <Navigate to="/" state={'Youe session expired, Please Login again'} replace />;
    }
    //  else {
    //     const currentTime = new Date().getTime();
    //     const expirationTime = currentTime + 120 * 60 * 1000;
    //     localStorage.setItem('SessionTime', expirationTime);
    // }

    return <Outlet />;
};

export default ProtectedRoute;
