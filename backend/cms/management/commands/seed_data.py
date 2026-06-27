"""
Seed the CMS with the initial Sangam Travels content.

This data was originally the source of truth (sangam-travel/src/data/*.ts on
the Next.js side) before the CMS existed; once seeded it's editable in the
Wagtail admin and the TS files were removed. Idempotent: safe to re-run.

Usage:
    python manage.py seed_data
    python manage.py seed_data --wipe   # delete existing pages first
"""

from __future__ import annotations

import datetime
from typing import Any

from django.core.management.base import BaseCommand
from django.db import transaction
from wagtail.models import Page, Site

from cms.models import (
    BlogIndexPage,
    BlogParagraph,
    BlogPostPage,
    ContactSettings,
    Exclusion,
    FAQItem,
    GalleryImage,
    HomePage,
    HomePageFeaturedPackage,
    HomePageStat,
    Inclusion,
    ItineraryDay,
    JourneyStop,
    PackageIndexPage,
    PackagePage,
    PackageReview,
    RatingsBreakdownRow,
    TeamMember,
    Testimonial,
)


# ---------------------------------------------------------------------------
# Initial content. Originally lifted byte-for-byte from the deleted
# sangam-travel/src/data/*.ts files; now lives here as the seed source.
# ---------------------------------------------------------------------------

PACKAGES: list[dict[str, Any]] = [
    {
        "slug": "everest-base-camp",
        "title": "Everest Base Camp Trek",
        "location": "Khumbu, Nepal",
        "category": "Trekking",
        "difficulty": "Challenging",
        "duration_days": 14,
        "group_size": "4–12",
        "rating": 4.9,
        "review_count": 312,
        "price_inr": 85000,
        "original_price_inr": 110000,
        "discount_pct": 23,
        "best_season": "Mar–May, Sep–Nov",
        "hero_image_url": "https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=1600&q=80",
        "short_description": "Walk in the footsteps of legends to the foot of the world's highest peak.",
    },
    {
        "slug": "annapurna-circuit",
        "title": "Annapurna Circuit",
        "location": "Annapurna, Nepal",
        "category": "Trekking",
        "difficulty": "Challenging",
        "duration_days": 12,
        "group_size": "4–10",
        "rating": 4.9,
        "review_count": 127,
        "price_inr": 65000,
        "original_price_inr": 85000,
        "discount_pct": 24,
        "best_season": "Mar–May, Oct–Nov",
        "hero_image_url": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=80",
        "short_description": "The classic Himalayan circuit — high passes, sacred temples, alpine lakes.",
    },
    {
        "slug": "kathmandu-heritage",
        "title": "Kathmandu Heritage Tour",
        "location": "Kathmandu Valley",
        "category": "Cultural",
        "difficulty": "Easy",
        "duration_days": 4,
        "group_size": "2–15",
        "rating": 4.7,
        "review_count": 198,
        "price_inr": 25000,
        "original_price_inr": 32000,
        "discount_pct": 22,
        "best_season": "Year-round",
        "hero_image_url": "https://images.unsplash.com/photo-1605640840605-14ac1855827b?auto=format&fit=crop&w=1600&q=80",
        "short_description": "Seven UNESCO sites, ancient courtyards, and the living history of the valley.",
    },
    {
        "slug": "pokhara-retreat",
        "title": "Pokhara Lakeside Retreat",
        "location": "Pokhara, Nepal",
        "category": "Leisure",
        "difficulty": "Easy",
        "duration_days": 5,
        "group_size": "2–8",
        "rating": 4.8,
        "review_count": 156,
        "price_inr": 35000,
        "original_price_inr": 42000,
        "discount_pct": 17,
        "best_season": "Sep–May",
        "hero_image_url": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80",
        "short_description": "Mirror-still lakes, paragliding above Phewa, and Annapurna at sunrise.",
    },
    {
        "slug": "chitwan-safari",
        "title": "Chitwan Jungle Safari",
        "location": "Chitwan National Park",
        "category": "Wildlife",
        "difficulty": "Easy",
        "duration_days": 4,
        "group_size": "2–10",
        "rating": 4.7,
        "review_count": 142,
        "price_inr": 45000,
        "original_price_inr": 55000,
        "discount_pct": 18,
        "best_season": "Oct–Mar",
        "hero_image_url": "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1600&q=80",
        "short_description": "One-horned rhinos, Bengal tigers, and the Tharu people's ancestral plains.",
    },
    {
        "slug": "lumbini-spiritual",
        "title": "Lumbini Spiritual Journey",
        "location": "Lumbini, Nepal",
        "category": "Spiritual",
        "difficulty": "Easy",
        "duration_days": 3,
        "group_size": "2–12",
        "rating": 4.8,
        "review_count": 89,
        "price_inr": 30000,
        "original_price_inr": 38000,
        "discount_pct": 21,
        "best_season": "Oct–Mar",
        "hero_image_url": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=80",
        "short_description": "The birthplace of the Buddha — meditation, monasteries, and Mayadevi temple.",
    },
    {
        "slug": "mustang-expedition",
        "title": "Mustang Valley Expedition",
        "location": "Upper Mustang",
        "category": "Adventure",
        "difficulty": "Challenging",
        "duration_days": 10,
        "group_size": "4–8",
        "rating": 4.9,
        "review_count": 76,
        "price_inr": 95000,
        "original_price_inr": 120000,
        "discount_pct": 21,
        "best_season": "May–Oct",
        "hero_image_url": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80",
        "short_description": "The forbidden kingdom — Tibetan plateau, sky caves, and walled Lo Manthang.",
    },
    {
        "slug": "langtang-trek",
        "title": "Langtang Valley Trek",
        "location": "Langtang National Park",
        "category": "Trekking",
        "difficulty": "Moderate",
        "duration_days": 8,
        "group_size": "4–10",
        "rating": 4.8,
        "review_count": 104,
        "price_inr": 55000,
        "original_price_inr": 68000,
        "discount_pct": 19,
        "best_season": "Mar–May, Sep–Dec",
        "hero_image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
        "short_description": "A quieter Himalayan walk through rhododendron forests and Tamang villages.",
    },
    {
        "slug": "bandipur-escape",
        "title": "Bandipur Cultural Escape",
        "location": "Bandipur, Tanahun",
        "category": "Cultural",
        "difficulty": "Easy",
        "duration_days": 3,
        "group_size": "2–10",
        "rating": 4.7,
        "review_count": 68,
        "price_inr": 28000,
        "original_price_inr": 35000,
        "discount_pct": 20,
        "best_season": "Year-round",
        "hero_image_url": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=80",
        "short_description": "A car-free Newari hilltop town — slate roofs, cobblestones, mountain panoramas.",
    },
]


ANNAPURNA_DETAIL = {
    "slug": "annapurna-circuit",
    "long_description": "The Annapurna Circuit is the trek that taught the world to love Nepal. Over twelve days you'll trace a hand-cut trail from sub-tropical rice terraces to a windswept 5,416m pass, sleeping in stone teahouses where the same family has cooked dal bhat for four generations. The Circuit is a transect through three climates and a dozen ethnic groups — Gurung herders, Manangi traders, Tibetan refugees — each with their own gods, festivals, and ways of brewing tea.",
    "pull_quote": "It is not the mountains we conquer but ourselves. — Edmund Hillary",
    "gallery_images": [
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
    "itinerary": [
        {"day": 1, "title": "Arrive Kathmandu", "description": "Touch down at Tribhuvan, transfer to Thamel. Pre-trek briefing and gear check. Dinner overlooking Boudhanath stupa.", "altitude": 1400, "meals": "D", "accommodation": "Hotel Shanker (or similar)", "activities": ["Airport pickup", "Gear check", "Welcome dinner"]},
        {"day": 2, "title": "Drive to Besisahar → Chame", "description": "Early start by private jeep along the Marsyangdi. Roadside waterfalls, suspension bridges, our first views of Manaslu.", "altitude": 2670, "meals": "B, L, D", "accommodation": "Teahouse", "activities": ["7hr scenic drive", "Trail orientation"]},
        {"day": 3, "title": "Chame → Upper Pisang", "description": "First proper trek day. Pine forests open to the white wall of Annapurna II. Lunch at Dhukure Pokhari.", "altitude": 3300, "meals": "B, L, D", "accommodation": "Teahouse", "activities": ["6hr trek", "Apple orchard visit"]},
        {"day": 4, "title": "Upper Pisang → Manang", "description": "The high route via Ghyaru — harder, slower, and worth every step for the view of Annapurna III's north face.", "altitude": 3540, "meals": "B, L, D", "accommodation": "Teahouse", "activities": ["7hr trek", "Monastery visit"]},
        {"day": 5, "title": "Acclimatisation in Manang", "description": "Rest day with a climb to Gangapurna Lake. Afternoon altitude talk at the Himalayan Rescue Association.", "altitude": 3540, "meals": "B, L, D", "accommodation": "Teahouse", "activities": ["Day hike", "HRA talk", "Bakery break"]},
        {"day": 6, "title": "Manang → Yak Kharka", "description": "Short day on purpose. We climb slow, hydrate hard, and watch yaks graze under Chulu peaks.", "altitude": 4050, "meals": "B, L, D", "accommodation": "Teahouse", "activities": ["4hr trek"]},
        {"day": 7, "title": "Yak Kharka → Thorong Phedi", "description": "The world thins out. Last push to base camp of the pass. Early dinner, early sleep.", "altitude": 4525, "meals": "B, L, D", "accommodation": "Teahouse", "activities": ["4hr trek", "Pass briefing"]},
        {"day": 8, "title": "Cross Thorong La → Muktinath", "description": "The big one. 4am start, head-torches, frozen breath. Six hours up to 5,416m, then a knee-burning descent into the Mustang rain shadow.", "altitude": 3800, "meals": "B, L, D", "accommodation": "Teahouse", "activities": ["10hr crossing", "Muktinath temple"]},
        {"day": 9, "title": "Muktinath → Marpha", "description": "Drop into the Kali Gandaki gorge. Apple brandy in Marpha's whitewashed lanes.", "altitude": 2670, "meals": "B, L, D", "accommodation": "Teahouse", "activities": ["Jeep + walk", "Distillery visit"]},
        {"day": 10, "title": "Marpha → Tatopani → Pokhara", "description": "Hot-spring soak in Tatopani, then transfer down to the lake city.", "altitude": 820, "meals": "B, L", "accommodation": "Pokhara boutique hotel", "activities": ["Hot springs", "Lakeside evening"]},
        {"day": 11, "title": "Pokhara → Kathmandu", "description": "Sunrise at Sarangkot, scenic flight back to Kathmandu, free afternoon for shopping.", "altitude": 1400, "meals": "B", "accommodation": "Hotel Shanker", "activities": ["Sarangkot sunrise", "25min flight"]},
        {"day": 12, "title": "Departure", "description": "Transfer to airport. Until next time.", "altitude": 1400, "meals": "B", "accommodation": "—", "activities": ["Airport drop"]},
    ],
    "inclusions": [
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
    "exclusions": [
        "International flights to Kathmandu",
        "Nepal visa fee (~$50)",
        "Personal travel insurance (mandatory)",
        "Lunch & dinner in Kathmandu/Pokhara",
        "Bottled drinks, hot showers on trek",
        "Tips for guides & porters",
        "Personal trekking gear",
        "Emergency evacuation costs",
    ],
    "reviews": [
        {"review_id": "r1", "author": "Aanya Sharma", "location": "Mumbai, India", "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", "rating": 5, "date": "Oct 2025", "title": "The pass at sunrise is worth every step", "body": "I trained for six months and still cried at the top. Our guide Pemba paced us perfectly and the teahouses were warmer than expected. The Manang rest day was a masterstroke.", "photos": ["https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80", "https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=600&q=80"]},
        {"review_id": "r2", "author": "Marcus Lindqvist", "location": "Stockholm, Sweden", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", "rating": 5, "date": "Apr 2025", "title": "Logistics flawless, food surprisingly great", "body": "The dal bhat at 4,500m hits different. Every transfer was on time, every permit pre-arranged. I'd book again tomorrow.", "photos": []},
        {"review_id": "r3", "author": "Priya Iyer", "location": "Bengaluru, India", "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80", "rating": 4, "date": "Mar 2025", "title": "Tough but transformative", "body": "Day 8 broke me a little and rebuilt me. The team's altitude protocol is no joke — they pulled one trekker down and probably saved her trip.", "photos": []},
        {"review_id": "r4", "author": "Daniel Okafor", "location": "London, UK", "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", "rating": 5, "date": "Nov 2024", "title": "The high route via Ghyaru is unmissable", "body": "Skip the low route. The view of Annapurna III from Ghyaru is the postcard you came for.", "photos": []},
    ],
    "ratings_breakdown": [
        {"stars": 5, "pct": 82},
        {"stars": 4, "pct": 14},
        {"stars": 3, "pct": 3},
        {"stars": 2, "pct": 1},
        {"stars": 1, "pct": 0},
    ],
    "faqs": [
        {"question": "How fit do I need to be?", "answer": "You should be comfortable walking 6–7 hours a day with a daypack, on consecutive days. Build a base of 3–4 months of hiking, cycling, or stair-climbing before you fly. We provide a 12-week training plan on booking."},
        {"question": "What about altitude sickness?", "answer": "Our itinerary follows the Himalayan Rescue Association's recommended acclimatisation profile, with a rest day in Manang at 3,540m. Every guide carries a pulse oximeter and a satellite phone, and we have a strict descend-if-in-doubt policy."},
        {"question": "Is travel insurance mandatory?", "answer": "Yes — and it must cover helicopter evacuation up to 6,000m. We can recommend providers. No insurance, no boarding the jeep."},
        {"question": "What's the food like on trek?", "answer": "Teahouses serve a familiar menu: dal bhat, fried rice, noodles, momos, porridge, eggs. Dal bhat is the safest bet — unlimited refills and made from local ingredients."},
        {"question": "Can I charge devices and get WiFi?", "answer": "Charging is available at most teahouses for a small fee (₹150–300/hour). WiFi exists but is slow and patchy above Manang. Buy an Ncell SIM in Kathmandu for the best coverage."},
        {"question": "What if I want to bail mid-trek?", "answer": "Jeep evacuation is possible from most villages up to Manang and from Muktinath onwards. Mid-trek exits are at the trekker's cost but our guide will arrange everything."},
    ],
    "journey": [
        {"stop_id": "s1", "name": "Kathmandu",       "day": 1,  "activity": "Arrival & briefing",     "latitude": 27.7172, "longitude": 85.3240},
        {"stop_id": "s2", "name": "Besisahar",       "day": 2,  "activity": "Drive in, trail start",  "latitude": 28.2331, "longitude": 84.3833},
        {"stop_id": "s3", "name": "Manang",          "day": 4,  "activity": "Acclimatisation",        "latitude": 28.6667, "longitude": 84.0167},
        {"stop_id": "s4", "name": "Thorong La Pass", "day": 8,  "activity": "5,416m crossing",        "latitude": 28.7900, "longitude": 83.9437},
        {"stop_id": "s5", "name": "Muktinath",       "day": 8,  "activity": "Sacred temple",          "latitude": 28.8169, "longitude": 83.8717},
        {"stop_id": "s6", "name": "Pokhara",         "day": 10, "activity": "Lakeside finish",        "latitude": 28.2096, "longitude": 83.9856},
    ],
}


TEAM = [
    {"slug": "pemba-sherpa", "name": "Pemba Sherpa", "role": "Lead Mountain Guide", "region": "Khumbu", "years_experience": 18, "languages": ["English", "Nepali", "Sherpa", "Hindi"], "photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80", "bio": "Born in Khumjung, 60 minutes from Everest Base Camp. NMA-certified guide since 2007. Has summited Everest twice and led 140+ EBC treks. Trusted on every high-altitude departure."},
    {"slug": "kamala-tamang", "name": "Kamala Tamang", "role": "Cultural Programs Lead", "region": "Kathmandu Valley", "years_experience": 12, "languages": ["English", "Nepali", "Newari", "Hindi"], "photo_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80", "bio": "Born in Bhaktapur. Trained as an art historian at Tribhuvan University. Designs every Kathmandu, Patan and Bandipur itinerary, with quiet access to courtyards most travelers never see."},
    {"slug": "tashi-gurung", "name": "Tashi Gurung", "role": "Senior Trek Guide", "region": "Annapurna · Mustang", "years_experience": 14, "languages": ["English", "Nepali", "Gurung", "Tibetan"], "photo_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80", "bio": "From Ghandruk village. Speaks fluent Tibetan, opening doors in Mustang's monastery network. Has crossed Thorong La 47 times. Famous on every trip for the rest-day apple brandy ritual."},
    {"slug": "anish-rai", "name": "Anish Rai", "role": "Wildlife & Lowland Guide", "region": "Chitwan · Bardia", "years_experience": 9, "languages": ["English", "Nepali", "Tharu", "Hindi"], "photo_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80", "bio": "Naturalist-trained in Chitwan, formerly a ranger with the national park service. Knows every rhino corridor and tiger trail. Brings a quiet patience that turns 'looking for wildlife' into 'finding it'."},
]


TESTIMONIALS = [
    {"name": "Aanya Sharma", "location": "Mumbai, India", "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", "rating": 5, "quote": "Crossing Thorong La at sunrise is something I'll carry with me forever. Our guide Pemba turned a hard day into a sacred one.", "trip": "Annapurna Circuit"},
    {"name": "Marcus Lindqvist", "location": "Stockholm, Sweden", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", "rating": 5, "quote": "I've trekked in Patagonia and the Alps. Nothing prepared me for the scale of the Khumbu. Sangam Travels got every detail right.", "trip": "Everest Base Camp"},
    {"name": "Priya Iyer", "location": "Bengaluru, India", "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80", "rating": 5, "quote": "The cultural depth of the Kathmandu tour was unreal. Not a checklist — a conversation with a living city.", "trip": "Kathmandu Heritage Tour"},
    {"name": "Daniel Okafor", "location": "London, UK", "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", "rating": 5, "quote": "Spotted three rhinos and a sloth bear by sunrise. The Tharu homestay dinner was the real surprise.", "trip": "Chitwan Jungle Safari"},
    {"name": "Yuki Tanaka", "location": "Kyoto, Japan", "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80", "rating": 5, "quote": "Mustang felt like time travel. The sky caves at sunset are burned into my memory.", "trip": "Mustang Valley Expedition"},
    {"name": "Rohan Mehta", "location": "Delhi, India", "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80", "rating": 5, "quote": "Booked on a Tuesday, flying out Saturday. The team handled visas, permits, kit — everything.", "trip": "Langtang Valley Trek"},
]


BLOG_POSTS = [
    {
        "slug": "thorong-la-twelve-times",
        "title": "What I learned crossing Thorong La twelve times",
        "category": "Stories",
        "author_slug": "pemba-sherpa",
        "publish_date": datetime.date(2026, 5, 12),
        "reading_time": 7,
        "cover_image_url": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2000&q=80",
        "excerpt": "Twelve crossings of a 5,416 m pass teach you something the first one can't. Mostly: slow is faster, and the mountain is never the enemy.",
        "pull_quote": "The pass doesn't get smaller. You get smaller in a useful way.",
        "featured": True,
        "paragraphs": [
            "The first time I crossed Thorong La, I was nineteen and stubborn. I left Phedi too early, I drank too little, and by the chorten at the top I was leaning on my poles like an old man. The view didn't help. I had no breath to spend on it.",
            "Twelve crossings later, I have a different relationship with the pass. I no longer think of it as a thing to be conquered. I think of it as a clock — a 5,416 metre clock that measures how honestly I prepared for the week before. If you slept badly at Manang, the pass will tell you. If you skipped the rest-day hike to Gangapurna Lake, the pass will tell you. If you ate three plates of dal bhat at Yak Kharka, the pass will sometimes — generously — let you skip the lecture.",
            "Here's what I try to teach every group now. First, the day before is more important than the day of. Hydrate from the moment you arrive at Phedi. Eat carbohydrates you actually like; the wrong noodle soup at altitude is a tax. Sleep with your headlamp, water bottle and gloves inside your sleeping bag. The 3:45 am start is brutal for everyone, but the people who lose ten minutes hunting for a frozen mitten end up losing an hour.",
            "Second, walk slower than feels natural. The high pass isn't a feat of speed; it's a long, low-grade slog where heart rate management is everything. If you can't hold a conversation, you're going too fast. I tell newcomers: imagine you're trying not to wake a sleeping baby in your chest.",
            "Third, the descent is where injuries happen. By the time you crest the pass, you've been climbing for four hours. You're tired, the wind is sharp, and your blood sugar is on the floor. Eat something at the top — chocolate, a biscuit, anything — before you start the knee-grinding 1,600 metre descent to Muktinath. I have never met a trekker who regretted slowing down on the way down. I have met many who regretted not doing so.",
            "There's a moment, every time I cross, where I stop just past the prayer flags and look back at the line of small bright dots picking their way up the snow. It's the same vantage every year, but the dots are always different people. Some are euphoric, some are quiet, some are crying. Almost everyone is changed.",
            "That, in the end, is why I keep coming back. Not because the pass is a record to break — it is not — but because it's a kind of border. The people who walk back down from Thorong La are not the same people who walked up to it. After twelve crossings, I'm still learning what kind of border that is.",
        ],
    },
    {
        "slug": "quietest-week-bhaktapur",
        "title": "The quietest week in Bhaktapur",
        "category": "Culture",
        "author_slug": "kamala-tamang",
        "publish_date": datetime.date(2026, 4, 28),
        "reading_time": 5,
        "cover_image_url": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=2000&q=80",
        "excerpt": "Three days of monsoon rain and one Newari kitchen that doesn't close. A short essay on the city that taught me how to host travelers.",
        "pull_quote": "",
        "featured": False,
        "paragraphs": [
            "Most travelers come to Bhaktapur in October. I prefer the second week of August.",
            "In August the courtyards are empty. The rain has driven the bus tours to Pokhara and the festival crowds are still two months away. The stone squares glisten, the gargoyles drip, and the city sounds like a city again — pestles in mortars, copper smiths, distant temple bells.",
            "I grew up two streets from Dattatraya Square. My grandmother had a four-storey house with a kitchen on the top floor, the way most Newari homes were built, so the smoke and the cooking smell stayed out of the living rooms below. When it rained, the kitchen was the warmest room in the city.",
            "There is a small bhojanalaya — a Newari kitchen — that has been open since my mother was a girl. It does one thing well: samay baji, a platter of beaten rice, smoked buffalo, black soybeans, ginger, and a small cup of aila spirit distilled in the back. In August I take guests there at dusk, when the rain is loudest and the platter feels like the most honest meal in Nepal.",
            "If you come to Bhaktapur in the high season, the city will perform for you. If you come in the low season, it might let you sit at the edge of its life. The second is much rarer, and much more worth flying for.",
        ],
    },
    {
        "slug": "why-we-cap-groups-at-eight",
        "title": "Why we cap our trekking groups at eight",
        "category": "Stories",
        "author_slug": "pemba-sherpa",
        "publish_date": datetime.date(2026, 4, 14),
        "reading_time": 4,
        "cover_image_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80",
        "excerpt": "Most operators put 14–16 on a single guide. We've held the line at eight since 2018. Here's the maths — and the human reason.",
        "pull_quote": "",
        "featured": False,
        "paragraphs": [
            "Most agencies will quietly tell you eight is uneconomic. They're not wrong on a single trip. But over a season — and over a guide's career — eight is the only number that holds up.",
            "The maths first. At 14 trekkers per guide, you have roughly two minutes per person at each rest stop. That's enough time to check that someone is breathing, not enough to notice that they are breathing too fast. The early signs of acute mountain sickness — quiet withdrawal, mild confusion, slight loss of appetite — only show up when a guide knows what each person normally looks like. With eight, by day three, your guide knows your normal. With fourteen, by day three your guide knows your name.",
            "The human reason is simpler. Above 4,000 metres, the people having a hard time stop volunteering it. They don't want to slow the group, they don't want to embarrass themselves, they want to keep up. A group of eight notices. A group of fourteen does not.",
            "We cap at eight, we always will, and we are proud of how unspectacular that policy sounds.",
        ],
    },
    {
        "slug": "30-litre-packing-list",
        "title": "A packing list that fits in 30 litres",
        "category": "Tips",
        "author_slug": "tashi-gurung",
        "publish_date": datetime.date(2026, 3, 30),
        "reading_time": 6,
        "cover_image_url": "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=2000&q=80",
        "excerpt": "After a decade on the trail, I've stopped recommending the 65-litre pack. Here's what actually goes in mine for a twelve-day teahouse trek.",
        "pull_quote": "",
        "featured": False,
        "paragraphs": [
            "The single biggest mistake I see new trekkers make is overpacking. Not by a little — by a lot. The Annapurna Circuit is a teahouse trek; you'll sleep in stone lodges with warm blankets, eat hot meals every night, and have access to laundry at four villages along the route. You do not need to carry six days of clean shirts.",
            "What you actually need: two trekking shirts, one fleece, one waterproof shell, two pairs of trekking trousers (one zip-off), three pairs of merino socks, one set of thermal base layers, a down jacket, a beanie, gloves with liners, a sun hat, a headlamp, a 1L water bottle, a small toiletry kit, a small first-aid kit, your camera (if not a phone), and a paperback book. That's 30 litres comfortably.",
            "The porter system on the Circuit and the Khumbu means you don't carry the heavy bag during the day. You carry your daypack — water, snacks, raingear, camera, sunscreen — and the duffel comes to the next lodge by another route. So pack accordingly: your daypack is the bag you live out of, and it should weigh less than 5 kilograms.",
            "Lighter is faster. Lighter is happier. Lighter is the thing your knees thank you for on the descent into Muktinath.",
        ],
    },
    {
        "slug": "one-night-with-the-tharu",
        "title": "One night with the Tharu",
        "category": "Wildlife",
        "author_slug": "anish-rai",
        "publish_date": datetime.date(2026, 3, 12),
        "reading_time": 5,
        "cover_image_url": "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=2000&q=80",
        "excerpt": "Chitwan is famous for rhinos. The real reason I keep going back is a homestay dinner in a Tharu village on the park's edge.",
        "pull_quote": "",
        "featured": False,
        "paragraphs": [
            "The Tharu have lived in the Terai for centuries. They were one of the few groups historically immune to malaria, which is why they were the only people who could settle the dense lowland forests when everyone else was driven to higher ground. Their villages along Chitwan's border are mud-walled, fire-warmed, and beautiful.",
            "On every Chitwan trip we include one night at a Tharu homestay. The host family cooks dhindo — a stiff buckwheat porridge — and a fish curry made with mustard greens. After dinner, the kids do a stick dance in the courtyard, which I admit can sound touristy on paper. It isn't. The dance is a real harvest tradition, the kids are giggling, the parents are watching, and there are no buses parked outside.",
            "The next morning, we're up at 4:30 for a canoe ride down the Rapti. If you're lucky, a one-horned rhino is washing on the bank. If you're not, you still get the river in mist, gharial crocodiles on the sandbanks, and the slow understanding that the wildlife was always going to be a bonus.",
        ],
    },
    {
        "slug": "spring-vs-autumn",
        "title": "The quiet case for trekking in Spring",
        "category": "Trekking",
        "author_slug": "tashi-gurung",
        "publish_date": datetime.date(2026, 2, 24),
        "reading_time": 4,
        "cover_image_url": "https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=2000&q=80",
        "excerpt": "Autumn gets the bookings; Spring gets the rhododendrons. Why our guides quietly prefer March-May.",
        "pull_quote": "",
        "featured": False,
        "paragraphs": [
            "Ask a guidebook and it'll tell you Nepal has two trekking seasons: October–November (post-monsoon, clear skies) and March–May (pre-monsoon, warmer). Both are right. But Spring is where the conversation usually ends, when it should be where it begins.",
            "Spring trekking is slightly hazier — that's true. The post-monsoon clarity of October mornings is unmatched. But Spring brings the rhododendron forests into bloom: hillsides at 2,500–3,500 metres that turn red, pink and white through April. The Annapurna Sanctuary in particular is electric. Add in the fact that there are roughly 40% fewer trekkers on the trail and that lodges have full availability, and Spring becomes the season most of our guides quietly prefer to work in.",
            "Days are slightly longer, evenings slightly warmer, and the high passes that closed under snow in January are reopening one by one. If you can travel in either season, take Spring.",
        ],
    },
]


HOMEPAGE_STATS = [
    {"value": "12+", "label": "years guiding"},
    {"value": "4.9★", "label": "average rating"},
    {"value": "1,800+", "label": "trekkers hosted"},
    {"value": "100%", "label": "local-guided"},
]


FEATURED_PACKAGE_SLUGS = [
    "annapurna-circuit",
    "everest-base-camp",
    "kathmandu-heritage",
    "mustang-expedition",
]


# ---------------------------------------------------------------------------
# Command
# ---------------------------------------------------------------------------


class Command(BaseCommand):
    help = "Seed the CMS with the initial Sangam Travels content"

    def add_arguments(self, parser):
        parser.add_argument(
            "--wipe",
            action="store_true",
            help="Delete existing seeded pages and snippets first.",
        )

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts.get("wipe"):
            self._wipe()

        root = Page.objects.get(depth=1)
        home = self._create_home(root)
        self._fix_site(home)

        package_index = self._create_package_index(home)
        package_pages = {p["slug"]: self._create_package(package_index, p) for p in PACKAGES}

        # Annapurna detail body
        self._populate_package_detail(package_pages["annapurna-circuit"], ANNAPURNA_DETAIL)

        # Team must exist before blog posts (FK)
        team_by_slug = self._create_team()

        blog_index = self._create_blog_index(home)
        for post in BLOG_POSTS:
            self._create_blog_post(blog_index, post, team_by_slug)

        self._create_testimonials()
        self._populate_home_extras(home, package_pages)
        self._create_contact_settings(home)

        self.stdout.write(self.style.SUCCESS("Seed complete."))
        self.stdout.write(
            "  ▸ HomePage, PackageIndex, BlogIndex created"
            f"\n  ▸ {len(package_pages)} packages (annapurna-circuit has full detail body)"
            f"\n  ▸ {len(BLOG_POSTS)} blog posts"
            f"\n  ▸ {len(team_by_slug)} team members"
            f"\n  ▸ {len(TESTIMONIALS)} testimonials"
        )

    # ------------------------------------------------------------------
    # helpers
    # ------------------------------------------------------------------

    def _wipe(self):
        self.stdout.write("Wiping existing seeded content…")
        PackagePage.objects.all().delete()
        BlogPostPage.objects.all().delete()
        PackageIndexPage.objects.all().delete()
        BlogIndexPage.objects.all().delete()
        HomePage.objects.all().delete()
        TeamMember.objects.all().delete()
        Testimonial.objects.all().delete()

    def _create_home(self, root: Page) -> HomePage:
        existing = HomePage.objects.first()
        if existing:
            return existing
        # The Wagtail default "Welcome to Wagtail" page lives at slug 'home' under root.
        # Delete it before adding ours so the slug is free.
        for stub in root.get_children().filter(slug="home"):
            stub.specific.delete()
        root = Page.objects.get(pk=root.pk)  # treebeard caches numchild on instance
        home = HomePage(
            title="Sangam Travels",
            slug="home",
            hero_eyebrow="Nepal · Curated Journeys",
            hero_title="Where the Sky Begins",
            hero_subtitle="Curated journeys across Nepal's most sacred landscapes. Trekking, cultural and spiritual experiences led by lifelong local guides.",
            hero_image="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2400&q=80",
        )
        root.add_child(instance=home)
        home.save_revision().publish()
        return home

    def _fix_site(self, home: HomePage):
        # Point the default Wagtail Site at our HomePage instead of the auto-created "Welcome" page
        site = Site.objects.first()
        if site and site.root_page_id != home.id:
            old_root = site.root_page
            site.root_page = home
            site.site_name = "Sangam Travels"
            site.save()
            if old_root and old_root.slug != "home":
                try:
                    old_root.delete()
                except Exception:
                    pass

    def _create_package_index(self, home: HomePage) -> PackageIndexPage:
        existing = PackageIndexPage.objects.first()
        if existing:
            return existing
        idx = PackageIndexPage(title="Packages", slug="packages")
        home.add_child(instance=idx)
        idx.save_revision().publish()
        return idx

    def _create_blog_index(self, home: HomePage) -> BlogIndexPage:
        existing = BlogIndexPage.objects.first()
        if existing:
            return existing
        idx = BlogIndexPage(title="Field Notes", slug="blog")
        home.add_child(instance=idx)
        idx.save_revision().publish()
        return idx

    def _create_package(self, parent: PackageIndexPage, data: dict) -> PackagePage:
        existing = PackagePage.objects.filter(slug=data["slug"]).first()
        if existing:
            return existing
        page = PackagePage(
            title=data["title"],
            slug=data["slug"],
            location=data["location"],
            category=data["category"],
            difficulty=data["difficulty"],
            duration_days=data["duration_days"],
            group_size=data["group_size"],
            rating=data["rating"],
            review_count=data["review_count"],
            price_inr=data["price_inr"],
            original_price_inr=data["original_price_inr"],
            discount_pct=data["discount_pct"],
            best_season=data["best_season"],
            hero_image=data["hero_image_url"],
            short_description=data["short_description"],
        )
        parent.add_child(instance=page)
        page.save_revision().publish()
        return page

    def _populate_package_detail(self, page: PackagePage, detail: dict):
        page.long_description = detail["long_description"]
        page.pull_quote = detail["pull_quote"]
        page.save()

        # Clear and reload inlines
        page.itinerary_days.all().delete()
        for d in detail["itinerary"]:
            ItineraryDay.objects.create(page=page, **d)

        page.inclusions.all().delete()
        for text in detail["inclusions"]:
            Inclusion.objects.create(page=page, text=text)

        page.exclusions.all().delete()
        for text in detail["exclusions"]:
            Exclusion.objects.create(page=page, text=text)

        page.gallery_images.all().delete()
        for url in detail["gallery_images"]:
            GalleryImage.objects.create(page=page, image=url)

        page.journey_stops.all().delete()
        for j in detail["journey"]:
            JourneyStop.objects.create(page=page, **j)

        page.reviews.all().delete()
        for r in detail["reviews"]:
            r = {("avatar" if k == "avatar_url" else k): v for k, v in r.items()}
            PackageReview.objects.create(page=page, **r)

        page.ratings_breakdown.all().delete()
        for row in detail["ratings_breakdown"]:
            RatingsBreakdownRow.objects.create(page=page, **row)

        page.faqs.all().delete()
        for f in detail["faqs"]:
            FAQItem.objects.create(page=page, **f)

        page.save_revision().publish()

    def _create_team(self) -> dict[str, TeamMember]:
        out = {}
        for i, t in enumerate(TEAM):
            tm, _ = TeamMember.objects.update_or_create(
                slug=t["slug"],
                defaults={
                    "name": t["name"],
                    "role": t["role"],
                    "region": t["region"],
                    "years_experience": t["years_experience"],
                    "languages": t["languages"],
                    "photo": t["photo_url"],
                    "bio": t["bio"],
                    "sort_order": i,
                },
            )
            out[t["slug"]] = tm
        return out

    def _create_blog_post(self, parent: BlogIndexPage, data: dict, team: dict[str, TeamMember]):
        existing = BlogPostPage.objects.filter(slug=data["slug"]).first()
        if existing:
            return existing
        page = BlogPostPage(
            title=data["title"],
            slug=data["slug"],
            category=data["category"],
            author=team.get(data["author_slug"]),
            publish_date=data["publish_date"],
            reading_time=data["reading_time"],
            cover_image=data["cover_image_url"],
            excerpt=data["excerpt"],
            pull_quote=data["pull_quote"],
            featured=data["featured"],
        )
        parent.add_child(instance=page)
        for text in data["paragraphs"]:
            BlogParagraph.objects.create(page=page, text=text)
        page.save_revision().publish()
        return page

    def _create_testimonials(self):
        Testimonial.objects.all().delete()
        for i, t in enumerate(TESTIMONIALS):
            Testimonial.objects.create(
                name=t["name"],
                location=t["location"],
                avatar=t["avatar_url"],
                rating=t["rating"],
                quote=t["quote"],
                trip=t["trip"],
                sort_order=i,
            )

    def _populate_home_extras(self, home: HomePage, packages: dict[str, PackagePage]):
        home.stats.all().delete()
        for i, s in enumerate(HOMEPAGE_STATS):
            HomePageStat.objects.create(page=home, sort_order=i, value=s["value"], label=s["label"])

        home.featured_packages.all().delete()
        for i, slug in enumerate(FEATURED_PACKAGE_SLUGS):
            pkg = packages.get(slug)
            if pkg:
                HomePageFeaturedPackage.objects.create(page=home, sort_order=i, package=pkg)

        home.save_revision().publish()

    def _create_contact_settings(self, home: HomePage):
        site = Site.objects.first()
        if not site:
            return
        ContactSettings.objects.update_or_create(
            site=site,
            defaults={
                "business_name": "Sangam Travels",
                "email": "hello@sangamtravels.com",
                "phone": "+977 1 555 0123",
                "whatsapp": "+9779800000000",
                "address": "Thamel, Kathmandu, Nepal",
            },
        )
