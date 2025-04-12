// @ts-nocheck
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Slider,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AddIcon from '@mui/icons-material/Add';

// Przykładowe dane analizy ryzyka
const riskAnalysisData = {
  lastUpdated: '2025-04-05',
  overallRiskLevel: 'Średni',
  riskAreas: [
    { id: 1, name: 'Bezpieczeństwo danych osobowych', level: 'Średni', score: 65 },
    { id: 2, name: 'Przetwarzanie danych wrażliwych', level: 'Wysoki', score: 85 },
    { id: 3, name: 'Udostępnianie danych podmiotom trzecim', level: 'Niski', score: 30 },
    { id: 4, name: 'Przechowywanie danych', level: 'Średni', score: 55 },
    { id: 5, name: 'Zgoda na przetwarzanie danych', level: 'Niski', score: 25 },
  ],
  vulnerabilities: [
    { id: 1, name: 'Brak szyfrowania danych w spoczynku', severity: 'Wysoka', relatedArea: 'Bezpieczeństwo danych osobowych' },
    { id: 2, name: 'Niewystarczające zabezpieczenia fizyczne', severity: 'Średnia', relatedArea: 'Bezpieczeństwo danych osobowych' },
    { id: 3, name: 'Brak procedury weryfikacji zgód', severity: 'Niska', relatedArea: 'Zgoda na przetwarzanie danych' },
    { id: 4, name: 'Nieaktualne umowy powierzenia', severity: 'Wysoka', relatedArea: 'Udostępnianie danych podmiotom trzecim' },
  ],
  recommendations: [
    { id: 1, description: 'Wdrożyć szyfrowanie danych w spoczynku', priority: 'Wysoki', status: 'Nierozpoczęte' },
    { id: 2, description: 'Poprawić zabezpieczenia fizyczne serwerowni', priority: 'Średni', status: 'W trakcie' },
    { id: 3, description: 'Opracować procedurę weryfikacji zgód', priority: 'Niski', status: 'Zakończone' },
    { id: 4, description: 'Zaktualizować umowy powierzenia', priority: 'Wysoki', status: 'Nierozpoczęte' },
  ]
};

// Przykładowe dane DPIA
const dpiaData = [
  { 
    id: 1, 
    name: 'Wdrożenie systemu monitoringu wizyjnego', 
    status: 'Zakończona', 
    date: '2025-01-15',
    riskLevel: 'Wysoki',
    recommendation: 'Wdrożenie z dodatkowymi zabezpieczeniami'
  },
  { 
    id: 2, 
    name: 'Nowa aplikacja mobilna dla klientów', 
    status: 'W trakcie', 
    date: '2025-04-01',
    riskLevel: 'Średni',
    recommendation: 'Oczekuje na zakończenie'
  },
  { 
    id: 3, 
    name: 'System profilowania klientów', 
    status: 'Zakończona', 
    date: '2024-11-20',
    riskLevel: 'Wysoki',
    recommendation: 'Wdrożenie z istotnymi modyfikacjami'
  },
];

const RiskAnalysisPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dpia'>('overview');
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Niski':
        return 'success';
      case 'Średni':
        return 'warning';
      case 'Wysoki':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Zakończone':
        return <CheckCircleIcon color="success" />;
      case 'W trakcie':
        return <WarningIcon color="warning" />;
      case 'Nierozpoczęte':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analiza ryzyka i ocena skutków
      </Typography>
      
      <Box sx={{ display: 'flex', mb: 3 }}>
        <Button 
          variant={activeTab === 'overview' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('overview')}
          sx={{ mr: 2 }}
        >
          Analiza ryzyka
        </Button>
        <Button 
          variant={activeTab === 'dpia' ? 'contained' : 'outlined'} 
          onClick={() => setActiveTab('dpia')}
        >
          Ocena skutków (DPIA)
        </Button>
      </Box>
      
      {activeTab === 'overview' ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1">
              Ostatnia aktualizacja: {riskAnalysisData.lastUpdated}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Nowa analiza ryzyka
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Ogólny poziom ryzyka
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon 
                    sx={{ 
                      fontSize: 40, 
                      mr: 2,
                      color: riskAnalysisData.overallRiskLevel === 'Niski' ? 'success.main' :
                             riskAnalysisData.overallRiskLevel === 'Średni' ? 'warning.main' : 'error.main'
                    }} 
                  />
                  <Typography variant="h4">
                    {riskAnalysisData.overallRiskLevel}
                  </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Obszary ryzyka
                </Typography>
                {riskAnalysisData.riskAreas.map((area) => (
                  <Box key={area.id} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body1">{area.name}</Typography>
                      <Chip 
                        label={area.level} 
                        color={getRiskColor(area.level)} 
                        size="small" 
                      />
                    </Box>
                    <Slider
                      value={area.score}
                      disabled
                      valueLabelDisplay="auto"
                      step={1}
                      min={0}
                      max={100}
                      color={
                        area.level === 'Niski' ? 'success' :
                        area.level === 'Średni' ? 'warning' : 'error'
                      }
                    />
                  </Box>
                ))}
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Zidentyfikowane podatności
                </Typography>
                <List>
                  {riskAnalysisData.vulnerabilities.map((vulnerability) => (
                    <ListItem key={vulnerability.id}>
                      <ListItemIcon>
                        <WarningIcon 
                          color={
                            vulnerability.severity === 'Wysoka' ? 'error' :
                            vulnerability.severity === 'Średnia' ? 'warning' : 'success'
                          } 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={vulnerability.name}
                        secondary={`Poziom: ${vulnerability.severity} | Obszar: ${vulnerability.relatedArea}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Rekomendacje
                </Typography>
                <List>
                  {riskAnalysisData.recommendations.map((recommendation) => (
                    <ListItem key={recommendation.id}>
                      <ListItemIcon>
                        {getStatusIcon(recommendation.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={recommendation.description}
                        secondary={`Priorytet: ${recommendation.priority} | Status: ${recommendation.status}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1">
              Oceny skutków dla ochrony danych (DPIA)
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Nowa ocena DPIA
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            {dpiaData.map((dpia) => (
              <Grid item xs={12} md={6} lg={4} key={dpia.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {dpia.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status:
                      </Typography>
                      <Chip 
                        label={dpia.status} 
                        color={
                          dpia.status === 'Zakończona' ? 'success' :
                          dpia.status === 'W trakcie' ? 'warning' : 'default'
                        } 
                        size="small" 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Data:
                      </Typography>
                      <Typography variant="body2">
                        {dpia.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Poziom ryzyka:
                      </Typography>
                      <Chip 
                        label={dpia.riskLevel} 
                        color={getRiskColor(dpia.riskLevel)} 
                        size="small" 
                      />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Rekomendacja:
                    </Typography>
                    <Typography variant="body2">
                      {dpia.recommendation}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Dialog do tworzenia nowej analizy ryzyka */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {activeTab === 'overview' ? 'Nowa analiza ryzyka' : 'Nowa ocena skutków (DPIA)'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {activeTab === 'overview' 
              ? 'Wprowadź informacje do przeprowadzenia nowej analizy ryzyka.'
              : 'Wprowadź informacje do przeprowadzenia nowej oceny skutków dla ochrony danych (DPIA).'}
          </DialogContentText>
          
          {activeTab === 'overview' ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Nazwa analizy"
                  type="text"
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
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
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Obszary do analizy
                </Typography>
                {riskAnalysisData.riskAreas.map((area) => (
                  <Box key={area.id} sx={{ mb: 2 }}>
                    <FormControl fullWidth sx={{ mb: 1 }}>
                      <InputLabel id={`area-${area.id}-label`}>{area.name}</InputLabel>
                      <Select
                        labelId={`area-${area.id}-label`}
                        id={`area-${area.id}`}
                        label={area.name}
                        defaultValue="Średni"
                      >
                        <MenuItem value="Niski">Niski</MenuItem>
                        <MenuItem value="Średni">Średni</MenuItem>
                        <MenuItem value="Wysoki">Wysoki</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                ))}
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Nazwa procesu przetwarzania"
                  type="text"
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="description"
                  label="Opis procesu przetwarzania"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  id="dataCategories"
                  label="Kategorie danych"
                  type="text"
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="dense"
                  id="dataSubjects"
                  label="Kategorie osób"
                  type="text"
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="necessity"
                  label="Uzasadnienie konieczności przetwarzania"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="risks"
                  label="Zidentyfikowane ryzyka"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  id="measures"
                  label="Środki bezpieczeństwa"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleCloseDialog} variant="contained">Zapisz</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiskAnalysisPage;
