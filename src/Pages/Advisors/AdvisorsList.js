import React, { useState, useEffect } from "react";
import PageWrapper from "../../Components/PageWrapper";
import List from "./List";
import { Link, useLocation } from "react-router-dom";
import Layout from "../../Layout/Layout";

export default function AdvisorsList(props) {
    const [loading, setLoading] = useState();
    const [error, setError] = useState();
    const location = useLocation();
    const [navPath, setNavPath] = useState('');

    useEffect(() => {
        const path = location.pathname.toLowerCase();

        if (path.includes('/advisor/new')) {
            setNavPath('new');
        } else if (path.includes('/advisor/details')) {
            setNavPath('details');
        } else {
            setNavPath('advisors');
        }
    }, [location]);

    return (
        <Layout>
            <PageWrapper loading={loading} error={error}>
                <div>
                    {/* <div className=" text-center bg-white p-2 m-1">
                        <div className="row align-items-center">
                            <div className="col-md-9">
                                <ul className="nav nav-md nav-pills">
                                    <li className="nav-item">
                                        <Link
                                            className={`nav-link ${navPath === "advisors" ? "active" : ""}`}
                                            to={`/advisors`}
                                            // style={{backgroundColor: '#0E94C3'}}
                                            onClick={() => setNavPath('advisors')}
                                        >
                                            <i className="bx bx-user me-1"></i>&nbsp; List
                                        </Link>
                                    </li>
                                    {!(navPath === "new" || navPath === "details") && (
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link ${navPath === "new" ? "active" : ""}`}
                                                to={`/advisor/new`}
                                                onClick={() => setNavPath('new')}
                                            >
                                                <i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New
                                            </Link>
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div> */}

                        <List />
                </div>            
            </PageWrapper>
        </Layout>
    )
}