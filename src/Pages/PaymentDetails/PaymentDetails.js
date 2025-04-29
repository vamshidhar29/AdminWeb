import React, { useEffect } from "react";
import PageWrapper from "../../Components/PageWrapper";
import PaymentDetailsList from "./PaymentDetailsList";
import Layout from "../../Layout/Layout";

export default function PaymentDetails() {

    return (
        <Layout>
            <PageWrapper>
                <div>
                    <div className=" text-center bg-white p-2 m-1">
                        <div className="row align-items-center">
                            <div className="col-md-9">
                                <ul className="nav nav-md nav-pills">
                                </ul>
                            </div>

                            <div>
                                <h5 className="fw-bold py-1 mb-1 text-md-end">
                                    Payment Details Management
                                </h5>
                            </div>

                        </div>

                    </div>

                    <div id="detail">
                        <PaymentDetailsList />
                    </div>
                </div>                
            </PageWrapper>
        </Layout>
    )
}