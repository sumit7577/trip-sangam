import type { PackageDetail } from "@/types";
import { packages } from "./packages";

const base = packages.find((p) => p.slug === "annapurna-circuit")!;

export const annapurnaDetail: PackageDetail = {
  ...base,
  longDescription:
    "The Annapurna Circuit is the trek that taught the world to love Nepal. Over twelve days you'll trace a hand-cut trail from sub-tropical rice terraces to a windswept 5,416m pass, sleeping in stone teahouses where the same family has cooked dal bhat for four generations. The Circuit is a transect through three climates and a dozen ethnic groups — Gurung herders, Manangi traders, Tibetan refugees — each with their own gods, festivals, and ways of brewing tea.",
  pullQuote:
    "It is not the mountains we conquer but ourselves. — Edmund Hillary",
  galleryImages: [
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=1600&q=80",
  ],
  itinerary: [
    {
      day: 1,
      title: "Arrive Kathmandu",
      description:
        "Touch down at Tribhuvan, transfer to Thamel. Pre-trek briefing and gear check. Dinner overlooking Boudhanath stupa.",
      altitude: 1400,
      meals: "D",
      accommodation: "Hotel Shanker (or similar)",
      activities: ["Airport pickup", "Gear check", "Welcome dinner"],
    },
    {
      day: 2,
      title: "Drive to Besisahar → Chame",
      description:
        "Early start by private jeep along the Marsyangdi. Roadside waterfalls, suspension bridges, our first views of Manaslu.",
      altitude: 2670,
      meals: "B, L, D",
      accommodation: "Teahouse",
      activities: ["7hr scenic drive", "Trail orientation"],
    },
    {
      day: 3,
      title: "Chame → Upper Pisang",
      description:
        "First proper trek day. Pine forests open to the white wall of Annapurna II. Lunch at Dhukure Pokhari.",
      altitude: 3300,
      meals: "B, L, D",
      accommodation: "Teahouse",
      activities: ["6hr trek", "Apple orchard visit"],
    },
    {
      day: 4,
      title: "Upper Pisang → Manang",
      description:
        "The high route via Ghyaru — harder, slower, and worth every step for the view of Annapurna III's north face.",
      altitude: 3540,
      meals: "B, L, D",
      accommodation: "Teahouse",
      activities: ["7hr trek", "Monastery visit"],
    },
    {
      day: 5,
      title: "Acclimatisation in Manang",
      description:
        "Rest day with a climb to Gangapurna Lake. Afternoon altitude talk at the Himalayan Rescue Association.",
      altitude: 3540,
      meals: "B, L, D",
      accommodation: "Teahouse",
      activities: ["Day hike", "HRA talk", "Bakery break"],
    },
    {
      day: 6,
      title: "Manang → Yak Kharka",
      description:
        "Short day on purpose. We climb slow, hydrate hard, and watch yaks graze under Chulu peaks.",
      altitude: 4050,
      meals: "B, L, D",
      accommodation: "Teahouse",
      activities: ["4hr trek"],
    },
    {
      day: 7,
      title: "Yak Kharka → Thorong Phedi",
      description:
        "The world thins out. Last push to base camp of the pass. Early dinner, early sleep.",
      altitude: 4525,
      meals: "B, L, D",
      accommodation: "Teahouse",
      activities: ["4hr trek", "Pass briefing"],
    },
    {
      day: 8,
      title: "Cross Thorong La → Muktinath",
      description:
        "The big one. 4am start, head-torches, frozen breath. Six hours up to 5,416m, then a knee-burning descent into the Mustang rain shadow.",
      altitude: 3800,
      meals: "B, L, D",
      accommodation: "Teahouse",
      activities: ["10hr crossing", "Muktinath temple"],
    },
    {
      day: 9,
      title: "Muktinath → Marpha",
      description:
        "Drop into the Kali Gandaki gorge. Apple brandy in Marpha's whitewashed lanes.",
      altitude: 2670,
      meals: "B, L, D",
      accommodation: "Teahouse",
      activities: ["Jeep + walk", "Distillery visit"],
    },
    {
      day: 10,
      title: "Marpha → Tatopani → Pokhara",
      description:
        "Hot-spring soak in Tatopani, then transfer down to the lake city.",
      altitude: 820,
      meals: "B, L",
      accommodation: "Pokhara boutique hotel",
      activities: ["Hot springs", "Lakeside evening"],
    },
    {
      day: 11,
      title: "Pokhara → Kathmandu",
      description:
        "Sunrise at Sarangkot, scenic flight back to Kathmandu, free afternoon for shopping.",
      altitude: 1400,
      meals: "B",
      accommodation: "Hotel Shanker",
      activities: ["Sarangkot sunrise", "25min flight"],
    },
    {
      day: 12,
      title: "Departure",
      description: "Transfer to airport. Until next time.",
      altitude: 1400,
      meals: "B",
      accommodation: "—",
      activities: ["Airport drop"],
    },
  ],
  inclusions: [
    "All accommodation (3* hotels + teahouses)",
    "All meals on trek (B/L/D)",
    "Licensed English-speaking guide",
    "Porter (1 per 2 trekkers)",
    "All permits (ACAP + TIMS)",
    "Private transport in Nepal",
    "Domestic flight Pokhara → Kathmandu",
    "Sleeping bag + down jacket loan",
    "First-aid kit + pulse oximeter",
    "Welcome & farewell dinners",
  ],
  exclusions: [
    "International flights to Kathmandu",
    "Nepal visa fee (~$50)",
    "Personal travel insurance (mandatory)",
    "Lunch & dinner in Kathmandu/Pokhara",
    "Bottled drinks, hot showers on trek",
    "Tips for guides & porters",
    "Personal trekking gear",
    "Emergency evacuation costs",
  ],
  reviews: [
    {
      id: "r1",
      author: "Aanya Sharma",
      location: "Mumbai, India",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      date: "Oct 2025",
      title: "The pass at sunrise is worth every step",
      body: "I trained for six months and still cried at the top. Our guide Pemba paced us perfectly and the teahouses were warmer than expected. The Manang rest day was a masterstroke.",
      photos: [
        "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=600&q=80",
      ],
    },
    {
      id: "r2",
      author: "Marcus Lindqvist",
      location: "Stockholm, Sweden",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      date: "Apr 2025",
      title: "Logistics flawless, food surprisingly great",
      body: "The dal bhat at 4,500m hits different. Every transfer was on time, every permit pre-arranged. I'd book again tomorrow.",
    },
    {
      id: "r3",
      author: "Priya Iyer",
      location: "Bengaluru, India",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
      rating: 4,
      date: "Mar 2025",
      title: "Tough but transformative",
      body: "Day 8 broke me a little and rebuilt me. The team's altitude protocol is no joke — they pulled one trekker down and probably saved her trip.",
    },
    {
      id: "r4",
      author: "Daniel Okafor",
      location: "London, UK",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      rating: 5,
      date: "Nov 2024",
      title: "The high route via Ghyaru is unmissable",
      body: "Skip the low route. The view of Annapurna III from Ghyaru is the postcard you came for.",
    },
  ],
  ratingsBreakdown: [
    { stars: 5, pct: 82 },
    { stars: 4, pct: 14 },
    { stars: 3, pct: 3 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 0 },
  ],
  faqs: [
    {
      q: "How fit do I need to be?",
      a: "You should be comfortable walking 6–7 hours a day with a daypack, on consecutive days. Build a base of 3–4 months of hiking, cycling, or stair-climbing before you fly. We provide a 12-week training plan on booking.",
    },
    {
      q: "What about altitude sickness?",
      a: "Our itinerary follows the Himalayan Rescue Association's recommended acclimatisation profile, with a rest day in Manang at 3,540m. Every guide carries a pulse oximeter and a satellite phone, and we have a strict descend-if-in-doubt policy.",
    },
    {
      q: "Is travel insurance mandatory?",
      a: "Yes — and it must cover helicopter evacuation up to 6,000m. We can recommend providers. No insurance, no boarding the jeep.",
    },
    {
      q: "What's the food like on trek?",
      a: "Teahouses serve a familiar menu: dal bhat, fried rice, noodles, momos, porridge, eggs. Dal bhat is the safest bet — unlimited refills and made from local ingredients.",
    },
    {
      q: "Can I charge devices and get WiFi?",
      a: "Charging is available at most teahouses for a small fee (₹150–300/hour). WiFi exists but is slow and patchy above Manang. Buy an Ncell SIM in Kathmandu for the best coverage.",
    },
    {
      q: "What if I want to bail mid-trek?",
      a: "Jeep evacuation is possible from most villages up to Manang and from Muktinath onwards. Mid-trek exits are at the trekker's cost but our guide will arrange everything.",
    },
  ],
  journey: [
    { id: "s1", name: "Kathmandu", day: 1, activity: "Arrival & briefing", x: 0.62, y: 0.55 },
    { id: "s2", name: "Besisahar", day: 2, activity: "Drive in, trail start", x: 0.50, y: 0.50 },
    { id: "s3", name: "Manang", day: 4, activity: "Acclimatisation", x: 0.41, y: 0.39 },
    { id: "s4", name: "Thorong La Pass", day: 8, activity: "5,416m crossing", x: 0.36, y: 0.34 },
    { id: "s5", name: "Muktinath", day: 8, activity: "Sacred temple", x: 0.33, y: 0.32 },
    { id: "s6", name: "Pokhara", day: 10, activity: "Lakeside finish", x: 0.46, y: 0.55 },
  ],
};
