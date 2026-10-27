const fs = require('fs');
let code = fs.readFileSync('src/pages/RemainingPages.js', 'utf8');

// Ensure import
if (!code.includes('DashboardLayout')) {
  code = code.replace(
    "import { Link } from 'react-router-dom';",
    "import { Link } from 'react-router-dom';\nimport DashboardLayout from '../components/layout/DashboardLayout';\nimport { FaBriefcase } from 'react-icons/fa';"
  );
}

// Remove opaque backgrounds
code = code.replace(/bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10/g, '');

const pages = {
  'MyListingsPage': 'My Listings',
  'MyInquiriesPage': 'Inquiries',
  'MyJobsPage': 'My Jobs',
  'MyApplicationsPage': 'Applications',
  'ProfilePage': 'Account Settings'
};

for (const [page, tab] of Object.entries(pages)) {
  const regexStr = `export const ${page} = \\(\\) => \\{[\\s\\S]*?\\n\\};`;
  const regex = new RegExp(regexStr);
  const match = code.match(regex);
  if (match) {
    let pageCode = match[0];

    // Main return wrapper
    pageCode = pageCode.replace(
      /return \(\s*<div className="min-h-screen[^>]*>\s*(<div className="max-w-[^>]+>)/,
      `return (\n    <DashboardLayout activeTab="${tab}">\n      <div className="py-10 px-4 md:px-8 w-full">\n      $1`
    );

    // Loading return wrapper
    pageCode = pageCode.replace(
      /if \(loading\) return \(\s*<div className="min-h-screen[^>]*>\s*(<div className="animate-[^>]+>.*?<\/div>)\s*<\/div>\s*\);/,
      `if (loading) return (\n    <DashboardLayout activeTab="${tab}">\n      <div className="py-10 px-4 md:px-8 w-full flex items-center justify-center">\n      $1\n      </div>\n    </DashboardLayout>\n  );`
    );

    // End closing wrapper
    pageCode = pageCode.replace(
      /      <\/div>\r?\n    <\/div>\r?\n  \);\r?\n\};/,
      '      </div>\n    </div>\n    </DashboardLayout>\n  );\n};'
    );

    // Fix UI for FULL TIME avatar specifically in MyJobsPage
    if (page === 'MyJobsPage') {
      pageCode = pageCode.replace(
        '<span className="w-1.5 h-1.5 rounded-full bg-ethereal-primary mr-2"></span> {job.employmentType}',
        '<span className="w-1.5 h-1.5 rounded-full bg-ethereal-primary mr-2"></span> {job.employmentType?.replace(/_/g, " ")}'
      );
      pageCode = pageCode.replace(
        '<span className="text-sm font-extrabold uppercase tracking-widest">{job.employmentType?.charAt(0) || \'J\'}</span>',
        '<FaBriefcase size={24} />'
      );
    }

    code = code.replace(match[0], pageCode);
  }
}

fs.writeFileSync('src/pages/RemainingPages.js', code);
console.log('Regex wrapper script ran!');
