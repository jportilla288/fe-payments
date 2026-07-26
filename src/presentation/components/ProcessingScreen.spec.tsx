import { render, screen } from '@testing-library/react';
import { ProcessingScreen } from './ProcessingScreen';

describe('ProcessingScreen', () => {
  it('announces the progress to assistive technology', () => {
    render(<ProcessingScreen />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/procesando tu pago/i)).toBeInTheDocument();
  });
});
