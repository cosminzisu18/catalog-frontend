/** @jest-environment jsdom */
import { screen } from '@testing-library/react';
import { api } from '@/lib/api';
import { renderWithToast } from '@/testing/render';
import { DecisionModal } from './DecisionModal';

jest.mock('@/lib/api', () => ({ api: jest.fn() }));
const apiMock = api as jest.Mock;

function renderModal(onSaved = jest.fn()) {
  return renderWithToast(
    <DecisionModal
      title="Decide cererea de purtare"
      subtitle="Nota propusa: 9"
      teacherReason="Absente nemotivate"
      decideUrl="/conduct/4/decide"
      messages={{ approved: 'Cerere aprobata', rejected: 'Cerere respinsa' }}
      onClose={jest.fn()}
      onSaved={onSaved}
    />,
  );
}

describe('DecisionModal', () => {
  beforeEach(() => {
    apiMock.mockReset().mockResolvedValue({});
  });

  it("shows the teacher's reason", () => {
    renderModal();
    expect(screen.getByText('Motiv profesor: Absente nemotivate')).toBeTruthy();
  });

  it('asks for a reason of at least 5 characters', async () => {
    const { user } = renderModal();

    await user.type(screen.getByLabelText(/Motiv director/), 'ok');
    await user.click(screen.getByRole('button', { name: 'Aproba' }));

    expect(
      await screen.findByText('Motivul directorului trebuie sa aiba minim 5 caractere'),
    ).toBeTruthy();
    expect(apiMock).not.toHaveBeenCalled();
  });

  it.each([
    ['Aproba', true, 'Cerere aprobata'],
    ['Respinge', false, 'Cerere respinsa'],
  ])('sends the decision when pressing %s', async (button, approve, message) => {
    const onSaved = jest.fn();
    const { user } = renderModal(onSaved);

    await user.type(screen.getByLabelText(/Motiv director/), '  De acord cu cererea  ');
    await user.click(screen.getByRole('button', { name: button }));

    expect(apiMock).toHaveBeenCalledWith('/conduct/4/decide', {
      method: 'PATCH',
      body: JSON.stringify({ approve, directorReason: 'De acord cu cererea' }),
    });
    expect(onSaved).toHaveBeenCalled();
    expect(await screen.findByText(message)).toBeTruthy();
  });
});
