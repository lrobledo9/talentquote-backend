const defaultCandidate = {
  name: 'Steven Pantoja',
  role: 'Senior React Developer',
  location: 'Miami, FL. Remote-first',
  hourlyRate: '$150 USD / hr',
  photo: '',
  about: 'Senior React developer with more than 10 years of experience building high-performance web applications for startups and Fortune 500 companies. Specialized in TypeScript, the React ecosystem, and modern front-end architecture.',
  techStack: [
    'React.js',
    'TypeScript',
    'Next.js',
    'Node.js',
    'GraphQL',
    'AWS',
    'Redux',
    'CSS-in-JS',
    'Frontend Architecture',
    'Design Systems',
    'Technical Leadership'
  ],
  languages: ['Spanish - Native', 'English - Advanced', 'Portuguese - Conversational'],
  experience: [
    {
      position: 'Lead Frontend Engineer',
      company: 'Stripe',
      period: 'January 2021 - Present',
      responsibilities: [
        'Led a team of 6 engineers developing the Merchant Dashboard.',
        'Designed a design system used by more than 12 product teams.',
        'Reduced UI development time by 40%.',
        'Implemented best practices for scalability and code maintenance.'
      ]
    },
    {
      position: 'Senior React Developer',
      company: 'Shopify',
      period: 'March 2019 - December 2020',
      responsibilities: [
        'Developed extensions for the Polaris component library.',
        'Contributed to the checkout administration workflow.',
        'Improved Time-to-Interactive by 35%.',
        'Implemented code splitting and lazy loading strategies.'
      ]
    }
  ],
  education: [
    {
      title: 'Systems Engineering',
      institution: '',
      period: '2010 - 2015'
    },
    {
      title: 'AWS Certified Developer',
      institution: 'Amazon Web Services',
      period: '2023'
    }
  ]
};

/**
 * Escapa texto recibido para insertarlo de forma segura en HTML.
 * @param {unknown} value Valor que se insertará en la plantilla.
 * @returns {string} Texto escapado.
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Mezcla los datos recibidos con los valores predeterminados del CV.
 * @param {object} candidate Datos enviados por el cliente.
 * @returns {object} Datos normalizados del candidato.
 */
function normalizeCandidate(candidate = {}) {
  return {
    ...defaultCandidate,
    ...candidate,
    techStack: Array.isArray(candidate.techStack) ? candidate.techStack : defaultCandidate.techStack,
    languages: Array.isArray(candidate.languages) ? candidate.languages : defaultCandidate.languages,
    experience: Array.isArray(candidate.experience) ? candidate.experience : defaultCandidate.experience,
    education: Array.isArray(candidate.education) ? candidate.education : defaultCandidate.education
  };
}

/**
 * Convierte una lista de textos en elementos HTML.
 * @param {unknown[]} items Elementos que se mostrarán.
 * @returns {string} Lista HTML.
 */
function renderList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
}

/**
 * Construye las tarjetas de experiencia laboral.
 * @param {object[]} experience Lista de experiencias.
 * @returns {string} Bloques HTML de experiencia.
 */
function renderExperience(experience) {
  return experience.map((item) => `
    <article class="experience">
      <h3>${escapeHtml(item.position)}</h3>
      <p class="period">${escapeHtml(item.company)}${item.company && item.period ? ' | ' : ''}${escapeHtml(item.period)}</p>
      <ul>${renderList(Array.isArray(item.responsibilities) ? item.responsibilities : [])}</ul>
    </article>
  `).join('');
}

/**
 * Construye los registros académicos y certificaciones.
 * @param {object[]} education Lista de estudios.
 * @returns {string} Bloques HTML de formación.
 */
function renderEducation(education) {
  return education.map((item) => `
    <article class="education">
      <h3>${escapeHtml(item.title)}</h3>
      ${item.institution ? `<p>${escapeHtml(item.institution)}</p>` : ''}
      <p>${escapeHtml(item.period)}</p>
    </article>
  `).join('');
}

/**
 * Resalta la última palabra del nombre con el color principal.
 * @param {string} name Nombre completo del candidato.
 * @returns {string} Nombre formateado en HTML.
 */
function renderCandidateName(name) {
  const nameParts = String(name ?? '').trim().split(/\s+/);
  const highlightedName = nameParts.pop() ?? '';
  const firstNames = nameParts.join(' ');

  return `${escapeHtml(firstNames)}${firstNames ? ' ' : ''}<span>${escapeHtml(highlightedName)}</span>`;
}

/**
 * Genera el HTML completo usado para crear el PDF del candidato.
 * @param {object} candidate Datos del candidato.
 * @returns {string} Documento HTML del CV.
 */
export function cvDefinition(candidate = {}) {
  const data = normalizeCandidate(candidate);
  const photo = data.photo
    ? `<img src="${escapeHtml(data.photo)}" alt="Foto de ${escapeHtml(data.name)}">`
    : `<div class="photoPlaceholder">${escapeHtml(data.name).slice(0, 1)}</div>`;

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <style>
        @page { size: A4; margin: 0; }
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; }
        body {
          color: #111111;
          font-family: Arial, Helvetica, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page {
          background: #ffffff;
          min-height: 297mm;
          overflow: hidden;
          padding: 20mm 17mm 16mm;
          position: relative;
          width: 210mm;
        }
        .topShape {
          background: #409cf0;
          clip-path: polygon(0 0, 100% 0, 57% 100%, 0 100%);
          height: 57mm;
          left: 0;
          position: absolute;
          top: 0;
          width: 142mm;
        }
        .bottomShape {
          background: #82baf0;
          bottom: 0;
          clip-path: polygon(100% 0, 100% 100%, 0 100%);
          height: 43mm;
          position: absolute;
          right: 0;
          width: 60mm;
        }
        .layout {
          display: grid;
          gap: 17mm;
          grid-template-columns: 61mm 1fr;
          position: relative;
          z-index: 1;
        }
        .sidebar { padding-top: 1mm; }
        .photo {
          background: #252525;
          height: 52mm;
          margin: 0 auto 9mm;
          overflow: hidden;
          width: 52mm;
        }
        .photo img {
          height: 100%;
          object-fit: cover;
          width: 100%;
        }
        .photoPlaceholder {
          align-items: center;
          color: #ffffff;
          display: flex;
          font-size: 34mm;
          font-weight: bold;
          height: 100%;
          justify-content: center;
        }
        .location {
          font-size: 11pt;
          line-height: 1.35;
          margin: 0 0 8mm;
        }
        .location::before {
          color: #409cf0;
          content: '⌖';
          font-size: 18pt;
          margin-right: 3mm;
          vertical-align: -1px;
        }
        .sidebarSection { margin-bottom: 7mm; }
        .sidebarSection h2, .mainSection h2 {
          font-size: 14pt;
          line-height: 1;
          margin: 0 0 3mm;
          text-transform: uppercase;
        }
        .sidebarSection h2 { color: #409cf0; }
        .rate {
          font-size: 22pt;
          font-weight: 800;
          margin: 0;
        }
        ul {
          margin: 0;
          padding-left: 5mm;
        }
        .sidebarSection li {
          font-size: 11pt;
          line-height: 1.35;
          margin-bottom: 0.7mm;
        }
        .main { padding-top: 17mm; }
        .brand {
          align-items: center;
          display: flex;
          font-size: 15pt;
          font-weight: bold;
          justify-content: flex-end;
          margin-bottom: 5mm;
        }
        .brandMark {
          border: 3mm solid #409cf0;
          border-left-color: #071744;
          height: 9mm;
          margin-right: 3mm;
          transform: rotate(30deg);
          width: 9mm;
        }
        .brand span { color: #409cf0; font-weight: normal; }
        .role {
          color: #444444;
          font-size: 15pt;
          font-weight: 800;
          margin: 0 0 3mm;
          text-align: center;
          text-transform: uppercase;
        }
        .name {
          font-size: 28pt;
          line-height: 1;
          margin: 0 0 10mm;
          text-align: center;
        }
        .name span { color: #409cf0; }
        .mainSection { margin-bottom: 6mm; }
        .mainSection > p {
          font-size: 9.5pt;
          line-height: 1.35;
          margin: 0;
        }
        .experience { margin-bottom: 5mm; }
        .experience h3, .education h3 {
          color: #409cf0;
          font-size: 14pt;
          line-height: 1.1;
          margin: 0 0 2mm;
        }
        .period {
          font-size: 11pt !important;
          margin-bottom: 3mm !important;
        }
        .experience li {
          font-size: 8.8pt;
          line-height: 1.25;
          margin-bottom: 0.8mm;
        }
        .education { margin: 0 0 4mm 4mm; }
        .education h3 { font-size: 12.5pt; margin-bottom: 1mm; }
        .education p {
          font-size: 9pt;
          line-height: 1.3;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <main class="page">
        <div class="topShape"></div>
        <div class="bottomShape"></div>
        <div class="layout">
          <aside class="sidebar">
            <div class="photo">${photo}</div>
            <p class="location">${escapeHtml(data.location)}</p>
            <section class="sidebarSection">
              <h2>Hourly rate</h2>
              <p class="rate">${escapeHtml(data.hourlyRate)}</p>
            </section>
            <section class="sidebarSection">
              <h2>Tech stack</h2>
              <ul>${renderList(data.techStack)}</ul>
            </section>
            <section class="sidebarSection">
              <h2>Languages</h2>
              <ul>${renderList(data.languages)}</ul>
            </section>
          </aside>
          <section class="main">
            <div class="brand"><i class="brandMark"></i>Talent<span>quote</span></div>
            <p class="role">${escapeHtml(data.role)}</p>
            <h1 class="name">${renderCandidateName(data.name)}</h1>
            <section class="mainSection">
              <h2>About</h2>
              <p>${escapeHtml(data.about)}</p>
            </section>
            <section class="mainSection">
              <h2>Work experience</h2>
              ${renderExperience(data.experience)}
            </section>
            <section class="mainSection">
              <h2>Education</h2>
              ${renderEducation(data.education)}
            </section>
          </section>
        </div>
      </main>
    </body>
  </html>`;
}
