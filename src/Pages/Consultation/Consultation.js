import React, { useEffect, useState } from 'react';
import 'regenerator-runtime/runtime';
import { Link, Outlet, useLocation } from "react-router-dom";
import Layout from '../../Layout/Layout';
import PreviousList from './PreviousList';
import UpcommingList from './UpcommingList';
import BookConsultation from './BookConsultation';
import Pending from './Pending';
import { fetchData } from '../../helpers/externapi';

export default function Consultation() {
  const location = useLocation();
  const [navPath, setNavPath] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setselectedDistrict] = useState('');

  useEffect(() => {
    const path = location.pathname;

    if (path.includes('/HospitalConsultation/upcomming')) {
      setNavPath('upcoming');
    } else if (path.includes('/HospitalConsultation/previous')) {
      setNavPath('previous');
    } else {
      setNavPath('book');
    }

    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const getDistricts = await fetchData('Districts/filter',
        { filter: [{ key: "StateId", value: "1", operator: "IN" }] });

      setDistricts(getDistricts);
    } catch (e) {
      console.error("Error -Districts/filter': ", e);
    }
  };

  return (
    <Layout>
      <div className="text-center bg-white p-2 my-1">
        <div className="align-items-center">
          <div className="d-flex flex-row justify-content-between align-items-center">
            <ul className="nav nav-md nav-pills">
              <li className="nav-item">
                <Link
                  className={`nav-link ${navPath === "previous" ? "active" : ""}`}
                  to={`/HospitalConsultation/previous`}
                  onClick={() => setNavPath('previous')}
                >
                  <i className="bx bx-user me-1"></i>&nbsp; Previous
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${navPath === "upcoming" ? "active" : ""}`}
                  to={`/HospitalConsultation/upcomming`}
                  onClick={() => setNavPath('upcoming')}
                >
                  <i className="bx bx-user me-1"></i>&nbsp;Upcoming
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${navPath === "book" ? "active" : ""}`}
                  to={`/HospitalConsultation/book`}
                  onClick={() => setNavPath('book')}
                >
                  <i className="bx bx-user me-1" style={{ marginRight: '5px' }}></i>&nbsp;Appointment & Coupon
                </Link>
              </li>
              {/* <li className="nav-item">
                <Link
                  className={`nav-link ${navPath === "pending" ? "active" : ""}`}
                  to={`/HospitalConsultation/pending`}
                  onClick={() => setNavPath('pending')}
                >
                  <i className="bx bx-time-five me-1"></i>&nbsp;Pending
                </Link>
              </li> */}
            </ul>


            {navPath === 'previous' && (
              <button
                type="button"
                className="btn btn-sm btn-primary "
                data-bs-toggle="modal"
                data-bs-target="#filterModal"
              >
                <i className="fas fa-filter" style={{ marginRight: '7px' }}></i>
                <span className="d-none d-sm-inline-block">Filters</span>
              </button>
            )}






            {/* {navPath === 'previous' && (
                            <div className='d-flex flex-row align-items-center'>
                                <select className="form-select" name="District" value={selectedDistrict}
                                    onChange={(e) => setselectedDistrict(e.target.value)}
                                >
                                    <option value="">-- Select District --</option>
                                    {districts && districts.map(district => (
                                        <option key={district.DistrictId} value={district.DistrictId}>{district.DistrictName}</option>
                                    ))}
                                </select>

                                {selectedDistrict.length > 0 && (
                                    <button className='btn btn-secondary btn-sm ms-1' 
                                        onClick={() => setselectedDistrict('')}>    Clear</button>
                                )}
                            </div>
                        )} */}
          </div>
        </div>
      </div>

      <div id="detail">
        {navPath === "previous" ? (
          <PreviousList district={selectedDistrict} />
        ) : navPath === "upcoming" ? (
          <UpcommingList />
        ) : navPath === "pending" ? (
          <Pending />
        ) : (
          <BookConsultation />
        )}
      </div>


    </Layout>
  )
}