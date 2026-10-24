/** @jest-environment jsdom */
import { screen, within } from '@testing-library/react';
import { api } from '@/lib/api';
import type { Absence, AbsencePage } from '@/lib/absences';
import { renderWithToast } from '@/testing/render';
import { AbsenceList } from './AbsenceList';

jest.mock('@/lib/api', () => ({ api: jest.fn() }));
const apiMock = api as jest.Mock;

const absence = (id: number, motivated: boolean): Absence => ({
  id,
  studentId: id,
  studentName: `Elev ${id}`,
  className: '9A',
  subjectId: 3,
  subjectName: 'Matematica',
  teacherName: 'Ion Pop',
  absentOn: '23-10-2026',
  motivated,
  motivatedReason: motivated ? 'adeverinta medicala' : null,
  motivatedAt: null,
});

const page: AbsencePage = {
  items: [absence(1, false), absence(2, true)],
  total: 2,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  summary: { total: 2, motivated: 1, unmotivated: 1 },
};

// the table is rendered twice (cards on mobile, table on desktop)
function desktopTable() {
  return screen.getByRole('table');
}

describe('AbsenceList', () => {
  beforeEach(() => {
    apiMock.mockReset().mockResolvedValue(page);
  });

  it('shows the totals and the status of each absence', async () => {
    renderWithToast(<AbsenceList path="/absences" showStudent />);

    const table = await screen.findByRole('table');
    expect(await within(table).findByText('Elev 1 (9A)')).toBeTruthy();
    expect(within(table).getByText('Nemotivata')).toBeTruthy();
    expect(within(table).getByText('Motivata')).toBeTruthy();
    expect(within(table).getByText('adeverinta medicala')).toBeTruthy();

    const totals = screen.getByText('Total absente').parentElement!;
    expect(within(totals).getByText('2')).toBeTruthy();
  });

  it('offers to motivate only the absences that are not motivated', async () => {
    const onMotivate = jest.fn();
    const { user } = renderWithToast(
      <AbsenceList path="/absences" showStudent onMotivate={onMotivate} />,
    );

    await screen.findAllByText('Elev 1 (9A)');
    const buttons = within(desktopTable()).getAllByRole('button', { name: 'Motiveaza' });
    expect(buttons).toHaveLength(1);

    await user.click(buttons[0]);
    expect(onMotivate).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('has no motivate button without the director action', async () => {
    renderWithToast(<AbsenceList path="/absences/me" />);

    await screen.findAllByText('Nemotivata');
    expect(screen.queryAllByRole('button', { name: 'Motiveaza' })).toHaveLength(0);
  });

  it('asks the server again when the status filter changes', async () => {
    const { user } = renderWithToast(<AbsenceList path="/absences" showStudent />);
    await screen.findAllByText('Elev 1 (9A)');

    await user.click(screen.getByRole('button', { name: 'Toate' }));
    await user.click(screen.getByRole('option', { name: 'Nemotivate' }));

    await screen.findAllByText('Elev 1 (9A)');
    const lastPath = apiMock.mock.calls.at(-1)![0] as string;
    expect(lastPath).toContain('/absences?');
    expect(lastPath).toContain('motivated=false');
  });
});
