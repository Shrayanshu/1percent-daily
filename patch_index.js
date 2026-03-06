const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetStr = `                    if (handled) return;

                    const planTab = document.getElementById('screen-plan');
                    const reviewTab = document.getElementById('screen-review');
                    if ((planTab && !planTab.classList.contains('hidden')) || (reviewTab && !reviewTab.classList.contains('hidden'))) {
                        document.getElementById('btn-nav-home')?.click();
                        return;
                    }

                    showExitDialog();`;

const replacementStr = `                    if (handled) return;

                    const mainContent = document.getElementById('main-content');
                    if (mainContent && !mainContent.classList.contains('hidden')) {
                        showExitDialog();
                    } else {
                        document.getElementById('btn-nav-home')?.click();
                    }`;

const targetStrCrLf = targetStr.replace(/\n/g, '\r\n');
const replacementStrCrLf = replacementStr.replace(/\n/g, '\r\n');

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('index.html', content);
    console.log('Patched using LF');
} else if (content.includes(targetStrCrLf)) {
    content = content.replace(targetStrCrLf, replacementStrCrLf);
    fs.writeFileSync('index.html', content);
    console.log('Patched using CRLF');
} else {
    console.error('Target string not found!');
    process.exit(1);
}
