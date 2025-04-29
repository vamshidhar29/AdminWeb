import React, { useState, useEffect } from "react";
import PageWrapper from "../../Components/PageWrapper";
import { useParams } from "react-router-dom";
import ProductPersonalDetails from "./ProductPersonalDetails";
import { fetchAllData } from "../../helpers/externapi";
import { Link, useLocation } from "react-router-dom";
import Layout from "../../Layout/Layout";
import { TableSkeletonLoading } from "../../Commoncomponents/SkeletonLoading";

export default function ProductDetails() {
    const [details, setDetails] = useState();
    const location = useLocation();
    const [navPath, setNavPath] = useState('');
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (location.pathname.toLowerCase().indexOf('new') > 0) {
            setNavPath('new')
        } else if (location.pathname.toLowerCase().indexOf('details') > 0) {
            setNavPath('details')
        } else {
            setNavPath('list')
        }
    }, [location]);

    const id = useParams();

    useEffect(() => {
        const getLeadDetails = async (leadId) => {
            setLoading(true);
            const leadData = await fetchAllData(`Products/GetAllProductDetailsById/${id.Id}`);
            setDetails(leadData && leadData);
            setIsDataLoaded(true);
            setLoading(false);
        }

        if (id.Id > 0) {
            getLeadDetails(id.Id);
        }
    }, []);

    return (
        <Layout>
            <PageWrapper>
                {loading ? <TableSkeletonLoading /> : !isDataLoaded ? <TableSkeletonLoading /> : details && details.length > 0 ? (
                    <div>
                        <div className="text-center bg-white p-2 m-1">
                            <div className="d-flex flex-row justify-content-between align-items-center flex-wrap">
                                <ul className="nav nav-md nav-pills">
                                    {(navPath !== "new") && (
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "list" ? " active" : "")} to={`/products/new`} onClick={() => setNavPath('new')}><i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New</Link>
                                        </li>
                                    )}
                                    {(navPath !== "list") && (

                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "new" ? " active" : "")} to={`/products/list`} onClick={() => setNavPath('list')}><i className="bx bx-user me-1"></i>&nbsp;List</Link>
                                        </li>
                                    )}
                                    {(navPath !== "list" && navPath !== "new") && (
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "details" ? " active" : "")} to={`/products/details`} onClick={() => setNavPath('details')}><i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Details</Link>
                                        </li>
                                    )}
                                </ul>

                                <h5 className="d-none d-sm-block fw-bold py-1 mb-1 text-md-end">
                                    Products Management
                                </h5>
                            </div>
                        </div>

                        <div id="detail">
                            <ProductPersonalDetails data={details} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="text-center bg-white p-2 m-1">
                            <div className="d-flex flex=row justify-content-between align-items-center flex-wrap">
                                <ul className="nav nav-md nav-pills">
                                    {(navPath !== "new") && (
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "list" ? " active" : "")} to={`/products/new`} onClick={() => setNavPath('new')}><i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New</Link>
                                        </li>
                                    )}
                                    {(navPath !== "list") && (

                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "new" ? " active" : "")} to={`/products/list`} onClick={() => setNavPath('list')}><i className="bx bx-user me-1"></i>&nbsp;List</Link>
                                        </li>
                                    )}
                                    {(navPath !== "list" && navPath !== "new") && (
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "details" ? " active" : "")} to={`/products/details`} onClick={() => setNavPath('details')}><i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Details</Link>
                                        </li>
                                    )}
                                </ul>

                                <h5 className="d-none d-sm-block fw-bold py-1 mb-1 text-md-end">
                                    Products Management
                                </h5>
                            </div>
                        </div>

                        <div className='text-center mt-5'>
                            <h4 className='text-danger'>Product Not Available</h4>
                        </div>
                    </div>
                )}
            </PageWrapper>
        </Layout>
    )
}