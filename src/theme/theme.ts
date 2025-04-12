import { createTheme } from '@mui/material/styles';

// Schemat kolorów z dokumentacji
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // ciemnoniebieski - używany w nagłówku aplikacji i przyciskach akcji
      light: '#757de8',
      dark: '#002984',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4285f4', // niebieski - przyciski, elementy aktywne, zaznaczenia
      light: '#80b4ff',
      dark: '#0059c1',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50', // zielony - pozytywne wskaźniki, potwierdzenia, elementy "sukcesu"
      light: '#80e27e',
      dark: '#087f23',
      contrastText: '#ffffff',
    },
    error: {
      main: '#f44336', // czerwony - ostrzeżenia, anulowanie, elementy krytyczne
      light: '#ff7961',
      dark: '#ba000d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ffc107', // pomarańczowy/żółty - powiadomienia, elementy wymagające uwagi
      light: '#fff350',
      dark: '#c79100',
      contrastText: '#000000',
    },
    background: {
      default: '#f5f7fa', // jasne, białe lub jasnoszare - zapewnia czystość i czytelność
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', // Czysta, bezszeryfowa czcionka
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 8, // Karty/panele z lekko zaokrąglonymi rogami
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        containedPrimary: {
          backgroundColor: '#3f51b5', // ciemnoniebieski z białym tekstem
          color: '#ffffff',
        },
        outlinedPrimary: {
          borderColor: '#3f51b5', // białe z niebieską obwódką i tekstem
          color: '#3f51b5',
        },
        containedSuccess: {
          backgroundColor: '#4caf50', // zielone
          color: '#ffffff',
        },
        containedError: {
          backgroundColor: '#f44336', // czerwone
          color: '#ffffff',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.23)', // ciemna obwódka
            },
            '&:hover fieldset': {
              borderColor: '#3f51b5',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3f51b5',
            },
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#3f51b5', // niebieskie zaznaczenie
          '&.Mui-checked': {
            color: '#3f51b5',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f7fa', // nagłówki kolumn z wyróżniającym się tłem
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: '#ffffff', // naprzemienne jasne
          },
          '&:nth-of-type(even)': {
            backgroundColor: '#f5f7fa', // i jeszcze jaśniejsze wiersze
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // delikatny cień
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
