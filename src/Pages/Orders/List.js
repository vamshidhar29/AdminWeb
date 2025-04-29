import React, { useEffect, useState, useRef } from "react";
import { fetchData } from "../../helpers/externapi";
import { Link, useNavigate } from "react-router-dom";
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
    const [ordersData, setOrdersData] = React.useState([]);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    let UserId = localStorage.getItem("UserId");

    const tableHeads = [
        "Name",
        "CONTACT",
        "Card Number",
        "Payment Type",
        "Paid Amount",
        "Status",
        "ACTIONS",
    ];

    const tableElements =
        ordersData && ordersData.length > 0
            ? ordersData.map((data) => [
                <Link
                    to={`/customers/details/${data.CustomerId}`}
                    className="text-start-important"
                    style={{
                        whiteSpace: 'normal',
                        textAlign: 'start',
                        display: 'block',
                    }}
                >
                    {data.FullName}
                </Link>,
                <>
                    <div>
                        {data.MobileNumber ? (
                            <a href={"tel:" + data.MobileNumber}>
                                <i className="bx bx-phone-call" style={styles.phoneIcon}></i>
                                {data.MobileNumber}
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
                data.OHOCardNumber,
                data.PaymentType,
                data.PaidAmount,
                data.Status,
                <button className="btn btn-primary" onClick={() => handleGeneratePolicy(data)}>
                    Generate Policy
                </button>,
            ])
            : [];

    const getDistributorCountData = async () => {
        setLoading(true);
        try {
            const distributorCountData = await fetchData(
                `CommonRowCount/GetTableRowCount`,
                {
                    tableName: "Orders",
                }
            );

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

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleGeneratePolicy = async (order) => {
        try {
            const response = await fetchData("lambdaAPI/HHL/HHLPolicyCreation", {
                ProductsId: order.ProductsId,
                CustomerId: order.CustomerId,
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

    useEffect(() => {
        fetchCompletedData();
    }, [currentPage, perPage]);

    const fetchCompletedData = async () => {
        setLoading(true);
        try {

            const skip = (currentPage - 1) * perPage;
            const take = perPage;


            const response = await fetchData("lambdaAPI/Orders/FetchSuccessCustomerOrderList", {
                skip,
                take
            });
            setOrdersData(response);
        } catch (error) {
            console.error("Error fetching completed data:", error);
        } finally {
            setLoading(false);
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

                                {(loading) && (
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

                                {!loading && ordersData.length === 0 && (
                                    <div style={{ textAlign: "center", padding: "20px" }}>
                                        There are no records to display.
                                    </div>
                                )}

                                {!loading && ordersData && ordersData.length > 0 && (
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
