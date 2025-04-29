import React, { useState, useEffect } from 'react';
import 'regenerator-runtime/runtime';
import CardAssign from './CardAssign';
import Layout from '../../Layout/Layout';
import { Link, useLocation } from "react-router-dom";
import List from './List';

export default function RMCardAssign() {
    const [navPath, setNavPath] = useState('');
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.indexOf('list') > 0) {
            setNavPath('list')
        } else {
            setNavPath('assign')
        }
    }, [location]);

    return (
        <Layout>
            <div>
                <div className="text-center mt-2">
                    <div className="text-center bg-white p-2 m-1">
                        <div className="row align-items-center justify-content-between">
                            <div className="col-8">
                                <ul className="nav nav-md nav-pills">
                                    <li className="nav-item">
                                        <Link className={"nav-link " + (navPath === "assign" ? " active" : "")} to={`/Others/RMCardAssign/assign`} onClick={() => setNavPath('assign')}><i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Verify</Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link className={"nav-link " + (navPath === "list" ? " active" : "")} to={`/Others/RMCardAssign/list`} onClick={() => setNavPath('list')}><i className="bx bx-user me-1"></i>&nbsp;List</Link>
                                    </li>
                                </ul>
                            </div>

                            <div className="col-4">
                                <h5 className="fw-bold py-1 mb-1 text-md-end">
                                    RM Cards Management
                                </h5>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="detail">
                    {navPath && navPath === 'assign' ? (
                        <CardAssign />
                    ) : (
                        <List />
                    )}                    
                </div>
            </div>
        </Layout>
    )
}
