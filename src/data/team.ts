export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  region: string;
  yearsExperience: number;
  languages: string[];
  photo: string;
  bio: string;
}

export const team: TeamMember[] = [
  {
    slug: "pemba-sherpa",
    name: "Pemba Sherpa",
    role: "Lead Mountain Guide",
    region: "Khumbu",
    yearsExperience: 18,
    languages: ["English", "Nepali", "Sherpa", "Hindi"],
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    bio: "Born in Khumjung, 60 minutes from Everest Base Camp. NMA-certified guide since 2007. Has summited Everest twice and led 140+ EBC treks. Trusted on every high-altitude departure.",
  },
  {
    slug: "kamala-tamang",
    name: "Kamala Tamang",
    role: "Cultural Programs Lead",
    region: "Kathmandu Valley",
    yearsExperience: 12,
    languages: ["English", "Nepali", "Newari", "Hindi"],
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80",
    bio: "Born in Bhaktapur. Trained as an art historian at Tribhuvan University. Designs every Kathmandu, Patan and Bandipur itinerary, with quiet access to courtyards most travelers never see.",
  },
  {
    slug: "tashi-gurung",
    name: "Tashi Gurung",
    role: "Senior Trek Guide",
    region: "Annapurna · Mustang",
    yearsExperience: 14,
    languages: ["English", "Nepali", "Gurung", "Tibetan"],
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
    bio: "From Ghandruk village. Speaks fluent Tibetan, opening doors in Mustang's monastery network. Has crossed Thorong La 47 times. Famous on every trip for the rest-day apple brandy ritual.",
  },
  {
    slug: "anish-rai",
    name: "Anish Rai",
    role: "Wildlife & Lowland Guide",
    region: "Chitwan · Bardia",
    yearsExperience: 9,
    languages: ["English", "Nepali", "Tharu", "Hindi"],
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    bio: "Naturalist-trained in Chitwan, formerly a ranger with the national park service. Knows every rhino corridor and tiger trail. Brings a quiet patience that turns 'looking for wildlife' into 'finding it'.",
  },
];

export const getTeamMember = (slug: string) => team.find((m) => m.slug === slug);
