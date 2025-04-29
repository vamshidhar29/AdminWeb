import React, { useEffect, useState } from "react";
import CommonTables from '../../Commoncomponents/CommonTables';
import { fetchData } from "../../helpers/externapi";
import moment from 'moment';

export default function List() {

    const [rmActivity, setRMActivity] = useState();
    const [currentPage, setCurrentPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [totalCount, setTotalCount] = React.useState();


    const tableHeads = ["RM Name", "Distributor Name", "Location", "Meet StartTime",
        "Meet EndTime", "Spent Hours"];

    const tableElements = rmActivity && rmActivity.length > 0 ?
        rmActivity.map((item) => ([
            item.RMName,
            item.DistributorName,
            item.Location,
            moment(item.MeetStartTime).format('YYYY-MMM-DD'),
            moment(item.MeetEndTime).format('YYYY-MMM-DD'),
            item.SpentHours
        ])) : [];



    useEffect(() => {
        getRMDistributorActivityCountData();
        fetchRMActivityData();

    }, [currentPage, perPage]);

    const fetchRMActivityData = async () => {
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            const response = await fetchData("RMDistributorCollabrate/all", { skip, take });
            setRMActivity(response);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const getRMDistributorActivityCountData = async () => {
        try {
            const rmDistributorActivityCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "RMDistributorCollabrate" });

            const totalCount = rmDistributorActivityCountData[0]?.CountOfRecords || 0;
            setTotalCount(totalCount);

        } catch (error) {
            console.error("Error fetching distributor count data:", error);
        }
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    return (
        <div>
            <div className="card mb-4 mt-2">
                {rmActivity && rmActivity.length > 0 ? (
                    <CommonTables
                        tableHeads={tableHeads}
                        tableData={tableElements}
                        perPage={perPage}
                        currentPage={currentPage}
                        perPageChange={handlePerPageChange}
                        pageChange={handlePageChange}
                        totalCount={totalCount}

                    />
                ) : (
                    <p>There are no records to display.</p>
                )}
            </div>

        </div>
    );
}