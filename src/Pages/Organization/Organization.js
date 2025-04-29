import React from 'react';
import MyOrganisation from '../../Commoncomponents/MyOrganisation';
import Layout from '../../Layout/Layout';

const Organization = () => {
    return (
        <Layout>
            <div className='card mt-2'>
            <MyOrganisation />
            </div>
        </Layout>
    )
};

export default Organization;