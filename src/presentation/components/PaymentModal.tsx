import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEventHandler,
} from 'react';
import { CardBrand, DocumentType } from '../../domain/enums';
import { CardBrandService } from '../../domain/services';
import type { CardInput, CustomerInput, DeliveryInput } from '../../domain/models';
import { CardBrandLogo } from './CardBrandLogo';

interface Props {
  readonly onClose: () => void;
  readonly onSubmit: (payload: {
    card: CardInput;
    cardNumber: string;
    customer: CustomerInput;
    delivery: DeliveryInput;
  }) => void;
}

type Errors = Partial<Record<string, string>>;

/** Maps each error key to the input that should receive focus. */
const FIELD_OF_ERROR: Record<string, string> = {
  cardNumber: 'cardNumber',
  cardHolder: 'cardHolder',
  expiry: 'expMonth',
  cvc: 'cvc',
  fullName: 'fullName',
  email: 'email',
  document: 'document',
  phoneNumber: 'phoneNumber',
  address: 'address',
  city: 'city',
  region: 'region',
};

const groupCardNumber = (value: string): string =>
  CardBrandService.sanitize(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

export function PaymentModal({ onClose, onSubmit }: Props) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.CC);
  const [phoneNumber, setPhoneNumber] = useState('');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');

  const [errors, setErrors] = useState<Errors>({});
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escape closes the dialog and the page behind it stops scrolling, so the
  // interaction stays inside the modal boundaries on small screens.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const brand = useMemo(() => CardBrandService.detectBrand(cardNumber), [cardNumber]);

  const validate = (): Errors => {
    const found: Errors = {};

    if (!CardBrandService.isValidNumber(cardNumber)) {
      found.cardNumber = 'Número de tarjeta inválido';
    } else if (brand === CardBrand.UNKNOWN) {
      found.cardNumber = 'Solo aceptamos VISA y Mastercard';
    }
    if (cardHolder.trim().length < 3) found.cardHolder = 'Ingresa el titular';
    if (!CardBrandService.isNotExpired(expMonth, expYear)) {
      found.expiry = 'Fecha de expiración inválida';
    }
    if (!/^\d{3,4}$/.test(cvc)) found.cvc = 'CVC inválido';

    if (fullName.trim().length < 3) found.fullName = 'Ingresa tu nombre';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) found.email = 'Correo inválido';
    if (!/^\d{5,15}$/.test(documentNumber)) found.document = 'Documento inválido';
    if (!/^\+?\d{7,15}$/.test(phoneNumber)) found.phoneNumber = 'Teléfono inválido';

    if (address.trim().length < 5) found.address = 'Ingresa la dirección';
    if (city.trim().length < 2) found.city = 'Ingresa la ciudad';
    if (region.trim().length < 2) found.region = 'Ingresa el departamento';

    return found;
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);

    const failedKeys = Object.keys(found);
    if (failedKeys.length > 0) {
      // Take the user to the first problem: it is usually scrolled out of view.
      const target = document.getElementById(FIELD_OF_ERROR[failedKeys[0]]);
      target?.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
      target?.focus({ preventScroll: true });
      return;
    }

    const sanitized = CardBrandService.sanitize(cardNumber);

    onSubmit({
      card: {
        number: sanitized,
        cvc,
        expMonth: expMonth.padStart(2, '0'),
        expYear,
        cardHolder: cardHolder.toUpperCase(),
      },
      cardNumber: sanitized,
      customer: {
        email,
        fullName,
        document: documentNumber,
        documentType,
        phoneNumber,
      },
      delivery: {
        recipientName: fullName,
        address,
        city,
        region,
        country: 'CO',
        phoneNumber,
      },
    });
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Datos de pago"
        tabIndex={-1}
      >
        <header className="modal-header">
          <h2>Datos de pago</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <form className="modal-body" onSubmit={handleSubmit} noValidate>
          <fieldset>
            <legend>Tarjeta</legend>

            <label htmlFor="cardNumber">Número de tarjeta</label>
            <div className="input-with-badge">
              <input
                id="cardNumber"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                value={groupCardNumber(cardNumber)}
                onChange={(e) => setCardNumber(e.target.value)}
              />
              <CardBrandLogo brand={brand} />
            </div>
            {errors.cardNumber && <p className="field-error">{errors.cardNumber}</p>}

            <label htmlFor="cardHolder">Titular</label>
            <input
              id="cardHolder"
              autoComplete="cc-name"
              placeholder="JANE DOE"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
            />
            {errors.cardHolder && <p className="field-error">{errors.cardHolder}</p>}

            <div className="row">
              <div className="col">
                <label htmlFor="expMonth">Mes</label>
                <input
                  id="expMonth"
                  inputMode="numeric"
                  placeholder="08"
                  maxLength={2}
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                />
              </div>
              <div className="col">
                <label htmlFor="expYear">Año</label>
                <input
                  id="expYear"
                  inputMode="numeric"
                  placeholder="29"
                  maxLength={2}
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                />
              </div>
              <div className="col">
                <label htmlFor="cvc">CVC</label>
                <input
                  id="cvc"
                  inputMode="numeric"
                  placeholder="123"
                  maxLength={4}
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                />
              </div>
            </div>
            {errors.expiry && <p className="field-error">{errors.expiry}</p>}
            {errors.cvc && <p className="field-error">{errors.cvc}</p>}
          </fieldset>

          <fieldset>
            <legend>Tus datos</legend>

            <label htmlFor="fullName">Nombre completo</label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {errors.fullName && <p className="field-error">{errors.fullName}</p>}

            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}

            <div className="row">
              <div className="col col-narrow">
                <label htmlFor="documentType">Tipo</label>
                <select
                  id="documentType"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                >
                  {Object.values(DocumentType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label htmlFor="document">Documento</label>
                <input
                  id="document"
                  inputMode="numeric"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </div>
            </div>
            {errors.document && <p className="field-error">{errors.document}</p>}

            <label htmlFor="phoneNumber">Teléfono</label>
            <input
              id="phoneNumber"
              inputMode="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            {errors.phoneNumber && <p className="field-error">{errors.phoneNumber}</p>}
          </fieldset>

          <fieldset>
            <legend>Entrega</legend>

            <label htmlFor="address">Dirección</label>
            <input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {errors.address && <p className="field-error">{errors.address}</p>}

            <div className="row">
              <div className="col">
                <label htmlFor="city">Ciudad</label>
                <input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="col">
                <label htmlFor="region">Departamento</label>
                <input
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                />
              </div>
            </div>
            {errors.city && <p className="field-error">{errors.city}</p>}
            {errors.region && <p className="field-error">{errors.region}</p>}
          </fieldset>

          {Object.keys(errors).length > 0 && (
            <p className="banner-error" role="alert">
              Revisa {Object.keys(errors).length} campo
              {Object.keys(errors).length > 1 ? 's' : ''} con errores antes de
              continuar.
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block">
            Continuar al resumen
          </button>
        </form>
      </div>
    </div>
  );
}
