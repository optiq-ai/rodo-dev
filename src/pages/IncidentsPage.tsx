import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  TextField, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useAuth } from '../services/auth/AuthContext';
import IncidentService from '../services/incident.service';

const IncidentsPage = () => {
  const { hasPermission } = useAuth();
  
  // State for incidents list
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for incident dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'edit', 'view'
  const [currentIncident, setCurrentIncident] = useState({
    title: '',
    description: '',
    severity: 'medium',
    affectedData: '',
    actions: '',
    notificationRequired: false
  });
  
  // Fetch incidents
  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        search: searchQuery || undefined
      };
      
      const response = await IncidentService.getIncidents(params);
      setIncidents(response.data);
      setTotalCount(response.pagination.total);
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError(err.error?.message || 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };
  
  // Load incidents on initial render and when filters/pagination change
  useEffect(() => {
    fetchIncidents();
  }, [page, rowsPerPage, statusFilter, severityFilter, searchQuery]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Open dialog for creating new incident
  const handleCreateIncident = () => {
    setCurrentIncident({
      title: '',
      description: '',
      severity: 'medium',
      affectedData: '',
      actions: '',
      notificationRequired: false
    });
    setDialogMode('create');
    setOpenDialog(true);
  };
  
  // Open dialog for editing incident
  const handleEditIncident = async (id) => {
    try {
      setLoading(true);
      const incident = await IncidentService.getIncidentById(id);
      setCurrentIncident(incident);
      setDialogMode('edit');
      setOpenDialog(true);
    } catch (err) {
      console.error('Error fetching incident details:', err);
      setError(err.error?.message || 'Failed to load incident details');
    } finally {
      setLoading(false);
    }
  };
  
  // Open dialog for viewing incident
  const handleViewIncident = async (id) => {
    try {
      setLoading(true);
      const incident = await IncidentService.getIncidentById(id);
      setCurrentIncident(incident);
      setDialogMode('view');
      setOpenDialog(true);
    } catch (err) {
      console.error('Error fetching incident details:', err);
      setError(err.error?.message || 'Failed to load incident details');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle incident deletion
  const handleDeleteIncident = async (id) => {
    if (!window.confirm('Are you sure you want to delete this incident?')) {
      return;
    }
    
    try {
      setLoading(true);
      await IncidentService.deleteIncident(id);
      fetchIncidents();
    } catch (err) {
      console.error('Error deleting incident:', err);
      setError(err.error?.message || 'Failed to delete incident');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentIncident({
      ...currentIncident,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle form submission
  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (dialogMode === 'create') {
        await IncidentService.createIncident(currentIncident);
      } else if (dialogMode === 'edit') {
        await IncidentService.updateIncident(currentIncident.id, currentIncident);
      }
      
      setOpenDialog(false);
      fetchIncidents();
    } catch (err) {
      console.error('Error saving incident:', err);
      setError(err.error?.message || 'Failed to save incident');
    } finally {
      setLoading(false);
    }
  };
  
  // Render severity badge
  const renderSeverityBadge = (severity) => {
    const colors = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336',
      critical: '#9c27b0'
    };
    
    return (
      <Box
        sx={{
          display: 'inline-block',
          bgcolor: colors[severity] || colors.medium,
          color: 'white',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}
      >
        {severity}
      </Box>
    );
  };
  
  // Render status badge
  const renderStatusBadge = (status) => {
    const colors = {
      new: '#2196f3',
      in_progress: '#ff9800',
      closed: '#4caf50'
    };
    
    return (
      <Box
        sx={{
          display: 'inline-block',
          bgcolor: colors[status] || colors.new,
          color: 'white',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}
      >
        {status === 'in_progress' ? 'In Progress' : status}
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Incidents and Breaches
          </Typography>
          
          {hasPermission('incidents', 'create') && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleCreateIncident}
            >
              Report Incident
            </Button>
          )}
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or description"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  label="Severity"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {loading && incidents.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Reported By</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {incidents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No incidents found
                      </TableCell>
                    </TableRow>
                  ) : (
                    incidents.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>{incident.title}</TableCell>
                        <TableCell>
                          {new Date(incident.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(incident.status)}
                        </TableCell>
                        <TableCell>
                          {renderSeverityBadge(incident.severity)}
                        </TableCell>
                        <TableCell>
                          {incident.Reporter?.username || incident.reportedBy}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewIncident(incident.id)}
                          >
                            <Visibility />
                          </IconButton>
                          
                          {hasPermission('incidents', 'update') && (
                            <IconButton
                              color="secondary"
                              onClick={() => handleEditIncident(incident.id)}
                            >
                              <Edit />
                            </IconButton>
                          )}
                          
                          {hasPermission('incidents', 'delete') && (
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteIncident(incident.id)}
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Incident Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Report New Incident' : 
           dialogMode === 'edit' ? 'Edit Incident' : 'Incident Details'}
        </DialogTitle>
        
        <form onSubmit={handleSubmitIncident}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={currentIncident.title}
                  onChange={handleInputChange}
                  required
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={currentIncident.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select
                    name="severity"
                    value={currentIncident.severity}
                    onChange={handleInputChange}
                    label="Severity"
                    disabled={dialogMode === 'view'}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {dialogMode === 'edit' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      name="status"
                      value={currentIncident.status}
                      onChange={handleInputChange}
                      label="Status"
                      disabled={dialogMode === 'view'}
                    >
                      <MenuItem value="new">New</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="closed">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Affected Data"
                  name="affectedData"
                  value={currentIncident.affectedData}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Actions Taken"
                  name="actions"
                  value={currentIncident.actions}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              {dialogMode === 'view' ? 'Close' : 'Cancel'}
            </Button>
            
            {dialogMode !== 'view' && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save'}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default IncidentsPage;
