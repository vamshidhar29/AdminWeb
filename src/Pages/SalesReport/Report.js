import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchData } from "../../helpers/externapi";
import 'jspdf-autotable';
import CommonTables from '../../Commoncomponents/CommonTables';
import Snackbar from '@mui/material/Snackbar';
import moment from 'moment';

export default function Report() {
    const [membersData, setMembersData] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [memberTypeId, setMemberTypeId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [verifyingPayment, setVerifyingPayment] = useState(false);

    let UserId = localStorage.getItem("UserId");

    const tableHeads = [
        "Product Name", "Customer Name", "Paid Amount", "UTR No", "Paid Date",
        "Distributor OHOCode", "Dist. Name", "RM Name", "Actions",
    ];

    const tableElements = membersData && membersData.length > 0 ?
        membersData.map((data, index) => ([
            <div className="text-start-important"
                style={{
                    whiteSpace: 'normal',
                    textAlign: 'start',
                    display: 'block',
                }}>
                {data.ProductName ? <span>{data.ProductName}</span> : <span style={{ color: "#fcaeac" }}>N/A</span>}
            </div>,
            /*<Link to={`/distributor/details/${data.MemberId}`}>{data.Name || 'N/A'}</Link>,*/
            <Link
                to={data.MemberTypeId === 1 ? `/distributor/details/${data.MemberId}` : `/customers/details/${data.MemberId}`}
                className="text-start-important"
                style={{
                    whiteSpace: 'normal',
                    textAlign: 'start',
                    display: 'block',
                }}
            >
                {data.Name}
            </Link>,

            data.PaidAmount ? <span>{data.PaidAmount}</span> : <span style={{ color: "#fcaeac" }}>0</span>,

            data.UTRNumber ? <span>{data.UTRNumber}</span> : <span style={{ color: "#fcaeac" }}>Not Available</span>,

            data.PaidDate ? <span> {moment(data.PaidDate).format('YYYY-MMM-DD')}</span> : <span style={{ color: "#fcaeac" }}>Not Available</span>,

            data.DistributorOHOCode ? <span>{data.DistributorOHOCode}</span> : <span style={{ color: "#fcaeac" }}>Not Available</span>,

            data.DistributorName ? <span>{data.DistributorName}</span> : <span style={{ color: "#fcaeac" }}>Not Available</span>,

            data.UserName ? <span>{data.UserName}</span> : <span style={{ color: "#fcaeac" }}>Not Available</span>,

            <button
                onClick={() => openModal(data)}
                className="btn btn-sm btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#exLargeModal"
            >
                View
            </button>

        ])) : [];

    const openModal = (data) => {
        setSelectedMember(data);
    };

    const getSalesReportData = async () => {
        if (!memberTypeId) return;

        setLoading(true);
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            const distributorData = await fetchData("Member/GetSalesReport", { skip, take, memberTypeId });
            const dataToDisplay = distributorData.map(distributor => ({
                ...distributor,
                isVerified: distributor.isVerified
            }));
            const distributorDataCount = await fetchData("Member/GetSalesReport", { skip: 0, take: 0 });

            setTotalCount(distributorDataCount.length);
            setLoading(false);
            setMembersData(dataToDisplay);
        } catch (error) {
            console.error("Error fetching distributor data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getSalesReportData();
    }, [memberTypeId, currentPage, perPage]);

    useEffect(() => {
        if (selectedMember && selectedMember.isVerified !== undefined) {
        }
    }, [selectedMember]);

    const verifyPayment = async (paymentId) => {
        if (!selectedMember) return;
        // Set verifying state
        const requestData = {
            memberProductId: selectedMember.MemberProductId,
            utrNumber: selectedMember.UTRNumber,
            userId: UserId,
            isVerified: true,
            memberId: selectedMember.MemberId,
            rmId: selectedMember.UserId,
            distributorId: selectedMember.MemberId,
            ProductsId: selectedMember.ProductsId
        };

        try {
            const response = await fetchData('PaymentDetails/verifyTheProductPayment', requestData);

            if (response && response.status) {
                setSelectedMember((prev) => ({ ...prev, isVerified: true }));
                setSnackbarMessage(response.message || 'Verification successful.');
                setVerifyingPayment(true);
            } else {
                setSnackbarMessage(response.message || 'Verification failed.');
            }

            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error verifying payment:", error);
            setSnackbarMessage('An error occurred during verification.');
            setSnackbarOpen(true);
        }
    };

    const rejectPayment = async () => {
        if (!selectedMember) return;

        const requestData = {
            memberProductId: selectedMember.MemberProductId,
            utrNumber: selectedMember.UTRNumber,
            userId: UserId,
            isVerified: false,
        };

        try {
            const response = await fetchData('PaymentDetails/rejectPayment', requestData);

            if (response && response.data) {
                if (response.data.status) {

                    setSnackbarMessage(response.data.message || 'Payment rejected successfully.');
                    setSnackbarSeverity('success');
                } else {
                    console.error('Rejecting failed:', response.data.message);
                    setSnackbarMessage(response.data.message || 'Payment rejected successfully.');
                    setSnackbarSeverity('error');
                }
            } else {
                console.error('Unexpected response structure:', response);
                setSnackbarMessage('Unexpected response structure.');
                setSnackbarSeverity('error');
            }
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error while rejecting payment:', error);
            setSnackbarMessage('An error occurred while rejecting payment.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    useEffect(() => {
        const getMemberTypes = async () => {
            const fetchMemberTypes = await fetchData('MemberTypes/all', { skip: 0, take: 0 });
            const memberTypes = fetchMemberTypes.map((item) => ({
                label: item.Type,
                value: item.MemberTypeId
            }));
            const filteredTypeId = memberTypes.find(item => item.label === 'Advisor')?.value;
            setMemberTypeId(filteredTypeId);
        };

        getMemberTypes();
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
                                    <h6 className="shimmer-text2 " ></h6>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

        </>
    )

    return (
        <>
            {loading && skeletonloading()}

            {!loading && (

                <>
                    <Snackbar
                        open={snackbarOpen}
                        autoHideDuration={6000}
                        onClose={() => setSnackbarOpen(false)}
                        message={snackbarMessage}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        severity={snackbarSeverity}
                    />

<div className="row" style={{ margin: 0, padding: 0 }}>
  <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1" style={{ margin: 0, padding: 0 }}>
    <div className="card" style={{ opacity: loading ? 0.5 : 1, margin: 0, padding: 0 }}>
      <div className="card-body" style={{ margin: 0, padding: 0 }}>
        {!loading && !tableLoading && membersData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            There are no records to display.
          </div>
        )}

        {!loading && !tableLoading && membersData && membersData.length > 0 && (
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
    </div>
  </div>
</div>


                    <div
                        className="modal fade"
                        id="exLargeModal"
                        tabIndex="-1"
                        aria-hidden="true"
                        aria-labelledby="exampleModalLabel4"
                    >
                        <div className="modal-dialog modal-xl modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel4">
                                        Details
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    {selectedMember ? (
                                        <>
                                            <div className="row">
                                                <div className="col-12">
                                                    <div className=" mb-4">
                                                        <div className="user-profile-header d-flex flex-column flex-sm-row text-sm-start text-center mb-4">

                                                            <div className="flex-grow-1 mt-3 mt-sm-5">
                                                                <div className="d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start mx-4 flex-md-row flex-column gap-4">
                                                                    <div className="user-profile-info">
                                                                        <h4>{selectedMember.Name || "N/A"}</h4>

                                                                        <div className="row">
                                                                            <div className="col-md-6 mb-3">
                                                                                Product Name: <i className="bx bxl-product-hunt"></i> {selectedMember.ProductName || "Not Provided"}
                                                                            </div>
                                                                            <div className="col-md-6 mb-3">
                                                                                Product Amount: <i className="bx bx-rupee"></i>{selectedMember.SaleAmount || "N/A"}
                                                                            </div>
                                                                            <div className="col-md-6 mb-3">
                                                                                UTR: <i className="bx bx-transfer-alt"></i> {selectedMember.UTRNumber || "N/A"}
                                                                            </div>
                                                                            <div className="col-md-6 mb-3">
                                                                                Paid Date: <i className="bx bx-calendar-alt"></i> {selectedMember.PaidDate ? moment(selectedMember.PaidDate).format('DD-MMM-YYYY') : "Not updated"}
                                                                            </div>
                                                                        </div>

                                                                        <div className="row">
                                                                            <div className="col-md-6 mb-3">
                                                                                Mobile No: <i className="bx bx-phone"></i> {selectedMember.MobileNumber || "Not Provided"}
                                                                            </div>
                                                                            <div className="col-md-6 mb-3">
                                                                                Transaction Type:  <i className="bx bx-cash"></i> {selectedMember.TypeofTransaction || "N/A"}
                                                                            </div>
                                                                            <div className="col-md-6 mb-3">
                                                                                RM Name: <i className="bx bx-user"></i> {selectedMember.UserName || "N/A"}
                                                                            </div>
                                                                            <div className="col-md-6 mb-3">
                                                                                Paid Amount: <i className="bx bx-rupee"></i>{selectedMember.SaleAmount || "N/A"}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="d-flex gap-2">
                                                                        {selectedMember.IsVerified ? (
                                                                            <button className="btn btn-success" disabled>
                                                                                Verified
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                className={verifyingPayment ? 'btn btn-success' : 'btn btn-primary'}
                                                                                onClick={() => verifyPayment(selectedMember.MemberProductId)}
                                                                                disabled={verifyingPayment}
                                                                            >
                                                                                {verifyingPayment ? (
                                                                                    'Verified'
                                                                                ) : (
                                                                                    "Verify"
                                                                                )}
                                                                            </button>
                                                                        )}
                                                                        <button className="btn btn-danger" onClick={rejectPayment}>Reject</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </>
                                    ) : (
                                        <p>No details available.</p>
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


