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
  Tabs,
  Tab
} from '@mui/material';
import { Add, Edit, Delete, Visibility, Assessment } from '@mui/icons-material';
import { useAuth } from '../services/auth/AuthContext';
import RiskAnalysisService from '../services/risk-analysis.service';

const RiskAnalysisPage = () => {
  const { hasPermission } = useAuth();
  
  // State for risk analyses list
  const [riskAnalyses, setRiskAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // State for filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for risk analysis dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create', 'edit', 'view'
  const [currentRiskAnalysis, setCurrentRiskAnalysis] = useState({
    name: '',
    description: '',
    status: 'draft',
    assets: [],
    threats: [],
    securityMeasures: []
  });
  
  // State for dialog tabs
  const [dialogTabIndex, setDialogTabIndex] = useState(0);
  
  // Fetch risk analyses
  const fetchRiskAnalyses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: page + 1, // API uses 1-based pagination
        limit: rowsPerPage,
        status: statusFilter || undefined,
        search: searchQuery || undefined
      };
      
      const response = await RiskAnalysisService.getRiskAnalyses(params);
      setRiskAnalyses(response.data);
      setTotalCount(response.pagination.total);
    } catch (err) {
      console.error('Error fetching risk analyses:', err);
      setError(err.error?.message || 'Failed to load risk analyses');
    } finally {
      setLoading(false);
    }
  };
  
  // Load risk analyses on initial render and when filters/pagination change
  useEffect(() => {
    fetchRiskAnalyses();
  }, [page, rowsPerPage, statusFilter, searchQuery]);
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Open dialog for creating new risk analysis
  const handleCreateRiskAnalysis = () => {
    setCurrentRiskAnalysis({
      name: '',
      description: '',
      status: 'draft',
      assets: [],
      threats: [],
      securityMeasures: []
    });
    setDialogMode('create');
    setDialogTabIndex(0);
    setOpenDialog(true);
  };
  
  // Open dialog for editing risk analysis
  const handleEditRiskAnalysis = async (id) => {
    try {
      setLoading(true);
      const riskAnalysis = await RiskAnalysisService.getRiskAnalysisById(id);
      setCurrentRiskAnalysis(riskAnalysis);
      setDialogMode('edit');
      setDialogTabIndex(0);
      setOpenDialog(true);
    } catch (err) {
      console.error('Error fetching risk analysis details:', err);
      setError(err.error?.message || 'Failed to load risk analysis details');
    } finally {
      setLoading(false);
    }
  };
  
  // Open dialog for viewing risk analysis
  const handleViewRiskAnalysis = async (id) => {
    try {
      setLoading(true);
      const riskAnalysis = await RiskAnalysisService.getRiskAnalysisById(id);
      setCurrentRiskAnalysis(riskAnalysis);
      setDialogMode('view');
      setDialogTabIndex(0);
      setOpenDialog(true);
    } catch (err) {
      console.error('Error fetching risk analysis details:', err);
      setError(err.error?.message || 'Failed to load risk analysis details');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle risk analysis deletion
  const handleDeleteRiskAnalysis = async (id) => {
    if (!window.confirm('Are you sure you want to delete this risk analysis?')) {
      return;
    }
    
    try {
      setLoading(true);
      await RiskAnalysisService.deleteRiskAnalysis(id);
      fetchRiskAnalyses();
    } catch (err) {
      console.error('Error deleting risk analysis:', err);
      setError(err.error?.message || 'Failed to delete risk analysis');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Handle dialog tab change
  const handleDialogTabChange = (event, newValue) => {
    setDialogTabIndex(newValue);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentRiskAnalysis({
      ...currentRiskAnalysis,
      [name]: value
    });
  };
  
  // Handle asset input change
  const handleAssetChange = (index, field, value) => {
    const updatedAssets = [...currentRiskAnalysis.assets];
    updatedAssets[index] = {
      ...updatedAssets[index],
      [field]: value
    };
    setCurrentRiskAnalysis({
      ...currentRiskAnalysis,
      assets: updatedAssets
    });
  };
  
  // Add new asset
  const handleAddAsset = () => {
    setCurrentRiskAnalysis({
      ...currentRiskAnalysis,
      assets: [
        ...currentRiskAnalysis.assets,
        {
          name: '',
          description: '',
          dataCategories: []
        }
      ]
    });
  };
  
  // Remove asset
  const handleRemoveAsset = (index) => {
    const updatedAssets = [...currentRiskAnalysis.assets];
    updatedAssets.splice(index, 1);
    setCurrentRiskAnalysis({
      ...currentRiskAnalysis,
      assets: updatedAssets
    });
  };
  
  // Handle threat input change
  const handleThreatChange = (index, field, value) => {
    const updatedThreats = [...currentRiskAnalysis.threats];
    updatedThreats[index] = {
      ...updatedThreats[index],
      [field]: value
    };
    setCurrentRiskAnalysis({
      ...currentRiskAnalysis,
      threats: updatedThreats
    });
  };
  
  // Add new threat
  const handleAddThreat = () => {
    setCurrentRiskAnalysis({
      ...currentRiskAnalysis,
      threats: [
        ...currentRiskAnalysis.threats,
        {
          name: '',
          description: '',
          probability: 'medium',
          impact: 'medium'
        }
      ]
    });
  };
  
  // Remove threat
  const handleRemoveThreat = (index) => {
    const updatedThreats = [...currentRiskAnalysis.threats];
    updatedThreats.splice(index, 1);
    setCurrentRiskAnalysis({
      ...currentRiskAnalysis,
      threats: updatedThreats
    });
  };
  
  // Handle security measure input change
  const handleSecurityMeasureChange = (index, field, value) => {
    const updatedMeasures = [...currentRiskAnalysis.securityMeasures];
    updatedMeasures[index] = {
      ...updatedMeasures[index],
      [field]: value
    };
    setCurrentRiskAnalysis({
      ...currentRiskAnalysis,
      securityMeasures: updatedMeasures
    });
  };
  
  // Add new security measure
  const handleAddSecurityMeasure = () => {
    setCurrentRiskAnalysis({
      ...currentRiskAnalysis,
      securityMeasures: [
        ...currentRiskAnalysis.securityMeasures,
        {
          name: '',
          description: '',
          status: 'planned'
        }
      ]
    });
  };
  
  // Remove security measure
  const handleRemoveSecurityMeasure = (index) => {
    const updatedMeasures = [...currentRiskAnalysis.securityMeasures];
    updatedMeasures.splice(index, 1);
    setCurrentRiskAnalysis({
      ...currentRiskAnalysis,
      securityMeasures: updatedMeasures
    });
  };
  
  // Handle form submission
  const handleSubmitRiskAnalysis = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (dialogMode === 'create') {
        await RiskAnalysisService.createRiskAnalysis(currentRiskAnalysis);
      } else if (dialogMode === 'edit') {
        await RiskAnalysisService.updateRiskAnalysis(currentRiskAnalysis.id, currentRiskAnalysis);
      }
      
      setOpenDialog(false);
      fetchRiskAnalyses();
    } catch (err) {
      console.error('Error saving risk analysis:', err);
      setError(err.error?.message || 'Failed to save risk analysis');
    } finally {
      setLoading(false);
    }
  };
  
  // Render risk level badge
  const renderRiskLevelBadge = (riskLevel) => {
    const colors = {
      low: '#4caf50',
      medium: '#ff9800',
      high: '#f44336'
    };
    
    return (
      <Box
        sx={{
          display: 'inline-block',
          bgcolor: colors[riskLevel] || colors.medium,
          color: 'white',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}
      >
        {riskLevel}
      </Box>
    );
  };
  
  // Render status badge
  const renderStatusBadge = (status) => {
    const colors = {
      draft: '#2196f3',
      completed: '#4caf50',
      archived: '#9e9e9e'
    };
    
    return (
      <Box
        sx={{
          display: 'inline-block',
          bgcolor: colors[status] || colors.draft,
          color: 'white',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          fontSize: '0.75rem',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}
      >
        {status}
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Risk Analysis and DPIA
          </Typography>
          
          {hasPermission('risk-analysis', 'create') && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleCreateRiskAnalysis}
            >
              New Risk Analysis
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Search"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or description"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {loading && riskAnalyses.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Created Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {riskAnalyses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No risk analyses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    riskAnalyses.map((analysis) => (
                      <TableRow key={analysis.id}>
                        <TableCell>{analysis.name}</TableCell>
                        <TableCell>
                          {renderStatusBadge(analysis.status)}
                        </TableCell>
                        <TableCell>
                          {renderRiskLevelBadge(analysis.riskLevel || 'medium')}
                        </TableCell>
                        <TableCell>
                          {analysis.Creator?.username || analysis.createdBy}
                        </TableCell>
                        <TableCell>
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewRiskAnalysis(analysis.id)}
                          >
                            <Visibility />
                          </IconButton>
                          
                          {hasPermission('risk-analysis', 'update') && (
                            <IconButton
                              color="secondary"
                              onClick={() => handleEditRiskAnalysis(analysis.id)}
                            >
                              <Edit />
                            </IconButton>
                          )}
                          
                          {hasPermission('risk-analysis', 'delete') && (
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteRiskAnalysis(analysis.id)}
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
      
      {/* Risk Analysis Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'New Risk Analysis' : 
           dialogMode === 'edit' ? 'Edit Risk Analysis' : 'Risk Analysis Details'}
        </DialogTitle>
        
        <form onSubmit={handleSubmitRiskAnalysis}>
          <DialogContent>
            <Tabs
              value={dialogTabIndex}
              onChange={handleDialogTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              sx={{ mb: 3 }}
            >
              <Tab label="General" />
              <Tab label="Assets" />
              <Tab label="Threats" />
              <Tab label="Security Measures" />
            </Tabs>
            
            {/* General Tab */}
            {dialogTabIndex === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={currentRiskAnalysis.name}
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
                    value={currentRiskAnalysis.description}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    disabled={dialogMode === 'view'}
                  />
                </Grid>
                
                {dialogMode === 'edit' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={currentRiskAnalysis.status}
                        onChange={handleInputChange}
                        label="Status"
                        disabled={dialogMode === 'view'}
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                
                {currentRiskAnalysis.riskLevel && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Risk Level
                      </Typography>
                      {renderRiskLevelBadge(currentRiskAnalysis.riskLevel)}
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
            
            {/* Assets Tab */}
            {dialogTabIndex === 1 && (
              <>
                {currentRiskAnalysis.assets && currentRiskAnalysis.assets.map((asset, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Asset Name"
                          value={asset.name}
                          onChange={(e) => handleAssetChange(index, 'name', e.target.value)}
                          required
                          disabled={dialogMode === 'view'}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={asset.description}
                          onChange={(e) => handleAssetChange(index, 'description', e.target.value)}
                          multiline
                          rows={2}
                          disabled={dialogMode === 'view'}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Data Categories"
                          value={Array.isArray(asset.dataCategories) ? asset.dataCategories.join(', ') : ''}
                          onChange={(e) => handleAssetChange(index, 'dataCategories', e.target.value.split(',').map(item => item.trim()))}
                          helperText="Comma-separated list of data categories"
                          disabled={dialogMode === 'view'}
                        />
                      </Grid>
                    </Grid>
                    
                    {dialogMode !== 'view' && (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRemoveAsset(index)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Paper>
                ))}
                
                {dialogMode !== 'view' && (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddAsset}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Add Asset
                  </Button>
                )}
                
                {currentRiskAnalysis.assets && currentRiskAnalysis.assets.length === 0 && (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                    No assets added yet
                  </Typography>
                )}
              </>
            )}
            
            {/* Threats Tab */}
            {dialogTabIndex === 2 && (
              <>
                {currentRiskAnalysis.threats && currentRiskAnalysis.threats.map((threat, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Threat Name"
                          value={threat.name}
                          onChange={(e) => handleThreatChange(index, 'name', e.target.value)}
                          required
                          disabled={dialogMode === 'view'}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={threat.description}
                          onChange={(e) => handleThreatChange(index, 'description', e.target.value)}
                          multiline
                          rows={2}
                          disabled={dialogMode === 'view'}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Probability</InputLabel>
                          <Select
                            value={threat.probability}
                            onChange={(e) => handleThreatChange(index, 'probability', e.target.value)}
                            label="Probability"
                            disabled={dialogMode === 'view'}
                          >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Impact</InputLabel>
                          <Select
                            value={threat.impact}
                            onChange={(e) => handleThreatChange(index, 'impact', e.target.value)}
                            label="Impact"
                            disabled={dialogMode === 'view'}
                          >
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    
                    {dialogMode !== 'view' && (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRemoveThreat(index)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Paper>
                ))}
                
                {dialogMode !== 'view' && (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddThreat}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Add Threat
                  </Button>
                )}
                
                {currentRiskAnalysis.threats && currentRiskAnalysis.threats.length === 0 && (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                    No threats added yet
                  </Typography>
                )}
              </>
            )}
            
            {/* Security Measures Tab */}
            {dialogTabIndex === 3 && (
              <>
                {currentRiskAnalysis.securityMeasures && currentRiskAnalysis.securityMeasures.map((measure, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Measure Name"
                          value={measure.name}
                          onChange={(e) => handleSecurityMeasureChange(index, 'name', e.target.value)}
                          required
                          disabled={dialogMode === 'view'}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          value={measure.description}
                          onChange={(e) => handleSecurityMeasureChange(index, 'description', e.target.value)}
                          multiline
                          rows={2}
                          disabled={dialogMode === 'view'}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={measure.status}
                            onChange={(e) => handleSecurityMeasureChange(index, 'status', e.target.value)}
                            label="Status"
                            disabled={dialogMode === 'view'}
                          >
                            <MenuItem value="planned">Planned</MenuItem>
                            <MenuItem value="in_progress">In Progress</MenuItem>
                            <MenuItem value="implemented">Implemented</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    
                    {dialogMode !== 'view' && (
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleRemoveSecurityMeasure(index)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Paper>
                ))}
                
                {dialogMode !== 'view' && (
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={handleAddSecurityMeasure}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Add Security Measure
                  </Button>
                )}
                
                {currentRiskAnalysis.securityMeasures && currentRiskAnalysis.securityMeasures.length === 0 && (
                  <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
                    No security measures added yet
                  </Typography>
                )}
              </>
            )}
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

export default RiskAnalysisPage;
