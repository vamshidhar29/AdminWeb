import React, { useEffect, useState, useRef } from "react";
import { fetchAllData, fetchData } from "../../helpers/externapi";
import Cleave from "cleave.js/react";
import moment from "moment";
import CircularProgress from "@mui/material/CircularProgress";
import CommonTables from "../../Commoncomponents/CommonTables";
import { Link, useNavigate } from "react-router-dom";

export default function NewReportList(props) {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [tableloading, setTableLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedCardNames, setSelectedCardNames] = useState([]);
  const [selectedCardNumbers, setSelectedCardNumbers] = useState([]);
  const [selectedRouteMap, setSelectedRouteMap] = useState("");
  const [filterCriteria, setFilterCriteria] = useState([]);
  const [isDisableApply, setIsDisableApply] = useState(true);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const [generateReports, setGenerateReports] = useState([]);
  const [ReportsId, setReportsId] = useState(null);
  const [reportsHistoryData, setReportsHistoryData] = useState(null);

  let UserId = localStorage.getItem("UserId");

  const tableHeads = ["Report Name", "Description", "ACTIONS"];

  const tableElements =
    filteredData && filteredData.length > 0
      ? filteredData.map((data) => [
        <div style={{
          whiteSpace: "normal",
          textAlign: "start",
          display: "block",
        }}>
          {data.ReportName}
        </div>,
        data.Description,
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="btn btn-sm"
            onClick={() => generateReport(data)}
            style={{
              backgroundColor: "#344CB7",
              color: "#fff",
              border: "none",
              padding: "5px 11px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "12px",

              transition: "background-color 0.3s ease, transform 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#577BC1";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "#344CB7";
              e.target.style.transform = "scale(1)";
            }}
          >
            Schedule Report
          </button>
        </div>,
      ])
      : [];





  const getMemberCardCountData = async () => {
    setLoading(true);
    try {
      const eventCountData = await fetchData(
        `CommonRowCount/GetTableRowCount`,
        { tableName: "Reports" }
      );
      const totalCount = eventCountData[0]?.CountOfRecords || 0;
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hospital count data:", error);
      setLoading(false);
    }
  };

  const generateReport = async (data) => {
    setLoading(true);
    try {
      const generateReport = await fetchData("lambdaAPI/Reports/ReportsCreation", {
        ReportsId: data.ReportsId,
        UserId
      });
      setGenerateReports(generateReport);
    } catch (error) {
      console.error("Error fetching states data:", error);
    } finally {
      setLoading(false);
    }

    navigate("/reports/list/reportsData");
  };

  useEffect(() => {
    getMemberCardCountData();
  }, []);

  const handleCardNumberSelect = (event) => {
    const selectedCardNumber = event.target.value;
    setSelectedCardNumbers(selectedCardNumber);
  };

  const handleNameSelect = (event) => {
    const selectedName = event.target.value;
    if (selectedName === "") {
      setSelectedCardNames([]);
    } else {
      setSelectedCardNames([...selectedCardNames, selectedName]);
    }
  };

  const getMemberCardData = async () => {
    setTableLoading(true);
    try {
      const skip = (currentPage - 1) * perPage;
      const take = perPage;
      let cardData;
      if (filterCriteria.length > 0) {
        cardData = await fetchData("OHOCards/filter", {
          skip : 0,
          take : 0,
          filter: filterCriteria,
        });
      } else {
        cardData = await fetchData("lambdaAPI/Reports/all", { skip :0, take: 0 });
      }
      const dataToDisplay = cardData.map((cards) => ({
        ...cards,
      }));
      setTableLoading(false);
      setFilteredData(dataToDisplay);
    } catch (err) {
      console.error("Error fetching card data:", err);
    }
  };

  useEffect(() => {
    getMemberCardData();
  }, [filterCriteria, currentPage, perPage]);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (event) => {
    setPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  useEffect(() => {
    if (
      selectedRouteMap.length === 0 &&
      selectedCardNumbers.length === 0 &&
      selectedCardNames.length === 0
    ) {
      setIsDisableApply(true);
    } else {
      setIsDisableApply(false);
    }
  }, [selectedRouteMap, selectedCardNumbers, selectedCardNames]);

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

  const styles = {
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '10px 10px',
      border: '1px solid #ddd',
      textAlign: 'center',
      backgroundColor: '#f2f2f2',
      color: '#333',
      textTransform: 'uppercase',
      fontSize: '11px',
      letterSpacing: '1px',
      fontWeight: 'bold',
    },
    td: {
      padding: '5px 5px',
      border: '1px solid #ddd',
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
    kycStatus: (isVerified) => ({
      color: isVerified ? 'green' : 'red',
      transition: 'color 0.3s',
    }),
  };

  return (
    <>
      {loading && skeletonloading()}
      {!loading && (
        <>
          {/* Main Content */}
          <div className="row mt-2" >
  <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1" style={{ margin: 0, padding: 0 }}>
    <div className="card mb-4" style={{ opacity: loading ? 0.5 : 1, margin: 0, padding: 0 }}>
      <div className="card-body" style={{ margin: 0, padding: 0 }}>
        {/* Loading spinner */}
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

        {/* No records message */}
        {!loading && filteredData.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            There are no records to display.
          </div>
        )}

        {/* Table Data */}
        {!loading && filteredData.length > 0 && (
          <div className="table-responsive text-nowrap" style={{ margin: 0, padding: 0 }}>
            <table style={{ ...styles.table, margin: 0, padding: 0 }}>
              <thead>
                <tr style={{ ...styles.headerRow, margin: 0, padding: 0 }}>
                  {tableHeads.map((head, index) => (
                    <th key={`header-${index}`} style={styles.th}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableElements.map((row, rowIndex) => (
                  <tr key={row.MemberId || `row-${rowIndex}`} style={{ margin: 0, padding: 0 }}>
                    {row.map((data, colIndex) => (
                      <td key={`${row.MemberId || rowIndex}-${colIndex}`} style={styles.td} className="text-center">
                        {data}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
