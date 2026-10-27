const fs = require('fs');

let code = fs.readFileSync('src/pages/RemainingPages.js', 'utf8');

// Ensure import DashboardLayout
if (!code.includes('DashboardLayout')) {
  code = code.replace(
    "import { Link, useNavigate } from 'react-router-dom';",
    "import { Link, useNavigate } from 'react-router-dom';\nimport DashboardLayout from '../components/layout/DashboardLayout';"
  );
}

// 1. Wrap MyInquiriesPage
code = code.replace(
  'export const MyInquiriesPage = () => {',
  '// MAPPED_MyInquiriesPage\nexport const MyInquiriesPage = () => {'
);
code = code.replace(
  /  return \(\n    <div className="min-h-screen bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10 py-12 px-4 md:px-8">\n      <div className="max-w-6xl mx-auto">/,
  '  return (\n    <DashboardLayout activeTab="Inquiries">\n    <div className="py-10 px-4 md:px-8 w-full">\n      <div className="max-w-6xl mx-auto">'
);
// The end of MyInquiriesPage is before "// Job Pages"
code = code.replace(
  '        )}\n      </div>\n    </div>\n  );\n};\n\n// Job Pages',
  '        )}\n      </div>\n    </div>\n    </DashboardLayout>\n  );\n};\n\n// Job Pages'
);

// 2. Wrap MyJobsPage
code = code.replace(
  /  if \(loading\) return \(\n    <div className="min-h-screen flex items-center justify-center bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10">\n      <div className="animate-spin h-10 w-10 border-4 border-ethereal-primary border-t-transparent rounded-full"><\/div>\n    <\/div>\n  \);/,
  '  if (loading) return (\n    <DashboardLayout activeTab="My Jobs">\n      <div className="py-10 px-4 md:px-8 w-full">\n        <div className="animate-spin h-10 w-10 border-4 border-ethereal-primary border-t-transparent rounded-full"></div>\n      </div>\n    </DashboardLayout>\n  );'
);

code = code.replace(
  /  return \(\n    <div className="min-h-screen bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10 py-12 px-4 md:px-8">\n      <div className="max-w-7xl mx-auto">/,
  '  return (\n    <DashboardLayout activeTab="My Jobs">\n    <div className="py-10 px-4 md:px-8 w-full">\n      <div className="max-w-7xl mx-auto">'
);
// End of MyJobsPage
code = code.replace(
  '        )}\n      </div>\n    </div>\n  );\n};\n\nexport const MyApplicationsPage',
  '        )}\n      </div>\n    </div>\n    </DashboardLayout>\n  );\n};\n\nexport const MyApplicationsPage'
);

// 3. Wrap MyApplicationsPage
code = code.replace(
  /  return \(\n    <div className="min-h-screen bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10 py-12 px-4 md:px-8">\n      <div className="max-w-7xl mx-auto">/g,
  '  return (\n    <DashboardLayout activeTab="Applications">\n    <div className="py-10 px-4 md:px-8 w-full">\n      <div className="max-w-7xl mx-auto">'
);
// End of MyApplicationsPage
code = code.replace(
  '          </div>\n        </div>\n      </div>\n    </div>\n  );\n};\n\n// Profile',
  '          </div>\n        </div>\n      </div>\n    </div>\n    </DashboardLayout>\n  );\n};\n\n// Profile'
);

// 4. Wrap ProfilePage
code = code.replace(
  /  if \(loading\) return \(\n    <div className="min-h-screen flex items-center justify-center bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10">\n      <div className="animate-pulse text-ethereal-primary font-medium text-lg">Loading profile...<\/div>\n    <\/div>\n  \);/,
  '  if (loading) return (\n    <DashboardLayout activeTab="Account Settings">\n      <div className="py-10 px-4 md:px-8 w-full">\n        <div className="animate-pulse text-ethereal-primary font-medium text-lg">Loading profile...</div>\n      </div>\n    </DashboardLayout>\n  );'
);
code = code.replace(
  /  return \(\n    <div className="min-h-screen bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10 py-20 px-4">\n      <div className="max-w-6xl mx-auto w-full">/,
  '  return (\n    <DashboardLayout activeTab="Account Settings">\n    <div className="py-10 px-4 md:px-8 w-full">\n      <div className="max-w-6xl mx-auto w-full">'
);
// End of ProfilePage
code = code.replace(
  '        </div>\n      </div>\n    </div>\n  );\n};\n\n// Admin Pages',
  '        </div>\n      </div>\n    </div>\n    </DashboardLayout>\n  );\n};\n\n// Admin Pages'
);


fs.writeFileSync('src/pages/RemainingPages.js', code);
console.log("Wrapping successful!");
