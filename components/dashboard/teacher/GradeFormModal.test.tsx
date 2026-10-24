/** @jest-environment jsdom */
import { screen } from '@testing-library/react';
import { api } from '@/lib/api';
import { renderWithToast } from '@/testing/render';
import { GradeFormModal } from './GradeFormModal';

jest.mock('@/lib/api', () => ({ api: jest.fn() }));
const apiMock = api as jest.Mock;

const subjects = [{ id: 3, name: 'Matematica' }];
const students = [
  { id: 1, firstName: 'Ana', lastName: 'Pop', className: '9A', conductGrade: 10 },
  { id: 2, firstName: 'Ion', lastName: 'Rus', className: '9A', conductGrade: 10 },
];

// lesson-check answers with `inLesson`, everything else succeeds
function mockApi(inLesson: boolean) {
  apiMock.mockImplementation((path: string) =>
    Promise.resolve(
      path.startsWith('/timetable/lesson-check')
        ? {
            inLesson,
            message: inLesson ? 'Esti la ora (08:00-08:50, Luni).' : 'Nu esti la ora.',
          }
        : {},
    ),
  );
}

function renderForm(onSaved = jest.fn()) {
  return renderWithToast(
    <GradeFormModal
      subjects={subjects}
      students={students}
      onClose={jest.fn()}
      onSaved={onSaved}
    />,
  );
}

describe('GradeFormModal', () => {
  beforeEach(() => {
    apiMock.mockReset();
  });

  it('checks the lesson for the only subject and blocks saving outside it', async () => {
    mockApi(false);
    renderForm();

    expect(await screen.findByText('Nu esti la ora.')).toBeTruthy();
    expect(apiMock).toHaveBeenCalledWith('/timetable/lesson-check?subjectId=3');
    const save = screen.getByRole('button', { name: 'Salveaza nota' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
  });

  it('saves a thesis with a decimal value', async () => {
    mockApi(true);
    const onSaved = jest.fn();
    const { user } = renderForm(onSaved);

    expect(await screen.findByText('Esti la ora (08:00-08:50, Luni).')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Selecteaza/ }));
    await user.click(screen.getByRole('option', { name: /Ana Pop/ }));

    const value = screen.getByLabelText(/^Nota/);
    await user.clear(value);
    await user.type(value, '7.5');

    await user.click(screen.getByRole('button', { name: 'Nota curenta' }));
    await user.click(screen.getByRole('option', { name: /Teza/ }));

    await user.click(screen.getByRole('button', { name: 'Salveaza nota' }));

    const call = apiMock.mock.calls.find(([path]) => path === '/grades');
    expect(call).toBeDefined();
    const body = JSON.parse((call![1] as RequestInit).body as string);
    expect(body).toMatchObject({
      studentId: 1,
      subjectId: 3,
      value: 7.5,
      type: 'THESIS',
    });
    expect(body.gradedOn).toMatch(/^\d{2}-\d{2}-\d{4}$/);
    expect(onSaved).toHaveBeenCalled();
    expect(await screen.findByText('Teza adaugata')).toBeTruthy();
  });
});
