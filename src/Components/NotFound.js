import React from 'react';
import Layout from '../Layout/Layout';

const NotFound = () => {
    return (
        <Layout>
            <div className='d-flex flex-column justify-content-center align-items-center h-100'>
                <img src='/assets/img/notfound1.jpg' alt='Not Found'/>
                <h4 className='mt-2 text-danger'>Sorry, Requested URL doesn't exist</h4>
            </div>
        </Layout>
    )
};

export default NotFound;