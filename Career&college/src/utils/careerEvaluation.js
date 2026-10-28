export function evaluateCareers(formData) {
  const {
    qualification = "",
    marksPercentage = 75,
    stream = "",
    primaryInterest = "",
    secondaryInterest = "",
    favoriteSubjects = "",
    coreAptitude = "",
    hobbies = "",
    passion = "",
    lifeGoals = "",
    freeTimeActivity = "",
    workEnvironment = "",
    careerMotive = "",
    preferredLearningStyle = "",
    futurePath = "Job"
  } = formData;

  // Aggregate user text for comprehensive semantic matching
  const combinedText = `
    ${qualification} ${stream} ${primaryInterest} ${secondaryInterest} 
    ${favoriteSubjects} ${coreAptitude} ${hobbies} ${passion} 
    ${lifeGoals} ${freeTimeActivity} ${workEnvironment} ${careerMotive} 
    ${preferredLearningStyle} ${futurePath}
  `.toLowerCase();

  // Full 10-Career Catalog
  const careerCatalog = [
    {
      id: "ai_engineer",
      title: "AI & Machine Learning Engineer",
      trackKey: "ai",
      description: "Architect intelligent neural algorithms, generative AI models, deep learning pipelines, and autonomous cognitive systems for high-impact applications in enterprise software, robotics, and cloud platforms.",
      matchWhy: "Exceptional synergy with your analytical curiosity, interest in artificial intelligence, and strong mathematical foundations.",
      baseScore: 72,
      keywords: ["ai", "machine learning", "neural", "deep learning", "python", "data", "math", "algorithms", "robotics", "analytics", "research"],
      requiredSkills: [
        "Python & PyTorch / TensorFlow",
        "Deep Neural Networks & Transformers",
        "Linear Algebra & Statistical Modeling",
        "Vector Databases & LLM Orchestration",
        "Algorithmic Problem-Solving"
      ],
      futurePathFit: futurePath === "Higher Studies" ? 15 : futurePath === "Job" ? 12 : 8
    },
    {
      id: "cloud_systems_architect",
      title: "Cloud Systems & Full-Stack Architect",
      trackKey: "cloud",
      description: "Design and construct resilient, high-concurrency cloud infrastructure, fault-tolerant microservices, and modern web application platforms capable of serving millions of concurrent global requests.",
      matchWhy: "Directly rewards your hands-on building drive, passion for real-world software creation, and focus on practical engineering architectures.",
      baseScore: 70,
      keywords: ["cloud", "web", "software", "full-stack", "coding", "programming", "react", "systems", "microservices", "developer", "aws", "docker"],
      requiredSkills: [
        "React, Next.js & TypeScript Architecture",
        "Cloud Infrastructure (AWS / GCP / Terraform)",
        "Distributed Databases & API Engineering",
        "Containerization (Docker & Kubernetes)",
        "System Design & Scalability Principles"
      ],
      futurePathFit: futurePath === "Job" ? 15 : futurePath === "Business" ? 12 : 8
    },
    {
      id: "cybersecurity_specialist",
      title: "Cybersecurity Architect & Threat Defense Specialist",
      trackKey: "tech",
      description: "Safeguard mission-critical enterprise systems, design zero-trust defensive networks, conduct advanced penetration tests, and analyze digital forensics against evolving nation-state cyber threats.",
      matchWhy: "Directly aligns with your affinity for network infrastructure, systematic troubleshooting, and ethical digital defense.",
      baseScore: 68,
      keywords: ["cybersecurity", "security", "hacking", "network", "ethical", "defense", "privacy", "cryptography", "firewalls", "forensics", "linux"],
      requiredSkills: [
        "Network Security & Penetration Testing",
        "Zero-Trust Architecture & IAM Governance",
        "Applied Cryptography & Secure Protocol Design",
        "Threat Intelligence & Incident Response",
        "Linux Kernel Security & Vulnerability Analysis"
      ],
      futurePathFit: futurePath === "Job" ? 15 : futurePath === "Higher Studies" ? 11 : 9
    },
    {
      id: "product_designer_ux",
      title: "Product Designer & UX Strategist",
      trackKey: "design",
      description: "Craft human-centered digital experiences, intuitive product workflows, design systems, and rapid interactive prototypes that elegantly bridge consumer psychology with modern engineering.",
      matchWhy: "Synthesizes your visual creativity, empathy, design sensibilities, and passion for elegant user-facing digital experiences.",
      baseScore: 66,
      keywords: ["design", "ui", "ux", "art", "creative", "figma", "visual", "mockups", "prototyping", "psychology", "user research", "interaction"],
      requiredSkills: [
        "Figma & Cross-Platform Design Systems",
        "User Research & Usability Heuristics",
        "Interactive Prototyping & Motion Design",
        "Human-Computer Interaction (HCI) Theory",
        "Visual Storytelling & Cross-Team Negotiation"
      ],
      futurePathFit: futurePath === "Job" ? 14 : futurePath === "Business" ? 12 : 8
    },
    {
      id: "fintech_quant_analyst",
      title: "FinTech Quantitative Analyst & Wealth Strategist",
      trackKey: "quant",
      description: "Develop algorithmic trading strategies, stochastic risk models, and automated investment frameworks across institutional capital markets, hedge funds, and decentralized fintech protocols.",
      matchWhy: "Leverages your sharp numerical dexterity, analytical rigor, interest in economic markets, and high earning ambition.",
      baseScore: 67,
      keywords: ["finance", "fintech", "stocks", "trading", "economics", "math", "statistics", "quant", "markets", "valuation", "money"],
      requiredSkills: [
        "Stochastic Calculus & Time-Series Econometrics",
        "Python / C++ for High-Performance Backtesting",
        "Financial Derivatives & Portfolio Optimization",
        "Algorithmic Risk Management (VaR / Monte Carlo)",
        "High-Stress Numerical Decision Making"
      ],
      futurePathFit: futurePath === "Job" ? 15 : futurePath === "Higher Studies" ? 12 : 9
    },
    {
      id: "data_scientist_bi",
      title: "Data Science & Business Intelligence Architect",
      trackKey: "tech",
      description: "Transform multi-terabyte enterprise data lakes into actionable strategic intelligence. Build predictive regression models, automated ETL data warehouses, and executive analytical dashboards.",
      matchWhy: "Capitalizes on your affinity for data-driven decisions, statistical analysis, and organizational business strategy.",
      baseScore: 66,
      keywords: ["data science", "data", "analytics", "sql", "tableau", "bi", "business intelligence", "statistics", "reporting", "insights"],
      requiredSkills: [
        "Advanced SQL & Data Lake Warehousing",
        "Python Data Science Stack (Pandas, Scikit-Learn)",
        "Statistical Hypothesis Testing & A/B Experiments",
        "Business Intelligence (PowerBI / Tableau)",
        "Executive Data Storytelling"
      ],
      futurePathFit: futurePath === "Job" ? 15 : futurePath === "Higher Studies" ? 12 : 8
    },
    {
      id: "venture_founder",
      title: "Tech Venture Founder & Product Leader",
      trackKey: "business",
      description: "Build, launch, and scale high-growth technology startups from zero to one. Drive product-market fit discovery, assemble multi-disciplinary talent, and lead institutional venture capital fundraising.",
      matchWhy: "Matches your ambitious entrepreneurial drive, high risk tolerance, charismatic team leadership, and hunger to build scalable ventures.",
      baseScore: 65,
      keywords: ["business", "startup", "founder", "entrepreneurship", "scaling", "management", "leadership", "venture", "strategy", "innovation"],
      requiredSkills: [
        "Product-Market Fit & Go-To-Market Execution",
        "Venture Capital Pitching & Investor Relations",
        "Unit Economics & Growth Funnel Optimization",
        "Lean MVP Prototyping & Agile Customer Loops",
        "Extreme Resilience & Crisis Management"
      ],
      futurePathFit: futurePath === "Business" ? 22 : 8
    },
    {
      id: "product_manager_tech",
      title: "Technical Product Manager & Innovation Lead",
      trackKey: "business",
      description: "Direct product roadmap strategy from ideation to release. Act as the vital bridge aligning customer pain points, software engineering feasibility, and business monetization goals.",
      matchWhy: "Directly rewards your holistic ability to synthesize user needs, technical architecture, and cross-functional team leadership.",
      baseScore: 65,
      keywords: ["product management", "pm", "roadmap", "agile", "strategy", "scrum", "leadership", "customer", "business", "tech"],
      requiredSkills: [
        "Product Discovery & User Journey Mapping",
        "Agile / Scrum Sprint Leadership & PRD Authoring",
        "Feature Prioritization Frameworks (RICE, MoSCoW)",
        "Data-Driven Product Analytics (Mixpanel, GA)",
        "Executive Stakeholder Alignment"
      ],
      futurePathFit: futurePath === "Job" ? 15 : futurePath === "Business" ? 13 : 8
    },
    {
      id: "biomedical_innovator",
      title: "Biomedical & HealthTech Innovator",
      trackKey: "biotech",
      description: "Innovate at the intersection of life sciences, wearable biosensors, and computation. Develop next-gen diagnostic devices, genomic data pipelines, and intelligent medical technology.",
      matchWhy: "Directly honors your interest in life sciences, healthcare breakthrough technology, and research-driven experimental discovery.",
      baseScore: 65,
      keywords: ["biology", "biotech", "medical", "health", "science", "medicine", "genomics", "clinical", "chemistry", "biosensors"],
      requiredSkills: [
        "Bioinformatics & Genomic Sequencing Tools",
        "Medical Device Design & Biosensors",
        "Clinical Data Science & Biostatistics",
        "FDA & ISO 13485 Regulatory Quality Protocols",
        "Scientific Lab Protocol Rigor"
      ],
      futurePathFit: futurePath === "Higher Studies" ? 18 : futurePath === "Job" ? 12 : 8
    },
    {
      id: "devops_sre_engineer",
      title: "DevOps & Site Reliability Engineer (SRE)",
      trackKey: "cloud",
      description: "Engineer fully automated CI/CD deployment pipelines, manage global multi-region cloud clusters, enforce infrastructure-as-code, and ensure 99.99% system uptime and resilience.",
      matchWhy: "Matches your focus on system efficiency, automation of repetitive tasks, and rock-solid platform reliability.",
      baseScore: 64,
      keywords: ["devops", "sre", "automation", "kubernetes", "linux", "cloud", "docker", "ci/cd", "infrastructure", "reliability"],
      requiredSkills: [
        "Infrastructure as Code (Terraform, Ansible)",
        "Kubernetes & Container Orchestration",
        "CI/CD Pipeline Automation (GitHub Actions, GitLab)",
        "Observability & Monitoring (Prometheus, Grafana)",
        "Linux Systems Administration & Shell Scripting"
      ],
      futurePathFit: futurePath === "Job" ? 15 : futurePath === "Business" ? 10 : 8
    }
  ];

  // Calculate matching scores across all 10 careers
  const scoredCareers = careerCatalog.map((career) => {
    let score = career.baseScore + career.futurePathFit;

    // Keyword matches from the multi-question text
    career.keywords.forEach((kw) => {
      if (combinedText.includes(kw)) {
        score += 6;
      }
    });

    // Score based on marks / performance
    const numMarks = parseFloat(marksPercentage) || 75;
    if (numMarks >= 85 && (career.trackKey === "ai" || career.trackKey === "quant" || career.trackKey === "biotech")) {
      score += 8;
    }

    return {
      ...career,
      computedScore: score
    };
  });

  // Sort descending by computed score
  scoredCareers.sort((a, b) => b.computedScore - a.computedScore);

  // Return all scored careers with properly normalized match percentages
  const allMatches = scoredCareers.map((item, index) => {
    let matchPercentage;
    if (index === 0) {
      matchPercentage = Math.min(98, Math.max(90, Math.round(88 + (item.computedScore / 190) * 10)));
    } else if (index === 1) {
      matchPercentage = Math.min(94, Math.max(85, Math.round(83 + (item.computedScore / 200) * 10)));
    } else if (index === 2) {
      matchPercentage = Math.min(89, Math.max(80, Math.round(78 + (item.computedScore / 210) * 10)));
    } else {
      matchPercentage = Math.min(84, Math.max(72, Math.round(76 - index * 1.5 + (item.computedScore / 240) * 8)));
    }

    return {
      id: item.id,
      title: item.title,
      trackKey: item.trackKey,
      matchPercentage,
      description: item.description,
      matchWhy: item.matchWhy,
      requiredSkills: item.requiredSkills
    };
  });

  return allMatches;
}
