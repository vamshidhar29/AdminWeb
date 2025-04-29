import React, { useState, useEffect } from 'react';
import { fetchAllData, fetchData } from '../../helpers/externapi';
import Chart from 'react-apexcharts';
import ChartCard from '../../Commoncomponents/Charts';


export default function ProgressCharts() {

    const [monthWiseCount, setMonthWiseCount] = useState([]);
    const [filterMemberOption, setFilterMemberOption] = useState('monthly');
    const [filterHospitalOption, setFilterHospitalOption] = useState('monthly');
    const [filterHospServOption, setFilterHospServOption] = useState('monthly');
    const [filterCardOption, setFilterCardOption] = useState('monthly');
    const [filterSaleOption, setFilterSaleOption] = useState('monthly');
    const [saleAmountCount, setSaleAmountCount] = useState([]);
    const [hospitalCount, setHospitalCount] = useState([]);
    const [hospitalServCount, setHospitalServCount] = useState([]);
    const [cardsCount, setCardsCount] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hospLoading, setHospLoading] = useState(true);
    const [hospServLoading, setHospServLoading] = useState(true);
    const [CardLoading, setCardLoading] = useState(true);
    const [saleLoading, setSaleLoading] = useState(true);

    const [chartTypes, setChartTypes] = useState({
        members: "bar",
        hospitals: "bar",
        servHospital: "bar",
        privilegeSales: "bar",
        privilegeAmount: "bar",
    });

    const handleChartTypeChange = (key, type) => {
        setChartTypes((prevChartTypes) => ({
            ...prevChartTypes,
            [key]: type,
        }));
    };
    const progressLabels = {
        AdvisorCount: 'Advisors',
        MemberCount: 'Customers',
        HospitalCount: 'Network Hospitals',
        ServCustomer: 'Served Customers',
        CardCount: 'Sold OHO Cards',
        TotalAmount: 'Sold Cards amount',
    };
    const chartOptions = {
        chart: {
            toolbar: {
                show: false,
            },
            foreColor: '#566a7f',
            zoom: {
                enabled: false,
            },
            animations: {
                enabled: true,
                easing: 'easeIn',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150,
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350,
                },
            },
        },
        grid: {
            borderColor: '#f1f3fa',
        },
        xaxis: {
            labels: {
                style: {
                    colors: '#808080',
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#808080',
                },
            },
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        dataLabels: {
            enabled: false,
        },
        colors: ['#1E90FF', '#32CD32', '#FFA07A', '#20B2AA'],
    };
    useEffect(() => {
        const fetchDashboardData = async (tabName, setData, setLoading) => {
            try {
                setLoading(true);
                const dashboardCounts = await fetchData('Dashboard/DashboardGraphsCount', { TabName: tabName, "type": "monthly" });
                setData(dashboardCounts);
            } catch (error) {
                console.error(`Error fetching data for ${tabName}:`, error);
            } finally {
                setLoading(false);
            }
        };

        const dashboardConfigs = [
            {
                tabName: 'DashBoardMemberCounts',
                setData: setMonthWiseCount,
                setLoading: setLoading,
            },
            {
                tabName: 'DashBoardHospitalCounts',
                setData: setHospitalCount,
                setLoading: setHospLoading,
            },
            {
                tabName: 'DashboardHospServCount',
                setData: setHospitalServCount,
                setLoading: setHospServLoading,
            },
            {
                tabName: 'OHOCardsCountDashboard',
                setData: setCardsCount,
                setLoading: setCardLoading,
            },
            {
                tabName: 'SalesAmountDashboard',
                setData: setSaleAmountCount,
                setLoading: setSaleLoading,
            },
        ];

        dashboardConfigs.forEach(({ tabName, setData, setLoading }) =>
            fetchDashboardData(tabName, setData, setLoading)
        );
    }, []);

    const handleFilter = async (daily, tabName, setFilterFn, setLoadingFn, setDataFn) => {
        setFilterFn(daily);
        try {
            setLoadingFn(true);
            const dashboardCounts = await fetchData('Dashboard/DashboardGraphsCount', {
                type: daily,
                TabName: tabName,
            });
            setDataFn(dashboardCounts);
        } catch (error) {
            console.error(`Error fetching data for TabName: ${tabName} :`, error);
        } finally {
            setLoadingFn(false);
        }
    };

    const handleMemberFilter = (daily) =>
        handleFilter(daily, 'DashBoardMemberCounts', setFilterMemberOption, setLoading, setMonthWiseCount);

    const handleHospFilter = (daily) =>
        handleFilter(daily, 'DashBoardHospitalCounts', setFilterHospitalOption, setHospLoading, setHospitalCount);

    const handleHospServFilter = (daily) =>
        handleFilter(daily, 'DashboardHospServCount', setFilterHospServOption, setHospServLoading, setHospitalServCount);

    const handleCardFilter = (daily) =>
        handleFilter(daily, 'OHOCardsCountDashboard', setFilterCardOption, setCardLoading, setCardsCount);

    const handleSaleFilter = (daily) =>
        handleFilter(daily, 'SalesAmountDashboard', setFilterSaleOption, setSaleLoading, setSaleAmountCount);



    return (
        <div className="row mt-3">
            {/* Business Statistics Header */}
            <h3 style={{ color: '#ff8000' }}>
                Business statistics
                <i className="bi bi-graph-up-arrow" style={{ color: '#32CD32', marginLeft: '12px' }}></i>
            </h3>
            {/* Chart Cards */}
            {[
                {
                    title: "Members",
                    iconClass: "bi bi-people",
                  //  iconColor: "#1E90FF",
                    chartType: chartTypes.members,
                    filterOption: filterMemberOption,
                    onChartTypeChange: (type) => handleChartTypeChange("members", type),
                    onFilterChange: (filter) => handleMemberFilter(filter),
                    isLoading: loading,
                    chartSeries: [
                        {
                            name: progressLabels.AdvisorCount,
                            data: monthWiseCount.map((item) => item.AdvisorCount || 0),
                        },
                        {
                            name: progressLabels.MemberCount,
                            data: monthWiseCount.map((item) => item.MemberCount || 0),
                        },
                    ],
                    categories: monthWiseCount?.map((item) => item?.RegisterOn),
                   // categories: ['Advisor','Customer'],
                    colors: ["#1E90FF", "#FF4500"],
                },
                {
                    title: "Hospitals",
                    iconClass: "bi bi-hospital",
                   // iconColor: "#32CD32",
                    chartType: chartTypes.hospitals,
                    filterOption: filterHospitalOption,
                    onChartTypeChange: (type) => handleChartTypeChange("hospitals", type),
                    onFilterChange: (filter) => handleHospFilter(filter),
                    isLoading: hospLoading,
                    chartSeries: [
                        {
                            name: progressLabels.HospitalCount,
                            data: hospitalCount.map((item) => item.HospitalCount || 0),
                        },
                    ],
                    categories: hospitalCount?.map((item) => item?.HospRegisterOn),
                    colors: ["#32CD32"],
                },
                {
                    title: "Customers Served",
                    iconClass: "bi bi-heart-pulse",
                   // iconColor: "#ff00bf",
                    chartType: chartTypes.servHospital,
                    filterOption: filterHospServOption,
                    onChartTypeChange: (type) => handleChartTypeChange("servHospital", type),
                    onFilterChange: (filter) => handleHospServFilter(filter),
                    isLoading: hospServLoading,
                    chartSeries: [
                        {
                            name: progressLabels.ServCustomer,
                            data: hospitalServCount.map((item) => item.BookingCount || 0),
                        },
                    ],
                    categories: hospitalServCount?.map((item) => item?.BookingRegisterOn),
                    colors: ["#ff00bf"],
                },
                {
                    title: "Cards",
                    iconClass: "bi bi-person-vcard-fill",
                   // iconColor: "#4da6ff",
                    chartType: chartTypes.privilegeSales,
                    filterOption: filterCardOption,
                    onChartTypeChange: (type) => handleChartTypeChange("privilegeSales", type),
                    onFilterChange: (filter) => handleCardFilter(filter),
                    isLoading: CardLoading,
                    chartSeries: [
                        {
                            name: progressLabels.CardCount,
                            data: cardsCount.map((item) => item.CardCount || 0),
                        },
                    ],
                    categories: cardsCount?.map((item) => item?.CardRegisterOn),
                    colors: ["#4da6ff"],
                },
                {
                    title: "Sales Amount",
                    iconClass: "bi bi-cash-coin",
                   // iconColor: "$warning",
                    chartType: chartTypes.privilegeAmount,
                    filterOption: filterSaleOption,
                    onChartTypeChange: (type) => handleChartTypeChange("privilegeAmount", type),
                    onFilterChange: (filter) => handleSaleFilter(filter),
                    isLoading: saleLoading,
                    chartSeries: [
                        {
                            name: progressLabels.TotalAmount,
                            data: saleAmountCount.map((item) => item.TotalAmount || 0),
                        },
                    ],
                    categories: saleAmountCount?.map((item) => item?.SaleRegisterOn),
                    colors: ["#ff9933"],
                },
            ].map((chart, index) => (
                <ChartCard
                    key={index}
                    title={chart.title}
                    iconClass={chart.iconClass}
                    //iconStyle={{ color: chart.iconColor }}
                    chartType={chart.chartType}
                    filterOption={chart.filterOption}
                    onChartTypeChange={chart.onChartTypeChange}
                    onFilterChange={chart.onFilterChange}
                    isLoading={chart.isLoading}
                    chartOptions={chartOptions}
                    chartSeries={chart.chartSeries}
                    categories={chart.categories}
                    colors={chart.colors}
                />
            ))}
        </div>
    );


};
