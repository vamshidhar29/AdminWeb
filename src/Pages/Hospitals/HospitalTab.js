// import React, { useEffect, useState } from "react";
// import { useLocation, useParams, Link, useNavigate } from "react-router-dom";
// import { fetchAllData } from "../../helpers/externapi";
// import Layout from "../../Layout/Layout";

// export default function HospitalTab(props) {
//   const profile=props.data
//   const location = useLocation();
//   const navigate = useNavigate();
//   const id = useParams();
//   const { Id: hospitalId } = useParams();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [details, setDetails] = useState(null);
//    const [doctorData, setDoctorData] = useState([]);
//     const [spocData, setSpocData] = useState([]);
   

//   // const spocData = location.state ? location.state.spocData : null;
//   // const doctorData = location.state ? location.state.doctorData : null;

//   const [activeTab, setActiveTab] = useState(
//     location.pathname.includes("doctorinfo") ? "doctorInfo" : "spocInfo"
//   );


//   const getPlaceholderImage = (id) => {
//     return id % 2 === 0
//       ? "/assets/img/avatars/doctor (1).png" // Even IDs
//       : "/assets/img/avatars/doctor.png"; // Odd IDs
//   };

//   useEffect(() => {
//     if (!hospitalId) return; // ✅ Ensure hospitalId exists before fetching

//     const getHospitalDetails = async () => {
//       try {
//         setLoading(true);
//         const hospitalData = await fetchAllData(
//           `Hospital/GetById/${hospitalId}`
//         );
//         if (hospitalData && hospitalData.length > 0) {
//           setDetails(hospitalData[0]);
//         }
//       } catch (error) {
//         setError("Failed to fetch hospital details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     getHospitalDetails();
//   }, [hospitalId]);

//   useEffect(() => {
//       const fetchDoctorData = async () => {
//         try {
//           const response = await fetchAllData(`Doctor/GetByHospitalId/${id.Id}`);
//           setDoctorData(response);
//           console.log("doctersdata:", response);
//         } catch (error) {
//           console.error("Error fetching doctor data:", error);
//         }
//       };
  
//       const fetchSpocData = async () => {
//         try {
//           const spocresponse = await fetchAllData(
//             `HospitalContact/GetByHospitalId/${id.Id}`
//           );
//           setSpocData(spocresponse);
//           console.log(profile.HospitalId, profile);
//           console.log("spocdata:", spocresponse);
//         } catch (error) {
//           console.error("Error fetching spoc data:", error);
//         }
//       };
  
//       fetchSpocData();
//       fetchDoctorData();
//     }, []); 
//   return (
//     <Layout>
//       <div className="tab-content w-100">
//         {/* SPOC Information */}
//         {activeTab === "spocInfo" && (
//           <div className="card shadow border-0 rounded-3 p-3 h-100">
//             <h5 className="text-success fw-bold mb-3">SPOC INFORMATION</h5>
//             {spocData && spocData.length > 0 ? (
//               <div className="row">
//                 {spocData.map((spoc) => {
//                   const badgeText = spoc.IsPrimary
//                     ? "Primary"
//                     : spoc.IsSecondary
//                     ? "Secondary"
//                     : "General";
//                   const badgeClass = spoc.IsPrimary
//                     ? "badge bg-success"
//                     : "spoc.IsSecondary"
//                     ? "badge bg-warning text-dark"
//                     : "badge bg-secondary";

//                   return (
//                     <div key={spoc.HospitalContactId} className="col-md-6 mb-4">
//                       <div className="border rounded-3 p-3 shadow-sm bg-light">
//                         <div className="d-flex justify-content-between align-items-center">
//                           <h6 className="m-0 text-dark fw-bold">
//                             {spoc.FullName}
//                           </h6>
//                           <span className={badgeClass}>{badgeText}</span>
//                         </div>
//                         {spoc.Qualification && (
//                           <p className="text-muted small mb-2">
//                             ({spoc.Qualification})
//                           </p>
//                         )}
//                         <p className="mb-1">
//                           <strong>Contact:</strong>{" "}
//                           {spoc.MobileNumber || (
//                             <span className="text-danger">Not available</span>
//                           )}
//                         </p>
//                         <p className="mb-0">
//                           <strong>Address:</strong>{" "}
//                           {spoc.Address || (
//                             <span className="text-danger">Not available</span>
//                           )}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="text-center py-3">
//                 <p className="text-danger fw-semibold">
//                   No SPOC data available.
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === "doctorInfo" && (
//           <div className="card shadow border-0 rounded-3 p-3 h-100">
//             <h5 className="text-success fw-bold mb-3">Doctor Details</h5>
//             {doctorData && doctorData.length > 0 ? (
//               <div className="row">
//                 {doctorData.map((doc) => (
//                   <div key={doc.DoctorId} className="col-md-6 col-lg-4 mb-4">
//                     <div className="border rounded-3 p-3 shadow-sm bg-light text-center h-100">
//                       <div
//                         className="mx-auto my-2 rounded-circle overflow-hidden border border-primary shadow-sm"
//                         style={{ width: "100px", height: "100px" }}
//                       >
//                         <img
//                           src={
//                             doc.ImageUrl || getPlaceholderImage(doc.DoctorID)
//                           }
//                           alt={doc.FullName || "Doctor"}
//                           className="w-100 h-100 object-cover"
//                         />
//                       </div>
//                       <h6 className="m-0 text-dark fw-bold">{doc.FullName}</h6>
//                       {doc.Qualification && (
//                         <p className="text-muted small mb-2">
//                           ({doc.Qualification})
//                         </p>
//                       )}
//                      <div className="d-flex justify-content-center gap-3 mt-2">

//   {doc.Email && (
//     <a href={`mailto:${doc.Email}`} className="text-primary fs-5 d-flex align-items-center gap-1 fs-10">
//       <i className="fas fa-envelope"></i>
//       <span>{doc.Email}</span>
//     </a>
//   )}
//   </div>
//   <div className="d-flex justify-content-center gap-3 mt-2">

//   {doc.MobileNumber && (
//     <a href={`tel:${doc.MobileNumber}`} className="text-success fs-5 d-flex align-items-center gap-1 fs-10">
//       <i className="fas fa-phone"></i>
//       <span>{doc.MobileNumber}</span>
//     </a>
//   )}
// </div>
   
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-3">
//                 <p className="text-danger fw-semibold">
//                   No doctor data available.
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// }
