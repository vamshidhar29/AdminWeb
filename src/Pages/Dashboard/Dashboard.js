/* eslint-disable react/jsx-no-undef */
import React, { useState, useEffect } from 'react';
import 'regenerator-runtime/runtime';
import { fetchAllData, fetchData } from '../../helpers/externapi';
import CircularProgress from '@mui/material/CircularProgress';
import Flatpickr from 'react-flatpickr';
import MapBoxHospital from '../../Components/MapBoxHospital';
import Layout from '../../Layout/Layout';
import { Link } from 'react-router-dom';
import { formatDate1 } from '../../Commoncomponents/CommonComponents';
import FilterCommonComponents from '../../Commoncomponents/FilterCommonComponents';
import MyOrganisation from '../../Commoncomponents/MyOrganisation';
import MyOrganisationCanvas from '../../Commoncomponents/MyOrganisationCanvas';
import DashboardCharts from './DashboardCharts';

export default function Dashboard() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const [progressData, setProgressData] = useState({});
    const [filteredProgressData, setFilteredProgressData] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startDate, setStartDate] = useState([]);
    const [filterOption, setFilterOption] = useState('Select Day');
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [hospitals, setHospitals] = useState({});
    const [distributerData, setDistributerData] = useState();
    const [rmData, setRmData] = useState();
    const [showAll, setShowAll] = useState(false);
    const [showsAll, setShowsAll] = useState(false);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedWeekOption, setSelectedWeekOption] = useState('This Week');
    const [selectedDayOption, setSelectedDayOption] = useState('Today');
    const [CardLoading, setCardLoading] = useState(true);
    const visibleDistributers = distributerData && distributerData.length > 0
        ? (showAll ? distributerData : distributerData.slice(0, 3))
        : [];
    const visibleRMs = rmData && rmData.length > 0
        ? (showsAll ? rmData : rmData.slice(0, 3))
        : [];
    const [displayDates, setDisplayDates] = useState({ startDate: "", endDate: "" });

    useEffect(() => {
        const getProgressData = async () => {
            try {
                setLoading(true);
                const progressDataResponse = await fetchAllData('lambdaAPI/Customer/ProgressTillNow');
                setProgressData(progressDataResponse[0]);
                handleFilterChange('Select Day');
            } catch (error) {
                console.error('Error fetching progress data:', error);
            }
            setLoading(false);
        };

        const getHospitalsData = async () => {
            try {
                setLoading(true);
                const hospitalsDataResponse = await fetchData('Hospital/all', { 'skip': 0, 'take': 0 });
                setHospitals(hospitalsDataResponse);
            } catch (error) {
                console.error("Error fetching hospitals data:", error);
            }
            setLoading(false);
        };

        getHospitalsData();
        getProgressData();
    }, []);

    useEffect(() => {
        if (filterOption === "Select Year") {
            handleFilterChange("Select Year");
        }
    }, [selectedYear]);

    useEffect(() => {
        if (filterOption === "Select Month") {
            handleFilterChange("Select Month");
        }
    }, [selectedMonth])

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDate(new Date());
        }, 86400000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const getDistributerAndRmCount = async () => {
            const getDistributerCount = await fetchAllData('Member/GetDistributerCount');
            setDistributerData(getDistributerCount);

            const getRmCount = await fetchAllData('Users/getRMCount');
            setRmData(getRmCount);
        };

        getDistributerAndRmCount();
    }, []);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    };

    const formatAmount = (amount) => {
        if (amount === null || undefined) {
            return `₹ 0`;
        } else {
            return `₹ ${amount}`;
        }
    };

    const filterLabels = {
        DistributorCount: 'Advisors',
        MemberCount: 'Customers',
        HospitalCount: 'Network Hospitals',
        //TotalPremiumAmount: 'Premium cards amount',
        TotalPrivilegeAmount: 'Cards Amount',
        //TotalPriorityAmount: 'Priority cards amount',
        OHOCardsPremiumCount: 'Cards Count',
        // OHOCardsPrivilegeCount: 'Sales: Privilege cards  ',
        ServedCustomers: 'Customers Served'
    };

    const progressLabels = {
        FamiliesCovered: 'Families Covered',
        FamilyMembersCovered: 'Family Members Covered',
        NetworkHospitals: 'Network Hospitals',
        TotalSales: 'Total Sales',
        CustomersServed: 'Customers Served',
        HealthCampStats: 'Health Camps Conducted/Scheduled'
    };

    const icons = {
        FamiliesCovered: <i className="fa-solid fa-users"></i>,
        FamilyMembersCovered: <i className="fa-solid fa-user"></i>,
        NetworkHospitals: <i className="fa-regular fa-hospital"></i>,
        TotalPremiumAmount: <i className="fa-solid fa-money-bill-wave"></i>,
        TotalSales: <i className="fa-solid fa-money-bill-wave"></i>,
        TotalPriorityAmount: <i className="fa-solid fa-money-bill-wave"></i>,
        CustomersServed: <i className="fa-solid fa-id-card"></i>,
        OHOCardsPrivilegeCount: <i className="fa-solid fa-id-card"></i>,
        OHOCardsCount: <i className="fa-solid fa-money-bill-wave"></i>,
        HealthCampStats: <i className="fa-solid fa-users"></i>
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ];

    const generateYears = () => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 11 }, (_, i) => currentYear - 10 + i).filter(year => year <= currentYear);
    };

    const getMondayToSundayRange = (weeksAgo = 0) => {
        const now = new Date();
        const currentDay = now.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - distanceToMonday - (weeksAgo * 7));

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return { startOfWeek, endOfWeek };
    };

    const handleWeekOptionChange = (value) => {
        setCardLoading(true);
        setSelectedWeekOption(value);
        handleFilterChange('Select Week', value, undefined);
        setCardLoading(false);
    };

    const handleDayOptionChange = (value) => {
        setCardLoading(true);
        setSelectedDayOption(value);
        handleFilterChange('Select Day', undefined, value);
        setCardLoading(false);
    };

    const handleFilterChange = async (option, weekOption = 'This Week', dayOption = 'Today') => {
        setFilterOption(option);
        setCardLoading(true);
        let newStartDate = new Date();
        let newEndDate = new Date();

        if (option === "Select Day") {
            if (dayOption === 'Today') {
                newStartDate = newEndDate = new Date();
            } else if (dayOption === 'Yesterday') {
                newStartDate.setDate(newStartDate.getDate() - 1);
                newEndDate.setDate(newEndDate.getDate() - 1);
            } else if (dayOption === 'Last 7 days') {
                newStartDate.setDate(newStartDate.getDate() - 6);
            } else if (dayOption === 'Last 30 days') {
                newStartDate.setDate(newStartDate.getDate() - 30);
            } else if (dayOption === 'Last 14 days') {
                newStartDate.setDate(newStartDate.getDate() - 14);
            }
        } else if (option === "Last 3 months") {
            newStartDate.setMonth(newStartDate.getMonth() - 3);
        } else if (option === "Last 6 months") {
            newStartDate.setMonth(newStartDate.getMonth() - 6);
        } else if (option === "Last Year") {
            newStartDate.setFullYear(newStartDate.getFullYear() - 1);
        } else if (option === "Select Month") {
            newStartDate = new Date(new Date().getFullYear(), selectedMonth, 1);
            newEndDate = new Date(new Date().getFullYear(), selectedMonth + 1, 0);
        } else if (option === "Select Year") {
            newStartDate = new Date(selectedYear, 0, 1);
            newEndDate = new Date(selectedYear, 11, 31);
        } else if (option === "Select Week") {
            if (weekOption === 'This Week') {
                const { startOfWeek, endOfWeek } = getMondayToSundayRange(0);
                newStartDate = startOfWeek;
                newEndDate = endOfWeek;
            } else if (weekOption === 'Last Week') {
                const { startOfWeek, endOfWeek } = getMondayToSundayRange(1);
                newStartDate = startOfWeek;
                newEndDate = endOfWeek;
            } else if (weekOption === '2nd Week') {
                const { startOfWeek, endOfWeek } = getMondayToSundayRange(2);
                newStartDate = startOfWeek;
                newEndDate = endOfWeek;
            } else if (weekOption === '3rd Week') {
                const { startOfWeek, endOfWeek } = getMondayToSundayRange(3);
                newStartDate = startOfWeek;
                newEndDate = endOfWeek;
            } else if (weekOption === '4th Week') {
                const { startOfWeek, endOfWeek } = getMondayToSundayRange(4);
                newStartDate = startOfWeek;
                newEndDate = endOfWeek;
            }
        } else if (option === "Custom") {
            setFilterLoading(false);
            return;
        }

        setDisplayDates({
            startDate: formatDate(newStartDate),
            endDate: formatDate(newEndDate),
        });

        try {
            const response = await fetchData("lambdaAPI/Customer/GetProgressByFilter", {
                value: [formatDate(newStartDate), formatDate(newEndDate)],
            });
            setFilteredProgressData(response[0]);
        } catch (error) {
            console.error("Error fetching filtered progress data:", error);
        } finally {
            setCardLoading(false);
        }
    };

    const handleCustomDateChange = async () => {
        if (startDate && startDate.length === 2) {
            setCardLoading(true);
            setDisplayDates({
                startDate: formatDate(startDate[0]),
                endDate: formatDate(startDate[1]),
            });
            try {
                const response = await fetchData('lambdaAPI/Customer/GetProgressByFilter', {
                    value: [formatDate(startDate[0]), formatDate(startDate[1])],
                });
                setFilteredProgressData(response[0]);
            } catch (error) {
                console.error('Error fetching filtered progress data:', error);
            } finally {
                setCardLoading(false);
            }
        }
    };

    const cardStyle = {
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease',
        marginBottom: '1rem',
    };

    const bottomHighlightStyle = {
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '3px',
        backgroundColor: '#4287f5',
        transition: 'width 0.3s ease',
        width: '0',
    };

    const styles = `
        .cardStyle {
            border: 1px solid #ddd;
            border-radius: 8px;
            transition: box-shadow 0.3s ease-in-out;
            background-color: #F7F7F7; /* Lighter background for cards */
        }
        .bottomHighlightStyle2 {
            height: 4px;
            background-color: #007bff;
            transition: width 0.3s ease-in-out;
        }

        .shimmer {
            animation-duration: 2.5s; /* Increased duration for slower movement */
            animation-fill-mode: forwards;
            animation-iteration-count: infinite;
            animation-name: shimmer;
            animation-timing-function: linear;
            background: linear-gradient(to right, #e0e0e0 8%, #f0f0f0 18%, #e0e0e0 33%);
            background-size: 1000px 104px;
            position: relative;
            overflow: hidden;
        }

        @keyframes shimmer {
            0% {
                background-position: -1000px 0;
            }
            100% {
                background-position: 1000px 0;
            }
        }

        .skeletonCardStyle {
            border: 1px solid #ddd;
            border-radius: 8px;
            transition: box-shadow 0.3s ease-in-out;
            background-color: #f0f0f0; /* Lighter background for cards */
            overflow: hidden;
            position: relative;
        }
        .textStyle {
            width: 100%;
            height: 100%;
            background: #c8c8c8; /* Darker background for text */
            animation: shimmer 2.5s infinite linear;
            border-radius: 4px; /* Optional: to match the style */
        }
        .distrubuterHead {
            width: 50%;
            height: 15px;
            background: #c8c8c8;
            animation: shimmer 2.5s infinite linear;
            border-radius: 4px;
        }
        .distributerSmall {
            width: 30%;
            height: 10px;
            background: #c8c8c8;
            animation: shimmer 2.5s infinite linear;
            border-radius: 4px;
        }
        .distributerCount {
            width: 20%;
            height: 15px;
            background: #c8c8c8;
            animation: shimmer 2.5s infinite linear;
            border-radius: 4px;
        }
        `;

    const skeletonLoading = () => (
        <div className="row mt-2">
            <style>
                {styles}
            </style>
            {[...Array(6)].map((_, index) => (
                <div className="col-md-2 mb-4" key={index}>
                    <div className="card custom-card card-border-shadow-primary h-100 skeletonCardStyle shimmer">
                        <div className="card-body custom-card-body">
                            <div className="d-flex align-items-center mb-2 pb-1">
                                <div className="avatar me-2">
                                    <span className="avatar-initial rounded bg-label-primary" style={{ width: '40px', height: '40px' }}></span>
                                </div>
                                <h4 className="ms-1 mb-0 textStyle" style={{ width: '60%', height: '24px' }}></h4>
                            </div>
                            <p className="d-block mb-1 textStyle" style={{ width: '80%', height: '16px' }}></p>

                        </div>
                    </div>
                </div>
            ))}
            <div className="row">

                <div className="col-md-6">
                    <div className="card shadow mb-4 skeletonCardStyle shimmer">
                        <div className="card-body">
                            <h5 className="card-title textStyle" style={{ width: '70%', height: '24px' }}></h5>
                            <div className="textStyle" style={{ width: '100%', height: '350px' }}></div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card shadow mb-4 skeletonCardStyle shimmer">
                        <div className="card-body">
                            <h5 className="card-title textStyle" style={{ width: '70%', height: '24px' }}></h5>
                            <div className="textStyle" style={{ width: '100%', height: '350px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
            {Object.keys(progressLabels).map((key) => (
                key !== 'DistributorCount' &&
                key !== 'MemberCount' &&
                key !== 'HospitalCount' &&
                key !== 'OHOCardsPremiumCount' && (
                    <div className="col-md-6" key={key}>
                        <div className="card shadow mb-4 skeletonCardStyle shimmer">
                            <div className="card-body">
                                <h5 className="card-title textStyle" style={{ width: '70%', height: '24px' }}></h5>
                                <div className="textStyle" style={{ width: '100%', height: '350px' }}></div>
                            </div>
                        </div>
                    </div>
                )
            ))}
            <div className="col-md-12">


                <h5 className="textStyle" style={{ width: '20%', height: '24px' }}></h5>


                <div className="row mt-2">
                    <div className="col-12 mb-1">
                        <h4 className="card-title textStyle" style={{ width: '30%', height: '32px' }}></h4>
                    </div>
                </div>

                <div className="row mt-2">
                    {Object.keys(progressLabels).map((key) => (
                        <div className="col-md-3 mb-4" key={key}>
                            <div className="card custom-card card-border-shadow-primary h-100 skeletonCardStyle shimmer">
                                <div className="card-body custom-card-body">
                                    <div className="d-flex align-items-center mb-2 pb-1">
                                        <div className="avatar me-2">
                                            <span className="avatar-initial rounded bg-label-primary textStyle" style={{ width: '40px', height: '40px' }}></span>
                                        </div>
                                        <h4 className="ms-1 mb-0 textStyle" style={{ width: '60%', height: '24px' }}></h4>
                                    </div>
                                    <p className="d-block mb-1 textStyle" style={{ width: '80%', height: '16px' }}></p>


                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </div>
    );

    const skeletonDistributer = () => {
        return (
            <div className="card-body">
                <style>
                    {styles}
                </style>
                <ul className="p-0 m-0">
                    {[...Array(10)].map((_, index) => (
                        <li className="d-flex justify-content-between mb-2 pb-1 shimmer" key={index}>
                            <div>
                                <h6 className="mb-0 distrubuterHead"></h6>
                                <small className="text-muted d-block mb-1 distributerSmall"></small>
                            </div>

                            <div className="user-progress d-flex align-items-center gap-1">
                                <span className="fw-medium distributerCount"></span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const handleViewAll = () => {
        setShowAll(true);
    };

    const handleViewsAll = () => {
        setShowsAll(true);
    };

    const renderDistributerAndRmCounts = () => {
        return (
            <>
                <div className="row">
                    <div className="col-lg-12 col-xl-6">
                        <div className="card card-action mt-2" style={{ zIndex: 1 }}>
                            <div className="card-header align-items-center">
                                <h5 className="card-action-title mb-0">Top Advisors by <span className="text-primary">Sales</span></h5>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled mb-0">
                                    {distributerData ? (
                                        visibleDistributers.map(distributer => (
                                            <li className="mb-3" key={`${distributer.id}-${distributer.Name}`}>
                                                <div className="d-flex align-items-start">
                                                    <div className="d-flex align-items-start">
                                                        <div className="avatar me-3">
                                                            <img src="/assets/img/dummy-avatar.jpg" alt="Avatar" className="rounded-circle" />
                                                        </div>
                                                        <div className="me-2">
                                                            <Link to={`/advisor/details/${distributer.MemberId}`}>
                                                                <h6 className="mb-0" style={{ color: '#0077cc' }}>{distributer.Name}</h6>
                                                            </Link>

                                                            <small className="text-muted">Assigned cards: {distributer.AssignedCards}</small>
                                                        </div>
                                                    </div>
                                                    <div className="ms-auto">
                                                        <small className="btn btn-label-primary btn-icon btn-sm">{distributer.SoldCards}</small>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        skeletonDistributer()
                                    )}
                                    {!showAll && distributerData && distributerData.length > 3 && (
                                        <li className="text-center">
                                            <a className="text-primary" style={{ cursor: 'pointer' }} onClick={handleViewAll}>
                                                View all Advisors sales
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-12 col-xl-6">
                        <div className="card card-action mt-2" style={{ zIndex: 1 }}>
                            <div className="card-header align-items-center">
                                <h5 className="card-action-title mb-0">Top RM's by <span className="text-primary">Members Count</span></h5>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled mb-0">
                                    {rmData ? (
                                        visibleRMs.map(rm => (
                                            <li key={rm.Name} className="mb-3">
                                                <div className="d-flex align-items-start">
                                                    <div className="d-flex align-items-start">
                                                        <div className="avatar me-3">
                                                            <img src="/assets/img/dummy-avatar.jpg" alt="Avatar" className="rounded-circle" />
                                                        </div>
                                                        <div className="me-2">
                                                            <h6 className="mb-0">{rm.Name}</h6>
                                                            {/* <small class="text-muted">Assigned cards: {distributer.AssignedCards}</small>*/}
                                                        </div>
                                                    </div>
                                                    <div className="ms-auto">
                                                        <small className="btn btn-label-primary btn-icon btn-sm">{rm.MemberCount}</small>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        skeletonDistributer()
                                    )}
                                    {!showsAll && rmData && rmData.length > 3 && (
                                        <li className="text-center">
                                            <a className="text-primary" style={{ cursor: 'pointer' }} onClick={handleViewsAll}>
                                                View all RM Advisors List
                                            </a>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>



            </>

        );
    };

    const colorMap = {
        FamiliesCovered: 'linear-gradient(135deg, #FAD961, #F76B1C)', // Sunset gradient
        FamilyMembersCovered: 'linear-gradient(135deg, #43CEA2, #185A9D)',      // Teal to Navy gradient
        NetworkHospitals: 'linear-gradient(135deg, #FF9A9E, #FAD0C4)',    // Peach to Light Pink gradient
        TotalPremiumAmount: 'linear-gradient(135deg, #FFC371, #FF5F6D)', // Orange to Pink gradient
        TotalSales: 'linear-gradient(135deg, #FF512F, #F09819)', // Deep Orange to Yellow gradient
        TotalPriorityAmount: 'linear-gradient(135deg, #56CCF2, #2F80ED)',  // Sky Blue to Royal Blue gradient
        CustomersServed: 'linear-gradient(135deg, #E55D87, #5FC3E4)', // Pink to Cyan gradient
        OHOCardsPrivilegeCount: 'linear-gradient(135deg, #8E2DE2, #4A00E0)',
        HealthCampStats: 'linear-gradient(135deg, #8E2DE2, #4A00E0)'// Deep Purple to Electric Blue gradient
    };

    const dashboardPatterns = {
        FamiliesCovered: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(255, 192, 203, 0.3);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(255, 105, 180, 0.6);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg1)" /><circle cx="75%" cy="75%" r="20%" fill="rgba(0, 0, 0, 0.1)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2"/></svg>`,

        FamilyMembersCovered: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(173, 216, 230, 0.5);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(0, 191, 255, 0.8);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg2)" /><path d="M10,80 Q40,20 70,80 T100,80" stroke="rgba(0, 0, 0, 0.2)" stroke-width="3" fill="transparent"/></svg>`,

        NetworkHospitals: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(144, 238, 144, 0.4);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(34, 139, 34, 0.6);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg3)" /> <polygon points="60,10 70,40 100,40 80,70 60,50 40,70 20,40 50,40" stroke="rgba(255, 255, 255, 0.4)" fill="transparent" stroke-width="3" /></svg>`,

        //TotalPremiumAmount: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(255, 215, 0, 0.5);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(255, 140, 0, 0.7);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg4)" /><path d="M5,85 Q40,50 70,65 T100,40" stroke="rgba(255, 255, 255, 0.3)" stroke-width="3" fill="transparent"/></svg>`,

        TotalSales: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(255, 160, 122, 0.6);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(255, 99, 71, 0.8);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg5)" /><path d="M10,80 C25,40 75,40 90,80" stroke="rgba(255, 255, 255, 0.3)" stroke-width="3" fill="transparent"/></svg>`,

        //TotalPriorityAmount: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(135, 206, 250, 0.5);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(70, 130, 180, 0.7);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg6)" /><circle cx="75%" cy="75%" r="20%" fill="rgba(255, 255, 255, 0.3)" stroke="rgba(255, 255, 255, 0.5)" stroke-width="2"/></svg>`,

        CustomersServed: `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
                <linearGradient id="lg7" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:rgba(135, 206, 250, 0.5);stop-opacity:1" /> <!-- Lighter sky blue -->
                <stop offset="100%" style="stop-color:rgba(173, 216, 230, 0.8);stop-opacity:1" /> <!-- Soft light blue -->
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="#ADD8E6" /> <!-- Light blue background -->
            <path d="M5,80 Q30,50 70,50 T100,60" stroke="rgba(255, 255, 255, 0.7)" stroke-width="3" fill="transparent" />
            </svg>`,

        // OHOCardsPrivilegeCount: `
        //     <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        //     <defs>
        //         <linearGradient id="lg8" x1="0%" y1="0%" x2="100%" y2="100%">
        //         <stop offset="0%" style="stop-color:rgba(85, 239, 196, 0.5);stop-opacity:1" />
        //         <stop offset="100%" style="stop-color:rgba(0, 184, 148, 0.8);stop-opacity:1" />
        //         </linearGradient>
        //     </defs>
        //     <rect width="100%" height="100%" fill="url(#lg8)" />
        //     <path d="M10,70 L40,30 L70,50 L90,20" stroke="rgba(255, 255, 255, 0.5)" stroke-width="3" fill="transparent" />
        //     </svg>`,

        HealthCampStats: `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
                <linearGradient id="lg8" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:rgba(85, 239, 196, 0.5);stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgba(0, 184, 148, 0.8);stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#lg8)" />
            <path d="M10,70 L40,30 L70,50 L90,20" stroke="rgba(255, 255, 255, 0.5)" stroke-width="3" fill="transparent" />
            </svg>`,

    };

    return (
        <Layout>
            <div className="mt-4">

                {loading && skeletonLoading()}
                {!loading && (
                    <>
                        {/* <div className="col-md-12">
                            <div className="card card-action mb-4" style={{ zIndex: 1 }}>
                                <MyOrganisationCanvas/>
                                <MyOrganisation />

                            </div>
                        </div> */}

                        <div className="row mt-2">
                            <div className="col-12 mb-2">
                                <h4 className="card-title">
                                    OUR PROGRESS TILL TODAY <span>{formatDate(currentDate)}</span>
                                </h4>
                            </div>
                            {Object.entries(progressLabels).map(([key, label]) => (
                                <div className="col-6 col-md-4 mb-4" key={key}>
                                    <div
                                        className="card custom-card card-border-shadow-primary h-100"
                                        style={{
                                            ...cardStyle,
                                            background: `linear-gradient(135deg, ${colorMap[key]})`,
                                            backgroundImage: `url('data:image/svg+xml;base64,${btoa(dashboardPatterns[key])}')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'right center',
                                            color: '#000000', // Ensures text contrast
                                            border: 'none',
                                            zIndex: 1
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.boxShadow = '0 8px 16px 0 rgba(0,0,0,0.2)';
                                            e.currentTarget.querySelector('.card-bottom-highlight').style.width = '100%';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.boxShadow = 'none';
                                            e.currentTarget.querySelector('.card-bottom-highlight').style.width = '0';
                                        }}
                                    >
                                        <div className="card-body custom-card-body">
                                            <div className="d-flex align-items-center mb-2 pb-1">
                                                <div className="avatar me-2">
                                                    <span className="avatar-initial rounded bg-label-primary">{icons[key]}</span>
                                                </div>
                                                <h4 className="mb-0" style={{ color: 'black', fontWeight: 'bold' }}>
                                                    {key === 'TotalPrivilegeAmount' ? formatAmount(progressData[key]) :
                                                        key === 'OHOCardsPremiumCount' ? progressData['OHOCardsPremiumCount'] + progressData['OHOCardsPrivilegeCount'] + progressData['OHOCardsPriorityCount'] :
                                                            progressData[key]
                                                    }
                                                </h4>
                                            </div>
                                            <p className="d-block mb-1">{label}</p>
                                            <div className="card-bottom-highlight" style={bottomHighlightStyle}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="row">
                            <div className="col-md-12">
                                <div className="card" style={{ zIndex: 1, height: '490px' }}>
                                    <div className="card-body">
                                        <h5>Filter</h5>
                                        <FilterCommonComponents
                                            filterOption={filterOption}
                                            handleFilterChange={handleFilterChange}
                                            setFilterOption={setFilterOption}
                                            selectedWeekOption={selectedWeekOption}
                                            selectedDayOption={selectedDayOption}
                                            handleDayOptionChange={handleDayOptionChange}
                                            handleWeekOptionChange={handleWeekOptionChange}
                                            selectedMonth={selectedMonth}
                                            setSelectedMonth={setSelectedMonth}
                                            selectedYear={selectedYear}
                                            setSelectedYear={setSelectedYear}
                                            startDate={startDate}
                                            setStartDate={setStartDate}
                                            months={months}
                                            generateYears={generateYears}
                                            handleCustomDateChange={handleCustomDateChange}
                                        />
                                        {!CardLoading ? (
                                            <>
                                                <div className="row mt-2">
                                                    <div className="col-12 mb-1">
                                                        <h4 className="card-title" style={{ color: '#4287f5' }}>
                                                            Customized Data ({formatDate1(displayDates.startDate)} to {formatDate1(displayDates.endDate)})
                                                        </h4>
                                                    </div>
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="table-responsive">
                                                        <table className="table table-bordered">
                                                            <thead>
                                                                <tr>
                                                                    <th scope="col">Label</th>
                                                                    <th scope="col">Value</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {Object.entries(filterLabels)
                                                                    .filter(([key]) => key !== 'OHOCardsPremiumCount' && key !== 'OHOCardsPrivilegeCount' && key !== 'ServedCustomers')
                                                                    .map(([key, label]) => (
                                                                        <tr key={key}>
                                                                            <td>{label}</td>
                                                                            <td>
                                                                                {key === 'TotalPremiumAmount'
                                                                                    ? formatAmount(filteredProgressData[key])
                                                                                    : key === 'TotalPrivilegeAmount'
                                                                                        ? formatAmount(filteredProgressData[key])
                                                                                        : key === 'TotalPriorityAmount'
                                                                                            ? formatAmount(filteredProgressData[key])
                                                                                            : filteredProgressData[key]}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="d-flex flex-column justify-content-center align-items-center h-100">
                                                <div className="spinner-border text-primary" role="status"></div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard">
                            <DashboardCharts />
                        </div>

                        <div className="mb-3">
                            <h4>Hospital Navigator
                                <i className="bi bi-pin-map-fill" style={{ color: '	#ff0000', marginLeft: '10px' }}></i>
                            </h4>
                            <div style={{ display: 'flex', width: '140%' }}>
                                {hospitals && hospitals.length > 0 ?
                                    <MapBoxHospital hospitalsData={hospitals} />
                                    : null
                                }
                            </div>
                        </div>

                        {/* {renderDistributerAndRmCounts()} */}
                    </>
                )}
            </div>
        </Layout>
    );
}