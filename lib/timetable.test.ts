import {
  dayLabel,
  hoursRange,
  minutesToTime,
  parseTimeToMinutes,
  slotStyle,
  snapMinutes,
  DAY_START_HOUR,
  DAY_END_HOUR,
  HOUR_HEIGHT_PX,
} from './timetable';

describe('timetable helpers', () => {
  it('converts between HH:mm and minutes', () => {
    expect(parseTimeToMinutes('08:30')).toBe(510);
    // the DB may send seconds too
    expect(parseTimeToMinutes('08:30:00')).toBe(510);
    expect(minutesToTime(510)).toBe('08:30');
    expect(minutesToTime(0)).toBe('00:00');
  });

  it('snaps minutes to a step', () => {
    expect(snapMinutes(512)).toBe(510);
    expect(snapMinutes(513)).toBe(515);
    expect(snapMinutes(520, 15)).toBe(525);
  });

  it('names the weekdays', () => {
    expect(dayLabel(1)).toBe('Luni');
    expect(dayLabel(5)).toBe('Vineri');
    expect(dayLabel(6)).toBe('Zi 6');
  });

  it('places a lesson in the calendar', () => {
    const start = `${String(DAY_START_HOUR + 1).padStart(2, '0')}:00`;
    const end = `${String(DAY_START_HOUR + 2).padStart(2, '0')}:00`;
    expect(slotStyle(start, end)).toEqual({
      top: HOUR_HEIGHT_PX,
      height: HOUR_HEIGHT_PX,
    });
  });

  it('keeps very short lessons readable', () => {
    expect(slotStyle('08:00', '08:05').height).toBe(28);
  });

  it('lists the hours of the school day', () => {
    const hours = hoursRange();
    expect(hours[0]).toBe(DAY_START_HOUR);
    expect(hours).toHaveLength(DAY_END_HOUR - DAY_START_HOUR);
  });
});
