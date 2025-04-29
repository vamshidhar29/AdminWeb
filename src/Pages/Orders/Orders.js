import React from 'react';
import 'regenerator-runtime/runtime';
import Layout from '../../Layout/Layout';
import List from './List';

export default function SalesReport() {

    return (
        <Layout>
            <div className=" text-center mt-2">
                <div className="row align-items-center">
                    <div className="col-md-9">
                    </div>

                    <div>
                        <h5 className="fw-bold mb-0 text-md-end">
                            Orders Management
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
