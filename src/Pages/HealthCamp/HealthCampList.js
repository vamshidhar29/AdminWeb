import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import List from "./List";
import Layout from "../../Layout/Layout";
import { Link, Outlet, useLocation } from "react-router-dom";
import HealthCampEventList from "./HealthCampEventList";
import HealthCampCustomers from "./HealthCampCustomers";

export default function HealthCampList() {
    const location = useLocation();
    const [navPath, setNavPath] = useState('');

    useEffect(() => {
        if (location.pathname.indexOf('healthCampList') > 0) {
            setNavPath('healthCampList')
        }
         else if (location.pathname.indexOf('healthCampCustomerList') > 0) {
            setNavPath('healthCampCustomerList')
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
                                        <Link className={"nav-link " + (navPath === "list" ? " active" : "")} to={`/healthcamp/list`} onClick={() => setNavPath('list')}><i className="bx bx-user me-1"></i>&nbsp;All Health Camp Customers</Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link className={"nav-link " + (navPath === "healthCampList" ? " active" : "")} to={`/healthcamp/healthCampList`} onClick={() => setNavPath('healthCampList')}><i className="bx bx-user me-1"></i>&nbsp;Health Camp Events</Link>
                                    </li>


                                   {(navPath !== "list" && navPath !== "healthCampList") && (
                                    <li className="nav-item">
                                        <Link className={"nav-link " + (navPath === "healthCampCustomerList" ? " active" : "")} to={`/healthcamp/healthCampCustomerList/:Id`} onClick={() => setNavPath('healthCampCustomerList')}><i className="bx bx-user me-1"></i>&nbsp; Health Camp Customers</Link>
                                    </li>
                                   )}
                                    

                                    {/*<li className="nav-item">*/}
                                    {/*    <Link className={"nav-link " + (navPath === "new" ? " active" : "")} to={`/health/new`} onClick={() => setNavPath('new')}><i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New</Link>*/}
                                    {/*</li>*/}
                                    {/*{(navPath !== "list" && navPath !== "new") && (*/}
                                    {/*<li className="nav-item">*/}
                                    {/*        <Link className={"nav-link " + (navPath === "details" ? " active" : "")} to={`/health/details`} onClick={() => setNavPath('details')}><i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Details</Link>*/}
                                    {/*    </li>*/}
                                    {/*)}*/}
                                </ul>
                            </div>

                            <div className="col-md-3">
                                <h5 className="fw-bold py-1 mb-1 text-md-end text-nowrap">
                                    HealthCamp Management
                                </h5></div>

                        </div>

                    </div>

                    <div id="detail">
                        <div id="detail">
                            {navPath && navPath === 'healthCampCustomerList' ? (
                                <HealthCampCustomers /> // Render HealthCampCustomerList when navPath matches
                            ) : navPath && navPath === 'healthCampList' ? (
                                <HealthCampEventList /> // Render HealthCampEventList when navPath matches
                            ) : (
                                <List /> // Default rendering
                            )}
                        </div>

                    </div>
                </div>
            </PageWrapper>
        </Layout>
    )
}