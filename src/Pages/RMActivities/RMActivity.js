import React, { useEffect, useState } from 'react';
import 'regenerator-runtime/runtime';
import { Link, Outlet, useLocation } from "react-router-dom";
import List from './List';
import Layout from '../../Layout/Layout';

export default function RMActivity() {

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

            <div className=" text-center bg-white p-2 m-1">
                <div className="row align-items-center">
                    <div className="col-md-9">
                        <ul className="nav nav-md nav-pills">
                            <li className="nav-item">
                                <Link className={"nav-link " + (navPath === "list" ? " active" : "")} to={`/Others/RMActivities`} onClick={() => setNavPath('list')}><i className="bx bx-user me-1"></i>&nbsp;RM Activities</Link>
                            </li>
                            {/*<li className="nav-item">*/}
                            {/*    <Link className={"nav-link " + (navPath === "new" ? " active" : "")} to={`/RMActivities/addnew`} onClick={() => setNavPath('new')}><i className="bx bx-user me-1"></i>&nbsp;Add New</Link>*/}
                            {/*</li>*/}
                        </ul>
                    </div>

                    <div className="col-md-3">
                        <h5 className="fw-bold py-1 mb-1 text-md-end">
                           RM Activities
                        </h5>
                    </div>

                </div>

            </div>



            <div id="detail">
                <List />
            </div>
        </Layout>
    )
}
