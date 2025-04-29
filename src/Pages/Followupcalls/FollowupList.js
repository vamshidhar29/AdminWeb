import React, { useEffect, useState } from "react";
import { fetchData, fetchAllData } from "../../helpers/externapi";
import CommonTables from '../../Commoncomponents/CommonTables';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import { Link } from "react-router-dom";
import Modal from 'react-modal';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function FollowupList(props) {
    const [loading, setLoading] = useState(false);
    const [callHistory, setCallHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedCallResponses, setSelectedCallResponses] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const [pendingCalls, setPendingCalls] = useState([]);
    const [callLogMemberId, setCallLogMemberId] = useState();
    const [callHistoryData, setCallHistoryData] = useState();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const initialFormData = {
        callHistoryId: "", callLog: "", CollectedDate: "", callResponsesId: "", DateToBeVisited: "", RequestCallBack: ""
    }
    const [formData, setFormData] = useState(initialFormData);
    const [formError, setFormError] = useState({});
    const [isFormVisable, setIsFormVisible] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);
    const [callResponseOptions, setCallResponseOptions] = useState([]);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const today = moment(new Date()).format('DD-MMM-YYYY');
    let UserId = localStorage.getItem("UserId");

    const thresholdDays = 5;

    useEffect(() => {
        fetchCallHistoryData();
    }, [currentPage, perPage, selectedCallResponses, selectedDates]);

    const fetchCallHistoryData = async () => {
        setLoading(true);
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;
            let pendingData = [];

            const response = await fetchData("CallHistory/GetTodayCalllogs", {
                skip, take, userId: UserId
            });

            response.map(data => {
                const requestDate = moment(data.RequestCallBack).format('DD-MMM-YYYY');

                if (today !== requestDate) {
                    pendingData = [...pendingData, data];
                }
            });

            const responseCount = await fetchData("CallHistory/GetTodayCalllogs", { userId: UserId });

            setCallHistory(response);
            setPendingCalls(pendingData);
            setTotalCount(responseCount.length);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const getFilterData = async () => {
        setLoading(true);
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            let startDate = "";
            let endDate = "";

            if (selectedDates.length === 1) {
                startDate = moment(selectedDates[0]).format('YYYY-MM-DD');
                endDate = moment(selectedDates[0]).format('YYYY-MM-DD');
            } else if (selectedDates.length === 2) {
                startDate = moment(selectedDates[0]).format('YYYY-MM-DD');
                endDate = moment(selectedDates[1]).format('YYYY-MM-DD');
            }

            const filterResponse = await fetchData("CallHistory/FollowUpsByFilter", {
                skip, take,
                startDate, endDate,
                userId: UserId
            });

            setCallHistory(filterResponse);
            setTotalCount(filterResponse.length);
            setLoading(false);
        } catch (error) {
            console.error('Error filtering data:', error);
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSelectedCallResponses([]);
        setSelectedDates([]);
    };

    const applyFilter = () => {
        getFilterData();
    };

    const responseLabels = {
        "Welcome Call": "bg-label-success",
        "Interested": "bg-label-info",
        "Busy Call back": "bg-label-warning",
        "Pipeline": "bg-label-secondary",
        "Not Interested": "bg-label-danger",
        "Not Available": "bg-label-dark",
        "Requested CallBack": "bg-label-primary"
    };

    const tableHeads = ["Name", "CALL HISTORY", "Mobile Number", "Remarks", "Response Name", "Collected Date", "Date To Be Visited",
        "Request CallBack", "User Name"];

    const tableElements = callHistory && callHistory.length ?
        callHistory.map((item) => ([
            <Link
                to={item.MemberTypeId === 1 ? `/distributor/details/${item.MemberId}` : `/customers/details/${item.MemberId}`}
            >
                {item.Name}
            </Link>,
            <>
                <button
                    style={{ border: '0px', backgroundColor: 'white' }}
                    type="button"
                    onClick={() => handleCallLog(item.MemberId)}
                >
                    <Link>Call log Data</Link>
                </button>

            </>,
            item.MobileNumber && (
                <a href={"tel:" + item.MobileNumber}>
                    <i className="bx bx-phone-call" style={styles.phoneIcon}></i>
                    {item.MobileNumber}
                </a>
            ),
            item.CallLog,
            <span className={`badge ${responseLabels[item.ResponseName]}`}>{item.ResponseName}</span>,
            item.CollectedDate !== '0001-01-01T00:00:00' ? moment(item.CollectedDate).format('DD-MMM-YYYY') : '',
            item.DateToBeVisited !== '0001-01-01T00:00:00' ? moment(item.DateToBeVisited).format('DD-MMM-YYYY') : '',
            moment(item.RequestCallBack).format('DD-MMM-YYYY') !== today ? (
                <span className={`badge bg-label-danger`}>{moment(item.RequestCallBack).format('DD-MMM-YYYY')}</span>
            ) : (
                <span className={`badge bg-label-warning`}>{moment(item.RequestCallBack).format('DD-MMM-YYYY')}</span>
            ),
            item.UserName,
        ])) : [];

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };


    const handleCallLog = (memberId) => {
        setCallLogMemberId(memberId);
        setIsModalOpen(true);
    };

    function formatDateRange(startDate, endDate) {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };

        const start = startDate.toLocaleDateString('en-GB', options).replace(/ /g, '-');
        const end = endDate.toLocaleDateString('en-GB', options).replace(/ /g, '-');

        return `${start} to ${end}`;
    }
    useEffect(() => {
        const fetchCallResponseOptions = async () => {
            try {
                const getResponseTypes = await fetchData('CallResponseType/all', { skip: 0, take: 0 });

                let CallResponseTypeId = getResponseTypes.filter(types => types.ResponseName === "Member");

                const response = await fetchAllData(`CallResponse/GetCallResponsesByResponseType/${CallResponseTypeId[0].CallResponseTypeId}`);
                setCallResponseOptions(response);
            } catch (error) {
                console.error("Error fetching call responses:", error);
            }
        };

        fetchCallResponseOptions();
    }, []);

    const fetchCallHistory = async () => {
        setLoading(true);
        try {
            const response = await fetchAllData(`CallHistory/GetAllCallHistoryByMemberId/${callLogMemberId}`);
            setCallHistoryData(response);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        callLogMemberId && (
            fetchCallHistory()
        )
    }, [callLogMemberId]);

    const onChangeHandler = (event) => {
        const { name, value, type, checked } = event.target;
        let updatedFormData = { ...formData, [name]: type === 'checkbox' ? (checked ? value : '') : value };
        let error = '';

        if (name === 'DateToBeVisited' && value.length === 10) {
            const defaultTime = "T00:00:00";
            updatedFormData = { ...updatedFormData, DateToBeVisited: `${value}${defaultTime}` };
        }

        setFormData(updatedFormData);
        setFormError({ ...formError, [name]: error });
        //if (name === 'StateId') {
        //    setSelectedStateId(value);
        //    updatedFormData.DistrictId = '';
        //}
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

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);


        try {
            let CallHistoryData;
            const requestData = {
                callLog: formData.callLog,
                MemberId: callLogMemberId,
                userId: UserId,
                callResponsesId: formData.callResponsesId
            };

            if (formData.DateToBeVisited) {
                requestData.DateToBeVisited = new Date(formData.DateToBeVisited).toISOString();
            }

            if (formData.RequestCallBack) {
                requestData.RequestCallBack = new Date(formData.RequestCallBack).toISOString();
            }

            CallHistoryData = await fetchData('CallHistory/add', requestData);
            setSnackbarMessage("New call log added successfully!");

            setCallHistory(CallHistoryData);
            setSnackbarOpen(true);

            await fetchCallHistory();
        } catch (error) {
            console.error("Error adding call log:", error);
        } finally {
            setLoading(false);
            setIsFormVisible(false);
            setFormData(initialFormData);
        }
    };


    const showCallLog = () => {
        return (
            callHistoryData && callHistoryData.length > 0 ? (
                <div className="row">
                    <div className="card col-12 col-md-6 card-action mb-4">
                        <div className="card-header align-items-center">
                            <h5 className="card-action-title mb-0">
                                <i className="bx bx-list-ul me-2"></i>Call History
                            </h5>
                        </div>
                        <div className="card-body">

                            <ul className="timeline ms-2">
                                {callHistoryData.map((call, index) => (
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
                                                    {moment.utc(call.CollectedDate).local().diff(moment(), 'days') <= thresholdDays
                                                        ? <strong>{moment.utc(call.CollectedDate).local().fromNow()}</strong>
                                                        : <strong>{moment.utc(call.CollectedDate).local().format('DD-MMM-YYYY HH:mm')}</strong>}
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
                                                    <p className="mb-0">{moment.utc(call.DateToBeVisited).local().format('DD-MMM-YYYY HH:mm')}</p>
                                                </>
                                            )}

                                            {call.RequestCallBack !== '0001-01-01T00:00:00' && (
                                                <>
                                                    <div className="timeline-header mb-1 mt-1">
                                                        <h6 className="mb-0">Requested Callback on :</h6>
                                                    </div>
                                                    <p className="mb-0">{moment.utc(call.RequestCallBack).local().format('DD-MMM-YYYY HH:mm')}</p>
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
    );

    return (
        <>
            <div className="card mb-4">
                <div className="card-body">


                    <div className="select2-primary mx-2" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {(selectedDates.length > 0) && (
                            <>
                                <strong style={{ marginRight: '5px' }}>Filter Criteria - </strong>

                                {selectedDates.length > 0 && (
                                    <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                        <strong style={{ marginRight: '5px' }}>Selected Dates: </strong>
                                        <span className="selected-option-button">
                                            {formatDateRange(selectedDates[0], selectedDates[selectedDates.length - 1])}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}

                    </div>

                    <div className="d-flex flex-wrap justify-content-between align-items-end">

                        <div className="me-3" style={{ width: '250px' }}>


                            <label htmlFor="fromDate" className="form-label my-2">Select Dates:</label>
                            <Flatpickr
                                key={`flatpickr-${selectedDates.join('-')}`}
                                value={selectedDates}
                                placeholder="YYYY-MM-DD to YYYY-MM-DD"
                                onChange={setSelectedDates}
                                options={{ mode: "range", dateFormat: "Y-m-d" }}
                                className="form-control"
                            >
                            </Flatpickr>
                        </div>

                        <div className="d-flex">
                            <button
                                type="reset"
                                className="btn btn-secondary me-2"
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
                                disabled={!selectedDates.length > 0}
                            >
                                Apply
                            </button>

                        </div>
                    </div>

                </div>
            </div>


            {loading && skeletonloading()}
            {!loading && (
                <>
                    <div className="card">
                        {callHistory.length === 0 ? (
                            <p>NO DATA TO DISPLAY</p>
                        ) : pendingCalls.length === 0 ? (
                            <p className="text-warning">NO PENDING CALLS, PLEASE COMPLETE TODAY'S CALLS</p>
                        ) : null}
                    </div>

                    <div className="card mb-4 mt-2">
                        {callHistory && callHistory.length > 0 && (
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

                    </div>
                </>
            )}

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


            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success">
                    {snackbarMessage}
                </Alert>
            </Snackbar>

        </>
    );
}

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
        fontSize: '11px',
        letterSpacing: '1px',
        fontWeight: 'bold',
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
    link: (isHovered) => ({
        color: isHovered ? 'blue' : '#0E94C3',
        transition: 'color 0.3s',
        cursor: 'pointer',
    }),
    phoneIcon: {
        marginRight: '5px',
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
    badge: {
        padding: '0.5em 1em',
        borderRadius: '0.5em',
        fontSize: '0.875em',
        color: '#fff',
    },
    'bg-label-success': { backgroundColor: '#28a745' },
    'bg-label-info': { backgroundColor: '#17a2b8' },
    'bg-label-warning': { backgroundColor: '#ffc107' },
    'bg-label-secondary': { backgroundColor: '#6c757d' },
    'bg-label-danger': { backgroundColor: '#dc3545' },
    'bg-label-dark': { backgroundColor: '#343a40' },
    'bg-label-primary': { backgroundColor: '#007bff' },
    'bg-label-default': { backgroundColor: '#e0e0e0' },

    kycStatus: (isVerified) => ({
        color: isVerified ? 'green' : 'red',
        transition: 'color 0.3s',
    }),
};

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