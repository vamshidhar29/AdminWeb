import React from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";

const CommonTables = (props) => {
    const {
        tableHeads,
        tableData,
        perPage,
        currentPage,
        perPageChange,
        pageChange,
        totalCount,
    } = props;

    const totalPages = Math.ceil(totalCount / perPage);

    return (
        <Box>
            {/* Responsive Table Container */}
            <TableContainer
                component={Paper}
                elevation={4}
                sx={{
                    overflowX: "auto",
                    boxShadow: "none",
                }}
            >
                <Table sx={{ minWidth: 650 }} aria-label="responsive table">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "primary.main" }}>
                            {tableHeads.map((head, index) => (
                                <TableCell
                                    key={`header-${index}`}
                                    align="center"
                                    sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "0.875rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                        border: "none",
                                        py: 1.5,
                                    }}
                                >
                                    {head}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.map((row, rowIndex) => (
                            <TableRow
                                key={row.MemberId || `row-${rowIndex}`}
                                sx={{
                                    backgroundColor: "white",
                                    transition: "background-color 0.3s ease",
                                    "&:hover": { backgroundColor: "grey.100" },
                                }}
                            >
                                {row.map((data, colIndex) => (
                                    <TableCell
                                        key={`${row.MemberId || rowIndex}-${colIndex}`}
                                        align="center"
                                        sx={{
                                            fontSize: "1rem", // Adjusted for clarity
                                            fontFamily: "'Calibri', sans-serif", // Using Calibri font
                                            color: "#333", // Dark text for good contrast
                                            borderBottom: "1px solid #ddd",
                                            py: 1.2, // Extra vertical padding for a more open feel
                                        }}
                                    >
                                        {data}
                                    </TableCell>
                                ))}



                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Responsive Footer: Pagination & Entries Selector */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                    px: 2,
                    gap: 1,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: { xs: "center", md: "flex-start" },
                        width: { xs: "100%", md: "auto" },
                    }}
                >
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="per-page-label">Show entries</InputLabel>
                        <Select
                            labelId="per-page-label"
                            id="per-page-select"
                            value={perPage}
                            label="Show entries"
                            onChange={perPageChange}
                            sx={{
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.dark" },
                            }}
                        >
                            {[10, 15, 20, 25, 50, 75, 100, 500, 1000].map((num) => (
                                <MenuItem key={num} value={num}>
                                    {num}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Typography variant="body2" sx={{ ml: { xs: 0, md: 2 }, mt: { xs: 1, md: 0 } }}>
                        Total Records: <strong>{totalCount}</strong>
                    </Typography>
                </Box>
                <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={pageChange}
                    variant="outlined"
                    shape="rounded"
                    color="primary"
                    showFirstButton
                    showLastButton
                />
            </Box>
        </Box>
    );
};

export default CommonTables;
