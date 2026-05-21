export type BlogCategory = "Trekking" | "Culture" | "Stories" | "Tips" | "Wildlife";

export interface BlogPost {
  slug: string;
  title: string;
  category: BlogCategory;
  authorSlug: string;
  date: string;       // human-readable
  isoDate: string;    // for <time>
  readingTime: number; // minutes
  coverImage: string;
  excerpt: string;
  body: string[];      // paragraphs
  pullQuote?: string;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "thorong-la-twelve-times",
    title: "What I learned crossing Thorong La twelve times",
    category: "Stories",
    authorSlug: "pemba-sherpa",
    date: "May 12, 2026",
    isoDate: "2026-05-12",
    readingTime: 7,
    coverImage:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2000&q=80",
    excerpt:
      "Twelve crossings of a 5,416 m pass teach you something the first one can't. Mostly: slow is faster, and the mountain is never the enemy.",
    pullQuote:
      "The pass doesn't get smaller. You get smaller in a useful way.",
    body: [
      "The first time I crossed Thorong La, I was nineteen and stubborn. I left Phedi too early, I drank too little, and by the chorten at the top I was leaning on my poles like an old man. The view didn't help. I had no breath to spend on it.",
      "Twelve crossings later, I have a different relationship with the pass. I no longer think of it as a thing to be conquered. I think of it as a clock — a 5,416 metre clock that measures how honestly I prepared for the week before. If you slept badly at Manang, the pass will tell you. If you skipped the rest-day hike to Gangapurna Lake, the pass will tell you. If you ate three plates of dal bhat at Yak Kharka, the pass will sometimes — generously — let you skip the lecture.",
      "Here's what I try to teach every group now. First, the day before is more important than the day of. Hydrate from the moment you arrive at Phedi. Eat carbohydrates you actually like; the wrong noodle soup at altitude is a tax. Sleep with your headlamp, water bottle and gloves inside your sleeping bag. The 3:45 am start is brutal for everyone, but the people who lose ten minutes hunting for a frozen mitten end up losing an hour.",
      "Second, walk slower than feels natural. The high pass isn't a feat of speed; it's a long, low-grade slog where heart rate management is everything. If you can't hold a conversation, you're going too fast. I tell newcomers: imagine you're trying not to wake a sleeping baby in your chest.",
      "Third, the descent is where injuries happen. By the time you crest the pass, you've been climbing for four hours. You're tired, the wind is sharp, and your blood sugar is on the floor. Eat something at the top — chocolate, a biscuit, anything — before you start the knee-grinding 1,600 metre descent to Muktinath. I have never met a trekker who regretted slowing down on the way down. I have met many who regretted not doing so.",
      "There's a moment, every time I cross, where I stop just past the prayer flags and look back at the line of small bright dots picking their way up the snow. It's the same vantage every year, but the dots are always different people. Some are euphoric, some are quiet, some are crying. Almost everyone is changed.",
      "That, in the end, is why I keep coming back. Not because the pass is a record to break — it is not — but because it's a kind of border. The people who walk back down from Thorong La are not the same people who walked up to it. After twelve crossings, I'm still learning what kind of border that is.",
    ],
    featured: true,
  },
  {
    slug: "quietest-week-bhaktapur",
    title: "The quietest week in Bhaktapur",
    category: "Culture",
    authorSlug: "kamala-tamang",
    date: "April 28, 2026",
    isoDate: "2026-04-28",
    readingTime: 5,
    coverImage:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=2000&q=80",
    excerpt:
      "Three days of monsoon rain and one Newari kitchen that doesn't close. A short essay on the city that taught me how to host travelers.",
    body: [
      "Most travelers come to Bhaktapur in October. I prefer the second week of August.",
      "In August the courtyards are empty. The rain has driven the bus tours to Pokhara and the festival crowds are still two months away. The stone squares glisten, the gargoyles drip, and the city sounds like a city again — pestles in mortars, copper smiths, distant temple bells.",
      "I grew up two streets from Dattatraya Square. My grandmother had a four-storey house with a kitchen on the top floor, the way most Newari homes were built, so the smoke and the cooking smell stayed out of the living rooms below. When it rained, the kitchen was the warmest room in the city.",
      "There is a small bhojanalaya — a Newari kitchen — that has been open since my mother was a girl. It does one thing well: samay baji, a platter of beaten rice, smoked buffalo, black soybeans, ginger, and a small cup of aila spirit distilled in the back. In August I take guests there at dusk, when the rain is loudest and the platter feels like the most honest meal in Nepal.",
      "If you come to Bhaktapur in the high season, the city will perform for you. If you come in the low season, it might let you sit at the edge of its life. The second is much rarer, and much more worth flying for.",
    ],
  },
  {
    slug: "why-we-cap-groups-at-eight",
    title: "Why we cap our trekking groups at eight",
    category: "Stories",
    authorSlug: "pemba-sherpa",
    date: "April 14, 2026",
    isoDate: "2026-04-14",
    readingTime: 4,
    coverImage:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80",
    excerpt:
      "Most operators put 14–16 on a single guide. We've held the line at eight since 2018. Here's the maths — and the human reason.",
    body: [
      "Most agencies will quietly tell you eight is uneconomic. They're not wrong on a single trip. But over a season — and over a guide's career — eight is the only number that holds up.",
      "The maths first. At 14 trekkers per guide, you have roughly two minutes per person at each rest stop. That's enough time to check that someone is breathing, not enough to notice that they are breathing too fast. The early signs of acute mountain sickness — quiet withdrawal, mild confusion, slight loss of appetite — only show up when a guide knows what each person normally looks like. With eight, by day three, your guide knows your normal. With fourteen, by day three your guide knows your name.",
      "The human reason is simpler. Above 4,000 metres, the people having a hard time stop volunteering it. They don't want to slow the group, they don't want to embarrass themselves, they want to keep up. A group of eight notices. A group of fourteen does not.",
      "We cap at eight, we always will, and we are proud of how unspectacular that policy sounds.",
    ],
  },
  {
    slug: "30-litre-packing-list",
    title: "A packing list that fits in 30 litres",
    category: "Tips",
    authorSlug: "tashi-gurung",
    date: "March 30, 2026",
    isoDate: "2026-03-30",
    readingTime: 6,
    coverImage:
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2000&q=80",
    excerpt:
      "After a decade on the trail, I've stopped recommending the 65-litre pack. Here's what actually goes in mine for a twelve-day teahouse trek.",
    body: [
      "The single biggest mistake I see new trekkers make is overpacking. Not by a little — by a lot. The Annapurna Circuit is a teahouse trek; you'll sleep in stone lodges with warm blankets, eat hot meals every night, and have access to laundry at four villages along the route. You do not need to carry six days of clean shirts.",
      "What you actually need: two trekking shirts, one fleece, one waterproof shell, two pairs of trekking trousers (one zip-off), three pairs of merino socks, one set of thermal base layers, a down jacket, a beanie, gloves with liners, a sun hat, a headlamp, a 1L water bottle, a small toiletry kit, a small first-aid kit, your camera (if not a phone), and a paperback book. That's 30 litres comfortably.",
      "The porter system on the Circuit and the Khumbu means you don't carry the heavy bag during the day. You carry your daypack — water, snacks, raingear, camera, sunscreen — and the duffel comes to the next lodge by another route. So pack accordingly: your daypack is the bag you live out of, and it should weigh less than 5 kilograms.",
      "Lighter is faster. Lighter is happier. Lighter is the thing your knees thank you for on the descent into Muktinath.",
    ],
  },
  {
    slug: "one-night-with-the-tharu",
    title: "One night with the Tharu",
    category: "Wildlife",
    authorSlug: "anish-rai",
    date: "March 12, 2026",
    isoDate: "2026-03-12",
    readingTime: 5,
    coverImage:
      "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2000&q=80",
    excerpt:
      "Chitwan is famous for rhinos. The real reason I keep going back is a homestay dinner in a Tharu village on the park's edge.",
    body: [
      "The Tharu have lived in the Terai for centuries. They were one of the few groups historically immune to malaria, which is why they were the only people who could settle the dense lowland forests when everyone else was driven to higher ground. Their villages along Chitwan's border are mud-walled, fire-warmed, and beautiful.",
      "On every Chitwan trip we include one night at a Tharu homestay. The host family cooks dhindo — a stiff buckwheat porridge — and a fish curry made with mustard greens. After dinner, the kids do a stick dance in the courtyard, which I admit can sound touristy on paper. It isn't. The dance is a real harvest tradition, the kids are giggling, the parents are watching, and there are no buses parked outside.",
      "The next morning, we're up at 4:30 for a canoe ride down the Rapti. If you're lucky, a one-horned rhino is washing on the bank. If you're not, you still get the river in mist, gharial crocodiles on the sandbanks, and the slow understanding that the wildlife was always going to be a bonus.",
    ],
  },
  {
    slug: "spring-vs-autumn",
    title: "The quiet case for trekking in Spring",
    category: "Trekking",
    authorSlug: "tashi-gurung",
    date: "February 24, 2026",
    isoDate: "2026-02-24",
    readingTime: 4,
    coverImage:
      "https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=2000&q=80",
    excerpt:
      "Autumn gets the bookings; Spring gets the rhododendrons. Why our guides quietly prefer March-May.",
    body: [
      "Ask a guidebook and it'll tell you Nepal has two trekking seasons: October–November (post-monsoon, clear skies) and March–May (pre-monsoon, warmer). Both are right. But Spring is where the conversation usually ends, when it should be where it begins.",
      "Spring trekking is slightly hazier — that's true. The post-monsoon clarity of October mornings is unmatched. But Spring brings the rhododendron forests into bloom: hillsides at 2,500–3,500 metres that turn red, pink and white through April. The Annapurna Sanctuary in particular is electric. Add in the fact that there are roughly 40% fewer trekkers on the trail and that lodges have full availability, and Spring becomes the season most of our guides quietly prefer to work in.",
      "Days are slightly longer, evenings slightly warmer, and the high passes that closed under snow in January are reopening one by one. If you can travel in either season, take Spring.",
    ],
  },
];

export const getBlogPost = (slug: string) => blogPosts.find((p) => p.slug === slug);
