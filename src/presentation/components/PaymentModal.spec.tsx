import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentModal } from './PaymentModal';

const fillValidForm = async () => {
  await userEvent.type(screen.getByLabelText(/número de tarjeta/i), '4242424242424242');
  await userEvent.type(screen.getByLabelText(/titular/i), 'Jenny Portilla');
  await userEvent.type(screen.getByLabelText(/^mes$/i), '10');
  await userEvent.type(screen.getByLabelText(/^año$/i), '29');
  await userEvent.type(screen.getByLabelText(/^cvc$/i), '153');

  await userEvent.type(screen.getByLabelText(/nombre completo/i), 'Jenny Portilla');
  await userEvent.type(screen.getByLabelText(/correo/i), 'jenny@example.com');
  await userEvent.type(screen.getByLabelText(/^documento$/i), '1098765432');
  await userEvent.type(screen.getByLabelText(/teléfono/i), '3153710623');

  await userEvent.type(screen.getByLabelText(/dirección/i), 'Diagonal 7 #19a-18');
  await userEvent.type(screen.getByLabelText(/ciudad/i), 'Bucaramanga');
  await userEvent.type(screen.getByLabelText(/departamento/i), 'Santander');
};

describe('PaymentModal', () => {
  it('shows the brand badge as the card number is typed', async () => {
    render(<PaymentModal onClose={jest.fn()} onSubmit={jest.fn()} />);

    await userEvent.type(screen.getByLabelText(/número de tarjeta/i), '4242424242424242');

    expect(screen.getByLabelText('Visa')).toBeInTheDocument();
  });

  it('detects Mastercard too', async () => {
    render(<PaymentModal onClose={jest.fn()} onSubmit={jest.fn()} />);

    await userEvent.type(screen.getByLabelText(/número de tarjeta/i), '5555555555554444');

    expect(screen.getByLabelText('Mastercard')).toBeInTheDocument();
  });

  it('groups the card number in blocks of four', async () => {
    render(<PaymentModal onClose={jest.fn()} onSubmit={jest.fn()} />);

    const input = screen.getByLabelText(/número de tarjeta/i);
    await userEvent.type(input, '4242424242424242');

    expect(input).toHaveValue('4242 4242 4242 4242');
  });

  it('rejects a card number that fails the Luhn checksum', async () => {
    const onSubmit = jest.fn();
    render(<PaymentModal onClose={jest.fn()} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText(/número de tarjeta/i), '1245425391111222');
    await userEvent.click(screen.getByRole('button', { name: /continuar al resumen/i }));

    expect(await screen.findByText(/número de tarjeta inválido/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('warns how many fields are wrong', async () => {
    render(<PaymentModal onClose={jest.fn()} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /continuar al resumen/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/campos con errores/i);
  });

  it('rejects an invalid email', async () => {
    const onSubmit = jest.fn();
    render(<PaymentModal onClose={jest.fn()} onSubmit={onSubmit} />);

    await fillValidForm();
    await userEvent.clear(screen.getByLabelText(/correo/i));
    await userEvent.type(screen.getByLabelText(/correo/i), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: /continuar al resumen/i }));

    expect(await screen.findByText(/correo inválido/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits sanitized card, customer and delivery data', async () => {
    const onSubmit = jest.fn();
    render(<PaymentModal onClose={jest.fn()} onSubmit={onSubmit} />);

    await fillValidForm();
    await userEvent.click(screen.getByRole('button', { name: /continuar al resumen/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);

    const payload = onSubmit.mock.calls[0][0] as {
      card: { number: string; cardHolder: string };
      cardNumber: string;
      customer: { email: string; document: string };
      delivery: { city: string; country: string };
    };

    expect(payload.card.number).toBe('4242424242424242');
    expect(payload.card.cardHolder).toBe('JENNY PORTILLA');
    expect(payload.customer.email).toBe('jenny@example.com');
    expect(payload.customer.document).toBe('1098765432');
    expect(payload.delivery.city).toBe('Bucaramanga');
    expect(payload.delivery.country).toBe('CO');
  });

  it('closes with the Escape key', async () => {
    const onClose = jest.fn();
    render(<PaymentModal onClose={onClose} onSubmit={jest.fn()} />);

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('closes from the header button', async () => {
    const onClose = jest.fn();
    render(<PaymentModal onClose={onClose} onSubmit={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /cerrar/i }));

    expect(onClose).toHaveBeenCalled();
  });
});
