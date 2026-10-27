const fs = require('fs');
let code = fs.readFileSync('src/pages/jobs/JobsPage.js', 'utf8');

// Fix carousel blending
code = code.replace(
  '<div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/85 to-[#121212]/30" />',
  '<div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/85 to-[#121212]/30" />\n              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />'
);

// Fix redundant background on JobsPage container since App.js already has it
code = code.replace(
  '<div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-gray-900 to-[#d8572a]/10">',
  '<div className="min-h-screen">'
);

// Fix Job Cards UI
// Original: <div className="glass-card hover-3d-child p-8 h-full relative overflow-hidden group flex flex-col">
code = code.replace(
  /<div className="glass-card hover-3d-child p-8 h-full relative overflow-hidden group flex flex-col">/g,
  '<div className="bg-gray-800/40 backdrop-blur-xl border border-white/5 shadow-2xl p-8 rounded-[2.5rem] relative overflow-hidden group hover:bg-gray-800/60 hover:border-white/10 transition-all duration-300 h-full flex flex-col hover:-translate-y-1">'
);

// Fix border inside job cards
code = code.replace(
  /<div className="space-y-4 pt-6 border-t border-\[#f2f4f6\]">/g,
  '<div className="space-y-4 pt-6 border-t border-white/5">'
);

// Add missing icon for Job Card UI fix
if(!code.includes('FiChevronRight')) {
  code = code.replace('FiDollarSign }', 'FiDollarSign, FiChevronRight }');
}

fs.writeFileSync('src/pages/jobs/JobsPage.js', code);
console.log('JobsPage updated');
