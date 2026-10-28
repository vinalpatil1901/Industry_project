export const MARKETPLACE_ITEMS_BY_CAREER = {
  ai_engineer: [
    {
      id: "book-ai-1",
      title: "Artificial Intelligence: A Modern Approach (4th Global Edition)",
      authors: "Stuart Russell & Peter Norvig (Pearson)",
      category: "Core Textbooks",
      careerTrack: "AI & Machine Learning Engineer",
      condition: "Like New (Minimal Pencil Notes)",
      conditionColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      secondHandPrice: 650,
      originalPrice: 2450,
      discount: "73% OFF",
      seller: {
        name: "Arjun Verma",
        campus: "IIT Bombay - 4th Year CSE",
        rating: 4.9,
        reviewsCount: 24,
        isVerified: true,
        avatarBg: "bg-blue-600"
      },
      pickup: "Hostel 14 Lobby or Campus Central Library",
      semester: "Sem 3 & 4 Core",
      highlight: "Includes handwritten summary cheat sheets for neural networks and A* search."
    },
    {
      id: "book-ai-2",
      title: "Deep Learning (Adaptive Computation and Machine Learning Series)",
      authors: "Ian Goodfellow, Yoshua Bengio, Aaron Courville (MIT Press)",
      category: "Specialized Deep Learning",
      careerTrack: "AI & Machine Learning Engineer",
      condition: "Very Good (Crisp Pages)",
      conditionColor: "bg-blue-50 text-blue-700 border-blue-200",
      secondHandPrice: 790,
      originalPrice: 3200,
      discount: "75% OFF",
      seller: {
        name: "Pooja Hegde",
        campus: "IIIT Hyderabad - M.Tech Research",
        rating: 5.0,
        reviewsCount: 16,
        isVerified: true,
        avatarBg: "bg-purple-600"
      },
      pickup: "Campus360 Automated Hub or Courier",
      semester: "Sem 5 Elective",
      highlight: "Regarded as the Bible of deep learning. No folded pages."
    },
    {
      id: "book-ai-3",
      title: "NVIDIA Jetson Nano Developer Kit & Edge AI Camera Module",
      authors: "Hardware Lab Kit (NVIDIA Embedded Systems)",
      category: "Hardware & Edge Computing Kit",
      careerTrack: "AI & Machine Learning Engineer",
      condition: "Gently Used (Fully Tested with 64GB MicroSD)",
      conditionColor: "bg-amber-50 text-amber-700 border-amber-200",
      secondHandPrice: 4800,
      originalPrice: 12500,
      discount: "62% OFF",
      seller: {
        name: "Devendra Rao",
        campus: "BITS Pilani - Robotics Society Lead",
        rating: 4.8,
        reviewsCount: 31,
        isVerified: true,
        avatarBg: "bg-emerald-600"
      },
      pickup: "BITS Robotics Lab pickup or Hand-to-Hand",
      semester: "Capstone Hardware Project",
      highlight: "Pre-installed with JetPack, PyTorch, TensorRT and camera connector cable."
    }
  ],

  cloud_fullstack_architect: [
    {
      id: "book-cs-1",
      title: "Designing Data-Intensive Applications (Reliable, Scalable Systems)",
      authors: "Martin Kleppmann (O'Reilly Media)",
      category: "Distributed Architecture",
      careerTrack: "Cloud & Full-Stack Systems Architect",
      condition: "Like New (Original Print)",
      conditionColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      secondHandPrice: 580,
      originalPrice: 1950,
      discount: "70% OFF",
      seller: {
        name: "Karan Mehta",
        campus: "IIT Delhi - Final Year CSE",
        rating: 4.9,
        reviewsCount: 29,
        isVerified: true,
        avatarBg: "bg-indigo-600"
      },
      pickup: "IIT Delhi SAC or Campus360 Locker #12",
      semester: "Distributed Systems Core",
      highlight: "Must-read book for system design interviews and distributed databases."
    },
    {
      id: "book-cs-2",
      title: "Operating Systems: Three Easy Pieces (OSTEP Hardcover Edition)",
      authors: "Remzi H. Arpaci-Dusseau & Andrea C. Arpaci-Dusseau",
      category: "Core Computer Science",
      careerTrack: "Cloud & Full-Stack Systems Architect",
      condition: "Gently Used (Highlighted Key Theorems)",
      conditionColor: "bg-blue-50 text-blue-700 border-blue-200",
      secondHandPrice: 420,
      originalPrice: 1600,
      discount: "74% OFF",
      seller: {
        name: "Sneha Nair",
        campus: "RVCE Bangalore - 3rd Year ISE",
        rating: 4.7,
        reviewsCount: 19,
        isVerified: true,
        avatarBg: "bg-teal-600"
      },
      pickup: "RVCE Department Quadrangle or Metro Gate",
      semester: "Sem 4 Core OS",
      highlight: "Complete with practice problem annotations and concurrency notes."
    },
    {
      id: "book-cs-3",
      title: "Clean Architecture: A Craftsman's Guide to Software Structure",
      authors: "Robert C. Martin ('Uncle Bob') (Prentice Hall)",
      category: "Software Engineering Best Practices",
      careerTrack: "Cloud & Full-Stack Systems Architect",
      condition: "Like New (Unmarked)",
      conditionColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      secondHandPrice: 490,
      originalPrice: 1750,
      discount: "72% OFF",
      seller: {
        name: "Rohan Gupta",
        campus: "TIET Patiala - Senior Software Lead",
        rating: 4.9,
        reviewsCount: 22,
        isVerified: true,
        avatarBg: "bg-blue-700"
      },
      pickup: "Hostel K Lounge or Speed Post",
      semester: "Software Engineering Capstone",
      highlight: "Vital for understanding solid design principles, modularity, and clean boundaries."
    }
  ],

  product_designer: [
    {
      id: "book-design-1",
      title: "The Design of Everyday Things (Revised & Expanded Edition)",
      authors: "Don Norman (Basic Books)",
      category: "Design Psychology & UX Foundations",
      careerTrack: "Product Designer & UX Strategist",
      condition: "Like New (Clean Spine)",
      conditionColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      secondHandPrice: 380,
      originalPrice: 1400,
      discount: "73% OFF",
      seller: {
        name: "Ananya Sen",
        campus: "NID Ahmedabad - Interaction Design 4th Year",
        rating: 5.0,
        reviewsCount: 27,
        isVerified: true,
        avatarBg: "bg-rose-600"
      },
      pickup: "NID Main Lawn or Campus360 Drop Box",
      semester: "Foundations of Human-Centered Design",
      highlight: "The holy grail of UX. Teaches affordances, signifiers, and mental models."
    },
    {
      id: "book-design-2",
      title: "About Face: The Essentials of Interaction Design (4th Edition)",
      authors: "Alan Cooper, Robert Reimann, David Cronin (Wiley)",
      category: "UX Methodology & Wireframing",
      careerTrack: "Product Designer & UX Strategist",
      condition: "Very Good (Sturdy Binding)",
      conditionColor: "bg-blue-50 text-blue-700 border-blue-200",
      secondHandPrice: 690,
      originalPrice: 2800,
      discount: "75% OFF",
      seller: {
        name: "Tarun Kashyap",
        campus: "IDC School of Design, IITB - M.Des",
        rating: 4.8,
        reviewsCount: 14,
        isVerified: true,
        avatarBg: "bg-violet-600"
      },
      pickup: "IDC Studio Reception or IITB Main Gate",
      semester: "Interaction Design Lab",
      highlight: "Covers persona creation, scenario modeling, and mobile interaction paradigms."
    },
    {
      id: "book-design-3",
      title: "Wacom Intuos Pro Graphics Tablet (Medium) with Pro Pen 2",
      authors: "Hardware Tool (Wacom Creative Gear)",
      category: "Design Hardware & Prototyping",
      careerTrack: "Product Designer & UX Strategist",
      condition: "Gently Used (Includes 6 Extra Replacement Nibs)",
      conditionColor: "bg-amber-50 text-amber-700 border-amber-200",
      secondHandPrice: 6200,
      originalPrice: 18500,
      discount: "66% OFF",
      seller: {
        name: "Meera Nair",
        campus: "Srishti Manipal - Creative Tech Lead",
        rating: 4.9,
        reviewsCount: 35,
        isVerified: true,
        avatarBg: "bg-pink-600"
      },
      pickup: "Srishti Campus Reception or Hand Delivery",
      semester: "Digital Sketching & UI Wireframing",
      highlight: "Flawless pressure sensitivity; perfect for digital sketching, wireframes, and concept art."
    }
  ],

  fintech_quant_analyst: [
    {
      id: "book-fin-1",
      title: "Options, Futures, and Other Derivatives (10th Global Edition)",
      authors: "John C. Hull (Pearson Prentice Hall)",
      category: "Financial Engineering & Derivatives",
      careerTrack: "FinTech Quantitative Analyst & Wealth Strategist",
      condition: "Like New (Original Hardcover)",
      conditionColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      secondHandPrice: 720,
      originalPrice: 2950,
      discount: "76% OFF",
      seller: {
        name: "Vikram Singhania",
        campus: "ISI Kolkata - MSQE Scholar",
        rating: 4.9,
        reviewsCount: 28,
        isVerified: true,
        avatarBg: "bg-emerald-700"
      },
      pickup: "ISI Kolkata Library or Secure Speed Post",
      semester: "Sem 3 Derivatives Modeling",
      highlight: "Known as the definitive guide to Black-Scholes, Greeks, and volatility surfaces."
    },
    {
      id: "book-fin-2",
      title: "Quantitative Finance: An Introduction to Financial Mathematics",
      authors: "Paul Wilmott (Wiley Finance)",
      category: "Quantitative Trading & Stochastic Calculus",
      careerTrack: "FinTech Quantitative Analyst & Wealth Strategist",
      condition: "Gently Used (Formula Book Included)",
      conditionColor: "bg-blue-50 text-blue-700 border-blue-200",
      secondHandPrice: 640,
      originalPrice: 2600,
      discount: "75% OFF",
      seller: {
        name: "Ishita Chopra",
        campus: "IIM Indore IPM - 4th Year Finance",
        rating: 5.0,
        reviewsCount: 18,
        isVerified: true,
        avatarBg: "bg-indigo-700"
      },
      pickup: "IIM Indore Campus Gate or Express Courier",
      semester: "Advanced Financial Analytics",
      highlight: "Includes practical Python code snippets and PDE numerical solver examples."
    },
    {
      id: "book-fin-3",
      title: "Texas Instruments BA II Plus Professional Financial Calculator",
      authors: "Approved for CFA & FRM Exams",
      category: "Financial Computing Tool",
      careerTrack: "FinTech Quantitative Analyst & Wealth Strategist",
      condition: "Mint Condition (Fresh Lithium Battery Installed)",
      conditionColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      secondHandPrice: 1800,
      originalPrice: 4200,
      discount: "57% OFF",
      seller: {
        name: "Abhinav Patel",
        campus: "NMIMS Mumbai - Final Year B.Sc Finance",
        rating: 4.8,
        reviewsCount: 42,
        isVerified: true,
        avatarBg: "bg-amber-700"
      },
      pickup: "NMIMS Building Desk or Mumbai Local Station",
      semester: "CFA Prep & Fixed Income Analysis",
      highlight: "Official exam-approved calculator with protective leather case."
    }
  ],

  biomedical_healthtech: [
    {
      id: "book-bio-1",
      title: "Biomedical Instrumentation: Technology and Applications",
      authors: "R.S. Khandpur (McGraw-Hill Education)",
      category: "Medical Devices & Instrumentation",
      careerTrack: "Biomedical Engineer & HealthTech Innovator",
      condition: "Like New (Clean & Unmarked)",
      conditionColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      secondHandPrice: 520,
      originalPrice: 1980,
      discount: "74% OFF",
      seller: {
        name: "Dr. Kavita Shenoy",
        campus: "AIIMS New Delhi - Clinical Research Fellow",
        rating: 5.0,
        reviewsCount: 22,
        isVerified: true,
        avatarBg: "bg-teal-700"
      },
      pickup: "AIIMS Research Block or Delhi Metro Station",
      semester: "Biosensors & Medical Telemetry",
      highlight: "In-depth circuit diagrams for ECG, EEG, dialysis, and MRI scanners."
    },
    {
      id: "book-bio-2",
      title: "Bioinformatics: Sequence and Genome Analysis (2nd Edition)",
      authors: "David W. Mount (Cold Spring Harbor Laboratory)",
      category: "Genomics & Computational Biology",
      careerTrack: "Biomedical Engineer & HealthTech Innovator",
      condition: "Very Good (No Loose Pages)",
      conditionColor: "bg-blue-50 text-blue-700 border-blue-200",
      secondHandPrice: 680,
      originalPrice: 2850,
      discount: "76% OFF",
      seller: {
        name: "Harsh Vardhan",
        campus: "COEP Pune - 4th Year Biomedical",
        rating: 4.8,
        reviewsCount: 15,
        isVerified: true,
        avatarBg: "bg-cyan-700"
      },
      pickup: "COEP Boat Club or Pune Station Handover",
      semester: "Genomics & Molecular Modeling",
      highlight: "Features BLAST algorithm breakdown, phylogenetic trees, and Hidden Markov Models."
    },
    {
      id: "book-bio-3",
      title: "Biomedical Sensor Prototyping Kit (ECG + Pulse Oximeter + EMG)",
      authors: "Custom Open-Source Bio-Amplifier Hardware",
      category: "Laboratory Hardware & Prototyping",
      careerTrack: "Biomedical Engineer & HealthTech Innovator",
      condition: "Gently Used (Pre-tested with Arduino Shield)",
      conditionColor: "bg-amber-50 text-amber-700 border-amber-200",
      secondHandPrice: 2100,
      originalPrice: 5800,
      discount: "64% OFF",
      seller: {
        name: "Praveen Kumar",
        campus: "MAHE Manipal - Biomedical Lab Captain",
        rating: 4.9,
        reviewsCount: 29,
        isVerified: true,
        avatarBg: "bg-emerald-600"
      },
      pickup: "Manipal Tech Quad or Speed Post",
      semester: "Capstone Hardware Project",
      highlight: "Includes Ag/AgCl disposable electrode patches and shielded lead wires."
    }
  ],

  startup_founder_tech: [
    {
      id: "book-startup-1",
      title: "The Lean Startup & Zero to One: Founder Double Pack",
      authors: "Eric Ries & Peter Thiel (Crown Business / Currency)",
      category: "Venture Ideation & PMF",
      careerTrack: "Venture Founder & Tech Entrepreneur",
      condition: "Like New (Both Books Bundled)",
      conditionColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      secondHandPrice: 460,
      originalPrice: 1798,
      discount: "74% OFF",
      seller: {
        name: "Sahil Agrawal",
        campus: "IIT Madras - E-Cell Core Leader",
        rating: 4.9,
        reviewsCount: 38,
        isVerified: true,
        avatarBg: "bg-blue-600"
      },
      pickup: "IIT Madras Research Park or Campus Gate",
      semester: "Venture Ideation & Strategy",
      highlight: "Contains underlined insights on MVP validation, network effects, and monopoly creation."
    },
    {
      id: "book-startup-2",
      title: "Venture Deals: Be Smarter Than Your Lawyer and Venture Capitalist",
      authors: "Brad Feld & Jason Mendelson (Wiley)",
      category: "Fundraising & Term Sheets",
      careerTrack: "Venture Founder & Tech Entrepreneur",
      condition: "Very Good (Includes Term Sheet Annotations)",
      conditionColor: "bg-blue-50 text-blue-700 border-blue-200",
      secondHandPrice: 520,
      originalPrice: 2100,
      discount: "75% OFF",
      seller: {
        name: "Ritika Sharma",
        campus: "Ashoka University - Young India Fellow",
        rating: 5.0,
        reviewsCount: 20,
        isVerified: true,
        avatarBg: "bg-violet-700"
      },
      pickup: "Ashoka Campus Hub or Delhi South Extension",
      semester: "Venture Financing & Governance",
      highlight: "Demystifies liquidation preferences, anti-dilution clauses, and board seats."
    },
    {
      id: "book-startup-3",
      title: "The Hard Thing About Hard Things: Building a Business When There Are No Easy Answers",
      authors: "Ben Horowitz (Andreessen Horowitz) (HarperBusiness)",
      category: "Executive Leadership & Crisis Management",
      careerTrack: "Venture Founder & Tech Entrepreneur",
      condition: "Like New (Crisp Copy)",
      conditionColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      secondHandPrice: 390,
      originalPrice: 1499,
      discount: "74% OFF",
      seller: {
        name: "Kabir Sengupta",
        campus: "Plaksha University - Startup Incubator Fellow",
        rating: 4.8,
        reviewsCount: 17,
        isVerified: true,
        avatarBg: "bg-amber-600"
      },
      pickup: "Plaksha Innovation Hub or Direct Handover",
      semester: "Scale-up Operations & Culture",
      highlight: "Raw, practical management advice from a legendary Silicon Valley tech founder."
    }
  ]
};
