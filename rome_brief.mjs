// Rome story for the AI City Remix contest.
// The director is MiniMax M3.1 Flash through SandBase (contest requirement).
// Facts below were checked against Wikipedia / Pleiades / OSM on 23 Oct 2026.
// The geometry is in geo/era_shapes.json (OSM-derived rings + documented hand traces).
export const CITY = { name: 'Rome', lat: 41.8925, lon: 12.4853, note: 'Rome, Italy' }

export const THESIS = `The film takes the proverb "Rome was not built in a day" and shows the part the proverb hides: Rome was never finished. Every era rebuilt on the last one, the city shrank twice as hard as it grew, and it is still under construction. The map is the argument - it starts as a lit hilltop of eight hectares and ends as a plain of roads three hundred and forty-six square kilometres wide. The tone is plain, exact, warm and a little awed. No jokes, no hype, no rhetorical questions.`

export const RULES = `Rules for the writing:
- Return ONLY valid JSON matching the shape asked for. No markdown fences, no commentary.
- narration: 1-2 sentences, 130-210 characters, plain spoken English, as if a narrator said it aloud. It is also burned into the film as a subtitle, so keep it to one or two clean lines.
- Do not put years in the narration - the year is already printed on screen. If a number is unavoidable, write it as it is spoken ("eleven kilometres", "two and a half square kilometres").
- Use only the facts given to you. Do not add dates, names, numbers or events of your own. If you want a fact that is not in the brief, leave it out.
- stat: one short fact, 60 characters maximum, like "Wall about 11 km long".
- event prompt: one period-correct scene, 400 characters maximum, painted in daylight, no text or lettering in the image, no modern objects, no portraits of real people, no instructions to the image model - just the scene.
- Speak about the city, not about the film. Present tense for the city, past tense for what has been built.`

export const ERAS = [
  {
    key: 'quadrata',
    year: '753 BC',
    label: 'Roma Quadrata',
    facts: [
      'The traditional founding date of Rome is 753 BC, credited to Romulus and Remus.',
      'The first settlement was a small village on the summit of the Palatine hill, above the marshes of the Tiber flood plain, on ground the plough had already claimed.',
      'It was called Roma Quadrata, a square of ground, because the founders marked it out with a plough.',
      'It was a hamlet of a few houses and a shrine. The Forum valley below it was wet ground, drained only centuries later.',
    ],
    shapeKey: 'quadrata',
    color: '#f2c879',
    events: [
      { at: [41.8932, 12.4832], title: 'The she-wolf of the Capitoline', prompt: 'The bronze she-wolf of the Capitoline standing on a dark rock with two infants beneath her, first light on wet stone, ancient Rome at dawn' },
      { at: [41.8925, 12.4853], title: 'The Forum, still marsh', prompt: 'The Roman Forum as a wet marsh of reeds and pools between muddy hills, early huts on the Palatine above, dawn mist, herons in the water' },
    ],
  },
  {
    key: 'servian',
    year: 'c. 380 BC',
    label: 'The Servian Wall',
    facts: [
      'Rome built its first wall in the early fourth century BC. Roman tradition credits it to the king Servius Tullius.',
      'The wall was about eleven kilometres long, up to ten metres high, built of volcanic tuff from the Alban Hills, and had sixteen gates.',
      'It closed a shape around the hills of Rome and enclosed about two and a half square kilometres.',
      'The wall is what turned a village into a city. Inside it was the Roman people; outside it was the enemy.',
      'Only fragments survive, most of them beside the railway station and behind a McDonald\'s.',
    ],
    shapeKey: 'servian',
    color: '#e8a13c',
    events: [
      { at: [41.8896, 12.4692], title: 'The wall climbs the hill', prompt: 'A rough tufa city wall climbing a steep Roman hill, timber scaffolding, masons at work with a block of stone, sunrise over the valley' },
      { at: [41.8925, 12.4853], title: 'Seven gates, one street', prompt: 'A muddy Roman street between plain stone houses, a paved shrine at the end, laundry lines, a wooden cart, early morning light' },
    ],
  },
  {
    key: 'republic',
    year: 'c. 100 BC',
    label: 'The Republic spills out',
    facts: [
      'By the first century BC Rome had grown far past its old wall. The wall was never moved, so the city simply ran over it.',
      'The great drain, the Cloaca Maxima, carried the filth of the Forum valley away, and aqueducts began to bring water down from the hills.',
      'Rome governed the whole Mediterranean and ruled itself from a city of mud brick and marble on seven hills.',
      'The wall stayed as a line on the ground. Everything outside it was the city anyway.',
    ],
    shapeKey: 'republic',
    color: '#d9822b',
    events: [
      { at: [41.8918, 12.4866], title: 'The Cloaca Maxima', prompt: 'The great stone drain of ancient Rome under a vaulted arch, water running between worn stones, a lamp glow on the wet floor' },
      { at: [41.8919, 12.4792], title: 'Temples on the hill', prompt: 'Tall white marble temples on a Roman hilltop above a crowded city of tiled roofs and busy streets, market day' },
    ],
  },
  {
    key: 'imperial',
    year: 'c. AD 100-130',
    label: 'Imperial Rome',
    facts: [
      'Under Trajan and Hadrian, around AD 100, Rome was the largest city in the world, with about a million people inside and just outside the walls.',
      'Trajan opened his Forum in AD 107, the largest forum in the empire, and set his column in it as a victory monument.',
      'Hadrian rebuilt the Pantheon, finished in the second century AD, with a concrete dome so light it needed no columns to hold it up.',
      'The city had already outgrown the walls that would be built to hold it. The emperors kept adding new quarters to the old city.',
    ],
    shapeKey: 'imperial',
    color: '#c85a3c',
    events: [
      { at: [41.8957, 12.4827], title: 'Trajan\u2019s Column', prompt: 'A tall spiral marble victory column in a vast imperial forum, carved relief spiralling up it, crowds in the square' },
      { at: [41.8986, 12.4769], title: 'The dome of the Pantheon', prompt: 'Inside an immense Roman concrete dome, a perfect circle of open sky with a ring of sunlight falling on the marble floor' },
    ],
  },
  {
    key: 'aurelian',
    year: 'AD 271-275',
    label: 'The Aurelian Walls',
    facts: [
      'In AD 271 the emperor Aurelian began the largest fortification ever built in the western world, finished in AD 275.',
      'The wall was about eleven and a half kilometres long with nineteen towers, faced in brick, and it closed about fourteen square kilometres.',
      'It was a wall of fear, built while the empire was already breaking, and it cut through populated ground. Part of the old city was left outside it, and the wall made the city smaller than it had been a century before.',
      'A wall of fear, around a city that was already shrinking.',
    ],
    shapeKey: 'aurelian271',
    color: '#a8452f',
    events: [
      { at: [41.8918, 12.5145], title: 'Porta Maggiore', prompt: 'A massive double arch of a brick-faced Roman city wall with two aqueduct arches crossing above it, a road passing through' },
      { at: [41.8986, 12.4769], title: 'The Pantheon, outside', prompt: 'The Pantheon with its temple portico standing outside a new brick city wall, market stalls and carts beyond the wall line' },
    ],
  },
  {
    key: 'honorius',
    year: 'AD 401-403',
    label: 'The wall moves out',
    facts: [
      'In AD 401 the emperor Honorius pushed the northern wall outward along a new line, and by AD 403 the work was done.',
      'The extension took the Campus Martius and the Pantheon back inside the city.',
      'It was the first growth in more than a century, and it happened by moving a wall rather than by building a city.',
      'The old northern line stayed in the pavement as a road named after the wall.',
    ],
    shapeKey: 'aurelian403',
    color: '#8e3f7a',
    events: [
      { at: [41.8986, 12.4769], title: 'The Pantheon, back inside', prompt: 'A Roman temple portico now standing inside a city wall corner, brick wall meeting the marble columns, a cart passing through the gate' },
      { at: [41.9012, 12.4666], title: 'A new line of wall', prompt: 'Builders raising a brick city wall on a new line across open Roman ground, quarry blocks and ox carts' },
    ],
  },
  {
    key: 'leonine',
    year: '1483',
    label: 'The last Roman wall',
    facts: [
      'By the fifteenth century Rome had shrunk to a few thousand inhabitants inside a shell of empty wall.',
      'Around the Vatican, a new wall was built in the old Roman way: begun under Pope Nicholas V in the middle of the century, carried on by Sixtus IV, and finished with the Bastione dei Cosmati in 1483.',
      'The bastion carries ancient Roman marble columns set into its face, taken from older buildings.',
      'It was finished about a thousand years after the western empire fell, and Romans have called it the fourth wall of their city.',
    ],
    shapeKey: 'leonine',
    color: '#4f6fb8',
    events: [
      { at: [41.9020, 12.4533], title: 'The Cosmati bastion', prompt: 'A Renaissance fortress bastion of red brick with ancient Roman marble columns and carved stone set into its face, dusk light' },
      { at: [41.9022, 12.4539], title: 'St Peter\u2019s dome', prompt: 'A great Renaissance dome over a basilica seen from a fortress wall at golden hour, the dome bright against a blue sky' },
    ],
  },
  {
    key: 'portapia',
    year: '1870',
    label: 'Porta Pia',
    facts: [
      'On 20 September 1870 the breach at Porta Pia ended papal rule and made Rome the capital of the new kingdom of Italy.',
      'The Aurelian Walls were then taken down, and their line became the boulevards that ring the old centre.',
      'For eighteen hundred years the wall had been the edge of the city. After 1870 it was a road, and the city could grow past it again.',
      'The gate survives as a triumphal arch for Italian kings.',
    ],
    shapeKey: 'portaPia',
    color: '#2f8f7a',
    events: [
      { at: [41.9012, 12.4550], title: 'The breach at Porta Pia', prompt: 'A great gap hacked through a brick Roman city wall, rubble and dust, artillery smoke beyond, workers with tools' },
      { at: [41.9070, 12.4900], title: 'The wall becomes a road', prompt: 'A wide tree-lined boulevard laid on the line of a demolished city wall, horse carriages and early trams, late afternoon light' },
    ],
  },
  {
    key: 'modern',
    year: '1940s to today',
    label: 'The new ring',
    facts: [
      'The Grande Raccordo Anulare, the motorway ring around Rome, was designed in the 1940s and built in stages, and it is now the third wall of the city.',
      'The first three were the Servian Wall, the Aurelian Walls and the Leonine Wall. The ring road is the newest of them, and it is nearly circular.',
      'It was laid through the Agro Romano, farmland outside the city, and the districts grew up around it.',
      'Under it the city is still being built: new metro lines, new bridges, and the Jubilee of 2025 rebuilding the banks of the Tiber. The first section of Metro C opened in 2024.',
    ],
    shapeKey: 'modern',
    color: '#3f7fd4',
    events: [
      { at: [41.8930, 12.5350], title: 'The ring road', prompt: 'A motorway ring road curving through the Roman suburbs at dusk, headlights and taillights in long streams' },
      { at: [41.8915, 12.4933], title: 'Metro C at the Colosseum', prompt: 'A modern metro station entrance of glass and steel at a Roman forum, a bus lane above it, evening light' },
    ],
  },
]

export const TOPLEVEL_PROMPT = `You are directing a short documentary film about the history of Rome, told on a live map of the modern city.

${THESIS}

The film's beats, in order, with the label that will be printed on screen:
${ERAS.map((e) => `- ${e.year}: ${e.label}`).join('\n')}

Write ONLY this JSON:
{
  "title": { "en": "<the film title, 80 characters max>", "sub": "<one line under the title, 80 characters max>" },
  "intro": "<one spoken sentence, 200 characters max>",
  "outro": "<one spoken sentence, 200 characters max>",
  "endCard": { "title": "<a final full-screen card, 60 characters max>", "sub": "<one line under it, 80 characters max>" }
}

${RULES}
- The title must carry the proverb "Rome was not built in a day" without shouting it. The end card is the last thing the viewer sees: it should turn the proverb, landing that the city is still unfinished.`
