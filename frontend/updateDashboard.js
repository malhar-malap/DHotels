const fs = require('fs');
let code = fs.readFileSync('src/components/layout/DashboardLayout.js', 'utf8');

// 1. Remove space before Sign Out
code = code.replace('<div className="h-6"></div>\n', '');

// 2. Add FiShield to imports
if (!code.includes('FiShield')) {
  code = code.replace('FiX\n}', 'FiX, FiShield\n}');
}

// 3. Add Admin Panel to navItems dynamically
if (!code.includes('user?.roles?.includes(\'ADMIN\')')) {
  // We need to change navItems from const to let, or just push to it.
  code = code.replace(
    /const navItems = \[\s*\{ title: 'Overview'[\s\S]*?\{ title: 'Account Settings'[\s\S]*?\];/m,
    `const navItems = [
    { title: 'Overview', icon: FiHome, href: '/dashboard' },
    { title: 'My Listings', icon: FiList, href: '/dashboard/listings' },
    { title: 'Inquiries', icon: FiMail, href: '/dashboard/inquiries' },
    { title: 'My Jobs', icon: FiBriefcase, href: '/dashboard/jobs' },
    { title: 'Applications', icon: FiFileText, href: '/dashboard/applications' },
    { title: 'Account Settings', icon: FiSettings, href: '/dashboard/profile' },
  ];

  if (user?.roles?.includes('ADMIN')) {
    navItems.push({ title: 'Admin Panel', icon: FiShield, href: '/admin' });
  }`
  );
}

fs.writeFileSync('src/components/layout/DashboardLayout.js', code);
console.log('Fixed DashboardLayout');
