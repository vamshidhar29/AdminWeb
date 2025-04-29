
import React, { useState } from 'react';
import Layout from '../../Layout/Layout';
import { Link } from "react-router-dom";
import List from './List';


export default function HHLPolicy() {
    const [status, setStatus] = useState('incomplete');     

    return (
        <Layout>
        <div>
            <div className="btn-group mt-4" role="group" aria-label="Data Filter">
               <Link>
                <button
                    type="button"
                    className={`btn ${status === 'complete' ? 'btn-primary' : ''} me-2`}
                    onClick={() => setStatus('complete')}
                >
                    Completed
                </button>
                </Link>
        
                 <Link>
                 <button
                    type="button"
                    className={`btn ${status === 'incomplete' ? 'btn-primary' :  ''}`}
                    onClick={() => setStatus('incomplete')}
                >
                    Incomplete
                </button>
                 </Link>
               
            </div>
          
            <List status={status} />
        </div>
        </Layout>
    );
}
