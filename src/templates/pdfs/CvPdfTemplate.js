const primaryColor = '#409cf0';
const darkColor = '#111111';
const mutedColor = '#444444';

/**
 * Genera una lista con viñetas para pdfmake.
 * @param {string[]} items Elementos de la lista.
 * @param {string} style Estilo aplicado a cada elemento.
 * @returns {object} Definición de lista para pdfmake.
 */
function createList(items, style) {
  return {
    ul: items.map((item) => ({ text: String(item ?? ''), style })),
    margin: [0, 0, 0, 8]
  };
}

/**
 * Genera el bloque visual de la fotografía del candidato.
 * @param {object} candidate Datos del candidato.
 * @returns {object} Imagen o marcador con la inicial del candidato.
 */
function createPhoto(candidate) {
  if (candidate.photoDataUri) {
    return {
      image: candidate.photoDataUri,
      width: 145,
      height: 145,
      fit: [145, 145],
      alignment: 'center',
      margin: [0, 0, 0, 18]
    };
  }

  return {
    table: {
      widths: [145],
      heights: [145],
      body: [[{
        text: String(candidate.name ?? 'C').trim().charAt(0).toUpperCase(),
        alignment: 'center',
        color: '#ffffff',
        fillColor: '#252525',
        fontSize: 72,
        bold: true,
        margin: [0, 28, 0, 0]
      }]]
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 18]
  };
}

/**
 * Construye los bloques de experiencia laboral.
 * @param {object[]} experience Experiencia profesional.
 * @returns {object[]} Contenido compatible con pdfmake.
 */
function createExperience(experience) {
  return experience.flatMap((item) => ([
    {
      text: String(item.position ?? ''),
      style: 'itemTitle',
      margin: [0, 0, 0, 3]
    },
    {
      text: [String(item.company ?? ''), item.company && item.period ? ' | ' : '', String(item.period ?? '')],
      style: 'period',
      margin: [0, 0, 0, 5]
    },
    {
      ul: (item.responsibilities ?? []).map((responsibility) => ({
        text: String(responsibility ?? ''),
        style: 'responsibility'
      })),
      margin: [0, 0, 0, 10]
    }
  ]));
}

/**
 * Construye los bloques de formación académica.
 * @param {object[]} education Estudios y certificaciones.
 * @returns {object[]} Contenido compatible con pdfmake.
 */
function createEducation(education) {
  return education.flatMap((item) => ([
    {
      text: String(item.title ?? ''),
      style: 'educationTitle',
      margin: [10, 0, 0, 1]
    },
    {
      text: [item.institution ? `${item.institution}\n` : '', String(item.period ?? '')],
      style: 'educationText',
      margin: [10, 0, 0, 7]
    }
  ]));
}

/**
 * Separa el apellido para resaltarlo con el color principal.
 * @param {string} name Nombre completo.
 * @returns {object[]} Fragmentos de texto para pdfmake.
 */
function createCandidateName(name) {
  const nameParts = String(name ?? '').trim().split(/\s+/);
  const highlightedName = nameParts.pop() ?? '';
  const firstNames = nameParts.join(' ');

  return [
    { text: firstNames ? `${firstNames} ` : '', color: darkColor },
    { text: highlightedName, color: primaryColor }
  ];
}

/**
 * Genera la definición A4 del CV para pdfmake.
 * @param {object} candidate Datos normalizados del candidato.
 * @returns {object} Definición de documento pdfmake.
 */
export function cvDefinition(candidate = {}) {
  const techStack = Array.isArray(candidate.techStack) ? candidate.techStack : [];
  const languages = Array.isArray(candidate.languages) ? candidate.languages : [];
  const experience = Array.isArray(candidate.experience) ? candidate.experience : [];
  const education = Array.isArray(candidate.education) ? candidate.education : [];

  return {
    pageSize: 'A4',
    pageMargins: [45, 55, 45, 38],
    background: (currentPage, pageSize) => {
      if (currentPage !== 1) {
        return [];
      }

      return {
        canvas: [
          {
            type: 'polyline',
            points: [
              { x: 0, y: 0 },
              { x: 405, y: 0 },
              { x: 230, y: 165 },
              { x: 0, y: 165 }
            ],
            closePath: true,
            color: primaryColor
          },
          {
            type: 'polyline',
            points: [
              { x: pageSize.width, y: pageSize.height - 125 },
              { x: pageSize.width, y: pageSize.height },
              { x: pageSize.width - 170, y: pageSize.height }
            ],
            closePath: true,
            color: '#82baf0'
          }
        ]
      };
    },
    content: [
      {
        columns: [
          {
            width: 170,
            stack: [
              createPhoto(candidate),
              {
                text: `•  ${String(candidate.location ?? 'Remote')}`,
                style: 'location',
                margin: [0, 0, 0, 18]
              },
              { text: 'HOURLY RATE', style: 'sidebarHeader' },
              {
                text: String(candidate.hourlyRate ?? 'Rate to be defined'),
                style: 'rate',
                margin: [0, 0, 0, 17]
              },
              { text: 'TECH STACK', style: 'sidebarHeader' },
              createList(techStack, 'sidebarItem'),
              { text: 'LANGUAGES', style: 'sidebarHeader', margin: [0, 8, 0, 6] },
              createList(languages, 'sidebarItem')
            ]
          },
          {
            width: '*',
            margin: [28, 45, 0, 0],
            stack: [
              {
                text: [
                  { text: 'Talent', color: '#071744', bold: true },
                  { text: 'quote', color: primaryColor }
                ],
                fontSize: 16,
                alignment: 'right',
                margin: [0, 0, 0, 14]
              },
              {
                text: String(candidate.role ?? 'Software Engineer').toUpperCase(),
                style: 'role',
                margin: [0, 0, 0, 7]
              },
              {
                text: createCandidateName(candidate.name),
                style: 'candidateName',
                margin: [0, 0, 0, 20]
              },
              { text: 'ABOUT', style: 'sectionHeader' },
              {
                text: String(candidate.about ?? ''),
                style: 'about',
                margin: [0, 0, 0, 14]
              },
              { text: 'WORK EXPERIENCE', style: 'sectionHeader' },
              ...createExperience(experience),
              { text: 'EDUCATION', style: 'sectionHeader', margin: [0, 2, 0, 7] },
              ...createEducation(education)
            ]
          }
        ],
        columnGap: 8
      }
    ],
    styles: {
      location: {
        fontSize: 10.5,
        color: darkColor,
        lineHeight: 1.2
      },
      sidebarHeader: {
        fontSize: 14,
        bold: true,
        color: primaryColor,
        margin: [0, 0, 0, 6]
      },
      rate: {
        fontSize: 20,
        bold: true,
        color: darkColor
      },
      sidebarItem: {
        fontSize: 10.5,
        color: darkColor,
        lineHeight: 1.15
      },
      role: {
        fontSize: 14,
        bold: true,
        color: mutedColor,
        alignment: 'center'
      },
      candidateName: {
        fontSize: 27,
        bold: true,
        alignment: 'center',
        lineHeight: 1
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        color: darkColor,
        margin: [0, 0, 0, 7]
      },
      about: {
        fontSize: 9.2,
        color: darkColor,
        lineHeight: 1.2
      },
      itemTitle: {
        fontSize: 13.5,
        bold: true,
        color: primaryColor
      },
      period: {
        fontSize: 10.5,
        color: darkColor
      },
      responsibility: {
        fontSize: 8.4,
        color: darkColor,
        lineHeight: 1.12
      },
      educationTitle: {
        fontSize: 11.5,
        bold: true,
        color: primaryColor
      },
      educationText: {
        fontSize: 8.8,
        color: darkColor,
        lineHeight: 1.1
      }
    },
    defaultStyle: {
      font: 'Roboto',
      color: darkColor
    }
  };
}
