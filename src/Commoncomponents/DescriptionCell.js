import React, { useState } from "react";
import Tooltip from '@mui/material/Tooltip';

const DescriptionCell = ({ description }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    // if (!description) {
    //     return <span>No description available</span>;
    // }

    const truncatedDescription = description && description.length > 25 ? `${description.slice(0, 25)}` : description;

    return (
        <div>
            <span
                onClick={toggleExpansion}
                style={{ cursor: 'pointer' }}
            >
                {isExpanded ? description : truncatedDescription}
                {description && description.length > 30 && !isExpanded && (
                    <Tooltip title={description} arrow>
                        <span style={{ cursor: 'pointer' }}>...</span>
                    </Tooltip>
                )}
            </span>
        </div>
    );
};

export default DescriptionCell;