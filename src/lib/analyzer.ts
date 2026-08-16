export interface AnalysisResult {
  overallScore: number;
  metrics: AnalysisMetric[];
  suggestions: string[];
}

export interface AnalysisMetric {
  name: string;
  score: number; // 0-100
  label: 'Excellent' | 'Good' | 'Fair' | 'Needs Work';
  feedback: string;
  details?: string[];
}

export function analyzeScript(plainText: string): AnalysisResult {
  if (!plainText || plainText.trim() === '') {
    return {
      overallScore: 0,
      metrics: [],
      suggestions: ['Write some content to get an analysis.']
    };
  }

  const sentences: string[] = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
  const words: string[] = plainText.match(/\b\w+\b/g) || [];
  const paragraphs: string[] = plainText.split(/\n+/).filter(p => p.trim().length > 0);

  const metrics: AnalysisMetric[] = [];
  let totalWeightedScore = 0;
  const suggestions: string[] = [];

  // 1. Hook Strength (20%)
  const hookMetric = analyzeHook(sentences);
  metrics.push(hookMetric);
  totalWeightedScore += hookMetric.score * 0.20;
  if (hookMetric.score < 80) suggestions.push(hookMetric.feedback);

  // 2. Readability (15%)
  const readMetric = analyzeReadability(sentences, words);
  metrics.push(readMetric);
  totalWeightedScore += readMetric.score * 0.15;
  if (readMetric.score < 80) suggestions.push(readMetric.feedback);

  // 3. Pacing (15%)
  const pacingMetric = analyzePacing(sentences, paragraphs);
  metrics.push(pacingMetric);
  totalWeightedScore += pacingMetric.score * 0.15;
  if (pacingMetric.score < 80) suggestions.push(pacingMetric.feedback);

  // 4. Clarity (15%)
  const clarityMetric = analyzeClarity(plainText, words);
  metrics.push(clarityMetric);
  totalWeightedScore += clarityMetric.score * 0.15;
  if (clarityMetric.score < 80) suggestions.push(clarityMetric.feedback);

  // 5. Repetition (10%)
  const repetitionMetric = analyzeRepetition(words);
  metrics.push(repetitionMetric);
  totalWeightedScore += repetitionMetric.score * 0.10;
  if (repetitionMetric.score < 80) suggestions.push(repetitionMetric.feedback);

  // 6. Structure (10%)
  const structureMetric = analyzeStructure(plainText, paragraphs);
  metrics.push(structureMetric);
  totalWeightedScore += structureMetric.score * 0.10;
  if (structureMetric.score < 80) suggestions.push(structureMetric.feedback);

  // 7. CTA Strength (10%)
  const ctaMetric = analyzeCTA(sentences);
  metrics.push(ctaMetric);
  totalWeightedScore += ctaMetric.score * 0.10;
  if (ctaMetric.score < 80) suggestions.push(ctaMetric.feedback);

  // 8. Engagement (5%)
  const engagementMetric = analyzeEngagement(sentences, words);
  metrics.push(engagementMetric);
  totalWeightedScore += engagementMetric.score * 0.05;
  if (engagementMetric.score < 80) suggestions.push(engagementMetric.feedback);

  const overallScore = Math.round(totalWeightedScore);

  return {
    overallScore,
    metrics,
    suggestions: suggestions.slice(0, 5) // Top 5 actionable suggestions
  };
}

function getLabel(score: number): 'Excellent' | 'Good' | 'Fair' | 'Needs Work' {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Needs Work';
}

function analyzeHook(sentences: string[]): AnalysisMetric {
  if (sentences.length === 0) return { name: 'Hook Strength', score: 0, label: 'Needs Work', feedback: 'No sentences found.' };
  
  const firstTwo = sentences.slice(0, 2).join(' ').toLowerCase();
  const firstTwoWords = firstTwo.split(/\s+/).length;
  
  let score = 50; // base score
  const details: string[] = [];
  
  if (firstTwo.includes('?')) { score += 20; details.push('Starts with a question'); }
  if (/\d/.test(firstTwo)) { score += 10; details.push('Uses numbers/statistics'); }
  if (/\b(you|your|imagine|picture)\b/.test(firstTwo)) { score += 20; details.push('Directly addresses the audience'); }
  if (/\b(i was|when i|have you ever)\b/.test(firstTwo)) { score += 15; details.push('Uses a story opener'); }
  
  if (firstTwoWords > 40) { score -= 20; details.push('Introduction is too long'); }
  if (firstTwoWords < 15) { score += 10; details.push('Punchy, short opening'); }

  score = Math.min(Math.max(score, 0), 100);

  return {
    name: 'Hook Strength',
    score,
    label: getLabel(score),
    feedback: score >= 80 
      ? 'Strong opening hook that grabs attention.' 
      : 'Your hook could be stronger. Try starting with a question, a bold statement, or addressing the viewer directly.',
    details
  };
}

function analyzeReadability(sentences: string[], words: string[]): AnalysisMetric {
  if (sentences.length === 0 || words.length === 0) return { name: 'Readability', score: 0, label: 'Needs Work', feedback: 'Not enough text.' };

  const avgSentenceLength = words.length / sentences.length;
  let longSentences = 0;
  
  sentences.forEach(s => {
    const sWords = s.match(/\b\w+\b/g) || [];
    if (sWords.length > 25) longSentences++;
  });
  
  const longSentenceRatio = longSentences / sentences.length;
  
  let score = 100;
  if (avgSentenceLength > 20) score -= 30;
  else if (avgSentenceLength > 15) score -= 15;
  
  score -= (longSentenceRatio * 100); // Penalty for too many long sentences
  score = Math.min(Math.max(score, 0), 100);

  return {
    name: 'Readability',
    score: Math.round(score),
    label: getLabel(score),
    feedback: score >= 80 
      ? 'Great readability and manageable sentence lengths.' 
      : `You have ${longSentences} long sentences. Try breaking them up to keep the viewer engaged.`,
  };
}

function analyzePacing(sentences: string[], paragraphs: string[]): AnalysisMetric {
  if (sentences.length < 3) return { name: 'Pacing', score: 50, label: 'Needs Work', feedback: 'Add more text to analyze pacing.' };

  const lengths = sentences.map(s => (s.match(/\b\w+\b/g) || []).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  // Ideal stdDev for pacing is around 5-10 (good variation)
  let score = 50;
  if (stdDev > 4) score += 30;
  if (stdDev > 7) score += 20;
  if (stdDev < 3) score -= 20;

  // Paragraph length check
  const longParagraphs = paragraphs.filter(p => (p.match(/\b\w+\b/g) || []).length > 100).length;
  score -= (longParagraphs * 10);

  score = Math.min(Math.max(score, 0), 100);

  return {
    name: 'Pacing',
    score: Math.round(score),
    label: getLabel(score),
    feedback: score >= 80 
      ? 'Excellent sentence variation keeps the pacing dynamic.' 
      : 'Your sentences are all roughly the same length. Mix short punchy sentences with longer ones.',
  };
}

function analyzeClarity(plainText: string, words: string[]): AnalysisMetric {
  const fillers = ["just", "really", "basically", "actually", "very", "quite", "sort of", "kind of", "like", "you know", "literally", "honestly", "essentially"];
  const textLower = plainText.toLowerCase();
  
  let fillerCount = 0;
  const foundFillers: Record<string, number> = {};

  fillers.forEach(f => {
    const regex = new RegExp(`\\b${f}\\b`, 'g');
    const matches = textLower.match(regex);
    if (matches) {
      fillerCount += matches.length;
      foundFillers[f] = matches.length;
    }
  });

  const fillerRatio = fillerCount / Math.max(words.length, 1);
  let score = 100 - (fillerRatio * 500); // 2% fillers = -10 points
  
  score = Math.min(Math.max(score, 0), 100);

  const details = Object.entries(foundFillers).map(([word, count]) => `Used '${word}' ${count} times`);

  return {
    name: 'Clarity',
    score: Math.round(score),
    label: getLabel(score),
    feedback: score >= 80 
      ? 'Clear and direct language with minimal fluff.' 
      : `Found ${fillerCount} filler words. Consider removing them for a cleaner, more confident delivery.`,
    details
  };
}

function analyzeRepetition(words: string[]): AnalysisMetric {
  if (words.length < 20) return { name: 'Repetition', score: 100, label: 'Excellent', feedback: 'Good variety.' };

  const phrases2 = new Map<string, number>();
  const stopWords = new Set(['in the', 'of the', 'to the', 'and the', 'on the', 'is a', 'for the', 'to be', 'it is']);
  
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i].toLowerCase()} ${words[i+1].toLowerCase()}`;
    if (!stopWords.has(phrase)) {
      phrases2.set(phrase, (phrases2.get(phrase) || 0) + 1);
    }
  }

  let repeatedCount = 0;
  const details: string[] = [];
  phrases2.forEach((count, phrase) => {
    if (count >= 3) {
      repeatedCount++;
      details.push(`"${phrase}" repeated ${count} times`);
    }
  });

  let score = 100 - (repeatedCount * 15);
  score = Math.min(Math.max(score, 0), 100);

  return {
    name: 'Repetition',
    score,
    label: getLabel(score),
    feedback: score >= 80 
      ? 'Good vocabulary variety without excessive repetition.' 
      : 'You have noticeably repeated phrases. Try mixing up your vocabulary.',
    details
  };
}

function analyzeStructure(plainText: string, paragraphs: string[]): AnalysisMetric {
  let score = 60; // base
  const lowerText = plainText.toLowerCase();

  if (paragraphs.length > 2) score += 15;
  if (paragraphs.length > 4) score += 15;

  const transitions = ['first', 'second', 'next', 'finally', 'however', 'therefore', 'in conclusion', 'for example', 'meanwhile'];
  const foundTransitions = transitions.filter(t => lowerText.includes(t));
  
  score += (foundTransitions.length * 5);
  score = Math.min(Math.max(score, 0), 100);

  return {
    name: 'Structure',
    score,
    label: getLabel(score),
    feedback: score >= 80 
      ? 'Well-structured script with clear transitions.' 
      : 'Consider adding more structural markers or paragraphs to break up ideas.',
  };
}

function analyzeCTA(sentences: string[]): AnalysisMetric {
  if (sentences.length === 0) return { name: 'CTA Strength', score: 0, label: 'Needs Work', feedback: 'No content.' };

  // Analyze the last 20% of the script
  const tailCount = Math.max(1, Math.floor(sentences.length * 0.2));
  const tailSentences = sentences.slice(-tailCount).join(' ').toLowerCase();

  const ctaWords = ['subscribe', 'follow', 'comment', 'share', 'click', 'check out', 'try', 'sign up', 'visit', 'download', 'link in bio'];
  
  const foundCTAs = ctaWords.filter(w => tailSentences.includes(w));
  
  let score = foundCTAs.length > 0 ? 100 : 20;
  
  if (foundCTAs.length > 2) score = 80; // slightly penalized for too many CTAs

  return {
    name: 'CTA Strength',
    score,
    label: getLabel(score),
    feedback: score >= 80 
      ? 'Strong call to action identified at the end.' 
      : 'No clear call-to-action found in your conclusion. Tell viewers exactly what to do next.',
  };
}

function analyzeEngagement(sentences: string[], _words: string[]): AnalysisMetric {
  const text = sentences.join(' ');
  const questions = (text.match(/\?/g) || []).length;
  const youCount = (text.toLowerCase().match(/\byou\b|\byour\b/g) || []).length;
  
  let score = 50;
  if (questions > 0) score += 20;
  if (questions > 2) score += 10;
  if (youCount > 2) score += 20;

  score = Math.min(Math.max(score, 0), 100);

  return {
    name: 'Engagement',
    score,
    label: getLabel(score),
    feedback: score >= 80 
      ? 'Highly engaging language used.' 
      : 'Increase engagement by asking rhetorical questions and using "you/your".',
  };
}
