import React, { useEffect, useState } from "react";
import moment from "moment";
import { fetchData } from "../../helpers/externapi";
import Pagination from "@mui/material/Pagination";
import CommonTables from "../../Commoncomponents/CommonTables";

export default function ReportsData() {
  const [reportsHistoryData, setReportsHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [allCompleted, setAllCompleted] = useState(false);

  let UserId = localStorage.getItem("UserId");

  const tableHeads = [
    "Report Name",
    "Start Time",
    "End Time",
    "Status",
    "Action",
  ];

  const tableElements = filteredData.length
    ? filteredData.map((report) => [
      report.ReportName,
      report.StartTime
        ? moment(report.StartTime).format("YYYY-MMM-DD hh:mm A")
        : null,
      report.EndTime
        ? moment(report.EndTime).format("YYYY-MMM-DD hh:mm A")
        : null,
      <span
        style={{
          backgroundColor:
            report.Status === "Completed"
              ? "#d4f8d4"
              : report.Status === "Initiated"
                ? "#cce5ff"
                : report.Status === "Processing"
                  ? "#ffeeba"
                  : report.Status === "In Progress"
                    ? "#fff3cd"
                    : "#f8d7da",
          color:
            report.Status === "Completed"
              ? "#28a745"
              : report.Status === "Initiated"
                ? "#007bff"
                : report.Status === "Processing"
                  ? "#fd7e14"
                  : report.Status === "In Progress"
                    ? "#ffc107"
                    : "#dc3545",
          padding: "5px 6px",
          borderRadius: "5px",
          display: "inline-block",
          textTransform: "uppercase",
          fontSize: "9px",
        }}
      >
        {report.Status}
      </span>,
      <div style={{ display: "flex", justifyContent: "center" }}>
        {report.Status === "Completed" && (
          <a
            href={report.ReportsLink}
            download
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "12px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.3s ease",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Download
          </a>
        )}
      </div>,
    ])
    : [];

  const getReportHistory = async () => {
    setLoading(true);
    try {
      const response = await fetchData(`lambdaAPI/Reports/ReportsHistoryByUserId`, {
        skip: (currentPage - 1) * perPage,
        take: perPage,
        UserId,
      });

      setReportsHistoryData(response);
      setFilteredData(response);
      
      // Check if all reports are completed
      const areAllCompleted = response.length > 0 && 
        response.every(report => report.Status === "Completed");
      setAllCompleted(areAllCompleted);
      
    } catch (error) {
      console.error("Error fetching report history data:", error);

      setReportsHistoryData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReportHistory();
  }, [currentPage, perPage]);

  const getReportsHistoryCount = async () => {
    setLoading(true);
    try {
      const ReportsHistoryCount = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "ReportsHistory", UserId }
      );
      const totalCount = ReportsHistoryCount[0]?.ReportsHistory || 0;
      
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospital count data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getReportsHistoryCount();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await getReportHistory();
    await getReportsHistoryCount();
    setRefreshing(false);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  useEffect(() => {
    // Clear any existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
    
    // Only set up the interval if not all reports are completed
    if (!allCompleted) {
      const intervalId = setInterval(() => {
        if (!loading) {
          getReportHistory();
        }
      }, 30000);
      
      setRefreshInterval(intervalId);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [loading, allCompleted]);

  return (
    <>
      <div className="card shadow-sm">
        <div
          className="card-header d-flex justify-content-between align-items-center"
          style={{ paddingTop: "4px" }}
        >
          {allCompleted && (
            <span className="text-success">
              <i className="bi bi-check-circle me-1"></i> All reports completed
            </span>
          )}
          <div className={allCompleted ? "" : "ms-auto"}>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="btn btn-light btn-sm d-flex align-items-center"
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>
        </div>
        <div className="card-body" style={{ margin: 0, padding: 0 }}>
          {loading ? (
            <p className="text-center">Loading reports...</p>
          ) : filteredData.length > 0 ? (
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
            <p className="text-center text-muted">No reports found.</p>
          )}
        </div>
      </div>
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
