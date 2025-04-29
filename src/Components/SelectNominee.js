import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Alert, Snackbar } from '@mui/material';
import { fetchData, fetchAllData } from "../helpers/externapi";
import Flatpickr from 'react-flatpickr';

const SelectNominee = ({ selectedProduct, comboProductId, customerId }) => {
    const [members, setMembers] = useState({
        adult: [],
        children: [],
        nominee: null,
    });
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openFormIndex, setOpenFormIndex] = useState(null);
    const [isAdultSubmitted, setIsAdultSubmitted] = useState(false);
    const [selectedNominee, setSelectedNominee] = useState(null); // To keep track of the selected nominee globally
    //const canAddAdult = !members.adult && maxAdults > 0 && !isAdultSubmitted;
    const [childrenDataLength, setIsChildrenDataLength] = useState(null);
    // const [canAddAdult, setCanAddAdult] = useState(true); 
    // const [childrenCount, setChildrenCount] = useState(0);
    // const [adultCount, setAdultCount] = useState(0);
    const [hasOtherRelationship, setHasOtherRelationship] = useState(false);
    const [showNomineeSelection, setShowNomineeSelection] = useState(true);

    const total = selectedProduct.Dependents.length + 1;
    const maxAdults = selectedProduct.PoliciesMaximumAdult;
    const childrens = selectedProduct.PoliciesMaximumChild;
    const adultCount = selectedProduct.Dependents.length > 0 ? selectedProduct.Dependents.filter(dep =>
        dep.DependentRelationship !== 'Son' && dep.DependentRelationship !== 'Daughter'
    ).length : 0;
    const childrenCount = selectedProduct.Dependents.length > 0 ? selectedProduct.Dependents.filter(dep =>
        dep.DependentRelationship === 'Son' && dep.DependentRelationship === 'Daughter'
    ).length : 0;

    const id = useParams();

    const hasNominee = () => {
        if (members.adult && members.adult.isNominee) return true;
        if (members.nominee) return true;
        return members.children.some(child => child.isNominee);
    };

    const addNomineeForm = () => {
        if (!hasNominee()) {
            setMembers({
                ...members,
                nominee: {
                    name: "",
                    dob: "",
                    age: "",
                    mobile: "",
                    gender: "",
                    relationship: "",
                    profileImage: "",
                    useAge: false,
                    guardianName: '',
                    guardianDob: '',
                    guardianAge: '',
                    guardianGender: '',
                    guardianMobile: '',
                    guardianUseAge: false,
                    isNominee: true,
                },
            });
        }
    };

    const addAdultMemberForm = () => {
        if (members.adult.length < maxAdults - adultCount) {
            setMembers({
                ...members,
                adult: [
                    ...members.adult,
                    {
                        name: "",
                        dob: "",
                        age: "",
                        mobile: "",
                        gender: "",
                        relationship: "",
                        profileImage: "",
                        useAge: false,
                        isNominee: false,
                    },
                ],
            });
        }
    };

    const removeChildMemberForm = (index) => {
        const updatedChildren = [...members.children];
        if (updatedChildren[index].isNominee) {
            setSelectedNominee(null); // Reset nominee if the removed child was the nominee
        }
        updatedChildren.splice(index, 1);
        setMembers({ ...members, children: updatedChildren });

        // Reset openFormIndex if the removed index was equal to openFormIndex
        if (index === openFormIndex) {
            setOpenFormIndex(null); // Resetting the openFormIndex
        } else if (index < openFormIndex) {
            // If the removed index is before the openFormIndex, decrease it by 1
            setOpenFormIndex((prevIndex) => (prevIndex !== null ? prevIndex - 1 : null));
        }
    };

    const addChildMemberForm = () => {
        // Allow adding child forms if the adult form is not open or has been submitted
        if ((members.children.length < childrens) && (openFormIndex == null)) {
            setMembers((prevMembers) => ({
                ...prevMembers,
                children: [
                    ...prevMembers.children,
                    {
                        name: '',
                        dob: '',
                        age: '',
                        mobile: '',
                        gender: '',
                        relationship: '',
                        profileImage: '',
                        useAge: false,
                        guardianName: '',
                        guardianDob: '',
                        guardianAge: '',
                        guardianGender: '',
                        guardianMobile: '',
                        guardianUseAge: false,
                        isNominee: false,
                    },
                ],
            }));
            setOpenFormIndex(members.children.length); // Set the new index for the added child
        } else {
            setSnackbarMessage('Action Not Allowed. Please submit the current Children details before adding another Children.');
            setSnackbarOpen(true);
        }
    };

    const fetchDependentData = async () => {
        try {
            setLoading(true);

            const dependentData = await fetchAllData(`MemberDependent/GetDependentsByMemberProductId/${id.Id}/${comboProductId}`);

            if (dependentData && dependentData.length > 0) {


                const childrenData = dependentData.filter(dep => dep.Relationship === 'Son' || dep.Relationship === 'Daughter');

                // Set the number of children
                // setChildrenCount(childrenData.length);

                // Check for any other relationship
                const otherRelationships = dependentData.filter(dep =>
                    dep.Relationship !== 'Son' && dep.Relationship !== 'Daughter'
                );

                // setAdultCount(otherRelationships.length);

                const isNominee = dependentData.some(dep => dep.IsNominee === true);
                setShowNomineeSelection(!isNominee);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDependentData();
    }, []);

    const handleNomineeSelection = (type, index = null) => {

        if (selectedNominee) {

            setSnackbarMessage("Nominee already selected. Only one nominee allowed.");
            setSnackbarOpen(true);


            if (selectedNominee.type !== type || (type === 'child' && selectedNominee.index !== index)) {
                if (selectedNominee.type === 'adult') {

                    setMembers((prevMembers) => ({
                        ...prevMembers,
                        adult: {
                            ...prevMembers.adult,
                            isNominee: false,
                        },
                    }));
                } else if (selectedNominee.type === 'child') {

                    setMembers((prevMembers) => {
                        const updatedChildren = [...prevMembers.children];
                        updatedChildren[selectedNominee.index].isNominee = false;
                        return { ...prevMembers, children: updatedChildren };
                    });
                }
            } else {

                return;
            }
        }


        if (type === 'adult') {
            setMembers((prevMembers) => {
                const updatedChildren = [...prevMembers.adult];
                updatedChildren[index].isNominee = true;
                return { ...prevMembers, adult: updatedChildren };
            });
        } else if (type === 'child') {
            setMembers((prevMembers) => {
                const updatedChildren = [...prevMembers.children];
                updatedChildren[index].isNominee = true;
                return { ...prevMembers, children: updatedChildren };
            });
        }


        setSelectedNominee({ type, index });
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const calculateDOBFromAge = (age) => {
        const today = new Date();
        const birthDate = new Date(today.setFullYear(today.getFullYear() - age));
        return birthDate.toISOString().split("T")[0];
    };

    const validateMember = (member) => {
        const newErrors = {};

        if (!member.name) {
            newErrors.name = "Name is required";
        }

        if (!member.dob) {
            newErrors.dob = "Date of Birth is required";
        } else if (new Date(member.dob) > new Date()) {
            newErrors.dob = "Date of Birth cannot be in the future";
        }


        if (!member.relationship) {
            newErrors.relationship = "Relationship is required";
        } 
        else if (
            ["son", "daughter"].includes(member.relationship.toLowerCase())
        ) {
            // if (member.age <= 0) {
            //     newErrors.age = "Age must be a positive number";
            // } else if (member.age > selectedProduct.ChildrenAge) {
            //     newErrors.age = `Age for Son or Daughter must be between 0 and ${selectedProduct.ChildrenAge}`;
            // } else {
                delete newErrors.age;
            // }
        } 
        else {
            // General age validation for other relationships
            if (member.age <= 0) {
                newErrors.age = "Age must be a positive number";
            } else if (
                member.age < selectedProduct.MinimumAge ||
                member.age > selectedProduct.MaximumAge
            ) {
                newErrors.age = `Age must be between ${selectedProduct.MinimumAge} and ${selectedProduct.MaximumAge}`;
            } else {
                delete newErrors.age; // Clear the error if age is valid
            }
        }



        const mobileRegex = /^[6-9][0-9]{9}$/;

        if (member.mobile && !mobileRegex.test(member.mobile)) {
            newErrors.mobile = "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.";
        }

        // if (!member.relationship) {
        //     newErrors.relationship = "Relationship is required";
        // }

        if (!member.gender) {
            newErrors.gender = "Gender is required";
        }

        if (member.isNominee && member.age < 16) {
            if (!member.guardianName) {
                newErrors.guardianName = "Guardian Name is required";
            }
            if (!member.guardianDob) {
                newErrors.guardianDob = "Guardian Date of Birth is required";
            }
            if (member.guardianAge < 0) {
                newErrors.guardianAge = "Guardian Age must be a positive number";
            }
            if (!member.guardianMobile) {
                newErrors.guardianMobile = "Guardian Mobile Number is required";
            }
            if (!member.guardianGender) {
                newErrors.guardianGender = "Guardian Gender is required";
            }
        }

        return newErrors;
    };

    const handleSubmit = async (type, index) => {
        let member;

        if (type === "adult") {
            if (!members.adult || members.adult.length <= index) {
                console.error("No adult member found at the specified index:", index);
                return;
            }
            member = members.adult[index];
        } else if (type === "children") {
            if (!members.children || members.children.length <= index) {
                console.error("No child member found at the specified index:", index);
                return;
            }
            member = members.children[index];
        } else if (type === "nominee") {
            member = members.nominee;
        }
        if (!member) {
            console.error(`No ${type} member data found`);
            return;
        }

        const validationErrors = validateMember(member);

        if (Object.keys(validationErrors).length === 0) {
            setIsSubmitting(true);
            try {
                // Save details to API
                await saveDetailsToAPI(member, type);
                // Optionally reset nominee form here or show success feedback
            } catch (error) {
                console.error("Error saving details to API:", error);
                setSnackbarMessage("Error saving details. Please try again.");
                setSnackbarOpen(true);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            setErrors(validationErrors);
        }
    };

    const saveDetailsToAPI = async (data, type) => {
        try {
            setLoading(true);

            // if (!data.age || !data.name || !data.dob) {
            //     console.error('Missing required fields in data:', data);
            //     return;
            // }

            const response = await fetchData('lambdaAPI/Customer/add', {
                productsId: selectedProduct.IndividualProductsId,
                relatedCustomerId: customerId,
                age: data.age,
                name: data.name,
                dateofBirth: data.dob,
                gender: data.gender,
                relationship: data.relationship,
                mobileNumber: data.mobile,
                isNominee: data.isNominee,
                isDependent: type !== 'nominee' ? true : false,
                type: type === 'nominee' ? 'Nominee' : '',
                guardianName: data.guardianName,
                guardianDateofBirth: data.guardianDob,
                guardianAge: data.guardianAge,
                guardianGender: data.guardianGender,
                guardianMobileNumber: data.guardianMobile,
            });


            if (response) {
                setSnackbarMessage(` ${response.data.relationship} Details Saved Successfully`);
                setSnackbarOpen(true);

                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    const handleAdultChange = (index, field, value) => {
        const updatedAdults = [...members.adult]; // Clone the existing array of adults
        const updatedAdult = { ...updatedAdults[index], [field]: value }; // Update the specific field of the adult at the given index

        // Update dependent fields
        if (field === "age" && value) {
            updatedAdult.dob = calculateDOBFromAge(value);
        }

        if (field === "dob" && value) {
            updatedAdult.age = calculateAge(value);
        }

        updatedAdults[index] = updatedAdult; // Replace the updated adult in the array
        setMembers({ ...members, adult: updatedAdults }); // Update the state
    };

    const handleNomineeChange = (field, value) => {
        const updatedNominee = { ...members.nominee, [field]: value };

        if (field === "age" && value) {
            updatedNominee.dob = calculateDOBFromAge(value);
        }

        if (field === "guardianAge" && value) {
            updatedNominee.guardianDob = calculateDOBFromAge(value);
        }


        if (field === "dob" && value) {
            updatedNominee.age = calculateAge(value);
        }

        if (field === "guardianDob" && value) {
            updatedNominee.guardianDob = calculateAge(value);
        }

        setMembers({ ...members, nominee: updatedNominee });
    };

    const removeAdultMemberForm = (index) => {
        const updatedAdults = members.adult.filter((_, i) => i !== index);
        setMembers({ ...members, adult: updatedAdults });
    };

    const removeNomineeForm = () => {
        setMembers((prevMembers) => ({
            ...prevMembers,
            nominee: null,
        }));
    };

    const isAnyNomineeSelected = () => {

        if (members.adult && members.adult.isNominee) {
            return true;
        }


        if (members.children) {
            return members.children.some(child => child.isNominee);
        }

        return false;
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <>
            {total < selectedProduct.PoliciesMaximumMembers && (
                <div className="d-flex flex-column align-items-center shadow-sm m-3">
                    <h5 className="text-center text-dark">Select Members</h5>
                    <div className="text-center" style={{ marginBottom: '10px', fontStyle: 'italic' }}>
                        Note: Maximum of {selectedProduct.PoliciesMaximumMembers} persons Only
                    </div>
                    <div className="button-group mb-4">
                        <button
                            className="btn btn-primary me-2"
                            onClick={addAdultMemberForm}
                            disabled={adultCount >= selectedProduct.PoliciesMaximumAdult}
                        >
                            Add Adult
                        </button>

                        <button
                            className="btn btn-primary me-2"
                            onClick={addChildMemberForm}
                            disabled={childrenCount >= selectedProduct.PoliciesMaximumChild}
                        >
                            Add Childrens
                        </button>

                        {selectedProduct.PoliciesIsNomineeRequired && selectedProduct.Nominees.length <= 0 && (
                            <button
                                className="btn btn-primary"
                                onClick={addNomineeForm}
                            >
                                Add Nominee
                            </button>
                        )}
                    </div>
                </div>
            )}

            {members.adult.map((adultMember, index) => (
                <div key={index} className="adult-form p-3 mb-2">
                    <h6 className="text-dark fs-5 fw-semibold text-center">Adult Member {index + 1}</h6>

                    <div className="mb-2">
                        <label className="form-label">Name:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                            value={adultMember.name}
                            onChange={(e) => handleAdultChange(index, "name", e.target.value)}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    <div className="row align-items-center mb-2">
                        <div className="col-9">
                            <label className="form-label">Date of Birth:</label>
                            <Flatpickr
                                className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                                value={adultMember.dob}
                                onChange={([date]) =>
                                    handleAdultChange(index, "dob", date.toLocaleDateString("en-CA"))
                                }
                            />
                            {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
                        </div>

                        <div className="col-3">
                            <label className="form-label">Age:</label>
                            <input
                                className={`form-control ${errors.age ? "is-invalid" : ""}`}
                                type="number"
                                value={adultMember.age}
                                min="0"
                                onChange={(e) => handleAdultChange(index, "age", e.target.value)}
                            />
                            {errors.age && <div className="invalid-feedback">{errors.age}</div>}
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Mobile Number:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                            value={adultMember.mobile}
                            onChange={(e) => handleAdultChange(index, "mobile", e.target.value)}
                            maxLength={10} // Restrict input to 10 digits
                            pattern="[0-9]*" // Accept only digits
                        />
                        {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Relationship:</label>
                        <select
                            className={`form-select ${errors.relationship ? "is-invalid" : ""}`}
                            value={adultMember.relationship}
                            onChange={(e) => handleAdultChange(index, "relationship", e.target.value)}
                        >
                            <option value="">Select Relationship</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Husband">Husband</option>
                            <option value="Wife">Wife</option>
                            <option value="Mother">Mother</option>
                            <option value="Father">Father</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                        </select>
                        {errors.relationship && <div className="invalid-feedback">{errors.relationship}</div>}
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Gender:</label>
                        <div className="d-flex align-items-center">
                            <div className="form-check me-3">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    id={`genderMale-${index}`}
                                    name={`gender-${index}`}
                                    value="Male"
                                    checked={adultMember.gender === "Male"}
                                    onChange={(e) => handleAdultChange(index, "gender", e.target.value)}
                                />
                                <label className="form-check-label" htmlFor={`genderMale-${index}`}>Male</label>
                            </div>
                            <div className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    id={`genderFemale-${index}`}
                                    name={`gender-${index}`}
                                    value="Female"
                                    checked={adultMember.gender === "Female"}
                                    onChange={(e) => handleAdultChange(index, "gender", e.target.value)}
                                />
                                <label className="form-check-label" htmlFor={`genderFemale-${index}`}>Female</label>
                            </div>
                        </div>
                        {errors.gender && <div className="invalid-feedback d-block">{errors.gender}</div>}
                    </div>

                    {selectedProduct.IsNomineeRequired && showNomineeSelection && (
                        <div className="mb-2 nominee-checkbox p-2" style={{ border: '2px solid blue', borderRadius: '0.5rem' }}>
                            {adultMember.isNominee || isAnyNomineeSelected() ? (
                                <div className="text-muted mt-2">Already Selected as Nominee</div>
                            ) : (
                                <div className="form-check">
                                    <label className="form-label">Select Nominee</label>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`isNominee-${index}`}
                                        onChange={() => handleNomineeSelection('adult', index)}
                                        style={{ accentColor: 'blue' }}
                                    />
                                </div>
                            )}
                        </div>
                    )}


                    <div className="button-group">
                        <button
                            className="btn btn-danger me-2"
                            onClick={() => removeAdultMemberForm(index)}
                        >
                            Remove Adult {index + 1}
                        </button>
                        <button
                            className="btn btn-success me-2"
                            onClick={() => handleSubmit('adult', index)}
                            disabled={isSubmitting || loading}
                        >
                            Submit Adult {index + 1}
                        </button>
                    </div>
                </div>
            ))}

            {members.children && members.children.map((member, index) => (
                <div key={index} className="member-form p-3 mb-2">
                    <h6 className="text-dark fs-5 fw-semibold text-center">Children {index + 1}</h6>

                    <div className="mb-2">
                        <label className="form-label">Name:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                            value={member.name}
                            onChange={(e) => {
                                const newFamily = [...members.children];
                                newFamily[index].name = e.target.value;
                                setMembers({ ...members, children: newFamily });
                            }}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    <div className="row align-items-center mb-2">
                        <div className="col-9">
                            <label className="form-label col-md-5 mb-0">Date of Birth:</label>

                            <Flatpickr
                                className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                                value={member.dob ? new Date(member.dob) : null}
                                onChange={([date]) => {
                                    const newFamily = [...members.children];
                                    if (date) {
                                        newFamily[index].dob = date.toLocaleDateString("en-CA");
                                        newFamily[index].age = calculateAge(date);
                                    } else {
                                        newFamily[index].dob = '';
                                        newFamily[index].age = '';
                                    }
                                    setMembers({ ...members, children: newFamily });
                                }}
                                options={{ dateFormat: "Y-m-d" }}
                            />
                            {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
                        </div>

                        <div className="col-3">
                            <label className="form-label">Age:</label>

                            <input
                                type="number"
                                className={`form-control ${errors.age ? "is-invalid" : ""}`}
                                value={member.age}
                                min="0"
                                onChange={(e) => {
                                    const newFamily = [...members.children];
                                    newFamily[index].age = e.target.value;
                                    newFamily[index].dob = calculateDOBFromAge(e.target.value);
                                    setMembers({ ...members, children: newFamily });
                                }}
                            />
                            {errors.age && <div className="invalid-feedback">{errors.age}</div>}
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Mobile Number:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                            value={member.mobile}
                            onChange={(e) => {
                                const newFamily = [...members.children];
                                newFamily[index].mobile = e.target.value;
                                setMembers({ ...members, children: newFamily });
                            }}
                            maxLength={10} // Restrict input to 10 digits
                            pattern="[0-9]*" // Accept only digits
                        />
                        {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Relationship:</label>
                        <select
                            className={`form-select ${errors.relationship ? "is-invalid" : ""}`}
                            value={member.relationship}
                            onChange={(e) => {
                                const newFamily = [...members.children];
                                newFamily[index].relationship = e.target.value;
                                setMembers({ ...members, children: newFamily });
                            }}
                        >
                            <option value="">Select Relationship</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                        </select>
                        {errors.relationship && <div className="invalid-feedback">{errors.relationship}</div>}
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Gender:</label>
                        <div className="d-flex align-items-center">
                            <div className="form-check me-3">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    id={`genderMale-${index}`}
                                    name={`gender-${index}`}
                                    value="Male"
                                    checked={member.gender === "Male"}
                                    onChange={() => {
                                        const newFamily = [...members.children];
                                        newFamily[index].gender = "Male";
                                        setMembers({ ...members, children: newFamily });
                                    }}
                                />
                                <label className="form-check-label" htmlFor={`genderMale-${index}`}>Male</label>
                            </div>
                            <div className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    id={`genderFemale-${index}`}
                                    name={`gender-${index}`}
                                    value="Female"
                                    checked={member.gender === "Female"}
                                    onChange={() => {
                                        const newFamily = [...members.children];
                                        newFamily[index].gender = "Female";
                                        setMembers({ ...members, children: newFamily });
                                    }}
                                />
                                <label className="form-check-label" htmlFor={`genderFemale-${index}`}>Female</label>
                            </div>
                        </div>
                        {errors.gender && <div className="invalid-feedback d-block">{errors.gender}</div>}
                    </div>

                    {selectedProduct.IsNomineeRequired && showNomineeSelection && (
                        <div className="mb-2 nominee-checkbox p-2" style={{ border: '2px solid blue', borderRadius: '0.5rem' }}>
                            {member.isNominee || isAnyNomineeSelected() ? (
                                <div className="text-muted mt-2">Already Selected as Nominee</div>
                            ) : (
                                <div className="form-check">
                                    <label className="form-label">Select Nominee</label>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`isNominee-${index}`}
                                        onChange={() => handleNomineeSelection('child', index)}
                                        style={{ accentColor: 'blue' }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {member.isNominee && member.age < 16 && (
                        <div className="mb-2 border p-2">
                            <h6 className="text-dark text-center">Guardian Details</h6>

                            <div className="mb-2">
                                <label className="form-label">Guardian Name:</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.guardianName ? "is-invalid" : ""}`}
                                    value={member.guardianName || ''} // Ensure value is not undefined
                                    onChange={(e) => {
                                        const newFamily = [...members.children];
                                        newFamily[index].guardianName = e.target.value;
                                        setMembers({ ...members, children: newFamily });
                                    }}
                                />
                                {errors.guardianName && <div className="invalid-feedback">{errors.guardianName}</div>}
                            </div>

                            <div className="row align-items-center">
                                <div className="col-9">
                                    <label className="form-label">Guardian Date of Birth:</label>
                                    <Flatpickr
                                        className={`form-control ${errors.guardianDob ? "is-invalid" : ""}`}
                                        value={member.guardianDob ? new Date(member.guardianDob) : null}
                                        onChange={([date]) => {
                                            const newFamily = [...members.children];
                                            if (date) {
                                                newFamily[index].guardianDob = date.toLocaleDateString("en-CA");
                                                newFamily[index].guardianAge = calculateAge(date); // Implement this function to calculate age
                                            } else {
                                                newFamily[index].guardianDob = '';
                                                newFamily[index].guardianAge = '';
                                            }
                                            setMembers({ ...members, children: newFamily });
                                        }}
                                        options={{ dateFormat: "Y-m-d" }}
                                    />
                                    {errors.guardianDob && <div className="invalid-feedback">{errors.guardianDob}</div>}
                                </div>

                                <div className="col-3">
                                    <label className="form-label">Guardian Age:</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.guardianAge ? "is-invalid" : ""}`}
                                        value={member.guardianAge || ''} // Ensure value is not undefined
                                        min="0"
                                        onChange={(e) => {
                                            const newFamily = [...members.children];
                                            newFamily[index].guardianAge = e.target.value;
                                            newFamily[index].guardianDob = calculateDOBFromAge(e.target.value);
                                            setMembers({ ...members, children: newFamily });
                                        }}
                                    />
                                    {errors.guardianAge && <div className="invalid-feedback">{errors.guardianAge}</div>}
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="form-label">Guardian Mobile Number:</label>
                                <input
                                    type="number"
                                    className={`form-control ${errors.guardianMobile ? "is-invalid" : ""}`}
                                    value={member.guardianMobile || ''} // Ensure value is not undefined
                                    onChange={(e) => {
                                        const newFamily = [...members.children];
                                        newFamily[index].guardianMobile = e.target.value;
                                        setMembers({ ...members, children: newFamily });
                                    }}
                                    maxLength={10} // Restrict input to 10 digits
                                    pattern="[0-9]*" // Accept only digits
                                />
                                {errors.guardianMobile && <div className="invalid-feedback">{errors.guardianMobile}</div>}
                            </div>

                            <div className="mb-2">
                                <label className="form-label">Guardian Gender:</label>
                                <div className="d-flex align-items-center">
                                    <div className="form-check me-3">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id={`guardianGenderMale-${index}`}
                                            name={`guardianGender-${index}`}
                                            value="Male"
                                            checked={member.guardianGender === "Male"}
                                            onChange={() => {
                                                const newFamily = [...members.children];
                                                newFamily[index].guardianGender = "Male";
                                                setMembers({ ...members, children: newFamily });
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor={`guardianGenderMale-${index}`}>Male</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id={`guardianGenderFemale-${index}`}
                                            name={`guardianGender-${index}`}
                                            value="Female"
                                            checked={member.guardianGender === "Female"}
                                            onChange={() => {
                                                const newFamily = [...members.children];
                                                newFamily[index].guardianGender = "Female";
                                                setMembers({ ...members, children: newFamily });
                                            }}
                                        />
                                        <label className="form-check-label" htmlFor={`guardianGenderFemale-${index}`}>Female</label>
                                    </div>
                                </div>
                                {errors.guardianGender && <div className="invalid-feedback d-block">{errors.guardianGender}</div>}
                            </div>
                        </div>
                    )}

                    <div className="button-group">
                        <button className="btn btn-primary" onClick={() => handleSubmit('children', index)}>Submit Children {index + 1}</button>
                        <button className="btn btn-danger ms-2" onClick={() => removeChildMemberForm(index)}>Remove Children {index + 1}</button>
                    </div>
                </div>
            ))}

            {members.nominee && (
                <div className="nominee-form p-3 mb-2">
                    <h6 className="text-dark fs-5 fw-semibold text-center">Nominee Member</h6>

                    <div className="mb-2">
                        <label className="form-label">Name:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                            value={members.nominee.name || ""}
                            onChange={(e) => handleNomineeChange("name", e.target.value)}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    <div className="row align-items-center mb-2">
                        <div className="col-9">
                            <label className="form-label">Date of Birth:</label>
                            <Flatpickr
                                className={`form-control ${errors.dob ? "is-invalid" : ""}`}
                                value={members.nominee.dob || ""}
                                onChange={([date]) => handleNomineeChange("dob", date.toLocaleDateString("en-CA"))}
                            />
                            {errors.dob && <div className="invalid-feedback">{errors.dob}</div>}
                        </div>

                        <div className="col-3">
                            <label className="form-label">Age:</label>
                            <input
                                type="number"
                                className={`form-control ${errors.age ? "is-invalid" : ""}`}
                                value={members.nominee.age || ""}
                                min="0"
                                onChange={(e) => handleNomineeChange("age", e.target.value)}
                            />
                            {errors.age && <div className="invalid-feedback">{errors.age}</div>}
                        </div>
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Mobile Number:</label>
                        <input
                            type="number"
                            className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                            value={members.nominee.mobile || ""}
                            onChange={(e) => handleNomineeChange("mobile", e.target.value)}
                            maxLength={10}
                            pattern="[0-9]*"
                        />
                        {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Relationship:</label>
                        <input
                            type="text"
                            className={`form-control ${errors.relationship ? "is-invalid" : ""}`}
                            value={members.nominee.relationship || ""}
                            onChange={(e) => handleNomineeChange("relationship", e.target.value)}
                            placeholder="Enter relationship"
                        />
                        {errors.relationship && <div className="invalid-feedback">{errors.relationship}</div>}
                    </div>

                    <div className="mb-2">
                        <label className="form-label">Gender:</label>
                        <div className="d-flex align-items-center">
                            <div className="form-check me-3">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    id={`genderMale`}
                                    name={`gender`}
                                    value="Male"
                                    checked={members.nominee.gender === "Male"}
                                    onChange={(e) => handleNomineeChange("gender", e.target.value)}
                                />
                                <label className="form-check-label" htmlFor={`genderMale`}>Male</label>
                            </div>
                            <div className="form-check">
                                <input
                                    type="radio"
                                    className="form-check-input"
                                    id={`genderFemale`}
                                    name={`gender`}
                                    value="Female"
                                    checked={members.nominee.gender === "Female"}
                                    onChange={(e) => handleNomineeChange("gender", e.target.value)}
                                />
                                <label className="form-check-label" htmlFor={`genderFemale`}>Female</label>
                            </div>
                        </div>
                        {errors.gender && <div className="invalid-feedback d-block">{errors.gender}</div>}
                    </div>

                    {members.nominee.age < 16 && (
                        <div className="mb-2 border p-2">
                            <h6 className="text-dark text-center">Guardian Details</h6>
                            <div className="mb-2">
                                <label className="form-label">Guardian Name:</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.guardianName ? "is-invalid" : ""}`}
                                    value={members.nominee.guardianName || ""}
                                    onChange={(e) => handleNomineeChange("guardianName", e.target.value)}
                                />
                                {errors.guardianName && <div className="invalid-feedback">{errors.guardianName}</div>}
                            </div>

                            <div className="row align-items-center mb-2">
                                <div className="col-9">
                                    <label className="form-label">Guardian Date of Birth:</label>
                                    <Flatpickr
                                        className={`form-control ${errors.guardianDob ? "is-invalid" : ""}`}
                                        value={members.nominee.guardianDob || ""}
                                        onChange={([date]) => handleNomineeChange("guardianDob", date.toLocaleDateString("en-CA"))}
                                    />
                                    {errors.guardianDob && <div className="invalid-feedback">{errors.guardianDob}</div>}
                                </div>

                                <div className="col-3">
                                    <label className="form-label">Guardian Age:</label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.guardianAge ? "is-invalid" : ""}`}
                                        value={members.nominee.guardianAge || ""}
                                        min="0"
                                        onChange={(e) => handleNomineeChange("guardianAge", e.target.value)}
                                    />
                                    {errors.guardianAge && <div className="invalid-feedback">{errors.guardianAge}</div>}
                                </div>
                            </div>

                            <div className="mb-2">
                                <label className="form-label">Guardian Mobile Number:</label>
                                <input
                                    type="number"
                                    className={`form-control ${errors.guardianMobile ? "is-invalid" : ""}`}
                                    value={members.nominee.guardianMobile || ""}
                                    onChange={(e) => handleNomineeChange("guardianMobile", e.target.value)}
                                    maxLength={10}
                                    pattern="[0-9]*"
                                />
                                {errors.guardianMobile && <div className="invalid-feedback">{errors.guardianMobile}</div>}
                            </div>

                            <div className="mb-2">
                                <label className="form-label">Guardian Gender:</label>
                                <div className="d-flex align-items-center">
                                    <div className="form-check me-3">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="guardianGenderMale"
                                            name="guardianGender"
                                            value="Male"
                                            checked={members.nominee.guardianGender === "Male"}
                                            onChange={() => handleNomineeChange("guardianGender", "Male")}
                                        />
                                        <label className="form-check-label" htmlFor="guardianGenderMale">Male</label>
                                    </div>
                                    <div className="form-check">
                                        <input
                                            type="radio"
                                            className="form-check-input"
                                            id="guardianGenderFemale"
                                            name="guardianGender"
                                            value="Female"
                                            checked={members.nominee.guardianGender === "Female"}
                                            onChange={() => handleNomineeChange("guardianGender", "Female")}
                                        />
                                        <label className="form-check-label" htmlFor="guardianGenderFemale">Female</label>
                                    </div>
                                </div>
                                {errors.guardianGender && <div className="invalid-feedback d-block">{errors.guardianGender}</div>}
                            </div>
                        </div>
                    )}

                    <div className="button-group">
                        <button
                            className="btn btn-danger me-2"
                            onClick={removeNomineeForm}
                        >
                            Remove Nominee
                        </button>
                        <button
                            className="btn btn-success me-2"
                            onClick={() => handleSubmit("nominee")}
                            disabled={isSubmitting || loading}
                        >
                            Submit Nominee
                        </button>
                    </div>
                </div>
            )}

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <Alert onClose={handleSnackbarClose} severity="success">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default SelectNominee;
