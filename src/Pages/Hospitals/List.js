import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchData, fetchAllData } from "../../helpers/externapi";
import { MultiSelect } from "react-multi-select-component";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
  downloadCSVData,
  downloadExcelData,
} from "../../Commoncomponents/CommonComponents";
import Modal from "react-modal";
import CommonTables from "../../Commoncomponents/CommonTables";
import moment from "moment";
import { constructCompleteAddress } from "../../Commoncomponents/CommonComponents";
import { TableSkeletonLoading } from "../../Commoncomponents/SkeletonLoading";
import DescriptionCell from "../../Commoncomponents/DescriptionCell";
import { useLocation } from "react-router-dom";

export default function List(props) {
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableloading, setTableLoading] = React.useState(false);
  const [hospitalsData, setHospitalsData] = React.useState([]);
  const [hospitals, setHospitals] = useState([]); // Store hospital data
  const [selectedStates, setSelectedStates] = React.useState([]);
  const [statesMultiSelect, setStatesMultiSelect] = React.useState();
  const [selectedDistricts, setSelectedDistricts] = React.useState([]);
  const [districtsMultiSelect, setDistricsMultiSelect] = React.useState();
  const [totalCount, setTotalCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [filterCriteria, setFilterCriteria] = useState([]);
  const [selectedHospitalNames, setSelectedHospitalNames] = useState([]);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedCityNames, setSelectedCityNames] = useState([]);
  const [selectedMandalNames, setSelectedMandalNames] = useState([]);
  const [isDisableApply, setIsDisableApply] = useState(true);
  const accordionRef = useRef(null);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [callResponseOptions, setCallResponseOptions] = useState();
  const [callLogHospitalId, setCallLogHospitalId] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [callHistory, setCallHistory] = useState();
  const initialFormData = {
    hospitalCallLog: "",
    callResponsesId: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formError, setFormError] = useState({});
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [status, setStatus] = useState('active');

  const navigate = useNavigate();
  let UserId = localStorage.getItem("UserId");
  const thresholdDays = 5;

  const handleCallLog = (HospitalId) => {
    setCallLogHospitalId(HospitalId);
    setIsModalOpen(true);
  };

  const tableHeads = [
    "HOSPITAL NAME",
    "CALL HISTORY",
    "CONTACT",
    "MANDAL",
    "ADDRESS",
    "WEBSITE",
    "HOSPITAL CODE",
  ];

  const tableElements =
    hospitalsData && hospitalsData.length > 0
      ? hospitalsData.map((data) => [
        <Link
          to={`/hospitals/details/${data.HospitalId}`}
          className="text-start-important"
          style={{
            whiteSpace: "normal",
            textAlign: "start",
            display: "block",
          }}
        >
          {data.HospitalName}
        </Link>,
        <>
          <button
            style={{ border: "0px", backgroundColor: "white" }}
            type="button"
            onClick={() => handleCallLog(data.HospitalId)}
          >
            <Link>Call log Data</Link>
          </button>
        </>,
        <>
          <div>
            {data.HospitalMobileNumber ? (
              <a href={"tel:" + data.HospitalMobileNumber}>
                <i className="bx bx-phone-call" style={styles.phoneIcon}></i>
                {data.HospitalMobileNumber}
              </a>
            ) : (
              <span className="text-danger">Mobile Number dosen't exist</span>
            )}
          </div>
          <div>
            {data.Email ? (
              <a href={"mailto:" + data.Email}>
                <i className="fas fa-envelope" style={styles.emailIcon}></i>
                {data.Email}
              </a>
            ) : (
              <span className="text-danger">Email id dosen't exist</span>
            )}
          </div>
        </>,
        data.Mandal,
        <DescriptionCell description={data.completeAddress} />,
        data.Website ? (
          <a
            href={data.Website}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link(false)}
          >
            <i className="bx bx-globe bx-sm"></i>
          </a>
        ) : null,
        data.HospitalCode,
      ])
      : [];

  useEffect(() => {
    if (
      selectedHospitalNames.length === 0 &&
      selectedCityNames.length === 0 &&
      selectedStates.length === 0 &&
      selectedDistricts.length === 0 &&
      selectedMandalNames.lenght === 0
    ) {
      setIsDisableApply(true);
    } else {
      setIsDisableApply(false);
    }
  }, [
    selectedHospitalNames,
    selectedCityNames,
    selectedStates,
    selectedDistricts,
    selectedMandalNames,
  ]);

  useEffect(() => {
    const getCallResponse = async () => {
      try {
        const getResponseTypes = await fetchData("CallResponseType/all", {
          skip: 0,
          take: 0,
        });

        let CallResponseTypeId = getResponseTypes.filter(
          (types) => types.ResponseName === "Hospital"
        );

        const response = await fetchAllData(
          `CallResponse/GetCallResponsesByResponseType/${CallResponseTypeId[0].CallResponseTypeId}`
        );
        setCallResponseOptions(response);
      } catch (error) {
        console.error("Error fetching call responses:", error);
      }
    };

    getCallResponse();
  }, []);

  useEffect(() => {
    const isFormValid = formData.callResponsesId.length > 0;
    setIsFormValid(isFormValid);
  }, [formData]);

  const fetchCallHistoryData = async () => {
    setLoading(true);
    try {
      const response = await fetchAllData(
        `HospitalCallLogs/GetHospitalCallHistoryByHospitalId/${callLogHospitalId}`
      );
      setCallHistory(response);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    callLogHospitalId && fetchCallHistoryData();
  }, [callLogHospitalId]);

  const handleHospitalNameSelect = (event) => {
    const selectedHospitalName = event.target.value;
    if (selectedHospitalName === "") {
      setSelectedHospitalNames([]);
    } else {
      setSelectedHospitalNames([
        ...selectedHospitalNames,
        selectedHospitalName,
      ]);
    }
  };

  const handleCityNameSelect = (event) => {
    const selectedCityName = event.target.value;

    if (selectedCityName === "") {
      setSelectedCityNames([]);
    } else {
      setSelectedCityNames([...selectedCityNames, selectedCityName]);
    }
  };

  const handleMandalNameSelect = (event) => {
    const selectedMandalName = event.target.value;

    if (selectedMandalName === "") {
      setSelectedMandalNames([]);
    } else {
      setSelectedMandalNames([...selectedMandalNames, selectedMandalName]);
    }
  };

  useEffect(() => {
    setLoading(props.loading);
    setLoading(props.error);
  }, []);

  const getHospitalCountData = async () => {
    setLoading(true);
    try {
      const hospitalCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "Hospital", IsActive: status === 'active' ? true : false }
      );
      const totalCount = hospitalCountData[0]?.CountOfRecords || 0;
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospital count data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getHospitalCountData();
  }, [status]);

  const getHospitalData = async () => {
    setTableLoading(true);
    try {
      const skip = (currentPage - 1) * perPage;
      const take = perPage;

      let hospitalData;
      if (filterCriteria.length > 0) {
        hospitalData = await fetchData(
          "Hospital/GetMultipleHospitalDataByFilter",
          {
            skip,
            take,
            filter: filterCriteria,
          }
        );
      } else {
        hospitalData = await fetchData("Hospital/all", { skip, take, IsActive: status === 'active' ? true : false });


        setHospitalsData(hospitalData);
        setIsDataLoaded(true);
      }

      const dataToDisplay = hospitalData.map((hospital) => ({
        ...hospital,
        completeAddress: constructCompleteAddress(hospital),
        HospitalMobileNumber: hospital.HospitalMobileNumber,
      }));

      setTableLoading(false);
      setHospitalsData(dataToDisplay);

      setIsDataLoaded(true);
    } catch (error) {
      console.error("Error fetching hospital data:", error);
    } finally {
    }
  };

  useEffect(() => {
    getHospitalData();
  }, [status, filterCriteria, currentPage, perPage]);

  const handleInputChange = async (event) => {
    const value = event.target.value;
    setInput(value);

    if (value.length >= 2 && !/\d/.test(value)) {
      setSearchLoading(true);
      setError("");

      try {
        const citySuggestions = await fetchData(
          "Hospital/GetMultipleHospitalDataByFilter",
          {
            skip: 0,
            take: perPage,
            filter: [
              {
                key: "City",
                value: value,
                operator: "LIKE",
              },
            ],
          }
        );

        const hospitalNameSuggestions = await fetchData(
          "Hospital/GetMultipleHospitalDataByFilter",
          {
            skip: 0,
            take: perPage,
            filter: [
              {
                key: "HospitalName",
                value: value,
                operator: "LIKE",
              },
            ],
          }
        );

        const mandalSuggestions = await fetchData(
          "Hospital/GetMultipleHospitalDataByFilter",
          {
            skip: 0,
            take: perPage,
            filter: [
              {
                key: "Mandal",
                value: value,
                operator: "LIKE",
              },
            ],
          }
        );

        const combinedSuggestions = [
          ...citySuggestions,
          ...mandalSuggestions,
          ...hospitalNameSuggestions,
        ];
        const uniqueSuggestions = Array.from(
          new Set(combinedSuggestions.map(JSON.stringify))
        ).map(JSON.parse);

        if (uniqueSuggestions.length > 0) {
          setSuggestions(uniqueSuggestions);
        } else {
          setError("No suggestions found.");
          setSuggestions([]);
        }
      } catch (error) {
        setError("Failed to fetch suggestions.");
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/hospitals/details/${suggestion.HospitalId}`);
  };

  const clearSearch = () => {
    setInput("");
    setSuggestions([]);
  };

  useEffect(() => {
    const getStates = async () => {
      setLoading(true);
      const statesData = await fetchData("States/all", { skip: 0, take: 0 });
      const statesArray = [];
      statesData.forEach((item) => {
        statesArray.push({ label: item.StateName, value: item.StateId });
      });
      setStatesMultiSelect(statesArray);
      setLoading(false);
    };

    const getDistricts = async (event) => {
      const districtsData = await fetchData("Districts/all", {
        skip: 0,
        take: 0,
      });
      const districtsArray = [];
      districtsData.forEach((item) => {
        districtsArray.push({
          label: item.DistrictName,
          value: item.DistrictId,
        });
      });
      setDistricsMultiSelect(districtsArray);
      setLoading(false);
    };
    getStates();
    getDistricts();
  }, []);

  const applyFilters = async () => {
    setLoading(true);
    const selectedStateIds = selectedStates.map((state) => state.value);
    const selectedDistrictIds = selectedDistricts.map(
      (district) => district.value
    );
    const city = document.getElementById("city-input").value;
    const name = document.getElementById("name-input").value;
    const mandal = document.getElementById("mandal-input").value;

    const filterCriteria = [];

    if (name.trim() !== "") {
      filterCriteria.push({
        key: "HospitalName",
        value: name,
        operator: "LIKE",
      });
    }
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
    if (city.trim() !== "") {
      filterCriteria.push({
        key: "City",
        value: city,
        operator: "LIKE",
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
      const hospitalCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "Hospital", filter: filterCriteria }
      );
      const totalCount = hospitalCountData[0]?.CountOfRecords || 0;
      setTotalCount(totalCount);
      const filterData = await fetchData(
        "Hospital/GetMultipleHospitalDataByFilter",
        {
          skip: 0,
          take: perPage,
          filter: filterCriteria,
        }
      );
      //const filterCount = await fetchData("Hospital/GetMultipleHospitalDataByFilter", {
      //    countOnly: true,
      //    filter: filterCriteria
      //});
      //const totalCount = filterCount.length;
      //const newPaginationCount = Math.ceil(totalCount / perPage);
      //setTotalCount(totalCount);
      setPerPage(perPage);
      setCurrentPage(1);
      setHospitalsData(
        filterData.map((hospital) => ({
          ...hospital,
          HospitalMobileNumber: hospital.HospitalMobileNumber,
        }))
      );
      setFilterCriteria(filterCriteria);
      const accordionElement = accordionRef.current;
      /*if (accordionElement) {
                const bsCollapse = new bootstrap.Collapse(accordionElement, { toggle: true });
                bsCollapse.hide();
            }*/
    } catch (error) {
      console.error("Error applying filter:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedStates([]);
    setSelectedDistricts([]);
    setSelectedHospitalNames([]);
    setSelectedCityNames([]);
    setFilterCriteria([]);
    setSelectedMandalNames([]);
    getHospitalCountData();
    getHospitalData();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handlePageChange = async (event, page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const handleExcelDownload = async () => {
    setLoading(true);
    downloadExcelData(
      "hospitalslist",
      totalCount,
      perPage,
      currentPage,
      fetchData,
      filterCriteria,
      setLoading,
      null,  
      null, 
      status
    );
  };

  const handleCSVDownload = async () => {
    setLoading(true);
    downloadCSVData(
      "hospitalslist",
      totalCount,
      perPage,
      currentPage,
      fetchData,
      filterCriteria,
      setLoading,
      null, 
      null,  
      status
    );
  };

  const handleResetForm = () => {
    setFormData(initialFormData);
    setFormError({});
  };

  const handleBackToView = () => {
    setIsFormVisible(false);
  };

  const onChangeHandler = (event) => {
    const { name, value, type, checked } = event.target;
    let updatedFormData = {
      ...formData,
      [name]: type === "checkbox" ? (checked ? value : "") : value,
    };
    let error = "";

    setFormData(updatedFormData);
    setFormError({ ...formError, [name]: error });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      let CallHistoryData;
      const requestData = {
        hospitalId: callLogHospitalId,
        userId: UserId,
        callResponsesId: formData.callResponsesId,
        hospitalCallLog: formData.hospitalCallLog,
      };

      CallHistoryData = await fetchData("HospitalCallLogs/add", requestData);
      setSnackbarMessage("New call log added successfully!");

      setCallHistory(CallHistoryData);
      setSnackbarOpen(true);

      await fetchCallHistoryData();
      getHospitalData();
    } catch (error) {
      console.error("Error adding call log:", error);
    } finally {
      setLoading(false);
      setIsFormVisible(false);
      setFormData(initialFormData);
    }
  };

  const showCallLog = () => {
    return callHistory && callHistory.length > 0 ? (
      <div className="row">
        <h6 className="mb-2">{callHistory[0].HospitalName} details </h6>
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
                          {call.CallResponsesId}
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
                    <p className="mb-0">{call.HospitalCallLog}</p>
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

        <div className="mb-3">
          <label htmlFor="remarks" className="form-label">
            Remarks
          </label>
          <textarea
            className="form-control"
            id="remarks"
            name="hospitalCallLog"
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

  const filterUI = () => (
    <div className="card p-1 my-1 sticky-top" style={{ zIndex: 1 }}>
      <div
        className="select2-primary mx-2 mb-2"
        style={{ display: "flex", flexWrap: "wrap" }}
      >
        {(selectedHospitalNames.length > 0 ||
          selectedStates.length > 0 ||
          selectedDistricts.length > 0 ||
          selectedCityNames.length > 0 ||
          selectedMandalNames.length > 0) && (
            <>
              <strong style={{ marginRight: "5px" }}>Filter Criteria - </strong>

              {selectedHospitalNames.length > 0 && (
                <div
                  style={{
                    marginRight: "10px",
                    marginBottom: "0px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <strong style={{ marginRight: "5px" }}>Hospital Name : </strong>
                  <span className="selected-option-button">
                    {selectedHospitalNames[selectedHospitalNames.length - 1]}
                  </span>
                </div>
              )}

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
                    <span key={district.value} className="selected-option-button">
                      {district.label}
                      {index !== selectedDistricts.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              )}
              {selectedCityNames.length > 0 && (
                <div
                  style={{
                    marginRight: "10px",
                    marginBottom: "0px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <strong style={{ marginRight: "5px" }}>City : </strong>
                  <span className="selected-option-button">
                    {selectedCityNames[selectedCityNames.length - 1]}
                  </span>
                </div>
              )}
              {selectedMandalNames.length > 0 && (
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
                    {selectedMandalNames[selectedMandalNames.length - 1]}
                  </span>
                </div>
              )}
            </>
          )}
      </div>

      < div className="row align-items-center">
        <div className="col-4 col-md-4">
          <ul className="nav nav-md nav-pills">

            <li>
              <button
                className={`nav-link ${status === 'active' ? 'active' : ''}`}
                onClick={async () => {
                  setStatus('active');
                }}
              >
                Active
              </button>
            </li>

            {/* In-Active Link */}
            <li>
              <button
                className={`nav-link ${status === 'inactive' ? 'active' : ''}`}
                onClick={async () => {
                  setStatus('inactive');
                }}
              >
                In-Active
              </button>
            </li>

            <li className="nav-item">
              <Link className={"nav-link"} to={`/hospitals/new`}>
                <i className="tf-icons navbar-icon bx bx-plus-circle"></i>
                &nbsp;Add New
              </Link>
            </li>
          </ul>
        </div>



        <div className="col-8 col-md-4">
          <div>
            <label htmlFor="search-input" className="form-label">
              Hospital Name or City Or Mandal
            </label>
            <div style={{ position: "relative", maxWidth: "350px" }}>
              <input
                type="text"
                id="search-input"
                className="form-control"
                style={{ paddingLeft: "30px" }}
                maxLength="50"
                value={input}
                onChange={handleInputChange}
              />
              {input && (
                <i
                  className="fas fa-times-circle"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "16px",
                    color: "red",
                    cursor: "pointer",
                  }}
                  onClick={clearSearch}
                ></i>
              )}
              {searchLoading && (
                <div
                  style={{
                    position: "absolute",
                    right: "40px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <div
                    className="spinner-border text-primary"
                    role="status"
                    style={{ width: "1.5rem", height: "1.5rem" }}
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {input && !searchLoading && suggestions.length > 0 && (
                <ul
                  style={{
                    listStyleType: "none",
                    padding: "0",
                    margin: "0",
                    border: "1px solid #00796b",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    position: "absolute",
                    width: "100%",
                    backgroundColor: "#fff",
                    zIndex: 10,
                    top: "100%",
                    left: "0",
                  }}
                >
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        padding: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <i
                        className="fas fa-arrow-up-left"
                        style={{
                          marginRight: "8px",
                          color: "#00796b",
                        }}
                      ></i>
                      <span style={{ flex: 1 }}>{suggestion.HospitalName}</span>
                    </li>
                  ))}
                </ul>
              )}

              {input && !searchLoading && error && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    color: "red",
                    fontSize: "0.9rem",
                    marginTop: "4px",
                    backgroundColor: "#fff", // Matches suggestion background
                    border: "1px solid #00796b", // Matches suggestion border
                    borderRadius: "4px", // Matches suggestion border-radius
                    padding: "8px", // Adds spacing similar to suggestions
                    zIndex: 10, // Ensures it appears above other elements
                    width: "100%", // Ensures it aligns with the input width
                  }}
                >
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 mt-2 mt-md-0 d-flex flex-row-reverse content-between align-items-center gap-2">
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
          <button
            type="button"
            className="btn btn-sm btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#filterModal"
          >
            <i className="fas fa-filter" style={{ marginRight: "5px" }}></i>
            <span className="d-none d-sm-inline-block"> Filters</span>
          </button>
        </div>
      </div>
    </div>
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

          {/* Modal for Filters */}
          <div
            className="modal fade"
            id="filterModal"
            tabIndex="-1"
            aria-labelledby="filterModalLabel"
            aria-hidden="true"
            style={{ marginTop: "120px" }}
          >
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="filterModalLabel">
                    Filters
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mt-1">
                      <label htmlFor="name-input" className="form-label">
                        Hospital Name
                      </label>
                      <input
                        type="text"
                        id="name-input"
                        value={
                          selectedHospitalNames[
                          selectedHospitalNames.length - 1
                          ]
                        }
                        className="form-control"
                        onChange={handleHospitalNameSelect}
                      />
                    </div>
                    <div className="col-md-6 mt-1">
                      <label htmlFor="city-input" className="form-label">
                        City
                      </label>
                      <input
                        type="text"
                        id="city-input"
                        value={selectedCityNames[selectedCityNames.length - 1]}
                        className="form-control"
                        onChange={handleCityNameSelect}
                      />
                    </div>
                    <div className="col-md-6 mt-1">
                      <label htmlFor="mandal-input" className="form-label">
                        Mandal
                      </label>
                      <input
                        type="text"
                        id="mandal-input"
                        value={
                          selectedMandalNames[selectedMandalNames.length - 1]
                        }
                        className="form-control"
                        onChange={handleMandalNameSelect}
                      />
                    </div>
                    <div className="col-md-6 mt-1">
                      <label
                        htmlFor="states-multi-select"
                        className="form-label"
                      >
                        States
                      </label>
                      {statesMultiSelect && (
                        <MultiSelect
                          id="states-multi-select"
                          options={statesMultiSelect}
                          value={selectedStates}
                          onChange={setSelectedStates}
                        />
                      )}
                    </div>
                    <div className="col-md-6 mt-1">
                      <label
                        htmlFor="districts-multi-select"
                        className="form-label"
                      >
                        Districts
                      </label>
                      {districtsMultiSelect && (
                        <MultiSelect
                          id="districts-multi-select"
                          options={districtsMultiSelect}
                          value={selectedDistricts}
                          onChange={setSelectedDistricts}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
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
                    onClick={applyFilters}
                    disabled={isDisableApply}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="row mt-2">
            <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1">
              <div className="card mb-4" style={{ opacity: loading ? 0.5 : 1 }}>
                <div>
                  {!loading && !tableloading && hospitalsData.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <h5 className="text-danger">
                        There are no records to display.
                      </h5>
                    </div>
                  )}

                  {!loading && !tableloading && hospitalsData.length > 0 && (
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

          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => {
              setIsModalOpen(false);
              setCallLogHospitalId();
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
                    setCallLogHospitalId();
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
        </>
      )}
    </>
  );
}

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px 15px",
    border: "1px solid #ddd",
    textAlign: "left",
    backgroundColor: "#f2f2f2",
    color: "#333",
    textTransform: "uppercase",
    fontSize: "11px",
    letterSpacing: "1px",
    fontWeight: "bold",
  },
  td: {
    padding: "12px 15px",
    border: "1px solid #ddd",
    textAlign: "left",
    fontSize: "14px",
    whiteSpace: "normal",
    maxWidth: "200px",
  },
  headerRow: {
    backgroundColor: "#f9f9f9",
  },
  link: (isHovered) => ({
    color: isHovered ? "blue" : "#0E94C3",
    cursor: "pointer",
    transition: "color 0.3s",
  }),
  phoneIcon: {
    marginRight: "5px",
  },
  emailIcon: {
    marginRight: "5px",
  },
  paginationContainer: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
  },
  paginationSelect: {
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid",
    marginRight: "10px",
    borderColor: "blue",
  },
};
