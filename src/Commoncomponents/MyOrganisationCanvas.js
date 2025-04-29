import React, { useState, useEffect } from "react";
import { fetchData } from "../helpers/externapi";
import { MdExpandMore, MdExpandLess } from "react-icons/md";
import FilterCommonComponents from "./FilterCommonComponents";
import { formatDate1 } from "../Commoncomponents/CommonComponents";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import { ReactHiererchyChart } from "react-hierarchy-chart";

const styles = {
  orgStructureContainer: {
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#F4F5F7",
  },
  headerTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#2A2A2A",
    textAlign: "center",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "25px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderLeft: "4px solid #0078D4",
    transition: "all 0.3s ease",
    cursor: "pointer",
    ":hover": {
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
      transform: "scale(1.02)",
    },
  },
  nestedCard: {
    marginLeft: "20px",
    borderLeftColor: "#6264A7",
  },
  avatarContainer: {
    width: "56px",
    height: "56px",
    borderRadius: "28px",
    backgroundColor: "#0078D4",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "20px",
  },
  avatarText: {
    color: "white",
    fontSize: "20px",
    fontWeight: "bold",
  },
  employeeInfo: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
  },
  employeeName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333333",
    textOverflow: "ellipsis",
  },
  employeeRole: {
    fontSize: "16px",
    color: "#0078D4",
    margin: "0 0 4px 0",
  },
  employeeSales: {
    fontSize: "16px",
    color: "white",
    fontWeight: "bold",
    margin: "0",
    backgroundColor: "#0E94C3",
    padding: "6px 12px",
    borderRadius: "4px",
  },
  reportsContainer: {
    borderTop: "1px solid #E1DFDD",
    marginTop: "16px",
    paddingTop: "12px",
  },
  expandIcon: {
    cursor: "pointer",
    transition: "transform 0.3s ease",
    ":hover": {
      transform: "scale(1.2)",
    },
  },
  nodetemplate: {
    textAlign: "center",
  },

  empName: {
    display: "flex",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: "0.25em",
    justifyContent: "center",
  },
};

const ProfileAvatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={styles.avatarContainer}>
      <span style={styles.avatarText}>{initials}</span>
    </div>
  );
};

const OrgStructureCard: React.FC<{ employee: UserData, depth?: number }> = ({
  employee,
  depth = 0,
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const cardStyle = {
    ...styles.card,
    ...(depth > 0 ? styles.nestedCard : {}),
  };

  const handleUserClick = (userId) => {
    const url = `/dashboard/${userId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const navigate = useNavigate();

  const toggleCollapse = () => setCollapsed(!collapsed);

  return (
    <div>
      <div style={cardStyle}>
        <div
          className="d-flex justify-content-between align-items-center px-4 py-2"
          onClick={toggleCollapse}
        >
          <div className="d-flex align-items-center">
            <ProfileAvatar name={employee.fullName} />
            <div className="d-flex flex-column align-items-start">
              <div style={styles.employeeName}>{employee.fullName}</div>
              <div style={styles.employeeRole}>{employee.userRoleName}</div>
              {employee.empSales !== undefined && (
                <div className="d-flex flex-row align-items-center">
                  <div>
                    Own:
                    <span className="fw-bold fs-5 text-primary ms-2 mr-2">
                      {employee.empSales}
                    </span>
                    <span className="fs-5 ms-2">
                      ( <i className="bi bi-currency-rupee"></i>{" "}
                      {Number(employee.saleAmount).toLocaleString("en-IN")})
                    </span>
                  </div>
                  <span className="mx-2 fw-bold text-black fs-5">|</span>
                  <div>
                    Team:
                    <span className="fw-bold fs-5 text-primary ms-2 mr-2">
                      {employee.cumulativeSales}
                    </span>
                    <span className="fs-5 ms-2">
                      (<i className="bi bi-currency-rupee"></i>
                      {Number(employee.cumulativeSaleAmount).toLocaleString(
                        "en-IN"
                      )}
                      )
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="d-flex align-items-center">
            {employee.userId && (
              <a
                className="text-primary ms-auto"
                style={{ textDecoration: "underline" }}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default link behavior
                  e.stopPropagation(); // Prevent collapse toggle
                  handleUserClick(employee.userId);
                }}
              >
                View
              </a>
            )}
          </div>

          {employee.reports && employee.reports.length > 0 && (
            <div style={styles.expandIcon}>
              {collapsed ? (
                <MdExpandMore size={24} />
              ) : (
                <MdExpandLess size={24} />
              )}
            </div>
          )}
        </div>

        {/* Collapsible Reports */}
        {!collapsed && employee.reports && employee.reports.length > 0 && (
          <div style={styles.reportsContainer}>
            {employee.reports.map((report) => (
              <OrgStructureCard
                key={report.userId}
                employee={report}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MyOrganisationCanvas = () => {
  const [organization, setOrganization] = useState();
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("UserId");
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [startDate, setStartDate] = useState([]);
  const [filterOption, setFilterOption] = useState("Select Day");
  const [filterLoading, setFilterLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedWeekOption, setSelectedWeekOption] = useState("This Week");
  const [selectedDayOption, setSelectedDayOption] = useState("Today");
  const [displayDates, setDisplayDates] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (filterOption === "Select Month" && selectedMonth !== null) {
      handleFilterChange("Select Month");
    }
  }, [selectedMonth, filterOption]);

  useEffect(() => {
    if (filterOption === "Select Year" && selectedYear !== null) {
      handleFilterChange("Select Year");
    }
  }, [selectedYear, filterOption]);

  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        setFilterLoading(true);
        const response = await fetchData("lambdaAPI/Employee/GetMyOrg", {
          UserId: userId === "146" ? 155 : userId,
          StartDate: new Date(),
          EndDate: new Date(),
        });

        setDisplayDates({
          startDate: formatDate(new Date()),
          endDate: formatDate(new Date()),
        });
        setOrganization([response]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setFilterLoading(false);
      }
    };

    fetchOrgData();
  }, [userId]);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - 10 + i).filter(
      (year) => year <= currentYear
    );
  };

  const getMondayToSundayRange = (weeksAgo = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - distanceToMonday - weeksAgo * 7);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return { startOfWeek, endOfWeek };
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const handleWeekOptionChange = (value) => {
    setFilterLoading(true);
    setSelectedWeekOption(value);
    handleFilterChange("Select Week", value, undefined);
    setFilterLoading(false);
  };

  const handleDayOptionChange = (value) => {
    setFilterLoading(true);
    setSelectedDayOption(value);
    handleFilterChange("Select Day", undefined, value);
    setFilterLoading(false);
  };

  const handleFilterChange = async (
    option,
    weekOption = "This Week",
    dayOption = "Today"
  ) => {
    setFilterLoading(true);
    setFilterOption(option);
    let newStartDate = new Date();
    let newEndDate = new Date();

    if (option === "Select Day") {
      if (dayOption === "Today") {
        newStartDate = newEndDate = new Date();
      } else if (dayOption === "Yesterday") {
        newStartDate.setDate(newStartDate.getDate() - 1);
        newEndDate.setDate(newEndDate.getDate() - 1);
      } else if (dayOption === "Last 7 days") {
        newStartDate.setDate(newStartDate.getDate() - 6);
      } else if (dayOption === "Last 30 days") {
        newStartDate.setDate(newStartDate.getDate() - 30);
      } else if (dayOption === "Last 14 days") {
        newStartDate.setDate(newStartDate.getDate() - 14);
      }
    } else if (option === "Last 3 months") {
      newStartDate.setMonth(newStartDate.getMonth() - 3);
    } else if (option === "Last 6 months") {
      newStartDate.setMonth(newStartDate.getMonth() - 6);
    } else if (option === "Last Year") {
      newStartDate.setFullYear(newStartDate.getFullYear() - 1);
    } else if (option === "Select Month") {
      newStartDate = new Date(new Date().getFullYear(), selectedMonth, 1);
      newEndDate = new Date(new Date().getFullYear(), selectedMonth + 1, 0);
    } else if (option === "Select Year") {
      newStartDate = new Date(selectedYear, 0, 1);
      newEndDate = new Date(selectedYear, 11, 31);
    } else if (option === "Select Week") {
      if (weekOption === "This Week") {
        const { startOfWeek, endOfWeek } = getMondayToSundayRange(0);
        newStartDate = startOfWeek;
        newEndDate = endOfWeek;
      } else if (weekOption === "Last Week") {
        const { startOfWeek, endOfWeek } = getMondayToSundayRange(1);
        newStartDate = startOfWeek;
        newEndDate = endOfWeek;
      } else if (weekOption === "2nd Week") {
        const { startOfWeek, endOfWeek } = getMondayToSundayRange(2);
        newStartDate = startOfWeek;
        newEndDate = endOfWeek;
      } else if (weekOption === "3rd Week") {
        const { startOfWeek, endOfWeek } = getMondayToSundayRange(3);
        newStartDate = startOfWeek;
        newEndDate = endOfWeek;
      } else if (weekOption === "4th Week") {
        const { startOfWeek, endOfWeek } = getMondayToSundayRange(4);
        newStartDate = startOfWeek;
        newEndDate = endOfWeek;
      }
    } else if (option === "Custom") {
      setFilterLoading(false);
      return;
    }

    setDisplayDates({
      startDate: formatDate(newStartDate),
      endDate: formatDate(newEndDate),
    });

    try {
      const response = await fetchData("lambdaAPI/Employee/GetMyOrg", {
        UserId: userId === "146" ? 155 : userId,
        StartDate: formatDate(newStartDate),
        EndDate: formatDate(newEndDate),
      });

      setOrganization([response]);
    } catch (error) {
      console.error("Error fetching filtered progress data:", error);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleCustomDateChange = async () => {
    if (startDate && startDate.length === 2) {
      setFilterLoading(true);
      setDisplayDates({
        startDate: formatDate(startDate[0]),
        endDate: formatDate(startDate[1]),
      });
      try {
        const response = await fetchData("lambdaAPI/Employee/GetMyOrg", {
          UserId: userId === "146" ? 155 : userId,
          StartDate: formatDate(startDate[0]),
          EndDate: formatDate(startDate[1]),
        });
        setOrganization([response]);
      } catch (error) {
        console.error("Error fetching filtered progress data:", error);
      } finally {
        setFilterLoading(false);
      }
    }
  };

  return (
    <>
      {filterLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100px",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        <div style={styles.orgStructureContainer}>
          <div style={styles.headerTitle}>Organization Structure</div>
          <div className="col-md-12 mb-2">
            <h3>Filter</h3>
            {displayDates.startDate ? (
              <h5>
                {" "}
                Dates: ({formatDate1(displayDates.startDate)} to{" "}
                {formatDate1(displayDates.endDate)}){" "}
              </h5>
            ) : null}
            <FilterCommonComponents
              filterOption={filterOption}
              handleFilterChange={handleFilterChange}
              setFilterOption={setFilterOption}
              selectedWeekOption={selectedWeekOption}
              selectedDayOption={selectedDayOption}
              handleDayOptionChange={handleDayOptionChange}
              handleWeekOptionChange={handleWeekOptionChange}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              startDate={startDate}
              setStartDate={setStartDate}
              months={months}
              generateYears={generateYears}
              handleCustomDateChange={handleCustomDateChange}
            />
          </div>
          {filterLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
              }}
            >
              <CircularProgress />
            </div>
          ) : (
            organization && (
              <>
                <div style={{overflow: 'auto'}}>
                  <ReactHiererchyChart
                    nodes={organization}
                    direction="vertical"
                    randerNode={(node) => {
                      return (
                        <div style={styles.nodetemplate}>
                          <span style={styles.empName}>{node.fullName} </span>
                          <span style={styles.empName}>{node.userRoleName} </span>
                        </div>
                      );
                    }}
                  />
                </div>
              </>
            )
            // <OrgStructureCard employee={organization} />
          )}
        </div>
      )}
    </>
  );
};

export default MyOrganisationCanvas;
