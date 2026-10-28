import { CAREER_PROFILES } from '../data/careerData';
import { COLLEGES_BY_CAREER } from '../data/collegesData';
import { MARKETPLACE_ITEMS_BY_CAREER } from '../data/marketplaceData';

export function evaluateCareerRecommendations(surveyData) {
  // Initialize scores for all potential career profiles
  const scores = {
    ai_engineer: 0,
    cloud_fullstack_architect: 0,
    product_designer: 0,
    fintech_quant_analyst: 0,
    biomedical_healthtech: 0,
    startup_founder_tech: 0
  };

  const {
    stream = "",
    percentage = 80,
    academicStrengths = [],
    coreInterests = [],
    favoriteSubjects = [],
    workPreference = "",
    hobbies = [],
    freeTimeActivity = "",
    workEnvironment = "",
    pathSelection = "Job",
    learningStyle = "",
    expectedCompensation = ""
  } = surveyData;

  // 1. Academic Stream Evaluation
  if (stream.includes("Computer") || stream.includes("PCM")) {
    scores.ai_engineer += 25;
    scores.cloud_fullstack_architect += 25;
    scores.fintech_quant_analyst += 15;
  }
  if (stream.includes("Commerce") || stream.includes("Economics")) {
    scores.fintech_quant_analyst += 30;
    scores.startup_founder_tech += 20;
  }
  if (stream.includes("Design") || stream.includes("Arts") || stream.includes("Humanities")) {
    scores.product_designer += 30;
    scores.startup_founder_tech += 15;
  }
  if (stream.includes("Biology") || stream.includes("PCB") || stream.includes("Life")) {
    scores.biomedical_healthtech += 35;
  }

  // Academic percentage bonus
  const numericPercentage = Number(percentage) || 75;
  if (numericPercentage >= 85) {
    scores.ai_engineer += 10;
    scores.fintech_quant_analyst += 10;
    scores.biomedical_healthtech += 10;
  } else {
    scores.product_designer += 8;
    scores.startup_founder_tech += 8;
    scores.cloud_fullstack_architect += 8;
  }

  // Academic strengths
  academicStrengths.forEach((strength) => {
    if (strength.includes("Quantitative") || strength.includes("Logical")) {
      scores.ai_engineer += 8;
      scores.fintech_quant_analyst += 9;
      scores.cloud_fullstack_architect += 7;
    }
    if (strength.includes("Visual") || strength.includes("Creative")) {
      scores.product_designer += 12;
      scores.startup_founder_tech += 6;
    }
    if (strength.includes("Biology") || strength.includes("Scientific")) {
      scores.biomedical_healthtech += 12;
    }
    if (strength.includes("Communication") || strength.includes("Leadership")) {
      scores.startup_founder_tech += 12;
      scores.product_designer += 6;
    }
  });

  // 2. Core Interests & Favorite Subjects Evaluation
  coreInterests.forEach((interest) => {
    if (interest.includes("AI") || interest.includes("Machine Learning")) {
      scores.ai_engineer += 20;
    }
    if (interest.includes("Software") || interest.includes("Web") || interest.includes("Cloud")) {
      scores.cloud_fullstack_architect += 20;
    }
    if (interest.includes("Design") || interest.includes("UX") || interest.includes("UI")) {
      scores.product_designer += 22;
    }
    if (interest.includes("Finance") || interest.includes("Stock") || interest.includes("Economics")) {
      scores.fintech_quant_analyst += 22;
    }
    if (interest.includes("Biotech") || interest.includes("Medicine") || interest.includes("Healthcare")) {
      scores.biomedical_healthtech += 22;
    }
    if (interest.includes("Startup") || interest.includes("Business") || interest.includes("Entrepreneurship")) {
      scores.startup_founder_tech += 22;
    }
  });

  favoriteSubjects.forEach((sub) => {
    if (sub.includes("Computer") || sub.includes("Coding")) {
      scores.cloud_fullstack_architect += 10;
      scores.ai_engineer += 10;
    }
    if (sub.includes("Math") || sub.includes("Calculus")) {
      scores.ai_engineer += 10;
      scores.fintech_quant_analyst += 12;
    }
    if (sub.includes("Economics") || sub.includes("Accountancy")) {
      scores.fintech_quant_analyst += 12;
      scores.startup_founder_tech += 8;
    }
    if (sub.includes("Design") || sub.includes("Art")) {
      scores.product_designer += 14;
    }
    if (sub.includes("Biology") || sub.includes("Chemistry")) {
      scores.biomedical_healthtech += 14;
    }
    if (sub.includes("Business") || sub.includes("Management")) {
      scores.startup_founder_tech += 12;
    }
  });

  // Work Preference
  if (workPreference.includes("Hands-on") || workPreference.includes("building")) {
    scores.cloud_fullstack_architect += 12;
    scores.ai_engineer += 8;
  } else if (workPreference.includes("Analytical") || workPreference.includes("research")) {
    scores.ai_engineer += 12;
    scores.fintech_quant_analyst += 12;
    scores.biomedical_healthtech += 10;
  } else if (workPreference.includes("Visual") || workPreference.includes("creative")) {
    scores.product_designer += 16;
  } else if (workPreference.includes("Strategic") || workPreference.includes("decision")) {
    scores.startup_founder_tech += 16;
  }

  // 3. Passions & Lifestyle Evaluation
  hobbies.forEach((hobby) => {
    if (hobby.includes("Programming") || hobby.includes("Open Source")) {
      scores.cloud_fullstack_architect += 10;
      scores.ai_engineer += 8;
    }
    if (hobby.includes("Art") || hobby.includes("Figma") || hobby.includes("Content")) {
      scores.product_designer += 12;
    }
    if (hobby.includes("Trading") || hobby.includes("Crypto")) {
      scores.fintech_quant_analyst += 12;
    }
    if (hobby.includes("Reading") || hobby.includes("Case Studies")) {
      scores.startup_founder_tech += 8;
      scores.fintech_quant_analyst += 6;
    }
    if (hobby.includes("Robotics") || hobby.includes("Electronics")) {
      scores.ai_engineer += 8;
      scores.biomedical_healthtech += 8;
    }
    if (hobby.includes("Health") || hobby.includes("Volunteering")) {
      scores.biomedical_healthtech += 10;
    }
  });

  // Free time activity
  if (freeTimeActivity.includes("Hackathon") || freeTimeActivity.includes("projects")) {
    scores.cloud_fullstack_architect += 10;
    scores.ai_engineer += 8;
  } else if (freeTimeActivity.includes("UI mockups")) {
    scores.product_designer += 12;
  } else if (freeTimeActivity.includes("charts")) {
    scores.fintech_quant_analyst += 12;
  } else if (freeTimeActivity.includes("business")) {
    scores.startup_founder_tech += 14;
  } else if (freeTimeActivity.includes("experiments")) {
    scores.biomedical_healthtech += 12;
  }

  // Work Environment
  if (workEnvironment.includes("Startup")) {
    scores.startup_founder_tech += 10;
    scores.cloud_fullstack_architect += 8;
  } else if (workEnvironment.includes("Research")) {
    scores.ai_engineer += 10;
    scores.biomedical_healthtech += 12;
  } else if (workEnvironment.includes("Design Studio")) {
    scores.product_designer += 12;
  } else if (workEnvironment.includes("Corporate") || workEnvironment.includes("Hedge")) {
    scores.fintech_quant_analyst += 12;
  }

  // 4. Future Goals Evaluation
  if (pathSelection === "Business") {
    scores.startup_founder_tech += 24;
  } else if (pathSelection === "Higher Studies") {
    scores.biomedical_healthtech += 15;
    scores.ai_engineer += 12;
    scores.fintech_quant_analyst += 10;
  } else if (pathSelection === "Job") {
    scores.cloud_fullstack_architect += 14;
    scores.product_designer += 10;
    scores.ai_engineer += 10;
  }

  if (learningStyle.includes("Hands-on") || learningStyle.includes("Project")) {
    scores.cloud_fullstack_architect += 8;
    scores.product_designer += 8;
  } else if (learningStyle.includes("Theoretical") || learningStyle.includes("Research")) {
    scores.ai_engineer += 10;
    scores.biomedical_healthtech += 10;
  }

  if (expectedCompensation.includes("High") || expectedCompensation.includes("Maximum")) {
    scores.fintech_quant_analyst += 8;
    scores.ai_engineer += 8;
  } else if (expectedCompensation.includes("Equity") || expectedCompensation.includes("Uncapped")) {
    scores.startup_founder_tech += 12;
  }

  // Sort career keys by score descending
  const sortedCareers = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  const primaryCareerKey = sortedCareers[0] || "ai_engineer";
  const secondaryCareerKey = sortedCareers[1] || "cloud_fullstack_architect";
  const tertiaryCareerKey = sortedCareers[2] || "product_designer";

  // Calculate normalized compatibility percentage (scaled between 86% and 98% for realistic UX delight)
  const maxScore = scores[primaryCareerKey];
  const secondScore = scores[secondaryCareerKey];
  const thirdScore = scores[tertiaryCareerKey];

  const primaryMatchPercentage = Math.min(98, Math.max(88, Math.round(85 + (maxScore / 180) * 13)));
  const secondaryMatchPercentage = Math.min(primaryMatchPercentage - 3, Math.max(78, Math.round(primaryMatchPercentage * (secondScore / Math.max(1, maxScore)))));
  const tertiaryMatchPercentage = Math.min(secondaryMatchPercentage - 4, Math.max(72, Math.round(secondaryMatchPercentage * (thirdScore / Math.max(1, secondScore)))));

  // Detailed sub-scores
  const academicScore = Math.min(99, Math.round(86 + (numericPercentage / 100) * 12));
  const passionScore = Math.min(98, Math.round(88 + (hobbies.length * 2.2)));
  const marketGrowthScore = 96;

  // Retrieve matching details
  const primaryCareer = CAREER_PROFILES[primaryCareerKey] || CAREER_PROFILES.ai_engineer;
  const secondaryCareer = CAREER_PROFILES[secondaryCareerKey] || CAREER_PROFILES.cloud_fullstack_architect;
  const tertiaryCareer = CAREER_PROFILES[tertiaryCareerKey] || CAREER_PROFILES.product_designer;

  const topColleges = COLLEGES_BY_CAREER[primaryCareerKey] || COLLEGES_BY_CAREER.ai_engineer;
  const marketplaceItems = MARKETPLACE_ITEMS_BY_CAREER[primaryCareerKey] || MARKETPLACE_ITEMS_BY_CAREER.ai_engineer;

  return {
    primaryCareer,
    primaryMatchPercentage,
    scoresBreakdown: {
      academicScore,
      passionScore,
      marketGrowthScore
    },
    secondaryRecommendations: [
      {
        career: secondaryCareer,
        matchPercentage: secondaryMatchPercentage
      },
      {
        career: tertiaryCareer,
        matchPercentage: tertiaryMatchPercentage
      }
    ],
    topColleges,
    marketplaceItems,
    evaluatedAt: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    rawSurveyData: surveyData
  };
}
