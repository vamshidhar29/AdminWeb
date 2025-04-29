import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import List from "./List";
import Layout from "../../Layout/Layout";
import { Link, useLocation } from "react-router-dom";

export default function CustomersList(props) {
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
            <PageWrapper>
                <List />               
            </PageWrapper>
        </Layout>
    )
}