import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import LivlongList from "./LivlongList";
import Layout from "../../Layout/Layout";
import { Link, useLocation } from "react-router-dom";

export default function LivlongData(props) {
    const [navPath, setNavPath] = useState('');
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.toLowerCase().indexOf('micronsure') > 0) {
            setNavPath('Micronsure')
        } else {
            setNavPath('Livlong')
        }
    }, [location]);

    return (
        <Layout>
            <PageWrapper>
                <div>
                    <div className=" text-center bg-white p-2 m-1">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <ul className="nav nav-md nav-pills">
                                    <li className="nav-item">
                                        <Link className={"nav-link " + (navPath === "Livlong" ? " active" : "")} to={`/Others/LivelongMicroensureData/Livlong`} onClick={() => setNavPath('Livlong')}><i className="bx bx-user me-1"></i>&nbsp;Livlong</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={"nav-link " + (navPath === "Micronsure" ? " active" : "")} to={`/Others/LivelongMicroensureData/Micronsure`} onClick={() => setNavPath('Micronsure')}><i className="bx bx-user me-1"></i>&nbsp;MicroNsure</Link>
                                    </li>

                                </ul>
                            </div>

                            <div className="col-md-6">
                                <h5 className="fw-bold py-1 mb-1 text-md-end">
                                    Livelong and Microensure Data
                                </h5>
                            </div>
                        </div>
                    </div>

                    <div id="detail">
                        <LivlongList />
                    </div>
                </div>                
            </PageWrapper>
        </Layout>
    )
}