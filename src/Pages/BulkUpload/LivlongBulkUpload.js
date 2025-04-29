import React, { useEffect, useState, useRef } from "react";
import * as XLSX from 'xlsx';
import BoxWrapper from "../../Components/BoxWrapper";
import { fetchData } from '../../helpers/externapi';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import Flatpickr from 'react-flatpickr';
import Snackbar from '@mui/material/Snackbar';

export default function LivlongBulkUpload() {
    const [excelFile, setExcelFile] = useState(null);
    const [typeError, setTypeError] = useState(null);
    const [excelData, setExcelData] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const handleFile = (e) => {
        let fileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
        let selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile && fileTypes.includes(selectedFile.type)) {
                setTypeError(null);
                let reader = new FileReader();
                reader.readAsArrayBuffer(selectedFile);
                reader.onload = (e) => {
                    setExcelFile(e.target.result);
                }
            } else {
                setTypeError('Please select only excel file types');
                setExcelFile(null);
            }
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };
    async function insertData(inputData) {
        try {
            const insertedMember = await fetchData('Member/DataUploadBulk', inputData);
            if (insertedMember.status === true) {
                setSnackbarMessage("Data Uploaded Successfully")
                setSnackbarOpen(true);
            }
                       
        } catch (e) {
            console.error('error', e);
            setSnackbarMessage("Error Uploading data")
            setSnackbarOpen(true);
        }
    }

    async function insertArrayData(inputData) {
        try {

            //const insertedMember = await fetchData('Member/add', inputData);

            const config = {
                method: "POST",
                url: "https://localhost:7229/api/Member/DataUploadBulk",
                Headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                data: inputData
            }
            const response = await axios(config);

        } catch (e) {
            console.error('error', e);
        }
    }

    const JSDateToExcelDate = (inDate) => {
        return new Date(Date.UTC(0, 0, inDate - 1));
    };

    const handleFileSubmit = async (e) => {
        e.preventDefault();
        if (excelFile !== null) {
            const workbook = XLSX.read(excelFile, { type: 'buffer' });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            let districtId = 1;
            let stateId = 1;
            let eventId = 1;
            let productsId = 1;
            let memberTypeId = 1;
            let userId = 1;
            let RmId = 1;

            const districts = await fetchData('Districts/all', { skip: 0, take: 0 });

            const states = await fetchData('States/all', { skip: 0, take: 0 });

            const routes = await fetchData('RouteMap/all', { skip: 0, take: 0 });

            
            const events = await fetchData('Event/all', { skip: 0, take: 0 });
            const products = await fetchData('Products/all', { skip: 0, take: 0 });
            const memberTypes = await fetchData('MemberTypes/all', { skip: 0, take: 0 });
            const users = await fetchData('Users/all', { skip: 0, take: 0 });


            const inputDataArray = [];

            data.forEach((item) => {
                if (item["District"] != undefined) {
                    districts.forEach((district) => {
                        if (district.DistrictName === item["District"].trim()) {
                            districtId = district.DistrictId;
                        }
                    });
                }

                if (item["State"] != undefined) {
                    states.forEach((state) => {
                        if (state.StateName === item["State"].trim()) {
                            stateId = state.StateId;
                        }
                    })
                }

                if (item["Event Place"] != undefined) {
                    events.forEach((event) => {
                        if (event.EventName === item["Event Place"].trim()) {
                            eventId = event.EventId;
                        }
                    });
                }

                if (item["Product Name"] != undefined) {
                    products.forEach((product) => {
                        if (product.ProductName === item["Product Name"].trim()) {
                            productsId = product.ProductsId;
                        }
                    });
                }

                if(item["Member Type"] != undefined) {
                    memberTypes.forEach((type) => {
                        if (type.Type === item["Member Type"].trim()) {
                            memberTypeId = type.MemberTypeId;
                        }
                    });
                }

                if (item["User Name"] != undefined) {
                    users.forEach((type) => {
                        if (type.UserName === item["User Name"].trim()) {
                            userId = type.UserId;
                        }
                    });
                }

                if (item["RM Name"] != undefined) {
                    users.forEach((type) => {
                        if (type.UserName === item["RM Name"].trim()) {
                            RmId = type.UserId;
                        }
                    });
                }




                const inputData = {
                    "firstName": item["First Name"] != undefined ? item["First Name"] : "",
                    "lastName": item["Last Name"] != undefined ? item["Last Name"] : "",
                    "mobileNumber": item["Contact Number"] != undefined ? item["Contact Number"] : "",
                    "dateOfBirth": item["DOB"] != undefined ? JSDateToExcelDate(parseInt(item["DOB"])) : "",
                    "age": item["Age"] != undefined ? item["Age"] : null,
                    "gender": item["Gender"] != undefined ? item["Gender"] : "",
                    "addressLine1": item["Address"] != undefined ? item["Address"] : "",
                    "addressLine2": item["Address2"] != undefined ? item["Address2"] : "",
                    "emailId": item["Email ID"] != undefined ? item["Email ID"] : "",
                    "village": item["Village"] != undefined ? item["Village"] : "",
                    "mandal": item["Mandal"] != undefined ? item["Mandal"] : "",
                    "city": item["City"] != undefined ? item["City"] : "",
                    "stateId": stateId,
                    "districtId": districtId,
                    "pincode": item["Pincode"] != undefined ? `${item["Pincode"]}` : "",
                    "registerOn": item["Register Date"] != undefined ? JSDateToExcelDate(parseInt(item["Register Date"])) : null,
                    "clinicName": item["Clinic Name"] != undefined ? item["Clinic Name"] : "",
                    "ohocode": item["OHO Code"] != undefined ? item["OHO Code"] : "",
                    "membertypeid": memberTypeId,
                    "advisorCode":item["Advisor Code"] != undefined ? item["Advisor Code"]: "",
                    "productsId": productsId,   
                    "member1FullName": item["Member1 Full Name"] != undefined ? item["Member1 Full Name"] : "",
                    "relationshipOfMember1": item["Relationship of Member1"] !== undefined ? item["Relationship of Member1"] : "",
                    "genderOfMember1": item["Gender of Member1"] != undefined ? item["Gender of Member1"] : "",
                    "dateOfBirthOfMember1": item["DOB of Member1"] != undefined ? JSDateToExcelDate(parseInt(item["DOB of Member1"])) : "",
                    "ageOfMember1": item["Age of Member1"] != undefined ? item["Age of Member1"] : null,
                    "mobileNumberOfMember1": item["Contact Number of Member1"] != undefined ? item["Contact Number of Member1"] : "",
                    "isNomineeOfMember1": item["Is Nominee of Member1"] != undefined ? item["Is Nominee of Member1"] === "Yes" : false,
                    "kycCardTypeOfMember1": item["KYC Card Type of Member1"] != undefined ? item["KYC Card Type of Member1"] : "",
                    "kycCardNumberOfMember1": item["KYC Card Number of Member1"] != undefined ? item["KYC Card Number of Member1"] : "",
                    "kycCardFrontOfMember1": item["KYC Card Front of Member1"] != undefined ? item["KYC Card Front of Member1"] : "",
                    "kycCardBackOfMember1": item["KYC Card Back of Member1"] != undefined ? item["KYC Card Back of Member1"] : "",
                    "member2FullName": item["Member2 Full Name"] != undefined ? item["Member2 Full Name"] : "",
                    "relationshipOfMember2": item["Relationship of Member2"] != undefined ? item["Relationship of Member2"] : "",
                    "genderOfMember2": item["Gender of Member2"] != undefined ? item["Gender of Member2"] : "",
                    "dateOfBirthOfMember2": item["DOB of Member2"] != undefined ? JSDateToExcelDate(parseInt(item["DOB of Member2"])) : "",
                    "ageOfMember2": item["Age of Member2"] != undefined ? item["Age of Member2"] : null,
                    "mobileNumberOfMember2": item["Contact Number of Member2"] != undefined ? item["Contact Number of Member2"] : "",
                    "isNomineeOfMember2": item["Is Nominee of Member2"] != undefined ? item["Is Nominee of Member2"] === "Yes" : false,
                    "kycCardTypeOfMember2": item["KYC Card Type of Member2"] != undefined ? item["KYC Card Type of Member2"] : "",
                    "kycCardNumberOfMember2": item["KYC Card Number of Member2"] != undefined ? item["KYC Card Number of Member2"] : "",
                    "kycCardFrontOfMember2": item["KYC Card Front of Member2"] != undefined ? item["KYC Card Front of Member2"] : "",
                    "kycCardBackOfMember2": item["KYC Card Back of Member2"] != undefined ? item["KYC Card Back of Member2"] : "",
                    "member3FullName": item["Member3 Full Name"] != undefined ? item["Member3 Full Name"] : "",
                    "relationshipOfMember3": item["Relationship of Member3"] != undefined ? item["Relationship of Member3"] : "",
                    "genderOfMember3": item["Gender of Member3"] != undefined ? item["Gender of Member3"] : "",
                    "dateOfBirthOfMember3": item["DOB of Member3"] != undefined ? JSDateToExcelDate(parseInt(item["DOB of Member3"])) : "",
                    "ageOfMember3": item["Age of Member3"] != undefined ? item["Age of Member3"] : null,
                    "mobileNumberOfMember3": item["Contact Number of Member3"] != undefined ? item["Contact Number of Member3"] : "",
                    "isNomineeOfMember3": item["Is Nominee of Member3"] != undefined ? item["Is Nominee of Member3"] === "Yes" : false,
                    "kycCardTypeOfMember3": item["KYC Card Type of Member3"] != undefined ? item["KYC Card Type of Member3"] : "",
                    "kycCardNumberOfMember3": item["KYC Card Number of Member3"] != undefined ? item["KYC Card Number of Member3"] : "",
                    "kycCardFrontOfMember3": item["KYC Card Front of Member3"] != undefined ? item["KYC Card Front of Member3"] : "",
                    "kycCardBackOfMember3": item["KYC Card Back of Member3"] !== undefined ? item["KYC Card Back of Member3"] : "",
                    "cardType": item["Card Type"] != undefined ? item["Card Type"] : "",
                    "OHOCardNumber": item["OHO Card Number"] != undefined ? item["OHO Card Number"] : "",
                    "amountPaid": item["Amount Paid"] != undefined ? item["Amount Paid"] : "",
                    "CardSoldDate": item["Card Sold Date"] != undefined ? JSDateToExcelDate(parseInt(item["Card Sold Date"])) : "",
                    "isActivated": item["Is Activated"] != undefined ? item["Is Activated"] === "Yes" : false,
                    "startDate": item["Start Date"] != undefined ? JSDateToExcelDate(parseInt(item["Start Date"])) : "",
                    "endDate": item["End Date"] != undefined ? JSDateToExcelDate(parseInt(item["End Date"])) : "",
                    "userId": userId,
                    "RMId": RmId,
                    "AdvisorId":item["Advisor Id"] != undefined ? item["Advisor Id"] :"",
                    "cardIssuedOn": item["Card Issued On"] != undefined ? JSDateToExcelDate(parseInt(item["Card Issued On"])) : "",
                    "cardIssuedBy": item["Card Issued By"] != undefined ? item["Card Issued By"] : "",
                    "remarks": item["Remarks"] != undefined ? item["Remarks"] : "",
                    "isKYCCompleted": item["Is KYC Completed"] != undefined ? item["Is KYC Completed"] === "Yes" : false,
                    "paymentAmount": item["Payment Amount"] != undefined ? parseFloat(item["Payment Amount"]) : 0,
                    "amountPaidDate": item["Amount Paid Date"] != undefined ? JSDateToExcelDate(parseInt(item["Amount Paid Date"])) : "",
                    "utrNumber": item["UTR Number"] != undefined ? item["UTR Number"] : "",
                    "isVerified": item["Is Verified"] != undefined ? item["Is Verified"] === "Yes" : false,
                    "typeOfTransaction": item["Type of Transaction"] != undefined ? item["Type of Transaction"] : "",
                    "cashTakenBy": 7,
                    "receiptLocation": item["Receipt Location"] != undefined ? item["Receipt Location"] : ""
                };
                inputDataArray.push(inputData);
            });
            insertData(inputDataArray);
            setExcelData(data);
            
        }
    };

    const handleSampleDownload = () => {
        const headers = [
            "First Name",
            "Last Name",
            "Gender",
            "DOB",
            "Age",
            "Contact Number",
            "Email ID",
            "Address",
            "Address2",
            "Village",
            "Mandal",
            "City",
            "State",
            "District",
            "Pincode",
            "Register Date",
            "Clinic Name",
            "OHO Code",
            "Member Type",
            "Advisor Code",
            "Product Name",
            "Member1 Full Name",
            "Relationship of Member1",
            "Gender of Member1",
            "DOB of Member1",
            "Age of Member1",
            "Contact Number of Member1",
            "Is Nominee of Member1",
            "KYC Card Type of Member1",
            "KYC Card Number of Member1",
            "KYC Card Front of Member1",
            "KYC Card Back of Member1",
            "Member2 Full Name",
            "Relationship of Member2",
            "Gender of Member2",
            "DOB of Member2",
            "Age of Member2",
            "Contact Number of Member2",
            "Is Nominee of Member2",
            "KYC Card Type of Member2",
            "KYC Card Number of Member2",
            "KYC Card Front of Member2",
            "KYC Card Back of Member2",
            "Member3 Full Name",
            "Relationship of Member3",
            "Gender of Member3",
            "DOB of Member3",
            "Age of Member3",
            "Contact Number of Member3",
            "Is Nominee of Member3",
            "KYC Card Type of Member3",
            "KYC Card Number of Member3",
            "KYC Card Front of Member3",
            "KYC Card Back of Member3",
            "Card Type",
            "OHO Card Number",
            "Amount Paid",
            "Issued On",
            "Is Activated",
            "Start Date",
            "End Date",
            "User Name",
            "RM Name",
            "Advisor Id",
            "Card Issued On",
            "Card Issued By",
            "Remarks",
            "Is KYC Completed",
            "Payment Amount",
            "Amount Paid Date",
            "UTR Number",
            "Is Verified",
            "Type of Transaction",
            "Receipt Location"
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sample");

        XLSX.writeFile(wb, "LiveLong and MicroNsure sample format.xlsx");
    };


    return (
        <>
            <BoxWrapper>
                <div className="d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start mx-4 flex-md-row flex-column gap-4">
                    <div className="user-profile-info">
                        <h4>Upload & View Excel Sheets</h4>
                    </div>
                    <a href="" className="mt-2 mx-2 text-nowrap" onClick={handleSampleDownload}>Download sample excel sheet</a>
                </div>
                <form className="form-group custom-form" onSubmit={handleFileSubmit}>
                    <input type="file" className="form-control" required onChange={handleFile} />
                    <button type="submit" className="btn btn-success btn-md mt-2">UPLOAD</button>


                    {typeError && (
                        <div className="alert alert-danger" role="alert">{typeError}</div>
                    )}
                </form>

                <div className="viewer">
                    {excelData ? (
                        <div className="table-responsive" style={{ maxHeight: '400px', overflow: 'auto' }}>
                            <table className="table" >
                                <thead>
                                    <tr>
                                        {Object.keys(excelData[0]).map((key) => (
                                            <th key={key}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {excelData.map((individualExcelData, index) => (
                                        <tr key={index}>
                                            {Object.keys(individualExcelData).map((key) => (
                                                <td key={key}>{individualExcelData[key]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div>No File is uploaded yet!</div>
                    )}
                </div>
                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarMessage.includes('exists') ? 'error' : 'success'}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </BoxWrapper>
        </>
    );
}
