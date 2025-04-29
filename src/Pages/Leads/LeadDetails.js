import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import { useParams } from "react-router-dom";
import LeadPersonalDetails from "./LeadPersonalDetails";
import { fetchAllData } from "../../helpers/externapi";
import Layout from "../../Layout/Layout";
import { Link, useLocation } from "react-router-dom";

export default function LeadDetails(props) {
    const [loading, setLoading] = useState();
    const [error, setError] = useState();
    const [details, setDetails] = useState(null);
    const location = useLocation();
    const [navPath, setNavPath] = useState('');

    const id = useParams();

    useEffect(() => {
        const pathname = location.pathname.toLowerCase();

        if (pathname.includes('patientreferral')) {
            setNavPath('Patientreferral');
        } else if (pathname.includes('details')) {
            setNavPath('details');
        } else if (pathname.includes('new')) {
            setNavPath('new');
        } else {
            setNavPath('list');
        }
    }, [location]);    

    useEffect(() => {
        setLoading(true);

        const getLeadDetails = async (leadId) => {
            const leadData = await fetchAllData(`Lead/GetById/${leadId}`);
            setDetails(leadData && leadData[0]);
        }

        if (id.Id > 0) {
            getLeadDetails(id.Id);
        }

        setLoading(false);
    }, []);

    return (
        <Layout>
            <PageWrapper loading={loading} error={error}>
                {details ? (
                    <div>
                        <div className="text-center bg-white p-2 m-1">
                            <div className="row align-items-center">
                                <div className="col-md-9">
                                    <ul className="nav nav-md nav-pills">
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === 'list' ? "active" : "")} to="/leads/list" onClick={() => setNavPath('list')}>
                                                <i className="bx bx-user me-1"></i>&nbsp;List
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === 'Patientreferral' ? "active" : "")} to="/leads/Patientreferral" onClick={() => setNavPath('Patientreferral')}>
                                                <i className="bx bx-user me-1"></i>&nbsp;Patient Referral
                                            </Link>
                                        </li>
                                        {navPath === 'details' && (
                                            <li className="nav-item">
                                                <Link className={"nav-link " + (navPath === 'details' ? "active" : "")} to="/leads/details" onClick={() => setNavPath('details')}>
                                                    <i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Details
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <div className="col-md-3">
                                    <h5 className="fw-bold py-1 mb-1 text-md-end">
                                        Leads Management
                                    </h5>
                                </div>
                            </div>
                        </div>
                        <div id="detail">
                            <LeadPersonalDetails data={details} />
                        </div>
                    </div>                    
                ) : (
                    <div>
                        <div className="text-center bg-white p-2 m-1">
                            <div className="row align-items-center">
                                <div className="col-md-9">
                                    <ul className="nav nav-md nav-pills">
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === 'list' ? "active" : "")} to="/leads/list" onClick={() => setNavPath('list')}>
                                                <i className="bx bx-user me-1"></i>&nbsp;List
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === 'Patientreferral' ? "active" : "")} to="/leads/Patientreferral" onClick={() => setNavPath('Patientreferral')}>
                                                <i className="bx bx-user me-1"></i>&nbsp;Patient Referral
                                            </Link>
                                        </li>
                                        {navPath === 'details' && (
                                            <li className="nav-item">
                                                <Link className={"nav-link " + (navPath === 'details' ? "active" : "")} to="/leads/details" onClick={() => setNavPath('details')}>
                                                    <i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Details
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                                <div className="col-md-3">
                                    <h5 className="fw-bold py-1 mb-1 text-md-end">
                                        Leads Management
                                    </h5>
                                </div>
                            </div>
                        </div>

                        <div className='text-center mt-5'>
                            <h4 className='text-danger'>Lead Not Available</h4>
                        </div>
                    </div>                    
                )}           
            </PageWrapper>
        </Layout>
    )
}