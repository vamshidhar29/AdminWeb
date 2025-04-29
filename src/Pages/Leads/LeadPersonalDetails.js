import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BoxWrapper from "../../Components/BoxWrapper";
import { fetchAllData } from "../../helpers/externapi";
import moment from 'moment';

export default function DistributorPersonalDetails(props) {
    const [profile, setProfile] = React.useState(props.data);
    const [loading, setLoading] = React.useState();
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isEditing, setIsEditing] = useState(false);

    const id = useParams();

    //useEffect(() => {
    //    const getLeadData = async () => {
    //        setLoading(true);
    //        const memberData = await fetchAllData(`Lead/GetById/${id.Id}`);
    //        setProfile(memberData);
    //        setLoading(false);
    //    }

    //    getLeadData();
    //}, []);

    const handleEditForm = () => {
        navigate('/leads/new', { state: { profile } });
    };

    const handleBackToList = () => {
        navigate('/leads/list');
    };

    const handlePrevious = async () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            navigate(`/distributor/details/${parseInt(id.Id) - 1}`);
        }
    };

    const handleNext = async () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            navigate(`/distributor/details/${parseInt(id.Id) + 1}`);
        }
    };

    return (
        <>
            <div className="card-action">
                <div className="btn-toolbar mb-1 d-flex flex-wrap justify-content-between">

                    <div className="btn-group">
                       {/* <button onClick={handleBackToList} className="btn btn-sm btn-primary m-1">Back To List</button>*/}
                        <button className="btn btn-sm btn-primary m-9" onClick={handleEditForm}>Edit</button>
                    </div>

                    {/*<div className="d-flex align-items-center flex-wrap">*/}
                    {/*    <button type="button" className="btn btn-sm btn-primary m-1" onClick={() => handlePrevious()} disabled={currentPage === 1}>Previous</button>*/}
                    {/*    <button type="button" className="btn btn-sm btn-primary m-1" onClick={() => handleNext()} disabled={currentPage === totalPages}>Next</button>*/}
                    {/*</div>*/}
                </div>
            </div>
            <BoxWrapper>
                <div>

                    {!isEditing && (
                        <>
                            <div className="row mt-4">
                                <div className="col-12">
                                    <div className="card-action mb-2 h-100">
                                        <div className=" align-items-center mx-4">

                                            <div className="row">
                                                <div className="card p-3">
                                                    <p><strong>Lead Name : </strong> {profile.LeadName}</p>
                                                    <p><strong>Mobile Number : </strong> {profile.MobileNumber}</p>
                                                    <p><strong>Date of Birth : </strong>{profile.DateofBirth ? moment(profile.DateofBirth).format('DD-MMM-YYYY') : "Not updated"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </BoxWrapper>
        </>
    );
}