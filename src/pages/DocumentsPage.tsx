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
  Tabs,
  Tab,
  Chip,
  Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`documents-tabpanel-${index}`}
      aria-labelledby={`documents-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `documents-tab-${index}`,
    'aria-controls': `documents-tabpanel-${index}`,
  };
}

// Przykładowe dane dokumentów
const documentsData = [
  { id: 1, name: 'Polityka Ochrony Danych Osobowych', category: 'Polityka', version: '1.2', lastModified: '2025-03-15', status: 'Aktywny' },
  { id: 2, name: 'Instrukcja zarządzania systemem informatycznym', category: 'Instrukcja', version: '2.0', lastModified: '2025-02-20', status: 'Aktywny' },
  { id: 3, name: 'Umowa powierzenia przetwarzania danych', category: 'Umowa', version: '1.0', lastModified: '2025-04-01', status: 'Projekt' },
  { id: 4, name: 'Rejestr czynności przetwarzania', category: 'Rejestr', version: '3.1', lastModified: '2025-03-30', status: 'Aktywny' },
  { id: 5, name: 'Procedura obsługi naruszeń', category: 'Procedura', version: '1.5', lastModified: '2025-01-10', status: 'Archiwalny' },
];

// Przykładowe dane szablonów
const templatesData = [
  { id: 1, name: 'Szablon umowy powierzenia', category: 'Umowa', lastModified: '2025-02-15' },
  { id: 2, name: 'Szablon klauzuli informacyjnej', category: 'Klauzula', lastModified: '2025-03-10' },
  { id: 3, name: 'Szablon zgody na przetwarzanie danych', category: 'Zgoda', lastModified: '2025-01-25' },
];

const DocumentsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const filteredDocuments = documentsData.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = templatesData.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Zarządzanie dokumentacją
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          label="Wyszukaj"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '300px' }}
        />
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Dodaj dokument
        </Button>
      </Box>
      
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="document tabs">
            <Tab label="Dokumenty" {...a11yProps(0)} />
            <Tab label="Szablony" {...a11yProps(1)} />
            <Tab label="Archiwum" {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="documents table">
              <TableHead>
                <TableRow>
                  <TableCell>Nazwa dokumentu</TableCell>
                  <TableCell>Kategoria</TableCell>
                  <TableCell>Wersja</TableCell>
                  <TableCell>Ostatnia modyfikacja</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Akcje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocuments.filter(doc => doc.status !== 'Archiwalny').map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell component="th" scope="row">
                      {doc.name}
                    </TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell>{doc.lastModified}</TableCell>
                    <TableCell>
                      <Chip 
                        label={doc.status} 
                        color={doc.status === 'Aktywny' ? 'success' : 'warning'} 
                        size="small" 
                      />
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
                      <IconButton size="small" color="primary">
                        <FileDownloadIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="templates table">
              <TableHead>
                <TableRow>
                  <TableCell>Nazwa szablonu</TableCell>
                  <TableCell>Kategoria</TableCell>
                  <TableCell>Ostatnia modyfikacja</TableCell>
                  <TableCell>Akcje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell component="th" scope="row">
                      {template.name}
                    </TableCell>
                    <TableCell>{template.category}</TableCell>
                    <TableCell>{template.lastModified}</TableCell>
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
                      <IconButton size="small" color="primary">
                        <FileDownloadIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="archive table">
              <TableHead>
                <TableRow>
                  <TableCell>Nazwa dokumentu</TableCell>
                  <TableCell>Kategoria</TableCell>
                  <TableCell>Wersja</TableCell>
                  <TableCell>Ostatnia modyfikacja</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Akcje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocuments.filter(doc => doc.status === 'Archiwalny').map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell component="th" scope="row">
                      {doc.name}
                    </TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell>{doc.lastModified}</TableCell>
                    <TableCell>
                      <Chip 
                        label={doc.status} 
                        color="default" 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" color="primary">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <FileDownloadIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
      
      {/* Dialog do dodawania dokumentu */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Dodaj nowy dokument</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Wprowadź informacje o nowym dokumencie.
          </DialogContentText>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label="Nazwa dokumentu"
                type="text"
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="category"
                label="Kategoria"
                type="text"
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense"
                id="version"
                label="Wersja"
                type="text"
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="file"
                type="file"
                fullWidth
                variant="outlined"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleCloseDialog} variant="contained">Zapisz</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentsPage;
