import React, { useState, useEffect } from "react";
import PageWrapper from "../../Components/PageWrapper";
import Registration from './Registration';
import { Link, useLocation } from "react-router-dom";
import Layout from "../../Layout/Layout";

export default function DistributorRegistration(props) {
    const location = useLocation();
    const [navPath, setNavPath] = useState('');

    useEffect(() => {
        const path = location.pathname.toLowerCase();

        if (path.includes('/distributor/new')) {
            setNavPath('new');
        } else if (path.includes('/distributor/details') || path.includes('/associate/details')) {
            setNavPath('details');
        } else if (path.includes('/associate')) {
            setNavPath('Associates');
        } else {
            setNavPath('distributor');
        }
    }, [location]);

    return (
        <Layout>
            <PageWrapper>
            <div>
                <div className=" text-center bg-white p-2 m-1">
                    <div className="row align-items-center">
                        <div className="col-md-9">
                            <ul className="nav nav-md nav-pills">
                                <li className="nav-item">
                                    <Link
                                        className={`nav-link ${navPath === "distributor" ? "active" : ""}`}
                                        to={`/distributor`}
                                        onClick={() => setNavPath('distributor')}
                                    >
                                        <i className="bx bx-user me-1"></i>&nbsp; List
                                    </Link>
                                </li>
                                {!(navPath === "new" || navPath === "details") && (
                                    <li className="nav-item">
                                        <Link
                                            className={`nav-link ${navPath === "new" ? "active" : ""}`}
                                            to={`/distributor/new`}
                                            onClick={() => setNavPath('new')}
                                        >
                                            <i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New
                                        </Link>
                                    </li>
                                )}
                            </ul>
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
