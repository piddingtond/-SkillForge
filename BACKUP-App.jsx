import { useState, useMemo } from "react";
import { SKILLS, SUBJECTS, DIFFICULTIES, DIFF_COLOR, DIFF_BG, QUIZ_QUESTIONS, QUIZ_MAP } from "./skills-data";

function SkillCard({ skill, onSave, saved }) {
 return (
 <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: 8 }}>
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
 <p style={{ margin: 0, fontWeight: 500, fontSize: 15, lineHeight: 1.4, color: "var(--color-text-primary)" }}>{skill.name}</p>
 <button onClick={() => onSave(skill.id)} style={{ background: saved ? "#534AB7" : "transparent", border: saved ? "none" : "0.5px solid var(--color-border-secondary)", borderRadius: 6, padding: "2px 10px", fontSize: 12, cursor: "pointer", color: saved ? "#fff" : "var(--color-text-secondary)", whiteSpace: "nowrap", flexShrink: 0 }}>
 {saved ? "Saved" : "Save"}
 </button>
 </div>
 <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
 <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#EEEDFE", color: "#3C3489", fontWeight: 500 }}>{skill.subject}</span>
 <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: DIFF_BG[skill.difficulty], color: DIFF_COLOR[skill.difficulty], fontWeight: 500 }}>{skill.difficulty}</span>
 </div>
 <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>{skill.desc}</p>
 <p style={{ margin: 0, fontSize: 12, color: "#534AB7", fontWeight: 500 }}>Why it matters: {skill.why}</p>
 </div>
 );
}

export default function App() {
 const [tab, setTab] = useState("browse");
 const [search, setSearch] = useState("");
 const [subjectFilter, setSubjectFilter] = useState("All");
 const [diffFilter, setDiffFilter] = useState("All");
 const [saved, setSaved] = useState(new Set());
 const [quizStep, setQuizStep] = useState(0);
 const [quizAnswers, setQuizAnswers] = useState([]);
 const [quizResults, setQuizResults] = useState(null);

 const toggleSave = (id) => setSaved(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

 const filtered = useMemo(() => SKILLS.filter(s => {
 const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.subject.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase());
 const matchSubject = subjectFilter === "All" || s.subject === subjectFilter;
 const matchDiff = diffFilter === "All" || s.difficulty === diffFilter;
 return matchSearch && matchSubject && matchDiff;
 }), [search, subjectFilter, diffFilter]);

 const handleQuizAnswer = (ans) => {
 const next = [...quizAnswers, ans];
 if (quizStep < QUIZ_QUESTIONS.length - 1) {
 setQuizAnswers(next);
 setQuizStep(s => s + 1);
 } else {
 const subjects = new Set(); const diffs = new Set();
 next.forEach(a => { (QUIZ_MAP[a] || []).forEach(v => { if (["Beginner","Intermediate","Advanced"].includes(v)) diffs.add(v); else subjects.add(v); }); });
 let results = SKILLS.filter(s => subjects.has(s.subject) || (diffs.size > 0 && diffs.has(s.difficulty)));
 if (results.length === 0) results = SKILLS.slice(0, 4);
 setQuizResults(results.slice(0, 6));
 }
 };

 const resetQuiz = () => { setQuizStep(0); setQuizAnswers([]); setQuizResults(null); };

 const tabs = [{ id: "browse", label: "Browse" }, { id: "quiz", label: "Quiz" }, { id: "search", label: "Search" }, { id: "saved", label: `Saved (${saved.size})` }];

 return (
 <div style={{ fontFamily: "var(--font-sans)", maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem" }}>
 <h2 style={{ sr: "only", position: "absolute", opacity: 0, pointerEvents: "none" }}>OpenClaw Skill Finder — discover skills for your agent</h2>

 <div style={{ marginBottom: "1.5rem" }}>
 <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "#534AB7", textTransform: "uppercase" }}>OpenClaw</p>
 <h1 style={{ margin: 0, fontSize: 28, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.2 }}>Skill Finder</h1>
 <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--color-text-secondary)" }}>Discover powerful skills to level up your OpenClaw agent.</p>
 </div>

 <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem", borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: "1rem" }}>
 {tabs.map(t => (
 <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "6px 14px", borderRadius: 20, border: tab === t.id ? "none" : "0.5px solid var(--color-border-secondary)", background: tab === t.id ? "#534AB7" : "transparent", color: tab === t.id ? "#fff" : "var(--color-text-secondary)", fontSize: 13, fontWeight: tab === t.id ? 500 : 400, cursor: "pointer" }}>
 {t.label}
 </button>
 ))}
 </div>

 {tab === "browse" && (
 <div>
 <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
 <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} style={{ fontSize: 13, padding: "6px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", cursor: "pointer" }}>
 {SUBJECTS.map(s => <option key={s}>{s}</option>)}
 </select>
 <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} style={{ fontSize: 13, padding: "6px 10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", cursor: "pointer" }}>
 {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
 </select>
 <span style={{ fontSize: 12, color: "var(--color-text-secondary)", alignSelf: "center", marginLeft: 4 }}>{filtered.length} skill{filtered.length !== 1 ? "s" : ""}</span>
 </div>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
 {filtered.map(s => <SkillCard key={s.id} skill={s} onSave={toggleSave} saved={saved.has(s.id)} />)}
 </div>
 {filtered.length === 0 && <p style={{ color: "var(--color-text-secondary)", textAlign: "center", padding: "2rem 0" }}>No skills match those filters.</p>}
 </div>
 )}

 {tab === "quiz" && (
 <div style={{ maxWidth: 480 }}>
 {quizResults ? (
 <div>
 <div style={{ marginBottom: "1.25rem" }}>
 <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 500, color: "#1D9E75", textTransform: "uppercase", letterSpacing: "0.08em" }}>Your recommendations</p>
 <p style={{ margin: 0, fontSize: 22, fontWeight: 500, color: "var(--color-text-primary)" }}>Skills matched to your agent</p>
 </div>
 <div style={{ display: "grid", gap: 12, marginBottom: "1.5rem" }}>
 {quizResults.map(s => <SkillCard key={s.id} skill={s} onSave={toggleSave} saved={saved.has(s.id)} />)}
 </div>
 <button onClick={resetQuiz} style={{ padding: "8px 20px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-secondary)", fontSize: 13, cursor: "pointer" }}>Retake quiz</button>
 </div>
 ) : (
 <div>
 <div style={{ marginBottom: "1.25rem" }}>
 <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--color-text-secondary)" }}>Question {quizStep + 1} of {QUIZ_QUESTIONS.length}</p>
 <div style={{ height: 4, background: "var(--color-background-secondary)", borderRadius: 4, marginBottom: "1rem" }}>
 <div style={{ height: 4, background: "#534AB7", borderRadius: 4, width: `${((quizStep) / QUIZ_QUESTIONS.length) * 100}%`, transition: "width 0.3s" }} />
 </div>
 <p style={{ margin: 0, fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)", lineHeight: 1.4 }}>{QUIZ_QUESTIONS[quizStep].q}</p>
 </div>
 <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
 {QUIZ_QUESTIONS[quizStep].options.map(opt => (
 <button key={opt} onClick={() => handleQuizAnswer(opt)} style={{ textAlign: "left", padding: "12px 16px", borderRadius: 10, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 14, cursor: "pointer", transition: "border-color 0.15s" }}
 onMouseEnter={e => e.currentTarget.style.borderColor = "#534AB7"}
 onMouseLeave={e => e.currentTarget.style.borderColor = ""}>
 {opt}
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 )}

 {tab === "search" && (
 <div>
 <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills, subjects, keywords..." style={{ width: "100%", fontSize: 15, padding: "10px 14px", borderRadius: 10, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", marginBottom: "1rem", boxSizing: "border-box" }} autoFocus />
 {search.length > 0 && (
 <div>
 <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-secondary)" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"</p>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
 {filtered.map(s => <SkillCard key={s.id} skill={s} onSave={toggleSave} saved={saved.has(s.id)} />)}
 </div>
 {filtered.length === 0 && <p style={{ color: "var(--color-text-secondary)" }}>No skills found. Try a different keyword.</p>}
 </div>
 )}
 {search.length === 0 && (
 <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Start typing to search across all {SKILLS.length} OpenClaw skills.</p>
 )}
 </div>
 )}

 {tab === "saved" && (
 <div>
 {saved.size === 0 ? (
 <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--color-text-secondary)" }}>
 <p style={{ fontSize: 16, margin: "0 0 6px" }}>No saved skills yet.</p>
 <p style={{ fontSize: 13, margin: 0 }}>Browse or search skills and hit Save to build your list.</p>
 </div>
 ) : (
 <div>
 <p style={{ margin: "0 0 1rem", fontSize: 13, color: "var(--color-text-secondary)" }}>{saved.size} skill{saved.size !== 1 ? "s" : ""} saved to your agent's list.</p>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
 {SKILLS.filter(s => saved.has(s.id)).map(s => <SkillCard key={s.id} skill={s} onSave={toggleSave} saved={true} />)}
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 );
}
