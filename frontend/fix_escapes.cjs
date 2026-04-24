const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/aelid/OneDrive/CarRental_React/frontend/src/pages/director';

function fixFile(file) {
    if (!file.endsWith('.jsx')) return;
    const p = path.join(dir, file);
    const content = fs.readFileSync(p, 'utf8');
    
    // Replace \$ with $
    let newContent = content.replace(/\\\$/g, '$');
    
    // Replace \` with `
    newContent = newContent.replace(/\\`/g, '`');

    if (content !== newContent) {
        fs.writeFileSync(p, newContent);
        console.log('Fixed', file);
    }
}

fs.readdirSync(dir).forEach(fixFile);
