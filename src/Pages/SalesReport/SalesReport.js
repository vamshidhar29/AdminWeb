import React from 'react';
import 'regenerator-runtime/runtime';
import Report from './Report';
import Layout from '../../Layout/Layout';

export default function SalesReport() {

    return (
        <Layout>
            <div className=" text-center mt-2">
                <div className="row align-items-center">
                    <div className="col-md-9">
                    </div>

                    <div>
                        <h5 className="fw-bold mb-0 text-md-end">
                            Sales Report Management
                        </h5>
                    </div>

                </div>

            </div>

            <div id="detail">
                <Report />
            </div>
        </Layout>
    )
}
