import React, { useEffect, useState } from "react";
import { fetchData, fetchUpdateData, fetchDeleteData } from "../../helpers/externapi";
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CommonTables from "../../Commoncomponents/CommonTables";
import TableContainer from '@mui/material/TableContainer';
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Layout from "../../Layout/Layout";

export default function ProductsCategoryList(props) {
    const [loading, setLoading] = useState(false);
    const [productsCategory, setProductsCategory] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({ ProductCategoryId: "", ProductCategoryName: "" });
    const [formErrors, setFormErrors] = useState({});
    const [totalCount, setTotalCount] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationData, setConfirmationData] = useState({});
    const tableHeads = ["Product Category Name", "Actions"];

    const tableElements = productsCategory.length > 0 ?
        productsCategory.map(productcategory => ([
            productcategory.ProductCategoryName,
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    style={customStyles.editButton}
                    onClick={() => handleEdit(productcategory)}
                >
                    Edit
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: 'darkred' } }}
                    onClick={() => handleDelete(productcategory.ProductCategoryId)}
                >
                    Delete
                </Button>
            </div>
        ])) : [];

    const getProductsCategory = async () => {
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            setLoading(true);
            const productsCategoryData = await fetchData("ProductCategory/all", { skip, take });
            setProductsCategory(productsCategoryData);
        } catch (error) {
            console.error("Error fetching product category data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProductsCategory();
        getProductCategoryCountData();
    }, [currentPage, perPage, totalCount]);

    const validateForm = () => {
        const errors = {};

        if (!formData.ProductCategoryName.trim()) {
            errors.ProductCategoryName = "Please Enter Product Category Name";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (productcategory) => {
        setIsEditMode(true);
        setFormVisible(true);
        setFormData({ ProductCategoryId: productcategory.ProductCategoryId, ProductCategoryName: productcategory.ProductCategoryName });
    };

    const handleAddNewEvent = () => {
        setIsEditMode(false);
        setFormVisible(true);
        setFormData({ ProductCategoryId: "", ProductCategoryName: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (validateForm()) {
            try {
                if (isEditMode) {
                    await fetchUpdateData("ProductCategory/update", {
                        productCategoryId: formData.ProductCategoryId,
                        productCategoryName: formData.ProductCategoryName
                    });
                    setSnackbarMessage("Product Category updated Successfully!");
                } else {
                    await fetchData("ProductCategory/add", {
                        productCategoryName: formData.ProductCategoryName
                    });
                    setSnackbarMessage("Product Category added Successfully!");
                }
                setSnackbarOpen(true);
                await getProductsCategory();
                setFormVisible(false);
                setFormData({ ProductCategoryId: "", ProductCategoryName: "" });
            } catch (error) {
                console.error("Error adding/updating product category:", error);
            } finally {
                setLoading(false);
                setIsEditMode(false);
            }
        } else {
            setLoading(false);
        }
    };

    const handleDelete = (productCategoryId) => {
        setConfirmationData({
            title: 'Delete Product Category',
            message: 'Are you sure you want to delete this Product Category?',
            onConfirm: () => confirmhandleDelete(productCategoryId),
        });
        setConfirmationOpen(true);
    };

    const confirmhandleDelete = async (productCategoryId) => {
        try {
            setLoading(true);
            setConfirmationOpen(false);
            await fetchDeleteData(`ProductCategory/delete/${productCategoryId}`);
            await getProductsCategory();
            setSnackbarMessage('product category deleted Successfully');
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error deleting event:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleClose = () => {
        setFormVisible(false);
        setFormErrors({});
    };

    const getProductCategoryCountData = async () => {
        setLoading(true);
        try {
            const eventCountData = await fetchData(`CommonRowCount/GetTableRowCount`, { tableName: "ProductCategory" });
            const totalCount = eventCountData[0]?.CountOfRecords || 0;
            setTotalCount(totalCount);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching hospital count data:", error);
            setLoading(false);
        }
    };


    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    const skeletonloading = () => (
        <>
            <style>{shimmerStyle}</style>
            <div className="shimmer-container shimmer">
                <h6 className="shimmer-text "></h6>
            </div>
            <table className="shimmer-container shimmer">
                <tbody>
                    {Array.from({ length: 6 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="shimmer-row">
                            {Array.from({ length: 6 }).map((_, colIndex) => (
                                <td key={colIndex} className="shimmer-cell">
                                    <h6 className="shimmer-text2 " ></h6>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

        </>
    )

    return (
        <Layout>
            {loading && skeletonloading()}
            {!loading && (
                <>
                    <div style={customStyles.container}>
                        <h2 style={customStyles.header}>Products Category List</h2>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddNewEvent}
                            style={customStyles.addButton}
                        >
                            Add Product Category
                        </Button>

                        <div className="card">
                            {loading ? (
                                <div style={customStyles.loadingContainer}>
                                    <CircularProgress />
                                </div>
                            ) : (
                                <CommonTables
                                    tableHeads={tableHeads}
                                    tableData={tableElements}
                                    perPage={perPage}
                                    currentPage={currentPage}
                                    perPageChange={handlePerPageChange}
                                    pageChange={handlePageChange}
                                    totalCount={totalCount}
                                />
                            )}
                        </div>

                        <TableContainer component={Paper}>
                            <ConfirmationDialogDelete
                                open={confirmationOpen}
                                title={confirmationData.title}
                                message={confirmationData.message}
                                onConfirm={confirmationData.onConfirm}
                                onCancel={() => setConfirmationOpen(false)}
                            />
                            <Snackbar
                                open={snackbarOpen}
                                autoHideDuration={6000}
                                onClose={handleSnackbarClose}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <Alert onClose={handleSnackbarClose} severity="success">
                                    {snackbarMessage}
                                </Alert>
                            </Snackbar>
                        </TableContainer>

                        <Dialog open={formVisible} onClose={handleClose} aria-labelledby="form-dialog-title">
                            <DialogTitle id="form-dialog-title">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="h6">{isEditMode ? "Update Product Category" : "Add Product Category"}</Typography>
                                    <IconButton onClick={handleClose} style={{ color: 'red' }}>
                                        ✖
                                    </IconButton>
                                </div>
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    {isEditMode ? "Update the details of the product category." : "Fill in the details of the new product category."}
                                </DialogContentText>
                                <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                                    <TextField
                                        name="ProductCategoryName"
                                        label="Product Category Name"
                                        value={formData.ProductCategoryName}
                                        onChange={onChangeHandler}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        margin="normal"
                                        error={!!formErrors.ProductCategoryName}
                                        helperText={formErrors.ProductCategoryName}
                                    />
                                    <DialogActions>
                                        <Button onClick={handleClose} color="primary">
                                            Cancel
                                        </Button>
                                        <Button variant="contained" color="primary" type="submit">
                                            {isEditMode ? "Update Product Category" : "Add Product Category"}
                                        </Button>
                                    </DialogActions>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </>
            )}
        </Layout>
    );
}

const shimmerStyle = `
     @keyframes shimmer {
    0% {
      background-position: -468px 0;
    }
    100% {
      background-position: 468px 0;
    }
  }

  .shimmer {
    animation-duration: 1.0s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: shimmer;
    animation-timing-function: linear;
    background:	#F7F7F7;
    background: linear-gradient(to right, #f0f0f0 8%, #fafafa 18%, #f0f0f0 33%);
    background-size: 1000px 104px;
    position: relative;
    overflow: hidden;
  }

  .shimmer-container {
    background-color: 	#F7F7F7;
    border-radius: 4px;
    height: 50px;
    width: 100%;
    margin: 15px;
  }

  .shimmer-text2 {
    background-color: #C8C8C8;
    border-radius: 4px;
    height: 15px;
    width: 55%;
    margin: 15px 0 0 15px;
     position:relative;
     left:10%;
     bottom:10%;
  }
  .shimmer-text {
    background-color: #C8C8C8;
    border-radius: 4px;
    height: 15px;
    width: 15%;
    margin: 15px 0 0 15px;
     
  }
 .shimmer-row {
    display: flex;
  }

  .shimmer-cell {
    flex: 1;
    padding: 10px;
    height: 50px;
    background-color: #F7F7F7;
    border-radius: 4px;
    margin: 5px;
  }
  
  `;

const customStyles = {
    container: {
        padding: '20px',
    },
    header: {
        marginBottom: '20px',
        textAlign: 'center',
    },
    addButton: {
        marginBottom: '20px',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
    },
    tableContainer: {
        overflowX: 'auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '10px',
        borderBottom: '2px solid #ddd',
        textAlign: 'left',
    },
    td: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
    },
    tdCenter: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        textAlign: 'center',
    },
    editButton: {
        marginRight: '10px',
    },
};
