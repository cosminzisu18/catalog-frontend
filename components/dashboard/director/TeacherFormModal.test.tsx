/** @jest-environment jsdom */
import { screen } from '@testing-library/react';
import { api } from '@/lib/api';
import { STRONG_PASSWORD_REGEX } from '@/lib/password';
import { renderWithToast } from '@/testing/render';
import { TeacherFormModal } from './TeacherFormModal';

jest.mock('@/lib/api', () => ({ api: jest.fn() }));
const apiMock = api as jest.Mock;

describe('TeacherFormModal', () => {
  beforeEach(() => {
    apiMock.mockReset().mockResolvedValue({});
  });

  it('does not send a weak temporary password', async () => {
    const onSaved = jest.fn();
    const { user } = renderWithToast(
      <TeacherFormModal teacher={null} onClose={jest.fn()} onSaved={onSaved} />,
    );

    await user.type(screen.getByLabelText(/Email/), 'prof@scoala.ro');
    await user.type(screen.getByLabelText(/Prenume/), 'Ion');
    await user.type(screen.getByLabelText(/^Nume/), 'Pop');
    await user.type(screen.getByLabelText(/Parola temporara/), 'slaba');
    await user.click(screen.getByRole('button', { name: 'Salveaza' }));

    expect(await screen.findByText('Parola nu este puternica')).toBeTruthy();
    expect(apiMock).not.toHaveBeenCalled();
    expect(onSaved).not.toHaveBeenCalled();
  });

  it('creates a teacher with a generated password', async () => {
    const onSaved = jest.fn();
    const { user } = renderWithToast(
      <TeacherFormModal teacher={null} onClose={jest.fn()} onSaved={onSaved} />,
    );

    await user.type(screen.getByLabelText(/Email/), 'prof@scoala.ro');
    await user.type(screen.getByLabelText(/Prenume/), 'Ion');
    await user.type(screen.getByLabelText(/^Nume/), 'Pop');
    await user.click(screen.getByRole('button', { name: 'Genereaza' }));
    await user.click(screen.getByRole('button', { name: 'Salveaza' }));

    expect(apiMock).toHaveBeenCalledTimes(1);
    const [path, init] = apiMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(path).toBe('/teachers');
    expect(init.method).toBe('POST');
    expect(body).toMatchObject({
      email: 'prof@scoala.ro',
      firstName: 'Ion',
      lastName: 'Pop',
    });
    expect(body.temporaryPassword).toMatch(STRONG_PASSWORD_REGEX);
    expect(onSaved).toHaveBeenCalled();
    expect(await screen.findByText('Profesor adaugat')).toBeTruthy();
  });

  it('edits a teacher without changing the password', async () => {
    const onSaved = jest.fn();
    const { user } = renderWithToast(
      <TeacherFormModal
        teacher={{
          id: 5,
          firstName: 'Ion',
          lastName: 'Pop',
          email: 'prof@scoala.ro',
          hoursTaught: 0,
          isActive: true,
        }}
        onClose={jest.fn()}
        onSaved={onSaved}
      />,
    );

    expect(screen.getByText('Modifica profesor')).toBeTruthy();
    const lastName = screen.getByLabelText(/^Nume/) as HTMLInputElement;
    expect(lastName.value).toBe('Pop');

    await user.clear(lastName);
    await user.type(lastName, 'Popescu');
    await user.click(screen.getByRole('button', { name: 'Salveaza' }));

    const [path, init] = apiMock.mock.calls[0] as [string, RequestInit];
    expect(path).toBe('/teachers/5');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body as string)).toEqual({
      email: 'prof@scoala.ro',
      firstName: 'Ion',
      lastName: 'Popescu',
    });
    expect(onSaved).toHaveBeenCalled();
  });

  it('keeps the form open when the server refuses the data', async () => {
    apiMock.mockRejectedValue(new Error('Emailul este deja folosit'));
    const onSaved = jest.fn();
    const { user } = renderWithToast(
      <TeacherFormModal teacher={null} onClose={jest.fn()} onSaved={onSaved} />,
    );

    await user.type(screen.getByLabelText(/Email/), 'prof@scoala.ro');
    await user.type(screen.getByLabelText(/Prenume/), 'Ion');
    await user.type(screen.getByLabelText(/^Nume/), 'Pop');
    await user.click(screen.getByRole('button', { name: 'Genereaza' }));
    await user.click(screen.getByRole('button', { name: 'Salveaza' }));

    expect(await screen.findByText('Emailul este deja folosit')).toBeTruthy();
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getByText('Adauga profesor')).toBeTruthy();
  });
});
