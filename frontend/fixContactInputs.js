const fs = require('fs');
let code = fs.readFileSync('src/pages/home/ContactUsPage.js', 'utf8');
code = code.split('w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition placeholder-gray-500').join('w-full px-5 py-4 bg-gray-900/40 border border-white/10 text-white rounded-2xl focus:ring-2 focus:ring-[#d8572a] focus:border-[#d8572a]/50 hover:border-white/20 outline-none transition-all duration-300 placeholder-gray-500');
fs.writeFileSync('src/pages/home/ContactUsPage.js', code);
console.log('Fixed inputs');
