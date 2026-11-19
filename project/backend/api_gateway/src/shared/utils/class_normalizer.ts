/**
 * Shared Class & Stream Normalizer Utility for Backend API Gateway
 */

export interface ClassKeyInfo {
  isHigherEd: boolean;
  stdNum: string;
  section: string;
  stream: string;
  semester: string;
  normalizedKey: string;
  displayLabel: string;
}

export const isHigherEdCourse = (raw: string): boolean => {
  if (!raw) return false;
  const s = raw.toLowerCase();
  return (
    s.includes('diploma') ||
    s.includes('iti') ||
    s.includes('undergrad') ||
    s.includes('postgrad') ||
    s.includes('btech') ||
    s.includes('b.tech') ||
    s.includes('bca') ||
    s.includes('mca') ||
    s.includes('b.sc') ||
    s.includes('bsc') ||
    s.includes('bcom') ||
    s.includes('b.com') ||
    s.includes('bba') ||
    s.includes('mba') ||
    s.includes('mbbs') ||
    s.includes('doctoral') ||
    s.includes('semester') ||
    s.includes('sem_') ||
    s.includes('sem-')
  );
};

export const parseClassKeyInfo = (rawClass: string): ClassKeyInfo => {
  if (!rawClass) {
    return {
      isHigherEd: false,
      stdNum: '10',
      section: 'A',
      stream: 'General',
      semester: '',
      normalizedKey: 'CLASS-10-A',
      displayLabel: 'Class 10-A'
    };
  }

  const isHigherEd = isHigherEdCourse(rawClass);
  const upper = rawClass.toUpperCase();

  const numMatch = rawClass.match(/\d+/);
  const stdNum = numMatch ? numMatch[0] : '';

  let section = 'A';
  const secExplicit = upper.match(/SEC_([A-Z])(?:_|$)/) || upper.match(/SEC[-_\s]*([A-Z])\b/i);
  if (secExplicit) {
    section = secExplicit[1].toUpperCase();
  } else {
    const secFallback = rawClass.match(/(?:[-_\s]|CLASS)?(?:\d+)?(?:[A-Z\s]+)?[-_\s]*([A-Z])(?:$|[-_\s])/i);
    if (secFallback && !['SCIENCE', 'COMMERCE', 'ARTS', 'CLASS', 'GROUP', 'PCB', 'PCM'].includes(secFallback[1].toUpperCase())) {
      section = secFallback[1].toUpperCase();
    }
  }

  let stream = 'General';
  if (upper.includes('COMMERCE')) {
    stream = 'Commerce';
  } else if (upper.includes('ARTS') || upper.includes('HUMANITIES')) {
    stream = 'Arts';
  } else if (upper.includes('PCB') || upper.includes('GROUP B') || upper.includes('GROUP_B') || upper.includes('BIOLOGY')) {
    stream = 'Science (PCB)';
  } else if (upper.includes('PCM') || upper.includes('GROUP A') || upper.includes('GROUP_A') || upper.includes('MATHS') || upper.includes('SCIENCE')) {
    stream = 'Science (PCM)';
  }

  let semester = '';
  if (isHigherEd) {
    const semMatch = upper.match(/SEM(?:ESTER)?[-_\s]*(\d+)/i) || upper.match(/S(\d+)/i);
    semester = semMatch ? `Semester ${semMatch[1]}` : (stdNum ? `Semester ${stdNum}` : 'Semester 1');
  }

  let normalizedKey = '';
  let displayLabel = '';

  if (isHigherEd) {
    const semDigit = semester.match(/\d+/)?.[0] || '1';
    normalizedKey = `SEM-${semDigit}`;
    displayLabel = `${rawClass.includes('Diploma') ? 'Diploma' : 'College'} • Semester ${semDigit}`;
  } else if (stdNum === '11' || stdNum === '12') {
    let streamCode = 'GEN';
    if (stream === 'Commerce') streamCode = 'COMMERCE';
    else if (stream === 'Arts') streamCode = 'ARTS';
    else if (stream === 'Science (PCB)') streamCode = 'SCI_B';
    else if (stream === 'Science (PCM)') streamCode = 'SCI_A';

    normalizedKey = `CLASS-${stdNum}-${streamCode}-${section}`;

    let streamBadge = '';
    if (stream === 'Commerce') streamBadge = 'Commerce';
    else if (stream === 'Arts') streamBadge = 'Arts';
    else if (stream === 'Science (PCB)') streamBadge = 'Science (Group B)';
    else if (stream === 'Science (PCM)') streamBadge = 'Science (Group A)';

    displayLabel = `Class ${stdNum} ${streamBadge ? `${streamBadge} ` : ''}- ${section}`;
  } else {
    normalizedKey = `CLASS-${stdNum || '10'}-${section}`;
    displayLabel = `Class ${stdNum || '10'}-${section}`;
  }

  return {
    isHigherEd,
    stdNum: stdNum || '10',
    section,
    stream,
    semester,
    normalizedKey,
    displayLabel
  };
};
