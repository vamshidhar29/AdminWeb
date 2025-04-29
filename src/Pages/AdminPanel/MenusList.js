import React, { useEffect, useState } from "react";
import CircularProgress from '@mui/material/CircularProgress';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { fetchData, fetchUpdateData, fetchDeleteData, fetchAllData } from "../../helpers/externapi";
import ConfirmationDialogDelete from "../../Components/ConfirmationDialogDelete";
import CommonTables from "../../Commoncomponents/CommonTables";
import Layout from "../../Layout/Layout";

export default function MenuList() {
    const [loading, setLoading] = useState(false);
    const [menuList, setMenuList] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [openSubMenuDialog, setOpenSubMenuDialog] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        menuName: "",
        subMenu: "",
        path: "",
        sortOrder: "",
        iconImages: "",
        isMainMenu: true,
        selectedRoles: []
    });
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [confirmationData, setConfirmationData] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [subMenuData, setSubMenuData] = useState({
        menuName: '',
        subMenu: '',
        path: '',
        iconImages:'',
        menusId:'',
        sortOrder:''
    });
    const [totalCount, setTotalCount] = React.useState(0);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);
    const [userRoles, setUserRoles] = useState([]);


    const tableHeads = ["Menu Name", "Path", "Sub Menus", "Actions"];

    const tableElements = menuList.length > 0 ?
        menuList.map(menu => ([
            menu.menuName,
            menu.path,
            menu.subMenus && menu.subMenus.length > 0 ? (
                <ul>
                    {menu.subMenus.map((subMenu) => (

                        <li key={subMenu.menusId}>
                            {subMenu.subMenu}
                            <Button
                                color="secondary"
                                onClick={() => handleDeleteSubMenu(menu.menusId, subMenu.menusId)}
                            >
                                Delete
                            </Button>
                            <Button
                             color="secondary"
                             onClick={() => handleEditSubMenu(menu, subMenu)}
                         >
                             Edit
                         </Button>
                         </li>
                       
                    
                    ))}
                </ul>
            ) : (
                "No sub menus"
            ),
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button variant="contained" color="primary" onClick={() => handleEdit(menu)} size="small" style={{ marginRight: '10px' }}>
                    Edit
                </Button>
                <Button variant="contained" color="secondary" onClick={() => handleDeleteMenu(menu.menusId)} size="small" style={{ marginRight: '10px' }}>
                    Delete
                </Button>
                <Button variant="contained" color="info" onClick={() => handleOpenSubMenuDialog(menu)} size="small">
                    Add Sub Menu
                </Button>
            </div>
        ])) : [];

    const getMenuList = async () => {
        try {
            const skip = (currentPage - 1) * perPage;
            const take = perPage;

            setLoading(true);

            const menuDataCount = await fetchData("Menus/all", { "sortField": "SortOrder", "sortOrder": "asc" })
            setTotalCount(menuDataCount.length);

            const menuData = await fetchData("Menus/all", { "sortField": "SortOrder", "sortOrder": "asc", skip, take });
            setMenuList(menuData);


        } catch (error) {
            console.error("Error fetching menu data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getMenuList();
    }, [currentPage, perPage]);

    const onChangeHandler = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
        }));
    };

    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                const roles = await fetchData("UserRoles/all", { "skip": 0, "take": 0 });
                setUserRoles(roles);
            } catch (error) {
                console.error("Error fetching user roles:", error);
            }
        };

        fetchUserRoles();
    }, []);

    const handleEdit = async (menu) => {
        setIsEditMode(true);
        setOpenDialog(true);

        try {


            const rolesResponse = await fetchAllData(`Menus/GetUserRolesByMenu/${menu.menusId}`);


            const activeRoles = rolesResponse.map(role => role.UserRoleId);

            setFormData({
                menusId: menu.menusId,
                menuName: menu.menuName,
                path: menu.path,
                subMenu: menu.subMenu,
                sortOrder: menu.sortOrder,
                iconImages: menu.iconImages,
                isMainMenu: menu.isMainMenu,
                selectedRoles: activeRoles || [],
            });
        } catch (error) {
            console.error("Error fetching user roles for menu:", error);
        }
    };

    const handleEditSubMenu = async (menu, subMenu) => {
        setIsEditMode(true);
        setOpenSubMenuDialog(true);


        try {


           

            setSubMenuData({
                menusId: subMenu.menusId,
               menuName: menu.menuName, subMenu: subMenu.subMenu, path:subMenu.path, iconImages:subMenu.iconImages, sortOrder:subMenu.sortOrder
               
            });
        } catch (error) {
            console.error("Error fetching user roles for menu:", error);
        }
    };

    const handleDeleteMenu = (menusId) => {
        setConfirmationData({
            title: 'Delete Menu',
            message: 'Are you sure you want to delete this menu?',
            onConfirm: () => confirmDeleteMenu(menusId),
        });
        setConfirmationOpen(true);
    };

    const confirmDeleteMenu = async (menusId) => {
        setConfirmationOpen(false);
        try {
            setLoading(true);
            await fetchDeleteData(`Menus/delete/${menusId}`);
            getMenuList();
            setSnackbarMessage('Menu deleted Successfully');
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error deleting menu:", error);
            setSnackbarMessage('Failed to delete menu');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubMenu = (menusId, subMenuId) => {
        setConfirmationData({
            title: 'Delete Sub-menu',
            message: 'Are you sure you want to delete this sub-menu?',
            onConfirm: () => confirmDeleteSubMenu(subMenuId),
        });
        setConfirmationOpen(true);
    };

    const confirmDeleteSubMenu = async (subMenuId) => {
        setConfirmationOpen(false);
        try {
            setLoading(true);
            await fetchDeleteData(`Menus/delete/${subMenuId}`);
            getMenuList();
            setSnackbarMessage('Sub-menu deleted successfully!');
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error deleting sub-menu:", error);
            setSnackbarMessage('Failed to delete sub-menu.');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = () => {
        setIsEditMode(false);
        setFormData({
            menuName: "",
            subMenu: "",
            path: "",
            iconImages:"",
            sortOrder: "",
            isMainMenu: true,
            selectedRoles: []
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleOpenSubMenuDialog = (menu) => {
        setSelectedMenu(menu);
        setSubMenuData({ menuName: menu.menuName, subMenu: '', path: '', iconImages:'', sortOrder:'' });
        setOpenSubMenuDialog(true);
    };

    const handleCloseSubMenuDialog = () => {
        setOpenSubMenuDialog(false);
    };

    useEffect(() => {
        if (!openSubMenuDialog) {
            setErrors({});
        }
    }, [openSubMenuDialog]);

    const validateForm = () => {
        let tempErrors = {};
        tempErrors.menuName = formData.menuName ? "" : "Please Enter Menu Name.";
        tempErrors.path = formData.path ? "" : "Please Enter Path.";
        if (!isEditMode) {
            tempErrors.sortOrder = formData.sortOrder ? "" : "Please Enter Sort Order.";
        }
        setErrors(tempErrors);
        return Object.values(tempErrors).every(x => x === "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setLoading(true);
            try {
                let menus;
                if (isEditMode) {
                    menus = await fetchUpdateData("Menus/update", formData);
                    setSnackbarMessage("Menu updated successfully!");

                    let menusId = menus.menusId;

                    const roleAssignments = formData.selectedRoles.map(roleId => ({
                        userRoleId: roleId,
                        menusId: menusId,
                        sortOrder: formData.sortOrder,
                        iconImages: formData.iconImages,
                        isActive: true
                    }));
                    const userRolesData = await fetchData("RoleMenu/updateUserRoleByMenu", roleAssignments);;

                } else {
                    menus = await fetchData("Menus/add", formData);
                    setSnackbarMessage("Menu added successfully!");

                    let menusId = menus.menusId;

                    const roleAssignments = formData.selectedRoles.map(roleId => ({
                        userRoleId: roleId,
                        menusId: menusId,
                        sortOrder: formData.sortOrder,
                        iconImages: formData.iconImages,
                        isActive: true
                    }));
                    const userRolesData = await fetchData("RoleMenu/AddingMenuUserRole", roleAssignments);;
                }

                setSnackbarOpen(true);
                await getMenuList();
            } catch (error) {
                console.error("Error adding/updating menu:", error);
            } finally {
                setLoading(false);
                handleCloseDialog();

            }
        }
    };

    useEffect(() => {
        if (selectedMenu) {
            setSubMenuData(prevState => ({
                ...prevState,
                menuName: selectedMenu.menuName
            }));
        }
    }, [selectedMenu]);

    const handleSubMenuChange = (e) => {
        const { name, value } = e.target;
        setSubMenuData(prevState => ({
            ...prevState,
            [name]: value
        }));

        setErrors({
            ...errors,
            [name]: ""
        });
    };

    const validateSubMenuForm = () => {
        let tempErrors = {};
        tempErrors.menuName = subMenuData.menuName ? "" : "Please Enter Menu Name.";
        tempErrors.subMenu = subMenuData.subMenu ? "" : "Please Enter Sub Menu.";
        tempErrors.path = subMenuData.path ? "" : "Please Enter Path.";
        if (!isEditMode) {
            tempErrors.sortOrder = subMenuData.sortOrder ? "" : "Please Enter Sort Order.";
        }
        setErrors(tempErrors);
        return Object.values(tempErrors).every(x => x === "");
    };

    const handleSubMenuSubmit = async (e) => {
        e.preventDefault();
        if (validateSubMenuForm()) {
            setLoading(true);
            try {
                const { menusId, menuName, subMenu, path, iconImages, sortOrder } = subMenuData;
                const subMenuFormData = { menusId, menuName, subMenu, path, iconImages, sortOrder};

                if (isEditMode) {
                    const subMenu = await fetchUpdateData("Menus/update", subMenuFormData);
                    setSnackbarMessage("Sub-menu updated successfully!");
                } else {
                    const subMenu = await fetchData("Menus/add", subMenuFormData);
                    setSnackbarMessage("Sub-menu added successfully!");
                }
                setSnackbarOpen(true);
                await getMenuList();
            } catch (error) {
                console.error("Error adding/updating sub-menu:", error);
            } finally {
                setLoading(false);
                handleCloseSubMenuDialog();
            }
        }
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleRoleChange = (roleId) => {
        setFormData(prevState => {
            const selectedRoles = prevState.selectedRoles.includes(roleId)
                ? prevState.selectedRoles.filter(id => id !== roleId)
                : [...prevState.selectedRoles, roleId];
            return { ...prevState, selectedRoles };
        });
    };

    const handlePageChange = (event, page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (event) => {
        setPerPage(parseInt(event.target.value, 10));
        setCurrentPage(1);
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>
                Menus List
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpenDialog}>
                Add Menu
            </Button>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>{isEditMode ? "Update Menu" : "Add Menu"}</DialogTitle>
                <DialogContent>
                    <form noValidate autoComplete="off" onSubmit={handleSubmit}>
                        <TextField
                            name="menuName"
                            label="Menu Name"
                            value={formData.menuName}
                            onChange={onChangeHandler}
                            variant="outlined"
                            size="small"
                            fullWidth
                            margin="normal"
                            error={!!errors.menuName}
                            helperText={errors.menuName}
                        />

                        <TextField
                            name="path"
                            label="Path"
                            value={formData.path}
                            onChange={onChangeHandler}
                            variant="outlined"
                            size="small"
                            fullWidth
                            margin="normal"
                            error={!!errors.path}
                            helperText={errors.path}
                        />
                        <TextField
                            name="sortOrder"
                            type="tel"
                            label="Sort Order"
                            value={formData.sortOrder}
                            onChange={onChangeHandler}
                            variant="outlined"
                            maxLength={1}
                            size="small"
                            fullWidth
                            margin="normal"
                            error={!!errors.sortOrder}
                            helperText={errors.sortOrder}
                        // disabled={isEditMode}
                        />
                        <TextField
                            name="iconImages"
                            type = "tex"
                            label="Image Icon"
                            value={formData.iconImages}
                            onChange={onChangeHandler}
                            variant="outlined"
                            maxLength={1}
                            size="small"
                            fullWidth
                            margin="normal"
                            error={!!errors.iconImages}
                            helperText={errors.iconImages}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.isMainMenu}
                                    onChange={onChangeHandler}
                                    name="isMainMenu"
                                    color="primary"
                                    disabled
                                />
                            }
                            label="Is Main Menu"
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                            <h6>Select User Roles To Assign this Menu</h6>
                            {userRoles.map(role => (
                                <FormControlLabel
                                    key={role.UserRoleId}
                                    control={
                                        <Checkbox
                                            checked={formData.selectedRoles.includes(role.UserRoleId)}
                                            onChange={() => handleRoleChange(role.UserRoleId)}
                                            color="primary"
                                        />
                                    }
                                    label={role.RoleType}
                                    style={{ marginRight: 0 }}
                                />
                            ))}
                        </div>


                        <DialogActions>
                            <Button onClick={handleCloseDialog} color="secondary">
                                Cancel
                            </Button>
                            <Button variant="contained" color="primary" type="submit">
                                {isEditMode ? "Update Menu" : "Add Menu"}
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={openSubMenuDialog} onClose={handleCloseSubMenuDialog} fullWidth maxWidth="sm">
                <DialogTitle>Add Sub-Menus to {selectedMenu?.menuName}</DialogTitle>
                <DialogContent>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress />
                        </div>
                    ) : (
                        <form onSubmit={handleSubMenuSubmit}>
                            <TextField
                                name="menuName"
                                label="Menu Name"
                                value={subMenuData.menuName}
                                onChange={handleSubMenuChange}
                                variant="outlined"
                                size="small"
                                fullWidth
                                margin="normal"

                            />
                            <TextField
                                name="subMenu"
                                label="Sub Menu"
                                value={subMenuData.subMenu}
                                onChange={handleSubMenuChange}
                                variant="outlined"
                                size="small"
                                fullWidth
                                margin="normal"
                                error={!!errors.subMenu}
                                helperText={errors.subMenu}
                            />
                            <TextField
                                name="path"
                                label="Path"
                                value={subMenuData.path}
                                onChange={handleSubMenuChange}
                                variant="outlined"
                                size="small"
                                fullWidth
                                margin="normal"
                                error={!!errors.path}
                                helperText={errors.path}
                            />
                                                    <TextField
                            name="sortOrder"
                            type="tel"
                            label="Sort Order"
                            value={subMenuData.sortOrder}
                            onChange={handleSubMenuChange}
                            variant="outlined"
                            maxLength={1}
                            size="small"
                            fullWidth
                            margin="normal"
                            error={!!errors.sortOrder}
                            helperText={errors.sortOrder}
                        // disabled={isEditMode}
                        />
                             <TextField
                                name="iconImages"
                                label="Icon Image"
                                value={subMenuData.iconImages}
                                onChange={handleSubMenuChange}
                                variant="outlined"
                                size="small"
                                fullWidth
                                margin="normal"
                                error={!!errors.iconImages}
                                helperText={errors.iconImages}
                            />

                            <DialogActions>
                                <Button onClick={handleCloseSubMenuDialog} color="primary">
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary">
                                    Save
                                </Button>
                            </DialogActions>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <div className="card mt-2">
                <CommonTables
                    tableHeads={tableHeads}
                    tableData={tableElements}
                    perPage={perPage}
                    currentPage={currentPage}
                    perPageChange={handlePerPageChange}
                    pageChange={handlePageChange}
                    totalCount={totalCount}
                />
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
        </Layout>
    );
}
