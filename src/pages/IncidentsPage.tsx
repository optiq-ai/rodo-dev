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
import WarningIcon from '@mui/icons-material/Warning';
import { useAuth } from '../services/auth/AuthContext';

// Typy danych dla incydentów
interface Incident {
  id: number;
  title: string;
  description: string;
  date: string;
  status: 'Nowy' | 'W trakcie' | 'Zamknięty';
  severity: 'Niski' | 'Średni' | 'Wysoki' | 'Krytyczny';
  reportedBy: string;
  affectedData: string;
  actions: string;
}

// Przykładowe dane incydentów
const mockIncidents: Incident[] = [
  {
    id: 1,
    title: 'Wyciek danych klientów',
    description: 'Wykryto nieautoryzowany dostęp do bazy danych klientów. Potencjalnie ujawnione dane to: imiona, nazwiska, adresy email.',
    date: '2025-04-10',
    status: 'W trakcie',
    severity: 'Wysoki',
    reportedBy: 'Jan Kowalski',
    affectedData: 'Dane osobowe klientów',
    actions: 'Zablokowano dostęp do bazy danych, powiadomiono osoby, których dane dotyczą, zgłoszono do UODO.'
  },
  {
    id: 2,
    title: 'Utrata laptopa służbowego',
    description: 'Pracownik zgubił laptop służbowy zawierający dane osobowe pracowników.',
    date: '2025-04-05',
    status: 'Zamknięty',
    severity: 'Średni',
    reportedBy: 'Anna Nowak',
    affectedData: 'Dane osobowe pracowników',
    actions: 'Zdalnie wymazano dane z laptopa, zmieniono hasła dostępowe, powiadomiono osoby, których dane dotyczą.'
  },
  {
    id: 3,
    title: 'Atak phishingowy',
    description: 'Wykryto próbę ataku phishingowego na pracowników działu HR.',
    date: '2025-04-12',
    status: 'Nowy',
    severity: 'Niski',
    reportedBy: 'Piotr Wiśniewski',
    affectedData: 'Brak naruszenia danych',
    actions: 'Powiadomiono pracowników o zagrożeniu, przeprowadzono szkolenie z rozpoznawania ataków phishingowych.'
  },
  {
    id: 4,
    title: 'Błąd w systemie CRM',
    description: 'Wykryto błąd w systemie CRM, który umożliwiał dostęp do danych klientów przez nieuprawnione osoby.',
    date: '2025-03-28',
    status: 'Zamknięty',
    severity: 'Krytyczny',
    reportedBy: 'Michał Dąbrowski',
    affectedData: 'Dane osobowe i finansowe klientów',
    actions: 'Naprawiono błąd, przeprowadzono audyt bezpieczeństwa, powiadomiono UODO i osoby, których dane dotyczą.'
  },
];

const IncidentsPage: React.FC = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>(mockIncidents);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    title: '',
    description: '',
    severity: 'Średni',
    affectedData: '',
    actions: ''
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Filtrowanie incydentów
  useEffect(() => {
    let result = [...incidents];
    
    if (statusFilter !== 'all') {
      result = result.filter(incident => incident.status === statusFilter);
    }
    
    if (severityFilter !== 'all') {
      result = result.filter(incident => incident.severity === severityFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(incident => 
        incident.title.toLowerCase().includes(term) || 
        incident.description.toLowerCase().includes(term) ||
        incident.affectedData.toLowerCase().includes(term)
      );
    }
    
    setFilteredIncidents(result);
  }, [incidents, statusFilter, severityFilter, searchTerm]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewIncident({
      title: '',
      description: '',
      severity: 'Średni',
      affectedData: '',
      actions: ''
    });
  };

  const handleOpenDetailsDialog = (incident: Incident) => {
    setSelectedIncident(incident);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedIncident(null);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleSeverityFilterChange = (event: SelectChangeEvent) => {
    setSeverityFilter(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setNewIncident(prev => ({ ...prev, [name]: value }));
  };

  const handleSeverityChange = (event: SelectChangeEvent) => {
    setNewIncident(prev => ({ ...prev, severity: event.target.value as 'Niski' | 'Średni' | 'Wysoki' | 'Krytyczny' }));
  };

  const handleSubmitIncident = () => {
    const newIncidentComplete: Incident = {
      id: incidents.length + 1,
      title: newIncident.title || '',
      description: newIncident.description || '',
      date: new Date().toISOString().split('T')[0],
      status: 'Nowy',
      severity: newIncident.severity as 'Niski' | 'Średni' | 'Wysoki' | 'Krytyczny',
      reportedBy: user?.username || 'Nieznany',
      affectedData: newIncident.affectedData || '',
      actions: newIncident.actions || ''
    };
    
    setIncidents(prev => [newIncidentComplete, ...prev]);
    handleCloseDialog();
    setShowSuccessAlert(true);
    
    // Ukryj alert po 5 sekundach
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Niski':
        return 'success';
      case 'Średni':
        return 'warning';
      case 'Wysoki':
        return 'error';
      case 'Krytyczny':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Nowy':
        return 'info';
      case 'W trakcie':
        return 'warning';
      case 'Zamknięty':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Incydenty i naruszenia
      </Typography>
      
      {showSuccessAlert && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setShowSuccessAlert(false)}>
          Incydent został pomyślnie zgłoszony i zostanie rozpatrzony przez zespół bezpieczeństwa.
        </Alert>
      )}
      
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
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">Wszystkie</MenuItem>
              <MenuItem value="Nowy">Nowe</MenuItem>
              <MenuItem value="W trakcie">W trakcie</MenuItem>
              <MenuItem value="Zamknięty">Zamknięte</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="severity-filter-label">Poziom ryzyka</InputLabel>
            <Select
              labelId="severity-filter-label"
              id="severity-filter"
              value={severityFilter}
              label="Poziom ryzyka"
              onChange={handleSeverityFilterChange}
            >
              <MenuItem value="all">Wszystkie</MenuItem>
              <MenuItem value="Niski">Niski</MenuItem>
              <MenuItem value="Średni">Średni</MenuItem>
              <MenuItem value="Wysoki">Wysoki</MenuItem>
              <MenuItem value="Krytyczny">Krytyczny</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Zgłoś incydent
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="incidents table">
          <TableHead>
            <TableRow>
              <TableCell>Tytuł</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Poziom ryzyka</TableCell>
              <TableCell>Zgłaszający</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell component="th" scope="row">
                    {incident.title}
                  </TableCell>
                  <TableCell>{incident.date}</TableCell>
                  <TableCell>
                    <Chip 
                      label={incident.status} 
                      color={getStatusColor(incident.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {(incident.severity === 'Wysoki' || incident.severity === 'Krytyczny') && (
                        <WarningIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                      )}
                      <Chip 
                        label={incident.severity} 
                        color={getSeverityColor(incident.severity)} 
                        size="small" 
                      />
                    </Box>
                  </TableCell>
                  <TableCell>{incident.reportedBy}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenDetailsDialog(incident)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nie znaleziono incydentów spełniających kryteria wyszukiwania
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Dialog do zgłaszania incydentu */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Zgłoś nowy incydent</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wprowadź informacje o incydencie lub naruszeniu bezpieczeństwa danych.
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                required
                margin="dense"
                id="title"
                name="title"
                label="Tytuł incydentu"
                type="text"
                fullWidth
                variant="outlined"
                value={newIncident.title}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                margin="dense"
                id="description"
                name="description"
                label="Opis incydentu"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={newIncident.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="severity-label">Poziom ryzyka</InputLabel>
                <Select
                  labelId="severity-label"
                  id="severity"
                  value={newIncident.severity}
                  label="Poziom ryzyka"
                  onChange={handleSeverityChange}
                >
                  <MenuItem value="Niski">Niski</MenuItem>
                  <MenuItem value="Średni">Średni</MenuItem>
                  <MenuItem value="Wysoki">Wysoki</MenuItem>
                  <MenuItem value="Krytyczny">Krytyczny</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="affectedData"
                name="affectedData"
                label="Jakie dane zostały naruszone"
                type="text"
                fullWidth
                variant="outlined"
                value={newIncident.affectedData}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="actions"
                name="actions"
                label="Podjęte działania"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={newIncident.actions}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button 
            onClick={handleSubmitIncident} 
            variant="contained"
            disabled={!newIncident.title || !newIncident.description}
          >
            Zgłoś
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog ze szczegółami incydentu */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        {selectedIncident && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {selectedIncident.title}
                <Chip 
                  label={selectedIncident.severity} 
                  color={getSeverityColor(selectedIncident.severity)} 
                  size="small" 
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Data zgłoszenia
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedIncident.date}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={selectedIncident.status} 
                    color={getStatusColor(selectedIncident.status)} 
                    size="small" 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Zgłaszający
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedIncident.reportedBy}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Naruszone dane
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedIncident.affectedData}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Opis incydentu
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedIncident.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Podjęte działania
                  </Typography>
                  <Typography variant="body1">
                    {selectedIncident.actions}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailsDialog}>Zamknij</Button>
              {selectedIncident.status !== 'Zamknięty' && (
                <Button variant="contained" color="primary">
                  Aktualizuj status
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default IncidentsPage;
