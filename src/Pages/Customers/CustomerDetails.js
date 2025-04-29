import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import { fetchAllData } from "../../helpers/externapi";
import CustomerPersonalDetails from './CustomerPersonalDetails';
import { useParams } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import Layout from "../../Layout/Layout";

export default function CustomerDetails(props) {
    const [details, setDetails] = useState(null)
    const location = useLocation();
    const [navPath, setNavPath] = useState('');
    const [loading, setLoading] = useState(true);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const id = useParams();

    useEffect(() => {
        if (location.pathname.toLowerCase().indexOf('new') > 0) {
            setNavPath('new')
        } else if (location.pathname.toLowerCase().indexOf('details') > 0) {
            setNavPath('details')
        } else {
            setNavPath('list')
        }
    }, [location]);

    const addInAddress = (initialAddress, attributeValue) => {
        if (attributeValue === 0 || attributeValue === 'Not Updated') {
            return initialAddress;
        }
        if (!initialAddress && attributeValue) {
            return attributeValue;
        } else if (initialAddress && attributeValue) {
            return initialAddress + ', ' + attributeValue;
        }
        return initialAddress;
    }

    useEffect(() => {
        const getDistributorDetails = async (distributorId) => {
            setLoading(true);

            const distributorData = await fetchAllData(`lambdaAPI/Customer/GetById/${distributorId}`);

            if (distributorData && distributorData.length > 0) {
                const distributor = distributorData[0];
                let completeAddress = addInAddress('', distributor.AddressLine1);
                completeAddress = addInAddress(completeAddress, distributor.AddressLine2);
                completeAddress = addInAddress(completeAddress, distributor.Village);
                completeAddress = addInAddress(completeAddress, distributor.Mandal);
                completeAddress = addInAddress(completeAddress, distributor.City);
                completeAddress = addInAddress(completeAddress, distributor.DistrictName);
                completeAddress = addInAddress(completeAddress, distributor.StateName);
                completeAddress = addInAddress(completeAddress, distributor.Pincode);
                distributor.completeAddress = completeAddress;
                setDetails(distributor);
                setIsDataLoaded(true);
            }

            setLoading(false);
        }

        if (id.Id > 0) {
            getDistributorDetails(id.Id);
        }
    }, []);

    return (
        <Layout>
            <PageWrapper>
                {loading ? (
                    <div className="d-flex flex-column justify-content-center align-items-center my-5">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : !isDataLoaded ? (
                    <div className="d-flex flex-column justify-content-center align-items-center my-5">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : details && details ? (
                    <div>
                        <div className=" text-center bg-white p-2 m-1">
                            <div className="row align-items-center">
                                <div className="col-md-9">
                                    <ul className="nav nav-md nav-pills">
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "list" ? " active" : "")} to={`/customers/list`} onClick={() => setNavPath('list')}><i className="bx bx-user me-1"></i>&nbsp;List</Link>
                                        </li>

                                        {(navPath !== "list" && navPath !== "new") && (
                                            <li className="nav-item">
                                                <Link className={"nav-link " + (navPath === "details" ? " active" : "")} /*to={`/members/details`}*/ onClick={() => setNavPath('details')}><i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Details</Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="col-md-3">
                                    <h5 className="fw-bold py-1 mb-1 text-md-end">
                                        Member Management
                                    </h5>
                                </div>
                            </div>
                        </div>

                        <div id="detail">
                            <CustomerPersonalDetails data={details} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className=" text-center bg-white p-2 m-1">
                            <div className="row align-items-center">
                                <div className="col-md-9">
                                    <ul className="nav nav-md nav-pills">
                                        <li className="nav-item">
                                            <Link className={"nav-link " + (navPath === "list" ? " active" : "")} to={`/customers/list`} onClick={() => setNavPath('list')}><i className="bx bx-user me-1"></i>&nbsp;List</Link>
                                        </li>

                                        {(navPath !== "list" && navPath !== "new") && (
                                            <li className="nav-item">
                                                <Link className={"nav-link " + (navPath === "details" ? " active" : "")} to={`/customers/details`} onClick={() => setNavPath('details')}><i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Details</Link>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div className="col-md-3">
                                    <h5 className="fw-bold py-1 mb-1 text-md-end">
                                        Member Management
                                    </h5>
                                </div>
                            </div>

                        </div>
                        {details && details.length > 0 ? (
                            <div className='text-center mt-5'>
                                <h4 className='text-danger'>Customer Not Available</h4>
                            </div>
                        ) : null}
                    </div>
                )}
            </PageWrapper>
        </Layout>
    )
}