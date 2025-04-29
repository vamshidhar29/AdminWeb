import './layout.css';
import React from 'react';
import TopNav from './TopNav';
import Menu from './Menu';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div id='layout-container' className="layout-wrapper layout-content-navbar">
            <div className="layout-container" style={{backgroundColor: '#f2f8fc'}}>
                <Menu />
                <div className="layout-page">
                    <div className="content-wrapper">
                        <TopNav />
                        <div id='scrollable-content' className="container-xxl flex-grow-1">
                            {children}
                            <Footer />                                                                    
                        </div>
                        
                        <div className="content-backdrop fade"></div>
                    </div>
                </div>
            </div>
            <div className="layout-overlay layout-menu-toggle"></div>
            <div className="drag-target"></div>
        </div>
    );
};

export default Layout;
