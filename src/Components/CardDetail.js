import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchAllData } from "../helpers/externapi";

const CardDetailsComponent = ({ detail, handleEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selfDetails, setSelfDetails] = useState([]);

    const toggleExpand = () => {
        if (detail.KYCCardFront || detail.KYCCardBack) {
            setIsExpanded(!isExpanded);
        }
    };

    const { Id } = useParams();

    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                const response = await fetchAllData(`Member/GetById/${Id}`);
                setSelfDetails(response[0]);
            } catch (error) {
                console.error("Error fetching member data:", error);
            }
        };

        fetchMemberData();
    }, [Id]);

    const convertDOBFormat = (dobString) => {
        const date = new Date(dobString);
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <div className="container card-details-container">
            <div
                className="card main-card shadow-sm"
                style={{ borderRadius: "12px", cursor: 'pointer', maxWidth: '300px' }}
                onClick={toggleExpand}
            >
                <div className="card-body p-3">
                    {/* Row 1: Image and Name */}
                    <div className="d-flex align-items-center mb-2">
                        <img
                            src="../../assets/img/dummy-avatar.jpg"
                            alt="Avatar"
                            className="rounded-circle me-2"
                            style={{ width: "50px", height: "50px" }}
                        />
                        <h5 className="mb-0 fw-semibold text-dark">{detail.FullName}</h5>
                    </div>

                    {/* Row 2: Relationship and Nominee */}
                    <div className="d-flex align-items-center mb-2">
                        <span className="badge bg-warning text-dark me-2">{detail.Relationship}</span>
                        {detail.IsNominee && <span className="text-success">(Nominee)</span>}
                    </div>

                    {/* Row 3: DOB and Age */}
                    <div className="d-flex justify-content-between mb-2">
                        <p className="mb-0"><strong>DOB:</strong> {convertDOBFormat(detail.DateofBirth)}</p>
                        <p className="mb-0"><strong>Age:</strong> {detail.Age}</p>
                    </div>

                    {/* Row 4: Mobile Number */}
                    <div className="mb-2">
                        <p className="mb-0"><strong>Mobile Number:</strong> {detail.MobileNumber}</p>
                    </div>

                    {isExpanded && (detail.KYCCardFront || detail.KYCCardBack) && (
                        <>
                            <h4 className="mx-3 mt-3 fw-bold text-secondary">KYC Details</h4>
                            <ul className="list-unstyled mb-0 px-3">
                                <li className="mb-3 d-flex align-items-center">
                                    <div className="me-2">
                                        <h6 className="text-muted">{detail.KYCCardType}</h6>
                                    </div>
                                    <div className="ms-auto">
                                        <span className="badge bg-danger text-white">{detail.KYCCardNumber}</span>
                                    </div>
                                </li>

                                <li className="mb-3">
                                    <div className="d-flex flex-column align-items-start">
                                        {detail.KYCCardFront && (
                                            <div className="kyc-image-section bg-light p-2 rounded mb-3 w-100">
                                                <strong className="small">KYC Front Image</strong>
                                                <img
                                                    src={`https://ohoindiaimages.s3.ap-south-1.amazonaws.com/${detail.KYCCardFront.split('.').shift()}.jpg`}
                                                    className="img-fluid rounded mt-2"
                                                    alt="KYC Front"
                                                />
                                            </div>
                                        )}
                                        {detail.KYCCardBack && (
                                            <div className="kyc-image-section bg-light p-2 rounded w-100">
                                                <strong className="small">KYC Back Image</strong>
                                                <img
                                                    src={`https://ohoindiaimages.s3.ap-south-1.amazonaws.com/${detail.KYCCardBack.split('.').shift()}.jpg`}
                                                    className="img-fluid rounded mt-2"
                                                    alt="KYC Back"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </li>
                            </ul>
                        </>
                    )}

                    {/* Row 5: Edit Button */}
                    {/* <div className="text-end">
                        <button
                            className="btn btn-sm btn-primary rounded-pill"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(detail.MemberDependentId);
                            }}
                        >
                            Edit
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default CardDetailsComponent;
