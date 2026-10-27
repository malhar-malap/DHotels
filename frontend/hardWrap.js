const fs = require('fs');
let code = fs.readFileSync('src/pages/RemainingPages.js', 'utf8');

// Undo bad wrappers first
code = code.replace(/<DashboardLayout activeTab="[^"]+">\s*<DashboardLayout activeTab="[^"]+">/g, '<DashboardLayout activeTab="My Listings">');

// Now, let's just use string replace for each page specifically.
// We will restore the file to the 0facec4 version to be 100% clean, and then wrap.
