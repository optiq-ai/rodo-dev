// @ts-nocheck
import React, { useState } from 'react';
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
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';

// Przykładowe dane rejestrów
const registersData = [
  { id: 1, name: 'Rejestr czynności przetwarzania', entries: 24, lastUpdated: '2025-04-10', status: 'Aktualny' },
  { id: 2, name: 'Rejestr kategorii czynności przetwarzania', entries: 12, lastUpdated: '2025-04-05', status: 'Aktualny' },
  { id: 3, name: 'Rejestr umów powierzenia', entries: 8, lastUpdated: '2025-03-28', status: 'Wymaga aktualizacji' },
  { id: 4, name: 'Rejestr udostępnień i zapytań', entries: 15, lastUpdated: '2025-04-08', status: 'Aktualny' },
  { id: 5, name: 'Rejestr zgód na przetwarzanie danych', entries: 45, lastUpdated: '2025-04-12', status: 'Aktualny' },
  { id: 6, name: 'Rejestr naruszeń', entries: 3, lastUpdated: '2025-03-15', status: 'Aktualny' },
  { id: 7, name: 'Rejestr żądań podmiotów danych', entries: 18, lastUpdated: '2025-04-01', status: 'Aktualny' },
  { id: 8, name: 'Rejestr klauzul informacyjnych', entries: 10, lastUpdated: '2025-02-20', status: 'Wymaga aktualizacji' },
  { id: 9, name: 'Rejestr upoważnień', entries: 32, lastUpdated: '2025-03-25', status: 'Aktualny' },
  { id: 10, name: 'Rejestr ocen skutków wpływu na prywatność (DPIA)', entries: 5, lastUpdated: '2025-03-10', status: 'Aktualny' },
  { id: 11, name: 'Rejestr zasobów i aktywów IT', entries: 28, lastUpdated: '2025-02-15', status: 'Wymaga aktualizacji' },
];

// Przykładowe dane wpisów w rejestrze czynności przetwarzania
const processingActivitiesData = [
  { 
    id: 1, 
    name: 'Rekrutacja pracowników', 
    purpose: 'Przeprowadzenie procesu rekrutacji', 
    dataCategories: 'Dane identyfikacyjne, dane kontaktowe, dane o wykształceniu i doświadczeniu', 
    legalBasis: 'Art. 6 ust. 1 lit. b RODO', 
    retentionPeriod: '6 miesięcy po zakończeniu rekrutacji',
    riskLevel: 'Niski'
  },
  { 
    id: 2, 
    name: 'Obsługa kadrowa pracowników', 
    purpose: 'Realizacja obowiązków pracodawcy', 
    dataCategories: 'Dane identyfikacyjne, dane kontaktowe, dane o wykształceniu, dane finansowe', 
    legalBasis: 'Art. 6 ust. 1 lit. c RODO', 
    retentionPeriod: '50 lat od zakończenia zatrudnienia',
    riskLevel: 'Średni'
  },
  { 
    id: 3, 
    name: 'Marketing bezpośredni', 
    purpose: 'Promocja produktów i usług', 
    dataCategories: 'Dane identyfikacyjne, dane kontaktowe, historia zakupów', 
    legalBasis: 'Art. 6 ust. 1 lit. f RODO', 
    retentionPeriod: '3 lata od ostatniego kontaktu',
    riskLevel: 'Średni'
  },
  { 
    id: 4, 
    name: 'Monitoring wizyjny', 
    purpose: 'Zapewnienie bezpieczeństwa osób i mienia', 
    dataCategories: 'Wizerunek', 
    legalBasis: 'Art. 6 ust. 1 lit. f RODO', 
    retentionPeriod: '30 dni',
    riskLevel: 'Wysoki'
  },
];

const RegistersPage: React.FC = () => {
  const [selectedRegister, setSelectedRegister] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEntryDialog, setOpenEntryDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleRegisterClick = (registerId: number) => {
    setSelectedRegister(registerId);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenEntryDialog = () => {
    setOpenEntryDialog(true);
  };

  const handleCloseEntryDialog = () => {
    setOpenEntryDialog(false);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value);
  };

  const filteredRegisters = filterStatus === 'all' 
    ? registersData 
    : registersData.filter(register => 
        filterStatus === 'needsUpdate' 
          ? register.status === 'Wymaga aktualizacji' 
          : register.status === 'Aktualny'
      );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Rejestry RODO
      </Typography>
      
      {selectedRegister === null ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <FormControl sx={{ width: 250 }}>
              <InputLabel id="status-filter-label">Filtruj według statusu</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filterStatus}
                label="Filtruj według statusu"
                onChange={handleFilterChange}
                size="small"
              >
                <MenuItem value="all">Wszystkie</MenuItem>
                <MenuItem value="current">Aktualne</MenuItem>
                <MenuItem value="needsUpdate">Wymagające aktualizacji</MenuItem>
              </Select>
            </FormControl>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Dodaj rejestr
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {filteredRegisters.map((register) => (
              <Grid item xs={12} sm={6} md={4} key={register.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => handleRegisterClick(register.id)}
                >
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {register.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Liczba wpisów:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {register.entries}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Ostatnia aktualizacja:
                      </Typography>
                      <Typography variant="body2">
                        {register.lastUpdated}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Status:
                      </Typography>
                      <Chip 
                        label={register.status} 
                        color={register.status === 'Aktualny' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => setSelectedRegister(null)}
            >
              Powrót do listy rejestrów
            </Button>
            <Typography variant="h5">
              {registersData.find(r => r.id === selectedRegister)?.name}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenEntryDialog}
            >
              Dodaj wpis
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="register entries table">
              <TableHead>
                <TableRow>
                  <TableCell>Nazwa czynności</TableCell>
                  <TableCell>Cel przetwarzania</TableCell>
                  <TableCell>Kategorie danych</TableCell>
                  <TableCell>Podstawa prawna</TableCell>
                  <TableCell>Okres retencji</TableCell>
                  <TableCell>Poziom ryzyka</TableCell>
                  <TableCell>Akcje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processingActivitiesData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell component="th" scope="row">
                      {entry.name}
                    </TableCell>
                    <TableCell>{entry.purpose}</TableCell>
                    <TableCell>{entry.dataCategories}</TableCell>
                    <TableCell>{entry.legalBasis}</TableCell>
                    <TableCell>{entry.retentionPeriod}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {entry.riskLevel === 'Wysoki' && <WarningIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />}
                        {entry.riskLevel === 'Średni' && <SecurityIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />}
                        <Chip 
                          label={entry.riskLevel} 
                          color={
                            entry.riskLevel === 'Niski' ? 'success' :
                            entry.riskLevel === 'Średni' ? 'warning' : 'error'
                          } 
                          size="small" 
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {/* Dialog do dodawania rejestru */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Dodaj nowy rejestr</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wprowadź informacje o nowym rejestrze.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Nazwa rejestru"
            type="text"
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            label="Opis"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleCloseDialog} variant="contained">Zapisz</Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog do dodawania wpisu */}
      <Dialog open={openEntryDialog} onClose={handleCloseEntryDialog} maxWidth="md" fullWidth>
        <DialogTitle>Dodaj nowy wpis do rejestru</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wprowadź informacje o nowej czynności przetwarzania.
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Nazwa czynności"
                type="text"
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="purpose"
                label="Cel przetwarzania"
                type="text"
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="dataCategories"
                label="Kategorie danych"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="legalBasis"
                label="Podstawa prawna"
                type="text"
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="retentionPeriod"
                label="Okres retencji"
                type="text"
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel id="risk-level-label">Poziom ryzyka</InputLabel>
                <Select
                  labelId="risk-level-label"
                  id="riskLevel"
                  label="Poziom ryzyka"
                >
                  <MenuItem value="Niski">Niski</MenuItem>
                  <MenuItem value="Średni">Średni</MenuItem>
                  <MenuItem value="Wysoki">Wysoki</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEntryDialog}>Anuluj</Button>
          <Button onClick={handleCloseEntryDialog} variant="contained">Zapisz</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegistersPage;
