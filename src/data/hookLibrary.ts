import type { Hook } from '../types/hook';

export const hookLibrary: Hook[] = [
  // Curiosity hooks
  { id: 'c1', text: 'I tried ___ for 30 days and here is what happened.', category: 'curiosity', example: 'I tried waking up at 5 AM for 30 days and here is what happened.' },
  { id: 'c2', text: 'The secret to ___ nobody talks about.', category: 'curiosity', example: 'The secret to viral content nobody talks about.' },
  { id: 'c3', text: 'If you want to ___, you need to stop doing this.', category: 'curiosity', example: 'If you want to lose weight, you need to stop doing this.' },
  { id: 'c4', text: 'This one tool completely changed how I ___.', category: 'curiosity', example: 'This one tool completely changed how I write code.' },
  { id: 'c5', text: "What they don't tell you about ___.", category: 'curiosity', example: "What they don't tell you about starting a business." },

  // Contrarian hooks
  { id: 'co1', text: 'Why ___ is actually terrible advice.', category: 'contrarian', example: 'Why "follow your passion" is actually terrible advice.' },
  { id: 'co2', text: "I don't care what experts say, ___ is dead.", category: 'contrarian', example: "I don't care what experts say, traditional SEO is dead." },
  { id: 'co3', text: 'Stop trying to ___. Do this instead.', category: 'contrarian', example: 'Stop trying to wake up early. Do this instead.' },
  { id: 'co4', text: "The biggest lie you've been told about ___.", category: 'contrarian', example: "The biggest lie you've been told about passive income." },
  { id: 'co5', text: 'Everyone is wrong about ___.', category: 'contrarian', example: 'Everyone is wrong about the algorithm.' },

  // Mistake hooks
  { id: 'm1', text: 'Are you making this critical mistake with your ___?', category: 'mistake', example: 'Are you making this critical mistake with your skincare routine?' },
  { id: 'm2', text: "The #1 reason your ___ isn't working.", category: 'mistake', example: "The #1 reason your Facebook ads aren't working." },
  { id: 'm3', text: '3 mistakes beginners make when ___.', category: 'mistake', example: '3 mistakes beginners make when investing in crypto.' },
  { id: 'm4', text: 'I lost ___ because I made this simple mistake.', category: 'mistake', example: 'I lost $10,000 because I made this simple mistake.' },
  { id: 'm5', text: 'Stop ruining your ___ with this common error.', category: 'mistake', example: 'Stop ruining your morning coffee with this common error.' },

  // Story hooks
  { id: 's1', text: 'How I went from ___ to ___.', category: 'story', example: 'How I went from broke college student to making $10k/month.' },
  { id: 's2', text: 'The crazy story of how I ___.', category: 'story', example: 'The crazy story of how I accidentally met my business partner.' },
  { id: 's3', text: "I spent ___ so you don't have to.", category: 'story', example: "I spent 100 hours researching AI tools so you don't have to." },
  { id: 's4', text: 'Here is how a simple ___ changed my life.', category: 'story', example: 'Here is how a simple email changed my life.' },
  { id: 's5', text: 'A day in the life of a ___.', category: 'story', example: 'A day in the life of a solo indie hacker.' },

  // Fear hooks
  { id: 'f1', text: "If you don't ___, you will regret it in 5 years.", category: 'fear', example: "If you don't start investing now, you will regret it in 5 years." },
  { id: 'f2', text: 'The dangerous truth about ___.', category: 'fear', example: 'The dangerous truth about artificial intelligence.' },
  { id: 'f3', text: 'Why your ___ is secretly destroying your ___.', category: 'fear', example: 'Why your posture is secretly destroying your productivity.' },
  { id: 'f4', text: 'You are losing ___ every day by not doing this.', category: 'fear', example: 'You are losing money every day by not doing this.' },
  { id: 'f5', text: 'Watch out for this scary ___ trend.', category: 'fear', example: 'Watch out for this scary new social media trend.' },

  // Authority hooks
  { id: 'a1', text: "I've helped ___ achieve ___. Here is how.", category: 'authority', example: "I've helped 500+ clients achieve their dream physique. Here is how." },
  { id: 'a2', text: 'As a ___, here is my top advice for ___.', category: 'authority', example: 'As a former Google recruiter, here is my top advice for interviews.' },
  { id: 'a3', text: 'The exact framework I used to ___.', category: 'authority', example: 'The exact framework I used to scale to 1M followers.' },
  { id: 'a4', text: 'Steal my ___ system that generates ___.', category: 'authority', example: 'Steal my content system that generates 100 leads a day.' },
  { id: 'a5', text: 'What 10 years of ___ taught me.', category: 'authority', example: 'What 10 years of software engineering taught me.' },

  // Question hooks
  { id: 'q1', text: 'Have you ever wondered why ___?', category: 'question', example: 'Have you ever wondered why airplanes have those tiny windows?' },
  { id: 'q2', text: 'What would you do if ___?', category: 'question', example: 'What would you do if you had unlimited money for one day?' },
  { id: 'q3', text: 'Is ___ actually worth the hype?', category: 'question', example: 'Is the new iPhone actually worth the hype?' },
  { id: 'q4', text: 'Why is nobody talking about ___?', category: 'question', example: 'Why is nobody talking about this new AI update?' },
  { id: 'q5', text: 'Can you really ___ in just ___?', category: 'question', example: 'Can you really learn a language in just 30 days?' },

  // Myth-busting hooks
  { id: 'mb1', text: 'Myth: ___. Fact: ___.', category: 'myth-busting', example: 'Myth: Carbs make you fat. Fact: Caloric surplus makes you fat.' },
  { id: 'mb2', text: 'Everything you know about ___ is a lie.', category: 'myth-busting', example: 'Everything you know about hydration is a lie.' },
  { id: 'mb3', text: 'Busting the biggest myth about ___.', category: 'myth-busting', example: 'Busting the biggest myth about the real estate market.' },
  { id: 'mb4', text: "No, you don't need ___ to ___.", category: 'myth-busting', example: "No, you don't need a degree to become a developer." },
  { id: 'mb5', text: 'Stop believing this nonsense about ___.', category: 'myth-busting', example: 'Stop believing this nonsense about crypto investing.' },

  // Challenge hooks
  { id: 'ch1', text: 'I challenge you to ___ for 7 days.', category: 'challenge', example: 'I challenge you to drink only water for 7 days.' },
  { id: 'ch2', text: 'Can you pass the ___ test?', category: 'challenge', example: 'Can you pass the ultimate focus test?' },
  { id: 'ch3', text: 'Try this ___ challenge if you dare.', category: 'challenge', example: 'Try this 100-pushup challenge if you dare.' },
  { id: 'ch4', text: 'Are you tough enough to ___?', category: 'challenge', example: 'Are you tough enough to endure the 75 Hard program?' },
  { id: 'ch5', text: 'Do this one thing right now to ___.', category: 'challenge', example: 'Do this one thing right now to fix your posture.' },

  // Data/statistic hooks
  { id: 'd1', text: 'Did you know that ___% of people ___?', category: 'data-statistic', example: 'Did you know that 80% of people abandon their new year resolutions by February?' },
  { id: 'd2', text: 'This one stat explains why ___ is failing.', category: 'data-statistic', example: 'This one stat explains why traditional retail is failing.' },
  { id: 'd3', text: '___ out of ___ experts agree that ___.', category: 'data-statistic', example: '9 out of 10 experts agree that this approach is more effective.' },
  { id: 'd4', text: 'According to recent studies, ___.', category: 'data-statistic', example: 'According to recent studies, scrolling before bed lowers sleep quality by 30%.' },
  { id: 'd5', text: 'The math behind ___ will shock you.', category: 'data-statistic', example: 'The math behind compound interest will shock you.' },

  // Surprise hooks
  { id: 'su1', text: "I couldn't believe it when I found out ___.", category: 'surprise', example: "I couldn't believe it when I found out how much YouTubers really make." },
  { id: 'su2', text: 'The most unexpected way to ___.', category: 'surprise', example: 'The most unexpected way to clean your keyboard.' },
  { id: 'su3', text: 'Plot twist: ___ is actually ___.', category: 'surprise', example: 'Plot twist: The cheapest option is actually the best.' },
  { id: 'su4', text: "You won't believe what happened when I ___.", category: 'surprise', example: "You won't believe what happened when I asked AI to trade stocks." },
  { id: 'su5', text: 'This obscure ___ is secretly brilliant.', category: 'surprise', example: 'This obscure indie game is secretly brilliant.' },

  // Emotional hooks
  { id: 'e1', text: 'The hardest lesson I learned about ___.', category: 'emotional', example: 'The hardest lesson I learned about friendship.' },
  { id: 'e2', text: 'I almost gave up on ___, until this happened.', category: 'emotional', example: 'I almost gave up on my channel, until this happened.' },
  { id: 'e3', text: 'Why ___ always makes me emotional.', category: 'emotional', example: 'Why animal rescue videos always make me emotional.' },
  { id: 'e4', text: 'The real reason I stopped ___.', category: 'emotional', example: 'The real reason I stopped drinking alcohol.' },
  { id: 'e5', text: 'If you feel ___, this is for you.', category: 'emotional', example: 'If you feel lost in your 20s, this is for you.' },
];
