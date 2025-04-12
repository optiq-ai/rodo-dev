import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Tabs, Tab, List, ListItem, ListItemIcon, ListItemText, Divider, Chip } from '@mui/material';

// Komponent testowy dla zakładki Zarządzanie IT
const ITManagementPageTest: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Test zakładki Zarządzanie IT
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Testy funkcjonalności
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Inwentaryzacja sprzętu IT" secondary="Rejestrowanie i zarządzanie sprzętem IT" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Audyt IT" secondary="Przeprowadzanie i dokumentowanie audytów IT" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Analiza ryzyka" secondary="Analiza ryzyka dla bezpieczeństwa informacji" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Zarządzanie obszarami fizycznymi" secondary="Zarządzanie obszarami przetwarzania danych" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Kontrola dostępu" secondary="Zarządzanie dostępem do danych i systemów" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Szyfrowanie danych" secondary="Konfiguracja i zarządzanie szyfrowaniem danych" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Zarządzanie incydentami IT" secondary="Rejestrowanie i obsługa incydentów IT" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default ITManagementPageTest;
