// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../services/auth/AuthContext';
import { sanitizeInput, anonymizeData, pseudonymizeData } from '../utils/securityUtils';

// Typy danych dla użytkowników
interface UserData {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'iod' | 'employee';
  department: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'locked';
  permissions: string[];
}

// Przykładowe dane użytkowników
const mockUsers: UserData[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    department: 'IT',
    lastLogin: '2025-04-12 10:30',
    status: 'active',
    permissions: ['all']
  },
  {
    id: 2,
    username: 'iod',
    email: 'iod@example.com',
    role: 'iod',
    department: 'Compliance',
    lastLogin: '2025-04-11 15:45',
    status: 'active',
    permissions: ['view_all', 'edit_documents', 'manage_requests', 'view_reports']
  },
  {
    id: 3,
    username: 'employee1',
    email: 'employee1@example.com',
    role: 'employee',
    department: 'HR',
    lastLogin: '2025-04-10 09:15',
    status: 'active',
    permissions: ['view_documents', 'report_incidents']
  },
  {
    id: 4,
    username: 'employee2',
    email: 'employee2@example.com',
    role: 'employee',
    department: 'Marketing',
    lastLogin: '2025-04-05 14:20',
    status: 'inactive',
    permissions: ['view_documents']
  },
  {
    id: 5,
    username: 'employee3',
    email: 'employee3@example.com',
    role: 'employee',
    department: 'Sales',
    lastLogin: '2025-04-08 11:10',
    status: 'locked',
    permissions: ['view_documents', 'report_incidents']
  }
];

// Typy danych dla ról
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

// Przykładowe dane ról
const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Pełny dostęp do wszystkich funkcji systemu',
    permissions: ['all']
  },
  {
    id: 'iod',
    name: 'Inspektor Ochrony Danych',
    description: 'Zarządzanie zgodnością z RODO, dostęp do większości funkcji',
    permissions: ['view_all', 'edit_documents', 'manage_requests', 'view_reports']
  },
  {
    id: 'employee',
    name: 'Pracownik',
    description: 'Podstawowy dostęp do dokumentów i możliwość zgłaszania incydentów',
    permissions: ['view_documents', 'report_incidents']
  }
];

// Typy danych dla uprawnień
interface Permission {
  id: string;
  name: string;
  description: string;
}

// Przykładowe dane uprawnień
const mockPermissions: Permission[] = [
  { id: 'all', name: 'Wszystkie uprawnienia', description: 'Pełny dostęp do wszystkich funkcji systemu' },
  { id: 'view_all', name: 'Podgląd wszystkiego', description: 'Możliwość przeglądania wszystkich danych w systemie' },
  { id: 'edit_documents', name: 'Edycja dokumentów', description: 'Możliwość edycji dokumentów RODO' },
  { id: 'manage_requests', name: 'Zarządzanie wnioskami', description: 'Możliwość zarządzania wnioskami podmiotów danych' },
  { id: 'view_reports', name: 'Podgląd raportów', description: 'Dostęp do raportów i analityki' },
  { id: 'view_documents', name: 'Podgląd dokumentów', description: 'Możliwość przeglądania dokumentów RODO' },
  { id: 'report_incidents', name: 'Zgłaszanie incydentów', description: 'Możliwość zgłaszania incydentów bezpieczeństwa' }
];

const UserManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [permissions] = useState<Permission[]>(mockPermissions);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>(mockUsers);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newUser, setNewUser] = useState<Partial<UserData>>({
    username: '',
    email: '',
    role: 'employee',
    department: '',
    status: 'active',
    permissions: []
  });
  const [newRole, setNewRole] = useState<Partial<Role>>({
    id: '',
    name: '',
    description: '',
    permissions: []
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Filtrowanie użytkowników
  useEffect(() => {
    let result = [...users];
    
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.username.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(result);
  }, [users, roleFilter, statusFilter, searchTerm]);

  const handleOpenUserDialog = () => {
    setSelectedUser(null);
    setNewUser({
      username: '',
      email: '',
      role: 'employee',
      department: '',
      status: 'active',
      permissions: []
    });
    setOpenUserDialog(true);
  };

  const handleOpenEditUserDialog = (user: UserData) => {
    setSelectedUser(user);
    setNewUser({
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
      permissions: [...user.permissions]
    });
    setOpenUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setOpenUserDialog(false);
  };

  const handleOpenRoleDialog = () => {
    setSelectedRole(null);
    setNewRole({
      id: '',
      name: '',
      description: '',
      permissions: []
    });
    setOpenRoleDialog(true);
  };

  const handleOpenEditRoleDialog = (role: Role) => {
    setSelectedRole(role);
    setNewRole({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setOpenRoleDialog(true);
  };

  const handleCloseRoleDialog = () => {
    setOpenRoleDialog(false);
  };

  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    setRoleFilter(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleUserInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    // Sanityzacja danych wejściowych
    const sanitizedValue = sanitizeInput(value);
    setNewUser(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleUserRoleChange = (event: SelectChangeEvent) => {
    setNewUser(prev => ({ 
      ...prev, 
      role: event.target.value as 'admin' | 'iod' | 'employee',
      // Automatyczne ustawienie uprawnień na podstawie roli
      permissions: mockRoles.find(role => role.id === event.target.value)?.permissions || []
    }));
  };

  const handleUserStatusChange = (event: SelectChangeEvent) => {
    setNewUser(prev => ({ ...prev, status: event.target.value as 'active' | 'inactive' | 'locked' }));
  };

  const handleRoleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    // Sanityzacja danych wejściowych
    const sanitizedValue = sanitizeInput(value);
    setNewRole(prev => ({ ...prev, [name]: sanitizedValue }));
  };

  const handleRolePermissionChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setNewRole(prev => ({ 
      ...prev, 
      permissions: typeof value === 'string' ? value.split(',') : value 
    }));
  };

  const handleSubmitUser = () => {
    if (selectedUser) {
      // Aktualizacja istniejącego użytkownika
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, ...newUser } 
          : user
      ));
      setAlertMessage('Użytkownik został zaktualizowany');
    } else {
      // Dodanie nowego użytkownika
      const newUserComplete: UserData = {
        id: users.length + 1,
        username: newUser.username || '',
        email: newUser.email || '',
        role: newUser.role as 'admin' | 'iod' | 'employee',
        department: newUser.department || '',
        lastLogin: '-',
        status: newUser.status as 'active' | 'inactive' | 'locked',
        permissions: newUser.permissions || []
      };
      
      setUsers(prev => [...prev, newUserComplete]);
      setAlertMessage('Nowy użytkownik został dodany');
    }
    
    handleCloseUserDialog();
    setShowSuccessAlert(true);
    
    // Ukryj alert po 5 sekundach
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);
  };

  const handleSubmitRole = () => {
    if (selectedRole) {
      // Aktualizacja istniejącej roli
      setRoles(prev => prev.map(role => 
        role.id === selectedRole.id 
          ? { ...role, ...newRole } 
          : role
      ));
      setAlertMessage('Rola została zaktualizowana');
    } else {
      // Dodanie nowej roli
      const newRoleComplete: Role = {
        id: newRole.id || '',
        name: newRole.name || '',
        description: newRole.description || '',
        permissions: newRole.permissions || []
      };
      
      setRoles(prev => [...prev, newRoleComplete]);
      setAlertMessage('Nowa rola została dodana');
    }
    
    handleCloseRoleDialog();
    setShowSuccessAlert(true);
    
    // Ukryj alert po 5 sekundach
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    setAlertMessage('Użytkownik został usunięty');
    setShowSuccessAlert(true);
    
    // Ukryj alert po 5 sekundach
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(prev => prev.filter(role => role.id !== roleId));
    setAlertMessage('Rola została usunięta');
    setShowSuccessAlert(true);
    
    // Ukryj alert po 5 sekundach
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'locked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktywny';
      case 'inactive':
        return 'Nieaktywny';
      case 'locked':
        return 'Zablokowany';
      default:
        return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'iod':
        return 'IOD';
      case 'employee':
        return 'Pracownik';
      default:
        return role;
    }
  };

  // Funkcja do anonimizacji lub pseudonimizacji danych
  const processEmail = (email: string) => {
    if (!showSensitiveData) {
      return anonymizeData(email, 3);
    }
    return email;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Zarządzanie użytkownikami i uprawnieniami
      </Typography>
      
      {showSuccessAlert && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setShowSuccessAlert(false)}>
          {alertMessage}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', mb: 3 }}>
        <Button 
          variant={activeTab === 'users' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('users')}
          sx={{ mr: 2 }}
        >
          Użytkownicy
        </Button>
        <Button 
          variant={activeTab === 'roles' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('roles')}
          sx={{ mr: 2 }}
        >
          Role
        </Button>
        <Button 
          variant={activeTab === 'permissions' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('permissions')}
        >
          Uprawnienia
        </Button>
      </Box>
      
      {activeTab === 'users' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Wyszukaj"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ minWidth: 200 }}
              />
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel id="role-filter-label">Rola</InputLabel>
                <Select
                  labelId="role-filter-label"
                  id="role-filter"
                  value={roleFilter}
                  label="Rola"
                  onChange={handleRoleFilterChange}
                >
                  <MenuItem value="all">Wszystkie</MenuItem>
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="iod">IOD</MenuItem>
                  <MenuItem value="employee">Pracownik</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }} size="small">
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">Wszystkie</MenuItem>
                  <MenuItem value="active">Aktywny</MenuItem>
                  <MenuItem value="inactive">Nieaktywny</MenuItem>
                  <MenuItem value="locked">Zablokowany</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="outlined" 
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                startIcon={<SecurityIcon />}
              >
                {showSensitiveData ? 'Ukryj dane wrażliwe' : 'Pokaż dane wrażliwe'}
              </Button>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenUserDialog}
            >
              Dodaj użytkownika
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="users table">
              <TableHead>
                <TableRow>
                  <TableCell>Nazwa użytkownika</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rola</TableCell>
                  <TableCell>Dział</TableCell>
                  <TableCell>Ostatnie logowanie</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Akcje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell component="th" scope="row">
                        {user.username}
                      </TableCell>
                      <TableCell>{processEmail(user.email)}</TableCell>
                      <TableCell>{getRoleLabel(user.role)}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(user.status)} 
                          color={getStatusColor(user.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenEditUserDialog(user)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Nie znaleziono użytkowników spełniających kryteria wyszukiwania
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {activeTab === 'roles' && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenRoleDialog}
            >
              Dodaj rolę
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="roles table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nazwa</TableCell>
                  <TableCell>Opis</TableCell>
                  <TableCell>Uprawnienia</TableCell>
                  <TableCell>Akcje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell component="th" scope="row">
                      {role.id}
                    </TableCell>
                    <TableCell>{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>
                      {role.permissions.map(permId => {
                        const perm = permissions.find(p => p.id === permId);
                        return perm ? (
                          <Chip 
                            key={permId}
                            label={perm.name} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ) : null;
                      })}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenEditRoleDialog(role)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {activeTab === 'permissions' && (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="permissions table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nazwa</TableCell>
                <TableCell>Opis</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell component="th" scope="row">
                    {permission.id}
                  </TableCell>
                  <TableCell>{permission.name}</TableCell>
                  <TableCell>{permission.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Dialog do dodawania/edycji użytkownika */}
      <Dialog open={openUserDialog} onClose={handleCloseUserDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edytuj użytkownika' : 'Dodaj nowego użytkownika'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser 
              ? 'Edytuj informacje o użytkowniku.'
              : 'Wprowadź informacje o nowym użytkowniku.'}
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                required
                margin="dense"
                id="username"
                name="username"
                label="Nazwa użytkownika"
                type="text"
                fullWidth
                variant="outlined"
                value={newUser.username}
                onChange={handleUserInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                margin="dense"
                id="email"
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={newUser.email}
                onChange={handleUserInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="role-label">Rola</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={newUser.role}
                  label="Rola"
                  onChange={handleUserRoleChange}
                >
                  <MenuItem value="admin">Administrator</MenuItem>
                  <MenuItem value="iod">IOD</MenuItem>
                  <MenuItem value="employee">Pracownik</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="department"
                name="department"
                label="Dział"
                type="text"
                fullWidth
                variant="outlined"
                value={newUser.department}
                onChange={handleUserInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  value={newUser.status}
                  label="Status"
                  onChange={handleUserStatusChange}
                >
                  <MenuItem value="active">Aktywny</MenuItem>
                  <MenuItem value="inactive">Nieaktywny</MenuItem>
                  <MenuItem value="locked">Zablokowany</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Anuluj</Button>
          <Button 
            onClick={handleSubmitUser} 
            variant="contained"
            disabled={!newUser.username || !newUser.email || !newUser.role}
          >
            {selectedUser ? 'Zapisz zmiany' : 'Dodaj użytkownika'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog do dodawania/edycji roli */}
      <Dialog open={openRoleDialog} onClose={handleCloseRoleDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRole ? 'Edytuj rolę' : 'Dodaj nową rolę'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedRole 
              ? 'Edytuj informacje o roli i przypisane uprawnienia.'
              : 'Wprowadź informacje o nowej roli i przypisz uprawnienia.'}
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                required
                margin="dense"
                id="id"
                name="id"
                label="ID roli"
                type="text"
                fullWidth
                variant="outlined"
                value={newRole.id}
                onChange={handleRoleInputChange}
                disabled={!!selectedRole}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                margin="dense"
                id="name"
                name="name"
                label="Nazwa roli"
                type="text"
                fullWidth
                variant="outlined"
                value={newRole.name}
                onChange={handleRoleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="description"
                name="description"
                label="Opis roli"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={newRole.description}
                onChange={handleRoleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="permissions-label">Uprawnienia</InputLabel>
                <Select
                  labelId="permissions-label"
                  id="permissions"
                  multiple
                  value={newRole.permissions || []}
                  label="Uprawnienia"
                  onChange={handleRolePermissionChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const perm = permissions.find(p => p.id === value);
                        return (
                          <Chip key={value} label={perm ? perm.name : value} />
                        );
                      })}
                    </Box>
                  )}
                >
                  {permissions.map((permission) => (
                    <MenuItem key={permission.id} value={permission.id}>
                      {permission.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoleDialog}>Anuluj</Button>
          <Button 
            onClick={handleSubmitRole} 
            variant="contained"
            disabled={!newRole.id || !newRole.name}
          >
            {selectedRole ? 'Zapisz zmiany' : 'Dodaj rolę'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagementPage;
