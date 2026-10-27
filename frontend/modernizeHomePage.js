const fs = require('fs');

let code = fs.readFileSync('src/pages/home/HomePage.js', 'utf8');

// 1. Global Page Background
code = code.replace('<div className="min-h-screen">', '<div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10">');

// 2. Search Bar Glassmorphism
code = code.replace(
  'className="bg-gray-900/40/60 backdrop-blur-xl p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-900/80 max-w-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-gray-900/40/80"',
  'className="bg-gray-900/50 backdrop-blur-2xl p-2 rounded-3xl shadow-[0_8px_32px_rgba(216,87,42,0.15)] border border-white/10 max-w-2xl transition-all duration-500 hover:shadow-[0_8px_32px_rgba(216,87,42,0.25)] hover:border-[#d8572a]/30 group"'
);

// 3. Category Links
code = code.replace(
  /className="bg-gray-900\/40 border border-gray-800 p-6 md:p-10 rounded-3xl h-full relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-1"/g,
  'className="bg-gray-900/50 border border-white/5 p-6 md:p-10 rounded-[2.5rem] h-full relative overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#d8572a]/15 transition-all duration-500 transform group-hover:-translate-y-2 group-hover:border-[#d8572a]/30 backdrop-blur-xl"'
);

// 4. Category Icons container
code = code.replace(
  /className="w-16 h-16 bg-gray-900\/40 border border-gray-800 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:border-primary-200 transition-all duration-300"/g,
  'className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:border-[#d8572a]/50 group-hover:shadow-[0_0_20px_rgba(216,87,42,0.3)] transition-all duration-500 relative z-10"'
);

// 5. Featured Listings Cards
code = code.replace(
  /className="bg-gray-900\/40 rounded-3xl border border-gray-800 shadow-\[0_4px_20px_rgb\(0,0,0,0\.03\)\] hover:shadow-\[0_8px_30px_rgb\(0,0,0,0\.08\)\] hover:-translate-y-1 transition-all duration-300 h-full flex flex-col overflow-hidden"/g,
  'className="bg-gray-900/50 rounded-[2.5rem] border border-white/5 shadow-xl hover:shadow-2xl hover:shadow-[#d8572a]/15 hover:-translate-y-2 hover:border-[#d8572a]/30 transition-all duration-500 h-full flex flex-col overflow-hidden backdrop-blur-xl"'
);

// 6. How It Works Circles
code = code.replace(
  /className="w-24 h-24 bg-gray-900\/40 rounded-full flex items-center justify-center mx-auto mb-8 relative shadow-\[0_8px_30px_rgb\(0,0,0,0\.08\)\] group-hover:-translate-y-2 transition-transform duration-300"/g,
  'className="w-24 h-24 bg-gray-900/80 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 relative shadow-xl group-hover:shadow-[0_0_30px_rgba(216,87,42,0.25)] group-hover:-translate-y-3 group-hover:border-[#d8572a]/40 transition-all duration-500 backdrop-blur-md"'
);

// 7. Elite Healthcare Careers Cards
code = code.replace(
  /className="bg-gray-900\/40 rounded-2xl p-6 flex items-center justify-between group hover:border-primary-200 border border-transparent shadow-sm transition-all cursor-pointer"/g,
  'className="bg-gray-900/50 rounded-[2rem] p-6 flex items-center justify-between group hover:border-[#d8572a]/30 border border-white/5 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:shadow-[#d8572a]/15 transition-all duration-500 cursor-pointer backdrop-blur-md"'
);

// 8. Featured Jobs Cards
code = code.replace(
  /className="bg-gray-900\/40 rounded-3xl p-8 border border-gray-800 shadow-sm hover:shadow-\[0_8px_30px_rgb\(0,0,0,0\.06\)\] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden h-full flex flex-col"/g,
  'className="bg-gray-900/50 rounded-[2.5rem] p-8 border border-white/5 shadow-lg hover:shadow-2xl hover:shadow-[#d8572a]/15 hover:-translate-y-2 hover:border-[#d8572a]/30 transition-all duration-500 relative overflow-hidden h-full flex flex-col backdrop-blur-xl"'
);

// 9. Premium Opportunities Coming Soon (Empty Jobs)
code = code.replace(
  'className="bg-gray-900/40 rounded-3xl p-12 text-center relative overflow-hidden border border-gray-800 shadow-sm"',
  'className="bg-gray-900/50 rounded-[2.5rem] p-12 text-center relative overflow-hidden border border-white/5 shadow-2xl backdrop-blur-xl"'
);

// 10. Secondary CTA Buttons
code = code.replace(
  'className="bg-gray-900/40 border-2 border-gray-700 px-6 md:px-10 py-4 md:py-5 rounded-2xl text-gray-200 font-bold text-lg md:text-xl hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 transition-all transform hover:-translate-y-1 shadow-sm"',
  'className="bg-gray-900/50 border border-white/10 px-6 md:px-10 py-4 md:py-5 rounded-2xl text-white font-bold text-lg md:text-xl hover:border-[#d8572a]/50 hover:bg-[#d8572a]/10 transition-all transform hover:-translate-y-1 shadow-lg backdrop-blur-md hover:shadow-[#d8572a]/20"'
);

code = code.replace(
  'className="group flex items-center gap-3 bg-gray-900/40 px-8 py-4 rounded-2xl shadow-sm hover:shadow-md border border-gray-800 transition-all font-bold text-gray-100"',
  'className="group flex items-center gap-3 bg-gray-900/50 px-8 py-4 rounded-[2rem] shadow-lg hover:shadow-xl hover:shadow-[#d8572a]/15 border border-white/10 hover:border-[#d8572a]/40 transition-all font-bold text-white backdrop-blur-md"'
);

code = code.replace(
  'className="px-6 py-3 bg-gray-900/40 text-primary-600 font-bold border border-gray-700 rounded-xl hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-2"',
  'className="px-6 py-3 bg-gray-900/50 text-[#db7c26] font-bold border border-white/10 rounded-2xl hover:border-[#d8572a]/40 hover:bg-[#d8572a]/10 hover:shadow-lg hover:shadow-[#d8572a]/20 transition-all flex items-center gap-2 backdrop-blur-md"'
);

// 11. Finally, remove background colors from Sections so the global gradient shows through!
// Replace section backgrounds
code = code.replace(/className="py-24 bg-gray-800 relative overflow-hidden"/g, 'className="py-24 relative overflow-hidden"');
code = code.replace(/className="py-24 bg-gray-900\/40 relative overflow-hidden"/g, 'className="py-24 relative overflow-hidden"');
code = code.replace(/className="relative h-\[500px\] md:h-\[650px\] overflow-hidden bg-gray-900\/40"/g, 'className="relative h-[500px] md:h-[650px] overflow-hidden"');

fs.writeFileSync('src/pages/home/HomePage.js', code);
console.log("Successfully modernized HomePage!");
