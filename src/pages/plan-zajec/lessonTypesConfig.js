import * as Icons from '@icons/icons';

/**
 * Konfiguracja wszystkich typów zajęć występujących w harmonogramie uczelni
 * wraz z dedykowanymi ikonkami Font Awesome, kolorystyką i opisami.
 */
export const LESSON_TYPES = [
  {
    id: 'wyklad',
    code: 'W',
    name: 'Wykład',
    aliases: ['wykład', 'wyklad'],
    icon: Icons.faBookOpen,
    iconName: 'faBookOpen',
    faClass: 'fa-solid fa-book-open',
    accentColor: '#2563EB',
    badgeBg: 'rgba(37, 99, 235, 0.12)',
    badgeBorder: 'rgba(37, 99, 235, 0.3)',
    description: 'Zajęcia o charakterze teoretycznym prowadzone przez wykładowcę dla całego rocznika lub połączonych grup.',
    sampleSubject: 'Programowanie obiektowe I (C++)',
    sampleTeacher: 'dr hab. inż. Robert Janczewski',
    sampleRoom: 'A1 • Sala Wykładowa',
    hoursInfo: 'Zwykle bloki 3–4 godzinne (wykłady audytoryjne lub on-line)'
  },
  {
    id: 'cwiczenia',
    code: 'Ćw',
    name: 'Ćwiczenia',
    aliases: ['ćwiczenia', 'cwiczenia', 'audytoryjne'],
    icon: Icons.faPenToSquare,
    iconName: 'faPenToSquare',
    faClass: 'fa-solid fa-pen-to-square',
    accentColor: '#059669',
    badgeBg: 'rgba(5, 150, 105, 0.12)',
    badgeBorder: 'rgba(5, 150, 105, 0.3)',
    description: 'Zajęcia audytoryjne w mniejszych grupach skupione na rozwiązywaniu zadań, obliczeniach, algorytmach i dyskusji.',
    sampleSubject: 'Matematyka dyskretna i logika',
    sampleTeacher: 'dr Wojciech Sosnowski',
    sampleRoom: 'Narutowicza • Sala 108',
    hoursInfo: 'Zwykle 2–3 godziny zegarowe w salach ćwiczeniowych'
  },
  {
    id: 'laboratorium',
    code: 'Lab',
    name: 'Laboratorium',
    aliases: ['laboratorium', 'laboratoryjne', 'ćwiczenia laboratoryjne', 'cwiczenia laboratoryjne'],
    icon: Icons.faFlask,
    iconName: 'faFlask',
    faClass: 'fa-solid fa-flask',
    accentColor: '#7C3AED',
    badgeBg: 'rgba(124, 58, 237, 0.12)',
    badgeBorder: 'rgba(124, 58, 237, 0.3)',
    description: 'Praktyczne ćwiczenia laboratoryjne ze specjalistycznym oprogramowaniem, sprzętem badawczym lub sieciowym.',
    sampleSubject: 'Inżynieria oprogramowania (Lab)',
    sampleTeacher: 'dr inż. Janusz Zalewski',
    sampleRoom: 'Kampus • Lab 202A',
    hoursInfo: 'Praca na indywidualnych stanowiskach komputerowych'
  },
  {
    id: 'warsztaty',
    code: 'Warsz',
    name: 'Warsztaty',
    aliases: ['warsztaty', 'zajęcia warsztatowe', 'zajecia warsztatowe'],
    icon: Icons.faWrench,
    iconName: 'faWrench',
    faClass: 'fa-solid fa-wrench',
    accentColor: '#D97706',
    badgeBg: 'rgba(217, 119, 6, 0.12)',
    badgeBorder: 'rgba(217, 119, 6, 0.3)',
    description: 'Zajęcia nastawione na praktyczne umiejętności, symulacje procesów, metodyki agile i pracę grupową.',
    sampleSubject: 'Warsztaty kompetencji inżynierskich',
    sampleTeacher: 'mgr inż. Przemysław Krawczyk',
    sampleRoom: 'Centrum Transferu Wiedzy • Sala 12',
    hoursInfo: 'Zajęcia blokowe o intensywnym charakterze warsztatowym'
  },
  {
    id: 'projekt',
    code: 'Proj',
    name: 'Projekt',
    aliases: ['projekt', 'zajęcia projektowe', 'zajecia projektowe'],
    icon: Icons.faDiagramProject,
    iconName: 'faDiagramProject',
    faClass: 'fa-solid fa-diagram-project',
    accentColor: '#0891B2',
    badgeBg: 'rgba(8, 145, 178, 0.12)',
    badgeBorder: 'rgba(8, 145, 178, 0.3)',
    description: 'Realizacja kompleksowego projektu zespołowego lub inżynierskiego, konsultacje architektoniczne i obrona etapów.',
    sampleSubject: 'Projekt systemów bazodanowych i chmurowych',
    sampleTeacher: 'dr inż. Zbigniew Pawlonka',
    sampleRoom: 'Pracownia Projektowa • Sala 204',
    hoursInfo: 'Konsultacje etapów i obrona projektów cząstkowych'
  },
  {
    id: 'seminarium',
    code: 'Sem',
    name: 'Seminarium',
    aliases: ['seminarium dyplomowe', 'seminarium'],
    icon: Icons.faGraduationCap,
    iconName: 'faGraduationCap',
    faClass: 'fa-solid fa-graduation-cap',
    accentColor: '#E11D48',
    badgeBg: 'rgba(225, 29, 72, 0.12)',
    badgeBorder: 'rgba(225, 29, 72, 0.3)',
    description: 'Zajęcia dyplomowe z promotorem: przygotowanie części badawczej i pisemnej pracy inżynierskiej / licencjackiej.',
    sampleSubject: 'Seminarium dyplomowe inżynierskie',
    sampleTeacher: 'dr hab. inż. Artur Popko',
    sampleRoom: 'Gabinet Promotora • Sala 301',
    hoursInfo: 'Prezentacja postępów prac dyplomowych i dyskusja'
  },
  {
    id: 'lektorat',
    code: 'Lekt',
    name: 'Lektorat',
    aliases: ['lektorat', 'język obcy', 'angielski', 'niemiecki'],
    icon: Icons.faGlobe,
    iconName: 'faGlobe',
    faClass: 'fa-solid fa-globe',
    accentColor: '#0284C7',
    badgeBg: 'rgba(2, 132, 199, 0.12)',
    badgeBorder: 'rgba(2, 132, 199, 0.3)',
    description: 'Nauka specjalistycznego języka technicznego, komunikacji biznesowej i przygotowanie do certyfikacji.',
    sampleSubject: 'Język angielski w technologiach IT',
    sampleTeacher: 'mgr Hanna Dworecka',
    sampleRoom: 'Pracownia Językowa • Sala 114',
    hoursInfo: 'Podział na grupy zaawansowania (B2/C1 Technical)'
  },
  {
    id: 'wf',
    code: 'WF',
    name: 'WF',
    aliases: ['wf', 'wychowanie fizyczne', 'sport', 'hala'],
    icon: Icons.faDumbbell,
    iconName: 'faDumbbell',
    faClass: 'fa-solid fa-dumbbell',
    accentColor: '#65A30D',
    badgeBg: 'rgba(101, 163, 13, 0.12)',
    badgeBorder: 'rgba(101, 163, 13, 0.3)',
    description: 'Aktywność sportowa, zajęcia ogólnorozwojowe, gry zespołowe i rekreacja ruchowa.',
    sampleSubject: 'Wychowanie fizyczne (sporty zespołowe)',
    sampleTeacher: 'Trener mgr Janusz Wiśniewski',
    sampleRoom: 'Hala Sportowa PANS • Sektor B',
    hoursInfo: 'Obiekty sportowe i siłownia uczelniana'
  }
];

/**
 * Zwraca konfigurację typu zajęć na podstawie typu, formy zajęć, grupy lub nazwy przedmiotu
 */
export const getLessonTypeConfig = (typeStr = '', subjectStr = '', groupStr = '') => {
  const normType = (typeStr || '').toLowerCase().trim();
  const normSub = (subjectStr || '').toLowerCase().trim();
  const normGroup = (groupStr || '').toLowerCase().trim();
  const combined = `${normType} ${normGroup} ${normSub}`;

  const getType = (id) => LESSON_TYPES.find(t => t.id === id) || LESSON_TYPES[0];

  // 1. Laboratoria / ćwiczenia laboratoryjne (sprawdzane przed zwykłymi ćwiczeniami)
  if (
    normType === 'lab' || normType === 'l' ||
    combined.includes('laborator') ||
    combined.includes('ćwiczenia lab') ||
    combined.includes('cwiczenia lab') ||
    /\b(lab|laby|laboratorium|laboratoria)\b/i.test(combined)
  ) {
    return getType('laboratorium');
  }

  // 2. Projekty
  if (
    normType === 'proj' || normType === 'p' ||
    combined.includes('projekt') ||
    /\b(proj|projekt|projekty)\b/i.test(combined)
  ) {
    return getType('projekt');
  }

  // 3. Warsztaty
  if (combined.includes('warsztat')) {
    return getType('warsztaty');
  }

  // 4. Seminaria
  if (combined.includes('seminar')) {
    return getType('seminarium');
  }

  // 5. WF
  if (
    normType === 'wf' ||
    combined.includes('wychowanie fizycz') ||
    /\bwf\b/i.test(combined)
  ) {
    return getType('wf');
  }

  // 6. Lektorat
  if (
    normType === 'lekt' ||
    combined.includes('lektorat') ||
    combined.includes('język obcy') ||
    combined.includes('jezyk obcy')
  ) {
    return getType('lektorat');
  }

  // 7. Ćwiczenia audytoryjne / tablicowe
  if (
    normType === 'ćw' || normType === 'cw' || normType === 'c' ||
    combined.includes('ćwicz') ||
    combined.includes('cwicz') ||
    /\b(ćw|cw|ćwiczenia|cwiczenia)\b/i.test(combined) ||
    normGroup.includes('ćwicz') ||
    normGroup.includes('cwicz')
  ) {
    return getType('cwiczenia');
  }

  // 8. Wykład
  if (
    normType === 'w' || normType.startsWith('wyk') ||
    combined.includes('wykład') ||
    combined.includes('wyklad') ||
    /\b(wykład|wyklad|wykłady|wyklady)\b/i.test(combined)
  ) {
    return getType('wyklad');
  }

  // 9. Bezpieczny fallback: jeśli w nazwie grupy jest podgrupa 'gr'/'cw' -> ćwiczenia
  if (normGroup.includes('gr') || normGroup.includes('ćw') || normGroup.includes('cw') || /\b(gr|grupa)\b/i.test(normGroup)) {
    return getType('cwiczenia');
  }

  return getType('wyklad');
};

/**
 * Sprawdza, czy dane zajęcia to wykład (ogólny lub kierunkowy)
 */
export const isLectureLesson = (lesson) => {
  if (!lesson) return false;
  const config = getLessonTypeConfig(
    lesson.typPrzedmiotu || lesson.formaZajec || '',
    lesson.przedmiot || '',
    lesson.grupa || ''
  );
  return config.id === 'wyklad';
};

/**
 * Sprawdza, czy dane zajęcia to ćwiczenia, laboratoria, warsztaty, projekty itp.
 */
export const isExerciseOrLabLesson = (lesson) => {
  return !isLectureLesson(lesson);
};

