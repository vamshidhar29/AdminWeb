import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import Layout from '../../Layout/Layout';
import { fetchData } from '../../helpers/externapi';
import { Link, useLocation } from 'react-router-dom';
import FilterCommonComponents from '../../Commoncomponents/FilterCommonComponents';
import { formatDate1 } from '../../Commoncomponents/CommonComponents';
import { FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const UserDashboard = () => {
    const [orgData, setOrgData] = useState(null);
    const [fullName, setFullName] = useState();
    const [userRole, setUserRole] = useState();
    const location = useLocation();
    const { userId } = location.state || '';
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const [startDate, setStartDate] = useState([]);
    const [filterOption, setFilterOption] = useState('Select Day');
    const [filterLoading, setFilterLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedWeekOption, setSelectedWeekOption] = useState('This Week');
    const [selectedDayOption, setSelectedDayOption] = useState('Today');
    const [displayDates, setDisplayDates] = useState({ startDate: "", endDate: "" });
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [expandedRoles, setExpandedRoles] = useState({});


    const { Id } = useParams();

    useEffect(() => {
        const fetchOrgData = async () => {
            try {
                setFilterLoading(true);
                const getOrgData = await fetchData('lambdaAPI/Employee/GetMyOrg', {
                    UserId: userId === "146" ? 155 : Id,
                    StartDate: new Date(),
                    EndDate: new Date()
                });

                setDisplayDates({
                    startDate: formatDate(new Date()),
                    endDate: formatDate(new Date()),
                });

                setFullName(getOrgData.fullName);
                setUserRole(getOrgData.userRoleName);

                setOrgData(getOrgData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setFilterLoading(false);
            }
        };

        fetchOrgData();
    }, [userId]);

    useEffect(() => {
        if (filterOption === "Select Month" && selectedMonth !== null) {
            handleFilterChange("Select Month");
        }
    }, [selectedMonth, filterOption]);

    useEffect(() => {
        if (filterOption === "Select Year" && selectedYear !== null) {
            handleFilterChange("Select Year");
        }
    }, [selectedYear, filterOption]);

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

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
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
        setFilterLoading(true);
        setFilterOption(option);
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
            setFilterLoading(true);
            const getOrgData = await fetchData('lambdaAPI/Employee/GetMyOrg', {
                UserId: Id === "146" ? 155 : Id,
                StartDate: formatDate(newStartDate),
                EndDate: formatDate(newEndDate),
            });


            setOrgData(getOrgData);
        } catch (error) {
            console.error("Error fetching filtered progress data:", error);
        } finally {
            setFilterLoading(false);
        }
    };

    const handleCustomDateChange = async () => {
        if (startDate && startDate.length === 2) {
            setFilterLoading(true);
            setDisplayDates({
                startDate: formatDate(startDate[0]),
                endDate: formatDate(startDate[1]),
            });
            try {
                const getOrgData = await fetchData('lambdaAPI/Employee/GetMyOrg', {
                    UserId: Id === "146" ? 155 : Id,
                    StartDate: formatDate(startDate[0]),
                    EndDate: formatDate(startDate[1]),
                });

                setOrgData(getOrgData);


            } catch (error) {
                console.error('Error fetching filtered progress data:', error);
            } finally {
                setFilterLoading(false);
            }
        }
    };


    const toggleRow = (userId) => {
        setExpandedRows((prev) => ({
            ...prev,
            [userId]: !prev[userId],
        }));
    };

    const handleToggleExpand = () => {
        const groupedReports = groupByUserRole(orgData.reports);
        if (isExpanded) {

            setExpandedRoles({});
            setExpandedRows({});
        } else {

            const newExpandedRoles = {};
            const newExpandedRows = {};


            Object.keys(groupedReports).forEach((role) => {
                newExpandedRoles[role] = true;

                groupedReports[role].forEach((report) => {

                    newExpandedRows[report.userId] = true;


                    if (report.reports && report.reports.length > 0) {

                        report.reports.forEach((nestedReport) => {
                            newExpandedRows[nestedReport.userId] = true;
                        });
                    }
                });
            });


            setExpandedRoles(newExpandedRoles);
            setExpandedRows(newExpandedRows);
        }


        setIsExpanded(!isExpanded);
    };




    const groupByUserRole = (reports) => {
        return reports.reduce((groups, report) => {
            const role = report.userRoleName;
            if (!groups[role]) {
                groups[role] = [];
            }
            groups[role].push(report);
            return groups;
        }, {});
    };

    const toggleRole = (role) => {
        setExpandedRoles((prev) => ({
            ...prev,
            [role]: !prev[role],
        }));
    };

    const getCountColor = (count) => {
        if (count > 10) return "#4CAF50";
        if (count > 5) return "#FF9800";
        return "#F44336";
    };

    const renderGroupedTable = (groupedReports) => {
        return Object.keys(groupedReports).map((role) => {
            const count = groupedReports[role].length;
            return (
                <React.Fragment key={role}>
                    <tr>
                        <td
                            colSpan="8"
                            style={{
                                backgroundColor: "#f1f1f1",
                                fontWeight: "bold",
                                cursor: "pointer",
                            }}
                            onClick={() => toggleRole(role)}
                        >
                            {expandedRoles[role] ? "▼" : "▶"} {role}{" "}
                            <span
                                style={{
                                    color: getCountColor(count),
                                    fontWeight: "bold",
                                }}
                            >
                                ({count})
                            </span>
                        </td>
                    </tr>
                    {expandedRoles[role] &&
                        groupedReports[role].map((report) => (
                            <React.Fragment key={report.userId}>
                                <tr>
                                    <td>
                                        {report.reports && report.reports.length > 0 && (
                                            <button
                                                className="btn btn-link"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleRow(report.userId);
                                                }}
                                            >
                                                {expandedRows[report.userId] ? "▼" : "▶"}
                                            </button>
                                        )}
                                        <a href={`/dashboard/${report.userId}`} target="_blank">
                                            <strong>{report.fullName}</strong>
                                        </a>
                                    </td>
                                    <td>{report.userRoleName}</td>
                                    <td>{report.empSales}</td>
                                    <td>{Number(report.saleAmount).toLocaleString("en-IN")}</td>
                                    <td>{report.cumulativeSales}</td>
                                    <td>{Number(report.cumulativeSaleAmount).toLocaleString("en-IN")}</td>
                                    <td>{report.cumulativeAdvisors}</td>
                                    <td>{report.cumulativeCustomers}</td>
                                </tr>
                                {expandedRows[report.userId] &&
                                    report.reports &&
                                    report.reports.length > 0 && (
                                        <tr>
                                            <td colSpan="8">
                                                <table className="table table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th>Full Name</th>
                                                            <th>Role</th>
                                                            <th colSpan="2" style={{ textAlign: "center" }}>Own</th>  {/* First level Own column */}
                                                            <th colSpan="2" style={{ textAlign: "center" }}>Team</th> {/* First level Team column */}
                                                            <th>Advisors</th>
                                                            <th>Customers</th>
                                                        </tr>
                                                        <tr>
                                                            <th></th>
                                                            <th></th>
                                                            <th>Card Sales</th>  {/* Own Sales */}
                                                            <th>Amount</th> {/* Own Sale Amount */}
                                                            <th>Card Sales</th>  {/* Team Sales */}
                                                            <th>Amount</th> {/* Team Sale Amount */}
                                                            <th></th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>{renderTable(report.reports)}</tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )}
                            </React.Fragment>
                        ))}
                </React.Fragment>
            );
        });
    };

    const renderTable = (reports) => {
        const groupedReports = groupByUserRole(reports);
        return renderGroupedTable(groupedReports);
    };

    const flattenReports = (reports) => {
        const flattenedData = [];

        reports.forEach((report) => {
            // Current report data
            const reportData = {
                FullName: report.fullName,
                UserRoleName: report.userRoleName,
                CardSales: report.empSales,
                SaleAmount: Number(report.saleAmount).toLocaleString("en-IN"),
                TeamCardSales: report.cumulativeSales,
                TeamSaleAmount: Number(report.cumulativeSaleAmount).toLocaleString("en-IN"),
                Advisors: report.cumulativeAdvisors,
                Customers: report.cumulativeCustomers
            };

            flattenedData.push(reportData); // Add the current report data

            // If there are nested reports (sub-reports), recursively flatten them
            if (report.reports && report.reports.length > 0) {
                report.reports.forEach((nestedReport) => {
                    // Recursively flatten the nested reports without adding any role prefix
                    flattenedData.push(...flattenReports([nestedReport]));
                });
            }
        });

        return flattenedData;
    };


    // Function to prepare all data for Excel export
    const prepareDataForExcel = () => {
        const groupedReports = groupByUserRole(orgData.reports); // Group reports by user role
        let flattenedData = [];

        // Flatten the reports for each role
        Object.keys(groupedReports).forEach((role) => {
            flattenedData.push(...flattenReports(groupedReports[role], role));
        });

        return flattenedData; // Return the flattened data array
    };

    // Function to trigger the Excel download
    const downloadExcel = () => {
        const dataForExcel = prepareDataForExcel(); // Prepare the data

        const ws = XLSX.utils.json_to_sheet(dataForExcel); // Convert data to Excel sheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Reports');

        // Save the Excel file
        XLSX.writeFile(wb, 'Reports.xlsx');
    };

    return (
        <Layout>
            <div className='row mt-2'>
                <div className='col-12'>
                    <div className='card p-2 py-0 mb-2'>
                        <div className='row'>
                            <div className='col-12 col-md-5 d-flex flex-row align-items-center'>
                                <img
                                    src={"../../assets/img/menlogo.jpg"}
                                    height="120" width="120"
                                    alt="User avatar"
                                    className="rounded me-2 me-sm-4"
                                />
                                <div className='d-flex flex-column'>
                                    <h5 className='text-dark fw-semibold mb-1'>{fullName}</h5>
                                    <span>{userRole}</span>
                                </div>
                            </div>

                            <div className="col-12 col-md-7 mb-3 d-flex justify-content-between align-items-center p-3">
                                <div className="d-flex flex-column align-items-center px-2">
                                    <span className="fs-4 fw-bold text-primary">{orgData && orgData.cumulativeAdvisors}</span>
                                    <p className="mb-0 text-secondary">Advisors</p>
                                </div>
                                <div className="d-flex flex-column align-items-center px-2 border-start border-secondary">
                                    <span className="fs-4 fw-bold text-primary">{orgData && orgData.cumulativeCustomers}</span>
                                    <p className="mb-0 text-secondary">Customers</p>
                                </div>
                                <div className="d-flex flex-column align-items-center px-2 border-start border-secondary">
                                    <span className="fs-4 fw-bold text-primary">{orgData && orgData.cumulativeSales}</span>
                                    <p className="mb-0 text-secondary">Sales</p>
                                </div>
                                <div className="d-flex flex-column align-items-center px-2 border-start border-secondary">
                                    <span className="fs-4 fw-bold text-primary">
                                        ₹ {orgData && orgData.cumulativeSaleAmount?.toLocaleString("en-IN")}
                                    </span>
                                    <p className="mb-0 text-secondary">Amount</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="col-md-12 mb-2">
                    <h3>Filter</h3>
                    {displayDates.startDate ? (
                        <h5> Dates: ({formatDate1(displayDates.startDate)} to {formatDate1(displayDates.endDate)}) </h5>
                    ) : null}
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
                </div>

                {filterLoading ? (
                    <div className="text-center mt-5">
                        <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {orgData && orgData.reports && orgData.reports.length > 0 ? (
                            <div className="container mt-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="mb-0">{`Welcome, ${fullName || "User"} (${userRole || "Role"})`}</h5>
                                    <div className="d-flex align-items-center">
                                        <button
                                            className={`btn ${isExpanded ? "btn-danger" : "btn-primary"} mx-2`}
                                            onClick={handleToggleExpand}
                                        >
                                            {isExpanded ? "Close All" : "Expand All"}
                                        </button>
                                        <button className="btn btn-success d-flex align-items-center" onClick={downloadExcel}>
                                            <FaDownload className="mr-2" /> {/* Add space between the icon and the text */}
                                            Download Excel
                                        </button>
                                    </div>
                                </div>

                                <table className="table table-striped table-hover table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Full Name</th>
                                            <th>Role</th>
                                            <th colSpan="2" style={{ textAlign: "center" }}>Own</th>  {/* First level Own column */}
                                            <th colSpan="2" style={{ textAlign: "center" }}>Team</th> {/* First level Team column */}
                                            <th>Advisors</th>
                                            <th>Customers</th>
                                        </tr>
                                        <tr>
                                            <th></th>
                                            <th></th>
                                            <th>Card Sales</th>  {/* Own Sales */}
                                            <th>Amount</th> {/* Own Sale Amount */}
                                            <th>Card Sales</th>  {/* Team Sales */}
                                            <th>Amount</th> {/* Team Sale Amount */}
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>{renderTable(orgData.reports)}</tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center fs-4 text-danger my-4">
                                No data available.
                            </div>

                        )}
                    </>
                )}

            </div>
        </Layout>
    )
};

export default UserDashboard;