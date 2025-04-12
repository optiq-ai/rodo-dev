# Dokumentacja API Aplikacji RODO

## Spis treści
1. [Wprowadzenie](#wprowadzenie)
2. [Uwierzytelnianie](#uwierzytelnianie)
3. [Konwencje API](#konwencje-api)
4. [Endpointy API](#endpointy-api)
   - [Użytkownicy](#użytkownicy)
   - [Dokumenty](#dokumenty)
   - [Rejestry](#rejestry)
   - [Incydenty](#incydenty)
   - [Wnioski](#wnioski)
   - [Analiza ryzyka](#analiza-ryzyka)
5. [Modele danych](#modele-danych)
6. [Obsługa błędów](#obsługa-błędów)
7. [Limity i ograniczenia](#limity-i-ograniczenia)
8. [Przykłady użycia](#przykłady-użycia)

## Wprowadzenie

API aplikacji RODO umożliwia programistyczną interakcję z systemem zarządzania ochroną danych osobowych. API jest zaprojektowane zgodnie z zasadami REST i umożliwia wykonywanie operacji CRUD (Create, Read, Update, Delete) na zasobach aplikacji.

### Wersja API

Aktualna wersja API: `v1`

Wszystkie endpointy API są poprzedzone prefiksem `/api/v1/`.

### Format danych

API obsługuje format JSON dla żądań i odpowiedzi. Wszystkie żądania powinny zawierać nagłówek `Content-Type: application/json`.

## Uwierzytelnianie

API wykorzystuje uwierzytelnianie oparte na tokenach JWT (JSON Web Tokens).

### Uzyskiwanie tokenu

Aby uzyskać token uwierzytelniający, należy wysłać żądanie POST do endpointu `/api/v1/auth/login` z danymi uwierzytelniającymi:

```json
{
  "username": "nazwa_użytkownika",
  "password": "hasło"
}
```

W przypadku poprawnego uwierzytelnienia, API zwróci token JWT:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "1",
    "username": "admin",
    "role": "admin"
  }
}
```

### Używanie tokenu

Token należy dołączyć do każdego żądania w nagłówku `Authorization`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Odświeżanie tokenu

Aby odświeżyć token przed jego wygaśnięciem, należy wysłać żądanie POST do endpointu `/api/v1/auth/refresh` z aktualnym tokenem w nagłówku `Authorization`.

### Wylogowanie

Aby unieważnić token, należy wysłać żądanie POST do endpointu `/api/v1/auth/logout` z tokenem w nagłówku `Authorization`.

## Konwencje API

### Paginacja

Endpointy zwracające listy zasobów obsługują paginację za pomocą parametrów zapytania:

- `page`: numer strony (domyślnie 1)
- `limit`: liczba elementów na stronie (domyślnie 10, maksymalnie 100)

Przykład: `/api/v1/documents?page=2&limit=20`

Odpowiedź zawiera metadane paginacji:

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 2,
    "limit": 20,
    "pages": 5
  }
}
```

### Filtrowanie

Endpointy obsługują filtrowanie za pomocą parametrów zapytania:

Przykład: `/api/v1/incidents?status=active&severity=high`

### Sortowanie

Endpointy obsługują sortowanie za pomocą parametru `sort`:

- Sortowanie rosnące: `sort=field`
- Sortowanie malejące: `sort=-field`

Przykład: `/api/v1/documents?sort=-createdAt`

### Wybór pól

Endpointy obsługują wybór zwracanych pól za pomocą parametru `fields`:

Przykład: `/api/v1/users?fields=id,username,email`

## Endpointy API

### Użytkownicy

#### Pobieranie listy użytkowników

```
GET /api/v1/users
```

Parametry zapytania:
- `role`: filtrowanie według roli (np. `admin`, `iod`, `employee`)
- `status`: filtrowanie według statusu (np. `active`, `inactive`, `locked`)
- `search`: wyszukiwanie według nazwy użytkownika lub adresu email

Przykładowa odpowiedź:

```json
{
  "data": [
    {
      "id": "1",
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "department": "IT",
      "status": "active",
      "lastLogin": "2025-04-12T10:30:00Z"
    },
    ...
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

#### Pobieranie pojedynczego użytkownika

```
GET /api/v1/users/{id}
```

Przykładowa odpowiedź:

```json
{
  "id": "1",
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "department": "IT",
  "status": "active",
  "lastLogin": "2025-04-12T10:30:00Z",
  "permissions": ["all"],
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-04-12T10:30:00Z"
}
```

#### Tworzenie użytkownika

```
POST /api/v1/users
```

Przykładowe żądanie:

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "role": "employee",
  "department": "HR",
  "status": "active"
}
```

#### Aktualizacja użytkownika

```
PUT /api/v1/users/{id}
```

Przykładowe żądanie:

```json
{
  "email": "updated@example.com",
  "department": "Marketing",
  "status": "inactive"
}
```

#### Usuwanie użytkownika

```
DELETE /api/v1/users/{id}
```

### Dokumenty

#### Pobieranie listy dokumentów

```
GET /api/v1/documents
```

Parametry zapytania:
- `category`: filtrowanie według kategorii
- `search`: wyszukiwanie według tytułu lub opisu
- `createdBy`: filtrowanie według autora

Przykładowa odpowiedź:

```json
{
  "data": [
    {
      "id": "1",
      "title": "Polityka ochrony danych osobowych",
      "category": "policy",
      "description": "Dokument opisujący politykę ochrony danych osobowych w organizacji",
      "fileUrl": "/files/documents/policy.pdf",
      "version": "1.2",
      "createdBy": "admin",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-03-20T14:30:00Z"
    },
    ...
  ],
  "pagination": {
    "total": 30,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### Pobieranie pojedynczego dokumentu

```
GET /api/v1/documents/{id}
```

#### Tworzenie dokumentu

```
POST /api/v1/documents
```

Przykładowe żądanie:

```json
{
  "title": "Nowy dokument",
  "category": "procedure",
  "description": "Opis nowego dokumentu",
  "file": "base64_encoded_file_content"
}
```

#### Aktualizacja dokumentu

```
PUT /api/v1/documents/{id}
```

#### Usuwanie dokumentu

```
DELETE /api/v1/documents/{id}
```

#### Pobieranie historii wersji dokumentu

```
GET /api/v1/documents/{id}/versions
```

### Rejestry

#### Pobieranie listy rejestrów

```
GET /api/v1/registers
```

Przykładowa odpowiedź:

```json
{
  "data": [
    {
      "id": "rcp",
      "name": "Rejestr czynności przetwarzania",
      "description": "Rejestr czynności przetwarzania danych osobowych",
      "entriesCount": 25,
      "lastUpdated": "2025-04-10T09:15:00Z"
    },
    ...
  ]
}
```

#### Pobieranie wpisów rejestru

```
GET /api/v1/registers/{registerId}/entries
```

Parametry zapytania:
- `search`: wyszukiwanie według zawartości wpisu
- `createdBy`: filtrowanie według autora
- `dateFrom`: filtrowanie od daty
- `dateTo`: filtrowanie do daty

Przykładowa odpowiedź dla rejestru czynności przetwarzania:

```json
{
  "data": [
    {
      "id": "1",
      "name": "Przetwarzanie danych pracowników",
      "purpose": "Zarządzanie zasobami ludzkimi",
      "dataCategories": ["Dane identyfikacyjne", "Dane kontaktowe", "Dane finansowe"],
      "dataSubjects": ["Pracownicy"],
      "legalBasis": "Art. 6 ust. 1 lit. b) RODO",
      "recipients": ["Dział HR", "Dział Finansowy"],
      "retentionPeriod": "5 lat po zakończeniu zatrudnienia",
      "securityMeasures": ["Kontrola dostępu", "Szyfrowanie danych"],
      "createdBy": "admin",
      "createdAt": "2025-02-10T11:20:00Z",
      "updatedAt": "2025-04-05T09:30:00Z"
    },
    ...
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

#### Pobieranie pojedynczego wpisu rejestru

```
GET /api/v1/registers/{registerId}/entries/{entryId}
```

#### Tworzenie wpisu rejestru

```
POST /api/v1/registers/{registerId}/entries
```

Przykładowe żądanie dla rejestru czynności przetwarzania:

```json
{
  "name": "Nowe przetwarzanie",
  "purpose": "Cel przetwarzania",
  "dataCategories": ["Dane identyfikacyjne", "Dane kontaktowe"],
  "dataSubjects": ["Klienci"],
  "legalBasis": "Art. 6 ust. 1 lit. a) RODO",
  "recipients": ["Dział Obsługi Klienta"],
  "retentionPeriod": "3 lata",
  "securityMeasures": ["Kontrola dostępu", "Szyfrowanie danych"]
}
```

#### Aktualizacja wpisu rejestru

```
PUT /api/v1/registers/{registerId}/entries/{entryId}
```

#### Usuwanie wpisu rejestru

```
DELETE /api/v1/registers/{registerId}/entries/{entryId}
```

### Incydenty

#### Pobieranie listy incydentów

```
GET /api/v1/incidents
```

Parametry zapytania:
- `status`: filtrowanie według statusu (np. `new`, `in_progress`, `closed`)
- `severity`: filtrowanie według poziomu ryzyka (np. `low`, `medium`, `high`, `critical`)
- `search`: wyszukiwanie według tytułu lub opisu
- `dateFrom`: filtrowanie od daty
- `dateTo`: filtrowanie do daty

Przykładowa odpowiedź:

```json
{
  "data": [
    {
      "id": "1",
      "title": "Wyciek danych klientów",
      "description": "Wykryto nieautoryzowany dostęp do bazy danych klientów",
      "date": "2025-04-10T00:00:00Z",
      "status": "in_progress",
      "severity": "high",
      "reportedBy": "Jan Kowalski",
      "affectedData": "Dane osobowe klientów",
      "actions": "Zablokowano dostęp do bazy danych, powiadomiono osoby, których dane dotyczą"
    },
    ...
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

#### Pobieranie pojedynczego incydentu

```
GET /api/v1/incidents/{id}
```

#### Tworzenie incydentu

```
POST /api/v1/incidents
```

Przykładowe żądanie:

```json
{
  "title": "Nowy incydent",
  "description": "Opis incydentu",
  "severity": "medium",
  "affectedData": "Dane osobowe pracowników",
  "actions": "Podjęte działania"
}
```

#### Aktualizacja incydentu

```
PUT /api/v1/incidents/{id}
```

Przykładowe żądanie:

```json
{
  "status": "closed",
  "actions": "Zaktualizowane działania"
}
```

#### Usuwanie incydentu

```
DELETE /api/v1/incidents/{id}
```

### Wnioski

#### Pobieranie listy wniosków

```
GET /api/v1/requests
```

Parametry zapytania:
- `status`: filtrowanie według statusu (np. `new`, `in_progress`, `completed`, `rejected`)
- `type`: filtrowanie według typu wniosku (np. `access`, `rectification`, `erasure`)
- `search`: wyszukiwanie według danych wnioskodawcy lub opisu
- `dateFrom`: filtrowanie od daty
- `dateTo`: filtrowanie do daty

Przykładowa odpowiedź:

```json
{
  "data": [
    {
      "id": "1",
      "type": "access",
      "typeName": "Dostęp do danych",
      "status": "in_progress",
      "submissionDate": "2025-04-05T00:00:00Z",
      "deadlineDate": "2025-05-05T00:00:00Z",
      "dataSubject": "Jan Kowalski",
      "contactInfo": "jan.kowalski@example.com",
      "description": "Prośba o dostęp do wszystkich danych osobowych",
      "assignedTo": "Anna Nowak",
      "notes": "Dane z systemów HR i CRM zostały już zebrane"
    },
    ...
  ],
  "pagination": {
    "total": 20,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

#### Pobieranie pojedynczego wniosku

```
GET /api/v1/requests/{id}
```

#### Tworzenie wniosku

```
POST /api/v1/requests
```

Przykładowe żądanie:

```json
{
  "type": "access",
  "dataSubject": "Nowy Wnioskodawca",
  "contactInfo": "nowy@example.com",
  "description": "Opis wniosku"
}
```

#### Aktualizacja wniosku

```
PUT /api/v1/requests/{id}
```

Przykładowe żądanie:

```json
{
  "status": "completed",
  "assignedTo": "Tomasz Wójcik",
  "notes": "Wniosek zrealizowany"
}
```

#### Usuwanie wniosku

```
DELETE /api/v1/requests/{id}
```

### Analiza ryzyka

#### Pobieranie listy analiz ryzyka

```
GET /api/v1/risk-analysis
```

Parametry zapytania:
- `status`: filtrowanie według statusu (np. `draft`, `completed`, `archived`)
- `search`: wyszukiwanie według nazwy lub opisu
- `dateFrom`: filtrowanie od daty
- `dateTo`: filtrowanie do daty

Przykładowa odpowiedź:

```json
{
  "data": [
    {
      "id": "1",
      "name": "Analiza ryzyka dla systemu CRM",
      "description": "Analiza ryzyka związanego z przetwarzaniem danych osobowych w systemie CRM",
      "status": "completed",
      "createdBy": "admin",
      "createdAt": "2025-03-15T10:00:00Z",
      "updatedAt": "2025-04-01T14:30:00Z",
      "riskLevel": "medium"
    },
    ...
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### Pobieranie pojedynczej analizy ryzyka

```
GET /api/v1/risk-analysis/{id}
```

#### Tworzenie analizy ryzyka

```
POST /api/v1/risk-analysis
```

Przykładowe żądanie:

```json
{
  "name": "Nowa analiza ryzyka",
  "description": "Opis analizy ryzyka",
  "assets": [
    {
      "name": "Baza danych klientów",
      "description": "Baza danych zawierająca dane osobowe klientów",
      "dataCategories": ["Dane identyfikacyjne", "Dane kontaktowe"]
    }
  ],
  "threats": [
    {
      "name": "Nieautoryzowany dostęp",
      "description": "Nieautoryzowany dostęp do bazy danych",
      "probability": "medium",
      "impact": "high"
    }
  ],
  "securityMeasures": [
    {
      "name": "Kontrola dostępu",
      "description": "Implementacja mechanizmów kontroli dostępu",
      "status": "implemented"
    }
  ]
}
```

#### Aktualizacja analizy ryzyka

```
PUT /api/v1/risk-analysis/{id}
```

#### Usuwanie analizy ryzyka

```
DELETE /api/v1/risk-analysis/{id}
```

## Modele danych

### Model użytkownika

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "admin | iod | employee",
  "department": "string",
  "status": "active | inactive | locked",
  "permissions": ["string"],
  "lastLogin": "datetime",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Model dokumentu

```json
{
  "id": "string",
  "title": "string",
  "category": "string",
  "description": "string",
  "fileUrl": "string",
  "version": "string",
  "createdBy": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Model incydentu

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "date": "datetime",
  "status": "new | in_progress | closed",
  "severity": "low | medium | high | critical",
  "reportedBy": "string",
  "affectedData": "string",
  "actions": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Model wniosku

```json
{
  "id": "string",
  "type": "access | rectification | erasure | restriction | portability | objection",
  "typeName": "string",
  "status": "new | in_progress | completed | rejected",
  "submissionDate": "datetime",
  "deadlineDate": "datetime",
  "dataSubject": "string",
  "contactInfo": "string",
  "description": "string",
  "assignedTo": "string",
  "notes": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Model analizy ryzyka

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "status": "draft | completed | archived",
  "assets": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "dataCategories": ["string"]
    }
  ],
  "threats": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "probability": "low | medium | high",
      "impact": "low | medium | high"
    }
  ],
  "securityMeasures": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "status": "planned | in_progress | implemented"
    }
  ],
  "riskLevel": "low | medium | high",
  "createdBy": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

## Obsługa błędów

API zwraca standardowe kody HTTP dla wskazania statusu żądania:

- 200 OK: Żądanie zakończone sukcesem
- 201 Created: Zasób został utworzony
- 400 Bad Request: Nieprawidłowe żądanie
- 401 Unauthorized: Brak uwierzytelnienia
- 403 Forbidden: Brak uprawnień
- 404 Not Found: Zasób nie został znaleziony
- 422 Unprocessable Entity: Walidacja nie powiodła się
- 500 Internal Server Error: Błąd serwera

W przypadku błędu, API zwraca obiekt JSON z informacjami o błędzie:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

## Limity i ograniczenia

- Maksymalna liczba żądań: 100 na minutę na użytkownika
- Maksymalny rozmiar żądania: 10 MB
- Maksymalna liczba elementów na stronie: 100

## Przykłady użycia

### Przykład: Logowanie i pobieranie listy dokumentów

```javascript
// Logowanie
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// Pobieranie listy dokumentów
const documentsResponse = await fetch('/api/v1/documents?category=policy&sort=-updatedAt', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const documents = await documentsResponse.json();
```

### Przykład: Zgłaszanie incydentu

```javascript
const incidentResponse = await fetch('/api/v1/incidents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Nowy incydent',
    description: 'Opis incydentu',
    severity: 'medium',
    affectedData: 'Dane osobowe pracowników',
    actions: 'Podjęte działania'
  })
});

const newIncident = await incidentResponse.json();
```

### Przykład: Aktualizacja statusu wniosku

```javascript
const requestResponse = await fetch('/api/v1/requests/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: 'completed',
    notes: 'Wniosek zrealizowany'
  })
});

const updatedRequest = await requestResponse.json();
```
