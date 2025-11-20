# VertrouwdBouwen API Documentatie

## Base URL

```
http://localhost:5000/api
```

## Authentication

De meeste endpoints vereisen authenticatie via JWT token. Voeg de token toe aan de `Authorization` header:

```
Authorization: Bearer <token>
```

## Endpoints

### Projects

#### 1. Maak Project Aan

**POST** `/projects`

Maak een nieuw project aan met bijbehorende milestones. Alleen klanten kunnen projecten aanmaken.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Bouwproject Nieuw Huis",
  "description": "Complete renovatie van een woning inclusief keuken, badkamer en vloeren",
  "totalBudget": 50000.00,
  "startDate": "2024-02-01",
  "endDate": "2024-06-30",
  "milestones": [
    {
      "title": "Voorbereiding en planning",
      "description": "Opmeten, tekeningen maken, vergunningen aanvragen",
      "amount": 5000.00,
      "order": 1,
      "dueDate": "2024-02-28"
    },
    {
      "title": "Sloopwerkzaamheden",
      "description": "Verwijderen oude keuken, badkamer en vloeren",
      "amount": 10000.00,
      "order": 2,
      "dueDate": "2024-03-31"
    },
    {
      "title": "Installatiewerk",
      "description": "Elektra, water en verwarming aanleggen",
      "amount": 15000.00,
      "order": 3,
      "dueDate": "2024-04-30"
    },
    {
      "title": "Afwerking",
      "description": "Keuken plaatsen, badkamer afwerken, vloeren leggen",
      "amount": 20000.00,
      "order": 4,
      "dueDate": "2024-06-30"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "contractorId": null,
    "title": "Bouwproject Nieuw Huis",
    "description": "Complete renovatie...",
    "totalBudget": 50000.00,
    "status": "DRAFT",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-06-30T00:00:00.000Z",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z",
    "customer": {
      "id": "uuid",
      "email": "klant@example.com",
      "firstName": "Jan",
      "lastName": "Jansen"
    },
    "milestones": [
      {
        "id": "uuid",
        "projectId": "uuid",
        "title": "Voorbereiding en planning",
        "description": "Opmeten, tekeningen maken...",
        "amount": 5000.00,
        "status": "PENDING",
        "order": 1,
        "dueDate": "2024-02-28T00:00:00.000Z",
        "createdAt": "2024-01-15T10:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
      // ... meer milestones
    ]
  }
}
```

**Validatie Regels:**
- Titel: 3-255 karakters
- Beschrijving: Minimaal 10 karakters
- TotalBudget: Positief getal, moet overeenkomen met som van milestone bedragen
- Milestones: Minimaal 1 milestone vereist
- Milestone orders: Moeten sequentieel zijn (1, 2, 3, ...)
- Milestone amounts: Allemaal positief
- Datums: ISO 8601 formaat, endDate moet na startDate zijn

**Error Responses:**
- `400`: Validatie errors
- `401`: Niet geauthenticeerd
- `403`: Alleen klanten kunnen projecten aanmaken
- `409`: Totaal budget komt niet overeen met milestone som

---

#### 2. Haal Alle Projecten Op

**GET** `/projects`

Haal alle projecten op. Resultaten zijn gefilterd op basis van gebruikersrol:
- **Klanten**: Zien alleen hun eigen projecten
- **Aannemers**: Zien beschikbare projecten (zonder contractor)
- **Admins**: Zien alle projecten

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Bouwproject Nieuw Huis",
      "status": "DRAFT",
      "totalBudget": 50000.00,
      "customer": {
        "id": "uuid",
        "email": "klant@example.com",
        "firstName": "Jan",
        "lastName": "Jansen"
      },
      "contractor": null,
      "milestones": [
        // ... milestones
      ]
    }
  ]
}
```

---

#### 3. Haal Project Op

**GET** `/projects/:id`

Haal één project op met volledige details inclusief milestones, betalingen en goedkeuringen.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Bouwproject Nieuw Huis",
    "description": "Complete renovatie...",
    "totalBudget": 50000.00,
    "status": "DRAFT",
    "customer": {
      "id": "uuid",
      "email": "klant@example.com",
      "firstName": "Jan",
      "lastName": "Jansen"
    },
    "contractor": null,
    "milestones": [
      {
        "id": "uuid",
        "title": "Voorbereiding en planning",
        "amount": 5000.00,
        "status": "PENDING",
        "order": 1,
        "payments": [],
        "approvals": []
      }
    ]
  }
}
```

**Error Responses:**
- `401`: Niet geauthenticeerd
- `403`: Geen toegang tot dit project
- `404`: Project niet gevonden

---

### Milestones

#### 1. Start Werk aan Milestone

**POST** `/milestones/:id/start`

Start werk aan een milestone. Alleen aannemers kunnen milestones starten.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "milestone": {
      "id": "uuid",
      "status": "IN_PROGRESS",
      ...
    },
    "message": "Milestone gestart - werk kan beginnen"
  }
}
```

**Validatie:**
- Alleen aannemers kunnen starten
- Milestone moet status `PENDING` hebben
- Aannemer moet geaccepteerd zijn op project

---

#### 2. Keur Milestone Goed

**POST** `/milestones/:id/approve`

Keur een milestone goed en geef de escrow betaling vrij aan de aannemer. Alleen klanten kunnen milestones goedkeuren.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (optioneel):**
```json
{
  "comments": "Ziet er goed uit! Goedgekeurd."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "milestone": {
      "id": "uuid",
      "projectId": "uuid",
      "title": "Voorbereiding en planning",
      "description": "Opmeten, tekeningen maken...",
      "amount": 5000.00,
      "status": "PAID",
      "order": 1,
      "project": {
        "id": "uuid",
        "title": "Bouwproject Nieuw Huis",
        "customer": {
          "id": "uuid",
          "email": "klant@example.com",
          "firstName": "Jan",
          "lastName": "Jansen"
        },
        "contractor": {
          "id": "uuid",
          "email": "aannemer@example.com",
          "firstName": "Piet",
          "lastName": "Pietersen",
          "companyName": "Bouw BV"
        }
      },
      "payments": [
        {
          "id": "uuid",
          "amount": 5000.00,
          "status": "RELEASED",
          "heldAt": "2024-02-01T10:00:00.000Z",
          "releasedAt": "2024-02-15T14:30:00.000Z",
          "transactionRef": "TXN-1708000000-A1B2C3D4"
        }
      ],
      "approvals": [
        {
          "id": "uuid",
          "status": "APPROVED",
          "comments": "Ziet er goed uit! Goedgekeurd.",
          "createdAt": "2024-02-15T14:30:00.000Z",
          "approver": {
            "id": "uuid",
            "email": "klant@example.com",
            "firstName": "Jan",
            "lastName": "Jansen"
          }
        }
      ]
    },
    "approval": {
      "id": "uuid",
      "milestoneId": "uuid",
      "approverId": "uuid",
      "status": "APPROVED",
      "comments": "Ziet er goed uit! Goedgekeurd.",
      "createdAt": "2024-02-15T14:30:00.000Z"
    },
    "payment": {
      "id": "uuid",
      "milestoneId": "uuid",
      "amount": 5000.00,
      "status": "RELEASED",
      "heldAt": "2024-02-01T10:00:00.000Z",
      "releasedAt": "2024-02-15T14:30:00.000Z",
      "transactionRef": "TXN-1708000000-A1B2C3D4"
    },
    "message": "Milestone goedgekeurd en betaling vrijgegeven"
  }
}
```

**Validatie:**
- Milestone moet status `SUBMITTED` hebben (aannemer heeft ingediend)
- Milestone moet een escrow betaling hebben met status `HELD`
- Alleen de klant van het project kan goedkeuren
- Milestone mag nog niet eerder goedgekeurd zijn

**Workflow:**
1. Aannemer dient milestone in → status: `SUBMITTED`
2. Klant keurt goed → status: `APPROVED`
3. Escrow betaling wordt vrijgegeven → status: `RELEASED`
4. Milestone status wordt `PAID`
5. Transactie referentie wordt gegenereerd (gesimuleerd)

**Error Responses:**
- `400`: Milestone heeft niet de juiste status of validatie errors
- `401`: Niet geauthenticeerd
- `403`: Geen toegang (niet de klant van het project)
- `404`: Milestone niet gevonden
- `409`: Milestone is al goedgekeurd

---

#### 2. Haal Milestone Op

**GET** `/milestones/:id`

Haal een milestone op met volledige details inclusief project, betalingen en goedkeuringen.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "title": "Voorbereiding en planning",
    "description": "Opmeten, tekeningen maken...",
    "amount": 5000.00,
    "status": "SUBMITTED",
    "order": 1,
    "dueDate": "2024-02-28T00:00:00.000Z",
    "project": {
      "id": "uuid",
      "title": "Bouwproject Nieuw Huis",
      "customer": {
        "id": "uuid",
        "email": "klant@example.com"
      },
      "contractor": {
        "id": "uuid",
        "email": "aannemer@example.com"
      }
    },
    "payments": [
      {
        "id": "uuid",
        "amount": 5000.00,
        "status": "HELD",
        "heldAt": "2024-02-01T10:00:00.000Z"
      }
    ],
    "approvals": []
  }
}
```

---

### Payments (Escrow)

#### 1. Financier Milestone (Zet Geld in Escrow)

**POST** `/milestones/:id/fund`

Zet geld in escrow voor een milestone. Alleen klanten kunnen milestones financieren. Dit is een gesimuleerde betaling - geen echte geldtransactie.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (optioneel):**
```json
{
  "amount": 5000.00
}
```

Als `amount` niet wordt opgegeven, wordt het milestone bedrag gebruikt.

**Response (201):**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "milestoneId": "uuid",
      "amount": 5000.00,
      "status": "HELD",
      "heldAt": "2024-02-01T10:00:00.000Z",
      "transactionRef": "ESCROW-1708000000-A1B2C3D4",
      "createdAt": "2024-02-01T10:00:00.000Z"
    },
    "message": "€5,000.00 is in escrow gezet voor milestone \"Voorbereiding en planning\""
  }
}
```

**Validatie:**
- Alleen klanten kunnen milestones financieren
- Milestone moet bestaan
- Bedrag moet overeenkomen met milestone bedrag (als opgegeven)
- Milestone mag nog niet gefinancierd zijn (geen actieve HELD betaling)

**Error Responses:**
- `400`: Validatie errors
- `401`: Niet geauthenticeerd
- `403`: Alleen klanten kunnen financieren
- `404`: Milestone niet gevonden
- `409`: Milestone is al gefinancierd

---

#### 2. Haal Betaling Op

**GET** `/payments/:id`

Haal een specifieke escrow betaling op.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "milestoneId": "uuid",
    "amount": 5000.00,
    "status": "HELD",
    "heldAt": "2024-02-01T10:00:00.000Z",
    "releasedAt": null,
    "transactionRef": "ESCROW-1708000000-A1B2C3D4",
    "milestone": {
      "id": "uuid",
      "title": "Voorbereiding en planning",
      "project": {
        "id": "uuid",
        "title": "Bouwproject Nieuw Huis"
      }
    }
  }
}
```

---

#### 3. Haal Betalingen Op voor Milestone

**GET** `/milestones/:id/payments`

Haal alle betalingen op voor een specifieke milestone.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 5000.00,
      "status": "HELD",
      "heldAt": "2024-02-01T10:00:00.000Z",
      "transactionRef": "ESCROW-1708000000-A1B2C3D4"
    }
  ]
}
```

---

#### 4. Haal Alle Betalingen Op

**GET** `/payments`

Haal alle betalingen op voor de ingelogde gebruiker (gefilterd op rol).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "milestoneId": "uuid",
      "amount": 5000.00,
      "status": "HELD",
      "heldAt": "2024-02-01T10:00:00.000Z",
      "transactionRef": "ESCROW-1708000000-A1B2C3D4"
    }
  ]
}
```

---

#### 5. Refund Betaling

**POST** `/payments/:id/refund`

Geef geld terug aan klant (refund). Alleen klanten kunnen refunds aanvragen.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (optioneel):**
```json
{
  "reason": "Project geannuleerd"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "uuid",
      "status": "REFUNDED",
      "releasedAt": "2024-02-15T14:30:00.000Z"
    },
    "message": "€5,000.00 is terugbetaald aan klant"
  }
}
```

**Validatie:**
- Alleen klanten kunnen refunds aanvragen
- Betaling moet status HELD hebben
- Milestone mag nog niet goedgekeurd zijn

---

### Authentication

#### 1. Registreer Gebruiker

**POST** `/auth/register`

Registreer een nieuwe klant of aannemer.

**Request Body:**
```json
{
  "email": "klant@example.com",
  "password": "SecurePass123",
  "role": "CUSTOMER",
  "firstName": "Jan",
  "lastName": "Jansen",
  "phone": "+31612345678",
  "address": {
    "street": "Hoofdstraat 1",
    "city": "Amsterdam",
    "postalCode": "1000 AA",
    "country": "Nederland"
  }
}
```

**Voor Aannemer:**
```json
{
  "email": "aannemer@example.com",
  "password": "SecurePass123",
  "role": "CONTRACTOR",
  "firstName": "Piet",
  "lastName": "Pietersen",
  "companyName": "Bouw BV",
  "kvkNumber": "12345678",
  "phone": "+31687654321"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "klant@example.com",
      "role": "CUSTOMER",
      "firstName": "Jan",
      "lastName": "Jansen",
      "phone": "+31612345678"
    },
    "token": "jwt_token_here"
  }
}
```

**Validatie Regels:**
- Email: Geldig email formaat
- Password: Minimaal 8 karakters, 1 hoofdletter, 1 kleine letter, 1 cijfer
- Role: `CUSTOMER` of `CONTRACTOR`
- Phone: Geldig telefoonnummer formaat
- CompanyName: Verplicht voor `CONTRACTOR`
- KVKNumber: 8 cijfers (optioneel voor aannemers)

---

#### 2. Login

**POST** `/auth/login`

Login met email en wachtwoord.

**Request Body:**
```json
{
  "email": "klant@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "klant@example.com",
      "role": "CUSTOMER",
      "firstName": "Jan",
      "lastName": "Jansen",
      "phone": "+31612345678"
    },
    "token": "jwt_token_here"
  }
}
```

**Error Responses:**
- `401`: Ongeldige email of wachtwoord
- `400`: Validatie errors

---

#### 3. Huidige Gebruiker

**GET** `/auth/me`

Haal informatie op van de ingelogde gebruiker.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "klant@example.com",
    "role": "CUSTOMER",
    "firstName": "Jan",
    "lastName": "Jansen",
    "companyName": null,
    "kvkNumber": null,
    "phone": "+31612345678",
    "address": {
      "street": "Hoofdstraat 1",
      "city": "Amsterdam"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Niet geauthenticeerd of ongeldige token

---

## Error Responses

Alle errors volgen dit formaat:

```json
{
  "success": false,
  "error": {
    "message": "Error message hier"
  }
}
```

### Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validatie errors)
- `401`: Unauthorized (niet geauthenticeerd)
- `403`: Forbidden (geen toegang)
- `404`: Not Found
- `409`: Conflict (bijv. email al in gebruik)
- `500`: Internal Server Error

## Voorbeelden

### cURL

#### Registreer Klant
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "klant@example.com",
    "password": "SecurePass123",
    "role": "CUSTOMER",
    "firstName": "Jan",
    "lastName": "Jansen",
    "phone": "+31612345678"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "klant@example.com",
    "password": "SecurePass123"
  }'
```

#### Haal Gebruiker Op
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### JavaScript (Fetch)

```javascript
// Registreer
const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'klant@example.com',
    password: 'SecurePass123',
    role: 'CUSTOMER',
    firstName: 'Jan',
    lastName: 'Jansen',
    phone: '+31612345678',
  }),
});

const { data } = await registerResponse.json();
const token = data.token;

// Gebruik token voor authenticated requests
const meResponse = await fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const userData = await meResponse.json();

// Maak project aan
const projectResponse = await fetch('http://localhost:5000/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: 'Bouwproject Nieuw Huis',
    description: 'Complete renovatie van een woning',
    totalBudget: 50000.00,
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    milestones: [
      {
        title: 'Voorbereiding',
        description: 'Opmeten en planning',
        amount: 5000.00,
        order: 1,
        dueDate: '2024-02-28',
      },
      {
        title: 'Sloopwerk',
        description: 'Verwijderen oude onderdelen',
        amount: 10000.00,
        order: 2,
        dueDate: '2024-03-31',
      },
    ],
  }),
});

const projectData = await projectResponse.json();

// Keur milestone goed
const approveResponse = await fetch(
  `http://localhost:5000/api/milestones/${milestoneId}/approve`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      comments: 'Ziet er goed uit!',
    }),
  }
);

const approvalData = await approveResponse.json();
```

## Rollen

### CUSTOMER (Klant)
- Kan projecten aanmaken
- Kan milestones goedkeuren
- Kan betalingen storten

### CONTRACTOR (Aannemer)
- Kan projecten accepteren
- Kan milestones indienen
- Kan betalingen ontvangen

### ADMIN (Toekomstig)
- Volledige toegang tot alle functionaliteit

## Security

- Wachtwoorden worden gehashed met bcrypt (12 salt rounds)
- JWT tokens met configurable expiration (default: 7 dagen)
- CORS enabled voor frontend
- Helmet.js voor security headers
- Input validatie met express-validator

## Development

Start de development server:

```bash
cd apps/api
npm run dev
```

De API draait op `http://localhost:5000`

