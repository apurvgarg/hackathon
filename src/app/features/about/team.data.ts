export interface Member {
  name: string;
  linkedin: string;
  title: string;
  location: string;
  note: string;
  photo: string | null;
}

export const TEAM_NAME = 'SINEWAVE SYNDICATE';

export const TEAM_NOTE =
  'Three KIET computer science grads who kept building after graduation. AI retrieval, cloud infrastructure and simulation engineering, spread across Gurugram, Noida and Pune.';

export const TEAM: Member[] = [
  {
    name: 'Apurv Garg',
    linkedin: 'https://www.linkedin.com/in/apurv-garg-a8749616b/',
    title: 'AI Analyst — Prompt & Retrieval',
    location: 'Gurugram, Haryana',
    note: 'Ships agentic RAG on Azure OpenAI and PGVector, then keeps it honest with precision, recall and p90 latency instead of vibes.',
    photo: null,
  },
  {
    name: 'Unnati Tandon',
    linkedin: 'https://www.linkedin.com/in/unnati-tandon-1a3a30225/',
    title: 'Assistant Manager — DevOps',
    location: 'Noida, Uttar Pradesh',
    note: 'Linux, AWS, Docker and DevSecOps at telecom scale. The reason anything stays up on a Friday evening.',
    photo: null,
  },
  {
    name: 'Shruti Jain',
    linkedin: 'https://www.linkedin.com/in/shruti-jain-a41067206/',
    title: 'Software Engineer — ML',
    location: 'Pune, Maharashtra',
    note: 'Automated a full finite element analysis toolchain in Python and built a physics-informed neural net digital twin. NASA HERC 23.',
    photo: null,
  },
];
