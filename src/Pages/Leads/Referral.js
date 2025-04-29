import React, { useState, useEffect } from "react";
import PageWrapper from "../../Components/PageWrapper";
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { fetchData } from "../../helpers/externapi";
import moment from 'moment';
import CommonTables from '../../Commoncomponents/CommonTables';
import { Link } from "react-router-dom";

export default function Referral(props) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [referrals, setReferrals] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const tableHeads = ["Patient Name", "Hospital Name", "Referred Date", "Distributor", "Mobile Number", "RM Name"];

    const tableElements = referrals && referrals.length > 0 ?
        referrals.map(data => ([
            // <Link
            //     to={data.MemberTypeId === 1 ? `/advisor/details/${data.MemberId}` : data.MemberTypeId === 2 ? `/customers/details/${data.MemberId}` : `/distributor/details/${data.MemberId}`}
            //     className="text-start-important"
            //     style={{
            //         whiteSpace: 'normal',
            //         textAlign: 'start',
            //         display: 'block',
            //     }}
            // >
            //     {data.Name ? data.Name : data.LeadName}
            // </Link>,
            <>
                {data.Name ? data.Name : data.LeadName}
            </>,
            data.HospitalName,
            data.HospitalReferredDate ? <span> {moment(data.HospitalReferredDate).format('YYYY-MMM-DD')}</span> : <span style={{ color: "#fcaeac" }}>NA</span>,
            data.DistributorName ? <span>{data.DistributorName}</span> : <span style={{ color: "#fcaeac" }}>NA</span>,
            data.MobileNumber ? data.MobileNumber : data.LeadMobileNumber,
            data.RMName ? <span>{data.RMName}</span> : <span style={{ color: "#fcaeac" }}>NA</span>,

        ])) : [];

    useEffect(() => {
        async function getReferrals() {
            try {
                const skip = (currentPage - 1) * perPage;
                const take = perPage;

                const data = await fetchData("HospitalReferrals/all", { skip, take });
                if (data) {
                    setReferrals(data);
                } else {
                    setReferrals([]);
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setSnackbarOpen(true);
                setLoading(false);
            }
        }

        getReferrals();
    }, [currentPage, perPage]);

    const getReferralcountData = async () => {
        setLoading(true);
        const referralsCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "HospitalReferrals" });
        const totalCount = referralsCountData[0]?.CountOfRecords || 0;
        setTotalCount(totalCount);
        setLoading(false);
    };

    useEffect(() => {
        getReferralcountData();
    }, []);

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    if (loading) {
        return <CircularProgress />;
    }

    const filterUI = () => (
        <div className="card p-1 my-1 sticky-top">
            <div className="row align-items-center">
                <div className="col-md-9">
                    <ul className="nav nav-md nav-pills">
                        <li className="nav-item">
                            <Link className={"nav-link "} to="/leads/list">
                                <i className="bx bx-user me-1"></i>&nbsp;List
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );

    return (
        <PageWrapper loading={loading} error={error}>
            {filterUI()}
            <div className="row mt-2" style={{ margin: 0, padding: 0 }}>
  <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1" style={{ margin: 0, padding: 0 }}>
    <div className="card" style={{ opacity: loading ? 0.5 : 1, margin: 0, padding: 0 }}>
      <div className="card-body" style={{ margin: 0, padding: 0 }}>
        {referrals && referrals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            There are no records to display.
          </div>
        )}

        {referrals && referrals.length > 0 && (
          <CommonTables
            tableHeads={tableHeads}
            tableData={tableElements}
            perPage={perPage}
            currentPage={currentPage}
            perPageChange={handlePerPageChange}
            pageChange={handlePageChange}
            totalCount={totalCount}
          />
        )}
      </div>
    </div>
  </div>
</div>


            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error">
                    {error}
                </Alert>
            </Snackbar>
        </PageWrapper>
    );
}