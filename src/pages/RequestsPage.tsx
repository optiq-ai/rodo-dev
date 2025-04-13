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
  Alert,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useAuth } from '../services/auth/AuthContext';
import RequestService from '../services/request.service';

const RequestsPage = () => {
  const { hasPermission } = useAuth();
  
  // State for requests list
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for request dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'edit', 'view'
  const [currentRequest, setCurrentRequest] = useState({
    type: 'access',
    dataSubject: '',
    contactInfo: '',
    description: ''
  });
  
  // Fetch requests
  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: searchQuery || undefined
      };
      
      const response = await RequestService.getRequests(params);
      setRequests(response.data);
      setTotalCount(response.pagination.total);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.error?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };
  
  // Load requests on initial render and when filters/pagination change
  useEffect(() => {
    fetchRequests();
  }, [page, rowsPerPage, statusFilter, typeFilter, searchQuery]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Open dialog for creating new request
  const handleCreateRequest = () => {
    setCurrentRequest({
      type: 'access',
      dataSubject: '',
      contactInfo: '',
      description: ''
    });
    setDialogMode('create');
    setOpenDialog(true);
  };
  
  // Open dialog for editing request
  const handleEditRequest = async (id) => {
    try {
      setLoading(true);
      const request = await RequestService.getRequestById(id);
      setCurrentRequest(request);
      setDialogMode('edit');
      setOpenDialog(true);
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError(err.error?.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };
  
  // Open dialog for viewing request
  const handleViewRequest = async (id) => {
    try {
      setLoading(true);
      const request = await RequestService.getRequestById(id);
      setCurrentRequest(request);
      setDialogMode('view');
      setOpenDialog(true);
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError(err.error?.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle request deletion
  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }
    
    try {
      setLoading(true);
      await RequestService.deleteRequest(id);
      fetchRequests();
    } catch (err) {
      console.error('Error deleting request:', err);
      setError(err.error?.message || 'Failed to delete request');
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
    const { name, value } = e.target;
    setCurrentRequest({
      ...currentRequest,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (dialogMode === 'create') {
        await RequestService.createRequest(currentRequest);
      } else if (dialogMode === 'edit') {
        await RequestService.updateRequest(currentRequest.id, currentRequest);
      }
      
      setOpenDialog(false);
      fetchRequests();
    } catch (err) {
      console.error('Error saving request:', err);
      setError(err.error?.message || 'Failed to save request');
    } finally {
      setLoading(false);
    }
  };
  
  // Render status badge
  const renderStatusBadge = (status) => {
    const colors = {
      new: '#2196f3',
      in_progress: '#ff9800',
      completed: '#4caf50',
      rejected: '#f44336'
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
  
  // Get request type name
  const getRequestTypeName = (type) => {
    const typeNames = {
      'access': 'Access to Data',
      'rectification': 'Data Rectification',
      'erasure': 'Data Erasure',
      'restriction': 'Processing Restriction',
      'portability': 'Data Portability',
      'objection': 'Processing Objection'
    };
    
    return typeNames[type] || type;
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Data Subject Requests
          </Typography>
          
          {hasPermission('requests', 'create') && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleCreateRequest}
            >
              New Request
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
                placeholder="Search by data subject or description"
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
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="access">Access to Data</MenuItem>
                  <MenuItem value="rectification">Data Rectification</MenuItem>
                  <MenuItem value="erasure">Data Erasure</MenuItem>
                  <MenuItem value="restriction">Processing Restriction</MenuItem>
                  <MenuItem value="portability">Data Portability</MenuItem>
                  <MenuItem value="objection">Processing Objection</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {loading && requests.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data Subject</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Deadline</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.dataSubject}</TableCell>
                        <TableCell>{request.typeName || getRequestTypeName(request.type)}</TableCell>
                        <TableCell>
                          {new Date(request.submissionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(request.deadlineDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(request.status)}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewRequest(request.id)}
                          >
                            <Visibility />
                          </IconButton>
                          
                          {hasPermission('requests', 'update') && (
                            <IconButton
                              color="secondary"
                              onClick={() => handleEditRequest(request.id)}
                            >
                              <Edit />
                            </IconButton>
                          )}
                          
                          {hasPermission('requests', 'delete') && (
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteRequest(request.id)}
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
      
      {/* Request Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'New Data Subject Request' : 
           dialogMode === 'edit' ? 'Edit Request' : 'Request Details'}
        </DialogTitle>
        
        <form onSubmit={handleSubmitRequest}>
          <DialogContent>
            <Grid container spacing={2}>
              {dialogMode === 'create' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Request Type</InputLabel>
                    <Select
                      name="type"
                      value={currentRequest.type}
                      onChange={handleInputChange}
                      label="Request Type"
                      required
                      disabled={dialogMode === 'view'}
                    >
                      <MenuItem value="access">Access to Data</MenuItem>
                      <MenuItem value="rectification">Data Rectification</MenuItem>
                      <MenuItem value="erasure">Data Erasure</MenuItem>
                      <MenuItem value="restriction">Processing Restriction</MenuItem>
                      <MenuItem value="portability">Data Portability</MenuItem>
                      <MenuItem value="objection">Processing Objection</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Data Subject Name"
                  name="dataSubject"
                  value={currentRequest.dataSubject}
                  onChange={handleInputChange}
                  required
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contact Information"
                  name="contactInfo"
                  value={currentRequest.contactInfo}
                  onChange={handleInputChange}
                  required
                  disabled={dialogMode === 'view'}
                  placeholder="Email or phone number"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Request Description"
                  name="description"
                  value={currentRequest.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              
              {dialogMode === 'edit' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={currentRequest.status}
                        onChange={handleInputChange}
                        label="Status"
                        disabled={dialogMode === 'view'}
                      >
                        <MenuItem value="new">New</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notes"
                      name="notes"
                      value={currentRequest.notes || ''}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                      disabled={dialogMode === 'view'}
                    />
                  </Grid>
                </>
              )}
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

export default RequestsPage;
