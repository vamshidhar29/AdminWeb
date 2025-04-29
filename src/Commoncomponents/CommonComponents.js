import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';



export const downloadExcelData = async (pageType, totalCount, perPage, currentPage, fetchData, filterCriteria = [], setLoading, memberTypeId, eventid, status) => {
    setLoading(true);
    try {
        let allData = [];
        const totalPages = Math.ceil(totalCount / perPage);
        let filename;

        // for (let page = 1; page <= totalPages; page++) {
        const skip = (currentPage - 1) * perPage;
        const take = perPage;
        let data;

        switch (pageType) {
            case 'doctorslist':
                filename = 'Customers_data.xlsx';
                if (filterCriteria.length > 0) {
                    data = await fetchData("lambdaAPI/Customer/GetMultipleDataByFilter", { skip, take, filter: filterCriteria });
                } else {
                    data = await fetchData("lambdaAPI/Customer/all", { skip, take });
                }
                break;
            case 'distributorlist':
                filename = 'Distributor_data.xlsx';
                if (filterCriteria.length > 0) {
                    data = await fetchData("Member/FilterAdvisorDistributorListTodownloadExcel", { skip, take, filter: filterCriteria, memberTypeId: memberTypeId });
                } else {
                    data = await fetchData("Member/FetchAdvisorDistributorListTodownloadExcel", { skip, take, memberTypeId: memberTypeId });
                }
                break;
            case 'advisorlist':
                filename = 'Advisor_data.xlsx';
                if (filterCriteria.length > 0) {
                    data = await fetchData("lambdaAPI/Employee/GetMultipleDataByFilter", { skip, take, filter: filterCriteria });
                } else {
                    data = await fetchData("lambdaAPI/Employee/GetAdvisors", { skip, take, userRoleId: memberTypeId });
                }
                break;
            case 'leadslist':
                filename = 'Leads_data.xlsx';
                if (filterCriteria.length > 0) {
                    data = await fetchData("Lead/Filter", { skip, take, filter: filterCriteria });
                } else {
                    data = await fetchData("Lead/all", { skip, take });
                }
                break;
            case 'hospitalslist':
                filename = 'Hospitals_data.xlsx';
                if (filterCriteria.length > 0) {
                    data = await fetchData("Hospital/Filter", { skip, take, filter: filterCriteria });
                } else {
                    data = await fetchData("Hospital/all", { skip, take, IsActive: status === 'active' ? true : false });
                }
                break;
            case 'productslist':
                filename = 'Products_data.xlsx';
                if (filterCriteria.length > 0) {
                    data = await fetchData("Product/Filter", { skip, take, filter: filterCriteria });
                } else {
                    data = await fetchData("Product/all", { skip, take });
                }
                break;
            case 'healthcamplist':
                filename = 'HealthCamp_data.xlsx';
                if (filterCriteria.length > 0) {
                    data = await fetchData("lambdaAPI/Vitals/GetMemberVitalsDetailsDataByFilter", { skip, take, filter: filterCriteria });
                } else {
                    data = await fetchData("lambdaAPI/Vitals/GetMemberVitalsDetails/all", { skip, take });
                }
                break;
            case 'healthcampcustomerlist':
                filename = 'HealthCampCustomers.xlsx';
                data = await fetchData("lambdaAPI/MemberEvents/MemberEventDetailsById", { skip, take, eventid });
                break;
            default:
                throw new Error('Unknown page type');
        }

        allData = [...allData, ...data];
        // }

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(allData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        XLSX.writeFile(workbook, filename);

    } catch (error) {
        console.error("Error downloading Excel file:", error);
    } finally {
        setLoading(false);
    }
};

export const downloadCSVData = async (pageType, totalCount, perPage, currentPage, fetchData, filterCriteria = [], setLoading, memberTypeId, eventId, status) => {
    setLoading(true);
    try {
        let allData = [];
        const totalPages = Math.ceil(totalCount / perPage);
        let filename;

        // for (let page = 1; page <= totalPages; page++) {
        const skip = (currentPage - 1) * perPage;
        const take = perPage;
        let data;

        switch (pageType) {
            case 'doctorslist':
                filename = 'Customers_data.csv';
                if (filterCriteria.length > 0) {
                    data = await fetchData("lambdaAPI/Customer/GetMultipleDataByFilter", { skip, take, filter: filterCriteria });
                } else {
                    data = await fetchData("lambdaAPI/Customer/all", { skip, take });
                }
                break;
            case 'distributorlist':
                filename = 'Distributor_data.csv';
                if (filterCriteria.length > 0) {
                    data = await fetchData("Member/GetMultipleDataByFilter", { skip, take, filter: filterCriteria, memberTypeId: memberTypeId });
                } else {
                    data = await fetchData("Member/all", { skip, take, memberTypeId: memberTypeId });
                }
                break;
            case 'advisorlist':
                filename = 'Advisor_data.csv';
                if (filterCriteria.length > 0) {
                    data = await fetchData("lambdaAPI/Employee/GetMultipleDataByFilter", { skip, take, filter: filterCriteria});
                } else {
                    data = await fetchData("lambdaAPI/Employee/GetAdvisors", { skip, take, userRoleId: memberTypeId });
                }
                break;
            case 'leadslist':
                filename = 'Leads_data.csv';
                if (filterCriteria.length > 0) {
                    data = await fetchData("Lead/Filter", { skip, take, filter: filterCriteria });
                } else {
                    data = await fetchData("Lead/all", { skip, take });
                }
                break;
            case 'hospitalslist':
                filename = 'Hospitals_data.csv';
                if (filterCriteria.length > 0) {
                    data = await fetchData("Hospital/Filter", { skip, take, filter: filterCriteria });
                } else {
                    data = await fetchData("Hospital/all", { skip, take, IsActive: status === 'active' ? true : false });
                }
                break;
            case 'productslist':
                filename = 'Products_data.csv';
                if (filterCriteria.length > 0) {
                    data = await fetchData("Product/Filter", { skip, take, filter: filterCriteria });
                } else {
                    data = await fetchData("Product/all", { skip, take });
                }
                break;
            case 'healthcamplist':
                filename = 'HealthCamp_data.csv';
                if (filterCriteria.length > 0) {
                    data = await fetchData("lambdaAPI/Vitals/GetMemberVitalsDetailsDataByFilter", { skip, take, filter: filterCriteria });
                } else {
                    data = await fetchData("lambdaAPI/Vitals/GetMemberVitalsDetails/all", { skip, take });
                }
                break;
            case 'healthcampcustomerlist':
                filename = 'HealthCampCustomer.csv';
                data = await fetchData("lambdaAPI/MemberEvents/MemberEventDetailsById", { skip, take, eventId });
                break;
            default:
                throw new Error('Unknown page type');
            // }

        }

        allData = [...allData, ...data];

        const csvData = convertToCSV(allData);
        downloadCSV(csvData, filename);

    } catch (error) {
        console.error("Error downloading CSV file:", error);
    } finally {
        setLoading(false);
    }
};

const convertToCSV = (jsonData) => {
    const csvRows = [];
    const headers = Object.keys(jsonData[0]);
    csvRows.push(headers.join(','));

    for (const data of jsonData) {
        const values = headers.map(header => {
            const escaped = ('' + data[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

const downloadCSV = (csvData, filename) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
};

export const constructCompleteAddress = (distributor) => {
    let addressParts = [];
    if (distributor.AddressLine1) addressParts.push(distributor.AddressLine1);
    if (distributor.AddressLine2) addressParts.push(distributor.AddressLine2);
    if (distributor.Village) addressParts.push(distributor.Village);
    if (distributor.Mandal) addressParts.push(distributor.Mandal);
    if (distributor.City) addressParts.push(distributor.City);
    if (distributor.DistrictName && distributor.DistrictId !== 0) addressParts.push(distributor.DistrictName);
    if (distributor.StateName && distributor.StateId !== 0) addressParts.push(distributor.StateName);
    if (distributor.Pincode && distributor.Pincode !== "0") addressParts.push(distributor.Pincode);

    let completeAddress = addressParts.join(', ');
    return completeAddress;
};

export const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = date.getDate(); // Day of the month
    const month = date.toLocaleString('default', { month: 'short' }); // Three-letter month
    const year = date.getFullYear(); // Full year
    const hours = date.getHours() % 12 || 12; // Convert 24-hour format to 12-hour format
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Minutes with leading zero
    const amPm = date.getHours() >= 12 ? 'PM' : 'AM'; // Determine AM/PM

    return `${day} ${month} ${year} ${hours}:${minutes} ${amPm}`;
};


export const formatDate1 = (dateString) => {
    if (!dateString) return null; // Return null if date is missing

    const date = new Date(dateString);

    // Format day
    const day = String(date.getDate()).padStart(2, '0');

    // Format month
    const month = date.toLocaleString('en-GB', { month: 'short' });

    // Format year
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};

