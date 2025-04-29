import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from 'js-cookie';
import { fetchData } from "../helpers/externapi";

const Login = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [empId, setEmpId] = useState('');
    const [password, setPassword] = useState('');
    const [empIdError, setEmpIdError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isLoginError, setIsLoginError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dashboardIds, setDashboardIds] = useState([]);
    const [userRoles, setUserRoles] = useState(['Admin', 'Admin/Secretery', 'Director', 'Super Admin', 'Head Office']);

    const navigate = useNavigate();
    const location = useLocation();
    const sessionTime = localStorage.getItem('SessionTime');
    const currentTime = new Date().getTime();
    const cookieValue = Cookies.get('path');
    const message = location.state || '';

    useEffect(() => {
        fetchUserRoles();
    }, []);

    const fetchUserRoles = async () => {
        try {
            const getUserRoles = await fetchData("UserRoles/all", { skip: 0, take: 0 });

            if (getUserRoles && getUserRoles.length > 0) {
                let ids = getUserRoles
                    .filter(role => userRoles.includes(role.RoleType))
                    .map(role => role.UserRoleId);

                setDashboardIds(ids);
            }
        } catch (e) {
            console.error('Error fetching UserRoles/all: ', e);
        }
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const onChangeInput = (e) => {
        if (e.target.name === 'empId') {
            const value = e.target.value;
            setEmpId(value);
            setEmpIdError(value.trim().length === 0);
        } else {
            const value = e.target.value;
            setPassword(value);
            setPasswordError(value.trim().length === 0);
        }
    };

    const onSubmitLogin = async (e) => {
        e.preventDefault();
        setEmpIdError(false);
        setPasswordError(false);
        setIsLoginError(false);
        setLoginError('');

        let hasError = false;

        if (empId.trim().length === 0) {
            setEmpIdError(true);
            hasError = true;
        }

        if (password.trim().length === 0) {
            setPasswordError(true);
            hasError = true;
        }
        if (hasError) {
            return;
        }
        setLoading(true);

        try {
            const loginResponse = await fetchData("lambdaAPI/Employee/adminloginm", {
                userName: empId,
                password: password
            });

            if (loginResponse && loginResponse.status) {
                const currentTime = new Date().getTime();
                const expirationTime = currentTime + 24 * 60 * 60 * 1000;

                localStorage.setItem('UserId', loginResponse.data[0].UserId);
                localStorage.setItem('UserName', loginResponse.data[0].UserName);
                localStorage.setItem('UserRoleId', loginResponse.data[0].UserRoleId);
                localStorage.setItem('SessionTime', expirationTime);
                localStorage.setItem('UserImage', loginResponse.data[0].UserImage);
                localStorage.setItem('token', loginResponse.token);                

                if (cookieValue && cookieValue.length > 0) {
                    navigate(`${cookieValue}`);
                } else if (dashboardIds && dashboardIds.includes(loginResponse.data[0].UserRoleId)) {
                    navigate(`/dashboard`);
                } else {
                    navigate(`/advisor/list`);
                }
            } else {
                setIsLoginError(true);
                setLoginError(loginResponse.message || 'Login failed. Please check your credentials.');
                localStorage.clear();
            }
        } catch (error) {
            setIsLoginError(true);
            setLoginError(`Incorrect password. Please reset your password using the 'Forgot Password' link.`);
            console.error('Login error:', error);
        
        
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="container-xxl">
            <div className="authentication-wrapper authentication-basic container-p-y">
                <div className="authentication-inner">
                    {loading ? (
                        <div className='d-flex flex-row justify-content-center pt-5'>
                            <div class="spinner-border text-info" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="card">
                            <div className="card-body">
                                {/* Logo */}
                                <div className="app-brand justify-content-center">
                                    <a className="app-brand-link gap-2">
                                        <span className="app-brand-logo demo">
                                            <img src={`${process.env.PUBLIC_URL}/assets/applogo.png`} height="50" />
                                        </span>
                                        <span className="app-brand-text demo text-body fw-bolder">OHOINDIA</span>
                                    </a>
                                </div>
                                {message && message.length > 0 && (
                                    <p className="text-danger text-center mb-4 fw-bolder">{message}</p>
                                )}
                                <div className="app-brand justify-content-center" style={{ marginBottom: 0, marginTop: -20 }} >
                                    <h4 className="mb-2 center">LOGIN</h4>
                                </div>
                                <div className="app-brand justify-content-center" style={{ marginBottom: '5px' }} >
                                    <p className="mb-4">Please sign-in to your account</p>
                                </div>

                                {isLoginError && (
                                    <span style={{ color: 'red' }} >{loginError}</span>
                                )}
                                <form className="mb-3 fv-plugins-bootstrap5 fv-plugins-framework"
                                    noValidate="novalidate"
                                    onSubmit={(e) => onSubmitLogin(e)}
                                >
                                    <div className="mb-3 fv-plugins-icon-container d-flex flex-column justify-content-start align-items-start">
                                        <label htmlFor="empId" className="form-label">Employee id or User name
                                            <span className="required" style={{ color: 'red' }} > *</span>
                                        </label>

                                        <input type="text" className="form-control" id="empId" name="empId"
                                            placeholder="Enter your Employee Id or username"
                                            onChange={(e) => onChangeInput(e)}
                                            value={empId}
                                            autoFocus=""
                                            maxLength="50"
                                        />
                                        {empIdError && (
                                            <div id="empIdError" className="fv-plugins-message-container invalid-feedback">
                                                <span>Employee Id or User Name is required *</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3 form-password-toggle fv-plugins-icon-container">
                                        <div className="d-flex justify-content-between">
                                            <label className="form-label" htmlFor="password">Password
                                                <span className="required" style={{ color: 'red' }} > *</span>
                                            </label>
                                        </div>
                                        <div className="input-group input-group-merge has-validation">
                                            <input type={isPasswordVisible ? 'text' : 'password'} id="password"
                                                className="form-control" name="password"
                                                placeholder="**********" aria-describedby="password"
                                                maxLength="20" minLength="4"
                                                onChange={(e) => onChangeInput(e)}
                                                value={password}
                                            />
                                            <span className="input-group-text cursor-pointer" onClick={togglePasswordVisibility}>
                                                <i id="togglePasswordVisibility" className={`bx ${isPasswordVisible ? 'bx-show' : 'bx-hide'}`}></i>
                                            </span>
                                        </div>
                                        {passwordError && (
                                            <div id="passwordError" className="fv-plugins-message-container invalid-feedback">
                                                <span>Password is required *</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <div className="form-check d-flex flex-row justify-content-start">
                                            <input className="form-check-input" type="checkbox" id="remember-me" />
                                            <label className="form-check-label ms-2" htmlFor="remember-me" >
                                                Remember Me
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <button className="btn btn-primary d-grid w-100"
                                            style={{ backgroundColor: '#0E94C3', minHeight: '40px' }}
                                            type="submit" disabled={loading}
                                        >
                                            {loading ? (
                                                <div class="spinner-border text-white" role="status">
                                                    <span class="sr-only">Loading...</span>
                                                </div>
                                            ) : 'Sign in'}
                                        </button>
                                    </div>
                                    <input type="hidden" />
                                </form>

                                <p className="text-center">
                                    <span>New on our platform?</span>
                                    <a href="https://ohoindialife.com/" target="_blank">
                                        <span>Please contact to contact@ohoindialife.com</span>
                                    </a>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};

export default Login;