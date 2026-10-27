const fs = require('fs');

// 1. Clean HomePage.js
let homeCode = fs.readFileSync('src/pages/home/HomePage.js', 'utf8');
// Remove the explicit radial gradient from HomePage container (it's in App.js now)
homeCode = homeCode.replace('min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10', 'min-h-screen');
// Change opaque backgrounds to translucent or transparent
homeCode = homeCode.replace(/bg-gray-900/g, 'bg-gray-900/40');
fs.writeFileSync('src/pages/home/HomePage.js', homeCode);

// 2. Clean AboutUsPage.js
let aboutCode = fs.readFileSync('src/pages/home/AboutUsPage.js', 'utf8');
aboutCode = aboutCode.replace('bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10', '');
aboutCode = aboutCode.replace(/bg-gray-900/g, 'bg-gray-900/40');
fs.writeFileSync('src/pages/home/AboutUsPage.js', aboutCode);

// 3. Clean ListingsPage.js
let listingsCode = fs.readFileSync('src/pages/marketplace/ListingsPage.js', 'utf8');
listingsCode = listingsCode.replace('bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10', '');
listingsCode = listingsCode.replace(/bg-gray-900/g, 'bg-gray-900/40');
fs.writeFileSync('src/pages/marketplace/ListingsPage.js', listingsCode);

// 4. Clean RemainingPages.js
let remainingCode = fs.readFileSync('src/pages/RemainingPages.js', 'utf8');
remainingCode = remainingCode.replace(/bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10/g, '');
fs.writeFileSync('src/pages/RemainingPages.js', remainingCode);

console.log("Backgrounds cleaned!");
