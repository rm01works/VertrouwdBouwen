import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

/**
 * Middleware om validatie errors te verwerken
 */
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('❌ VALIDATIE FOUTEN GEVONDEN:');
    errors.array().forEach((err, index) => {
      console.log(`   ${index + 1}. ${err.param}: ${err.msg} (value: ${err.value})`);
    });
    const errorMessages = errors.array().map((err) => err.msg);
    console.log('───────────────────────────────────────────────────────────');
    return next(new ValidationError(errorMessages.join(', ')));
  }

  console.log('✅ VALIDATIE SUCCESVOL - Alle velden zijn geldig');
  console.log('📤 Doorsturen naar controller...');
  console.log('───────────────────────────────────────────────────────────');
  next();
}

/**
 * Validatie regels voor registratie
 */
export const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Geldig email adres is verplicht')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Wachtwoord moet minimaal 8 karakters lang zijn')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Wachtwoord moet minimaal één kleine letter, één hoofdletter en één cijfer bevatten'
    ),
  body('role')
    .isIn(['CUSTOMER', 'CONTRACTOR'])
    .withMessage('Rol moet CUSTOMER of CONTRACTOR zijn'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Voornaam is verplicht')
    .isLength({ min: 2, max: 100 })
    .withMessage('Voornaam moet tussen 2 en 100 karakters zijn'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Achternaam is verplicht')
    .isLength({ min: 2, max: 100 })
    .withMessage('Achternaam moet tussen 2 en 100 karakters zijn'),
  body('phone')
    .optional({ values: 'falsy' }) // Behandel lege strings, null, undefined als optioneel
    .custom((value) => {
      // Als phone leeg is of alleen whitespace, behandel als niet opgegeven
      if (!value || value.trim() === '') {
        return true; // Skip validatie voor lege waarden
      }
      // Valideer alleen als er een waarde is
      return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(value.trim());
    })
    .withMessage('Geldig telefoonnummer formaat is vereist (indien opgegeven)'),
  body('companyName')
    .optional({ values: 'falsy' }) // Behandel lege strings, null, undefined als optioneel
    .custom((value) => {
      // Als companyName leeg is of alleen whitespace, behandel als niet opgegeven
      if (!value || value.trim() === '') {
        return true; // Skip validatie voor lege waarden
      }
      // Valideer alleen als er een waarde is
      const trimmed = value.trim();
      return trimmed.length >= 2 && trimmed.length <= 255;
    })
    .withMessage('Bedrijfsnaam moet tussen 2 en 255 karakters zijn (indien opgegeven)'),
  body('kvkNumber')
    .optional({ values: 'falsy' }) // Behandel lege strings, null, undefined als optioneel
    .custom((value) => {
      // Als kvkNumber leeg is of alleen whitespace, behandel als niet opgegeven
      if (!value || value.trim() === '') {
        return true; // Skip validatie voor lege waarden
      }
      // Valideer alleen als er een waarde is - moet exact 8 cijfers zijn
      return /^[0-9]{8}$/.test(value.trim());
    })
    .withMessage('KVK nummer moet 8 cijfers zijn (indien opgegeven)'),
  body('address')
    .optional()
    .isObject()
    .withMessage('Adres moet een object zijn'),
  handleValidationErrors,
];

/**
 * Validatie regels voor login
 */
export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Geldig email adres is verplicht')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Wachtwoord is verplicht'),
  handleValidationErrors,
];

/**
 * Validatie regels voor project creatie
 */
export const validateCreateProject = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Titel is verplicht')
    .isLength({ min: 3, max: 255 })
    .withMessage('Titel moet tussen 3 en 255 karakters zijn'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Beschrijving is verplicht')
    .isLength({ min: 10 })
    .withMessage('Beschrijving moet minimaal 10 karakters zijn'),
  body('totalBudget')
    .isFloat({ min: 0.01 })
    .withMessage('Totaal budget moet een positief getal zijn'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Startdatum moet een geldige datum zijn (ISO 8601)'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Einddatum moet een geldige datum zijn (ISO 8601)'),
  body('milestones')
    .isArray({ min: 1 })
    .withMessage('Project moet minimaal één milestone hebben'),
  body('milestones.*.title')
    .trim()
    .notEmpty()
    .withMessage('Milestone titel is verplicht')
    .isLength({ min: 3, max: 255 })
    .withMessage('Milestone titel moet tussen 3 en 255 karakters zijn'),
  body('milestones.*.description')
    .trim()
    .notEmpty()
    .withMessage('Milestone beschrijving is verplicht')
    .isLength({ min: 10 })
    .withMessage('Milestone beschrijving moet minimaal 10 karakters zijn'),
  body('milestones.*.amount')
    .isFloat({ min: 0.01 })
    .withMessage('Milestone bedrag moet een positief getal zijn'),
  body('milestones.*.order')
    .isInt({ min: 1 })
    .withMessage('Milestone order moet een positief geheel getal zijn'),
  body('milestones.*.dueDate')
    .optional()
    .isISO8601()
    .withMessage('Milestone deadline moet een geldige datum zijn (ISO 8601)'),
  handleValidationErrors,
];
