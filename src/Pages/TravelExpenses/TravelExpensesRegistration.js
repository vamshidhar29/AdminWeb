import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import Registration from './Registration';
import { Link, useLocation } from "react-router-dom";
import Layout from "../../Layout/Layout";

export default function TravelExpensesRegistration() {
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
                            <div className="col-md-8">

                                <ul className="nav nav-md nav-pills">
                                    <li className="nav-item">
                                        <Link className={"nav-link " + (navPath === "list" ? " active" : "")} to={`/Others/travelexpenses/list`} onClick={() => setNavPath('list')}><i className="bx bx-user me-1"></i>&nbsp;Activity</Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link className={"nav-link " + (navPath === "new" ? " active" : "")} to={`/Others/travelexpenses/new`} onClick={() => setNavPath('new')}><i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New Activity</Link>
                                    </li>
                                    {(navPath !== "list" && navPath !== "new") && (
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "details" ? " active" : "")} to={`/Others/travelexpenses/details`} onClick={() => setNavPath('details')}><i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Details</Link>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="col-md-4">
                                <h5 className="fw-bold py-1 mb-1 text-md-end">
                                    Travel Activity Management
                                </h5>
                            </div>
                        </div>
                    </div>

                    <div id="detail">
                        <Registration />
                    </div>
                </div>            
            </PageWrapper>
        </Layout>
    )
}
