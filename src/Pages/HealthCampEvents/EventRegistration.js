import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import Layout from "../../Layout/Layout";
import { Link, useLocation } from "react-router-dom";
import EventAdd from "./EventAdd";

export default function EventRegistration(props) {
    const location = useLocation();
    const [navPath, setNavPath] = useState('');

    useEffect(() => {
        if (location.pathname.toLowerCase().indexOf('new') > 0) {
            setNavPath('new')
        } else if (location.pathname.toLowerCase().indexOf('details') > 0) {
            setNavPath('details')
        } else {
            setNavPath('list')
        }
    }, [location]);


    return (
        <Layout>
            <PageWrapper>
                <div>
                    <div className="text-center bg-white p-2 m-1">
                        <div className="row align-items-center">
                            <div className="col-md-9">
                                <ul className="nav nav-md nav-pills">
                                    {(navPath !== "new") && (
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "list" ? " active" : "")} to={`/HealthCampEvents/new`} onClick={() => setNavPath('new')}><i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New</Link>
                                        </li>
                                    )}
                                    {(navPath !== "list") && (
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "new" ? " active" : "")} to={`/HealthCampEvents/list`} onClick={() => setNavPath('list')}><i className="bx bx-user me-1"></i>&nbsp;List</Link>
                                        </li>
                                    )}

                                    {(navPath !== "list" && navPath !== "new") && (
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "details" ? " active" : "")} to={`/HealthCampEvents/details/`} onClick={() => setNavPath('details')}><i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Details</Link>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="col-md-3">
                                <h5 className="fw-bold py-1 mb-1 text-md-end">
                                    Event Management
                                </h5>
                            </div>
                        </div>
                    </div>

                    <div id="detail">
                        <EventAdd /> 
                    </div>
                </div>                           
            </PageWrapper>
        </Layout>
    )
}
