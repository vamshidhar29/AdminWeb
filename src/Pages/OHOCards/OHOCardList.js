import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import List from "./List";
import Layout from "../../Layout/Layout";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function OHOCardList(props) {
    const location = useLocation();
    const [navPath, setNavPath] = useState('list');
    const [url, setUrl] = React.useState(null);

    useEffect(() => {
        setUrl(location.pathname.toLowerCase());

        if (location.pathname.toLowerCase().indexOf('details') > 0) {
            setNavPath('details')
        } else {
            setNavPath('list')
        }
    }, [location]);

    return (
        <Layout>
            <PageWrapper>
                <div>
                    <div className="container text-center bg-white p-2 m-1">
                        <div className="row">
                            <div className="col-md-8">
                                <ul className="nav nav-md nav-pills">
                                    <li className="nav-item">
                                        <Link className={"nav-link " + (url === "/ohocards/list" || url === "/ohocards/" ? " active" : "")} to={`/ohocards/list`}><i className="bx bx-user me-1"></i>&nbsp;List</Link>
                                    </li>

                                    {/*<li className="nav-item">*/}
                                    {/*    <Link className={"nav-link " + (url === "/ohocards/new" ? " active" : "")} to={`/ohocards/new`}><i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New</Link>*/}
                                    {/*</li>*/}
                                    {/*<li className="nav-item">*/}
                                    {/*    <Link className={"nav-link " + (url === "/distributor/details" ? " active" : "")} to={`/distributor/details`}><i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Details</Link>*/}
                                    {/*</li>*/}
                                </ul>
                            </div>

                            <div className="col-md-4" style={{ textAlign: 'right' }}>
                                <h5 className="fw-bold py-1 mb-1">
                                    OHO Cards Management
                                </h5>
                            </div>
                        </div>
                    </div>

                    <div id="detail">
                        <List />
                    </div>
                </div>                
            </PageWrapper>
        </Layout>
    )
}