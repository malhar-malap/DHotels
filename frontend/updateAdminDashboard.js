const fs = require('fs');

let code = fs.readFileSync('src/pages/admin/AdminDashboard.js', 'utf8');

// Update Ecosystem Management cards array to include colors
code = code.replace(
  /\{\s*to: '\/admin\/listings',\s*icon: FiList,\s*label: 'Asset Library'\s*\}/,
  "{ to: '/admin/listings', icon: FiList, label: 'Asset Library', color: 'from-blue-500 to-indigo-600' }"
).replace(
  /\{\s*to: '\/admin\/jobs',\s*icon: FiBriefcase,\s*label: 'Talent Pool'\s*\}/,
  "{ to: '/admin/jobs', icon: FiBriefcase, label: 'Talent Pool', color: 'from-purple-500 to-pink-600' }"
).replace(
  /\{\s*to: '\/admin\/users',\s*icon: FiUsers,\s*label: 'Entity Directory'\s*\}/,
  "{ to: '/admin/users', icon: FiUsers, label: 'Entity Directory', color: 'from-[#d8572a] to-[#db7c26]' }"
).replace(
  /\{\s*to: '\/admin\/verifications',\s*icon: FiCheck,\s*label: 'Trust Gateway'\s*\}/,
  "{ to: '/admin/verifications', icon: FiCheck, label: 'Trust Gateway', color: 'from-orange-500 to-red-600' }"
).replace(
  /\{\s*to: '\/admin\/payments',\s*icon: FiCreditCard,\s*label: 'Financial Core'\s*\}/,
  "{ to: '/admin/payments', icon: FiCreditCard, label: 'Financial Core', color: 'from-emerald-500 to-teal-600' }"
).replace(
  /\{\s*to: '\/admin\/contact-messages',\s*icon: FiMail,\s*label: 'Contact Messages'\s*\}/,
  "{ to: '/admin/contact-messages', icon: FiMail, label: 'Contact Messages', color: 'from-cyan-500 to-blue-600' }"
);

// Add FiChevronRight to imports if missing
if (!code.includes('FiChevronRight')) {
  code = code.replace('FiCreditCard }', 'FiCreditCard, FiChevronRight }');
}

// Replace the Ecosystem Management mapping
const oldMapping = `<Link key={link.label} to={link.to} className="group p-8 bg-ethereal-surface-low/50 rounded-3xl hover:bg-ethereal-primary hover:text-white transition-all duration-500 text-center">
                <link.icon className="w-8 h-8 mx-auto mb-4 text-ethereal-on-surface-variant group-hover:text-white transition-colors" />
                <p className="font-bold uppercase tracking-widest text-[10px]">{link.label}</p>
              </Link>`;

const newMapping = `<Link key={link.label} to={link.to} className="bg-gray-900/50 p-6 rounded-2xl border border-white/5 hover:border-ethereal-primary/30 transition-all duration-300 group hover:-translate-y-1 shadow-sm hover:shadow-xl flex flex-col items-start relative overflow-hidden">
                <div className={\`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br \${link.color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.15] transition-opacity duration-500 pointer-events-none\`} />
                <div className={\`w-12 h-12 rounded-xl bg-gradient-to-br \${link.color} mb-6 flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-500 relative z-10\`}>
                  <link.icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-widest text-white mb-2 relative z-10">{link.label}</h3>
                <p className="text-[10px] font-bold text-ethereal-on-surface-variant uppercase tracking-widest flex items-center gap-2 relative z-10">
                  Manage Node <FiChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </p>
              </Link>`;

code = code.replace(oldMapping, newMapping);

// Update Active Pipeline rows hover
code = code.replace(/bg-ethereal-surface-low\/50 rounded-3xl group hover:bg-gray-900 transition-all duration-300/g, 'bg-gray-900/50 border border-white/5 rounded-3xl group hover:bg-gray-800/80 hover:border-white/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden');

fs.writeFileSync('src/pages/admin/AdminDashboard.js', code);
console.log('AdminDashboard updated!');
