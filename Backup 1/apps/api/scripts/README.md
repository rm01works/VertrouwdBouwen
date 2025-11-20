# Testgebruikers Script

Dit script maakt automatisch 2 testgebruikers aan voor het testen van de applicatie.

## Gebruik

### Stap 1: Start de database

Zorg ervoor dat de PostgreSQL database draait:

```bash
# Vanuit de root directory
docker-compose up -d
```

### Stap 2: Voer het script uit

```bash
# Vanuit de apps/api directory
npm run create-test-users
```

## Aangemaakte testgebruikers

### Consument (CUSTOMER)
- **Email:** `klant@test.nl`
- **Wachtwoord:** `Test1234`
- **Naam:** Jan Jansen

### Aannemer (CONTRACTOR)
- **Email:** `aannemer@test.nl`
- **Wachtwoord:** `Test1234`
- **Naam:** Piet Bouwman
- **Bedrijf:** Bouwman & Zonen BV
- **KVK:** 12345678

## Opmerkingen

- Het script controleert of de gebruikers al bestaan en slaat ze over als ze al aanwezig zijn
- De wachtwoorden voldoen aan de vereisten: minimaal 8 tekens, 1 hoofdletter, 1 cijfer
- Je kunt direct inloggen met deze accounts in de webapp

