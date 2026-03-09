const fs = require('fs');
let content = fs.readFileSync('dashboard.html', 'utf8');
content = content.replace('<div style="width:40px; height:40px; border-radius:50%; overflow: hidden; border: 1px solid #333; position: relative;">', '<a href="profile.html" style="width:40px; height:40px; border-radius:50%; overflow: hidden; border: 1px solid #333; position: relative; display: block;">');
content = content.replace('src="img/profile.jpg"', 'src="img/icon.png"');
content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<!-- Training Card/s, '</a>\n                </div>\n            </div>\n\n            <!-- Training Card');
fs.writeFileSync('dashboard.html', content, 'utf8');
console.log('Done!');
