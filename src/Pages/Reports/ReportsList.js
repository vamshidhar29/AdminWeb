import React, { useEffect, useState } from "react";
import PageWrapper from "../../Components/PageWrapper";
import List from "./List";
import Layout from "../../Layout/Layout";
import { Link, useLocation } from "react-router-dom";
import NewReportList from "./NewReportList";
import ReportsData from "./ReportsData";

export default function ReportsList() {
  const location = useLocation();

  const [navPath, setNavPath] = useState("newReports");

  useEffect(() => {
    if (location.pathname.indexOf("newReports") > 0) {
      setNavPath("newReports");
    } else if (location.pathname.indexOf("reportsData") > 0) {
      setNavPath("reportsData");
    } else if (location.pathname.indexOf("list") > 0) {
      setNavPath("list");
    }
  }, [location]);

  return (
    <Layout>
      <PageWrapper>
        <div>
          <div className="text-center bg-white p-2 m-1">
            <div className="row align-items-center">
              <div className="col-md-9">
                <ul className="nav nav-md nav-pills">
                  <li className="nav-item">
                    <Link
                      className={
                        "nav-link " +
                        (navPath === "newReports" ? " active" : "")
                      }
                      to={`/reports/list/newReports`}
                      onClick={() => setNavPath("newReports")}
                    >
                      <i className="bx bx-user me-1"></i>&nbsp;New Reports
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={
                        "nav-link " + (navPath === "list" ? " active" : "")
                      }
                      to={`/reports/list`}
                      onClick={() => setNavPath("list")}
                    >
                      <i className="bx bx-user me-1"></i>&nbsp;Old Reports
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link
                      className={
                        "nav-link " +
                        (navPath === "reportsData" ? " active" : "")
                      }
                      to={`/reports/list/reportsData`}
                      onClick={() => setNavPath("reportsData")}
                    >
                      <i className="bx bx-user me-1"></i>&nbsp; Generated Reports
                    </Link>
                  </li>

                  {/*<li className="nav-item">*/}
                  {/*    <Link className={"nav-link " + (navPath === "new" ? " active" : "")} to={`/health/new`} onClick={() => setNavPath('new')}><i className="tf-icons navbar-icon bx bx-plus-circle"></i>&nbsp;Add New</Link>*/}
                  {/*</li>*/}
                  {/*{(navPath !== "list" && navPath !== "new") && (*/}
                  {/*<li className="nav-item">*/}
                  {/*        <Link className={"nav-link " + (navPath === "details" ? " active" : "")} to={`/health/details`} onClick={() => setNavPath('details')}><i className="tf-icons navbar-icon bx bx-edit"></i>&nbsp;Details</Link>*/}
                  {/*    </li>*/}
                  {/*)}*/}
                </ul>
              </div>

              <div className="col-md-3">
                <h5 className="fw-bold py-1 mb-1 text-md-end">
                  Reports Management
                </h5>
              </div>
            </div>
          </div>
          <div id="detail">
            <div id="detail">
              {navPath && navPath === "reportsData" ? (
                <ReportsData /> // Render HealthCampCustomerList when navPath matches
              ) : navPath && navPath === "list" ? (
                <List />  // Render HealthCampEventList when navPath matches
              ) : (          
                <NewReportList />
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
}
