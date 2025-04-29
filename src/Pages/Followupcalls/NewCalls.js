import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import NewCallsList from "./NewCallsList";
import Layout from "../../Layout/Layout";
import { Link, useLocation } from "react-router-dom";

export default function NewCalls(props) {
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
                    <div className=" text-center bg-white p-2 m-1">
                        <div className="row align-items-center">
                            <div className="col-md-9">
                                <ul className="nav nav-md nav-pills">
                                    <li className="nav-item">
                                        <Link className={"nav-link " + (navPath === "list" ? " active" : "")} to={`/Others/followupcalls/list`} onClick={() => setNavPath('list')}><i className="bx bx-user me-1"></i>&nbsp;Follow-ups</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={"nav-link " + (navPath === "new" ? " active" : "")} to={`/Others/followupcalls/new`} onClick={() => setNavPath('new')}><i className="bx bx-user me-1"></i>&nbsp;New Calls</Link>
                                    </li>
                                </ul>
                            </div>

                            <div className="col-md-3">
                                <h5 className="fw-bold py-1 mb-1 text-md-end">
                                    Follow-up calls
                                </h5></div>

                        </div>

                    </div>

                    <div id="detail">
                        <NewCallsList />
                    </div>
                </div>
            </PageWrapper>
        </Layout>
    )
}