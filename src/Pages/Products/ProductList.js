import React from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "../../Layout/Layout";
import PageWrapper from "../../Components/PageWrapper";
import List from "./List";

export default function ProductList(props) {
    const location = useLocation();

    return (
        <Layout>
            <PageWrapper>
                <div>
                    <div className="text-center bg-white p-2 m-1">
                        <div className="d-flex flex-row justify-content-between align-items-center flex-wrap">
                            <ul className="nav nav-md nav-pills">
                                <li>
                                    <Link className={`nav-link ${!location.pathname.includes("inactive") && 'active'}`} to={`/products/active`}>Active</Link>
                                </li>
                                <li>
                                    <Link className={`nav-link ${location.pathname.includes("inactive") && 'active'}`} to={`/products/inactive`}>In-Active</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={"nav-link "} to={`/products/new`}><i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New</Link>
                                </li>

                            </ul>
                           
                            <h5 className="d-none d-sm-block fw-bold py-1 mb-1 text-md-end">
                                Products Management
                            </h5>
                        </div>
                    </div>
                    <div id="detail">
                        <List />
                    </div>
                </div>
            </PageWrapper>
        </Layout>
    );
}
