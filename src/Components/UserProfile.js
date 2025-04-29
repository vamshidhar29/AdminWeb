import React, { useState, useEffect } from 'react';
import { fetchAllData, fetchData } from "../helpers/externapi";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import ChangePassword from './ChangePassword';
import Layout from "../Layout/Layout";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [formError, setFormError] = useState({});
    const [base64, setBase64] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);


    const UserId = localStorage.getItem("UserId");


    const fetchUserDetails = async () => {
        try {
            const response = await fetchAllData(`lambdaAPI/Employee/GetById/${UserId}`);
            setUser(response[0]);
            setLoading(false);
        } catch (error) {
            console.error('Error while fetching data:', error);
            setError('Failed to fetch user details');
            setLoading(false);
        }
    };

    useEffect(() => {


        const getMocUrl = async () => {
            const response = await fetchData('ConfigValues/all', { skip: 0, take: 0 });
            const imageUrl = response && response.length > 0 && response.find(val => val.ConfigKey === "userImagesBucketlink");
            setImageUrl(imageUrl.ConfigValue);
        };


        getMocUrl();
    }, []);



    useEffect(() => {
        fetchUserDetails();
    }, []);

    const handleFileSelection = async (e) => {
        const file = e.target.files[0];
        const allowedTypes = [
            'image/jpeg', // For JPEG images
            'image/png',  // For PNG images
            'image/jpg'   // For non-standard JPG MIME type (optional)
        ];

        const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

        if (file) {
            if (!allowedTypes.includes(file.type)) {
                setFormError(prevError => ({
                    ...prevError,
                    UserImage: 'Invalid file type. Please upload a PDF or DOC file.'
                }));
                setSelectedImage(null);
            } else if (file.size > maxFileSize) {
                setFormError(prevError => ({
                    ...prevError,
                    UserImage: 'File size exceeds 5MB. Please upload a smaller file.'
                }));
                setSelectedImage(null);
            } else {
                setFormError(prevError => ({
                    ...prevError,
                    UserImage: ''
                }));
                setSelectedImage(file);

                const reader = new FileReader();

                // Event listener for successful file read
                reader.onload = () => {
                    if (reader.result) {
                        setBase64(reader.result.toString());
                    }
                };

                // Read file as Data URL (Base64)
                reader.readAsDataURL(file);


                await handleFileUpload(file);
            }
        } else {
            setFormError(prevError => ({
                ...prevError,
                Image: 'Please upload a file.'
            }));
            setSelectedImage(null);
        }
    };

    const handleFileUpload = async (file) => {
        try {
            const fileToBase64 = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(file); 
                });
            };
            const base64 = await fileToBase64(file);
            const content = base64.split('base64,'); 
            if (content.length < 2) {
                throw new Error('Invalid base64 format');
            }
            const response = await fetchData('lambdaAPI/Employee/imageupload', {
                userId: UserId,
                userImage: content[1], 
            });
            if (response) {
                await fetchUserDetails();
                setIsUploading(true);
            } else {
                throw new Error(response?.message || 'Image upload failed');
            }
        } catch (error) {
            console.error('Error uploading files:', error);
        }
        finally {
            setIsUploading(false);
        }
    };
    

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Layout>
            <div className="container mt-4">
                <div className="row">
                    <div className="col-md-7">
                        <div className="card">
                            <div className="card-body">
                                <div className="d-flex align-items-start align-items-sm-center gap-4">
                                    <img
                                        src={user.UserImage ? `${imageUrl}${user.UserImage}` : "../../assets/img/dummy-avatar.jpg"}
                                        alt="User Avatar"
                                        className="d-block rounded"
                                        height="100"
                                        width="100"
                                        id="uploadedAvatar"
                                    />
                                    <div className="button-wrapper">
                                        <label htmlFor="upload" className="btn btn-primary me-2 mb-4">
                                            <span>Upload Image</span>
                                            <FontAwesomeIcon icon={faUpload} className="ms-2" />
                                            <input type="file" id="upload" className="account-file-input" hidden accept="image/png, image/jpeg, image/jpg" onChange={handleFileSelection} />
                                            <span className="non-valid" style={{ color: 'red' }}>{formError.UserImage}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body" style={styles.cardBody}>
                                <div style={styles.userDetail}>
                                    <label style={styles.label}>UserName</label>
                                    <p style={styles.value}>{user.UserName}</p>
                                </div>
                                <div style={styles.userDetail}>
                                    <label style={styles.label}>EmployeeId</label>
                                    <p style={styles.value}>{user.EmployeeId}</p>
                                </div>
                                <div style={styles.userDetail}>
                                    <label style={styles.label}>E-mail</label>
                                    <p style={styles.value}>{user.EmailId}</p>
                                </div>
                                <div style={styles.userDetail}>
                                    <label style={styles.label}>Phone Number</label>
                                    <p style={styles.value}>{user.MobileNumber}</p>
                                </div>
                                <div style={styles.userDetail}>
                                    <label style={styles.label}>Role</label>
                                    <p style={styles.value}>{user.UserRoleName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="card-body">
                            <ChangePassword />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const styles = {
    cardBody: {
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif',
    },
    userDetail: {
        marginBottom: '15px',
        padding: '10px 15px',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontWeight: 'bold',
        color: '#333',
    },
    value: {
        fontSize: '16px',
        color: '#555',
    },
};

export default UserProfile;
