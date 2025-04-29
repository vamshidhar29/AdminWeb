import React, {useEffect} from "react";
import Flatpickr from "react-flatpickr";

const FilterCommonComponents = (props) => {

    const getMondayToSundayRange = (weeksAgo = 0) => {
        const now = new Date();
        const currentDay = now.getDay();
        const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - distanceToMonday - (weeksAgo * 7));

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return { startOfWeek, endOfWeek };
    };

 
    
    

    const { 
    filterOption,
    handleFilterChange,
    selectedDayOption,
    selectedWeekOption,
    handleDayOptionChange,
    handleWeekOptionChange,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    startDate,
    setStartDate,
    months,
    generateYears,
    handleCustomDateChange,
 
} = props    




    return (
        <div className="d-flex flex-row align-items-center flex-wrap">
            <div className="col-3 me-2">
                <select
                    className="form-select"
                    value={filterOption}
                    onChange={(e) => handleFilterChange(e.target.value)}
                >
                    {/*<option value="Today">Today</option>*/}
                    {/*<option value="Yesterday">Yesterday</option>*/}
                    {/*<option value="Last 7 days">Last 7 Days</option>*/}
                    {/*<option value="Last 14 days">Last 14 Days</option>*/}
                    {/*<option value="Last 30 days">Last 30 Days</option>*/}
                    <option value="Select Day">Select Day</option>
                    <option value="Last 3 months">Last 3 Months</option>
                    <option value="Last 6 months">Last 6 Months</option>
                    <option value="Last Year">Last Year</option>
                    <option value="Select Week">Select Week</option>
                    <option value="Select Month">Select Month</option>
                    <option value="Select Year">Select Year</option>
                    <option value="Custom">Custom Date Range</option>
                </select>
            </div>

            <div className="d-flex align-items-center">
                <button
                    className={`btn btn-outline-primary me-2 ${filterOption === "Select Day" ? "active" : ""
                        }`}
                    onClick={() => handleFilterChange("Select Day", selectedDayOption)}
                >
                    Day
                </button>
                <button
                    className={`btn btn-outline-primary me-2 ${filterOption === "Select Week" ? "active" : ""
                        }`}
                    onClick={() => handleFilterChange("Select Week", selectedWeekOption)}
                >
                    Week
                </button>
                <button
                    className={`btn btn-outline-primary me-2 ${filterOption === "Select Month" ? "active" : ""
                        }`}
                    onClick={() => handleFilterChange("Select Month")}
                >
                    Month
                </button>
                <button
                    className={`btn btn-outline-primary me-2 ${filterOption === "Select Year" ? "active" : ""
                        }`}
                    onClick={() => handleFilterChange("Select Year")}
                >
                    Year
                </button>
            </div>


            {filterOption === "Select Week" && (
                <div className="col-2">
                    <select
                        className="form-select"
                        value={selectedWeekOption}
                        onChange={(e) => handleWeekOptionChange(e.target.value)}
                    >
                        {Array.from({ length: 5 }, (_, i) => {
                            const { startOfWeek, endOfWeek } = getMondayToSundayRange(i);

                            // Format the start and end dates in dd/mm/yyyy format
                            const formattedStartDate = new Date(startOfWeek).toLocaleDateString("en-GB"); // en-GB locale for dd/mm/yyyy
                            const formattedEndDate = new Date(endOfWeek).toLocaleDateString("en-GB");

                            // Define individual week titles like "This Week", "Last Week", etc.
                            const titles = [
                                "This Week",
                                "Last Week",
                                "2nd Week",
                                "3rd Week",
                                "4th Week"
                            ];

                            const optionLabel = `${titles[i]} (${formattedStartDate} - ${formattedEndDate})`;

                            return (
                                <option key={i} value={titles[i]}>
                                    {optionLabel}
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}

            {filterOption === "Select Day" && (
                <div className="col-2">
                    <select
                        className="form-select"
                        value={selectedDayOption}
                        onChange={(e) => handleDayOptionChange(e.target.value)}
                    >
                        <option value="Today">Today</option>
                        <option value="Yesterday">Yesterday</option>
                        <option value="Last 7 days">Last 7 Days</option>
                        <option value="Last 14 days">Last 14 Days</option>
                        <option value="Last 30 days">Last 30 Days</option>
                    </select>
                </div>
            )}

{filterOption === "Select Month" && (
    <div className="col-md-2 col-2 my-1">
        <select
            className="form-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
            {months.map((month, index) => (
                <option key={index} value={index}>
                    {month}
                </option>
            ))}
        </select>
    </div>
)}

{filterOption === "Select Year" && (
    <div className="col-md-2 col-2 my-1">
        <select
            className="form-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
            {generateYears().map((year) => (
                <option key={year} value={year}>
                    {year}
                </option>
            ))}
        </select>
    </div>
)}







          


            {filterOption === "Custom" && (
                <div className="d-flex align-items-center">
                    <div className="col-6 mb-4 my-1 me-2">
                        <label htmlFor="flatpickr-range" className="form-label">
                            Select multiple dates
                        </label>
                        <Flatpickr
                            id="flatpickr-range"
                            className="form-control"
                            placeholder="YYYY-MM-DD to YYYY-MM-DD"
                            value={startDate}
                            options={{
                                mode: "range",
                                dateFormat: "Y-m-d",
                            }}
                            onChange={(selectedDates) => {
                                if (selectedDates.length === 2) {
                                    setStartDate(selectedDates);
                                }
                            }}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleCustomDateChange}>
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
};

export default FilterCommonComponents;
