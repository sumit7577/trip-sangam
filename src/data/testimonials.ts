export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  quote: string;
  trip: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Aanya Sharma",
    location: "Mumbai, India",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    quote:
      "Crossing Thorong La at sunrise is something I'll carry with me forever. Our guide Pemba turned a hard day into a sacred one.",
    trip: "Annapurna Circuit",
  },
  {
    id: "t2",
    name: "Marcus Lindqvist",
    location: "Stockholm, Sweden",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    quote:
      "I've trekked in Patagonia and the Alps. Nothing prepared me for the scale of the Khumbu. Sangam Trails got every detail right.",
    trip: "Everest Base Camp",
  },
  {
    id: "t3",
    name: "Priya Iyer",
    location: "Bengaluru, India",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    quote:
      "The cultural depth of the Kathmandu tour was unreal. Not a checklist — a conversation with a living city.",
    trip: "Kathmandu Heritage Tour",
  },
  {
    id: "t4",
    name: "Daniel Okafor",
    location: "London, UK",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    quote:
      "Spotted three rhinos and a sloth bear by sunrise. The Tharu homestay dinner was the real surprise.",
    trip: "Chitwan Jungle Safari",
  },
  {
    id: "t5",
    name: "Yuki Tanaka",
    location: "Kyoto, Japan",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    quote:
      "Mustang felt like time travel. The sky caves at sunset are burned into my memory.",
    trip: "Mustang Valley Expedition",
  },
  {
    id: "t6",
    name: "Rohan Mehta",
    location: "Delhi, India",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    quote:
      "Booked on a Tuesday, flying out Saturday. The team handled visas, permits, kit — everything.",
    trip: "Langtang Valley Trek",
  },
];
