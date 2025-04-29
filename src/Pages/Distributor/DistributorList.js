import React, { useState, useEffect } from "react";
import PageWrapper from "../../Components/PageWrapper";
import List from "./List";
import { Link, useLocation } from "react-router-dom";
import Layout from "../../Layout/Layout";

export default function DistributorList(props) {
    const [loading, setLoading] = React.useState();
    const [error, setError] = React.useState();
    const location = useLocation();
    const [navPath, setNavPath] = useState('');

    useEffect(() => {
        const path = location.pathname.toLowerCase();

        if (path.includes('/distributor/new')) {
            setNavPath('new');
        } else if (path.includes('/distributor/details') || path.includes('/associate/details')) {
            setNavPath('details');
        } else if (path.includes('/associate')) {
            setNavPath('Associates');
        } else {
            setNavPath('distributor');
        }
    }, [location]);

    return (
        <Layout>
            <PageWrapper loading={loading} error={error}>                
                        <List />         
            </PageWrapper>
        </Layout>
    )
}