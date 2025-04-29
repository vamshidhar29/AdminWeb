import React, { useEffect, useState } from "react";
import { fetchData, fetchAllData } from "../../helpers/externapi";
import CommonTables from "../../Commoncomponents/CommonTables";
import CircularProgress from "@mui/material/CircularProgress";

export default function PendingList() {
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Unified state
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const tableHeads = [
    "Customer Name",
    "Dependent Name",
    "Service Type",
    "Service Name",
    "Initiated By",
    "Status",
  ];

  const tableElements =
    pendingData && pendingData.length > 0
      ? pendingData.map((pending) => [
          pending.CustomerName || "N/A",
          pending.DependentName || "N/A",
          pending.ServiceType || "N/A",
          pending.ServiceName || "N/A",
          pending.InitiatedBy || "N/A",
          <div
            style={{
              backgroundColor: "#e6f4ea",
              color: "#34a853",
              padding: "4px 8px",
              borderRadius: "4px",
              display: "inline-block",
              fontWeight: "500",
            }}
          >
            {pending.Status || "N/A"}
          </div>,
        ])
      : [];

  const getPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const skip = (currentPage - 1) * perPage;
      const take = perPage;

      const pendingData = await fetchData(
        "lambdaAPI/ServiceRequests/GetPendingServiceRequests",
        { skip, take }
      );

      setPendingData(Array.isArray(pendingData) ? pendingData : []);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPending();
  }, [currentPage, perPage]); // ✅ Updates when page or rows per page change

  const getPendingCountData = async () => {
    try {
      setLoading(true);
      const data = await fetchAllData(
        "lambdaAPI/ServiceRequests/GetPendingServiceRequestsCount"
      );

      if (Array.isArray(data) && data.length > 0) {
        setTotalCount(data[0]?.CountOfRecords || 0);
      } else if (typeof data === "object" && data !== null) {
        setTotalCount(data.CountOfRecords || data.count || 0);
      } else if (typeof data === "number") {
        setTotalCount(data);
      } else {
        setTotalCount(0);
      }
    } catch (error) {
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPendingCountData();
  }, []);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  return (
    <div>
      <h3>
        <b>Pending List</b>
      </h3>

      <div className="card">
        {loading ? (
          <div>
            <CircularProgress />
          </div>
        ) : pendingData.length > 0 ? (
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
          <h4 className="text-danger text-center m-3">No records exist</h4>
        )}
      </div>
    </div>
  );
}
