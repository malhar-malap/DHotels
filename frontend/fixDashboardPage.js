const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/DashboardPage.js', 'utf8');

// 1. Email sizing
code = code.replace(
  /<p className="font-black text-white text-lg tracking-tight break-all pl-14">\{user\?\.email/g,
  '<p className="font-black text-white text-sm tracking-tight truncate pl-14" title={user?.email}>{user?.email'
);

// 2. KYC Card height
code = code.replace(
  /className="glass-card p-8 md:p-10 h-full shadow-2xl relative overflow-hidden/g,
  'className="glass-card p-8 md:p-10 h-fit shadow-2xl relative overflow-hidden'
);

// 3. Quick Actions UI (4 cards)
code = code.replace(
  /className="glass-card p-6 group hover-3d transition-all duration-500 shadow-xl shadow-\[#d8572a\]\/5 flex flex-col items-center text-center"/g,
  'className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-ethereal-primary/30 transition-all duration-300 group hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col items-start relative overflow-hidden"'
);

// Fix inner elements of Quick Actions
code = code.replace(
  /className={`w-14 h-14 rounded-2xl bg-gradient-to-br \$\{action.color\} mb-4 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-500`}/g,
  'className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} mb-6 flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500 relative z-10`}'
);
code = code.replace(
  /<h3 className="font-black text-xs uppercase tracking-\[0\.2em\] text-white mb-1">\{action\.title\}<\/h3>\s*<p className="text-\[10px\] font-bold text-\[#e5e7eb\] opacity-40 uppercase tracking-widest">Execute Node<\/p>/g,
  '<h3 className="font-black text-sm uppercase tracking-widest text-white mb-2 relative z-10">{action.title}</h3>\n                  <p className="text-[10px] font-bold text-ethereal-on-surface-variant uppercase tracking-widest flex items-center gap-2 relative z-10">\n                    Execute Node <FiChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />\n                  </p>\n                  <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${action.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none`} />'
);

// Add missing icon
if (!code.includes('FiChevronRight')) {
  code = code.replace('FiActivity', 'FiActivity, FiChevronRight');
}

fs.writeFileSync('src/pages/dashboard/DashboardPage.js', code);
console.log("DashboardPage UI fixed");
