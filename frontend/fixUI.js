const fs = require('fs');

// 1. Fix JobsPage.js gradient
let jobsCode = fs.readFileSync('src/pages/jobs/JobsPage.js', 'utf8');
jobsCode = jobsCode.replace(
  '<div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/85 to-[#121212]/30" />\n              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />',
  '<div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />\n              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />'
);
// In case the replace failed because the old replace script wasn't run on exactly this string:
jobsCode = jobsCode.replace(
  '<div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/85 to-[#121212]/30" />',
  '<div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />'
);
fs.writeFileSync('src/pages/jobs/JobsPage.js', jobsCode);
console.log('Fixed JobsPage');

// 2. Fix DashboardLayout.js Sign Out button
let dashLayout = fs.readFileSync('src/components/layout/DashboardLayout.js', 'utf8');
dashLayout = dashLayout.replace(
  /<\/nav>\s*\{\/\* Sidebar Footer \*\/\}[\s\S]*?<div className="p-6 mb-4">[\s\S]*?<button[\s\S]*?onClick=\{handleLogout\}[\s\S]*?className="w-full flex items-center gap-4 px-4 py-3\.5 rounded-xl text-red-500 hover:bg-red-500\/10 transition-colors duration-300 group"[\s\S]*?>[\s\S]*?<FiLogOut className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" \/>[\s\S]*?<span className="font-bold text-xs uppercase tracking-widest">Sign Out<\/span>[\s\S]*?<\/button>[\s\S]*?<\/div>/,
  `  <div className="h-6"></div>\n            <button \n              onClick={handleLogout}\n              className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors duration-300 group"\n            >\n              <FiLogOut className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />\n              <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>\n            </button>\n          </nav>`
);
fs.writeFileSync('src/components/layout/DashboardLayout.js', dashLayout);
console.log('Fixed DashboardLayout');

// 3. Fix AdminDashboard.js cards
let adminCode = fs.readFileSync('src/pages/admin/AdminDashboard.js', 'utf8');
adminCode = adminCode.replace(
  /<Link key=\{link\.label\} to=\{link\.to\} className="group p-8 bg-ethereal-surface-low\/50 rounded-3xl hover:bg-ethereal-primary hover:text-white transition-all duration-500 text-center">[\s\S]*?<link\.icon className="w-8 h-8 mx-auto mb-4 text-ethereal-on-surface-variant group-hover:text-white transition-colors" \/>[\s\S]*?<p className="font-bold uppercase tracking-widest text-\[10px\]">\{link\.label\}<\/p>[\s\S]*?<\/Link>/g,
  `<Link \n                  key={link.label} \n                  to={link.to} \n                  className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-ethereal-primary/30 transition-all duration-300 group hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col items-start relative overflow-hidden"\n                >\n                  <div className={\`w-12 h-12 rounded-xl bg-gradient-to-br \${link.color} mb-6 flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500 relative z-10\`}>\n                    <link.icon className="w-7 h-7" />\n                  </div>\n                  <h3 className="font-black text-sm uppercase tracking-widest text-white mb-2 relative z-10">{link.label}</h3>\n                  <p className="text-[10px] font-bold text-ethereal-on-surface-variant uppercase tracking-widest flex items-center gap-2 relative z-10">\n                    Execute Node <FiChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />\n                  </p>\n                  <div className={\`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br \${link.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none\`} />\n                </Link>`
);
fs.writeFileSync('src/pages/admin/AdminDashboard.js', adminCode);
console.log('Fixed AdminDashboard');
