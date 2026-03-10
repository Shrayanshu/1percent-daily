const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const lines = content.split(/\r?\n/);

const functions = ['renderDashboard', 'navigate', 'renderTodayPlan', 'renderTomorrowPlan', 'saveNewHabit', 'renderGreatWork', 'renderWeeklyScreen', 'openEditTodayHabits', 'openEditTomorrowHabits', 'saveHabit', 'getPrimaryIdentity', 'renderCharacter'];

functions.forEach(fn => {
  lines.forEach((line, i) => {
    const regex = new RegExp(`^\\s*(?:async\\s+)?${fn}\\s*\\(`, 'i');
    if (regex.test(line)) {
      console.log(`FOUND ${fn} at line ${i+1}`);
    }
  });
});
