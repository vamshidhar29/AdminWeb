import React, { useState } from 'react';
import { fetchData } from "../helpers/externapi";
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

const ChangePassword = () => {
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [retypeError, setRetypeError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showRetypePassword, setShowRetypePassword] = useState(false);

    let userId = localStorage.getItem("UserId");

    const validateFields = () => {
        let valid = true;

        if (password.trim() === '') {
            setOldPasswordError('*Please enter old password');
            valid = false;
        } else {
            setOldPasswordError('');
        }

        if (newPassword.trim() === '') {
            setNewPasswordError('*Please enter new password');
            valid = false;
        } else {
            setNewPasswordError('');
        }

        if (retypePassword.trim() === '') {
            setRetypeError("*Your password doesn't match");
            valid = false;
        } else {
            setRetypeError('');
            if (newPassword !== retypePassword) {
                setRetypeError("*Your password doesn't match");
                valid = false;
            }
        }

        return valid;
    };

    const handleResetPassword = async () => {
        setIsLoading(true);

        if (validateFields()) {
            const resetPassword = await fetchData('lambdaAPI/Employee/updatingPassword', {
                userId,
                password,
                newPassword
            });

            if (resetPassword.status) {
                setIsPasswordUpdated(true);
                setMessage(resetPassword.message);

                window.location.href = '/';
            } else {
                setMessage(resetPassword.message);
            }
        }

        setIsLoading(false);
    };

    const toggleShowOldPassword = () => {
        setShowOldPassword(!showOldPassword);
    };

    const toggleShowNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleShowRetypePassword = () => {
        setShowRetypePassword(!showRetypePassword);
    };

    return (
        <div style={styles.container}>
            <h2>Change Password</h2>
            <p>Password must be a 4 digit number</p>

            <div style={styles.inputContainer}>
                <input
                    type={showOldPassword ? 'text' : 'password'}
                    placeholder="Enter old password"
                    maxLenght="4"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setOldPasswordError('');
                        setMessage('');
                    }}
                    maxLength={4}
                    style={styles.input}
                />
                <button onClick={toggleShowOldPassword} style={styles.eyeIcon}>
                    {showOldPassword ? <MdVisibility size={20} color="grey" /> : <MdVisibilityOff size={20} color="grey" />}
                </button>
            </div>
            <div style={styles.errorText}>{oldPasswordError}</div>

            <div style={styles.inputContainer}>
                <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                        setNewPassword(e.target.value);
                        setNewPasswordError('');
                        setMessage('');
                    }}
                    maxLength={4}
                    style={styles.input}
                />
                <button onClick={toggleShowNewPassword} style={styles.eyeIcon}>
                    {showNewPassword ? <MdVisibility size={20} color="grey" /> : <MdVisibilityOff size={20} color="grey" />}
                </button>
            </div>
            <div style={styles.errorText}>{newPasswordError}</div>

            <div style={styles.inputContainer}>
                <input
                    type={showRetypePassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    maxLenght="4"
                    value={retypePassword}
                    onChange={(e) => {
                        setRetypePassword(e.target.value);
                        setRetypeError('');
                        setMessage('');
                    }}
                    maxLength={4}
                    style={styles.input}
                />
                <button onClick={toggleShowRetypePassword} style={styles.eyeIcon}>
                    {showRetypePassword ? <MdVisibility size={20} color="grey" /> : <MdVisibilityOff size={20} color="grey" />}
                </button>
            </div>
            <div style={styles.errorText}>{retypeError}</div>

            <div style={isPasswordUpdated ? styles.successText : styles.successTextHide}>{message}</div>

            <button onClick={handleResetPassword} disabled={isLoading} style={styles.submitButton}>
                {isLoading ? 'Loading...' : 'Submit'}
            </button>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '400px',
        margin: 'auto',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    inputContainer: {
        position: 'relative',
        marginBottom: '15px',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '16px',
    },
    eyeIcon: {
        position: 'absolute',
        top: '50%',
        right: '10px',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#007BFF',
    },
    errorText: {
        color: 'red',
        fontSize: '14px',
        marginBottom: '10px',
    },
    successText: {
        color: 'green',
        fontSize: '14px',
        marginBottom: '10px',
    },
    successTextHide: {
        display: 'none',
    },
    submitButton: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
};

export default ChangePassword;
