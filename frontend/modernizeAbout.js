const fs = require('fs');

let code = fs.readFileSync('src/pages/home/AboutUsPage.js', 'utf8');

// Global Background
code = code.replace('<div className="min-h-screen  pb-20">', '<div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10 pb-20">');

// Hero Section BG
code = code.replace(/bg-gray-900\/40/g, 'bg-transparent'); // For the section backgrounds

// Mission/Vision Cards
code = code.replace(
  /className="bg-transparent p-10 rounded-3xl shadow-sm border border-gray-800 transition-transform hover:-translate-y-2 duration-300"/g,
  'className="bg-gray-900/50 p-10 rounded-[2.5rem] border border-white/5 shadow-xl hover:shadow-2xl hover:shadow-[#d8572a]/15 transition-all duration-500 transform hover:-translate-y-2 hover:border-[#d8572a]/30 backdrop-blur-xl"'
);

// CEO Card
code = code.replace(
  'className="bg-transparent rounded-[2.5rem] p-8 md:p-16 shadow-lg border border-gray-800 flex flex-col md:flex-row items-center gap-12"',
  'className="bg-gray-900/50 rounded-[3rem] p-8 md:p-16 shadow-2xl border border-white/5 hover:border-[#d8572a]/30 flex flex-col md:flex-row items-center gap-12 transition-all duration-500 backdrop-blur-xl"'
);

// CTA Section
code = code.replace(
  'className="bg-gradient-to-br from-[#191c1e] to-[#2a3033] rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl"',
  'className="bg-gray-900/50 border border-white/5 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl backdrop-blur-2xl hover:border-[#d8572a]/30 transition-all duration-500"'
);

// Specific buttons
code = code.replace(
  'className="px-8 py-4 rounded-xl font-bold text-lg text-white bg-gray-900/40/10 hover:bg-gray-900/40/20 transition-all w-full sm:w-auto backdrop-blur-md"',
  'className="px-8 py-4 rounded-xl font-bold text-lg text-white bg-gray-900/50 border border-white/10 hover:border-[#d8572a]/50 hover:bg-[#d8572a]/10 hover:shadow-lg hover:shadow-[#d8572a]/20 transition-all w-full sm:w-auto backdrop-blur-md"'
);

fs.writeFileSync('src/pages/home/AboutUsPage.js', code);
console.log('AboutUs modernized');
