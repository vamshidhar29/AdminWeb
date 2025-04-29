import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchData, fetchAllData } from "../../helpers/externapi";
import CommonTables from "../../Commoncomponents/CommonTables";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import moment from "moment";
import Modal from "react-modal";
import { Tab } from "bootstrap";
import { TableSkeletonLoading } from "../../Commoncomponents/SkeletonLoading";
import { formatDate } from "../../Commoncomponents/CommonComponents";

export default function UpcommingList() {
  const [loading, setLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [consultationList, setConsultationList] = useState();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [totalCount, setTotalCount] = React.useState(0);
  const [callHistory, setCallHistory] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [callLogMemberId, setCallLogMemberId] = useState();
  const initialFormData = {
    callHistoryId: "",
    callLog: "",
    CollectedDate: "",
    callResponsesId: "",
    DateToBeVisited: "",
    RequestCallBack: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formError, setFormError] = useState({});
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [callResponseOptions, setCallResponseOptions] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const thresholdDays = 5;
  let UserId = localStorage.getItem("UserId");

  const tableHeads = [
    "Full Name",
    "Card Number",
    "Appointment Date",
    "Hospital Name",
    "Appointment",
    "Status"
  ];
  const statusColors = {
    "Initiated": { text: "#3498db", bg: "#D6EAF8" },   // Blue
    "Requested": { text: "#2ecc71", bg: "#D4EFDF" },  // Green
    "Booked": { text: "#1abc9c", bg: "#D1F2EB" },     // Teal
    "Visited": { text: "#f39c12", bg: "#FDEBD0" },    // Orange
    "Customer Feedback": { text: "#e74c3c", bg: "#FADBD8" }, // Red
    "Hospital Feedback": { text: "#9b59b6", bg: "#EBDEF0" }, // Purple
    "Success": { text: "#27ae60", bg: "#D5F5E3" },   // Dark Green
    "Not Visited": { text: "#34495e", bg: "#D6DBDF" } // Dark Blue-Gray
  };

  const tableElements =
    consultationList && consultationList.length > 0
      ? consultationList.map((data) => [
        <Link
          to={`/customers/details/${data.CustomerId}`
          } style={{ textAlign: "left", display: "block" }}>

          {data.Name}
        </Link>,
        // <>
        //     <button
        //         style={{ border: '0px', backgroundColor: 'white' }}
        //         type="button"
        //         onClick={() => handleCallLog(data.MemberId)}
        //     >
        //         <Link>Call log Data</Link>
        //     </button>
        // </>,
        <p style={{ whiteSpace: "nowrap" }}>{data.CardNumber}</p>,
        <p >{formatDate(data.AppointmentDate)}</p>,
        // <p>{data.Appointment}</p>,
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
          color: statusColors[data.StatusName]?.text || "#000",
          backgroundColor: statusColors[data.StatusName]?.bg || "#fff",
          padding: "3px 8px",
          borderRadius: "4px",
          display: "inline-block",
        }}>
          {data.
            StatusName

          }
        </p>,
      ])
      : [];

  const getConsultationList = async () => {
    try {
      setLoading(true);

      const skip = (currentPage - 1) * perPage;
      const take = perPage;

      const response = await fetchData(
        "lambdaAPI/BookingConsultation/BookingConsultationCurrentANDFutureDateAppointments",
        { skip, take }
      );
      const responseCount = await fetchData(
        "lambdaAPI/BookingConsultation/BookingConsultationCurrentANDFutureDateAppointmentsCount",
        { skip: 0, take: 0 }
      );

      setConsultationList(response);
      setIsDataLoaded(true);
      setTotalCount(responseCount[0].totalCount);
      setLoading(false); // <-- This was missing
    } catch (error) {
      setLoading(false); // <-- This was incorrectly set to true
      console.error("Error fetching Consultation list: ", error);
    }
  };
  useEffect(() => {
    getConsultationList();
  }, [currentPage, perPage]);



  const fetchCallHistoryData = async () => {
    try {
      setLoading(true);
      const response = await fetchAllData(
        `CallHistory/GetAllCallHistoryByMemberId/${callLogMemberId}`
      );
      setCallHistory(response);
      setLoading(false);
    } catch (error) {
      setLoading(true);
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getConsultationList();
  }, [currentPage, perPage]);

  useEffect(() => {
    if (callLogMemberId) {
      fetchCallHistoryData();
    }
  }, [callLogMemberId]);

  useEffect(() => {
    const getCallResponse = async () => {
      try {
        setLoading(true);
        const getResponseTypes = await fetchData("CallResponseType/all", {
          skip: 0,
          take: 0,
        });

        let CallResponseTypeId = getResponseTypes.filter(
          (types) => types.ResponseName === "Member"
        );

        const response = await fetchAllData(
          `CallResponse/GetCallResponsesByResponseType/${CallResponseTypeId[0].CallResponseTypeId}`
        );
        setCallResponseOptions(response);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching call responses:", error);
      }
    };

    getCallResponse();
  }, []);

  useEffect(() => {
    const isFormValid = formData.callResponsesId.length > 0;
    setIsFormValid(isFormValid);
  }, [formData]);

  const handleCallLog = (memberId) => {
    setCallLogMemberId(memberId);
    setIsModalOpen(true);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const onChangeHandler = (event) => {
    const { name, value, type, checked } = event.target;
    let updatedFormData = {
      ...formData,
      [name]: type === "checkbox" ? (checked ? value : "") : value,
    };
    let error = "";

    if (name === "DateToBeVisited" && value.length === 10) {
      const defaultTime = "T00:00:00";
      updatedFormData = {
        ...updatedFormData,
        DateToBeVisited: `${value}${defaultTime}`,
      };
    }

    setFormData(updatedFormData);
    setFormError({ ...formError, [name]: error });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      let CallHistoryData;
      const requestData = {
        callLog: formData.callLog,
        MemberId: callLogMemberId,
        userId: UserId,
        callResponsesId: formData.callResponsesId,
      };

      if (formData.DateToBeVisited) {
        requestData.DateToBeVisited = new Date(
          formData.DateToBeVisited
        ).toISOString();
      }

      if (formData.RequestCallBack) {
        requestData.RequestCallBack = new Date(
          formData.RequestCallBack
        ).toISOString();
      }

      CallHistoryData = await fetchData("CallHistory/add", requestData);

      setSnackbarMessage("New call log added successfully!");

      setCallHistory(CallHistoryData);
      setSnackbarOpen(true);

      await fetchCallHistoryData();
      getConsultationList();
    } catch (error) {
      console.error("Error adding call log:", error);
    } finally {
      setIsFormVisible(false);
      setFormData(initialFormData);
    }
  };

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

  const showCallLog = () => {
    return callHistory && callHistory.length > 0 ? (
      <div className="row">
        <h6 className="mb-2">{callHistory[0].CustomerName} details </h6>
        <div className="card col-lg-6 col-md-12 col-sm-12 card-action mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-action-title mb-0">
              <i className="bx bx-list-ul me-2"></i>Call History
            </h5>
          </div>
          <div className="card-body">
            <ul className="timeline ms-2">
              {callHistory.map((call, index) => (
                <li
                  key={index}
                  className="timeline-item timeline-item-transparent"
                >
                  <span className="timeline-point-wrapper">
                    <span className="timeline-point timeline-point-success"></span>
                  </span>
                  <div className="timeline-event">
                    <div className="timeline-header mb-1">
                      <h6 className="mb-0">
                        {call.UserName}
                        <span className="badge bg-label-primary mb-2 ms-2">
                          {call.CallResponseName}
                        </span>
                      </h6>
                      <small className="text-muted">
                        {moment
                          .utc(call.CollectedDate)
                          .local()
                          .diff(moment(), "days") <= thresholdDays ? (
                          <strong>
                            {moment.utc(call.CollectedDate).local().fromNow()}
                          </strong>
                        ) : (
                          <strong>
                            {moment
                              .utc(call.CollectedDate)
                              .local()
                              .format("DD-MMM-YYYY HH:mm")}
                          </strong>
                        )}
                      </small>
                    </div>

                    <div className="timeline-header mb-1 mt-1">
                      <h6 className="mb-0">Remarks :</h6>
                    </div>
                    <p className="mb-0">{call.CallLog}</p>

                    {call.DateToBeVisited !== "0001-01-01T00:00:00" && (
                      <>
                        <div className="timeline-header mb-1 mt-1">
                          <h6 className="mb-0">Requested RM to visit on :</h6>
                        </div>
                        <p className="mb-0">
                          {moment
                            .utc(call.DateToBeVisited)
                            .local()
                            .format("DD-MMM-YYYY")}
                        </p>
                      </>
                    )}

                    {call.RequestCallBack !== "0001-01-01T00:00:00" && (
                      <>
                        <div className="timeline-header mb-1 mt-1">
                          <h6 className="mb-0">Requested Callback on :</h6>
                        </div>
                        <p className="mb-0">
                          {moment
                            .utc(call.RequestCallBack)
                            .local()
                            .format("DD-MMM-YYYY HH:mm")}
                        </p>
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

        <div className="col-lg-6 col-md-12 col-sm-12">
          <button
            className="btn btn-primary btn-md mb-4"
            onClick={() => setIsFormVisible(true)}
          >
            Add New Call Log
          </button>
          {isFormVisible && addCallLogForm()}
        </div>
      </div>
    ) : (
      <div className="row">
        <div className="row">
          <div className="col-lg-6">
            <div className="text-danger fw-semibold mb-4">
              No Call History records
            </div>
          </div>
          <div className="col-lg-6">
            <button
              className="btn btn-primary btn-md mb-4"
              onClick={() => setIsFormVisible(true)}
            >
              Add New Call Log
            </button>
          </div>
          {isFormVisible && addCallLogForm()}
        </div>
      </div>
    );
  };

  const addCallLogForm = () => {
    return (
      <form
        onSubmit={onSubmitHandler}
        className="p-4 border rounded shadow-sm bg-white mb-4"
      >
        <div className="mb-4">
          <h5 className="mb-3" style={{ fontWeight: "bold" }}>
            Call Response{" "}
            <span className="required" style={{ color: "red" }}>
              {" "}
              *
            </span>
          </h5>
          <div className="d-flex flex-wrap">
            {callResponseOptions &&
              callResponseOptions.map((option) => (
                <div
                  className="form-check me-4 mb-2 col-sm-6 col-md-5"
                  key={option.CallResponsesId}
                >
                  <input
                    className="form-check-input"
                    type="radio"
                    id={`callResponse_${option.CallResponsesId}`}
                    name="callResponsesId"
                    value={option.CallResponsesId}
                    checked={formData.callResponsesId.includes(
                      option.CallResponsesId
                    )}
                    onChange={onChangeHandler}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`callResponse_${option.CallResponsesId}`}
                  >
                    {option.ResponseName}
                  </label>
                </div>
              ))}
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 col-md-6 col-sm-6">
            <div className="mb-3">
              <label htmlFor="DateToBeVisited" className="form-label">
                Date To Be Visited
              </label>
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

          <div className="col-md-12 col-sm-6">
            <div className="mb-3">
              <label htmlFor="RequestCallBack" className="form-label">
                Request Call Back
              </label>
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

        <div className="mb-3">
          <label htmlFor="remarks" className="form-label">
            Remarks
          </label>
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

        <div className="row">
          <div className="col-md-12 col-sm-12 col-lg-12 d-flex justify-content-start">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid}
            >
              Submit
            </button>

            <button
              className="btn btn-secondary ms-2"
              type="button"
              onClick={handleResetForm}
            >
              Reset
            </button>
            <button
              className="btn btn-danger ms-2"
              type="button"
              onClick={handleBackToView}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <>
      {loading ? (
        <TableSkeletonLoading />
      ) : !isDataLoaded ? (
        <TableSkeletonLoading />
      ) : (
        <div className="card">
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
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
              content: {
                position: "relative",
                width: "70%",
                maxHeight: "90vh",
                margin: "auto",
                borderRadius: "8px",
                padding: "20px",
                overflow: "auto",
                left: window.innerWidth > 1100 ? 100 : 0,
                right: window.innerWidth > 1100 ? 50 : 0,
                top: 70,
              },
            }}
          >
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  style={{ border: "0px", backgroundColor: "transparent" }}
                  onClick={() => {
                    setIsModalOpen(false);
                    setCallLogMemberId();
                    setIsFormVisible(false);
                    setFormData(initialFormData);
                    setFormError({});
                  }}
                >
                  <i
                    style={{ height: "30px", width: "30px" }}
                    className="fa-regular fa-circle-xmark"
                  ></i>
                </button>
              </div>

              <div>{showCallLog()}</div>
            </>
          </Modal>

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
      )}
    </>
  );
}
