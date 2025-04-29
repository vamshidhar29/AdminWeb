import React, { useState, useEffect } from 'react';
import { fetchAllData, fetchData } from '../../helpers/externapi';
import { TableSkeletonLoading } from '../../Commoncomponents/SkeletonLoading';
import CommonTables from '../../Commoncomponents/CommonTables';
import { formatDate } from '../../Commoncomponents/CommonComponents';
import { Link } from "react-router-dom";

const List = () => {
    const [assignedData, setAssignedData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    const diaplayUserName = (userId) => {
        const rmName = users.find((item) => item.UserId === userId);
        if (rmName) {
            return rmName.FullName;
        }
        return '';
    };

    const tableHeads = ["OHOCARD NUMBER", "RM NAME", "ASSINED DATE"];

    const tableElements = assignedData && assignedData.length > 0 ?
        assignedData.map(data => ([
            <Link
                className="text-primary"
                style={{ cursor: 'auto' }}
            >
                {data.OHOCardNumber}
            </Link>,
            diaplayUserName(data.AssignedToRM),
            formatDate(data.AssignedToRMDate)
        ])) : [];

    const fetchAssignedCards = async () => {
        setLoading(true);
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            const response = await fetchData('OHOCards/GetAssignedCardsToRM', { skip, take });
            setAssignedData(response);
        } catch (e) {
            console.error("Error fetching OHOCards/GetAssignedCardsToRM: ", e)
        } finally {
            setLoading(false);
        }
    };

    const fetchTotalCount = async () => {
        setLoading(true);
        try {
            const response = await fetchAllData('OHOCards/GetAssignedCardsToRMCount');
            setTotalCount(response[0].assignedCardsToRMCount);
        } catch (e) {
            console.error("Error fetching OHOCards/GetAssignedCardsToRMCount: ", e)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedCards();
        fetchTotalCount();
    }, [totalCount, perPage, currentPage]);

    useEffect(() => {
        const fetchAllUsers = async () => {
            const getUsers = await fetchData('Users/all', {skip: 0, take: 0});
            setUsers(getUsers);
        };

        fetchAllUsers();
    }, [])

    const handlePageChange = async (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };    

    return (
        <>
            {loading ? <TableSkeletonLoading /> : (
                <div className='card p-2'>
                    {assignedData && assignedData.length > 0 ? (
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
                        <h4 className='text-danger text-center py-5'>No Data to be Displayed</h4>
                    )}

                </div>
            )}
        </>
    )
};

export default List;