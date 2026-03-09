const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const screens = ['screen-splash', 'screen-new-week', 'screen-review', 'screen-goals', 'screen-settings', 'screen-weekly-review'];
lines.forEach((line, i) => {
    if (screens.some(s => line.includes(`id="${s}"`))) {
        console.log(`${i + 1}: ${line.trim()}`);
    }
});
