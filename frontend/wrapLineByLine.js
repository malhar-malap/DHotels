const fs = require('fs');

let lines = fs.readFileSync('src/pages/RemainingPages.js', 'utf8').split(/\r?\n/);

let output = [];
let inPage = false;
let currentPage = '';

const pages = {
  'MyListingsPage': 'My Listings',
  'MyInquiriesPage': 'Inquiries',
  'MyJobsPage': 'My Jobs',
  'MyApplicationsPage': 'Applications',
  'ProfilePage': 'Account Settings'
};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes("import { Link } from 'react-router-dom';")) {
    output.push("import { Link } from 'react-router-dom';");
    output.push("import DashboardLayout from '../components/layout/DashboardLayout';");
    output.push("import { FaBriefcase } from 'react-icons/fa';"); // For the UI fix
    continue;
  }

  // Detect page start
  let match = line.match(/export const (MyListingsPage|MyInquiriesPage|MyJobsPage|MyApplicationsPage|ProfilePage) = \(\) => {/);
  if (match) {
    currentPage = match[1];
    output.push(line);
    continue;
  }

  if (currentPage) {
    // Check for `if (loading) return (`
    if (line.includes('if (loading) return (')) {
      output.push(line);
      output.push(`    <DashboardLayout activeTab="${pages[currentPage]}">`);
      continue;
    }
    
    // Check for main `return (`
    if (line.match(/^  return \($/)) {
      output.push(line);
      output.push(`    <DashboardLayout activeTab="${pages[currentPage]}">`);
      continue;
    }
    
    // Check for end of component
    if (line === '};') {
      // If we are ending a page component, we need to insert </DashboardLayout> BEFORE the last two divs
      // Wait, the structure is:
      //       </div>
      //     </div>
      //   );
      // };
      // Since we read line by line, the last three lines were `      </div>`, `    </div>`, `  );`
      // Let's pop `  );` and `    </div>` and `      </div>`? No, let's just insert before `  );`.
      // Actually, we can find `  );` in the last few lines.
      for (let j = output.length - 1; j >= 0; j--) {
        if (output[j].trim() === ');') {
          output.splice(j, 0, '    </DashboardLayout>');
          break;
        }
      }
      output.push(line);
      currentPage = '';
      continue;
    }

    // UI fixes for MyJobsPage "FULL TIME" avatar
    if (currentPage === 'MyJobsPage') {
      if (line.includes('<span className="w-1.5 h-1.5 rounded-full bg-ethereal-primary mr-2"></span> {job.employmentType}')) {
        output.push(line.replace('{job.employmentType}', '{job.employmentType?.replace(/_/g, " ")}'));
        continue;
      }
      if (line.includes('<span className="text-sm font-extrabold uppercase tracking-widest">{job.employmentType?.charAt(0) || \'J\'}</span>')) {
        output.push('                    <FaBriefcase size={24} />');
        continue;
      }
    }
  }

  output.push(line);
}

fs.writeFileSync('src/pages/RemainingPages.js', output.join('\n'));
console.log('Processed line by line successfully!');
