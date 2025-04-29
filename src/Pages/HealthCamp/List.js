import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import moment from 'moment';
import { fetchData, fetchAllData } from "../../helpers/externapi";
import { MultiSelect } from "react-multi-select-component";
import CircularProgress from '@mui/material/CircularProgress';
import 'jspdf-autotable';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { downloadCSVData, downloadExcelData } from '../../Commoncomponents/CommonComponents';
import CommonTables from '../../Commoncomponents/CommonTables';
import Flatpickr from 'react-flatpickr';
import { constructCompleteAddress } from '../../Commoncomponents/CommonComponents';
import Modal from 'react-modal';

export default function List(props) {
    const [loading, setLoading] = React.useState(false);
    const [tableloading, setTableLoading] = React.useState(false);
    const [selectedStates, setSelectedStates] = React.useState([]);
    const [statesMultiSelect, setStatesMultiSelect] = React.useState();
    const [selectedDistricts, setSelectedDistricts] = React.useState([]);
    const [totalCount, setTotalCount] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [filterCriteria, setFilterCriteria] = useState([]);
    const [selectedNames, setSelectedNames] = useState([]);
    const [selectedNumbers, setSelectedNumbers] = useState([]);
    const [selectedMandals, setSelectedMandals] = useState([]);
    const [selectedVillages, setSelectedVillages] = useState([]);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [selectedDates, setSelectedDates] = useState([]);
    const [healthcampData, setHealthcampData] = React.useState([]);
    const [isDisableApply, setIsDisableApply] = useState(true);
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

    const tomorrow = new Date()
    const accordionRef = useRef(null);
    tomorrow.setDate(tomorrow.getDate() + 1)

    const tableHeads = ["FULL NAME", "CALL HISTORY", "CONTACT", "ADDRESS", "EVENTS", "DISEASE", "Event Date"];

    const tableElements = healthcampData.length > 0 ?
        healthcampData.map(data => ([
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
                                <i className='bx bx-phone-call'></i>
                                {data.MobileNumber}
                            </a>
                        ) : <p style={{ color: 'red' }}>Mobile Number dosen't exist </p>}
                    </div>
                    <div>
                        {data.Email ? (
                            <a href={"mailto:" + data.Email} className="d-flex align-items-center" style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
                                <i className="fas fa-envelope"></i>
                                {data.Email}
                            </a>
                        ) : <p style={{ color: 'red' }}>Email id doesn't exist</p>}
                    </div>
                </>
            ) : <p style={{ color: 'red' }}>Mobile Number and Email Id doesn't exist </p>,
            data.completeAddress,
            data.EventName,
            data.MemberDiseases,
            data.EventDate ? moment(data.EventDate).format('DD-MMM-YYYY') : ''
        ])) : [];

    useEffect(() => {
        setLoading(props.loading);
        setLoading(props.error);
    }, []);

    const getDistributorCountData = async () => {
        setLoading(true);
        try {
            const distributorCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "View_Vitals" });
            const totalCount = distributorCountData[0]?.CountOfRecords || 0;
            setTotalCount(totalCount);
        } catch (error) {
            console.error("Error fetching hospital count data:", error);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDistributorCountData();
    }, []);

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

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
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

    useEffect(() => {
        getDistributorData();
    }, [filterCriteria, currentPage, perPage]);

    const getDistributorData = async () => {
        setLoading(true);
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            let distributorData;
            if (filterCriteria.length > 0) {
                distributorData = await fetchData("lambdaAPI/Vitals/GetMemberVitalsDetailsDataByFilter", {
                    skip,
                    take,
                    filter: filterCriteria
                });
            } else {
                distributorData = await fetchData("lambdaAPI/Vitals/GetMemberVitalsDetails/all", { skip, take });
            }

            const dataToDisplay = distributorData.map(distributor => ({
                ...distributor,
                completeAddress: constructCompleteAddress(distributor),
                MobileNumber: distributor.MobileNumber
            }));

            setHealthcampData(dataToDisplay);
        } catch (error) {
            console.error("Error fetching distributor data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExcelDownload = async () => {
        setLoading(true)
        await downloadExcelData('healthcamplist', totalCount, perPage, currentPage, fetchData, filterCriteria, setLoading);
    };

    const handleCSVDownload = async () => {
        setLoading(true)
        await downloadCSVData('healthcamplist', totalCount, perPage, currentPage, fetchData, filterCriteria, setLoading);
    };

    useEffect(() => {
        const getStates = async () => {
            setLoading(true);
            const statesData = await fetchData("Event/all", { "skip": 0, "take": 0 });
            const statesArray = statesData.map(item => ({ label: item.EventName, value: item.EventId }));
            setStatesMultiSelect(statesArray);
            setLoading(false);
        }
        getStates();
    }, []);

    function formatDateRange(startDate, endDate) {
        const options = { day: '2-digit', month: 'short', year: 'numeric' };

        const start = startDate.toLocaleDateString('en-GB', options).replace(/ /g, '-');
        const end = endDate.toLocaleDateString('en-GB', options).replace(/ /g, '-');

        return `${start} to ${end}`;
    };

    const applyFilter = async () => {
        setLoading(true);

        const selectedStateIds = selectedStates.map(state => state.value);
        let startDate = "";
        let endDate = "";

        if (selectedDates.length === 1) {
            startDate = moment(selectedDates[0]).format('YYYY-MM-DD');
            endDate = moment(selectedDates[0]).format('YYYY-MM-DD');
        } else if (selectedDates.length === 2) {
            startDate = moment(selectedDates[0]).format('YYYY-MM-DD');
            endDate = moment(selectedDates[1]).format('YYYY-MM-DD');
        }

        const filterCriteria = [];
        if (selectedStateIds.length > 0) {
            filterCriteria.push({
                key: "EventId",
                value: selectedStateIds.join(","),
                operator: "IN"
            });
        }
        if (startDate && endDate) {
            filterCriteria.push({
                key: "EventDate",
                value: `${startDate},${endDate}`,
                operator: "BETWEEN"
            });
        }

        try {


            const distributorCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "View_Vitals", filter: filterCriteria });
            const totalCount = distributorCountData[0]?.CountOfRecords || 0;
            setTotalCount(totalCount);

            const filterData = await fetchData("lambdaAPI/Vitals/GetMemberVitalsDetailsDataByFilter", {
                skip: 0,
                take: perPage,
                filter: filterCriteria
            });

            setHealthcampData(filterData);
            setPerPage(perPage);
            setCurrentPage(1);
            setFilterCriteria(filterCriteria);
        } catch (error) {
            console.error("Error applying filter:", error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = async () => {
        setSelectedStates([]);
        setSelectedDates([]);

        try {
            getDistributorCountData();
            await getDistributorData();

            setFilterCriteria([]);
        } catch (error) {
            console.error("Error while clearing filters:", error);
        }
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    useEffect(() => {
        if (selectedStates.length === 0 && selectedDates.length === 0) {
            setIsDisableApply(true);
        } else {
            setIsDisableApply(false);
        }

    }, [selectedStates, selectedDates]);

    const handleCallLog = (memberId) => {
        setCallLogMemberId(memberId);
        setIsModalOpen(true);
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
            {loading && skeletonloading()}
            {!loading && (
                <>
                    <div className="card mb-2">
                        <div className="p-3">
                            <div className="select2-primary mx-2" style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {(selectedStates.length > 0 || selectedDates.length > 0) && (
                                    <>
                                        <strong style={{ marginRight: '5px' }}>Filter Criteria - </strong>

                                        {selectedStates.length > 0 && (
                                            <div style={{ marginRight: '10px', marginBottom: '0px', display: 'flex', alignItems: 'center' }}>
                                                <strong style={{ marginRight: '5px' }}>Event : </strong>
                                                {selectedStates.map((state, index) => (
                                                    <span key={state.value} className="selected-option-button">
                                                        {state.label}
                                                        {index !== selectedStates.length - 1 && ', '}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

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

                            <div className="d-flex flex-row flex-wrap align-items-center">
                                <div className="me-2 me-md-3 mb-2">
                                    <label htmlFor="select2Success" className="form-label my-0">Events</label>
                                    <div className="select2-primary" style={{ minWidth: '200px' }}>
                                        {statesMultiSelect && (
                                            <MultiSelect
                                                options={statesMultiSelect}
                                                value={selectedStates}
                                                onChange={setSelectedStates}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="me-2 me-md-3 mb-2">
                                    <label htmlFor="fromDate" className="form-label my-0">Select Events Dates:</label>
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

                                <div className="d-flex flex-row align-items-center text-center mt-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary me-2"
                                        onClick={clearFilters}
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={applyFilter}
                                        disabled={isDisableApply}
                                    >
                                        Apply
                                    </button>
                                </div>

                            </div>


                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="row">
                        <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1">
                            <div className="card mb-4" style={{ opacity: loading ? 0.5 : 1 }}>
                                <div className="p-1">
                                    <div className="row mb-2">
                                        <div className="col-md-12 d-flex flex-row-reverse content-between align-items-center gap-2">
                                            <button className="btn btn-secondary create-new btn btn-sm btn-primary" onClick={handleExcelDownload}>
                                                <span><i className="bx bx-export me-sm-1"></i>
                                                    <span className="d-none d-sm-inline-block"> Excel</span>
                                                </span>
                                            </button>

                                            <button className="btn btn-secondary create-new btn btn-sm btn-success" onClick={handleCSVDownload}>
                                                <span><i className="bx bx-export me-sm-1"></i>
                                                    <span className="d-none d-sm-inline-block"> CSV</span>
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    {(loading || tableloading) && (
                                        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(255, 255, 255, 0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                                            <CircularProgress />
                                        </div>
                                    )}

                                    {!loading && !tableloading && healthcampData.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            There are no records to display.
                                        </div>
                                    )}

                                    {!loading && !tableloading && healthcampData.length > 0 && (
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
                                    >
                                        <Alert onClose={handleSnackbarClose} severity="success">
                                            {snackbarMessage}
                                        </Alert>
                                    </Snackbar>

                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );

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