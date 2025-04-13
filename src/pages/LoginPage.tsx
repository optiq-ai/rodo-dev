import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Paper, 
  CircularProgress,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormHelperText
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/auth/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { login, isAuthenticated, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);
  
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await login(username, password);
      // Redirect will happen in useEffect
    } catch (err) {
      console.error('Login error:', err);
      // Error is handled by AuthContext
    }
  };
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'error';
    if (passwordStrength <= 3) return 'warning';
    return 'success';
  };
  
  const getPasswordStrengthLabel = () => {
    if (!password) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
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
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            RODO Application Login
          </Typography>
          
          {error && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography color="error" align="center">
                {error}
              </Typography>
            </Box>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!errors.username}
              helperText={errors.username}
              disabled={loading}
            />
            
            <FormControl variant="outlined" fullWidth margin="normal" error={!!errors.password}>
              <InputLabel htmlFor="password">Password *</InputLabel>
              <OutlinedInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
                disabled={loading}
              />
              {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
            </FormControl>
            
            {password && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={3}>
                    <Typography variant="body2">
                      {getPasswordStrengthLabel()}
                    </Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
                      <Box
                        sx={{
                          width: `${passwordStrength * 20}%`,
                          height: 4,
                          bgcolor: `${getPasswordStrengthColor()}.main`,
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
