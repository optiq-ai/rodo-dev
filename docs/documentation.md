# RODO Application - Dokumentacja

## Logowanie do aplikacji

Aplikacja RODO posiada domyślnych użytkowników, którzy są automatycznie tworzeni przy pierwszym uruchomieniu:

### Konto administratora
- Login: `admin`
- Hasło: `Admin123!`
- Uprawnienia: pełny dostęp do wszystkich funkcji aplikacji

### Konto inspektora ochrony danych (IOD)
- Login: `iod`
- Hasło: `Iod123!`
- Uprawnienia: dostęp do większości funkcji aplikacji z wyjątkiem zarządzania użytkownikami

## Konfiguracja środowiska

Aplikacja wymaga następujących zmiennych środowiskowych, które są zdefiniowane w pliku `.env`:

### Backend
- `NODE_ENV` - środowisko uruchomieniowe (development, production)
- `BACKEND_PORT` - port, na którym działa backend (domyślnie 3011)
- `DATABASE_URL` - URL połączenia do bazy danych PostgreSQL
- `JWT_SECRET` - tajny klucz do generowania tokenów JWT
- `JWT_EXPIRATION` - czas ważności tokenów JWT w sekundach
- `CORS_ORIGIN` - dozwolone źródła dla żądań CORS

### Frontend
- `FRONTEND_PORT` - port, na którym działa frontend (domyślnie 3010)
- `REACT_APP_API_URL` - URL API backendu
- `REACT_APP_WS_URL` - URL serwera WebSocket

### Baza danych
- `POSTGRES_USER` - nazwa użytkownika bazy danych
- `POSTGRES_PASSWORD` - hasło do bazy danych
- `POSTGRES_DB` - nazwa bazy danych

## Uruchamianie aplikacji

### Za pomocą Docker Compose
```bash
docker-compose up -d
```

Po uruchomieniu:
- Frontend będzie dostępny pod adresem: http://localhost:3010
- Backend API będzie dostępne pod adresem: http://localhost:3011
- WebSocket będzie dostępny pod adresem: ws://localhost:3011/ws

### Ręczne uruchomienie
1. Uruchomienie backendu:
```bash
cd backend
npm install
npm start
```

2. Uruchomienie frontendu:
```bash
npm install
npm start
```

## Rozwiązywanie problemów

### Problem z połączeniem WebSocket
Jeśli występują problemy z połączeniem WebSocket:
1. Sprawdź, czy zmienna `REACT_APP_WS_URL` jest poprawnie ustawiona w pliku `.env`
2. Upewnij się, że port WebSocket (3011) jest dostępny i nie jest blokowany przez firewall
3. Sprawdź logi konsoli przeglądarki, aby zobaczyć szczegóły błędów połączenia

### Problem z logowaniem
Jeśli występują problemy z logowaniem:
1. Upewnij się, że baza danych jest poprawnie skonfigurowana i dostępna
2. Sprawdź, czy domyślni użytkownicy zostali utworzeni (logi serwera powinny zawierać informacje o tworzeniu użytkowników)
3. Zresetuj bazę danych, aby wymusić ponowne utworzenie domyślnych użytkowników

## Struktura projektu

### Backend
- `/backend/src/config` - konfiguracja aplikacji, bazy danych i inicjalizacja danych
- `/backend/src/controllers` - kontrolery obsługujące żądania API
- `/backend/src/middleware` - middleware do uwierzytelniania i autoryzacji
- `/backend/src/models` - modele danych Sequelize
- `/backend/src/routes` - definicje tras API
- `/backend/src/utils` - narzędzia pomocnicze, w tym logger

### Frontend
- `/src/components` - komponenty React
- `/src/layouts` - układy stron
- `/src/pages` - strony aplikacji
- `/src/services` - serwisy do komunikacji z API i WebSocket
- `/src/theme` - konfiguracja motywu Material-UI
