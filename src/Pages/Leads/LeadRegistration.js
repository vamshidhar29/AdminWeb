import React, { useEffect, useState } from 'react';
import "cleave.js/dist/addons/cleave-phone.in";
import { useNavigate, useLocation } from "react-router-dom";
import BoxWrapper from "../../Components/BoxWrapper";
import { fetchData, fetchUpdateData } from "../../helpers/externapi";
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Flatpickr from 'react-flatpickr';
import Layout from "../../Layout/Layout";
import PageWrapper from "../../Components/PageWrapper";

export default function LeadBasicDetails() {
    const location = useLocation();
    const profileFromLocation = location.state ? location.state.profile : null;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formError, setFormError] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [LeadGenerationId, setLeadGenerationId] = useState('');
    const [leadData, setLeadData] = useState();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const initialFormData = {
        LeadName: "",
        LeadServices: "",
        MobileNumber: "",
        DateofBirth: "",
        Gender: "",
    };
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (profileFromLocation) {
            setFormData(profileFromLocation);
            setLeadGenerationId(profileFromLocation.LeadGenerationId);
        } else {
            setFormData(initialFormData);
        }
    }, [profileFromLocation]);

    useEffect(() => {
        const getTypeofServices = async () => {
            try {
                await fetchData("Service/all", { "skip": 0, "take": 0 });
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        };
        getTypeofServices();
    }, []);

    const handleBackToView = () => {
        navigate('/leads/list');
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const validateForm = async () => {
        let err = {};

        if (!formData.LeadName.trim()) {
            err.LeadName = 'Please enter Lead Name!';
        }

        if (!formData.MobileNumber.trim()) {
            err.MobileNumber = 'Please enter Mobile Number!';
        } else if (!/^[6789]\d{9}$/.test(formData.MobileNumber)) {
            err.MobileNumber = 'Mobile Number must start with 6, 7, 8, or 9 and be exactly 10 digits long!';
        }

        if (typeof formData.Gender === 'string' && formData.Gender.trim() === '') {
            err.Gender = 'Please select your Gender';
        }

        if (!formData.DateofBirth) {
            err.DateofBirth = 'Please select your date of birth';
        }

        setFormError(err);
        return Object.keys(err).length === 0;
    };

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const isValid = await validateForm();

        if (isValid) {
            let dataToUpdate;
            let responseData;
            try {
                dataToUpdate = {
                    LeadGenerationId: formData.LeadGenerationId,
                    leadName: formData.LeadName,
                    mobileNumber: formData.MobileNumber,
                    dateOfBirth: formData.DateofBirth,
                    leadById: formData.leadById,
                    gender: formData.Gender,
                };

                responseData = await fetchUpdateData("Lead/update", dataToUpdate);
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    ...responseData,
                    LeadGenerationId: responseData.LeadGenerationId,
                }));
                setLeadData(responseData);
                setSnackbarMessage("Lead updated successfully");
                setSnackbarOpen(true);

                
                setTimeout(() => {
                    setIsSubmitted(false);
                    if (responseData) {
                        navigate(`/leads/details/${LeadGenerationId}`);
                    }
                }, 4000);
            } catch (error) {
                console.error("Error updating lead:", error);
                setSnackbarMessage(`Error updating lead: ${error.message}`);
                setSnackbarOpen(true);
            }

            setIsSubmitted(true);
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setFormError({});
    };

    return (

        <Layout>
            <PageWrapper>
        <>
            <BoxWrapper>
                <form className="mx-2" onSubmit={onSubmitHandler}>
                    <div className="card p-3">
                        <div className="row mb-3 mx-2">
                            <div className="col-md-6">
                                <div>
                                    <label className="form-label">Lead Name</label>
                                    <span className="required" style={{ color: "red" }}> *</span>
                                    <div id="divName">
                                        <div className="input-group">
                                            <span className="input-group-text"><i className="bx bx-user-circle me-2"></i></span>
                                            <input type="text" id="LeadName" name="LeadName"
                                                className="form-control"
                                                placeholder="Lead Name"
                                                maxLength={100}
                                                value={formData.LeadName} onChange={onChangeHandler}
                                            />
                                        </div>
                                        <span className='non-valid' style={{ color: 'red' }}>{formError.LeadName}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Gender</label>
                                <span className="required" style={{ color: "red" }}> *</span>
                                <div className="row">
                                    <div className="col-md mb-md-0 mb-2">
                                        <div className="form-check custom-option custom-option-basic">
                                            <label className="form-check-label custom-option-content" htmlFor="customRadioTemp1">
                                                <input name="Gender" className="form-check-input" type="radio" value="Male" id="customRadioTemp1" checked={formData.Gender === "Male"} onChange={onChangeHandler} />
                                                <span className="custom-option-header">
                                                    <span className="h6 mb-0">Male</span>
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md">
                                        <div className="form-check custom-option custom-option-basic">
                                            <label className="form-check-label custom-option-content" htmlFor="customRadioTemp2">
                                                <input name="Gender" className="form-check-input" type="radio" value="Female" id="customRadioTemp2" checked={formData.Gender === "Female"} onChange={onChangeHandler} />
                                                <span className="custom-option-header">
                                                    <span className="h6 mb-0">Female</span>
                                                </span>

                                            </label>
                                        </div>

                                    </div>
                                    <span className='non-valid' style={{ color: 'red', marginLeft: '20px' }}>{formError.Gender}</span>
                                </div>
                            </div>
                        </div>

                        <div className="row  mx-2 mt-2">
                            <div className="col-md-6">
                                <div>
                                    <label className="form-label">Mobile Number</label>
                                    <span className="required" style={{ color: "red" }}> *</span>
                                    <div id="divMobileNumber">
                                        <div className="input-group">
                                            <span className="input-group-text" id="basic-addon11"><i className="bx bx-phone"></i></span>
                                            <input
                                                name="MobileNumber"
                                                placeholder="xxxx xxx xxxx"
                                                value={formData.MobileNumber}
                                                className="form-control"
                                                maxLength={10}
                                                onChange={onChangeHandler}
                                            />
                                        </div>
                                        <span className='non-valid' style={{ color: 'red' }}>{formError.MobileNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-6">
                                <div>
                                    <label className="form-label">Date of Birth</label>
                                    <span className="required" style={{ color: "red" }}> *</span>
                                    <div id="divDateofBirth" className="input-group">
                                        <div className="input-group">
                                            <Flatpickr
                                                className="form-control"
                                                id="DateofBirth"
                                                name="DateofBirth"
                                                value={formData.DateofBirth}
                                                onChange={([date]) => onChangeHandler({ target: { name: "DateofBirth", value: date.toISOString().split("T")[0] } })}
                                                options={{ dateFormat: "Y-m-d" }}
                                            />
                                        </div>
                                        <span className='non-valid' style={{ color: 'red' }}>{formError.DateofBirth}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="form-group" style={{ marginBottom: "50px" }}>
                            <div className="col-md-4 col-md-offset-2 mt-3" style={{ display: "flex", alignItems: "center" }}>
                                <button className="btn btn-md btn-primary" type="button" style={{ marginLeft: "10px" }} onClick={handleBackToView}>
                                    Cancel
                                </button>
                                <button className="btn btn-md btn-danger" type="button" style={{ marginLeft: "10px" }} onClick={resetForm}>
                                    Reset
                                </button>
                                <button className="btn btn-md btn-primary" type="submit" style={{ marginLeft: "10px", backgroundColor: "#5cb85c", borderColor: "#5cb85c" }}>
                                    Submit
                                </button>
                            </div>
                        </div>
                        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                            <Alert onClose={handleSnackbarClose} severity={Object.keys(formError).length > 0 ? "error" : "success"}>
                                {snackbarMessage}
                            </Alert>
                        </Snackbar>
                    </div>
                </form>
            </BoxWrapper>
                </>
            </PageWrapper>
        </Layout>
    );
}
