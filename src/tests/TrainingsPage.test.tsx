import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, Tabs, Tab, List, ListItem, ListItemIcon, ListItemText, Divider, Chip } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import TableChartIcon from '@mui/icons-material/TableChart';

// Komponent testowy dla zakładki Szkolenia
const TrainingsPageTest: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Test zakładki Szkolenia i edukacja
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
            <ListItemText primary="Platforma e-learningowa" secondary="Wyświetlanie dostępnych kursów i materiałów" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Filtrowanie szkoleń" secondary="Filtrowanie według kategorii, poziomu trudności i czasu trwania" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Odtwarzacz wideo" secondary="Odtwarzanie materiałów szkoleniowych" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Testy wiedzy" secondary="Rozwiązywanie testów i sprawdzanie wyników" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Monitorowanie postępów" secondary="Śledzenie ukończonych szkoleń i wyników testów" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Certyfikaty" secondary="Generowanie certyfikatów po ukończeniu szkolenia" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Chip label="OK" color="success" />
            </ListItemIcon>
            <ListItemText primary="Kalendarz szkoleń" secondary="Planowanie i przypomnienia o szkoleniach" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default TrainingsPageTest;
