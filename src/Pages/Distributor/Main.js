import React from 'react';

import 'regenerator-runtime/runtime'
import * as ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import DistributorsList from './DistributorList';
import DistributorDetails from './DistributorDetails';
import Root from './Root';

const domNode = document.getElementById('root');
const root = ReactDOM.createRoot(domNode);

const router = createBrowserRouter([
    {
        path: "/distributor",
        element: <Root />,
        children: [
            {
                path: "/distributor",
                element: <DistributorsList />,
                errorElement: <ErrorPage />,
            },
            {
                path: "/distributor/list",
                element: <DistributorsList />,
                errorElement: <ErrorPage />,
            },
            {
                path: "/distributor/details/:Id",
                element: <DistributorDetails />,
                errorElement: <ErrorPage />,
            }
        ]
    
    }    
]);

root.render(
    /*<React.StrictMode>*/
        <RouterProvider router={router} >

        </RouterProvider>
    /*</React.StrictMode>*/
)