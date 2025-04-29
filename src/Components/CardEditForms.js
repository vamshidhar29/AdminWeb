import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import BoxWrapper from "./BoxWrapper";
import { fetchAllData, fetchData, fetchUpdateData, uploadImage } from "../helpers/externapi";
import CardDetailsComponent from './CardDetail';
import moment from 'moment';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { formatDate } from "../Commoncomponents/CommonComponents";

const CardEditForms = ({ selectedProductId, selectedProduct }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [cardDetails, setCardDetails] = useState([]);
    const [editingCardId, setEditingCardId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedBackImage, setSelectedBackImage] = useState(null);
    const [relationshipSelect, setRelationshipSelect] = useState([]);
    const [kycCardTypeSelect, setKycCardTypeSelect] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [kycMessage, setKycMessage] = useState('');
    const [kycVerified, setKycVerified] = useState(false);
    const [buttonText, setButtonText] = useState('KYC Verification');
    const [frontImageUrl, setFrontImageUrl] = useState('');
    const [backImageUrl, setBackImageUrl] = useState('');
    const [frontImageName, setFrontImageName] = useState('');
    const [backImageName, setBackImageName] = useState('');
    const [rmOptions, setRmOptions] = useState([]);
    const [loading, setLoading] = useState();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [selfDetails, setSelfDetails] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const id = useParams();

    useEffect(() => {
        const getUsers = async () => {
            try {
                setLoading(true);
                const usersData = await fetchData("KYCCardType/all", { "skip": 0, "take": 0 });

                const routeMaps = usersData.map(route => ({ label: route.KYCCardType, value: route.KYCCardType }));
                setRmOptions(routeMaps);
            } catch (error) {
                console.error("Error fetching KYC Card Types:", error);
            } finally {
                setLoading(false);
            }
        };

        getUsers();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dependentResponse] = await Promise.all([
                    fetchDependentData(selectedProductId),
                ]);

                setCardDetails(dependentResponse);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [selectedProductId]);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const fetchDependentData = async (productId) => {
        const response = await fetchAllData(`MemberDependent/GetDependentsByMemberProductId/${id.Id}/${productId}`);
        return response;
    };

    const handleFileSelection = (e, type) => {
        const file = e.target.files[0];
        if (type === 'front') {
            setSelectedImage(file);
        } else if (type === 'back') {
            setSelectedBackImage(file);
        }
    };

    const handleFileUpload = async (MemberDependentId) => {
        const formData = new FormData();
        formData.append('MemberDependentId', MemberDependentId);
        formData.append('KYCCardFront', selectedImage);
        formData.append('KYCCardBack', selectedBackImage);

        const response = await uploadImage('MemberDependent/upload', formData);
        return response;
    };

    const handleEdit = async (detail, type) => {
        // const editedCard = cardDetails.find(card => card.MemberDependentId === MemberDependentId);

        // if (!editedCard) {
        //     console.error('Edited card not found');
        //     return; // Exit if no card is found
        // }

        if (type === 'nominee') {
            setEditFormData({
                NomineeId: detail.NomineeId,
                productsId: detail.NomineeProductsId,
                memberId: detail.NomineeMemberId,
                fullName: detail.NomineeFullName,
                dateofBirth: detail.NomineeDateofBirth,
                gender: detail.NomineeGender,
                mobileNumber: detail.NomineeMobileNumber,
                relationship: detail.NomineeRelationship
            });
        } else if (type === 'insurer') {
            setEditFormData({
                InsurerDetailsId: detail.InsurerDetailsId,
                productsId: detail.InsurerProductsId,
                memberId: detail.InsurerMemberId,
                fullName: detail.InsurerName,
                dateofBirth: detail.InsurerDateofBirth,
                gender: detail.InsurerGender,
                mobileNumber: detail.InsurerMobileNumber,
                relationship: detail.InsurerRelationship
            });
        } else {
            setEditFormData({
                memberDependentId: detail.MemberDependentId,
                productsId: detail.DependentProductsId,
                memberId: detail.DependentMemberId,
                fullName: detail.DependentFullName,
                dateofBirth: detail.DependentDateofBirth,
                gender: detail.DependentGender,
                mobileNumber: detail.DependentMobileNumber,
                relationship: detail.DependentRelationship
            });
        }

        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditingCardId(null);
        setIsEditing(false);
    };

    const handleSave = async (event) => {
        event.preventDefault();
        try {
            let response;

            if (editFormData.InsurerDetailsId) {
                response = await fetchUpdateData('InsurerDetails/update', {
                    InsurerDetailsId: editFormData.InsurerDetailsId,
                    Name: editFormData.fullName,
                    ProductsId: editFormData.productsId,
                    MemberId: editFormData.memberId,
                    DateOfBirth: editFormData.dateofBirth,
                    Gender: editFormData.gender,
                    MobileNumber: editFormData.mobileNumber,
                    Relationship: editFormData.relationship
                });

            } else if (editFormData.NomineeId) {
                response = await fetchUpdateData('Nominee/update', {
                    NomineeId: editFormData.NomineeId,
                    FullName: editFormData.fullName,
                    ProductsId: editFormData.productsId,
                    MemberId: editFormData.memberId,
                    DateOfBirth: editFormData.dateofBirth,
                    Gender: editFormData.gender,
                    MobileNumber: editFormData.mobileNumber,
                    Relationship: editFormData.relationship
                });

            } else {
                response = await fetchUpdateData('MemberDependent/update', { ...editFormData });
            }

            setSnackbarMessage("Dependent Details Updated Successfully");

            setSnackbarOpen(true);

            setIsSubmitted(true);
            setTimeout(() => {
                setIsSubmitted(false);
                // window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error updating data:', error);
        }
    };

    const handleKYC = async () => {
        const userIdFromStorage = parseInt(localStorage.getItem("UserId"), 10) || 0;
        const response = await fetchData('Member/KYCVerification', {
            memberId: id.Id,
            UserId: userIdFromStorage,
        });

        setKycMessage(response);
        setKycVerified(true);

        setTimeout(() => {
            setKycVerified(false);
            setKycMessage('');
        }, 5000);
    };

    return (
        <>
            <div>
                {isEditing ? (
                    <div className="card-body">
                        <h2 className="text-dark fs-3">Edit Details</h2>

                        <form onSubmit={(event) => handleSave(event)}>
                            <div>
                                <label className="form-label">FullName</label>
                                <div className="col-12 fw-normal">
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="FullName"
                                        value={editFormData.fullName || ''}
                                        onChange={(e) => setEditFormData({
                                            ...editFormData,
                                            fullName: e.target.value
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-8">
                                    <label className="form-label">Date Of Birth</label>
                                    <div className="col-12 fw-normal">
                                        <input
                                            type="date"
                                            className="form-control"
                                            name="DateofBirth"
                                            value={editFormData.dateofBirth ? new Date(editFormData.dateofBirth).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setEditFormData({
                                                ...editFormData,
                                                dateofBirth: e.target.value
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="col-4">
                                    <label className="form-label">Age</label>
                                    <div className="col-12 fw-normal">
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="Age"
                                            value={editFormData.age || ''}
                                            onChange={(e) => setEditFormData({
                                                ...editFormData,
                                                age: e.target.value
                                            })}

                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-12">
                                <div>
                                    <label className="form-label">Gender</label>
                                    <div className="col-12 d-flex gap-3 mt-2">
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="Gender"
                                                value="Male"
                                                checked={editFormData.gender === "Male"}
                                                onChange={(e) =>
                                                    setEditFormData({
                                                        ...editFormData,
                                                        gender: e.target.value
                                                    })
                                                }
                                            />
                                            <label className="form-check-label">Male</label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="Gender"
                                                value="Female"
                                                checked={editFormData.gender === "Female"}
                                                onChange={(e) =>
                                                    setEditFormData({
                                                        ...editFormData,
                                                        gender: e.target.value
                                                    })
                                                }
                                            />
                                            <label className="form-check-label">Female</label>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Relationship</label>
                                <div className="col-12 fw-normal">
                                    <select id="relationship" name="Relationship" className="form-select" value={editFormData.relationship || ''} onChange={(e) => setEditFormData({
                                        ...editFormData,
                                        relationship: e.target.value
                                    })} style={{ padding: '10px', borderRadius: '5px' }}>
                                        <option value="">Select Relation</option>
                                        <option value="Wife">Wife</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Son">Son</option>
                                        <option value="Daughter">Daughter</option>
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>

                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="form-label">Mobile Number</label>
                                <div className="col-12 fw-normal">
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="mobileNumber"
                                        value={editFormData.mobileNumber || ''}
                                        onChange={(e) => setEditFormData({
                                            ...editFormData,
                                            mobileNumber: e.target.value
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <button type="submit" className="btn btn-primary" style={{ marginRight: "10px" }} >Save</button>
                                <button type="button" className="btn btn-secondary ml-2" onClick={handleCancel}>Cancel</button>
                            </div>
                        </form>
                    </div>
                ) : selectedProduct.Dependents.length > 0 || selectedProduct.Nominees.length > 0 || selectedProduct.Insurer.length > 0 ? (
                    <div>
                        <table className="table table-striped table-sm">
                            <thead>
                                <tr>
                                    <th scope="col">Dependent</th>
                                    <th scope="col">DOB</th>
                                    {/* <th scope="col">Edit</th> */}
                                    <th scope="col">Mobile Number</th>
                                </tr>
                            </thead>
                            <tbody className="table-group-divider">
                                {selectedProduct.Dependents.length > 0 && selectedProduct.Dependents.map(detail => (
                                    <tr>
                                        <td className="d-flex flex-column">
                                            <span>{detail.DependentFullName}</span>
                                            <div className="d-flex align-items-center mb-2">
                                                <span className="badge bg-warning text-dark me-1">{detail.DependentRelationship}</span>
                                            </div>
                                        </td>
                                        <td>{formatDate(detail.DependentDateofBirth).slice(0, 11)}</td>
                                        {/* <td>
                                            <button className="btn btn-danger"
                                                onClick={() => handleEdit(detail, 'dependent')}
                                            > Edit</button>
                                        </td> */}
                                        <td>{detail.DependentMobileNumber}</td>
                                    </tr>
                                ))}
                                {selectedProduct.Nominees.length > 0 && selectedProduct.Nominees.map(detail => (
                                    <tr>
                                        <td className="d-flex flex-column">
                                            <span>{detail.NomineeFullName}</span>
                                            <div className="d-flex align-items-center mb-2">
                                                <span className="badge bg-warning text-dark me-1">{detail.NomineeRelationship}</span>
                                                <span className="badge bg-success">Nominee</span>
                                            </div>
                                        </td>
                                        <td>{formatDate(detail.NomineeDateofBirth).slice(0, 11)}</td>
                                        {/* <td>
                                            <button className="btn btn-danger"
                                                onClick={() => handleEdit(detail, 'nominee')}
                                            > Edit</button>
                                        </td> */}
                                        <td>{detail.NomineeMobileNumber}</td>
                                    </tr>
                                ))}
                                {selectedProduct.Insurer.length > 0 && selectedProduct.Insurer.map(detail => (
                                    <tr>
                                        <td className="d-flex flex-column">
                                            <span>{detail.InsurerName}</span>
                                            <div className="d-flex align-items-center mb-2">
                                                <span className="badge bg-warning text-dark me-1">{detail.InsurerRelationship}</span>
                                                <span className="badge bg-secondary">Insurer</span>
                                            </div>
                                        </td>
                                        <td>{formatDate(detail.InsurerDateofBirth).slice(0, 11)}</td>
                                        {/* <td>
                                            <button className="btn btn-danger"
                                                onClick={() => handleEdit(detail, 'insurer')}
                                            > Edit</button>
                                        </td> */}
                                        <td>{detail.InsurerMobileNumber}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                ) : (
                    <div className="d-flex flex-row justify-content-center">
                        <span className="text-danger text-center">Dependents Not Exist</span>
                    </div>
                )}
                {/* )} */}
            </div>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default CardEditForms;
