import {
  BrowserRouter as Router,
  Route,
  Routes,
  Switch,
} from "react-router-dom";
import "./App.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import Login from "./Login/Login";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute.js";

import DistributorDetails from "./Pages/Distributor/DistributorDetails";
import DistributorsList from "./Pages/Distributor/DistributorList";
import DistributorRegistration from "./Pages/Distributor/DistributorRegistration";
import Dashboard from "./Pages/Dashboard/Dashboard";
import ProductList from "./Pages/Products/ProductList";
import ProductDetails from "./Pages/Products/ProductDetails";
import ProductRegistration from "./Pages/Products/ProductRegistration";
import CustomersList from "./Pages/Customers/CustomersList";
import CustomerDetails from "./Pages/Customers/CustomerDetails";
import HospitalList from "./Pages/Hospitals/HospitalList";
import HospitalDetails from "./Pages/Hospitals/HospitalDetails";
import HospitalTab from "./Pages/Hospitals/HospitalTab";
import HospitalRegistration from "./Pages/Hospitals/HospitalRegistration";
import LeadList from "./Pages/Leads/LeadList";
import PatientReferral from "./Pages/Leads/PatientReferral";
import PaymentDetails from "./Pages/PaymentDetails/PaymentDetails";
import EventList from "./Pages/HealthCampEvents/EventList.js";
import StateList from "./Pages/AdminPanel/StateList";
import ProductsListAdminPanel from "./Pages/AdminPanel/ProductsListAdminPanel";
import ProductsCategoryList from "./Pages/AdminPanel/ProductsCategoryList";
import DiseaseList from "./Pages/AdminPanel/DiseaseList";
import UserAndRoleList from "./Pages/AdminPanel/UserList";
import UserRoleMenuList from "./Pages/AdminPanel/UserRoleMenuList";
import MenuList from "./Pages/AdminPanel/MenusList";
import RouteMap from "./Pages/AdminPanel/RouteMap";
import ReportsList from "./Pages/Reports/ReportsList";
import FollowupCalls from "./Pages/Followupcalls/FollowupCalls";
import NewCalls from "./Pages/Followupcalls/NewCalls";
import TravelExpensesList from "./Pages/TravelExpenses/TravelExpensesList";
import TravelExpensesRegistration from "./Pages/TravelExpenses/TravelExpensesRegistration";
import TelecallerDashboard from "./Pages/TelecallerDashboard/TelecallerDashboard";
import OHOCardList from "./Pages/OHOCards/OHOCardList";
import HealthCampList from "./Pages/HealthCamp/HealthCampList";
import LivlongData from "./Pages/LivelongMicroensureData/LivlongData";
import MicronsureData from "./Pages/LivelongMicroensureData/MicronsureData";
import BulkUpload from "./Pages/BulkUpload/BulkUpload";
import RMCardAssign from "./Pages/RMCardAssign/RMCardAssign";
import SalesReport from "./Pages/SalesReport/SalesReport";
import Consultation from "./Pages/Consultation/Consultation";
import RMActivity from "./Pages/RMActivities/RMActivity";
import UserProfile from "./Components/UserProfile.js";
import AdvisorsList from "./Pages/Advisors/AdvisorsList.js";
import AdvisorDetails from "./Pages/Advisors/AdvisorDetails.js";
import AdvisorRegistration from "./Pages/Advisors/AdvisorRegistration.js";
import CustomerRegistration from "./Pages/Customers/CustomerRegistration.js";
import LeadDetails from "./Pages/Leads/LeadDetails";
import LeadRegistration from "./Pages/Leads/LeadRegistration";
import NotFound from "./Components/NotFound.js";
import ConfigList from "./Pages/AdminPanel/ConfigList.js";
import UserDashboard from "./Pages/Dashboard/UserDashboard.js";
import Organization from "./Pages/Organization/Organization.js";
import HHLPolicy from "./Pages/HHL/HHLPolicy.js";
import HealthCampEventList from "./Pages/HealthCamp/HealthCampEventList.js";
import Mandals from "./Pages/AdminPanel/Mandal.js";
import ReportsData from "./Pages/Reports/ReportsData.js";
import EventAdd from "./Pages/HealthCampEvents/EventAdd.js";
import EventRegistration from "./Pages/HealthCampEvents/EventRegistration.js";
import EventDetails from "./Pages/HealthCampEvents/EventDetails.js";
import Orders from "./Pages/Orders/Orders.js";
import Villageassign from  "./Pages/UsersAreaAssign/AssignArea.js"
import UserDetails from "./Pages/AdminPanel/UserDetailsList.js";

function App() {
  return (
    <div style={{ fontFamily: "'Public Sans', sans-serif" }}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            {/*Dashboard*/}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:Id" element={<UserDashboard />} />

            {/*Organization*/}
            <Route path="/orgnization" element={<Organization />} />

            {/*Products*/}
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/list" element={<ProductList />} />
            <Route path="/products/active" element={<ProductList />} />
            <Route path="/products/inactive" element={<ProductList />} />
            <Route path="/products/new" element={<ProductRegistration />} />
            <Route path="products/details/:Id" element={<ProductDetails />} />

            {/*Distributor*/}
            <Route path="/advisors" element={<AdvisorsList />} />
            <Route path="/advisor/list" element={<AdvisorsList />} />
            <Route path="/advisor/details/:Id" element={<AdvisorDetails />} />
            <Route path="/advisor/new" element={<AdvisorRegistration />} />

            {/*Customers*/}
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/list" element={<CustomersList />} />
            <Route
              path="/customers/details/:Id"
              element={<CustomerDetails />}
            />
            <Route path="/customers/new" element={<CustomerRegistration />} />

            {/*Distributor*/}
            <Route path="/distributor" element={<DistributorsList />} />
            <Route path="/distributor/list" element={<DistributorsList />} />
            <Route
              path="/distributor/details/:Id"
              element={<DistributorDetails />}
            />
            <Route
              path="/distributor/new"
              element={<DistributorRegistration />}
            />
            <Route path="/distributor/userprofile" element={<UserProfile />} />

            {/*Hospitals*/}
            <Route path="/hospitals" element={<HospitalList />} />
            <Route path="/hospitals/list" element={<HospitalList />} />



            <Route
              path="/hospitals/details/:Id"
              element={<HospitalDetails />}
            />
            <Route path="/hospitals/new" element={<HospitalRegistration />} />

            {/*Hospital Consultation*/}
            <Route path="/HospitalConsultation" element={<Consultation />} />
            <Route
              path="/HospitalConsultation/previous"
              element={<Consultation />}
            />
            <Route
              path="/HospitalConsultation/upcomming"
              element={<Consultation />}
            />
            <Route
              path="/HospitalConsultation/book"
              element={<Consultation />}
            />
             <Route
              path="HospitalConsultation/pending"
              element={<Consultation />}
            />
            <Route path="/hospitals/spocinfo/hospital/:Id" element={<HospitalTab />} />



            <Route
              path="/hospitals/doctorinfo/hospital/:Id"
              element={<HospitalTab />}
            />

            {/*Leads*/}
            <Route path="/leads" element={<LeadList />} />
            <Route path="/leads/list" element={<LeadList />} />
            <Route path="/leads/details/:Id" element={<LeadDetails />} />
            <Route path="/leads/new" element={<LeadRegistration />} />
            <Route
              path="/leads/Patientreferral"
              element={<PatientReferral />}
            />

            {/*Payment Details*/}
            <Route path="/paymentdetails" element={<PaymentDetails />} />
            <Route path="/paymentdetails/list" element={<PaymentDetails />} />

            {/*Admin Panel*/}
            <Route path="/adminpanel/event" element={<EventList />} />
            <Route path="/adminpanel/state" element={<StateList />} />
            <Route
              path="/adminpanel/products"
              element={<ProductsListAdminPanel />}
            />
            <Route
              path="/adminpanel/productscategory"
              element={<ProductsCategoryList />}
            />
            <Route path="/adminpanel/disease" element={<DiseaseList />} />
            <Route path="/adminpanel/user" element={<UserAndRoleList />} />
            <Route
              path="/adminpanel/userdetails/:Id"
              element={<UserDetails />}
            />
            <Route
              path="/adminpanel/userrolemenu"
              element={<UserRoleMenuList />}
            />
            <Route path="/adminpanel/menulist" element={<MenuList />} />
            <Route path="/adminpanel/routemap" element={<RouteMap />} />
            <Route path="/adminpanel/config" element={<ConfigList />} />
            <Route path="/adminpanel/Mandal" element={<Mandals />} />

            {/*Reports*/}
            <Route path="/reports" element={<ReportsList />} />
            <Route path="/reports/list" element={<ReportsList />} />
            <Route path="/reports/list/newReports" element={<ReportsList />} />
            <Route path="/reports/list/reportsData" element={<ReportsList />} />

            {/*Others*/}
            {/*FollowUp Calls*/}
            <Route path="/Others/followupcalls" element={<FollowupCalls />} />
            <Route
              path="/Others/followupcalls/list"
              element={<FollowupCalls />}
            />
            <Route path="/Others/followupcalls/new" element={<NewCalls />} />

            {/*Travel Expences*/}
            <Route
              path="/Others/travelexpenses"
              element={<TravelExpensesList />}
            />
            <Route
              path="/Others/travelexpenses/list"
              element={<TravelExpensesList />}
            />
            <Route
              path="/Others/travelexpenses/new"
              element={<TravelExpensesRegistration />}
            />

            {/*Telecaller Dashboard*/}
            <Route
              path="/Others/TeleCallerDashboard"
              element={<TelecallerDashboard />}
            />

            {/*OHOCards*/}
            <Route path="/Others/ohocards" element={<OHOCardList />} />

            {/*Health Camp*/}
            <Route path="/healthcamp" element={<HealthCampList />} />
            <Route
              path="/healthcamp/healthCampList"
              element={<HealthCampList />}
            />
            <Route path="/healthcamp/list" element={<HealthCampList />} />
            <Route
              path="/healthcamp/healthCampCustomerList/:Id"
              element={<HealthCampList />}
            />

            {/*Livelong Micronsure Data*/}
            <Route
              path="/Others/LivelongMicroensureData"
              element={<LivlongData />}
            />
            <Route
              path="/Others/LivelongMicroensureData/Livlong"
              element={<LivlongData />}
            />
            <Route
              path="/Others/LivelongMicroensureData/Micronsure"
              element={<MicronsureData />}
            />

            {/*Bulk Upload*/}
            <Route
              path="/Others/bulkupload/distributor"
              element={<BulkUpload />}
            />
            <Route
              path="/Others/bulkupload/hospital"
              element={<BulkUpload />}
            />
            <Route
              path="/Others/bulkupload/LivlongMicroNsure"
              element={<BulkUpload />}
            />

            {/*RM Card Assign*/}
            <Route path="/Others/RMCardAssign" element={<RMCardAssign />} />
            <Route
              path="/Others/RMCardAssign/assign"
              element={<RMCardAssign />}
            />
            <Route
              path="/Others/RMCardAssign/list"
              element={<RMCardAssign />}
            />

            {/*Sales Report*/}
            <Route path="/Others/SalesReport" element={<SalesReport />} />

            {/*Sales Report*/}
            <Route path="/Others/RMActivities" element={<RMActivity />} />
           


            {/*HHL Policies */}
            <Route path="/Others/HHLPolicy" element={<HHLPolicy />} />


            <Route path="/Others/orders" element={<Orders />} />

            <Route path="/HealthCampEvents/List" element={<EventList />} />
            <Route
              path="/HealthCampEvents/new"
              element={<EventRegistration />}
            />
            <Route
              path="/HealthCampEvents/details/:Id"
              element={<EventDetails />}
            />
          </Route>
           {/* user Village assign */}
           <Route path="/Others/Villageassign" element={<Villageassign />} />
           
          <Route path="*" element={<NotFound />} />

          <Route path="/customers/details/null" element={<NotFound />} />
          <Route path="/hospitals/details/null" element={<NotFound />} />
          <Route path="/distributor/details/null" element={<NotFound />} />
          <Route path="/products/details/null" element={<NotFound />} />
          <Route path="/leads/details/null" element={<NotFound />} />
          <Route path="/advisor/details/null" element={<NotFound />} />
          <Route path="/adminpanel/user/details/null" element={<NotFound />} />

        </Routes>
      </Router>
    </div>
  );
}

export default App;
