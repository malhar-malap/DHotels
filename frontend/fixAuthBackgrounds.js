const fs = require('fs');

// Fix LoginPage
let login = fs.readFileSync('src/pages/auth/LoginPage.js', 'utf8');
login = login.replace(
  /<div className="min-h-full w-full flex overflow-hidden relative bg-\[#121212\]">[\s\S]*?<div className="absolute inset-0 bg-mesh opacity-20" \/>\s*<\/div>\s*<div className="md:hidden absolute inset-0 bg-gray-900\/90 z-10" \/>/,
  '<div className="min-h-full w-full flex overflow-hidden relative bg-transparent">'
);
fs.writeFileSync('src/pages/auth/LoginPage.js', login);

// Fix RegisterPage
let register = fs.readFileSync('src/pages/auth/RegisterPage.js', 'utf8');
register = register.replace(
  /<div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden bg-\[#121212\]">[\s\S]*?\{\/\* Background Layer \*\/\}[\s\S]*?<div className="absolute inset-0 z-0">[\s\S]*?<img src="\/images\/auth\/auth_bg\.png" alt="" className="w-full h-full object-cover opacity-20" \/>[\s\S]*?<div className="absolute inset-0 bg-gradient-to-br from-\[#121212\]\/90 via-\[#1a1a1a\]\/95 to-\[#121212\]\/90" \/>[\s\S]*?<div className="absolute inset-0 bg-mesh opacity-30" \/>[\s\S]*?<\/div>/,
  '<div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden bg-transparent">'
);
fs.writeFileSync('src/pages/auth/RegisterPage.js', register);

console.log('Auth backgrounds updated!');
