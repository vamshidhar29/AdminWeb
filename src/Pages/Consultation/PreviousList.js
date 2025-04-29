import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchData, fetchAllData, fetchUpdateData } from "../../helpers/externapi";
import CommonTables from "../../Commoncomponents/CommonTables";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { TableSkeletonLoading } from "../../Commoncomponents/SkeletonLoading";
import { formatDate } from "../../Commoncomponents/CommonComponents";
import DescriptionCell from "../../Commoncomponents/DescriptionCell";
import { MultiSelect } from "react-multi-select-component";
import { useNavigate } from "react-router-dom";
import { Button } from '@mui/material';

export default function PreviousList(district) {
    const [loading, setLoading] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [consultationList, setConsultationList] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [toogleFeedback, setToggleFeedback] = useState("Customer");
    const [customerFeedback, setCustomerFeedback] = useState("");
    const [hospitalFeedback, setHospitalFeedback] = useState("");
    const [bookingConsultationId, setBookingConsultationId] = useState();
    const [successHosFeedback, setSuccessHosFeedback] = useState("");
    const [successCusFeedback, setSuccessCusFeedback] = useState("");
    const [submitFeedbackLoading, setSubmitFeedbackLoading] = useState(false);
    const [paidAmount, setPaidAmount] = useState();
    const [totalAmount, setTotalAmount] = useState();
    const [selectedStates, setSelectedStates] = React.useState([]);
    const [selectedDistricts, setSelectedDistricts] = React.useState([]);
    const [selectedMandals, setSelectedMandals] = useState([]);
    const [statesMultiSelect, setStatesMultiSelect] = React.useState();
    const [districtsMultiSelect, setDistricsMultiSelect] = React.useState();
    const [isDisableApply, setIsDisableApply] = useState(true);
    const [filterCriteria, setFilterCriteria] = useState([]);
    const [selectedData, setSelectedData] = useState(null);
    const [feedbackTab, setFeedbackTab] = useState("customer")
    const [selectedCustomer, setSelectedCustomer] = useState(
        {}
    );
    const [selectedStatus, setSelectedStatus] = useState({})
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const [activityData, setActivityData] = useState([]);
    const [visitedStatus, setVisitedStatus] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [feedbackPopupOpen, setFeedbackPopupOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState({ customer: null, hospital: null });
    const [open, setOpen] = useState(false);
    const [visitedStatusObj, setVisitedStatusObj] = useState(null);
    const [notVisitedStatusObj, setNotVisitedStatusObj] = useState(null);
    const [activeTabs, setActiveTabs] = useState("overview");
    const UserId = localStorage.getItem("UserId");
    const [claimedDate, setClaimedDate] = useState({})
    const [customerFeedbackStatusObj, setCustomerFeedbackStatusObj] = useState(null);
    const [hospitalFeedbackStatusObj, setHospitalFeedbackStatusObj] = useState(null);
    const [statusOptions, setStatusOptions] = useState([]);
    const [show, setShow] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [statuses, setStatuses] = useState([]);

    const tableHeads = [
        "Full Name",
        "Card Number",
        "Appointment Date",
        "Hospital Name",
        "Appointment",
        "Status",
        "Feedback",
        "Actions",
    ];

    const handleActionClick = (data) => {
        claimedData(data);
        setSelectedCustomer(data);
        setCustomerFeedback(data.CustomerFeedBack || "");
        setHospitalFeedback(data.HospitalFeedBack || "");
        setTotalAmount(data.TotalAmount || 0);
        setPaidAmount(data.PaidAmount || 0);

        setTimeout(() => {
            openFeedbackModal(data);
        }, 100);
    };

    const statusColors = {
        "Initiated": { text: "#3498db", bg: "#D6EAF8" },
        "Booked": { text: "#1abc9c", bg: "#D1F2EB" },
        "Visited": { text: "#f39c12", bg: "#FDEBD0" },
        "Customer Feedback": { text: "#e74c3c", bg: "#FADBD8" },
        "Hospital Feedback": { text: "#9b59b6", bg: "#EBDEF0" },
        "Success": { text: "#27ae60", bg: "#D5F5E3" },
        "Not Visited": { text: "#34495e", bg: "#D6DBDF" }
    };

    const tableElements =
        consultationList && consultationList.length > 0
            ? consultationList.map((data) => [
                <Link to={`/customers/details/${data.CustomerId}`} style={{ textAlign: "left", display: "block" }}>
                    {data.Name}
                </Link>,
                <p style={{ whiteSpace: "nowrap" }}>{data.CardNumber}</p>,
                <p >{formatDate(data.AppointmentDate)}</p>,
                <a href={`/hospitals/details/${data.HospitalId}`} target="_blank">
                    {data.HospitalName}
                </a>,
                <p style={{
                    color: data.PoliciesType === "Free Consultation" ? "#2ecc71" : data.PoliciesType === "Lab Investigation" ? "#e74c3c" : "#3498db",
                    backgroundColor: data.PoliciesType === "Free Consultation" ? "#D4EFDF" : data.PoliciesType === "Lab Investigation" ? "#FADBD8" : "#D6EAF8",
                    padding: "4px 8px", borderRadius: "5px", display: "inline-block", whiteSpace: "nowrap"
                }}>
                    {data.PoliciesType}
                </p>,
                <p style={{
                    color: statusColors[data.StatusName?.trim()]?.text || "#000",
                    backgroundColor: statusColors[data.StatusName?.trim()]?.bg || "#fff",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    display: "inline-block",
                    whiteSpace: "nowrap"
                }}>
                    {data.StatusName}
                </p>,
                <Button
                    onClick={() => openFeedbackPopup(data.CustomerFeedBack, data.HospitalFeedBack)}
                    size="small"
                    sx={{
                        border: '1px solid #aaa',
                        color: '#333',
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        transition: 'all 0.2s ease-in-out',
                        backgroundColor: '#f5f7fa',

                    }}
                >
                    View
                </Button>,
                <div className="align-items-stretch">
                    <button
                        className="btn btn-primary btn-sm w-100"
                        data-bs-toggle="modal"
                        data-bs-target="#feedbackModal"
                        onClick={() => handleActionClick({ ...data })}
                    >
                        Action
                    </button>
                </div>,
            ])
            : [];

    const colorPalette = {
        primary: '#3498db',
        secondary: '#2ecc71',
        success: '#1abc9c',
        warning: '#f39c12',
        danger: '#e74c3c',
        info: '#9b59b6',
        light: '#ecf0f1',
        dark: '#34495e'
    };
    const handleOpen = () => {
        setOpen(true);
    };
    const openFeedbackPopup = (customerFeedback, hospitalFeedback) => {
        setSelectedFeedback({
            customer: customerFeedback,
            hospital: hospitalFeedback
        });
        setFeedbackPopupOpen(true);
    };

    const closeFeedbackPopup = () => {
        setFeedbackPopupOpen(false);
    }

    const claimedData = async (data) => {
        try {
            setLoading(true);
            const response = await fetchData(`lambdaAPI/BookingConsultationActivity/GetBookingActivityByBookingId`, {
                BookingConsultationId: data.BookingConsultationId,
            })
            setClaimedDate(Array.isArray(response) ? response : []);

            if (Array.isArray(response) && response.length > 0) {
                const reversedResponse = [...response].reverse();
                const apiStatuses = reversedResponse.map((item, index) => {
                    let icon = "bi bi-circle-fill";
                    let color = "primary";

                    switch (item.StatusNamec) {
                        case 'Initiated': icon = "bi bi-dot"; color = "primary"; break;
                        case 'Booked': icon = "bi bi-calendar-check-fill"; color = "success"; break;
                        case 'Visited': icon = "bi bi-building"; color = "info"; break;
                        case 'Customer Feedback': icon = "bi bi-chat-left-text-fill"; color = "warning"; break;
                        case 'Hospital Feedback': icon = "bi bi-clipboard-check-fill"; color = "dark"; break;
                        case 'Success': icon = "bi bi-check-circle-fill"; color = "success"; break;
                        case 'Not Visited': icon = "bi bi-x-circle-fill"; color = "danger"; break;
                        default: icon = "bi bi-circle-fill"; color = "secondary"; break;
                    }

                    return {
                        id: index + 1,
                        value: item.StatusNamec,
                        isActive: true,
                        icon: icon,
                        color: color,
                        completed: true,
                        apiItem: item
                    };
                });
                setStatuses(apiStatuses);
                setCurrentStep(apiStatuses.length);
            } else {
                setStatuses([]);
                setCurrentStep(0);
            }
        } catch (error) {
            console.error("Error fetching claimedData data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getStatus = async () => {
            setLoading(true);
            try {
                const statusData = await fetchAllData("lambdaAPI/Status/all", { skip: 0, take: 0 });
                if (statusData && statusData.length > 0) {
                    const status = statusData.map((item) => ({
                        label: item.Value,
                        value: item.StatusId
                    }));
                    setStatusOptions(status);
                    setVisitedStatusObj({ label: "Visited", value: 4 });
                    setNotVisitedStatusObj({ label: "Not Visited", value: 8 });
                    setCustomerFeedbackStatusObj({ label: "Customer Feedback", value: 5 });
                    setHospitalFeedbackStatusObj({ label: "Hospital Feedback", value: 6 });

                    if (visitedStatus === true) {
                        setSelectedStatus({ label: "Visited", value: 4 });
                    } else if (visitedStatus === false) {
                        setSelectedStatus({ label: "Not Visited", value: 8 });
                    } else if (visitedStatus === "customerFeedback") {
                        setSelectedStatus({ label: "CustomerFeedback", value: 5 });
                    } else if (visitedStatus === "hospitalFeedback") {
                        setSelectedStatus({ label: "HospitalFeedback", value: 6 });
                    }
                }
            } catch (error) {
                console.error("Error fetching statuses:", error);
            } finally {
                setLoading(false);
            }
        };

        getStatus();
    }, [visitedStatus]);

    const handleRadioChange = (isVisited) => {
        if (visitedStatus !== isVisited) {

            setTimeout(() => {
                setVisitedStatus(isVisited);
                setSelectedStatus(isVisited ?
                    { label: "Visited", value: 4 } :
                    { label: "Not Visited", value: 8 }
                );
            }, 0);
        }
    };

    const handleUpdate = async () => {
        if (!selectedData?.BookingConsultationId) {
            alert("No booking consultation selected.");
            return;
        }
        if (!selectedStatus?.value) {
            alert("Please select a status before updating.");
            return;
        }

        const updateData = [
            {
                ColumnName: "Status",
                ColumnValue: selectedStatus.value,
                TableName: "BookingConsultation",
                tableId: selectedData.BookingConsultationId,
                updatedBy: UserId,
            }
        ];

        try {
            const response = await fetchUpdateData("lambdaAPI/BookingConsultation/Update", updateData);

            if (response?.status === false) {
                console.error("API Error:", response.message);
                alert(`API Error: ${response.message}`);
                return;
            }

            alert("Visitor status updated successfully! ✅");
            await getConsultationList();
            window.location.href = "/HospitalConsultation/previous";
        } catch (error) {
            console.error("API Update Failed:", error);
            alert("Failed to update status: " + (error.response?.data?.message || error.message));
        }
    };

    const customerFeedbacks = async (e) => {
        e.preventDefault();
        const statusIdToUse = selectedStatus?.value !== undefined
            ? selectedStatus.value
            : (customerFeedbackStatusObj?.value !== undefined
                ? customerFeedbackStatusObj.value
                : null);

        if (statusIdToUse === null) {
            console.error("No status ID available - cannot proceed");
            setErrorMessage("Status information not available. Please try again.");
            return;
        }

        setSubmitFeedbackLoading(true);
        setErrorMessage("");

        try {
            const statusUpdateData = [
                {
                    ColumnName: "Status",
                    ColumnValue: statusIdToUse,
                    TableName: "BookingConsultation",
                    tableId: selectedData.BookingConsultationId,
                    updatedBy: UserId,
                }
            ];

            const statusResult = await fetchUpdateData(
                "lambdaAPI/BookingConsultation/Update",
                statusUpdateData
            );
            const feedbackUpdateData = [
                {
                    ColumnName: "CustomerFeedback",
                    ColumnValue: customerFeedback,
                    TableName: "BookingConsultation",
                    tableId: selectedData.BookingConsultationId,
                    updatedBy: UserId,
                },
                {
                    ColumnName: "PaidAmount",
                    ColumnValue: paidAmount || 0,
                    TableName: "BookingConsultation",
                    tableId: selectedData.BookingConsultationId,
                    updatedBy: UserId,
                },
                {
                    ColumnName: "TotalAmount",
                    ColumnValue: totalAmount || 0, 
                    TableName: "BookingConsultation",
                    tableId: selectedData.BookingConsultationId,
                    updatedBy: UserId,
                }
            ];

            const feedbackResult = await fetchUpdateData(
                "lambdaAPI/BookingConsultation/Update",
                feedbackUpdateData
            );

            setSuccessCusFeedback("Customer feedback submitted successfully! ✅");
            handleResetFeedback();
            await getConsultationList();

        } catch (error) {
            console.error("API call failed with error:", error);
            setErrorMessage("Submission failed. Please try again.");
        } finally {
            setSubmitFeedbackLoading(false);
        }
    };

    const openFeedbackModal = (data) => {
        setSelectedData(data);
        setSelectedStatus(data);
        setActiveTabs("overview");
        setShow(true);

        setTimeout(() => {
            document.getElementById("feedbackModal")?.focus();
        }, 100);
    };
    useEffect(() => {
        if (activityData.length > 0) {
           
        }
    }, [activityData]);

    const openFeedbackForm = (feedbackType, data) => {
        if (feedbackType === "Customer") {
            setToggleFeedback("Customer");
            setCustomerFeedback(
                data.CustomerFeedBack === null ? "" : data.CustomerFeedBack
            );
            setPaidAmount(data.PaidAmount || 0);
            setTotalAmount(data.TotalAmount || 0);
            setSuccessCusFeedback("");
        } else if (feedbackType === "Hospital") {
            setToggleFeedback("Hospital");
            setHospitalFeedback(
                data.HospitalFeedBack === null ? "" : data.HospitalFeedBack
            );
            setSuccessHosFeedback("");
        }
        setBookingConsultationId(data.BookingConsultationId);
    };
    // const handleActionClick = () => {
    //     claimedData();
    //     openFeedbackModal(selectedData);
    //   };
    const getConsultationList = async () => {
        try {
            setLoading(true);

            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            let response;
            let responseCount;

            if (filterCriteria.length > 0) {
                response = await fetchData(
                    "BookingConsultation/GetDataByHospitalLocation",
                    {
                        skip,
                        take,
                        filter: filterCriteria,
                    }
                );
                responseCount = await fetchData(
                    "BookingConsultation/GetDataByHospitalLocationCount",
                    { skip: 0, take: 0, filter: filterCriteria }
                );
            } else {
                response = await fetchData(
                    `lambdaAPI/BookingConsultation/BookingConsultationListBasedonCurrentDate`,
                    { skip, take }
                );
                responseCount = await fetchData(
                    "lambdaAPI/BookingConsultation/BookingConsultationListBasedonCurrentDateCount",
                    { skip: 0, take: 0 }
                );
            }

            setConsultationList(response);
            setIsDataLoaded(true);
            setTotalCount(responseCount[0].totalCount);
        } catch (e) {
            console.error("Error fetching Concultation list: ", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getStates = async () => {
            setLoading(true);
            const statesData = await fetchData("States/all", { skip: 0, take: 0 });
            const statesArray =
                statesData &&
                statesData.map((item) => ({
                    label: item.StateName,
                    value: item.StateId,
                }));
            setStatesMultiSelect(statesArray);
            setLoading(false);
        };

        const getDistricts = async (event) => {
            setLoading(true);
            const districtsData = await fetchData("Districts/all", {
                skip: 0,
                take: 0,
            });
            const districtsArray =
                districtsData &&
                districtsData.map((item) => ({
                    label: item.DistrictName,
                    value: item.DistrictId,
                }));
            setDistricsMultiSelect(districtsArray);
            setLoading(false);
        };

        getStates();
        getDistricts();
    }, []);

    useEffect(() => {
        if (
            selectedStates.length === 0 &&
            selectedDistricts.length === 0 &&
            selectedMandals.length === 0
        ) {
            setIsDisableApply(true);
        } else {
            setIsDisableApply(false);
        }
    }, [selectedStates, selectedDistricts, selectedMandals]);

    // const getConsultationListByHospital = async () => {
    //     try {
    //         setLoading(true);
    //         const skip = (currentPage - 1) * perPage;
    //         const take = perPage;

    //         let responspeByHos;
    //         let responspeByHosCount;

    //         if (filterCriteria.length > 0) {
    //             responspeByHos = await fetchData("BookingConsultation/GetDataByHospitalLocation", {
    //                 skip,
    //                 take,
    //                 filter: filterCriteria
    //             });
    //         } else {

    //             responspeByHos = await fetchData("BookingConsultation/GetDataByHospitalLocation", {
    //                 skip, take,
    //                 filter: [{ key: "DistrictId", value: district.district, operator: "IN" }]
    //             });

    //             responspeByHosCount = await fetchData("BookingConsultation/GetDataByHospitalLocation", {
    //                 skip: 0, take: 0,
    //                 filter: [{ key: "DistrictId", value: district.district, operator: "IN" }]
    //             });
    //         }

    //         setConsultationList(responspeByHos);
    //         setIsDataLoaded(true);
    //         setTotalCount(responspeByHosCount.length);
    //     } catch (e) {
    //         console.error("Error -BookingConsultation/GetDataByHospitalLocation: ", e);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    useEffect(() => {
        getConsultationList();
    }, [currentPage, perPage, filterCriteria]);

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleMandalSelect = (event) => {
        const selectedMandal = event.target.value;
        if (selectedMandal === "") {
            setSelectedMandals([]);
        } else {
            setSelectedMandals([...selectedMandals, selectedMandal]);
        }
    };

    const onSubmitFeedback = async (e) => {
        e.preventDefault();


        const statusIdToUse = selectedStatus?.value !== undefined
            ? selectedStatus.value
            : (hospitalFeedbackStatusObj?.value !== undefined
                ? hospitalFeedbackStatusObj.value
                : null);

        if (statusIdToUse === null) {
            console.error("No status ID available - cannot proceed");
            setErrorMessage("Status information not available. Please try again.");
            return;
        }

        setSubmitFeedbackLoading(true);
        setErrorMessage("");

        try {
            const statusUpdateData = [
                {
                    ColumnName: "Status",
                    ColumnValue: statusIdToUse,
                    TableName: "BookingConsultation",
                    tableId: selectedData.BookingConsultationId,
                    updatedBy: UserId,
                }
            ];

            const statusResult = await fetchUpdateData(
                "lambdaAPI/BookingConsultation/Update",
                statusUpdateData
            );


            const hospitalUpdateData = [
                {
                    columnName: "HospitalFeedback",
                    columnValue: hospitalFeedback,
                    tableName: "BookingConsultation",
                    tableId: selectedData.BookingConsultationId,
                    statuses: statusIdToUse,
                    UpdatedBy: UserId,
                }
            ];


            const EditData = await fetchUpdateData(
                "lambdaAPI/BookingConsultation/Update",
                hospitalUpdateData
            );

            if (EditData) {
                setSuccessHosFeedback("Hospital feedback submitted successfully! ✅");
                setTimeout(() => {
                    closeFeedbackModal();
                    getConsultationList();
                }, 1500);
                handleResetFeedback();
            }
        } catch (error) {
            console.error("Submission error:", error);
            setErrorMessage("Submission failed. Please try again.");
        } finally {
            setSubmitFeedbackLoading(false);
        }
    };

    const handleResetFeedback = () => {
        setCustomerFeedback("");
        setHospitalFeedback("");
        setPaidAmount("");
        setTotalAmount("");
        setFeedbackTab("customer");
        setFeedbackTab("hospital");
        setActiveTabs("overview");
        setSuccessCusFeedback("");
        setSuccessHosFeedback("");
        window.location.reload();
    };

    const clearFilters = async () => {
        setSelectedStates([]);
        setSelectedDistricts([]);
        setSelectedMandals([]);
        setIsDisableApply(true);
        document.getElementById("mandal-input").value = "";
        setFilterCriteria([]);
        getConsultationList();
    };

    const closeFeedbackModal = (e) => {
        // Check if e exists before using its methods
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Close the modal
        setShow(false);
    };

    const applyFilter = async () => {
        setLoading(true);
        //const mobileNo = document.getElementById("mobile-input").value;
        const selectedStateIds =
            selectedStates && selectedStates.map((state) => state.value);
        const selectedDistrictIds =
            selectedDistricts && selectedDistricts.map((district) => district.value);
        const mandal = document.getElementById("mandal-input").value;

        const filterCriteria = [];

        //if (name.trim() !== "") {
        //    filterCriteria.push({
        //        key: "Name",
        //        value: name,
        //        operator: "LIKE"
        //    });
        //}
        //if (mobileNo.trim() !== "") {
        //    filterCriteria.push({
        //        key: "MobileNumber",
        //        value: mobileNo,
        //        operator: "LIKE"
        //    });
        //}
        if (selectedStateIds.length > 0) {
            filterCriteria.push({
                key: "StateId",
                value: selectedStateIds.join(","),
                operator: "IN",
            });
        }
        if (selectedDistrictIds.length > 0) {
            filterCriteria.push({
                key: "DistrictId",
                value: selectedDistrictIds.join(","),
                operator: "IN",
            });
        }

        if (mandal.trim() !== "") {
            filterCriteria.push({
                key: "Mandal",
                value: mandal,
                operator: "LIKE",
            });
        }

        try {
            const filterData = await fetchData(
                "BookingConsultation/GetDataByHospitalLocation",
                {
                    skip: 0,
                    take: perPage,
                    filter: filterCriteria,
                }
            );

            const fiterCount = await fetchData(
                "BookingConsultation/GetDataByHospitalLocationCount",
                {
                    skip: 0,
                    take: 0,
                    filter: filterCriteria,
                }
            );

            setPerPage(perPage);
            setCurrentPage(1);

            setFilterCriteria(filterCriteria);
            setConsultationList(filterData);
            setTotalCount(fiterCount.length);
        } catch (error) {
            console.error("Error applying filter:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterUI = () => (
        <>
            {(selectedStates.length > 0 ||
                selectedDistricts.length > 0 ||
                selectedMandals.length > 0) && (
                    <div className="card p-1 my-1 sticky-top" style={{ zIndex: 1 }}>
                        <div
                            className="select2-primary mx-2 mb-2"
                            style={{ display: "flex", flexWrap: "wrap" }}
                        >
                            <>
                                <strong style={{ marginRight: "5px" }}>Filter Criteria - </strong>

                                {selectedStates.length > 0 && (
                                    <div
                                        style={{
                                            marginRight: "10px",
                                            marginBottom: "0px",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <strong style={{ marginRight: "5px" }}>State : </strong>
                                        {selectedStates.map((state, index) => (
                                            <span key={state.value} className="selected-option-button">
                                                {state.label}
                                                {index !== selectedStates.length - 1 && ", "}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {selectedDistricts.length > 0 && (
                                    <div
                                        style={{
                                            marginRight: "10px",
                                            marginBottom: "0px",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <strong style={{ marginRight: "5px" }}>District : </strong>
                                        {selectedDistricts.map((district, index) => (
                                            <span
                                                key={district.value}
                                                className="selected-option-button"
                                            >
                                                {district.label}
                                                {index !== selectedDistricts.length - 1 && ", "}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {selectedMandals.length > 0 && (
                                    <div
                                        style={{
                                            marginRight: "10px",
                                            marginBottom: "0px",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <strong style={{ marginRight: "5px" }}>Mandal : </strong>
                                        <span className="selected-option-button">
                                            {selectedMandals[selectedMandals.length - 1]}
                                        </span>
                                    </div>
                                )}
                            </>
                        </div>
                    </div>
                )}
        </>
    );

    return (
        <>
            {loading ? (
                <TableSkeletonLoading />
            ) : !isDataLoaded ? (
                <TableSkeletonLoading />
            ) : (
                <>
                    {filterUI()}
                    <div className="accordion" id="accordionExample">
                        <div
                            className="modal fade"
                            id="filterModal"
                            tabIndex="-1"
                        >
                            <div className="modal-dialog modal-lg modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <div className="d-flex w-100 justify-content-between">
                                            <h5 className="modal-title" id="filterModalLabel">
                                                Filters
                                            </h5>
                                            <div className="d-flex gap-2">
                                                <button
                                                    type="reset"
                                                    className="btn btn-secondary"
                                                    data-bs-dismiss="modal"
                                                    onClick={clearFilters}
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    data-bs-dismiss="modal"
                                                    onClick={applyFilter}
                                                    disabled={isDisableApply}
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"

                                        ></button>
                                    </div>

                                    <div className="modal-body">
                                        <div className="accordion-body">
                                            <div className="row mb-3">
                                                {/* States Select */}
                                                <div className="col-12 col-md-6">
                                                    <label htmlFor="select2Success" className="form-label">
                                                        States
                                                    </label>
                                                    <div className="select2-primary">
                                                        {statesMultiSelect && (
                                                            <MultiSelect
                                                                options={statesMultiSelect}
                                                                value={selectedStates}
                                                                onChange={setSelectedStates}
                                                                className="w-100"
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Districts Select */}
                                                <div className="col-12 col-md-6">
                                                    <label htmlFor="select2Success" className="form-label">
                                                        Districts
                                                    </label>
                                                    <div className="select2-primary">
                                                        {districtsMultiSelect && (
                                                            <MultiSelect
                                                                options={districtsMultiSelect}
                                                                value={selectedDistricts}
                                                                onChange={setSelectedDistricts}
                                                                className="w-100"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mandal Input */}
                                            <div className="row mb-3">
                                                <div className="col-12">
                                                    <label htmlFor="mandal-input" className="form-label">
                                                        Mandal
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={selectedMandals[selectedMandals.length - 1]}
                                                        id="mandal-input"
                                                        className="form-control"
                                                        maxLength="50"
                                                        onChange={handleMandalSelect}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className="modal-footer">
              <button
                type="reset"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={clearFilters}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={applyFilter}
                disabled={isDisableApply}
              >
                Apply
              </button>
            </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card mt-2">
                        {consultationList && consultationList.length > 0 ? (
                            <CommonTables
                                tableHeads={tableHeads}
                                tableData={tableElements}
                                perPage={perPage}
                                currentPage={currentPage}
                                perPageChange={handlePerPageChange}
                                pageChange={handlePageChange}
                                totalCount={totalCount}
                            />
                        ) : (
                            <h4 className="text-danger text-center m-3">No records exists</h4>
                        )}

                        <Snackbar
                            open={snackbarOpen}
                            autoHideDuration={3000}
                            onClose={handleSnackbarClose}
                            anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                            <Alert onClose={handleSnackbarClose} severity="success">
                                {snackbarMessage}
                            </Alert>
                        </Snackbar>
                    </div>
                </>
            )}

            {/* Feedback Dialog */}
            {feedbackPopupOpen && (
                <>
                    <div
                        className="modal fade show"
                        style={{ display: 'block' }}
                        tabIndex="-1"
                        onClick={(e) => {
                            if (e.target.classList.contains('modal')) {
                                closeFeedbackPopup();
                            }
                        }}>
                        <div
                            className="modal-dialog modal-dialog-centered"
                            style={{ maxWidth: '600px', margin: 'auto' }}>
                            <div className="modal-content border-0" style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                {/* Header */}
                                <div
                                    className="modal-header"
                                    style={{
                                        backgroundColor: '#f2f2f2',
                                        padding: '0.75rem 1rem',
                                        borderBottom: '1px solid #ddd'
                                    }}>
                                    <h6
                                        className="modal-title text-dark fw-semibold m-0"
                                        style={{ fontSize: '0.9rem', color: '#9b59b6' }}>
                                        Feedback
                                    </h6>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={closeFeedbackPopup}
                                        aria-label="Close">
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="modal-body px-3 py-2" style={{ backgroundColor: '#fff' }}>
                                    {/* Customer Feedback */}
                                    <div className="mb-3">
                                        <h6
                                            className="mb-1 d-flex align-items-center"
                                            style={{ fontSize: '0.9rem', color: '#0d6efd', fontWeight: 600 }}>
                                            <i className="bi bi-person me-a 2"></i>Customer Feedback
                                        </h6>
                                        <div
                                            className="card border-0"
                                            style={{
                                                backgroundColor: '#f8f9fa',
                                                borderLeft: '3px solid #adb5bd',
                                                borderRadius: '4px'
                                            }}>
                                            <div className="card-body p-2 text-dark" style={{ fontSize: '0.85rem' }}>
                                                <DescriptionCell description={selectedFeedback.customer || "Not yet received"} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hospital Feedback */}
                                    <div>
                                        <h6
                                            className="mb-1 d-flex align-items-center"
                                            style={{ fontSize: '0.9rem', color: '#20c997', fontWeight: 600 }}
                                        >
                                            <i className="bi bi-hospital me-2"></i>Hospital Feedback
                                        </h6>
                                        <div
                                            className="card border-0"
                                            style={{
                                                backgroundColor: '#f8f9fa',
                                                borderLeft: '3px solid #ced4da',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            <div className="card-body p-2 text-dark" style={{ fontSize: '0.85rem' }}>
                                                <DescriptionCell description={selectedFeedback.hospital || "Not yet received"} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div
                                    className="modal-footer py-2 px-3"
                                    style={{ backgroundColor: '#f2f2f2', borderTop: '1px solid #ddd' }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-sm"
                                        onClick={closeFeedbackPopup}
                                        style={{
                                            backgroundColor: '#e9ecef',
                                            color: '#333',
                                            borderRadius: '4px',
                                            padding: '4px 12px',
                                            fontSize: '0.8rem',
                                            fontWeight: '500',
                                            border: '1px solid #ccc'
                                        }}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal Backdrop */}
                    <div
                        className="modal-backdrop fade show"
                        onClick={closeFeedbackPopup}
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
                    ></div>
                </>
            )}

            <div
                className={`modal fade ${show ? "show" : ""}`}
                id="feedbackModal"
                tabIndex={-1}>
                <div className="modal-dialog w-auto modal-dialog-centered" style={{ maxWidth: "80vw", minWidth: "50vw" }}>
                    <div className="modal-content shadow rounded-2 border border-secondary" style={{ maxWidth: "unset" }}>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                zIndex: 9999,
                            }}
                        ></button>
                        <div className="modal-body p-2 pt-2 bg-light bg-gradient rounded-2">
                            {/* Tabs Navigation */}
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link fw-semibold ${activeTabs === 'overview' ? ' bg-info text-white' : 'bg-light text-dark'}`}
                                        onClick={() => setActiveTabs('overview')}
                                    >
                                        <i className="bi bi-layout-text-window-reverse me-2"></i>
                                        Overview
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link fw-semibold ${activeTabs === 'feedback' ? ' bg-warning text-dark' : 'bg-light text-dark'}`}
                                        onClick={() => setActiveTabs('feedback')}
                                    >
                                        <i className="bi bi-chat-left-text me-2"></i>
                                        Feedback
                                    </button>
                                </li>
                            </ul>

                            {/* Tab Content */}
                            <div className="tab-content mt-1">
                                {/* Overview Tab */}
                                {activeTabs === "overview" && selectedData && (
                                    <div className="container-fluid px-3 py-2">
                                        {/* Flow Chart Section */}
                                        <div className="container-fluid px-3 py-2">
                                            <div className="w-100 d-flex justify-content-center">
                                                <div className="w-100 d-flex justify-content-center">
                                                    <div
                                                        className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-md-between w-100 px-3 py-2"
                                                        style={{ maxWidth: "1000px", margin: "0 auto" }}
                                                    >
                                                        {statuses.map((status, index) => {
                                                            const isCompleted = status.completed;
                                                            const isCurrent = index === currentStep - 1;
                                                            const statusColor = colorPalette[status.color] || "#ccc";
                                                            const connectionColor = statusColor;

                                                            return (
                                                                <div
                                                                    key={status.id}
                                                                    className="position-relative d-flex flex-row flex-md-column align-items-start align-items-md-center mb-4 mb-md-0"
                                                                    style={{
                                                                        flex: 1,
                                                                        paddingLeft: "10px",
                                                                        paddingRight: "10px",
                                                                    }}
                                                                >
                                                                    {/* Vertical Line for Mobile - Centered between icons */}
                                                                    {index !== 0 && (
                                                                        <div
                                                                            className="d-block d-md-none"
                                                                            style={{
                                                                                position: "absolute",
                                                                                top: "-24px", // Half the height of the connection to center it
                                                                                left: "35px", // Moved more to the right to be in the center of the icon
                                                                                width: "2px",
                                                                                height: "24px", // Reduced to connect centers
                                                                                backgroundColor: connectionColor,
                                                                                zIndex: 0,
                                                                            }}
                                                                        />
                                                                    )}

                                                                    {/* Horizontal Line for Desktop */}
                                                                    {index !== 0 && (
                                                                        <div
                                                                            className="d-none d-md-block"
                                                                            style={{
                                                                                position: "absolute",
                                                                                top: "24px", // Centers with the icon (48px/2)
                                                                                left: "-50%",
                                                                                width: "100%",
                                                                                height: "2px",
                                                                                backgroundColor: connectionColor,
                                                                                zIndex: 0,
                                                                            }}
                                                                        />
                                                                    )}

                                                                    {/* Icon Container with Fixed Width for Mobile */}
                                                                    <div
                                                                        className="d-flex flex-row flex-md-column align-items-center"
                                                                        style={{
                                                                            position: "relative", // Makes positioning of children more predictable
                                                                            width: "auto", // Allow natural width
                                                                        }}
                                                                    >
                                                                        {/* Icon - Centered in Mobile */}
                                                                        <div
                                                                            style={{
                                                                                width: "48px",
                                                                                height: "48px",
                                                                                borderRadius: "50%",
                                                                                backgroundColor: isCompleted ? statusColor : "#f8f9fa",
                                                                                border: isCurrent ? `3px solid ${statusColor}` : "none",
                                                                                boxShadow: isCurrent
                                                                                    ? `0 0 12px ${statusColor}88`
                                                                                    : "0 2px 4px rgba(0,0,0,0.1)",
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                                marginRight: "12px",
                                                                                zIndex: 1,
                                                                                position: "relative", // Ensures it's above connection lines
                                                                            }}
                                                                        >
                                                                            <i
                                                                                className={`${status.icon} fs-5`}
                                                                                style={{ color: isCompleted ? "white" : statusColor }}
                                                                            />
                                                                        </div>

                                                                        {/* Label */}
                                                                        <p
                                                                            className="mb-0 fw-bold text-uppercase text-nowrap mt-0 mt-md-2"
                                                                            style={{
                                                                                fontSize: "0.75rem",
                                                                                color: isCompleted ? statusColor : "#6c757d",
                                                                            }}
                                                                        >
                                                                            {status.value}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Visit Status Controls */}
                                            {Array.isArray(claimedDate) &&
                                                claimedDate.length > 0 &&
                                                !claimedDate.some((item) => item.StatusNamec === "Visited") && (
                                                    <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-2 gap-sm-3 mb-4 mt-2 text-center">
                                                        <label className="d-flex align-items-center gap-2 mb-2 mb-sm-0">
                                                            <input
                                                                type="radio"
                                                                name="visit-status"
                                                                value="Visited"
                                                                checked={visitedStatus === true}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRadioChange(true);
                                                                }}
                                                                className="form-check-input"
                                                            />
                                                            <span className="text-nowrap">Visited ✅</span>
                                                        </label>

                                                        <label className="d-flex align-items-center gap-2 mb-2 mb-sm-0">
                                                            <input
                                                                type="radio"
                                                                name="visit-status"
                                                                value="Not Visited"
                                                                checked={visitedStatus === false}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRadioChange(false);
                                                                }}
                                                                className="form-check-input"
                                                            />
                                                            <span className="text-nowrap">Not Visited ❌</span>
                                                        </label>

                                                        <button
                                                            className="btn btn-primary btn-sm px-3"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleUpdate();
                                                            }}
                                                            disabled={submitLoading}
                                                        >
                                                            {submitLoading ? "Updating..." : "Update"}
                                                        </button>
                                                    </div>
                                                )}

                                            {/* Status List */}
                                            <div className="container-fluid px-0 px-sm-4 py-3">
                                                <h5 className="mt-2 mb-3 text-primary fw-bold">Status List</h5>
                                                <div className="container-fluid px-0 px-sm-1 py-2">
                                                    <div className="border rounded-3 p-2 p-sm-3 bg-white shadow-sm">
                                                        {claimedDate && claimedDate.length > 0 ? (
                                                            claimedDate.map((item, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="row g-2 align-items-center py-2"
                                                                    style={{
                                                                        borderBottom: index !== claimedDate.length - 1 ? "1px solid #e0e0e0" : "none"
                                                                    }}
                                                                >
                                                                    {/* Status Badge */}
                                                                    <div className="col-12 col-sm-6 col-lg-3 mb-1 mb-lg-0">
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="me-2 fs-6">✅</span>
                                                                            <span className="fw-semibold">Status:</span>
                                                                            <span className="fw-bold text-dark ms-1 text-truncate">{item.StatusNamec}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Employee Name */}
                                                                    <div className="col-12 col-sm-6 col-lg-3 mb-1 mb-lg-0">
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="me-2 fs-6">👤</span>
                                                                            <span className="fw-semibold">Name:</span>
                                                                            <span className="fw-bold text-dark ms-1 text-truncate">{item.EmployeeName}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Activity Category */}
                                                                    <div className="col-12 col-sm-6 col-lg-3 mb-1 mb-lg-0">
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="me-2 fs-6">📌</span>
                                                                            <span className="fw-semibold">Activity:</span>
                                                                            <span className="fw-bold text-dark ms-1 text-truncate">{item.ActivityCategory}</span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Created Date */}
                                                                    <div className="col-12 col-sm-6 col-lg-3 mb-1 mb-lg-0">
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="me-2 fs-6">🕒</span>
                                                                            <span className="small text-truncate">
                                                                                {new Date(item.CreatedDate).toLocaleString("en-IN", {
                                                                                    day: "2-digit",
                                                                                    month: "short",
                                                                                    year: "numeric",
                                                                                    hour: "2-digit",
                                                                                    minute: "2-digit",
                                                                                    hour12: true
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-3">
                                                                <p className="text-muted mb-0">No data available</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Responsive styles for connection lines */}
                                            <style>{`
                               @keyframes pulse {
                                 0% { transform: scale(1); opacity: 0.7; }
                                 50% { transform: scale(1.05); opacity: 0.9; }
                                 100% { transform: scale(1); opacity: 0.7; }
                               }
                               
                               @media (max-width: 576px) {
                                 .text-truncate {
                                   max-width: 180px;
                                 }
                               }
                               
                               @media (max-width: 768px) {
                                 /* Responsive adjustment for connection lines on mobile */
                                 .position-absolute {
                                   width: calc(100% - 20px) !important;
                                   right: calc(50% + 10px) !important;
                                 }
                               }
                             `}</style>
                                        </div>
                                    </div>
                                )}

                                {/* Feedback Tab */}
                                {activeTabs === "feedback" && (
                                    <div>
                                        {/* Sub-tabs for Feedback */}
                                        <ul className="nav nav-tabs border-bottom border-dark">
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link fw-semibold d-flex align-items-center gap-2 ${feedbackTab === "customer" ? "border-bottom border-info text-white bg-info" : "text-dark bg-light"}`}
                                                    onClick={() => setFeedbackTab("customer")}
                                                >
                                                    <i className={`fas fa-users ${feedbackTab === "customer" ? "text-white" : "text-info"}`}></i>
                                                    Customer Feedback
                                                </button>
                                            </li>
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link fw-semibold d-flex align-items-center gap-2 ${feedbackTab === "hospital" ? "border-bottom border-danger text-white bg-danger" : "text-dark bg-light"}`}
                                                    onClick={() => setFeedbackTab("hospital")}
                                                >
                                                    <i className={`fas fa-hospital ${feedbackTab === "hospital" ? "text-white" : "text-danger"}`}></i>
                                                    Hospital Feedback
                                                </button>
                                            </li>
                                        </ul>

                                        <div className="tab-content mt-2">
                                            {/* Customer Feedback */}
                                            {feedbackTab === "customer" && (
                                                <div className="p-3 border border-info rounded bg-light shadow-sm">
                                                    <h5 className="fw-bold text-primary">Customer Feedback</h5>
                                                    <textarea
                                                        className="form-control mb-2"
                                                        placeholder="Enter Customer Feedback"
                                                        value={customerFeedback}
                                                        onChange={(e) => setCustomerFeedback(e.target.value)}
                                                    />

                                                    <div className="row mb-2">
                                                        <div className="col-6">
                                                            <label className="fw-semibold">Paid Amount</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={paidAmount}
                                                                onChange={(e) => setPaidAmount(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (["e", "E", "+", "-"].includes(e.key))
                                                                        e.preventDefault();
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="col-6">
                                                            <label className="fw-semibold">Total Amount</label>
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                value={totalAmount}
                                                                onChange={(e) => setTotalAmount(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (["e", "E", "+", "-"].includes(e.key))
                                                                        e.preventDefault();
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-info btn-sm px-3"
                                                            onClick={(e) => customerFeedbacks(e)}
                                                            disabled={submitFeedbackLoading}
                                                        >
                                                            {submitFeedbackLoading ? (
                                                                <div className="spinner-border text-white" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                            ) : (
                                                                "Submit"
                                                            )}
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-dark btn-sm"
                                                            type="button"
                                                            onClick={closeFeedbackModal}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={handleResetFeedback}
                                                        >
                                                            Reset
                                                        </button>
                                                    </div>


                                                    {successCusFeedback && (
                                                        <span className="text-success mt-2 text-center">
                                                            {successCusFeedback}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Hospital Feedback */}
                                            {feedbackTab === "hospital" && (
                                                <div className="p-3 border border-warning rounded bg-light shadow-sm">
                                                    <h5 className="fw-bold text-warning">Hospital Feedback</h5>
                                                    <textarea
                                                        className="form-control mb-2"
                                                        placeholder="Enter Hospital Feedback"
                                                        value={hospitalFeedback}
                                                        onChange={(e) => setHospitalFeedback(e.target.value)}
                                                    />

                                                    <div className="d-flex gap-2">
                                                        <button
                                                            className="btn btn-warning btn-sm px-3"
                                                            onClick={(e) => onSubmitFeedback(e)}
                                                            disabled={submitFeedbackLoading}
                                                        >
                                                            {submitFeedbackLoading ? (
                                                                <div className="spinner-border text-white" role="status">
                                                                    <span className="visually-hidden">Loading...</span>
                                                                </div>
                                                            ) : (
                                                                "Submit"
                                                            )}
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-dark btn-sm"
                                                            type="button"
                                                            onClick={closeFeedbackModal}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={handleResetFeedback}
                                                        >
                                                            Reset
                                                        </button>
                                                    </div>

                                                    {successHosFeedback && (
                                                        <span className="text-success mt-2 text-center">
                                                            {successHosFeedback}
                                                        </span>
                                                    )}
                                                </div>

                                            )}
                                        </div>
                                    </div>

                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>



        </>

    );

}