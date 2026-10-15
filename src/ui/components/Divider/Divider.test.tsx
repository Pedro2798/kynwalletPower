import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';

describe('Divider', () => {
  it('muestra el texto y oculta las líneas decorativas', () => {
    const { container } = render(<Divider>o continúa con</Divider>);
    expect(screen.getByText('o continúa con')).toBeInTheDocument();
    const lines = container.querySelectorAll('[aria-hidden="true"]');
    expect(lines).toHaveLength(2);
  });
});
