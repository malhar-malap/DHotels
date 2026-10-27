const fs = require('fs');

let code = fs.readFileSync('src/pages/RemainingPages.js', 'utf8');

// Ensure import DashboardLayout
if (!code.includes('DashboardLayout')) {
  code = code.replace(
    "import { Link } from 'react-router-dom';",
    "import { Link } from 'react-router-dom';\nimport DashboardLayout from '../components/layout/DashboardLayout';"
  );
}

// Map of page component to activeTab
const pages = {
  'MyListingsPage': 'My Listings',
  'MyInquiriesPage': 'Inquiries',
  'MyJobsPage': 'My Jobs',
  'MyApplicationsPage': 'Applications',
  'ProfilePage': 'Account Settings'
};

for (const [page, tab] of Object.entries(pages)) {
  // Find the exact block for the page
  const regexStr = `export const ${page} = \\(\\) => \\{[\\s\\S]*?\\n\\};`;
  const regex = new RegExp(regexStr);
  const match = code.match(regex);
  if (match) {
    let pageCode = match[0];

    // If it's already wrapped, skip
    if (pageCode.includes('<DashboardLayout')) continue;

    // Replace the main return
    pageCode = pageCode.replace(
      /return \(\s*<div className="min-h-screen[^"]*">\s*(<div className="max-w-[^"]+ mx-auto[^"]*">)/,
      `return (\n    <DashboardLayout activeTab="${tab}">\n      <div className="py-10 px-4 md:px-8 w-full">\n      $1`
    );

    // Replace the loading return
    pageCode = pageCode.replace(
      /if \(loading\) return \(\s*<div className="min-h-screen[^"]*">\s*(<div className="animate-[^"]+[^>]+>.*<\/div>)\s*<\/div>\s*\);/,
      `if (loading) return (\n    <DashboardLayout activeTab="${tab}">\n      <div className="py-10 px-4 md:px-8 w-full flex items-center justify-center">\n      $1\n      </div>\n    </DashboardLayout>\n  );`
    );

    // Replace the closing tags at the very end of the component
    // The component ends with:
    //       </div>
    //     </div>
    //   );
    // };
    pageCode = pageCode.replace(
      /      <\/div>\n    <\/div>\n  \);\n\};$/,
      '      </div>\n    </div>\n    </DashboardLayout>\n  );\n};'
    );

    code = code.replace(match[0], pageCode);
  }
}

fs.writeFileSync('src/pages/RemainingPages.js', code);
console.log('Wrappers injected successfully.');
