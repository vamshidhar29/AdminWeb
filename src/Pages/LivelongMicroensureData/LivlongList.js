import React, { useState, useEffect } from 'react';
import XLSX from 'xlsx';
import CommonTables from '../../Commoncomponents/CommonTables'
import { fetchData, fetchAllData } from "../../helpers/externapi";
//import Snackbar from '@mui/material/Snackbar';
import moment from 'moment';
import { downloadCSVData, downloadExcelData, constructCompleteAddress } from '../../Commoncomponents/CommonComponents';
import { Link, Outlet, useLocation } from "react-router-dom";

export default function LivlongList() {
    const XLSX = require('xlsx');
    const [membersData, setMembersData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedExcelItems, setSelectedExcelItems] = useState([]);
    const [selectedSentItems, setSelectedSentItems] = useState([]);
    const [memberProdIdSent, setMemberProdIdSent] = useState([]);
    const [selectedVerifyItems, setselectedVerifyItems] = useState([]);
    const [memberProdIdVerify, setMemberProdIdVerify] = useState([]);
    const [selectAllExcel, setSelectAllExcel] = useState(false);
    const [selectAllSent, setSelectAllSent] = useState(false);
    const [selectAllVerify, setselectAllVerify] = useState(false);
    const [serviceStatus, setServiceStatus] = useState();

    let UserId = localStorage.getItem("UserId");

    useEffect(() => {
        const fetchServiceStatus = async () => {
            const response = await fetchData("ServiceStatus/all", { "skip": 0, "take": 0 })
            setServiceStatus(response);
        };

        fetchServiceStatus();
    }, []);

    const handleSelectExcel = (memberId) => {
        if (selectedExcelItems.includes(memberId)) {
            const removeItem = selectedExcelItems.filter(item => item !== memberId);
            setSelectedExcelItems(removeItem);
        } else {
            setSelectedExcelItems([...selectedExcelItems, memberId]);
        }
    };

    const handleSelectSentData = (data) => {
        if (selectedSentItems.includes(data.memberId)) {
            const removeItem = selectedSentItems.filter(item => item !== data.memberId);
            const removeProdId = memberProdIdSent.filter(item => item !== data.memberProductId);
            setSelectedSentItems(removeItem);
            setMemberProdIdSent(removeProdId);
        } else {
            setSelectedSentItems([...selectedSentItems, data.memberId]);
            setMemberProdIdSent([...memberProdIdSent, data.memberProductId]);
        }
    };

    const handleSelectVerifyData = (data) => {
        if (selectedVerifyItems.includes(data.memberId)) {
            const removeItem = selectedVerifyItems.filter(item => item !== data.memberId);
            const removePrdId = memberProdIdVerify.filter(item => item !== data.memberProductId);
            setselectedVerifyItems(removeItem);
            setMemberProdIdVerify(removePrdId);
        } else {
            setselectedVerifyItems([...selectedVerifyItems, data.memberId]);
            setMemberProdIdVerify([...memberProdIdVerify, data.memberProductId]);
        }
    }

    const handleSelectAllExcel = () => {
        setSelectAllExcel(!selectAllExcel);
        let selectingItems = [];        

        if (selectAllExcel) {
            setSelectedExcelItems(selectingItems);
        } else {
            membersData && membersData.length > 0 && (
                membersData.map(data => selectingItems = [...selectingItems, data.memberId])
            )
            setSelectedExcelItems([...selectedExcelItems, ...selectingItems]);
        }
    };

    const handleSelectAllSent = () => {
        setSelectAllSent(!selectAllSent);
        let selectingItems = [];
        let selectingProdid = [];

        if (selectAllSent) {
            setSelectedSentItems(selectingItems);
            setMemberProdIdSent(selectingProdid);
        } else {
            membersData && membersData.length > 0 && (
                membersData.map(data => data.livelongStatusId !== 2 &&
                    (selectingItems = [...selectingItems, data.memberId],
                    selectingProdid = [...selectingProdid, data.memberProductId]))
            )
            setSelectedSentItems([...selectedSentItems, ...selectingItems]);
            setMemberProdIdSent([...memberProdIdSent, ...selectingProdid]);
        }
    };

    const handleSelectAllverify = () => {
        setselectAllVerify(!selectAllVerify);
        let selectingItems = [];
        let selectingProdid = [];

        if (selectAllVerify) {
            setselectedVerifyItems(selectingItems);
            setMemberProdIdVerify(selectingProdid);
        } else {
            membersData && membersData.length > 0 && (
                membersData.map(data => data.livelongStatusId === 2 &&
                    (selectingItems = [...selectingItems, data.memberId],
                    selectingProdid = [...selectingProdid, data.memberProductId]))
            )
            setselectedVerifyItems([...selectedSentItems, ...selectingItems]);
            setMemberProdIdVerify([...memberProdIdVerify, ...selectingProdid]);
        }
    };

    const handilSubmitSentData = async () => {
        if (selectedSentItems && selectedSentItems.length > 0) {
            const sentPayload = selectedSentItems.map(item => ({ memberId: item, livelongStatusId: 2 }))
            const seedPayload = memberProdIdSent.map((item, index) => ({
                vendorName: 'LivLong', memberProductId: item,
                memberId: selectedSentItems[index], serviceStatusId: 2, userId: UserId
            }));
            try {
                const response = await fetchData('MembersProducts/updateLivelongActivated', sentPayload);

                const responseSeed = await fetchData('StatusUpdates/seed', seedPayload);
            } catch (error) {
                console.error('Error while updating sent data: ', error);
            }
            fetchMemberData();
            setSelectedSentItems([]);
            setSelectAllSent(false);
        }
    };

    const handilSubmitActivateData = async () => {
        if (selectedVerifyItems && selectedVerifyItems.length > 0) {
            const sentPayload = selectedVerifyItems.map(item => ({ memberId: item, livelongStatusId: 3 }))
            const seedPayload = memberProdIdVerify.map((item, index) => ({
                vendorName: 'LivLong', memberProductId: item,
                memberId: selectedVerifyItems[index], serviceStatusId: 3, userId: UserId
            }));
            try {
                const response = await fetchData('MembersProducts/updateLivelongActivated', sentPayload)

                const responseSeed = await fetchData('StatusUpdates/seed', seedPayload);
            } catch (error) {
                console.error('Error while activating data: ', error);
            }

            fetchMemberData();
            setselectedVerifyItems([]);
            setselectAllVerify(false);
        }
    };

    const tableHeads = [(
        <div className="d-flex flex-row align-items-center">
            <input id="excelSelect" type="checkbox" style={{ marginRight: '3px' }}
                onChange={handleSelectAllExcel} checked={selectAllExcel} />
            FullName
        </div>
    ), (
        <div className="d-flex flex-row align-items-center">
            <input id="IsDataSent" type="checkbox" style={{ marginRight: '3px' }}
                onChange={handleSelectAllSent} checked={selectAllSent} />
            IsData Sent         
            <button className="btn btn-primary"
                style={{ marginLeft: '3px', height: '22px', width: '65px' }} onClick={handilSubmitSentData}>submit</button>
        </div>
    ), (
        <div className="d-flex flex-row align-items-center">
            <input id="IsVerified" type="checkbox" style={{ marginRight: '3px' }}
                onChange={handleSelectAllverify} checked={selectAllVerify} />
            Is Activated        
            <button className="btn btn-primary"
                style={{ marginLeft: '3px', height: '22px', width: '65px' }} onClick={handilSubmitActivateData}>submit</button>
        </div>
    )];

    const tableElements = membersData && membersData.length > 0 ?
        membersData.map(data => ([
            <div className="d-flex flex-row align-items-center">
                <input id={data.memberId} type="checkbox" style={{ marginRight: '3px' }}
                    onChange={() => handleSelectExcel(data.memberId)} checked={selectedExcelItems.includes(data.memberId)}
                />
                {data.fullName}
            </div>,
            <div className="d-flex flex-row justify-content-center">
                {data.livelongStatusId === 2 ? (
                    <i className='bx bx-check-square' style={{color: 'green'}}></i>
                ) : (
                    <input id={data.memberId} type="checkbox" style={{ height: '15px', width: '15px' }}
                        onChange={() => handleSelectSentData(data)} checked={selectedSentItems.includes(data.memberId)}
                    />
                )}                
            </div>,
            <div className="d-flex flex-row justify-content-center">
                {data.livelongStatusId === 3 ? (
                    <i className='bx bx-check-square' style={{ color: 'green' }}></i>
                ) : (
                    data.livelongStatusId === 2 ? (
                        <input id={data.memberId} type="checkbox" style={{ height: '15px', width: '15px' }}
                            onChange={() => handleSelectVerifyData(data)} checked={selectedVerifyItems.includes(data.memberId)}
                        />
                    ) : null
                )}
            </div>
        ])) : [];

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchMemberData();        
        setSelectAllExcel(false);
        setSelectAllSent(false);
        setselectAllVerify(false);
    }, [currentPage, perPage]);

    const fetchMemberData = async () => {
        setLoading(true);
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            const response = await fetchData("OHOCards/GetAllMemberDetailsforLiveLong", { skip, take });

            const responseCount = await fetchAllData(`OHOCards/GetLivelongCount`);
            const totalCount = responseCount[0]?.livelongDataCount || 0;
            setTotalCount(totalCount);

            setMembersData(response);
            setLoading(false);

            return response;
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
            return null;
        }
    };

    const handleExcelDownload = async () => {
        setLoading(true);
        try {
            let data = membersData;
            if (data.length === 0) {
                data = await fetchMemberData();
            }

            if (!data) {
                throw new Error("No data returned from fetchMemberData");
            }

            if (!Array.isArray(data)) {
                throw new Error("Invalid data format returned from fetchMemberData");
            }

            const filteredData = data.filter(row => selectedExcelItems.includes(row.memberId));

            if (filteredData.length === 0) {
                return;
            }

            let headers = [
                "FullName", "MobileNumber", "DateOfBirth", "Gender", "Address", "PinCode",
                "Dependent1FullName", "Dependent1DateOfBirth", "Dependent1Gender", "Dependent1MobileNumber",
                "Dependent2FullName", "Dependent2DateOfBirth", "Dependent2Gender", "Dependent2MobileNumber",
                "Dependent3FullName", "Dependent3DateOfBirth", "Dependent3Gender", "Dependent3MobileNumber"
            ];

            let dataToExport = filteredData.map(row => {
                let dependents = row.dependents || [];
                while (dependents.length < 3) {
                    dependents.push({});
                }

                return {
                    FullName: row.fullName,
                    MobileNumber: row.mobileNumber,
                    DateOfBirth: row.dateofBirth,
                    Gender: row.gender,
                    Address: row.addressLine1,
                    PinCode: row.pincode,
                    Dependent1FullName: dependents[0].fullName || '',
                    Dependent1DateOfBirth: dependents[0].dateofBirth || '',
                    Dependent1Gender: dependents[0].gender || '',
                    Dependent1MobileNumber: dependents[0].mobileNumber || '',
                    Dependent2FullName: dependents[1].fullName || '',
                    Dependent2DateOfBirth: dependents[1].dateofBirth || '',
                    Dependent2Gender: dependents[1].gender || '',
                    Dependent2MobileNumber: dependents[1].mobileNumber || '',
                    Dependent3FullName: dependents[2].fullName || '',
                    Dependent3DateOfBirth: dependents[2].dateofBirth || '',
                    Dependent3Gender: dependents[2].gender || '',
                    Dependent3MobileNumber: dependents[2].mobileNumber || ''
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: headers });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

            const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
            /*saveAs(blob, "LiveLongData.xlsx");*/
        } catch (error) {
            console.error("Error downloading Excel:", error);
        } finally {
            setLoading(false);
        }
    }; 

    const skeletonloading = () => (
        <>
            <style>{shimmerStyle}</style>
            <div className="shimmer-container shimmer">
                <h6 className="shimmer-text "></h6>
            </div>
            <table className="shimmer-container shimmer">
                <tbody>
                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="shimmer-row">
                            {Array.from({ length: 6 }).map((_, colIndex) => (
                                <td key={colIndex} className="shimmer-cell">
                                    <h6 className="shimmer-text2 " ></h6>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );

    return (
         <>
            {loading && skeletonloading()}
            {!loading && (
                <>
                    <div>
                        <div className="row mt-2">
                            <div className="col-xl-12 col-lg-12 col-md-12 order-0 order-md-1">
                                <div className="card mb-4" style={{ opacity: loading ? 0.5 : 1 }}>
                                    <div className="row mb-2">
                                        <div className="col-md-12 d-flex flex-row-reverse content-between align-items-center gap-2">
                                            <button className="btn btn-secondary create-new btn btn-sm btn-primary" onClick={handleExcelDownload}>
                                                <span><i className="bx bx-export me-sm-1"></i>
                                                    <span className="d-none d-sm-inline-block"> Excel</span>
                                                </span>
                                            </button>

                                            {/*<button className="btn btn-secondary create-new btn btn-sm btn-success" onClick={handleCSVDownload}>*/}
                                            {/*    <span><i className="bx bx-export me-sm-1"></i>*/}
                                            {/*        <span className="d-none d-sm-inline-block"> CSV</span>*/}
                                            {/*    </span>*/}
                                            {/*</button>*/}
                                        </div>
                                    </div>

                                    <div>

                                        {loading && skeletonloading()}
                                        {!loading && (
                                            <div className="card mb-4 mt-2">
                                                {membersData && membersData.length > 0 ? (
                                                    <CommonTables
                                                        tableHeads={tableHeads}
                                                        tableData={tableElements}
                                                        perPage={perPage}
                                                        currentPage={currentPage}
                                                        perPageChange={handlePerPageChange}
                                                        pageChange={handlePageChange}
                                                        totalCount={totalCount}
                                                    />
                                                ) : "NO DATA TO DISPLAY"}

                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </> 
    );
}

const shimmerStyle = `
    @keyframes shimmer {
        0% {
            background-position: -468px 0;
        }
        100% {
            background-position: 468px 0;
        }
    }

    .shimmer {
        animation-duration: 1.0s;
        animation-fill-mode: forwards;
        animation-iteration-count: infinite;
        animation-name: shimmer;
        animation-timing-function: linear;
        background: #F7F7F7;
        background: linear-gradient(to right, #f0f0f0 8%, #fafafa 18%, #f0f0f0 33%);
        background-size: 1000px 104px;
        position: relative;
        overflow: hidden;
    }

    .shimmer-container {
        background-color: #F7F7F7;
        border-radius: 4px;
        height: 50px;
        width: 100%;
        margin: 15px;
    }

    .shimmer-text2 {
        background-color: #C8C8C8;
        border-radius: 4px;
        height: 15px;
        width: 55%;
        margin: 15px 0 0 15px;
        position: relative;
        left: 10%;
        bottom: 10%;
    }

    .shimmer-text {
        background-color: #C8C8C8;
        border-radius: 4px;
        height: 15px;
        width: 15%;
        margin: 15px 0 0 15px;
    }

    .shimmer-row {
        display: flex;
    }

    .shimmer-cell {
        flex: 1;
        padding: 10px;
        height: 50px;
        background-color: #F7F7F7;
        border-radius: 4px;
        margin: 5px;
    }
`;
