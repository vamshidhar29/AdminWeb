import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
import HospitalPersonalDetails from "../Hospitals/HospitalPersonalDetails";
import { fetchAllData } from "../../helpers/externapi";
import Layout from "../../Layout/Layout";
import EventPersonalDetails from "./EventPersonalDetails";

export default function EventDetails() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [details, setDetails] = useState(null)
    const location = useLocation();
    const [navPath, setNavPath] = useState('');

    const id = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname.toLowerCase().indexOf('new') > 0) {
            setNavPath('new')
        } else if (location.pathname.toLowerCase().indexOf('details') > 0) {
            setNavPath('details')
        } else {
            setNavPath('list')
        }
    }, [location]);

    useEffect(() => {
        const getHospitalDetails = async (hospitalId) => {
            setLoading(true);
            const hospitalData = await fetchAllData(`Event/GetById/${hospitalId}`);
            setDetails(hospitalData && hospitalData[0]);
            setLoading(false);
        }

        if (id.Id > 0) {
            getHospitalDetails(id.Id);
        }
    }, []);

    const handleEditForm = () => {
        navigate('/HealthCampEvents/new', { state: { profile: details } });
    };

    return (
        <Layout>
            <PageWrapper loading={loading} error={error}>
                <>
                    <div className="text-center bg-white p-2 m-1">
                        <div className="d-flex flex-row justify-content-between align-items-center">
                            <div className="d-flex flex-row justify-content-start align-items-center">
                                <button onClick={handleEditForm} className="btn btn-md btn-primary me-2 me-md-4">Edit</button>
                                <span className="nav-item">
                                    <Link className="nav-link" to={`/HealthCampEvents/List`}><i className="bx bx-user me-1"></i>&nbsp;List</Link>
                                </span>
                            </div>

                            <h5 className="fw-bold py-1 mb-1 text-md-end">
                                Event Management
                            </h5>
                        </div>
                    </div>

                    {details ? (
                        <div id="detail">
                            <EventPersonalDetails data={details} />
                        </div>
                    ) : (
                        loading ? (
                            <div className='d-flex flex-row justify-content-center pt-5'>
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className='text-center mt-5'>
                                <h4 className='text-danger'>Hospital Not Available</h4>
                            </div>
                        )
                    )}
                </>
            </PageWrapper>
        </Layout>
    )
}