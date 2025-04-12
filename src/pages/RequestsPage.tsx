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
  Alert,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../services/auth/AuthContext';

// Typy danych dla wniosków
interface Request {
  id: number;
  type: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';
  typeName: string;
  status: 'Nowy' | 'W trakcie' | 'Zakończony' | 'Odrzucony';
  submissionDate: string;
  deadlineDate: string;
  dataSubject: string;
  contactInfo: string;
  description: string;
  assignedTo: string;
  notes: string;
}

// Przykładowe dane wniosków
const mockRequests: Request[] = [
  {
    id: 1,
    type: 'access',
    typeName: 'Dostęp do danych',
    status: 'W trakcie',
    submissionDate: '2025-04-05',
    deadlineDate: '2025-05-05',
    dataSubject: 'Jan Kowalski',
    contactInfo: 'jan.kowalski@example.com',
    description: 'Prośba o dostęp do wszystkich danych osobowych przetwarzanych przez firmę.',
    assignedTo: 'Anna Nowak',
    notes: 'Dane z systemów HR i CRM zostały już zebrane. Oczekiwanie na dane z systemu marketingowego.'
  },
  {
    id: 2,
    type: 'erasure',
    typeName: 'Usunięcie danych',
    status: 'Nowy',
    submissionDate: '2025-04-10',
    deadlineDate: '2025-05-10',
    dataSubject: 'Maria Wiśniewska',
    contactInfo: 'maria.wisniewska@example.com',
    description: 'Żądanie usunięcia wszystkich danych osobowych z systemów firmy.',
    assignedTo: '',
    notes: ''
  },
  {
    id: 3,
    type: 'rectification',
    typeName: 'Sprostowanie danych',
    status: 'Zakończony',
    submissionDate: '2025-03-15',
    deadlineDate: '2025-04-15',
    dataSubject: 'Piotr Nowicki',
    contactInfo: 'piotr.nowicki@example.com',
    description: 'Prośba o poprawienie błędnego adresu zamieszkania w systemie.',
    assignedTo: 'Michał Kowalczyk',
    notes: 'Dane zostały poprawione w systemie CRM i HR. Potwierdzenie wysłane do klienta.'
  },
  {
    id: 4,
    type: 'portability',
    typeName: 'Przeniesienie danych',
    status: 'Odrzucony',
    submissionDate: '2025-03-28',
    deadlineDate: '2025-04-28',
    dataSubject: 'Katarzyna Lewandowska',
    contactInfo: 'katarzyna.lewandowska@example.com',
    description: 'Prośba o przeniesienie danych do konkurencyjnej firmy.',
    assignedTo: 'Tomasz Wójcik',
    notes: 'Wniosek odrzucony ze względu na brak możliwości technicznych przeniesienia danych w żądanym formacie.'
  },
];

const RequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>(mockRequests);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);
  const [newRequest, setNewRequest] = useState<Partial<Request>>({
    type: 'access',
    typeName: 'Dostęp do danych',
    dataSubject: '',
    contactInfo: '',
    description: ''
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Kroki formularza
  const steps = ['Dane wnioskodawcy', 'Typ wniosku', 'Szczegóły wniosku', 'Podsumowanie'];

  // Filtrowanie wniosków
  useEffect(() => {
    let result = [...requests];
    
    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(request => request.type === typeFilter);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(request => 
        request.dataSubject.toLowerCase().includes(term) || 
        request.description.toLowerCase().includes(term) ||
        request.contactInfo.toLowerCase().includes(term)
      );
    }
    
    setFilteredRequests(result);
  }, [requests, statusFilter, typeFilter, searchTerm]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setActiveStep(0);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewRequest({
      type: 'access',
      typeName: 'Dostęp do danych',
      dataSubject: '',
      contactInfo: '',
      description: ''
    });
    setActiveStep(0);
  };

  const handleOpenDetailsDialog = (request: Request) => {
    setSelectedRequest(request);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedRequest(null);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };

  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setNewRequest(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    const type = event.target.value as Request['type'];
    let typeName = '';
    
    switch (type) {
      case 'access':
        typeName = 'Dostęp do danych';
        break;
      case 'rectification':
        typeName = 'Sprostowanie danych';
        break;
      case 'erasure':
        typeName = 'Usunięcie danych';
        break;
      case 'restriction':
        typeName = 'Ograniczenie przetwarzania';
        break;
      case 'portability':
        typeName = 'Przeniesienie danych';
        break;
      case 'objection':
        typeName = 'Sprzeciw wobec przetwarzania';
        break;
    }
    
    setNewRequest(prev => ({ ...prev, type, typeName }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmitRequest = () => {
    const today = new Date();
    const deadline = new Date();
    deadline.setDate(today.getDate() + 30); // 30 dni na odpowiedź
    
    const newRequestComplete: Request = {
      id: requests.length + 1,
      type: newRequest.type as Request['type'],
      typeName: newRequest.typeName as string,
      status: 'Nowy',
      submissionDate: today.toISOString().split('T')[0],
      deadlineDate: deadline.toISOString().split('T')[0],
      dataSubject: newRequest.dataSubject as string,
      contactInfo: newRequest.contactInfo as string,
      description: newRequest.description as string,
      assignedTo: '',
      notes: ''
    };
    
    setRequests(prev => [newRequestComplete, ...prev]);
    handleCloseDialog();
    setShowSuccessAlert(true);
    
    // Ukryj alert po 5 sekundach
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Nowy':
        return 'info';
      case 'W trakcie':
        return 'warning';
      case 'Zakończony':
        return 'success';
      case 'Odrzucony':
        return 'error';
      default:
        return 'default';
    }
  };

  // Renderowanie kroku formularza
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                required
                margin="dense"
                id="dataSubject"
                name="dataSubject"
                label="Imię i nazwisko wnioskodawcy"
                type="text"
                fullWidth
                variant="outlined"
                value={newRequest.dataSubject}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                margin="dense"
                id="contactInfo"
                name="contactInfo"
                label="Dane kontaktowe (email lub telefon)"
                type="text"
                fullWidth
                variant="outlined"
                value={newRequest.contactInfo}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <FormControl fullWidth margin="dense">
            <InputLabel id="request-type-label">Typ wniosku</InputLabel>
            <Select
              labelId="request-type-label"
              id="type"
              value={newRequest.type}
              label="Typ wniosku"
              onChange={handleTypeChange}
            >
              <MenuItem value="access">Dostęp do danych</MenuItem>
              <MenuItem value="rectification">Sprostowanie danych</MenuItem>
              <MenuItem value="erasure">Usunięcie danych</MenuItem>
              <MenuItem value="restriction">Ograniczenie przetwarzania</MenuItem>
              <MenuItem value="portability">Przeniesienie danych</MenuItem>
              <MenuItem value="objection">Sprzeciw wobec przetwarzania</MenuItem>
            </Select>
          </FormControl>
        );
      case 2:
        return (
          <TextField
            required
            margin="dense"
            id="description"
            name="description"
            label="Szczegółowy opis wniosku"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newRequest.description}
            onChange={handleInputChange}
          />
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Podsumowanie wniosku
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Wnioskodawca
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {newRequest.dataSubject}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Dane kontaktowe
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {newRequest.contactInfo}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Typ wniosku
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {newRequest.typeName}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Opis wniosku
                </Typography>
                <Typography variant="body1" paragraph>
                  {newRequest.description}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return 'Nieznany krok';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Wnioski podmiotów danych
      </Typography>
      
      {showSuccessAlert && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setShowSuccessAlert(false)}>
          Wniosek został pomyślnie złożony i zostanie rozpatrzony w ciągu 30 dni.
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
              <MenuItem value="Zakończony">Zakończone</MenuItem>
              <MenuItem value="Odrzucony">Odrzucone</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="type-filter-label">Typ wniosku</InputLabel>
            <Select
              labelId="type-filter-label"
              id="type-filter"
              value={typeFilter}
              label="Typ wniosku"
              onChange={handleTypeFilterChange}
            >
              <MenuItem value="all">Wszystkie</MenuItem>
              <MenuItem value="access">Dostęp do danych</MenuItem>
              <MenuItem value="rectification">Sprostowanie danych</MenuItem>
              <MenuItem value="erasure">Usunięcie danych</MenuItem>
              <MenuItem value="restriction">Ograniczenie przetwarzania</MenuItem>
              <MenuItem value="portability">Przeniesienie danych</MenuItem>
              <MenuItem value="objection">Sprzeciw wobec przetwarzania</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Nowy wniosek
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="requests table">
          <TableHead>
            <TableRow>
              <TableCell>Wnioskodawca</TableCell>
              <TableCell>Typ wniosku</TableCell>
              <TableCell>Data złożenia</TableCell>
              <TableCell>Termin realizacji</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Przypisany do</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      {request.dataSubject}
                    </Box>
                  </TableCell>
                  <TableCell>{request.typeName}</TableCell>
                  <TableCell>{request.submissionDate}</TableCell>
                  <TableCell>{request.deadlineDate}</TableCell>
                  <TableCell>
                    <Chip 
                      label={request.status} 
                      color={getStatusColor(request.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{request.assignedTo || '-'}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenDetailsDialog(request)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="secondary">
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
                <TableCell colSpan={7} align="center">
                  Nie znaleziono wniosków spełniających kryteria wyszukiwania
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Dialog do tworzenia nowego wniosku */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Nowy wniosek podmiotu danych</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {getStepContent(activeStep)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          {activeStep > 0 && (
            <Button onClick={handleBack}>
              Wstecz
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button 
              onClick={handleSubmitRequest} 
              variant="contained"
              disabled={!newRequest.dataSubject || !newRequest.contactInfo || !newRequest.description}
            >
              Złóż wniosek
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              variant="contained"
              disabled={
                (activeStep === 0 && (!newRequest.dataSubject || !newRequest.contactInfo)) ||
                (activeStep === 2 && !newRequest.description)
              }
            >
              Dalej
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Dialog ze szczegółami wniosku */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="md" fullWidth>
        {selectedRequest && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  Wniosek: {selectedRequest.typeName}
                </Typography>
                <Chip 
                  label={selectedRequest.status} 
                  color={getStatusColor(selectedRequest.status)} 
                  size="small" 
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Wnioskodawca
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.dataSubject}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dane kontaktowe
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.contactInfo}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Data złożenia
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.submissionDate}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Termin realizacji
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRequest.deadlineDate}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Opis wniosku
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedRequest.description}
                  </Typography>
                </Grid>
                {selectedRequest.assignedTo && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Przypisany do
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedRequest.assignedTo}
                    </Typography>
                  </Grid>
                )}
                {selectedRequest.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Notatki
                    </Typography>
                    <Typography variant="body1">
                      {selectedRequest.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailsDialog}>Zamknij</Button>
              {selectedRequest.status !== 'Zakończony' && selectedRequest.status !== 'Odrzucony' && (
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

export default RequestsPage;
