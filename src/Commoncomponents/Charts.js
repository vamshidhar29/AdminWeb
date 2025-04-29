import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'react-apexcharts'; 
import { ChartButton } from '../Commoncomponents/DashboardCommonComponents';

const ChartCard = ({
    title,
    iconClass,
    chartType,
    filterOption,
    onChartTypeChange,
    onFilterChange,
    isLoading,
    chartOptions,
    chartSeries,
    categories,
    colors,
}) => {
    return (
        <div className="col-md-6">
            <div className="card shadow mb-4" style={{ zIndex: 1, height: '490px' }}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="card-title">
                            <i className={iconClass} style={{ marginRight: '10px' }}></i>
                            {title}
                        </h5>
                        <div className="d-flex justify-content-end mb-2">
                            <ChartButton
                                label="Line"
                                onClick={() => onChartTypeChange("line")}
                                variant="primary"
                            />
                            <ChartButton
                                label="Area"
                                onClick={() => onChartTypeChange("area")}
                                variant="success"
                            />
                            <ChartButton
                                label="Bar"
                                onClick={() => onChartTypeChange("bar")}
                                variant="warning"
                            />
                        </div>
                    </div>
                    <div className="d-flex align-items-center">
                        <ChartButton
                            label="Day"
                            isActive={filterOption === "daily"}
                            onClick={() => onFilterChange("daily")}
                        />
                        <ChartButton
                            label="Week"
                            isActive={filterOption === "weekly"}
                            onClick={() => onFilterChange("weekly")}
                        />
                        <ChartButton
                            label="Month"
                            isActive={filterOption === "monthly"}
                            onClick={() => onFilterChange("monthly")}
                        />
                        <ChartButton
                            label="Year"
                            isActive={filterOption === "yearly"}
                            onClick={() => onFilterChange("yearly")}
                        />
                    </div>
                    {!isLoading ? (
                        <Chart
                            key={chartType}
                            options={{
                                ...chartOptions,
                                xaxis: {
                                    ...chartOptions.xaxis,
                                    categories: categories || [],
                                },
                                colors: colors || [],
                            }}
                            series={chartSeries}
                            type={chartType}
                            height={350}
                        />
                    ) : (
                        <div className="d-flex flex-column justify-content-center align-items-center h-100">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

ChartCard.propTypes = {
    title: PropTypes.string.isRequired,
    iconClass: PropTypes.string.isRequired,
    chartType: PropTypes.string.isRequired,
    filterOption: PropTypes.string.isRequired,
    onChartTypeChange: PropTypes.func.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    chartOptions: PropTypes.object.isRequired,
    chartSeries: PropTypes.array.isRequired,
    categories: PropTypes.array,
    colors: PropTypes.array,
};

export default ChartCard;