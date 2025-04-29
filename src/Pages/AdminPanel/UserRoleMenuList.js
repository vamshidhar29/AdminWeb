import React, { useEffect, useState } from "react";
import { fetchData, fetchUpdateData, fetchDeleteData } from "../../helpers/externapi";
import CircularProgress from '@mui/material/CircularProgress';
import { Typography, Checkbox, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import TextField from '@mui/material/TextField';
import MuiAlert from '@mui/material/Alert';
import Layout from "../../Layout/Layout";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function UserRoleMenuList() {
    const [loading, setLoading] = useState(false);
    const [menuLoading, setMenuLoading] = useState(false);
    const [userRoles, setUserRoles] = useState([]);
    const [allMenus, setAllMenus] = useState([]);
    const [assignedMenus, setAssignedMenus] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({ UserRoleId: "", RoleType: "" });
    const [isEditMode, setIsEditMode] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [confirmDeleteRoleId, setConfirmDeleteRoleId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        getUserRoles();

        if (formVisible && formData.UserRoleId ) {
            getUserMenusRoles(formData.UserRoleId);
        } else {
            getUserMenusRoles();
        }
    }, [formVisible, formData.UserRoleId]);




    const getUserRoles = async () => {
        try {
            setLoading(true);
            const userRolesData = await fetchData("UserRoles/all", { "skip": 0, "take": 0 });
            setUserRoles(userRolesData);
        } catch (error) {
            console.error("Error fetching user roles data:", error);
        } finally {
            setLoading(false);
        }
    };

    const matchedMenuId = (userMenus, menuId) => {
        let retResult = false;
        const singleMenu = userMenus.find(a => a.menusId == menuId);
        if (singleMenu) {
            retResult = true;
        }
        userMenus.forEach((menu1) => {
            menu1.subMenus.forEach((subMenu) => {
                if (subMenu.menusId == menuId) {
                    retResult = true;
                }
            })
        })

        return retResult;
    }

    const getUserMenusRoles = async (roleId) => {
        try {
            setMenuLoading(true);
            const allMenusData = await fetchData("Menus/all", { "skip": 0, "take": 0 });
            const userRolesMenuData = await fetchData(`Menus/UserRoleMenus/${roleId}`, {});
            allMenusData.forEach((menu) => {
                menu.checked = matchedMenuId(userRolesMenuData, menu.menusId);
                menu.subMenus.forEach((subMenu) => {
                    subMenu.checked = matchedMenuId(userRolesMenuData, subMenu.menusId);
                })
            })
            setAllMenus(allMenusData);
        } catch (error) {
            console.error("Error fetching assigned menus data:", error);
        } finally {
            setMenuLoading(false);
        }
    };

    const handleEdit = async (userRole) => {
        setIsEditMode(true);
        setFormVisible(true);
        setFormData({ UserRoleId: userRole.UserRoleId, RoleType: userRole.RoleType });
        setSelectedRole(userRole);
        await getUserMenusRoles(formData.userRoleId);
    };

    const handleAddNewUserRole = () => {
        setIsEditMode(false);
        setFormVisible(true);
        setFormData({ UserRoleId: "", RoleType: "" });
        setAllMenus([]); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.RoleType.trim() === "") {
            setErrorMessage('Please Enter Role Type.');
            return;
        }
        setLoading(true);
        setErrorMessage('');
        try {
            let response;
            let userRoleId;

            if (isEditMode) {
                response = await fetchUpdateData("UserRoles/update", {
                    userRoleId: formData.UserRoleId,
                    roleType: formData.RoleType
                });
                setSuccessMessage('User role updated successfully');
                userRoleId = formData.UserRoleId; 
            } else {
                response = await fetchData("UserRoles/add", {
                    roleType: formData.RoleType
                });
                setSuccessMessage('User role added successfully');
                userRoleId = response.userRoleId; 
            }

            let userRoleIds = assignedMenus.map(menu => ({
                userRoleId: userRoleId,
                menusId: menu.menuId,
                isActive: true
            }));

            if (userRoleIds.length === 0) {
                userRoleIds = [{
                    userRoleId: userRoleId,
                    menusId: 0,
                    isActive: false
                }];
            }

            if (!Array.isArray(userRoleIds)) {
                console.error('userRoleIds is not an array:', userRoleIds);
                return;
            }

            await fetchData("RoleMenu/seed", userRoleIds);
            setShowModal(false);
            await getUserRoles();
        } catch (error) {
            console.error("Error adding/updating user role:", error);
        } finally {
            setLoading(false);
            setFormData({ UserRoleId: "", RoleType: "" });
            setFormVisible(false);
            setSelectedRole(null);
        }
    };


    const handleDelete = async (userRoleId) => {
        setConfirmDeleteRoleId(userRoleId);
    };

    const handleConfirmDelete = async () => {
        try {
            setLoading(true);
            await fetchDeleteData(`UserRoles/delete/${confirmDeleteRoleId}`);
            setSuccessMessage('User role deleted successfully');
            await getUserRoles();
        } catch (error) {
            console.error("Error deleting user role:", error);
        } finally {
            setLoading(false);
            setConfirmDeleteRoleId(null);
        }
    };

    const handleCloseConfirmDialog = () => {
        setConfirmDeleteRoleId(null);
    };

    const handlePermissionChange = (menuId, subMenuId = null) => {
        setAllMenus(prevMenus => {
            const updatedMenus = prevMenus.map(menu => {
                if (menu.menusId === menuId) {
                    if (subMenuId) {
                        const updatedSubMenus = menu.subMenus.map(subMenu => {
                            if (subMenu.menusId === subMenuId) {
                                return {
                                    ...subMenu,
                                    checked: !subMenu.checked
                                };
                            }
                            return subMenu;
                        });
                        const anySubMenuChecked = updatedSubMenus.some(subMenu => subMenu.checked);
                        return {
                            ...menu,
                            checked: anySubMenuChecked,
                            subMenus: updatedSubMenus
                        };
                    } else {
                        const newCheckedStatus = !menu.checked;
                        const updatedSubMenus = menu.subMenus ? menu.subMenus.map(subMenu => ({
                            ...subMenu,
                            checked: newCheckedStatus
                        })) : [];
                        return {
                            ...menu,
                            checked: newCheckedStatus,
                            subMenus: updatedSubMenus
                        };
                    }
                }
                return menu;
            });
            const selectedMenus = updatedMenus.reduce((acc, menu) => {
                if (menu.checked) {
                    acc.push({ menuId: menu.menusId, path: menu.path });
                }
                if (menu.subMenus) {
                    menu.subMenus.forEach(subMenu => {
                        if (subMenu.checked) {
                            acc.push({ menuId: subMenu.menusId, path: subMenu.path });
                        }
                    });
                }
                return acc;
            }, []);
            setAssignedMenus(selectedMenus);
            return updatedMenus;
        });
    };

    const handleMenuSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let userRoleIds = assignedMenus.map(menu => ({
                userRoleId: selectedRole.UserRoleId,
                menusId: menu.menuId,
                isActive: true
            }));

            if (userRoleIds.length === 0) {
                userRoleIds = [{
                    userRoleId: selectedRole.UserRoleId || 0,
                    menusId: 0,
                    isActive: false
                }];
            }

            if (!Array.isArray(userRoleIds)) {
                console.error('userRoleIds is not an array:', userRoleIds);
                return;
            }

            await fetchData("RoleMenu/seed", userRoleIds);
            setShowModal(false);
        } catch (error) {
            console.error("Error updating role menus:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMenuModal = async (userRole) => {
        setShowModal(true);
        setSelectedRole(userRole);
        await getUserMenusRoles(userRole.UserRoleId);
    };

    const handleClose = () => {
        setFormVisible(false);
        setFormData({ UserRoleId: "", RoleType: "" });
        setErrorMessage('');
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedRole(null);
        setAssignedMenus([]);
    };

    return (
        <Layout>
            <div style={customStyles.container}>
            <Typography variant="h4" style={customStyles.header}>
                User Roles List
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddNewUserRole}
                style={customStyles.addButton}
            >
                Add User Role
            </Button>
            {loading ? (
                <div style={customStyles.loadingContainer}>
                    <CircularProgress />
                </div>
            ) : (
                <div className="row g-4">
                    {userRoles.map((userRole) => (
                        <div key={userRole.UserRoleId} className="col-xl-4 col-lg-6 col-md-6">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between mb-2">
                                        <h6 className="fw-normal">Role Type</h6>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-end">
                                        <div className="role-heading">
                                            <h4 className="mb-1">{userRole.RoleType}</h4>
                                            <div className="p-2">
                                                <button
                                                    onClick={() => handleEdit(userRole)}
                                                    className="role-edit-modal"
                                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                                                >
                                                    <small>Edit Role</small>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-success mx-2"
                                                    style={customStyles.assignButton}
                                                    onClick={() => handleOpenMenuModal(userRole)}
                                                >
                                                    Assign Menus
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger mx-2"
                                                    style={customStyles.deleteButton}
                                                    onClick={() => handleDelete(userRole.UserRoleId)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog
                open={formVisible}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle>{isEditMode ? 'Edit User Role' : 'Add User Role'}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="roleType"
                            label="Role Type"
                            type="text"
                            fullWidth
                            value={formData.RoleType}
                            onChange={(e) => setFormData({ ...formData, RoleType: e.target.value })}
                            error={!!errorMessage}
                            helperText={errorMessage}
                        />
                      <div style={{marginTop:'10px'}}>
                        <h6>Assign Menus for the User Role</h6>
                        {menuLoading ? (
                            <div style={customStyles.loadingContainer}>
                                <CircularProgress />
                            </div>
                        ) : (
                            allMenus.map(menu => (
                                <div key={menu.menusId}>
                                    <Checkbox
                                        checked={menu.checked}
                                        onChange={() => handlePermissionChange(menu.menusId)}
                                    />
                                    {menu.menuName} - {menu.path}
                                    <div style={{ paddingLeft: '20px' }}>
                                        {menu.subMenus && menu.subMenus.map(subMenu => (
                                            <div key={subMenu.menusId}>
                                                <Checkbox
                                                    checked={subMenu.checked}
                                                    onChange={() => handlePermissionChange(menu.menusId, subMenu.menusId)}
                                                />
                                                {subMenu.path}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                      </div>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                Cancel
                            </Button>
                            <Button type="submit" color="primary">
                                {isEditMode ? 'Update' : 'Add'}
                            </Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>


            <Dialog
                open={showModal}
                onClose={handleCloseModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Assign Menus to {selectedRole?.RoleType}</DialogTitle>
                <DialogContent>
                    {menuLoading ? (
                        <div style={customStyles.loadingContainer}>
                            <CircularProgress />
                        </div>
                    ) : (
                        <form onSubmit={handleMenuSubmit}>
                            {allMenus.map(menu => (
                                <div key={menu.menusId}>
                                    <Checkbox
                                        checked={menu.checked}
                                        onChange={() => handlePermissionChange(menu.menusId)}
                                    />
                                    {menu.menuName} - {menu.path}
                                    <div style={{ paddingLeft: '20px' }}>
                                        {menu.subMenus && menu.subMenus.map(subMenu => (
                                            <div key={subMenu.menusId}>
                                                <Checkbox
                                                    checked={subMenu.checked}
                                                    onChange={() => handlePermissionChange(menu.menusId, subMenu.menusId)}
                                                />
                                                {subMenu.path}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <DialogActions>
                                <Button onClick={handleCloseModal} color="primary">
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

            <Dialog
                open={confirmDeleteRoleId !== null}
                onClose={handleCloseConfirmDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this user role?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="primary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={6000}
                onClose={() => setSuccessMessage('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSuccessMessage('')} severity="success">
                    {successMessage}
                </Alert>
            </Snackbar>
            </div>
        </Layout>
    );
}

const customStyles = {
    container: {
        padding: '20px',
    },
    header: {
        marginBottom: '20px',
    },
    addButton: {
        marginBottom: '20px',
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
    assignButton: {
        marginRight: '8px',
    },
    deleteButton: {
        marginLeft: '8px',
    },
};
