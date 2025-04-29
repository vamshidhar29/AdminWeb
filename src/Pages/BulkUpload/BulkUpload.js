import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import DistributorBulkUpload from "./DistributorBulkUpload";
import HospitalBulkUpload from "./HospitalBulkUpload";
import LivlongBulkUpload from "./LivlongBulkUpload";
import Layout from "../../Layout/Layout";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function BulkUpload() {
    const location = useLocation();
    const [navPath, setNavPath] = useState('');

    useEffect(() => {
        if (location.pathname.toLowerCase().includes('distributor')) {
            setNavPath('distributor');
        } else if (location.pathname.toLowerCase().includes('hospital')) {
            setNavPath('Hospitals');
        } else if (location.pathname.toLowerCase().includes('livlongmicronsure')) {
            setNavPath('LivlongMicroNsure');
        }
    }, [location]);

    const handleTabClick = (path) => {
        setNavPath(path);
    };

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
                                            className={"nav-link " + (navPath === "distributor" ? "active" : "")}
                                            to={`/Others/bulkupload/distributor`}
                                            onClick={() => handleTabClick('distributor')}
                                        >
                                            <i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Distributor
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link
                                            className={"nav-link " + (navPath === "Hospitals" ? "active" : "")}
                                            to={`/Others/bulkupload/hospital`}
                                            onClick={() => handleTabClick('Hospitals')}
                                        >
                                            <i className="bx bx-user me-1"></i>&nbsp;Hospitals
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link
                                            className={"nav-link " + (navPath === "LivlongMicroNsure" ? "active" : "")}
                                            to={`/Others/bulkupload/LivlongMicroNsure`}
                                            onClick={() => handleTabClick('LivlongMicroNsure')}
                                        >
                                            <i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Livlong MicroNsure
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div className="col-md-3">
                                <h5 className="fw-bold py-1 mb-1 text-md-end">
                                    Bulkupload Management
                                </h5>
                            </div>

                        </div>

                    </div>

                    <div id="detail">
                        {navPath === "distributor" && <DistributorBulkUpload />}
                        {navPath === "Hospitals" && <HospitalBulkUpload />}
                        {navPath === "LivlongMicroNsure" && <LivlongBulkUpload />}                        
                    </div>
                </div>                
            </PageWrapper>
        </Layout>
    )
}