import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import Referral from "./Referral";
import Layout from "../../Layout/Layout";
import { Link, useLocation } from "react-router-dom";

export default function PatientReferral(props) {
    const location = useLocation();
    const [navPath, setNavPath] = useState('');

    useEffect(() => {
        const pathname = location.pathname.toLowerCase();

        if (pathname.includes('patientreferral')) {
            setNavPath('Patientreferral');
        } else if (pathname.includes('details')) {
            setNavPath('details');
        } else if (pathname.includes('new')) {
            setNavPath('new');
        } else {
            setNavPath('list');
        }
    }, [location]);

    return (
        <Layout>
            <PageWrapper>
                        <Referral />              
            </PageWrapper>
        </Layout>
    )
}