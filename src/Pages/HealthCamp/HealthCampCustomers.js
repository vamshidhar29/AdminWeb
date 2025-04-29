import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import moment from "moment";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CommonTables from "../../Commoncomponents/CommonTables";
import { fetchData, fetchAllData } from "../../helpers/externapi";
import { downloadCSVData, downloadExcelData } from '../../Commoncomponents/CommonComponents';
import * as XLSX from "xlsx";
import Modal from 'react-modal';

export default function HealthCampMembers(props) {
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [membersData, setMembersData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [viewType, setViewType] = useState("AllCustomers"); // Default view
    const [filterCriteria, setFilterCriteria] = useState([]);
    const [callLogMemberId, setCallLogMemberId] = useState();
    const [callHistory, setCallHistory] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFormVisable, setIsFormVisible] = useState(false);
    const initialFormData = {
        callHistoryId: "", callLog: "", CardNumber: "", CollectedDate: "", callResponsesId: "", RMName: "", DateToBeVisited: "", RequestCallBack: ""
    }
    const [formData, setFormData] = useState(initialFormData);
    const [formError, setFormError] = useState({});
    const thresholdDays = 5;
    const [callResponseOptions, setCallResponseOptions] = useState([]);
    const [isFormValid, setIsFormValid] = useState(false);

    const { Id } = useParams();

    let UserId = localStorage.getItem("UserId");

    const tableHeads = ["FULL NAME", "CALL HISTORY", "CONTACT", "ADDRESS", "EVENT NAME", "Sold By", "EVENT DATE"];

    const tableElements = membersData.length > 0
        ? membersData.map((data) => [
            <>
                {data.CustomerId ? (
                    <Link
                        to={`/customers/details/${data.CustomerId}`}
                        className="text-start-important"
                        style={{
                            whiteSpace: "normal",
                            textAlign: "start",
                            display: "block",
                        }}
                    >
                        {data.Name}
                    </Link>
                ) : (
                    <div style={{
                        whiteSpace: "normal",
                        textAlign: "start",
                        display: "block",
                    }}>{data.Name}</div>
                )}
            </>,
            <>
                <button
                    style={{ border: '0px', backgroundColor: 'white' }}
                    type="button"
                    onClick={() => handleCallLog(data.MemberEventsMemberId)}
                >
                    <Link>Call log Data</Link>
                </button>
            </>,
            data.MobileNumber || data.Email ? (
                <>
                    <div>
                        {data.MobileNumber ? (
                            <a href={"tel:" + data.MobileNumber}>
                                <i className="bx bx-phone-call"></i>
                                {data.MobileNumber}
                            </a>
                        ) : <p style={{ color: 'red' }}>Mobile Number doesn't exist </p>}
                    </div>
                    <div>
                        {data.Email ? (
                            <a href={"mailto:" + data.Email} className="d-flex align-items-center" style={{ whiteSpace: "normal", wordBreak: "break-all" }}>
                                <i className="fas fa-envelope"></i>
                                {data.Email}
                            </a>
                        ) : <p style={{ color: 'red' }}>Email doesn't exist</p>}
                    </div>
                </>
            ) : <p style={{ color: 'red' }}>Mobile Number and Email Id don't exist</p>,
            `${data.AddressLine1}, ${data.Village}, ${data.City}`,
            data.EventName,
            data.SaleDoneBy,
            data.EventDate ? moment(data.EventDate).format("DD-MMM-YYYY") : "",
        ])
        : [];


    useEffect(() => {
        setLoading(true);
        const fetchCallResponseOptions = async () => {
            try {
                const getResponseTypes = await fetchData('CallResponseType/all', { skip: 0, take: 0 });

                let CallResponseTypeId = getResponseTypes.filter(types => types.ResponseName === "Member");

                const response = await fetchAllData(`CallResponse/GetCallResponsesByResponseType/${CallResponseTypeId[0].CallResponseTypeId}`);
                setCallResponseOptions(response);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching call responses:", error);
                setLoading(false);
            }
        };

        fetchCallResponseOptions();
    }, []);

    const handleAllCustomersClick = async () => {

        setLoading(true);
        setViewType("AllCustomers");

        try {
            const distributorCountData = await fetchAllData(`lambdaAPI/MemberEvents/MemberEventDetailsCountById/${Id}`);
            const totalCount = distributorCountData.count || 0;
            setTotalCount(totalCount);

        } catch (error) {
            console.error("Error fetching hospital count data:", error);

        }

        try {
            const data = await fetchData("lambdaAPI/MemberEvents/MemberEventDetailsById", {
                skip: (currentPage - 1) * perPage,
                take: perPage,
                eventid: Id,
            });

            setMembersData(data)
        } catch (error) {
            console.error("Error fetching all customers:", error);
            setSnackbarMessage("Failed to fetch all customers. Please try again.");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleNonCustomersClick = async () => {

        setLoading(true);
        setViewType("NonCustomers");

        try {
            const distributorCountData = await fetchData("lambdaAPI/MemberEvents/GetCustomersAndLeadsDataCount", {
                eventid: Id,
                IsCustomers: false,
            });
            const totalCount = distributorCountData[0].totalCount || 0;
            setTotalCount(totalCount);

        } catch (error) {
            console.error("Error fetching hospital count data:", error);
        }



        try {
            const data = await fetchData("lambdaAPI/MemberEvents/GetCustomersAndLeadsData", {
                skip: (currentPage - 1) * perPage,
                take: perPage,
                eventid: Id,
                IsCustomers: false,
            });

            setMembersData(data);
        } catch (error) {
            console.error("Error fetching non-customers:", error);
            setSnackbarMessage("Failed to fetch non-customers. Please try again.");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchasedCustomersClick = async () => {

        setLoading(true);
        setViewType("PurchasedCustomers");
        try {
            const distributorCountData = await fetchData("lambdaAPI/MemberEvents/GetCustomersAndLeadsDataCount", {
                eventid: Id,
                IsCustomers: true,
            });
            const totalCount = distributorCountData[0].totalCount || 0;
            setTotalCount(totalCount);

        } catch (error) {
            console.error("Error fetching hospital count data:", error);
        }


        try {
            const data = await fetchData("lambdaAPI/MemberEvents/GetCustomersAndLeadsData", {
                skip: (currentPage - 1) * perPage,
                take: perPage,
                eventid: Id,
                IsCustomers: true,
            });
            setMembersData(data);
        } catch (error) {
            console.error("Error fetching purchased customers:", error);
            setSnackbarMessage("Failed to fetch purchased customers. Please try again.");
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (viewType === "AllCustomers") {
            handleAllCustomersClick();
        } else if (viewType === "NonCustomers") {
            handleNonCustomersClick();
        } else {
            handlePurchasedCustomersClick();
        }
    }, [viewType, currentPage, perPage]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const generateExcelFile = (data) => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        return XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    };

    const generateCSVFile = (data) => {
        const headers = Object.keys(data[0]).join(",") + "\n";
        const rows = data.map((row) => Object.values(row).join(",")).join("\n");
        return headers + rows;
    };



    const downloadExcelOrCSV = async (type) => {
        setLoading(true);
        try {
            // Determine API endpoint and parameters
            const endpoint =
                viewType === "AllCustomers"
                    ? "lambdaAPI/MemberEvents/MemberEventDetailsById"
                    : "lambdaAPI/MemberEvents/GetCustomersAndLeadsData";

            const params =
                viewType === "AllCustomers"
                    ? {
                        skip: 0, // Optional: Adjust pagination as needed
                        take: totalCount, // Fetch all data
                        eventid: Id,
                    }
                    : {
                        skip: 0,
                        take: totalCount,
                        eventid: Id,
                        IsCustomers: viewType === "PurchasedCustomers",
                    };

            // Fetch data
            const data = await fetchData(endpoint, params);
            if (!data || data.length === 0) {
                throw new Error("No data available for download.");
            }

            // Generate file content
            const fileContent = type === "excel" ? generateExcelFile(data) : generateCSVFile(data);

            // Trigger download
            const blob = new Blob([fileContent], {
                type: type === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `healthcamp_${viewType}_${type === "excel" ? "data.xlsx" : "data.csv"}`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(`Error downloading ${type.toUpperCase()} file:`, error);
            setSnackbarMessage(`Failed to download ${type.toUpperCase()} file. Please try again.`);
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    // Excel and CSV Download Handlers
    const handleExcelDownload = () => downloadExcelOrCSV("excel");
    const handleCSVDownload = () => downloadExcelOrCSV("csv");


    const handleCallLog = (memberId) => {
        setCallLogMemberId(memberId);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const isFormValid = formData.callResponsesId.length > 0;
        setIsFormValid(isFormValid);
    }, [formData]);

    const handleResetForm = () => {
        setFormData(initialFormData);
        setFormError({});
    };

    const handleBackToView = () => {
        setIsFormVisible(false);
    };
    useEffect(() => {
        callLogMemberId && (
            fetchCallHistoryData()
        )
    }, [callLogMemberId]);

    const fetchCallHistoryData = async () => {
        setLoading(true);
        try {
            const response = await fetchAllData(`lambdaAPI/HealthCampCallHistory/GetAllHealthCampCallHistoryByLeadGenerationId/${callLogMemberId}`);
            setCallHistory(response);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const onChangeHandler = (event) => {
        const { name, value, type, checked } = event.target;
        let updatedFormData = { ...formData, [name]: type === 'checkbox' ? (checked ? value : '') : value };
        let error = '';

        // if (name === 'DateToBeVisited' && value.length === 10) {
        //     const defaultTime = "T00:00:00";
        //     updatedFormData = { ...updatedFormData, DateToBeVisited: `${value}${defaultTime}` };
        // }

        setFormData(updatedFormData);
        setFormError({ ...formError, [name]: error });

    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            let CallHistoryData;
            const requestData = {
                callLog: formData.callLog,
                LeadGenerationId: callLogMemberId,
                CreatedBy: UserId,
                callResponsesId: formData.callResponsesId,
                DateToBeVisited: formData.DateToBeVisited === "" ? null : formData.DateToBeVisited,
                RequestCallBack: formData.RequestCallBack === "" ? null : formData.RequestCallBack,
            };

            // if (formData.DateToBeVisited) {
            //     requestData.DateToBeVisited = new Date(formData.DateToBeVisited).toISOString();
            // }

            // if (formData.RequestCallBack) {
            //     requestData.RequestCallBack = new Date(formData.RequestCallBack).toISOString();
            // }

            CallHistoryData = await fetchData('lambdaAPI/HealthCampCallHistory/add', requestData);

            if (CallHistoryData) {

                setSnackbarMessage("New call log added successfully!");

                setCallHistory(CallHistoryData);
                setSnackbarOpen(true);
            } else {
                setSnackbarMessage(`${CallHistoryData.data}`);
                setSnackbarOpen(true);
            }

            await fetchCallHistoryData();
        } catch (error) {
            console.error("Error adding call log:", error);
        } finally {
            setLoading(false);
            setIsFormVisible(false);
            setFormData(initialFormData);
        }
    };

    const addCallLogForm = () => {
        return (
            <form onSubmit={onSubmitHandler} className="p-4 border rounded shadow-sm bg-white mb-4">
                <div className="mb-4">
                    <h5 className="mb-3" style={{ fontWeight: 'bold' }}>Call Response <span className="required" style={{ color: "red" }}> *</span></h5>
                    <div className="d-flex flex-wrap">
                        {callResponseOptions.map((option) => (
                            <div className="form-check me-4 mb-2 col-5" key={option.CallResponsesId}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id={`callResponse_${option.CallResponsesId}`}
                                    name="callResponsesId"
                                    value={option.CallResponsesId}
                                    checked={formData.callResponsesId.includes(option.CallResponsesId)}
                                    onChange={onChangeHandler}
                                />
                                <label className="form-check-label" htmlFor={`callResponse_${option.CallResponsesId}`}>
                                    {option.ResponseName}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-sm-6">
                        <div className="mb-3">
                            <label htmlFor="DateToBeVisited" className="form-label">Date To Be Visited</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                id="DateToBeVisited"
                                name="DateToBeVisited"
                                value={formData.DateToBeVisited}
                                onChange={onChangeHandler}
                            />

                        </div>
                    </div>

                    <div className="col-12 col-sm-6">
                        <div className="mb-3">
                            <label htmlFor="flatpickr-multi" className="form-label">Request Call Back</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                id="RequestCallBack"
                                name="RequestCallBack"
                                value={formData.RequestCallBack}
                                onChange={onChangeHandler}
                            />

                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="mb-3">
                            <label htmlFor="remarks" className="form-label">Remarks</label>
                            <textarea
                                className="form-control"
                                id="remarks"
                                name="callLog"
                                placeholder="Enter Remarks"
                                onChange={onChangeHandler}
                                value={formData.callLog}
                                rows="4"
                            />

                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 d-flex justify-content-start">
                        <button type="submit" className="btn btn-primary" disabled={!isFormValid} >Submit</button>

                        <button className="btn btn-secondary ms-2" type="button" onClick={handleResetForm}>
                            Reset
                        </button>
                        <button className="btn btn-danger ms-2" type="button" onClick={handleBackToView}>
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        );
    };

    const showCallLog = () => {
        return (
            callHistory && callHistory.length > 0 ? (
                <div className="row">
                    <div className="card col-12 col-md-6 card-action mb-4">
                        <div className="card-header align-items-center">
                            <h5 className="card-action-title mb-0">
                                <i className="bx bx-list-ul me-2"></i>Call History
                            </h5>
                        </div>
                        <div className="card-body">
                            <ul className="timeline ms-2">
                                {callHistory.map((call, index) => (
                                    <li key={index} className="timeline-item timeline-item-transparent">
                                        <span className="timeline-point-wrapper">
                                            <span className="timeline-point timeline-point-success"></span>
                                        </span>
                                        <div className="timeline-event">
                                            <div className="timeline-header mb-1">
                                                <h6 className="mb-0">
                                                    {call.UserName}
                                                    <span className="badge bg-label-primary mb-2">
                                                        {call.CallResponseName}
                                                    </span>
                                                </h6>
                                                <small className="text-muted">
                                                    {moment(call.CollectedDate).local().diff(moment(), 'days') <= thresholdDays
                                                        ? <strong>{moment(call.CollectedDate).local().fromNow()}</strong>
                                                        : <strong>{moment(call.CollectedDate).local().format('DD-MMM-YYYY h:mm A')}</strong>}
                                                </small>
                                            </div>

                                            <div className="timeline-header mb-1 mt-1">
                                                <h6 className="mb-0">Remarks :</h6>
                                            </div>
                                            <p className="mb-0">{call.CallLog}</p>

                                            {call.DateToBeVisited !== '0001-01-01T00:00:00' && (
                                                <>
                                                    <div className="timeline-header mb-1 mt-1">
                                                        <h6 className="mb-0">Requested RM to visit on :</h6>
                                                    </div>
                                                    <p className="mb-0">{moment(call.DateToBeVisited).local().format('DD-MMM-YYYY h:mm A')}</p>
                                                </>
                                            )}

                                            {call.RequestCallBack !== '0001-01-01T00:00:00' && (
                                                <>
                                                    <div className="timeline-header mb-1 mt-1">
                                                        <h6 className="mb-0">Requested Callback on :</h6>
                                                    </div>
                                                    <p className="mb-0">{moment(call.RequestCallBack).local().format('DD-MMM-YYYY h:mm A')}</p>
                                                </>
                                            )}

                                        </div>
                                    </li>
                                ))}
                                <li className="timeline-end-indicator">
                                    <i className="bx bx-check-circle"></i>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="col-12 col-md-6">
                        <button
                            className="btn btn-primary btn-md mb-4"
                            onClick={() => setIsFormVisible(true)}
                        >
                            Add New Call Log
                        </button>
                        {isFormVisable && addCallLogForm()}
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="text-danger fw-semibold col-12 col-md-5 mb-4 mx-2">
                        No Call History records
                    </div>

                    <div className="col-12 col-md-6">
                        <button
                            className="btn btn-primary btn-md mb-4"
                            onClick={() => setIsFormVisible(true)}
                        >
                            Add New Call Log
                        </button>
                        {isFormVisable && addCallLogForm()}
                    </div>
                </div>
            ))
    };



    const skeletonloading = () => (
        <>
            <style>{shimmerStyle}</style>
            <div className="shimmer-container shimmer">
                <h6 className="shimmer-text "></h6>
            </div>
            <table className="shimmer-container shimmer">
                <tbody>
                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="shimmer-row">
                            {Array.from({ length: 6 }).map((_, colIndex) => (
                                <td key={colIndex} className="shimmer-cell">
                                    <h6 className="shimmer-text2 " ></h6>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

        </>
    )

    return (
        <>
            {loading && skeletonloading()}
            {!loading && (

                <>
                    <div className="row mt-2">
                        <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1">
                            <div className="card mb-4">
                                <div className="card-body">
                                    <div className="row mb-2">
                                        <div
                                            className="col-md-12 d-flex justify-content-between align-items-center flex-wrap gap-2"
                                            style={{ gap: "10px" }}
                                        >
                                            <div className="d-flex gap-2">
                                                <button
                                                    className={`btn btn-sm ${viewType === "AllCustomers" ? "btn-primary" : "btn-secondary"
                                                        }`}
                                                    style={{ padding: "5px 10px" }}
                                                    onClick={handleAllCustomersClick}
                                                >
                                                    All
                                                </button>
                                                <button
                                                    className={`btn btn-sm ${viewType === "PurchasedCustomers" ? "btn-primary" : "btn-secondary"
                                                        }`}
                                                    style={{ padding: "5px 10px" }}
                                                    onClick={handlePurchasedCustomersClick}
                                                >
                                                    Customers
                                                </button>
                                                <button
                                                    className={`btn btn-sm ${viewType === "NonCustomers" ? "btn-primary" : "btn-secondary"
                                                        }`}
                                                    style={{ padding: "5px 10px" }}
                                                    onClick={handleNonCustomersClick}
                                                >
                                                    Non-Customers
                                                </button>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-secondary btn-sm btn-primary"
                                                    onClick={handleExcelDownload}
                                                >
                                                    <span>
                                                        <i className="bx bx-export me-sm-1"></i>
                                                        <span className="d-none d-sm-inline-block"> Excel</span>
                                                    </span>
                                                </button>

                                                <button
                                                    className="btn btn-secondary btn-sm btn-success"
                                                    onClick={handleCSVDownload}
                                                >
                                                    <span>
                                                        <i className="bx bx-export me-sm-1"></i>
                                                        <span className="d-none d-sm-inline-block"> CSV</span>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {(loading || tableLoading) && (
                                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(255, 255, 255, 0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                                            <CircularProgress />
                                        </div>
                                    )}

                                    {!loading && !tableLoading && membersData.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            There are no records to display.
                                        </div>
                                    )}

                                    {!tableLoading && membersData.length > 0 && (
                                        <CommonTables
                                            tableHeads={tableHeads}
                                            tableData={tableElements}
                                            perPage={perPage}
                                            currentPage={currentPage}
                                            perPageChange={handlePerPageChange}
                                            pageChange={handlePageChange}
                                            totalCount={totalCount}
                                        />
                                    )}

                                    <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
                                        <Alert onClose={handleSnackbarClose} severity="error">
                                            {snackbarMessage}
                                        </Alert>
                                    </Snackbar>

                                    <Modal
                                        isOpen={isModalOpen}
                                        onRequestClose={() => {
                                            setIsModalOpen(false);
                                            setCallLogMemberId();
                                            setIsFormVisible(false);
                                            setFormData(initialFormData);
                                            setFormError({});
                                        }}
                                        ariaHideApp={false}
                                        style={{
                                            overlay: {
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            },
                                            content: {
                                                position: 'relative',
                                                width: '70%',
                                                maxHeight: '90vh',
                                                margin: 'auto',
                                                borderRadius: '8px',
                                                padding: '20px',
                                                overflow: 'auto',
                                                left: window.innerWidth > 1100 ? 120 : 0,
                                                right: window.innerWidth > 1100 ? 100 : 0,
                                                top: 70
                                            },
                                        }}
                                    >
                                        <>
                                            <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end" }}>
                                                <button
                                                    style={{ border: '0px', backgroundColor: "transparent" }}
                                                    onClick={() => {
                                                        setIsModalOpen(false);
                                                        setCallLogMemberId();
                                                        setIsFormVisible(false);
                                                        setFormData(initialFormData);
                                                        setFormError({});
                                                    }}
                                                >
                                                    <i style={{ height: "30px", width: "30px" }} className="fa-regular fa-circle-xmark"></i>
                                                </button>
                                            </div>

                                            <div>
                                                {showCallLog()}
                                            </div>
                                        </>
                                    </Modal>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

const shimmerStyle = `
     @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }

  .shimmer {
    animation-duration: 1.0s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: shimmer;
    animation-timing-function: linear;
    background:	#F7F7F7;
    background: linear-gradient(to right, #f0f0f0 8%, #fafafa 18%, #f0f0f0 33%);
    background-size: 1000px 104px;
    position: relative;
    overflow: hidden;
  }

  .shimmer-container {
    background-color: 	#F7F7F7;
    border-radius: 4px;
    height: 50px;
    width: 100%;
    margin: 15px;
  }

  .shimmer-text2 {
    background-color: #C8C8C8;
    border-radius: 4px;
    height: 15px;
    width: 55%;
    margin: 15px 0 0 15px;
     position:relative;
     left:10%;
     bottom:10%;
  }
  .shimmer-text {
    background-color: #C8C8C8;
    border-radius: 4px;
    height: 15px;
    width: 15%;
    margin: 15px 0 0 15px;
     
  }
 .shimmer-row {
    display: flex;
  }

  .shimmer-cell {
    flex: 1;
    padding: 10px;
    height: 50px;
    background-color: #F7F7F7;
    border-radius: 4px;
    margin: 5px;
  }
  
  `;

const styles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '12px 15px',
        border: '1px solid #ddd',
        textAlign: 'left',
        backgroundColor: '#f2f2f2',
        color: '#333',
        textTransform: 'uppercase',
        fontSize: '12px',
        letterSpacing: '1px',
    },
    td: {
        padding: '12px 15px',
        border: '1px solid #ddd',
        textAlign: 'left',
        fontSize: '14px',
        whiteSpace: 'normal',
        maxWidth: '200px',
    },
    headerRow: {
        backgroundColor: '#f9f9f9',
    },
    paginationContainer: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '10px',
    },
    paginationSelect: {
        padding: '5px',
        borderRadius: '5px',
        border: '1px solid',
        marginRight: '10px',
        borderColor: 'blue',
    },
};