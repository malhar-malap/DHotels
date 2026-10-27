const fs = require('fs');

let code = fs.readFileSync('src/pages/RemainingPages.js', 'utf8');

// Wrap MyListingsPage Loading
code = code.replace(
  /  if \(loading\) return \(\n    <div className="min-h-screen bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10 flex items-center justify-center">\n      <div className="animate-pulse text-ethereal-primary font-medium">Loading your listings...<\/div>\n    <\/div>\n  \);/,
  '  if (loading) return (\n    <DashboardLayout activeTab="My Listings">\n      <div className="py-10 px-4 md:px-8 w-full flex items-center justify-center">\n        <div className="animate-pulse text-ethereal-primary font-medium">Loading your listings...</div>\n      </div>\n    </DashboardLayout>\n  );'
);

// Wrap MyListingsPage Content
code = code.replace(
  /  return \(\n    <div className="min-h-screen bg-\[radial-gradient\(ellipse_at_top_right,_var\(--tw-gradient-stops\)\)\] from-gray-900 via-gray-900 to-\[#d8572a\]\/10 py-10 px-4 md:px-8">\n      <div className="max-w-7xl mx-auto">/,
  '  return (\n    <DashboardLayout activeTab="My Listings">\n      <div className="py-10 px-4 md:px-8 w-full">\n      <div className="max-w-7xl mx-auto">'
);

// Close MyListingsPage properly
code = code.replace(
  '        )}\n      </div>\n    </div>\n  );\n};\n\n// MAPPED_MyInquiriesPage',
  '        )}\n      </div>\n    </div>\n    </DashboardLayout>\n  );\n};\n\n// MAPPED_MyInquiriesPage'
);

// Now address the 'F' avatar in MyJobsPage
code = code.replace(
  /<span className="text-sm font-extrabold uppercase tracking-widest">\{job\.employmentType\?\.charAt\(0\) \|\| 'J'\}<\/span>/g,
  '<span className="text-sm font-extrabold uppercase tracking-widest">{job.employmentType?.replace(/_/g, " ")}</span>'
);
// In MyJobsPage the avatar is 14x14 which is too small for full text, so I should change the container!
// Wait, replacing a small 14x14 h/w with full text will break layout. 
// Let's modify the regex to fix the container as well:
code = code.replace(
  /<div className="w-14 h-14 bg-ethereal-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-\[#d8572a\]\/20 mb-6 group-hover:scale-110 transition-transform duration-500">\n\s*<span className="text-sm font-extrabold uppercase tracking-widest">\{job\.employmentType\?\.charAt\(0\) \|\| 'J'\}<\/span>\n\s*<\/div>/g,
  '<div className="px-4 py-2 bg-ethereal-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#d8572a]/20 mb-6 group-hover:scale-110 transition-transform duration-500 w-fit">\n                    <span className="text-xs font-extrabold uppercase tracking-widest">{job.employmentType?.replace(/_/g, " ")}</span>\n                  </div>'
);


fs.writeFileSync('src/pages/RemainingPages.js', code);
console.log("Wrapped MyListingsPage successfully!");
