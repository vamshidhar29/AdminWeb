import React from 'react';

const Footer = () => {
    return (
        <footer className='mt-3'>
            <div className="container-xxl d-flex flex-wrap justify-content-between flex-md-row flex-column">
                <div className="mb-2 mb-md-0">
                    <i className="bi bi-c-circle"></i> {new Date().getFullYear()}, <span className="footer-link fw-bolder"><i className="bi bi-c-circle"></i> OHOINDIA LIFE TECH PVT. LTD.</span>
                </div>
                {/* Uncomment the below block if you need to add license, support, or documentation links */}
                {/* <div>
                    <a href="/license/" className="footer-link me-4" target="_blank" rel="noopener noreferrer">License</a>
                    <a href="/support" className="footer-link me-4" target="_blank" rel="noopener noreferrer">Support</a>
                    <a href="/help" className="footer-link me-4" target="_blank" rel="noopener noreferrer">Documentation</a>
                </div> */}
            </div>
        </footer>
    );
};

export default Footer;
