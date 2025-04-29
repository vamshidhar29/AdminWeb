import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import List from "./List";
import Layout from "../../Layout/Layout";
import { Link, useLocation } from "react-router-dom";

export default function LeadList(props) {
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
                        <List />             
            </PageWrapper>
        </Layout>
    )
}