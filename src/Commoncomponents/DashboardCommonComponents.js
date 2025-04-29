import React from 'react';

export const ChartButton = ({ label, isActive, onClick, variant = "primary" }) => {
    return (
        <button
            className={`btn btn-outline-${variant} me-2 ${isActive ? "active" : ""}`}
            onClick={onClick}
        >
            {label}
        </button>
    );
};
