import { myHoursStatusLine, weekToGoLabel } from './my-hours-status';

describe('myHoursStatusLine', () => {
  it('shows the running session and the week against the goal', () => {
    expect(
      myHoursStatusLine({
        clockedInLabel: '8:02 AM',
        week: { loggedMinutes: 750, goalMinutes: 1800 },
      }),
    ).toBe('On the clock since 8:02 AM · 12h 30m of 30h this week');
  });

  it('says off the clock and goal met', () => {
    expect(
      myHoursStatusLine({ clockedInLabel: null, week: { loggedMinutes: 1830, goalMinutes: 1800 } }),
    ).toBe('Off the clock · 30h 30m this week · goal met');
  });

  it('drops the goal when there is none, and the week when it is missing', () => {
    expect(myHoursStatusLine({ clockedInLabel: null, week: { loggedMinutes: 90, goalMinutes: 0 } })).toBe(
      'Off the clock · 1h 30m this week',
    );
    expect(myHoursStatusLine({ clockedInLabel: null, week: null })).toBe('Off the clock');
  });
});

describe('weekToGoLabel', () => {
  it('counts down to the goal', () => {
    expect(weekToGoLabel({ loggedMinutes: 1530, goalMinutes: 1800 })).toBe('4h 30m to go');
    expect(weekToGoLabel({ loggedMinutes: 1800, goalMinutes: 1800 })).toBe('Goal met');
    expect(weekToGoLabel({ loggedMinutes: 10, goalMinutes: 0 })).toBeNull();
  });
});
