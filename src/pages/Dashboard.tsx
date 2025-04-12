// @ts-nocheck
import React from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Chip
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';

// Komponent dashboardu
const Dashboard: React.FC = () => {
  // Przykładowe dane dla dashboardu
  const pendingRequests = 5;
  const incidents = 2;
  const upcomingDeadlines = 8;
  const complianceScore = 87;
  const riskLevel = 'Średni';

  // Przykładowe ostatnie aktywności
  const recentActivities = [
    { id: 1, type: 'request', description: 'Nowy wniosek o dostęp do danych', date: '2025-04-12', status: 'Nowy' },
    { id: 2, type: 'incident', description: 'Zgłoszenie naruszenia bezpieczeństwa', date: '2025-04-11', status: 'W trakcie' },
    { id: 3, type: 'compliance', description: 'Zaktualizowano politykę bezpieczeństwa', date: '2025-04-10', status: 'Zakończone' },
    { id: 4, type: 'deadline', description: 'Zbliża się termin retencji danych', date: '2025-04-15', status: 'Oczekujące' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Karty z kluczowymi wskaźnikami */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Wnioski oczekujące
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ color: 'secondary.main', mr: 1 }} />
                <Typography variant="h4" component="div">
                  {pendingRequests}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Aktywne incydenty
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="h4" component="div">
                  {incidents}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Nadchodzące terminy
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h4" component="div">
                  {upcomingDeadlines}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Poziom zgodności
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AssignmentTurnedInIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h4" component="div">
                  {complianceScore}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={complianceScore} 
                color="success"
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Sekcja analizy ryzyka */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Analiza ryzyka
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ color: 'warning.main', mr: 1 }} />
              <Typography variant="body1">
                Aktualny poziom ryzyka: <Chip label={riskLevel} color="warning" size="small" />
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Ostatnia aktualizacja analizy ryzyka: 2025-04-05
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2">
              Główne obszary ryzyka:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Bezpieczeństwo danych osobowych" 
                  secondary="Poziom ryzyka: Średni" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Przetwarzanie danych wrażliwych" 
                  secondary="Poziom ryzyka: Wysoki" 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Udostępnianie danych podmiotom trzecim" 
                  secondary="Poziom ryzyka: Niski" 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        {/* Sekcja ostatnich aktywności */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ostatnie aktywności
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <React.Fragment key={activity.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      {activity.type === 'request' && <PersonIcon color="secondary" />}
                      {activity.type === 'incident' && <WarningIcon color="error" />}
                      {activity.type === 'compliance' && <AssignmentTurnedInIcon color="success" />}
                      {activity.type === 'deadline' && <NotificationsIcon color="warning" />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {activity.date}
                          </Typography>
                          {` — Status: ${activity.status}`}
                        </React.Fragment>
                      }
                    />
                    <Chip 
                      label={activity.status} 
                      size="small"
                      color={
                        activity.status === 'Nowy' ? 'secondary' :
                        activity.status === 'W trakcie' ? 'warning' :
                        activity.status === 'Zakończone' ? 'success' : 'default'
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Sekcja szybkiego dostępu */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Szybki dostęp
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
              <PersonIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="body2">Wnioski podmiotów</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
              <WarningIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="body2">Zgłoś incydent</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
              <NotificationsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="body2">Terminy</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
              <AssignmentTurnedInIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="body2">Zgodność</Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ textAlign: 'center', p: 2, height: '100%' }}>
              <SecurityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="body2">Analiza ryzyka</Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Dashboard;
