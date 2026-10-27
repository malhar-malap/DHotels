const fs = require('fs');
let app = fs.readFileSync('src/App.js', 'utf8');

app = app.replace("import TermsOfServicePage from './pages/home/TermsOfServicePage';", "");
app = app.replace("import PrivacyPolicyPage from './pages/home/PrivacyPolicyPage';", "import LegalCenterPage from './pages/legal/LegalCenterPage';");

app = app.replace(/<Route path="\/terms" element={<TermsOfServicePage \/>} \/>/g, '<Route path="/terms" element={<LegalCenterPage />} />');
app = app.replace(/<Route path="\/privacy" element={<PrivacyPolicyPage \/>} \/>/g, '<Route path="/privacy" element={<LegalCenterPage />} />\n          <Route path="/refund-policy" element={<LegalCenterPage />} />');

fs.writeFileSync('src/App.js', app);
console.log('Updated App.js');
