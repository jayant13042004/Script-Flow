import type {
  AiService,
  ImproveTextParams,
  GenerateScriptParams,
  RepurposeParams,
  AskParams,
  AiTextResponse,
  AiGenerateResponse,
  TranscribeAudioParams,
  TranscribeAudioResponse
} from '../../types/ai';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockAiService implements AiService {
  async improveText({ selectedText, instruction }: ImproveTextParams): Promise<AiTextResponse> {
    await delay(1200);

    const lowerInstruction = instruction.toLowerCase();
    let resultText = selectedText;

    if (lowerInstruction.includes('shorten')) {
      resultText = this.shortenText(selectedText);
    } else if (lowerInstruction.includes('clarify')) {
      resultText = this.clarifyText(selectedText);
    } else if (lowerInstruction.includes('hook') || lowerInstruction.includes('curiosity')) {
      resultText = this.makePunchy(selectedText);
    } else if (lowerInstruction.includes('conversational')) {
      resultText = this.makeConversational(selectedText);
    } else if (lowerInstruction.includes('cta')) {
      resultText = `${selectedText} Make sure to hit subscribe and save this for later!`;
    } else if (lowerInstruction.includes('transcript') || lowerInstruction.includes('structured')) {
      resultText = `[HOOK]\n${selectedText.slice(0, 80)}...\n\n[CORE POINTS]\n• Main Insight: ${selectedText}\n• Key Takeaway: Focus on simplicity and clear execution.\n\n[VISUAL NOTE]\n[B-Roll: Screen recording demonstrating the technique]\n\n[CALL TO ACTION]\nDrop a comment with your thoughts below and subscribe for more!`;
    } else {
      resultText = selectedText
        ? `Here is an improved version: ${selectedText.replace(/\b(really|very|just|basically)\b/gi, '').trim()}`
        : 'Select text in your script to see improved variations.';
    }

    return { result: resultText };
  }

  async generateScript(params: GenerateScriptParams): Promise<AiGenerateResponse> {
    await delay(1800);

    const topic = params.topic || 'Content Creation';
    const platform = params.platform || 'youtube-shorts';

    return {
      hooks: [
        `If you care about ${topic}, stop scrolling right now.`,
        `I spent 100 hours testing ${topic} so you don't have to.`,
        `What nobody tells you about ${topic} will blow your mind.`
      ],
      script: `Here is the complete breakdown of ${topic}.\n\nMost creators get this wrong because they try to overcomplicate things. But when you break it down into 3 simple steps, everything changes.\n\nStep 1: Focus on the hook. You have less than 3 seconds to grab attention.\nStep 2: Deliver immediate value without filler words.\nStep 3: End with a clear action for your viewer.\n\nMaster these three, and your content will instantly stand out.`,
      onScreenText: [
        'THE SECRET TO ' + topic.toUpperCase(),
        'STEP 1: THE HOOK',
        'STEP 2: VALUE NO FILLER',
        'STEP 3: ACTION'
      ],
      visualSuggestions: [
        'Fast-paced zoom-in on face at the start',
        'Pop-up text graphic showing key stats',
        'B-roll transition showing workspace setup',
        'End screen overlay with social handles'
      ],
      cta: `If you want to master ${topic}, hit follow and drop a comment below with your thoughts!`
    };
  }

  async repurpose({ scriptContent, targetFormat, scriptTitle }: RepurposeParams): Promise<AiTextResponse> {
    await delay(1500);

    const formatKey = String(targetFormat).toLowerCase();

    let result = '';

    if (formatKey.includes('thread') || formatKey.includes('x')) {
      result = `🧵 ${scriptTitle || 'Thread'}\n\n1/ Here is a quick breakdown of what most creators get wrong...\n\n2/ Key takeaway: Simplicity beats complexity every time.\n\n3/ If you enjoyed this thread, RT the first tweet to help others!`;
    } else if (formatKey.includes('linkedin')) {
      result = `${scriptTitle || 'Insight'}\n\nI used to struggle with this until I made one key shift.\n\nKey takeaways:\n- Focus on consistency\n- Measure what actually matters\n- Cut out the noise\n\nWhat is your experience with this? Let me know below. 👇`;
    } else if (formatKey.includes('short') || formatKey.includes('reel') || formatKey.includes('tiktok')) {
      result = `[0:00-0:03] HOOK: "You are doing ${scriptTitle || 'this'} wrong."\n[0:03-0:20] BODY: ${scriptContent.slice(0, 120)}...\n[0:20-0:30] CTA: "Follow for more daily tips!"`;
    } else {
      result = `Repurposed for ${targetFormat}:\n\n${scriptContent.slice(0, 200)}...`;
    }

    return { result };
  }

  async askAboutScript({ question, scriptContext }: AskParams): Promise<AiTextResponse> {
    await delay(1000);

    const lower = question.toLowerCase();
    let result = '';

    if (lower.includes('hook')) {
      result = 'Your hook is clear, but starting with a direct question or surprising stat would increase viewer retention by ~25%.';
    } else if (lower.includes('pacing') || lower.includes('length')) {
      result = 'The pacing is good overall. Consider shortening the middle paragraph to keep viewers engaged.';
    } else {
      result = `Regarding "${question}": Your script has a solid structure (${scriptContext.split(' ').length} words). Adding an example would strengthen the core point.`;
    }

    return { result };
  }

  async transcribeAudio(_params: TranscribeAudioParams): Promise<TranscribeAudioResponse> {
    await delay(1200);
    return {
      transcript: "I want to make a video about how creators can 10x their production speed using structured workflows and better hooks.",
      structuredScript: "[HOOK]\nIf you're spending 10 hours writing a single video script, you are doing it completely wrong.\n\n[CORE POINTS]\n• Batch your ideas: Stop writing from scratch every single day.\n• Script your visuals first: Knowing your B-roll cuts writing time in half.\n• Eliminate filler: If a sentence doesn't advance the story, delete it.\n\n[VISUAL NOTES]\n[B-Roll: Screen capture of fast editing workflow]\n\n[CALL TO ACTION]\nSubscribe for weekly creator masterclasses and comment your biggest bottleneck below!"
    };
  }

  private shortenText(text: string): string {
    return text
      .replace(/I really think that the most important thing that you need to understand about this topic is that/gi, 'The key thing to understand is')
      .replace(/In my personal opinion, I believe that/gi, 'I believe')
      .replace(/due to the fact that/gi, 'because')
      .replace(/at this point in time/gi, 'now');
  }

  private clarifyText(text: string): string {
    return text
      .replace(/utilize/gi, 'use')
      .replace(/facilitate/gi, 'help')
      .replace(/implement/gi, 'start')
      .replace(/leverage/gi, 'use');
  }

  private makePunchy(text: string): string {
    return `Listen up: ${text}`;
  }

  private makeConversational(text: string): string {
    return `So here's the deal... ${text.charAt(0).toLowerCase() + text.slice(1)}`;
  }

  async generateVideoIdeas(params: import('../../types/ai').GenerateVideoIdeasParams): Promise<import('../../types/ai').GenerateVideoIdeasResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const firstTitle = params.pastScripts[0]?.title || 'Content Creation';
    return {
      detectedNiche: 'Digital Creator & Growth Strategy',
      creatorStyle: 'Fast-paced, actionable breakdowns with real creator workflows',
      ideas: [
        {
          id: 'idea-1',
          title: `Why 99% of Creators Fail at ${firstTitle.slice(0, 25)} (And How to Fix It)`,
          hook: 'Most creators make one fatal mistake right in the first 30 seconds...',
          angle: 'Contrarian breakdown addressing common pitfalls in your niche.',
          format: 'Problem & Solution Breakdown'
        },
        {
          id: 'idea-2',
          title: 'The Unfair Advantage: 5 Tools I Use to Script Videos 10x Faster',
          hook: 'If you are spending more than 2 hours writing a script, you are doing it wrong.',
          angle: 'Actionable productivity tutorial with high retention potential.',
          format: 'Listicle & Workflow'
        },
        {
          id: 'idea-3',
          title: 'How I Would Start Over from Scratch in 2026',
          hook: 'If I lost all my scripts, subscribers, and tools tomorrow, here is my exact 30-day plan.',
          angle: 'High-curiosity blueprint video that establishes authority.',
          format: 'Step-by-Step Blueprint'
        },
        {
          id: 'idea-4',
          title: 'Stop Doing This In Your YouTube Scripts (It Kills Retention)',
          hook: 'Look at this retention graph right here. Notice how it drops off at 1:15?',
          angle: 'Data-driven critique that sparks urgency.',
          format: 'Case Study & Analysis'
        },
        {
          id: 'idea-5',
          title: 'The 3-Hook Framework That Generated My Best Performing Video',
          hook: 'The title gets the click, but these first 5 seconds make or break the entire video.',
          angle: 'Deep-dive tactical framework.',
          format: 'Behind-the-Scenes Framework'
        },
        {
          id: 'idea-6',
          title: 'The Secret Algorithm Shift Nobody Is Talking About Right Now',
          hook: 'Something big changed in how videos get recommended this month.',
          angle: 'Timely, urgent curiosity gap.',
          format: 'Industry Insight'
        }
      ]
    };
  }
}
