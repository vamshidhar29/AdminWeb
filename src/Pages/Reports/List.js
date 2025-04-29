import React, { useEffect, useState } from "react";
import moment from "moment";
import { fetchData } from "../../helpers/externapi";
import Flatpickr from "react-flatpickr";
import { saveAs } from "file-saver";
import Pagination from "@mui/material/Pagination";

export default function List() {
  const [loading, setLoading] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState("");
  const [selectedDateField, setSelectedDateField] = useState("");
  const [reportsOptions, setReportsOptions] = useState([]);
  const [dateFieldsOptions, setDateFieldsOptions] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isDisableApply, setIsDisableApply] = useState(true);
  const [totalReports, setTotalReports] = useState();
  const [statusMessage, setStatusMessage] = useState("");
  const [reportsData, setReportsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [paginationData, setPaginationData] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState([]);
  const [reportsMessage, setReportsMessage] = useState("");
  const [totalAmount, setTotalAmount] = useState();
  const [selectedReportName, setSelectedReportName] = useState("");
  const [generateReport, setGenerateReport] = useState([]);
  const [ReportsId, setReportsId] = useState(null);
  const [reportsHistoryData, setReportsHistoryData] = useState(null);

  let UserId = localStorage.getItem("UserId");

  const heads =
    reportsData && reportsData.length > 0 && Object.keys(reportsData[0]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const reportsData = await fetchData("lambdaAPI/Reports/all", {
          skip: 0,
          take: 0,
        });
        const options = reportsData.map((item) => ({
          label: item.ReportName,
          value: item.ReportsId,
        }));
        setReportsOptions(options);
        setTotalReports(reportsData);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleReportSelect = (event) => {
    const reportId = event.target.value;
    const reportName = event.target.selectedOptions[0].dataset.label;
    setSelectedReportId(reportId);
    setSelectedReportName(reportName);

    const datefield = totalReports.find(
      (item) => item.ReportsId === parseInt(reportId)
    );

    if (datefield && datefield.DateFields) {
      datefield.DateFields.length > 0 &&
        setDateFieldsOptions([
          { label: datefield.DateFields, value: datefield.DateFields },
        ]);
    } else {
      setDateFieldsOptions([]);
    }
  };

  const handleDateFieldSelect = (event) => {
    const dateField = event.target.value;
    setSelectedDateField(dateField);
  };

  const getReportsData = async () => {
    let startDate = "";
    let endDate = "";

    if (selectedDates.length === 1) {
      startDate = moment(selectedDates[0]).format("YYYY-MM-DD");
      endDate = moment(selectedDates[0]).format("YYYY-MM-DD");
    } else if (selectedDates.length === 2) {
      startDate = moment(selectedDates[0]).format("YYYY-MM-DD");
      endDate = moment(selectedDates[1]).format("YYYY-MM-DD");
    }

    const filterParams = {
      reportsId: selectedReportId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      fieldName: selectedDateField || undefined,
    };

    setLoading(true);

    const response = await fetchData("lambdaAPI/Reports/GetTableReportsExcel", {
      ...filterParams,
    });

    if (response && response.length > 0) {
      setStatusMessage(
        "Report generated successfully. Downloading the file..."
      );
      saveAs(response);
      setStatusMessage("Downloaded Successfully!");
    } else {
      setStatusMessage("No data found for the report.");
      setReportsMessage("");
    }
    setLoading(false);
  };

  const generateReports = async () => {
    let startDate = "";
    let endDate = "";

    if (selectedDates.length === 1) {
      startDate = moment(selectedDates[0]).format("YYYY-MM-DD");
      endDate = moment(selectedDates[0]).format("YYYY-MM-DD");
    } else if (selectedDates.length === 2) {
      startDate = moment(selectedDates[0]).format("YYYY-MM-DD");
      endDate = moment(selectedDates[1]).format("YYYY-MM-DD");
    }

    const filterParams = {
      reportsId: selectedReportId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      fieldName: selectedDateField || undefined,
    };

    try {
      setReportsLoading(true);
      const response = await fetchData("lambdaAPI/Reports/GetTableReportsData", {
        ...filterParams,
      });

      const skip = (currentPage - 1) * perPage;
      const take = perPage;

      if (response && response.length > 0) {
        setReportsData(response);
        setFilteredData(response);
        setTotalCount(response.length);

        if (selectedReportName === "SalesReport") {
          let receviedAmt = 0;
          response.map((res) => {
            if (
              res["Paid Amount"] !== null &&
              res["Paid Amount"] !== undefined
            ) {
              receviedAmt = receviedAmt + res["Paid Amount"];
            }
          });
          setTotalAmount(receviedAmt);
        }
        setPaginationData(response.slice(skip, take));
        setSearchFilter([]);
        setReportsMessage("");
        setStatusMessage("");
      } else if (response && response.length === 0) {
        setReportsMessage("No data to display");
        setStatusMessage("");
        setReportsData(response);
        setFilteredData(response);
        setTotalCount(response.length);
        setTotalAmount(0);
        setPaginationData(response.slice(skip, take));
        setSearchFilter([]);
      } else {
        setReportsMessage(
          "Internal Server Error. Please contact Technical Team"
        );
      }
    } catch (e) {
      console.error("Error Fetching Reports/GetTableReportsData: ", e);
    } finally {
      setReportsLoading(false);
    }
  };

  const applyFilter = async (e) => {
    e.preventDefault();

    if (selectedReportId.length === 0) {
      setValidationMessage("Please select Report Name");
    } else {
      setValidationMessage("");
      setLoading(true);
      setReportsMessage("");
      setStatusMessage("Generating your report, please wait...");

      try {
        await getReportsData();
      } catch (error) {
        console.error("Error applying filter:", error);
        setStatusMessage("Error generating the report.");
      } finally {
        setLoading(false);
      }
    }
  };

  const clearFilters = () => {
    setSelectedReportId("");
    setSelectedDateField("");
    setDateFieldsOptions([]);
    setSelectedDates([]);
    setStatusMessage("");
    setIsDisableApply(true);
    setReportsData([]);
    setFilteredData([]);
    setTotalCount(0);
    setTotalAmount(0);
    setPaginationData([]);
    setSearchFilter([]);
    setReportsMessage("");
  };

  useEffect(() => {
    if (
      selectedReportId.length === 0 &&
      selectedDateField.length === 0 &&
      selectedDates.length === 0
    ) {
      setIsDisableApply(true);
    } else {
      setIsDisableApply(false);
    }
  }, [selectedReportId, selectedDateField, selectedDates]);

  function formatDateRange(startDate, endDate) {
    const options = { day: "2-digit", month: "short", year: "numeric" };

    const start = startDate
      .toLocaleDateString("en-GB", options)
      .replace(/ /g, "-");
    const end = endDate.toLocaleDateString("en-GB", options).replace(/ /g, "-");

    return `${start} to ${end}`;
  }

  useEffect(() => {
    let data = [];

    const skip = (currentPage - 1) * perPage;
    const take = perPage;

    if (searchFilter.length === 0) {
      setFilteredData(reportsData);
      setTotalCount(reportsData.length);

      if (selectedReportName === "SalesReport") {
        let receviedAmt = 0;
        reportsData.map((res) => {
          if (res["Paid Amount"] !== null && res["Paid Amount"] !== undefined) {
            receviedAmt = receviedAmt + res["Paid Amount"];
          }
        });
        setTotalAmount(receviedAmt);
      }
      setPaginationData(reportsData.slice(skip, take));
    } else {
      data = reportsData.filter((item) => {
        return searchFilter.every((fil) => {
          const key = Object.keys(fil)[0];
          const value = Object.values(fil)[0];

          return (
            item[key] !== null &&
            item[key] !== undefined &&
            item[key]
              .toString()
              .toLowerCase()
              .includes(value.toString().toLowerCase())
          );
        });
      });

      setFilteredData(data);
      setTotalCount(data.length);

      if (selectedReportName === "SalesReport") {
        let receviedAmt = 0;
        data.map((res) => {
          if (res["Paid Amount"] !== null && res["Paid Amount"] !== undefined) {
            receviedAmt = receviedAmt + res["Paid Amount"];
          }
        });
        setTotalAmount(receviedAmt);
      }
      setPaginationData(data.slice(skip, take));
    }
  }, [searchFilter]);

  const onChangeSearch = (e) => {
    let { name, value } = e.target;
    value = value.trim();

    let updatedFilters = [];

    setSearchFilter((prevFilters) => {
      const index = prevFilters.findIndex(
        (filter) => Object.keys(filter)[0] === name
      );

      if (value.length === 0) {
        updatedFilters = prevFilters.filter(
          (filter) => Object.keys(filter)[0] !== name
        );
      } else if (index !== -1) {
        updatedFilters = [...prevFilters];
        updatedFilters[index] = { [name]: value };
      } else {
        updatedFilters = [...prevFilters, { [name]: value }];
      }
      return updatedFilters;
    });
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);

    const skip = (page - 1) * perPage;
    const take = skip + perPage;

    setPaginationData(filteredData.slice(skip, take));
  };

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);

    const skip = (1 - 1) * parseInt(event.target.value, 10);
    const take = parseInt(event.target.value, 10);

    setPaginationData(filteredData.slice(skip, take));
  };

  const selectedReportLabel =
    reportsOptions.find((option) => option.value === parseInt(selectedReportId))
      ?.label || "No report selected";

  return (
    <>
      <div className="card mb-2">
        <div className="card-body">
          <div
            className="select2-primary"
            style={{ display: "flex", flexWrap: "wrap" }}
          >
            {(selectedReportId.length > 0 ||
              selectedDateField.length > 0 ||
              selectedDates.length > 0) && (
              <>
                {selectedReportId.length > 0 && (
                  <div
                    style={{
                      marginRight: "10px",
                      marginBottom: "0px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <strong style={{ marginRight: "5px" }}>
                      Report Name:{" "}
                    </strong>
                    <span className="selected-option-button">
                      {selectedReportLabel}
                    </span>
                  </div>
                )}

                {selectedDateField.length > 0 && (
                  <div
                    style={{
                      marginRight: "10px",
                      marginBottom: "0px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <strong style={{ marginRight: "5px" }}>Date Field: </strong>
                    <span className="selected-option-button">
                      {selectedDateField}
                    </span>
                  </div>
                )}

                {selectedDates.length > 0 && (
                  <div
                    style={{
                      marginRight: "10px",
                      marginBottom: "0px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <strong style={{ marginRight: "5px" }}>
                      Selected Dates:{" "}
                    </strong>
                    <span className="selected-option-button">
                      {formatDateRange(
                        selectedDates[0],
                        selectedDates[selectedDates.length - 1]
                      )}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="d-flex flex-wrap justify-content-start align-items-end">
            <div className="me-3 mb-1" style={{ width: "250px" }}>
              <label htmlFor="selectReports" className="form-label my-2">
                Report Name
              </label>
              <span className="required" style={{ color: "red" }}>
                {" "}
                *
              </span>
              <select
                id="selectReports"
                className="form-select"
                onChange={handleReportSelect}
                value={selectedReportId}
              >
                <option value="">Select a report</option>
                {reportsOptions.map((option) => (
                  <option
                    key={option.value}
                    data-label={option.label}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              {validationMessage && (
                <div style={{ color: "red" }}>{validationMessage}</div>
              )}
            </div>

            {dateFieldsOptions && dateFieldsOptions.length > 0 && (
              <div className="me-3 mb-1" style={{ width: "250px" }}>
                <label htmlFor="selectDateFields" className="form-label my-2">
                  Date Fields
                </label>
                <select
                  id="selectDateFields"
                  className="form-select"
                  onChange={handleDateFieldSelect}
                  value={selectedDateField}
                >
                  <option value="">Select a date field</option>
                  {dateFieldsOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedDateField && (
              <div className="me-3 mb-1" style={{ width: "250px" }}>
                <label htmlFor="fromDate" className="form-label my-2">
                  Select Dates:
                </label>
                <Flatpickr
                  value={selectedDates}
                  placeholder="YYYY-MM-DD to YYYY-MM-DD"
                  onChange={setSelectedDates}
                  options={{ mode: "range", dateFormat: "Y-m-d" }}
                  className="form-control"
                  key={selectedDates} // Adding a key forces the component to re-render when state changes
                />
              </div>
            )}

            <div className="d-flex">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={clearFilters}
              >
                Clear
              </button>
              <button
                type="button"
                className="btn btn-info me-2"
                onClick={(e) => applyFilter(e)}
                disabled={isDisableApply || loading}
                style={{ minWidth: "170px" }}
              >
                {loading ? (
                  <div className="spinner-border text-white" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Download Report"
                )}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => generateReports()}
                disabled={isDisableApply || reportsLoading}
                style={{ minWidth: "150px" }}
              >
                {reportsLoading ? (
                  <div className="spinner-border text-white" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  "Generate Report"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          style={{
            color: loading ? "blue" : "green",
            fontSize: "1.5rem",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {statusMessage}
        </div>
      )}

      {reportsMessage && reportsMessage.length > 0 && (
        <p className="text-danger text-center fs-5">{reportsMessage}</p>
      )}

      {reportsData &&
        reportsData.length > 0 &&
        (reportsLoading ? (
          <div className="d-flex flex-row justify-content-center pt-5">
            <div class="spinner-border text-info" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div class="card">
            <div className="d-flex flex-row flex-wrap">
              <label className="p-1">
                Total Records:
                <span style={{ fontWeight: "bold" }}> {totalCount}</span>
              </label>
              {selectedReportName === "SalesReport" && (
                <label className="p-1">
                  Amount Received:
                  <span style={{ fontWeight: "bold" }}> {totalAmount}</span>
                </label>
              )}
            </div>

            <div class="text-nowrap table-responsive">
              <table class="table table-bordered border-success table-striped">
                <thead>
                  <tr className="table-primary">
                    {heads.map((head) => (
                      <th>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="table-success">
                    {heads.map((head) => (
                      <td>
                        <input
                          type="text"
                          id={head}
                          name={head}
                          className="form-control"
                          placeholder="Search"
                          onChange={(e) => onChangeSearch(e)}
                        />
                      </td>
                    ))}
                  </tr>
                  {paginationData && paginationData.length > 0 ? (
                    paginationData.map((data) => (
                      <tr>
                        {heads.map((head) => (
                          <td>{data[head]}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <span className="text-danger ms-5 py-5 fs-5 text-center">
                      No Records to display
                    </span>
                  )}
                </tbody>
              </table>
            </div>
            <div className="row mt-2 mb-2">
              <div className=" col-sm-12 col-md-6">
                <div
                  className="dataTables_length"
                  id="DataTables_Table_0_length"
                >
                  <label style={{ marginRight: "10px" }}>Show entries</label>
                  <select
                    style={styles.paginationSelect}
                    value={perPage}
                    onChange={handlePerPageChange}
                  >
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={75}>75</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                  </select>
                </div>
              </div>
              <div className="col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end">
                <div className="dataTables_paginate paging_simple_numbers">
                  <Pagination
                    count={Math.ceil(totalCount / perPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    variant="outlined"
                    shape="rounded"
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
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
        background: #F7F7F7;
        background: linear-gradient(to right, #f0f0f0 8%, #fafafa 18%, #f0f0f0 33%);
        background-size: 1000px 104px;
        position: relative;
        overflow: hidden;
    }

    .shimmer-container {
        background-color: #F7F7F7;
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
        position: relative;
        left: 10%;
        bottom: 10%;
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
