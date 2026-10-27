const fs = require('fs');
let code = fs.readFileSync('src/pages/RemainingPages.js', 'utf8');

// Fix 1: MyInquiriesPage
code = code.replace(
  /        \)}\n      <\/div>\n    <\/div>\n  \);\n};\n\n\/\/ Job Pages/,
  '        )}\n      </div>\n    </div>\n    </DashboardLayout>\n  );\n};\n\n// Job Pages'
);

// Fix 2: MyJobsPage
code = code.replace(
  /  return \(\n    <div className="min-h-screen bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10 py-12 px-4 md:px-8">\n      <div className="max-w-7xl mx-auto">/g,
  '  return (\n    <DashboardLayout activeTab="My Jobs">\n      <div className="py-10 px-4 md:px-8 w-full">\n      <div className="max-w-7xl mx-auto">'
);

// Fix 3: MyApplicationsPage
code = code.replace(
  /          <\/div>\n        <\/div>\n      <\/div>\n    <\/div>\n  \);\n};\n\n\/\/ Profile/,
  '          </div>\n        </div>\n      </div>\n    </div>\n    </DashboardLayout>\n  );\n};\n\n// Profile'
);

// Fix 4: ProfilePage
code = code.replace(
  /  return \(\n    <div className="min-h-screen bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10 py-20 px-4">\n      <div className="max-w-6xl mx-auto w-full">/g,
  '  return (\n    <DashboardLayout activeTab="Account Settings">\n      <div className="py-10 px-4 md:px-8 w-full">\n      <div className="max-w-6xl mx-auto w-full">'
);

fs.writeFileSync('src/pages/RemainingPages.js', code);
console.log("Patched successfully!");
