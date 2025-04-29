import React, { useState } from 'react';
import BoxWrapper from "../../Components/BoxWrapper";
import * as XLSX from 'xlsx';
import { fetchAllData, fetchData } from '../../helpers/externapi';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export default function HospitalBulkUpload() {
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
            }
            else {
                setTypeError('Please select only excel file types');
                setExcelFile(null);
            }
        }
    }

    async function insertArrayData(inputData) {
        try {

            //const insertedMember = await fetchData('Member/add', inputData);

            const config = {
                method: "POST",
                url: "https://localhost:7229/api/Hospital/seed",
                Headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                data: inputData
            }
            const response = await axios(config);
            if (response.status === true) {
                setSnackbarMessage("Data Uploaded Successfully")
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error('error', error)
            setSnackbarMessage("Error Uploading data")
            setSnackbarOpen(true);
        }
    }
    async function insertData(inputData) {
        try {
            const insertedHospital = await fetchData('Hospital/add', inputData);
        } catch (e) {
            console.error('error', e)
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

    }
    const handleFileSubmit = async (e) => {
        e.preventDefault();
        if (excelFile !== null) {
            const workbook = XLSX.read(excelFile, { type: 'buffer' });
            const worksheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[worksheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            let districtId = 0;
            let stateId = 1;
            let routeMapId = 0;
            let i = 0

            const districts = await fetchData('Districts/all', { skip: 0, take: 0 });

            const states = await fetchData('States/all', { skip: 0, take: 0 });

            const routes = await fetchData('RouteMap/all', { skip: 0, take: 0 });

            const inputDataArray = [];

            data.forEach((item) => {
                if (item["District"] != undefined) {
                    districts.forEach((district) => {
                        if (district.DistrictName === item["District"].trim()) {
                            districtId = district.DistrictId;
                        }
                    })
                }

                if (item["State"] != undefined) {
                    states.forEach((state) => {
                        if (state.StateName === item["State"].trim()) {
                            stateId = state.StateId;
                        }
                    })
                }

                if (item["Route Name"] != undefined) {
                    routes.forEach((route) => {
                        if (route.RouteName === item["Route Name"].trim()) {
                            routeMapId = route.RouteMapId;
                        }
                    })
                }

                const inputData =
                {
                    "hospitalId": 0,
                    "hospitalName": item["Hospital Name"] != undefined ? item["Hospital Name"] : "",
                    "image": null,
                    "mobileNumber": item["Contact number"] != undefined ? `${item["Contact number"]}` : "",
                    "landline": null,
                    "email": null,
                    "website": "http://Y7SYBAa65N6_8TzlUKJFKnR093kgJSI9G9RcLWOpZwrqs",
                    "addressLine1": item["Address"] != undefined ? item["Address"] : "",
                    "addressLine2": null,
                    "city": item["Location"] != undefined ? item["Location"] : "",
                    "mandal": item["Mandal"] != undefined ? item["Mandal"] : "",
                    "districtId": districtId,
                    "stateId": stateId,
                    "pincode": item["Pincode"] != undefined ? item["Pincode"] : 0,
                    "longitude": null,
                    "latitude": null,
                    "specialization": item["Speciality"] != undefined ? item["Speciality"] : "",
                    "location": item["Location"] != undefined ? item["Location"] : "",
                    "area": null,
                    "spoc1Name": item["SPOC 1 Name"] != undefined ? item["SPOC 1 Name"] : "",
                    "spoc1Designation": item["SPOC 1 Designation"] != undefined ? item["SPOC 1 Designation"] : "",
                    "spoc1ContactNumber": item["SPOC 1 contact number"] != undefined ? `${item["SPOC 1 contact number"]}` : "",
                    "spoc1AlternateContactNumber": null,
                    "mouFileName": "string",
                    "spoc2Name": item["SPOC 2 Name"] != undefined ? item["SPOC 2 Name"] : "",
                    "spoc2Designation": item["SPOC 2 Designation"] != undefined ? item["SPOC 2 Designation"] : "",
                    "spoc2ContactNumber": item["SPOC 2 contact number"] != undefined ? `${item["SPOC 2 contact number"]}` : "",
                    "spoc2AlternateContactNumber": null,
                    "routeMapId": routeMapId,
                    "mapView": null,
                    "agreement": item["Agreement Done/Pending"] != undefined ? item["Agreement Done/Pending"] : "",
                    "aarogyasri": item["Aarogyasri"] != undefined ? item["Aarogyasri"] : "",
                    "isFreeOPConsultation": item["Free OP consultation (First)"] != undefined ? item["Free OP consultation (First)"] : "",
                    "patientCounsellingFee": item["Patient counselling Fee"] != undefined ? item["Patient counselling Fee"] : "",
                    "discountOnDiagnostics": item["Discount on Diagnostics"] != undefined ? item["Discount on Diagnostics"] : "",
                    "menuCardForDiagnostics": item["Menu card for Diagnostics (Priority)"] != undefined ? item["Menu card for Diagnostics (Priority)"] : "",
                    "partnershipCertificate": item["Partnership Certificate"] != undefined ? (item["Partnership Certificate"].toUpperCase() === "YES" ? true : false) : false,
                    "callToFrontDesk": item["Call to front desk"] != undefined ? item["Call to front desk"] : "",
                    "isAgreementReceived": item["Agreement Received YES/NO"] != undefined ? (item["Agreement Received YES/NO"].toUpperCase() === "YES" ? true : false) : false,
                }


                //insertData(inputData);
                inputDataArray.push(inputData);
                //if (i == 0) {
                //    insertData(inputData);
                //    i++;
                //}



            })
            insertArrayData(inputDataArray);
            setExcelData(data);
        }
    }

    const handleSampleDownload = () => {
        const headers = [
            "Hospital Name",
            "Contact number",
            "Landline",
            "Address",
            "Address2",
            "Email",
            "Location",
            "Mandal",
            "Pincode",
            "Longitude",
            "Latitude",
            "Speciality",
            "Area",
            "SPOC 1 Name",
            "SPOC 1 Designation",
            "SPOC 1 contact number",
            "SPOC 1 Alternate contact number",
            "SPOC 2 Name",
            "SPOC 2 Designation",
            "SPOC 2 contact number",
            "SPOC 2 Alternate contact number",
            "Map view",
            "Agreement Done/Pending",
            "Aarogyasri",
            "Free OP consultation (First)",
            "Patient counselling Fee",
            "Discount on Diagnostics",
            "Menu card for Diagnostics (Priority)",
            "Partnership Certificate",
            "Call to front desk",
            "Agreement Received YES/NO"
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sample");

        XLSX.writeFile(wb, "Hospital sample format.xlsx");
    };

    return (
        <>
            <BoxWrapper>
                <div className="d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start mx-4 flex-md-row flex-column gap-4">
                    <div className="user-profile-info">
                        <h4>Hospital Data Upload & View Excel Sheets</h4>
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