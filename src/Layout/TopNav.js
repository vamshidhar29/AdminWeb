import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { fetchData } from '../helpers/externapi';
import { useDispatch } from 'react-redux';
import { clearMenus } from '../Commoncomponents/ReduxSlice';

const TopNav = () => {
    const [dateTime, setDateTime] = useState('');
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [logo, setLogo] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userName = localStorage.getItem('UserName');
    const UserImage = localStorage.getItem("UserImage");

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            const today = new Date();
            const date = today.getDate() + '-' + monthNames[today.getMonth()].substring(0, 3) + '-' + today.getFullYear();
            const time = formatAMPM(today);
            setDateTime(`${date}   ${time}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    function formatAMPM(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedHours = hours < 10 ? '0' + hours : hours;
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return `${formattedHours}:${formattedMinutes}:${seconds} ${ampm}`;
    };

    const navigateToProfile = () => {
        window.location.href = '/distributor/userprofile';
    };

    const handleLogout = () => {
        localStorage.clear();
        Cookies.remove('path');
        dispatch(clearMenus());
        navigate('/');
        
    };

    useEffect(() => {
        const getPAUrl = async () => {
            const response = await fetchData("ConfigValues/all", {
                skip: 0,
                take: 0,
            });

            const frontimage =
                response &&
                response.length > 0 &&
                response.find((val) => val.ConfigKey === "LogoWithoutName");
            setLogo(frontimage.ConfigValue);
        };

        getPAUrl();
    }, []);

    return (
        <nav className="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme" id="layout-navbar" style={{ zIndex: 10 }}>
            <div className="navbar-brand app-brand demo d-none d-xl-flex py-0 me-4">
                <div className="app-brand-link gap-2">
                    <span className="app-brand-logo demo">
                    <img src={logo} height="50" alt="App Logo" />
                    </span>
                    <span className="app-brand-text demo menu-text" style={{ color: '#0094c6' }}>OHOINDIA</span>
                </div>
                <div className="layout-menu-toggle menu-link text-large ms-auto d-xl-none">
                    <i className="bx bx-chevron-left bx-sm align-middle"></i>
                </div>
            </div>

            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0  d-xl-none  ">
                <a className="nav-item nav-link px-0 me-xl-4">
                    <i className="bx bx-menu bx-sm"></i>
                </a>
            </div>

            <div className="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
                <ul className="navbar-nav flex-row align-items-center ms-auto">
                    <li className="nav-item me-2 me-xl-0">
                        <a className="nav-link">
                            <div className="flex-grow-1">
                                <span className="fw-semibold d-block" id="topnav-datetime">{dateTime}</span>
                            </div>
                        </a>
                    </li>

                    <li className={`nav-item navbar-dropdown dropdown-user dropdown ${isDropdownOpen ? 'show' : ''}`}>
                        <a className="nav-link dropdown-toggle hide-arrow" onMouseEnter={() => setDropdownOpen(true)}
                            onMouseLeave={() => setDropdownOpen(false)} title="My-Profile"
                        >
                            <div className="avatar avatar-online">
                                <img src={UserImage ? `https://storingdocuments.s3.ap-south-1.amazonaws.com/${UserImage}` : "../../assets/img/dummy-avatar.jpg"} className="w-px-40 h-auto rounded-circle" />
                            </div>
                        </a>
                        {isDropdownOpen && (
                            <ul className="dropdown-menu show" style={{
                                position: 'absolute',
                                top: '100%', right: '0', left: 'auto', maxWidth: '220px'
                            }}
                                onMouseEnter={() => setDropdownOpen(true)} onMouseLeave={() => setDropdownOpen(false)}
                            >
                                <li>
                                    <a className="dropdown-item" onClick={navigateToProfile}>
                                        <div className="d-flex flex-row align-items-center">
                                            <div className="flex-shrink-0 me-2">
                                                <div className="avatar avatar-online">
                                                    <img src={UserImage ? `https://storingdocuments.s3.ap-south-1.amazonaws.com/${UserImage}` : "../../assets/img/dummy-avatar.jpg"} className="w-px-40 h-auto rounded-circle" />
                                                </div>
                                            </div>
                                            <div className="flex-grow-1">
                                                <span className="fw-semibold d-block">{userName}</span>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                                <li>
                                    <div className="dropdown-divider"></div>
                                </li>
                                <li>
                                    <a className="dropdown-item" onClick={navigateToProfile}>
                                        <i className="bx bx-user me-2"></i>
                                        <span className="align-middle">My Profile</span>
                                    </a>
                                </li>
                                <li>
                                    <div className="dropdown-divider"></div>
                                </li>
                                <li>
                                    <a className="dropdown-item" onClick={handleLogout}>
                                        <i className="bx bx-power-off me-2"></i>
                                        <span className="align-middle">Log Out</span>
                                    </a>
                                </li>
                            </ul>
                        )}
                    </li>

                    <li className="nav-item ms-2 me-2 me-xl-0 p-2" style={{ borderRadius: '50px', width: '30px', height: '33px' }}>
                        <a href="https://ohoindia-mous.s3.ap-south-1.amazonaws.com/Document.pdf" target="_blank" download title="Help-document">
                            <i className="fa fa-circle-info" style={{ color: 'dodgerblue', margin: '-5px', fontSize: '30px', alignItems: 'center' }}></i>
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default TopNav;
