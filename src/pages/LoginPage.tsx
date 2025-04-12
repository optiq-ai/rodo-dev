// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Container,
  Avatar,
  Grid,
  Link,
  Snackbar,
  Alert,
  FormHelperText,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../services/auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { validatePassword, sanitizeInput } from '../utils/securityUtils';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    message: string;
  } | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sprawdzenie, czy użytkownik został przekierowany z innej strony
  const from = location.state?.from?.pathname || '/';

  // Sprawdzanie siły hasła
  useEffect(() => {
    if (password) {
      setPasswordStrength(validatePassword(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username || !password) {
      setError('Proszę wprowadzić nazwę użytkownika i hasło');
      setIsLoading(false);
      return;
    }

    // Sanityzacja danych wejściowych
    const sanitizedUsername = sanitizeInput(username);

    try {
      // Symulacja opóźnienia sieciowego dla bezpieczeństwa
      // W rzeczywistej aplikacji to byłoby rzeczywiste opóźnienie zapytania do API
      setTimeout(async () => {
        const success = await login(sanitizedUsername, password);
        if (success) {
          setOpenSnackbar(true);
          // Przekierowanie do strony, z której użytkownik przyszedł, lub do dashboardu
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1500);
        } else {
          setError('Nieprawidłowa nazwa użytkownika lub hasło');
        }
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
      console.error('Login error:', err);
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Logowanie do aplikacji RODO
        </Typography>
        <Paper elevation={3} sx={{ p: 4, mt: 3, width: '100%' }}>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nazwa użytkownika"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!error}
              disabled={isLoading}
              inputProps={{
                maxLength: 50, // Ograniczenie długości dla bezpieczeństwa
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Hasło"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {passwordStrength && password && (
              <FormHelperText
                error={!passwordStrength.isValid}
                sx={{
                  color: 
                    passwordStrength.strength === 'strong' ? 'success.main' :
                    passwordStrength.strength === 'medium' ? 'warning.main' : 'error.main'
                }}
              >
                {passwordStrength.message}
              </FormHelperText>
            )}
            {error && (
              <FormHelperText error>
                {error}
              </FormHelperText>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Zaloguj się'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Zapomniałeś hasła?
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Skontaktuj się z administratorem"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Aplikacja RODO - Kompleksowe zarządzanie ochroną danych osobowych
        </Typography>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Logowanie pomyślne! Przekierowywanie...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LoginPage;
