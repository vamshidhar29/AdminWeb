import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import CircularProgress from '@mui/material/CircularProgress';
import Flatpickr from 'react-flatpickr';
import { fetchAllData, fetchData } from '../../helpers/externapi';
import Layout from '../../Layout/Layout';
import FilterCommonComponents from '../../Commoncomponents/FilterCommonComponents';
import { formatDate1 } from '../../Commoncomponents/CommonComponents'; 

export default function TelecallerDashboard() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const [monthWiseCount, setMonthWiseCount] = useState([]);
    const [progressData, setProgressData] = useState({});
    const [filteredProgressData, setFilteredProgressData] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startDate, setStartDate] = useState([]);
    const [filterOption, setFilterOption] = useState('Select Day');
    const [loadingChart, setLoadingChart] = useState(true);
    const [loadingTable, setLoadingTable] = useState(true);
    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(currentYear); // Set default year to current year
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedWeekOption, setSelectedWeekOption] = useState('This Week');
    const [selectedDayOption, setSelectedDayOption] = useState('Today');
    const [displayDates, setDisplayDates] = useState({ startDate: "", endDate: "" });   

    const userId = localStorage.getItem("UserId");

    useEffect(() => {
        const getMonthlyProgressData = async () => {
            try {
                setLoadingChart(true);
                if (!userId) {
                    console.error('UserId is not available.');
                    return;
                }
                const memberCountPerMonthData = await fetchAllData(`Member/TeleCallerProgressOfLast6MonthlyCounts/${userId}`);
                setMonthWiseCount(memberCountPerMonthData);
            } catch (error) {
                console.error('Error fetching monthly progress data:', error);
            } finally {
                setLoadingChart(false);
            }
        };
        getMonthlyProgressData();
    }, []);

    useEffect(() => {
        const getProgressData = async () => {
            try {
                setLoadingTable(true);
                setLoading(true);                
                if (!userId) {
                    console.error('UserId is not available.');
                    return;
                }
                const progressDataResponse = await fetchAllData(`Member/TeleCallerProgressTillNow/${userId}`);
                setProgressData(progressDataResponse[0]);
                handleFilterChange('Select Day');
            } catch (error) {
                console.error('Error fetching progress data:', error);
            } finally {
                setLoadingTable(false);
                setLoading(false);
            }
        };
        getProgressData();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDate(new Date());
        }, 86400000);
        return () => clearInterval(intervalId);
    }, []);

    const formatDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
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
        setFilterLoading(true);
        setSelectedWeekOption(value);
        handleFilterChange('Select Week', value, undefined);
        setFilterLoading(false);
    };

    const handleDayOptionChange = (value) => {
        setFilterLoading(true);
        setSelectedDayOption(value);
        handleFilterChange('Select Day', undefined, value);
        setFilterLoading(false);
    }

    const handleFilterChange = async (option, weekOption = 'This Week', dayOption = 'Today') => {
        setFilterOption(option);
        setFilterLoading(true);
        let newStartDate = new Date();
        let newEndDate = new Date();
        
           
        if (option === "Last 3 months") {
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
        }


      if (option === "Select Day") {

        if (dayOption === "Today") {
            newStartDate = newEndDate = new Date();
        } else if (dayOption === "Yesterday") {
            newStartDate.setDate(newStartDate.getDate() - 1);
            newEndDate.setDate(newEndDate.getDate() - 1);
        } else if (dayOption === "Last 7 days") {
            newStartDate.setDate(newStartDate.getDate() - 6);
        } else if (dayOption === "Last 30 days") {
            newStartDate.setDate(newStartDate.getDate() - 30);
        } else if (dayOption === "Last 14 days") {
            newStartDate.setDate(newStartDate.getDate() - 14);
        }
      }

        if (option === "Select Week") {
            // Handle individual week options
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
            const response = await fetchData("Member/GetTeleCallerProgressByFilter", {
                value: [formatDate(newStartDate), formatDate(newEndDate), localStorage.getItem("UserId")],
            });
            setFilteredProgressData(response[0]);
        } catch (error) {
            console.error("Error fetching filtered progress data:", error);
        } finally {
            setFilterLoading(false);
        }
    };

    const handleCustomDateChange = async () => {
        if (startDate.length === 2) {
            setLoadingTable(true);
            try {
                setLoading(true);
                const response = await fetchData('Member/GetTeleCallerProgressByFilter', {
                    value: [formatDate(startDate[0]), formatDate(startDate[1]), localStorage.getItem("UserId")],
                });
                setFilteredProgressData(response[0]);
            } catch (error) {
                console.error('Error fetching filtered progress data:', error);
            } finally {
                setLoadingTable(false);
            }
            setLoading(false);
        }
    };

    const chartOptions = {
        chart: {
            type: 'bar',
            toolbar: {
                show: false,
            },
            foreColor: '#9e9e9e',
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded',
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent'],
        },
        xaxis: {
            categories: monthWiseCount.map(item => item.month),
            labels: {
                style: {
                    colors: '#9e9e9e',
                },
            },
        },
        yaxis: {
            title: {
                text: 'Count',
                style: {
                    color: '#9e9e9e',
                },
            },
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            y: {
                formatter: (val) => val,
            },
        },
    };

    const series = [
        {
            name: 'Advisors',
            data: monthWiseCount.map(item => item.DistributorCount),
        },
        {
            name: 'Customers',
            data: monthWiseCount.map(item => item.MemberCount),
        },
        {
            name: 'Privilege Cards',
            data: monthWiseCount.map(item => item.OHOCardsPrivilegeCount),
        },
        {
            name: 'Call History',
            data: monthWiseCount.map(item => item.CallHistoryCount),
        },
    ];

    const progressLabels = {
        DistributorCount: 'Advisors',
        MemberCount: 'Customers',
        //OHOCardsPremiumCount: 'Premium Cards',
        OHOCardsPrivilegeCount: 'Privilege Cards',
        //OHOCardsPriorityCount: 'Priority Cards',
        CallHistoryCount: 'Call History'
    };

    const icons = {
        DistributorCount: <i className="fa-solid fa-users"></i>,
        MemberCount: <i className="fa-solid fa-user"></i>,
        OHOCardsPremiumCount: <i className="fa-solid fa-id-card"></i>,
        OHOCardsPrivilegeCount: <i className="fa-solid fa-id-card"></i>,
        OHOCardsPriorityCount: <i className="fa-solid fa-id-card"></i>,
        CallHistoryCount: <i className="fa-solid fa-phone"></i>
    };

    const cardStyle = {
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
        transition: 'box-shadow 0.3s ease',
    };

    const bottomHighlightStyle = {
        height: '5px',
        backgroundColor: '#4287f5',
        transition: 'width 0.3s ease',
        width: '0',
        position: 'absolute',
        bottom: '0',
        left: '0',
    };


    const colorMap = {
        DistributorCount: 'linear-gradient(135deg, #FAD961, #F76B1C)', // Sunset gradient
        MemberCount: 'linear-gradient(135deg, #43CEA2, #185A9D)',      // Teal to Navy gradient
        HospitalCount: 'linear-gradient(135deg, #FF9A9E, #FAD0C4)',    // Peach to Light Pink gradient
        CallHistoryCount: 'linear-gradient(135deg, #FFC371, #FF5F6D)', // Orange to Pink gradient
        TotalPrivilegeAmount: 'linear-gradient(135deg, #FF512F, #F09819)', // Deep Orange to Yellow gradient
        TotalPriorityAmount: 'linear-gradient(135deg, #56CCF2, #2F80ED)',  // Sky Blue to Royal Blue gradient
        OHOCardsPremiumCount: 'linear-gradient(135deg, #E55D87, #5FC3E4)', // Pink to Cyan gradient
        OHOCardsPrivilegeCount: 'linear-gradient(135deg, #8E2DE2, #4A00E0)', // Deep Purple to Electric Blue gradient
    };

    const dashboardPatterns = {
        DistributorCount: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(255, 192, 203, 0.3);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(255, 105, 180, 0.6);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg1)" /><circle cx="75%" cy="75%" r="20%" fill="rgba(0, 0, 0, 0.1)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2"/></svg>`,

        MemberCount: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(173, 216, 230, 0.5);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(0, 191, 255, 0.8);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg2)" /><path d="M10,80 Q40,20 70,80 T100,80" stroke="rgba(0, 0, 0, 0.2)" stroke-width="3" fill="transparent"/></svg>`,

        CallHistoryCount: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(144, 238, 144, 0.4);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(34, 139, 34, 0.6);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg3)" /> <polygon points="60,10 70,40 100,40 80,70 60,50 40,70 20,40 50,40" stroke="rgba(255, 255, 255, 0.4)" fill="transparent" stroke-width="3" /></svg>`,

        TotalPremiumAmount: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(255, 215, 0, 0.5);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(255, 140, 0, 0.7);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg4)" /><path d="M5,85 Q40,50 70,65 T100,40" stroke="rgba(255, 255, 255, 0.3)" stroke-width="3" fill="transparent"/></svg>`,

        TotalPrivilegeAmount: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(255, 160, 122, 0.6);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(255, 99, 71, 0.8);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg5)" /><path d="M10,80 C25,40 75,40 90,80" stroke="rgba(255, 255, 255, 0.3)" stroke-width="3" fill="transparent"/></svg>`,

        TotalPriorityAmount: `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><defs><linearGradient id="lg6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:rgba(135, 206, 250, 0.5);stop-opacity:1" /><stop offset="100%" style="stop-color:rgba(70, 130, 180, 0.7);stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(#lg6)" /><circle cx="75%" cy="75%" r="20%" fill="rgba(255, 255, 255, 0.3)" stroke="rgba(255, 255, 255, 0.5)" stroke-width="2"/></svg>`,

        OHOCardsPremiumCount: `
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

        OHOCardsPrivilegeCount: `
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

    const formatAmount = (amount) => {
        if (amount === null || undefined) {
            return `₹ 0`;
        } else {
            return `₹ ${amount}`;
        }
    };

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
                key !== 'OHOCardsPremiumCount' &&
                key !== 'OHOCardsPrivilegeCount' && (
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

    const renderCards = () => (
        <div className="mt-4">
            {loadingTable ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                    <CircularProgress />
                </div>
            ) : (
                <>
                    <div className="row mt-2">
                        <div className="col-12 mb-2">
                            <h4 className="card-title">
                                OUR PROGRESS TILL TODAY <span>{formatDate(currentDate)}</span>
                            </h4>
                        </div>
                            {Object.entries(progressLabels).map(([key, label]) => (
                                <div className="col-md-3 mb-4" key={key}>
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

                        {filterLoading ? (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '300px', // Adjust based on your card's height
                                    width: '100%',
                                }}
                            >
                                <CircularProgress size={50} thickness={4} />
                            </div>
                        ) : (
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="card" style={{ zIndex: 1 }}>
                                        <div className="card-body">
                                            <h5>Filter</h5>
                                            <FilterCommonComponents
                                                filterOption={filterOption}
                                                handleFilterChange={handleFilterChange}
                                                setFilterOption={setFilterOption}
                                                selectedDayOption={selectedDayOption}
                                                handleDayOptionChange={handleDayOptionChange}
                                                selectedWeekOption={selectedWeekOption}
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
                                                            {Object.entries(progressLabels)
                                                                .filter(([key]) => key !== 'OHOCardsPremiumCount') // Exclude specific keys
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

                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                </>
            )}
        </div>
    );   

    return (
        <Layout>
            <div className="container">
            {loadingChart ? (
                <div className="d-flex justify-content-center">
                    <CircularProgress />
                </div>
            ) : (
                renderCards()
            )}
            <div className="card mt-5">
                {loading && skeletonLoading()}
                {!loading && (
                   
                <div className="card-body">
                    <div>
                        <h6>Tele Caller Progress Last 6 Months</h6>
                    </div>
                    {loadingChart ? (
                        <div className="d-flex justify-content-center">
                            <CircularProgress />
                        </div>
                    ) : (
                        <Chart options={chartOptions} series={series} type="bar" height={350} />
                    )}
                </div>
                )}
                
            </div>
            </div>
        </Layout>
    );
}

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
        `;