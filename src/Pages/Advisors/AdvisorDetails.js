import React, { useState, useEffect } from "react";
import PageWrapper from "../../Components/PageWrapper";
import { useParams } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";

import AdvisorPersonalDetails from "./AdvisorPersonalDetails";
import { fetchAllData } from "../../helpers/externapi";
import Layout from "../../Layout/Layout";
import { TableSkeletonLoading } from "../../Commoncomponents/SkeletonLoading";

export default function AdvisorDetails(props) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [details, setDetails] = useState();
    const location = useLocation();
    const [navPath, setNavPath] = useState('');
    const [isDataLoaded, setIsDataLoaded] = useState(false);

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

    const id = useParams();

    const addInAddress = (initialAddress, attributeValue) => {
        if (attributeValue == 0 || attributeValue == 'Not Updated') {
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

            const distributorData = await fetchAllData(`lambdaAPI/Employee/GetById/${distributorId}`);

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
            <PageWrapper loading={loading} error={error}>
                {loading ? <TableSkeletonLoading /> : !isDataLoaded ? <TableSkeletonLoading /> : details && details ? (
                    <div>
                        <div className=" text-center bg-white p-2 m-1">
                            <div className="row align-items-center">
                                <div className="col-md-9">
                                    <ul className="nav nav-md nav-pills">
                                        <li className="nav-item">
                                            <Link
                                                className={`nav-link ${navPath === "advisors" ? "active" : ""}`}
                                                to={`/advisors`}
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
                        </div>

                        <div id="detail">
                            <AdvisorPersonalDetails data={details} />
                        </div>
                    </div>
                ) : (
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

                        {details && details.length > 0 ? (
                            <div className='text-center mt-5'>
                                <h4 className='text-danger'>Data Not Available</h4>
                            </div>
                        ) : null}
                    </div>
                )}
            </PageWrapper>
        </Layout>
    )
};