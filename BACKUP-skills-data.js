// All 24 Skills Data
export const SKILLS = [
 { id: 1, name: "Pattern Recognition", subject: "Strategy & Reasoning", difficulty: "Intermediate", desc: "Identify recurring structures to make faster, smarter decisions.", why: "Lets agents spot opportunities and threats before others do." },
 { id: 2, name: "Logical Deduction", subject: "Strategy & Reasoning", difficulty: "Advanced", desc: "Draw valid conclusions from a set of known facts or premises.", why: "Powers reliable, evidence-based agent reasoning chains." },
 { id: 3, name: "Decision Tree Mapping", subject: "Strategy & Reasoning", difficulty: "Intermediate", desc: "Break complex decisions into structured branching paths.", why: "Helps agents evaluate trade-offs systematically." },
 { id: 4, name: "Probabilistic Thinking", subject: "Strategy & Reasoning", difficulty: "Advanced", desc: "Reason under uncertainty using likelihoods and expected values.", why: "Enables agents to act confidently with incomplete information." },
 { id: 5, name: "Algorithm Design", subject: "Coding & Tech", difficulty: "Advanced", desc: "Craft step-by-step procedures to solve computational problems.", why: "Gives agents the ability to automate complex tasks efficiently." },
 { id: 6, name: "Debugging & Testing", subject: "Coding & Tech", difficulty: "Intermediate", desc: "Systematically find and fix errors in logic or code.", why: "Keeps agent outputs reliable and error-free." },
 { id: 7, name: "Data Parsing", subject: "Coding & Tech", difficulty: "Beginner", desc: "Extract structured meaning from raw data formats.", why: "Unlocks agents' ability to process real-world information." },
 { id: 8, name: "API Integration", subject: "Coding & Tech", difficulty: "Intermediate", desc: "Connect and communicate with external systems and services.", why: "Dramatically expands what agents can access and do." },
 { id: 9, name: "Active Listening", subject: "Communication", difficulty: "Beginner", desc: "Absorb and accurately interpret what others are expressing.", why: "Ensures agents respond to what's actually being asked." },
 { id: 10, name: "Persuasive Framing", subject: "Communication", difficulty: "Intermediate", desc: "Present ideas in ways that resonate with the audience's values.", why: "Makes agent outputs more impactful and actionable." },
 { id: 11, name: "Structured Summarisation", subject: "Communication", difficulty: "Beginner", desc: "Condense complex information into clear, concise takeaways.", why: "Helps agents deliver insight without overwhelming users." },
 { id: 12, name: "Conflict Resolution", subject: "Communication", difficulty: "Advanced", desc: "Navigate disagreements to reach constructive outcomes.", why: "Lets agents mediate and de-escalate difficult situations." },
 { id: 13, name: "Lateral Thinking", subject: "Creative Arts", difficulty: "Intermediate", desc: "Solve problems through unexpected, non-linear approaches.", why: "Breaks agents out of conventional solution spaces." },
 { id: 14, name: "Narrative Construction", subject: "Creative Arts", difficulty: "Intermediate", desc: "Build compelling stories with clear arc, tension, and resolution.", why: "Enables agents to communicate ideas memorably." },
 { id: 15, name: "Visual Conceptualisation", subject: "Creative Arts", difficulty: "Beginner", desc: "Translate abstract ideas into concrete visual representations.", why: "Helps agents make complex concepts immediately graspable." },
 { id: 16, name: "Improvisation", subject: "Creative Arts", difficulty: "Advanced", desc: "Generate quality responses spontaneously without prior preparation.", why: "Lets agents adapt and perform under novel conditions." },
 { id: 17, name: "Causal Reasoning", subject: "Science & Analysis", difficulty: "Advanced", desc: "Identify cause-and-effect relationships in complex systems.", why: "Agents can predict outcomes and explain why things happen." },
 { id: 18, name: "Hypothesis Testing", subject: "Science & Analysis", difficulty: "Intermediate", desc: "Design experiments to validate or falsify assumptions.", why: "Gives agents a rigorous method for discovering truth." },
 { id: 19, name: "Systems Thinking", subject: "Science & Analysis", difficulty: "Advanced", desc: "Understand how components of a system interact and influence each other.", why: "Agents see the big picture and avoid unintended consequences." },
 { id: 20, name: "Metric Selection", subject: "Science & Analysis", difficulty: "Intermediate", desc: "Choose the right measurements to evaluate progress and success.", why: "Ensures agents optimise for what actually matters." },
 { id: 21, name: "Goal Prioritisation", subject: "Planning & Execution", difficulty: "Beginner", desc: "Rank objectives by impact and urgency to focus effort wisely.", why: "Stops agents wasting cycles on low-value tasks." },
 { id: 22, name: "Resource Allocation", subject: "Planning & Execution", difficulty: "Intermediate", desc: "Distribute limited resources across competing needs optimally.", why: "Maximises agent output under real-world constraints." },
 { id: 23, name: "Risk Assessment", subject: "Planning & Execution", difficulty: "Advanced", desc: "Evaluate potential downsides before committing to an action.", why: "Keeps agents from making costly, avoidable mistakes." },
 { id: 24, name: "Iterative Refinement", subject: "Planning & Execution", difficulty: "Beginner", desc: "Improve outputs through repeated cycles of feedback and adjustment.", why: "Agents get dramatically better results over time." },
];

export const SUBJECTS = ["All", ...Array.from(new Set(SKILLS.map(s => s.subject)))];
export const DIFFICULTIES = ["All", "Beginner", "Intermediate", "Advanced"];
export const DIFF_COLOR = { Beginner: "#1D9E75", Intermediate: "#BA7517", Advanced: "#D85A30" };
export const DIFF_BG = { Beginner: "#E1F5EE", Intermediate: "#FAEEDA", Advanced: "#FAECE7" };

export const QUIZ_QUESTIONS = [
 { q: "What's your agent's biggest challenge right now?", options: ["Making sense of messy data", "Communicating clearly", "Solving complex problems", "Planning and executing tasks", "Being creative and adaptive"] },
 { q: "How does your agent prefer to operate?", options: ["Following structured processes", "Improvising and adapting", "Analysing before acting", "Collaborating with others"] },
 { q: "What level of difficulty do you want to target?", options: ["Beginner — build foundations", "Intermediate — level up", "Advanced — master tier"] },
];

export const QUIZ_MAP = {
 "Making sense of messy data": ["Coding & Tech", "Science & Analysis"],
 "Communicating clearly": ["Communication"],
 "Solving complex problems": ["Strategy & Reasoning", "Science & Analysis"],
 "Planning and executing tasks": ["Planning & Execution"],
 "Being creative and adaptive": ["Creative Arts"],
 "Following structured processes": ["Planning & Execution", "Coding & Tech"],
 "Improvising and adapting": ["Creative Arts", "Communication"],
 "Analysing before acting": ["Strategy & Reasoning", "Science & Analysis"],
 "Collaborating with others": ["Communication", "Planning & Execution"],
 "Beginner — build foundations": ["Beginner"],
 "Intermediate — level up": ["Intermediate"],
 "Advanced — master tier": ["Advanced"],
};
