import React, { useState } from 'react';
import BoxWrapper from "../../Components/BoxWrapper";
import * as XLSX from 'xlsx';
import { fetchData } from '../../helpers/externapi';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
export default function DistributorBulkUpload() {
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

    async function insertData(inputData) {
        try {
            const insertedMember = await fetchData('Member/add', inputData);
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

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

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

            let districtId = 0;
            let stateId = 1;
            let eventId = 1;

            const districts = await fetchData('Districts/all', { skip: 0, take: 0 });
            const events = await fetchData('Event/all', { skip: 0, take: 0 });

            data.forEach((item) => {
                if (item["District"] != undefined) {
                    districts.forEach((district) => {
                        if (district.DistrictName === item["District"].trim()) {
                            districtId = district.DistrictId;
                        }
                    });
                }

                if (item["Event Place"] != undefined) {
                    events.forEach((event) => {
                        if (event.EventName === item["Event Place"].trim()) {
                            eventId = event.EventId;
                        }
                    });
                }

                const inputData = {
                    "memberId": 0,
                    "memberTypeId": 1,
                    "name": item["Name"] != undefined ? item["Name"] : "",
                    "gender": item["Gender"] != undefined ? item["Gender"] : "",
                    "dateofBirth": item["DOB"] != undefined ? JSDateToExcelDate(parseInt(item["DOB"])) : "",
                    "mobileNumber": item["Contact Number"] != undefined ? `${item["Contact Number"]}` : "",
                    "email": item["Email ID"] != undefined ? item["Email ID"] : "",
                    "addressLine1": item["Address"] != undefined ? item["Address"] : "",
                    "addressLine2": item["Address2"] != undefined ? item["Address2"] : "",
                    "village": item["Village"] != undefined ? item["Village"] : "",
                    "mandal": item["Mandal"] != undefined ? item["Mandal"] : "",
                    "city": item["City"] != undefined ? item["City"] : "",
                    "districtId": districtId,
                    "stateId": stateId,
                    "pincode": item["Pincode"] != null ? parseInt(item["Pincode"]) : 0,
                    "registerOn": item["Event Date"] != undefined ? JSDateToExcelDate(parseInt(item["Event Date"])) : null,
                    "isActive": true,
                    "approvedOn": null,
                    "approvedBy": null,
                    "image": null,
                    "password": "1234",
                    "pinNo": 0,
                    "approvedStatus": "false",
                    "isApproved": true,
                    "numberofTimes": 0,
                    "attemptUpdateOn": null,
                    "status": "Registered",
                    "clinicName": item["Clinic Name"] != undefined ? item["Clinic Name"] : "",
                    "ohocode": item["OHO CODE"] != undefined ? item["OHO CODE"] : "",
                    "alternateMobileNumber": null,
                    "age": null,
                    "userId": 0,
                    "eventId": eventId,
                };
                insertData(inputData);
            });
            setExcelData(data);
        }
    };

    const handleSampleDownload = () => {
        const headers = [
            "Name",
            "Gender",
            "DOB",
            "Contact Number",
            "Email ID",
            "Address",
            "Address2",
            "Village",
            "Mandal",
            "City",
            "District",
            "Pincode",
            "Event Date",
            "Event Place",
            "Clinic Name",
            "OHO CODE"
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sample");

        XLSX.writeFile(wb, "Distributors sample format.xlsx");
    };

    return (
        <>
            <BoxWrapper>
                <div className="d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start mx-4 flex-md-row flex-column gap-4">
                    <div className="user-profile-info">
                        <h4> Distributor Data Upload & View Excel Sheets</h4>
                    </div>
                    <a href="" className=" mt-2 mx-2 text-nowrap" onClick={handleSampleDownload}>Download sample excel sheet</a>
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
