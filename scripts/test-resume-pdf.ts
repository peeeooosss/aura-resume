const pdfParse = require('pdf-parse-fork');
const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

async function main() {
  const pdfPath = path.join(__dirname, '..', 'Piyush Resume.pdf');
  const buffer = fs.readFileSync(pdfPath);

  console.log('=== STEP 1: Extract text from Piyush Resume.pdf ===');
  const result = await pdfParse(buffer);
  const rawText = result.text;
  console.log(`Extracted: ${rawText.length} chars`);
  console.log('Content:');
  console.log(rawText);
  console.log('');

  const cleaned = rawText
    .replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n').replace(/ {2,}/g, ' ').trim();
  console.log(`After cleaning: ${cleaned.length} chars`);

  console.log('\n=== STEP 2: Generate mock optimized resume PDF ===');
  const mockMarkdown = `# Piyush Bhuyan
piyushbhuyan001@gmail.com | linkedin.com/in/piyushbhuyan | github.com/piyushbhuyan

## SUMMARY
Data Science and AI undergraduate at IIT Patna with 2+ years of hands-on experience in Python, machine learning, and cybersecurity analytics. Built production-grade AI computer vision tools processing 10,000+ data points across rehabilitation and security domains. Proficient in PostgreSQL, Django, React.js, and SIEM management with a track record of delivering actionable intelligence reports to 15+ stakeholders.

## EXPERIENCE

### Cyber Security Analyst | Haryana Police | June 2024 – August 2024
- Conducted OSINT data gathering across 50+ digital sources, identifying 12 actionable threat leads for live cyber investigations
- Deployed custom steganography detection tools processing 500+ images, reducing forensic analysis time by 40%
- Delivered 8 technical presentations to internal teams, improving investigative workflow adoption by 60%
- Analyzed 25,000+ log entries using SIEM tools, detecting 3 previously undetected threat patterns

### Cyber Security Intern | Vault-Tec Security | May 2025 – August 2025
- Analyzed 100,000+ log records using Splunk and custom Python scripts, identifying 18 anomaly patterns
- Compiled 25 comprehensive security intelligence reports for C-suite stakeholders, reducing reporting turnaround by 35%
- Led 6 technical training sessions on Dark Web investigation techniques for 40+ attendees
- Built an automated threat correlation dashboard processing real-time data feeds, cutting manual analysis by 50%

### IT Trainer | Bhawani Marketing Pvt Ltd | January 2026 – Present
- Designed and delivered Python scripting curriculum to 30+ students, achieving 90% placement rate
- Mentored 15 students through interview preparation, resulting in 12 job placements within 3 months
- Developed 4 hands-on cybersecurity labs simulating real-world attack scenarios for practical learning
- Created automated grading system processing 200+ assignments, saving 10 hours of manual work weekly

## EDUCATION

### B.Tech Computer Science & Data Analytics | IIT Patna | 2023 – 2026
- GPA: 8.2/10 | Machine Learning, Data Mining, Computer Vision, Network Security

## SKILLS
Data & AI: Python, PostgreSQL, NoSQL, ML, Computer Vision, AI Development • Software: Django, Node.js, React.js, Git • Security: SIEM, Threat Intelligence, Malware Analysis, Network Security, OSINT • Tools: Splunk, Docker, Jupyter, OpenCV

## PROJECTS

### AI Rehab & Strength Training Pose Detection | Python, OpenCV, MediaPipe | January 2025 – March 2025
- Engineered real-time pose detection model processing 30 FPS video feeds, providing corrective feedback within 200ms
- Trained on 15,000+ annotated pose images across 25 exercises, achieving 94% accuracy in posture correction
- Deployed across 15-day and 30-day rehabilitation courses, improving user form scores by 45%
- Reduced injury risk by 35% compared to unguided exercise through automated form validation

### Steganography Detection Tool | Python, NumPy, PIL | March 2024 – May 2024
- Built automated steganography detection engine analyzing 1,000+ images using LSB and frequency analysis
- Achieved 92% detection rate across 3 steganography algorithms, processing files 60% faster than manual inspection
- Integrated into digital forensics workflow, helping identify hidden data in 5 active investigations
- Developed CLI with batch processing supporting 500+ files per run

### AI Pose Detection for Exercise Correction | Python, TensorFlow, React.js | August 2024 – October 2024
- Developed real-time pose estimation system processing 20+ key body points per frame at 25 FPS
- Created React.js dashboard visualizing 4 exercise types with real-time corrective overlay
- Reduced incorrect posture instances by 38% across 50 test users over a 4-week study
- Deployed as Progressive Web App supporting offline inference on 3 major browser platforms
`;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  // Parse markdown manually
  interface SubSection { header: string; lines: string[]; }
  interface Section { title: string; lines: string[]; subsections: SubSection[]; }
  const sections: Section[] = [];
  const lines = mockMarkdown.split('\n');
  let current: Section | null = null;
  let currentSub: SubSection | null = null;
  
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    
    if (t.startsWith('# ') && !t.startsWith('## ')) {
      current = { title: 'CONTACT', lines: [t.replace('# ', '')], subsections: [] };
      sections.push(current);
    } else if (t.startsWith('## ')) {
      const name = t.replace('## ', '').toUpperCase();
      current = { title: name, lines: [], subsections: [] };
      sections.push(current);
      currentSub = null;
    } else if (t.startsWith('### ')) {
      currentSub = { header: t.replace('### ', ''), lines: [] };
      if (current) current.subsections.push(currentSub);
    } else if (t.startsWith('- ') && currentSub) {
      currentSub.lines.push(t.replace('- ', ''));
    } else if (current) {
      current.lines.push(t.replace(/^\*\*|\*\*$/g, ''));
    }
  }
  
  console.log('Parsed sections:');
  for (const s of sections) {
    const subs = s.subsections.length;
    const bullets = s.subsections.reduce((sum, sub) => sum + sub.lines.length, 0) + s.lines.length;
    console.log(`  ## ${s.title}: ${subs} entries, ${bullets} lines`);
    for (const sub of s.subsections) {
      console.log(`    ### ${sub.header.slice(0, 50)}... (${sub.lines.length} bullets)`);
    }
  }

  // Render to PDF
  const marginLeft = 14;
  const marginRight = 196;
  const contentWidth = marginRight - marginLeft;
  let y = 20;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('ATS-Optimized Resume | Generated: ' + new Date().toLocaleString(), marginLeft, y);
  y += 12;
  
  for (const section of sections) {
    if (section.title === 'CONTACT') {
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(section.lines[0] || 'Piyush Bhuyan', marginLeft, y);
      y += 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      for (let i = 1; i < section.lines.length; i++) {
        doc.text(section.lines[i], marginLeft, y);
        y += 5;
      }
    } else if (section.title === 'SUMMARY') {
      y += 4;
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 138);
      doc.text('PROFESSIONAL SUMMARY', marginLeft, y); y += 1;
      doc.setDrawColor(30, 58, 138); doc.setLineWidth(0.3);
      doc.line(marginLeft, y, marginRight, y); y += 5;
      doc.setFontSize(9.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(51, 65, 85);
      const summaryLines = doc.splitTextToSize(section.lines.join(' '), contentWidth);
      doc.text(summaryLines, marginLeft, y);
      y += summaryLines.length * 5 + 6;
    } else if (['EXPERIENCE', 'EDUCATION', 'PROJECTS', 'CERTIFICATIONS'].includes(section.title)) {
      y += 2;
      const titles: Record<string, string> = { EXPERIENCE: 'PROFESSIONAL EXPERIENCE', EDUCATION: 'EDUCATION', PROJECTS: 'PROJECTS', CERTIFICATIONS: 'CERTIFICATIONS' };
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 138);
      doc.text(titles[section.title] || section.title, marginLeft, y); y += 1;
      doc.setDrawColor(30, 58, 138); doc.setLineWidth(0.3);
      doc.line(marginLeft, y, marginRight, y); y += 6;
      
      for (const sub of section.subsections) {
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 41, 59);
        const hLines = doc.splitTextToSize(sub.header, contentWidth);
        doc.text(hLines, marginLeft, y); y += hLines.length * 5 + 2;
        doc.setFontSize(9); doc.setFont('helvetica', 'normal');
        for (const bl of sub.lines) {
          doc.setTextColor(71, 85, 105);
          const b = '\u2022  ' + bl;
          const blines = doc.splitTextToSize(b, contentWidth - 4);
          doc.text(blines, marginLeft + 4, y);
          y += blines.length * 4.5 + 1;
        }
        y += 3;
      }
      if (section.subsections.length === 0 && section.lines.length > 0) {
        doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(51, 65, 85);
        for (const l of section.lines) {
          const blines = doc.splitTextToSize('\u2022  ' + l, contentWidth - 4);
          doc.text(blines, marginLeft + 3, y);
          y += blines.length * 4.5 + 1;
        }
      }
    } else if (section.title === 'SKILLS') {
      y += 2;
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 138);
      doc.text('SKILLS', marginLeft, y); y += 1;
      doc.setDrawColor(30, 58, 138); doc.setLineWidth(0.3);
      doc.line(marginLeft, y, marginRight, y); y += 5;
      doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(51, 65, 85);
      const skillsText = section.lines.join('  \u2022  ');
      const skillLines = doc.splitTextToSize(skillsText, contentWidth);
      doc.text(skillLines, marginLeft, y);
      y += skillLines.length * 5 + 4;
    }
    y += 4;
  }
  
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(180, 180, 180);
    doc.text('ATS-Optimized Resume | Generated by Aura Resume', 105, 293, { align: 'center' });
  }
  
  const outPath = path.join(__dirname, '..', 'Piyush-Optimized-Resume.pdf');
  doc.save(outPath);
  console.log(`\nPDF saved: Piyush-Optimized-Resume.pdf (${pages} pages)`);
  
  const stats = fs.statSync(outPath);
  console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log('\nOpen the PDF to verify all sections are present.');
}

main().catch(e => { console.error(e); process.exit(1); });