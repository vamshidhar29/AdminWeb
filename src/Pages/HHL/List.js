import React, { useEffect, useState, useRef } from "react";
import { fetchData } from "../../helpers/externapi";
import CircularProgress from "@mui/material/CircularProgress";
import "jspdf-autotable";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CommonTables from "../../Commoncomponents/CommonTables";
import { formatDate } from "../../Commoncomponents/CommonComponents";

export default function List(props) {
  const [loading, setLoading] = React.useState(false);
  const [tableloading, setTableLoading] = React.useState(false);
  const [statesMultiSelect, setStatesMultiSelect] = React.useState();
  const [totalCount, setTotalCount] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [HHLDate, setHHLDate] = React.useState([]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  let UserId = localStorage.getItem("UserId");

  const tableHeads = [
    "Name",
    "ProductName",
    "Start Time",
    "Status",
    "End Time",
    "Error"
  ];

  const tableElements =
    HHLDate && HHLDate.length > 0
      ? HHLDate.map((data) => [
        data.Name,
        data.ProductName,
        data.StartTime ? formatDate(data.StartTime) : "",
        <>
          {data.Status}
          {data.Status === "Aborted" && (
            <>
              <br />
              <button
                className="btn"
                onClick={() => handleGeneratePolicy(data)}
                style={{
                  textDecoration: "underline",
                  padding: "2px 5px",
                  color: "#007bff",
                  fontSize: "11px",
                }}
              >
                {" "}
                reinitialize <i class="fa-solid fa-arrow-right"></i>
              </button>
            </>
          )}
        </>,
        data.EndTime ? formatDate(data.EndTime) : "",
        data.Error
      ])
      : [];

  useEffect(() => {
    setLoading(props.loading);
    setLoading(props.error);
  }, []);

  const getDistributorCountData = async () => {
    setLoading(true);
    try {
      const distributorCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        {
          tableName: "HHLHistory",
          IsCompleted: props.status === "complete" ? true : false,
        }
      );

      const totalCount = distributorCountData[0]?.CountOfRecords || 0;
      setTotalCount(totalCount);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospital count data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getDistributorCountData();
  }, [props]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (props.status === "complete") {
      fetchCompletedData();
    } else {
      fetchIncompleteData();
    }
  }, [currentPage, perPage, props]);

  const fetchCompletedData = async () => {
    try {
      const skip = (currentPage - 1) * perPage;
      const take = perPage;

      setLoading(true);
      const response = await fetchData("lambdaAPI/HHLHistory/getByStatus", {
        skip,
        take,
        Status: "Completed",
      });
      setHHLDate(response);
    } catch (error) {
      console.error("Error fetching completed data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncompleteData = async () => {
    try {
      const skip = (currentPage - 1) * perPage;
      const take = perPage;

      setLoading(true);
      const response = await fetchData("lambdaAPI/HHLHistory/getByStatus", {
        skip,
        take,
      });
      setHHLDate(response);
    } catch (error) {
      console.error("Error fetching incomplete data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePolicy = async (order) => {
    try {
      const response = await fetchData("lambdaAPI/HHL/HHLPolicyCreation", {
        ProductsId: order.productId,
        MemberId: order.MemberId,
        CustomerOrderId: order.CustomerOrderId,
        MemberProductId: order.MemberProductId,
        UserId: UserId
      });

      if (response.status === "true") {
        setSnackbarMessage(response.message);
      } else {
        setSnackbarMessage(response.message);
      }
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error generating policy:", error);
      alert("An error occurred while generating the policy.");
    }
  };

  // const handleExcelDownload = async () => {
  //     setLoading(true)
  //     await downloadExcelData('healthcamplist', totalCount, perPage, fetchData, filterCriteria, setLoading);
  // };

  // const handleCSVDownload = async () => {
  //     setLoading(true)
  //     await downloadCSVData('healthcamplist', totalCount, perPage, fetchData, filterCriteria, setLoading);
  // }

  useEffect(() => {
    const getStates = async () => {
      setLoading(true);
      const statesData = await fetchData("Event/all", { skip: 0, take: 0 });
      const statesArray = statesData.map((item) => ({
        label: item.EventName,
        value: item.EventId,
      }));
      setStatesMultiSelect(statesArray);
      setLoading(false);
    };
    getStates();
  }, []);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
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
                  <h6 className="shimmer-text2 "></h6>
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
          {/* Main Content */}
          <div className="row mt-2">
            <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1">
              <div className="card mb-4" style={{ opacity: loading ? 0.5 : 1 }}>
                {/* <div className="card-body">                                     */}

                {(loading || tableloading) && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 1000,
                    }}
                  >
                    <CircularProgress />
                  </div>
                )}

                {!loading &&
                  !tableloading &&
                  HHLDate.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      There are no records to display.
                    </div>
                  )}

                {!loading && !tableloading && HHLDate && HHLDate.length > 0 && (
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
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <Alert onClose={handleSnackbarClose} severity="success">
                    {snackbarMessage}
                  </Alert>
                </Snackbar>
              </div>
            </div>
          </div>
          {/* </div> */}
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
    fontSize: "12px",
    letterSpacing: "1px",
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
