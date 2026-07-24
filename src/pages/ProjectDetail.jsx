import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiArrowLeft, FiGithub, FiExternalLink, FiCheckCircle, FiCpu, 
  FiDatabase, FiLayers, FiList, FiTrendingUp, FiHelpCircle, FiBookOpen 
} from "react-icons/fi";
import portfolioData from "../data/data.json";
import SEO from "../components/seo/SEO";

// Custom inline parser for simple styles (**bold**, `code`, etc.)
const parseInline = (text) => {
  if (!text) return "";
  let parts = [{ type: "text", content: text }];

  // Parse bold: **text**
  parts = parts.flatMap((part) => {
    if (part.type !== "text") return part;
    const subparts = [];
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;
    while ((match = boldRegex.exec(part.content)) !== null) {
      if (match.index > lastIndex) {
        subparts.push({ type: "text", content: part.content.substring(lastIndex, match.index) });
      }
      subparts.push({ type: "bold", content: match[1] });
      lastIndex = boldRegex.lastIndex;
    }
    if (lastIndex < part.content.length) {
      subparts.push({ type: "text", content: part.content.substring(lastIndex) });
    }
    return subparts;
  });

  // Parse inline code: `code`
  parts = parts.flatMap((part) => {
    if (part.type !== "text") return part;
    const subparts = [];
    const codeRegex = /`([^`]+)`/g;
    let lastIndex = 0;
    let match;
    while ((match = codeRegex.exec(part.content)) !== null) {
      if (match.index > lastIndex) {
        subparts.push({ type: "text", content: part.content.substring(lastIndex, match.index) });
      }
      subparts.push({ type: "code", content: match[1] });
      lastIndex = codeRegex.lastIndex;
    }
    if (lastIndex < part.content.length) {
      subparts.push({ type: "text", content: part.content.substring(lastIndex) });
    }
    return subparts;
  });

  return parts.map((part, idx) => {
    if (part.type === "bold") {
      return <strong key={idx} className="font-extrabold text-slate-900 dark:text-white">{part.content}</strong>;
    }
    if (part.type === "code") {
      return <code key={idx} className="px-1.5 py-0.5 font-mono text-xs bg-slate-100 dark:bg-slate-850 text-[#FCA311] border border-slate-200 dark:border-slate-800 rounded font-semibold">{part.content}</code>;
    }
    return <span key={idx}>{part.content}</span>;
  });
};

// Generic renderer that parses markdown paragraphs, list items, and headings
const renderMarkdownLines = (content) => {
  if (!content) return null;
  const paragraphs = content.split("\n\n").map(p => p.trim()).filter(Boolean);
  return paragraphs.map((para, pIdx) => {
    // Check if paragraph is list items
    if (para.startsWith("- ") || para.startsWith("* ")) {
      const items = para.split("\n").map(l => l.trim().replace(/^[-*]\s*/, ""));
      return (
        <ul key={pIdx} className="list-disc pl-6 mb-4 space-y-2 text-slate-700 dark:text-slate-300">
          {items.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
        </ul>
      );
    }
    // Check if it's a header
    if (para.startsWith("### ")) {
      return <h4 key={pIdx} className="text-lg font-black text-slate-900 dark:text-white mt-6 mb-2">{parseInline(para.replace("### ", ""))}</h4>;
    }
    if (para.startsWith("## ")) {
      return <h3 key={pIdx} className="text-xl font-black text-slate-900 dark:text-white mt-8 mb-4 border-b pb-2 border-slate-200 dark:border-slate-800">{parseInline(para.replace("## ", ""))}</h3>;
    }
    return (
      <p key={pIdx} className="mb-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
        {parseInline(para)}
      </p>
    );
  });
};

const ProjectDetail = () => {
  const { id } = useParams();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch the Case Study Markdown File dynamically
  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);

    fetch(`/projects/${id}/index.md`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Could not find structured case study details.");
        }
        return res.text();
      })
      .then((text) => {
        const parsedSections = {};
        const lines = text.split("\n");
        let currentSectionNum = null;
        let currentContent = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const match = line.match(/^#\s+(\d+)\.\s+(.+)$/);
          if (match) {
            if (currentSectionNum !== null) {
              parsedSections[currentSectionNum] = currentContent.join("\n").trim();
            }
            currentSectionNum = parseInt(match[1]);
            currentContent = [];
          } else {
            if (currentSectionNum !== null) {
              currentContent.push(line);
            }
          }
        }
        if (currentSectionNum !== null) {
          parsedSections[currentSectionNum] = currentContent.join("\n").trim();
        }

        setCaseStudy(parsedSections);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Force Mermaid rendering whenever tab changes to 'architecture'
  useEffect(() => {
    if (activeTab === "architecture" && window.mermaid && caseStudy) {
      // Reset Mermaid data-processed flags so it re-renders the DOM nodes
      const elements = document.querySelectorAll(".mermaid");
      elements.forEach((el) => {
        el.removeAttribute("data-processed");
        // Clear previously parsed DOM content to make room for new render
        el.innerHTML = el.getAttribute("data-original-code") || el.innerHTML;
      });
      setTimeout(() => {
        window.mermaid.init(undefined, document.querySelectorAll(".mermaid"));
      }, 100);
    }
  }, [activeTab, caseStudy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#14213D] text-slate-900 dark:text-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#FCA311] border-r-transparent border-slate-200 rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-sm tracking-wider uppercase">Loading Case Study...</p>
        </div>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#14213D] text-slate-900 dark:text-slate-100 pt-24 px-6 text-center">
        <span className="text-6xl mb-6">🔍</span>
        <h2 className="text-3xl font-extrabold mb-4">Case Study Under Construction</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          We are currently building this case study. Check back soon for the full technical breakdown!
        </p>
        <RouterLink
          to="/#projects"
          className="px-6 py-3 bg-[#FCA311] hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg inline-flex items-center gap-2"
        >
          <FiArrowLeft /> Back to Showcase
        </RouterLink>
      </div>
    );
  }

  // Parse Section 1 (Hero Data)
  const parseHero = (content) => {
    const data = {};
    content.split("\n").forEach((line) => {
      const splitIdx = line.indexOf(":");
      if (splitIdx !== -1) {
        const key = line.substring(0, splitIdx).trim().toLowerCase();
        const val = line.substring(splitIdx + 1).trim();
        data[key] = val;
      }
    });
    return data;
  };
  const heroData = parseHero(caseStudy[1] || "");

  // Parse Section 3 (Role Checklist)
  const parseRole = (content) => {
    return content.split("\n")
      .map(l => l.trim())
      .filter(l => l.startsWith("✔") || l.startsWith("-"))
      .map(l => l.replace(/^[✔\-]\s*/, ""));
  };
  const roleList = parseRole(caseStudy[3] || "");

  // Extract Mermaid Code Block content
  const extractMermaid = (content) => {
    if (!content) return null;
    const match = content.match(/```mermaid([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };
  const archDiag = extractMermaid(caseStudy[4]);
  const flowDiag = extractMermaid(caseStudy[5]);

  // Parse Section 6 (Database Table rows & explanation)
  const parseDatabase = (content) => {
    const lines = content.split("\n");
    const tableRows = [];
    let explanation = [];
    lines.forEach((line) => {
      const clean = line.trim();
      if (clean.startsWith("|")) {
        const cells = clean.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (cells.length > 0 && !cells.every(c => c.startsWith("-"))) {
          tableRows.push(cells);
        }
      } else if (clean !== "") {
        explanation.push(line);
      }
    });
    return { tableRows, explanation: explanation.join("\n").replace("Explain:", "").trim() };
  };
  const dbData = parseDatabase(caseStudy[6] || "");

  // Parse Section 7 (Engineering Decisions / ADRs)
  const parseADRs = (content) => {
    const adrs = [];
    const parts = content.split(/(?=ADR-\d+)/g);
    parts.forEach((part) => {
      const lines = part.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length > 0 && lines[0].startsWith("ADR-")) {
        const title = lines[0];
        let problem = "", alternatives = "", decision = "", tradeoffs = "";
        lines.slice(1).forEach((line) => {
          if (line.startsWith("- **Problem**:") || line.startsWith("- Problem:")) {
            problem = line.replace(/^-\s*\*\*Problem\*\*:\s*|^-\s*Problem:\s*/i, "");
          } else if (line.startsWith("- **Alternatives**:") || line.startsWith("- Alternatives:")) {
            alternatives = line.replace(/^-\s*\*\*Alternatives\*\*:\s*|^-\s*Alternatives:\s*/i, "");
          } else if (line.startsWith("- **Decision**:") || line.startsWith("- Decision:")) {
            decision = line.replace(/^-\s*\*\*Decision\*\*:\s*|^-\s*Decision:\s*/i, "");
          } else if (line.startsWith("- **Trade-offs**:") || line.startsWith("- Trade-offs:")) {
            tradeoffs = line.replace(/^-\s*\*\*Trade-offs\*\*:\s*|^-\s*Trade-offs:\s*/i, "");
          }
        });
        adrs.push({ title, problem, alternatives, decision, tradeoffs });
      }
    });
    return adrs;
  };
  const adrList = parseADRs(caseStudy[7] || "");

  // Parse Section 9 (Trade-offs)
  const parseTradeoffs = (content) => {
    const pros = [];
    const cons = [];
    let state = null;
    content.split("\n").forEach((line) => {
      const clean = line.trim();
      if (clean.toLowerCase().includes("pros")) {
        state = "pros";
      } else if (clean.toLowerCase().includes("cons")) {
        state = "cons";
      } else if (clean.startsWith("-")) {
        const text = clean.replace(/^-\s*/, "");
        if (state === "pros") pros.push(text);
        if (state === "cons") cons.push(text);
      }
    });
    return { pros, cons };
  };
  const tradeoffsData = parseTradeoffs(caseStudy[9] || "");

  // Parse Section 10 (Metrics)
  const parseMetrics = (content) => {
    return content.split("\n")
      .map(l => l.trim())
      .filter(l => l.startsWith("-"))
      .map((line) => {
        const clean = line.replace(/^-\s*/, "");
        const splitIdx = clean.search(/\s/);
        if (splitIdx !== -1) {
          return {
            value: clean.substring(0, splitIdx).trim(),
            label: clean.substring(splitIdx).trim()
          };
        }
        return { value: "", label: clean };
      });
  };
  const metricsList = parseMetrics(caseStudy[10] || "");

  // Parse Section 14 (Interview Questions ending with '?')
  const parseInterviewQuestions = (content) => {
    const qas = [];
    const lines = content.split("\n").map(l => l.trim()).filter(Boolean);
    let currentQ = null;
    let currentAns = [];

    lines.forEach((line) => {
      if (line.endsWith("?")) {
        if (currentQ) {
          qas.push({ question: currentQ, answer: currentAns.join(" ") });
        }
        currentQ = line;
        currentAns = [];
      } else {
        if (currentQ) {
          currentAns.push(line);
        }
      }
    });
    if (currentQ) {
      qas.push({ question: currentQ, answer: currentAns.join(" ") });
    }
    return qas;
  };
  const interviewQuestions = parseInterviewQuestions(caseStudy[14] || "");

  const tabs = [
    { id: "overview", label: "Overview & Decisions" },
    { id: "architecture", label: "Architecture & Schema" },
    { id: "casestudy", label: "Case Study & Challenges" },
    { id: "interview", label: "Interview Prep" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#14213D] text-slate-900 dark:text-slate-100 pt-28 pb-20 px-4 sm:px-6 transition-colors duration-300">
      <SEO title={heroData.title || "Project Detail"} description={heroData.description || ""} />

      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <div className="mb-8 flex justify-between items-center">
          <RouterLink
            to="/#projects"
            className="inline-flex items-center gap-2 text-[#14213D] dark:text-[#FCA311] font-bold hover:text-amber-500 transition-colors"
          >
            <FiArrowLeft /> Back to Showcase
          </RouterLink>

          <span className="px-3.5 py-1.5 bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] border border-[#FCA311]/30 rounded-full text-xs font-black tracking-wider uppercase">
            Interactive Case Study
          </span>
        </div>

        {/* Hero Section Card */}
        <div className="bg-white dark:bg-slate-900 border-t-4 border-t-[#FCA311] border-x border-b border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl mb-10 text-left">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
            {heroData.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-6 leading-relaxed max-w-4xl">
            {heroData.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {heroData.tags?.split("•").map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] border border-[#FCA311]/30 rounded-lg text-xs font-bold uppercase tracking-wide">
                {tag.trim()}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3.5 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            {heroData.github && heroData.github !== "#" && (
              <a href={heroData.github} target="_blank" rel="noopener noreferrer" className="px-5 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-950 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md">
                <FiGithub /> Github Repository
              </a>
            )}
            {heroData.live && heroData.live !== "#" && (
              <a href={heroData.live} target="_blank" rel="noopener noreferrer" className="px-5 py-3 rounded-xl bg-[#FCA311] hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md shadow-amber-500/20">
                <FiExternalLink /> Live System Demo
              </a>
            )}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-start border-b border-slate-200 dark:border-slate-800 gap-2 mb-10 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 font-bold text-xs sm:text-sm tracking-wider uppercase border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#FCA311] text-[#14213D] dark:text-[#FCA311]"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Reading Dashboard Grid */}
        <div className="text-left">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Business Problem & Role */}
              <div className="lg:col-span-7 space-y-8">
                {/* 2. Business Problem */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
                  <h3 className="text-xl font-black mb-4 text-[#14213D] dark:text-[#FCA311] flex items-center gap-2 border-b pb-2 border-slate-150 dark:border-slate-800">
                    <FiBookOpen /> Business Problem
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    {renderMarkdownLines(caseStudy[2])}
                  </div>
                </div>

                {/* 7. Engineering Decisions (ADRs) */}
                {adrList.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-[#14213D] dark:text-white flex items-center gap-2 px-1">
                      <FiCpu className="text-[#FCA311]" /> Engineering Decisions (ADRs)
                    </h3>
                    <div className="space-y-4">
                      {adrList.map((adr, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                          <h4 className="text-md font-bold text-[#FCA311] mb-3">{adr.title}</h4>
                          <div className="space-y-2.5 text-xs sm:text-sm">
                            <p className="text-slate-750 dark:text-slate-300"><span className="font-extrabold text-slate-900 dark:text-white block sm:inline">Problem:</span> {parseInline(adr.problem)}</p>
                            <p className="text-slate-755 dark:text-slate-300"><span className="font-extrabold text-slate-900 dark:text-white block sm:inline">Alternatives:</span> {parseInline(adr.alternatives)}</p>
                            <p className="text-slate-755 dark:text-slate-300"><span className="font-extrabold text-slate-900 dark:text-white block sm:inline">Decision:</span> {parseInline(adr.decision)}</p>
                            {adr.tradeoffs && <p className="text-slate-755 dark:text-slate-300"><span className="font-extrabold text-slate-900 dark:text-white block sm:inline">Trade-offs:</span> {parseInline(adr.tradeoffs)}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Contributions & Metrics */}
              <div className="lg:col-span-5 space-y-8">
                {/* 10. Metrics */}
                {metricsList.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                    <h3 className="text-lg font-black mb-5 text-[#14213D] dark:text-[#FCA311] flex items-center gap-2">
                      <FiTrendingUp /> Key Impact Metrics
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {metricsList.map((stat, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-850">
                          <div className="text-2xl font-black text-[#14213D] dark:text-[#FCA311] tracking-tight">{stat.value}</div>
                          <div className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider leading-tight">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. My Contribution / Role */}
                {roleList.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                    <h3 className="text-lg font-black mb-5 text-[#14213D] dark:text-white flex items-center gap-2">
                      <FiLayers className="text-[#FCA311]" /> Core Contribution Checklist
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {roleList.map((role, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                          <FiCheckCircle className="text-emerald-500 shrink-0" />
                          <span>{parseInline(role)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "architecture" && (
            <div className="space-y-8">
              {/* 4. Architecture Diagram */}
              {archDiag && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
                  <h3 className="text-xl font-black mb-4 text-[#14213D] dark:text-[#FCA311] flex items-center gap-2">
                    <FiLayers /> High-Level Architecture
                  </h3>
                  <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl flex justify-center overflow-x-auto shadow-inner">
                    <pre className="mermaid text-center w-full" data-original-code={archDiag}>
                      {archDiag}
                    </pre>
                  </div>
                </div>
              )}

              {/* 5. Request Flow */}
              {flowDiag && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
                  <h3 className="text-xl font-black mb-4 text-[#14213D] dark:text-[#FCA311] flex items-center gap-2">
                    <FiCpu /> Detailed Request Flow
                  </h3>
                  <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-850 rounded-xl flex justify-center overflow-x-auto shadow-inner">
                    <pre className="mermaid text-center w-full" data-original-code={flowDiag}>
                      {flowDiag}
                    </pre>
                  </div>
                </div>
              )}

              {/* 6. Database Design */}
              {dbData.tableRows?.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
                  <h3 className="text-xl font-black mb-4 text-[#14213D] dark:text-white flex items-center gap-2">
                    <FiDatabase className="text-[#FCA311]" /> Database Schema Layout
                  </h3>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-805 mb-6">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-extrabold text-[#14213D] dark:text-[#FCA311]">
                        <tr>
                          <th className="p-3">Table Name</th>
                          <th className="p-3">Database Purpose / Contents</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbData.tableRows.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-850 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 font-medium">
                            <td className="p-3 font-extrabold text-[#14213D] dark:text-white">{row[0]}</td>
                            <td className="p-3 text-slate-650 dark:text-slate-350">{parseInline(row[1])}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {dbData.explanation && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                      <span className="font-extrabold text-slate-900 dark:text-white block mb-1">Architectural Insight:</span>
                      {parseInline(dbData.explanation)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "casestudy" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Full Case Study & Improvements */}
              <div className="lg:col-span-8 space-y-8">
                {/* 12. Case Study Content */}
                {caseStudy[12] && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
                    <h3 className="text-xl font-black mb-6 text-[#14213D] dark:text-[#FCA311] border-b pb-2 border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <FiBookOpen /> Project Story Case Study
                    </h3>
                    <div className="prose dark:prose-invert max-w-none">
                      {renderMarkdownLines(caseStudy[12])}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Challenges, Trade-offs & Improvements */}
              <div className="lg:col-span-4 space-y-8">
                {/* 8. Biggest Challenges */}
                {caseStudy[8] && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                    <h3 className="text-lg font-black mb-4 text-[#14213D] dark:text-white flex items-center gap-2">
                      <FiHelpCircle className="text-[#FCA311]" /> Key Technical Challenge
                    </h3>
                    <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3 font-medium">
                      {caseStudy[8].split("\n\n").map((para, idx) => {
                        const clean = para.trim();
                        if (clean.toLowerCase().startsWith("challenge:")) {
                          return (
                            <div key={idx} className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-lg">
                              <span className="font-extrabold text-red-650 dark:text-red-400 block mb-1">Challenge:</span>
                              {parseInline(clean.replace(/challenge:/i, "").trim())}
                            </div>
                          );
                        }
                        if (clean.toLowerCase().startsWith("solution:")) {
                          return (
                            <div key={idx} className="p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block mb-1">Solution:</span>
                              {parseInline(clean.replace(/solution:/i, "").trim())}
                            </div>
                          );
                        }
                        return <p key={idx}>{parseInline(clean)}</p>;
                      })}
                    </div>
                  </div>
                )}

                {/* 9. Trade-offs Pros & Cons */}
                {(tradeoffsData.pros.length > 0 || tradeoffsData.cons.length > 0) && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                    <h3 className="text-lg font-black mb-4 text-[#14213D] dark:text-white flex items-center gap-2">
                      <FiLayers className="text-[#FCA311]" /> Architectural Trade-offs
                    </h3>
                    <div className="space-y-4">
                      {tradeoffsData.pros.length > 0 && (
                        <div>
                          <span className="text-xs font-black text-emerald-650 dark:text-emerald-400 block mb-1.5 uppercase tracking-wide">Advantages (Pros)</span>
                          <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-350 font-bold">
                            {tradeoffsData.pros.map((p, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-500">•</span> {parseInline(p)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {tradeoffsData.cons.length > 0 && (
                        <div className="border-t border-slate-100 dark:border-slate-850 pt-4">
                          <span className="text-xs font-black text-red-650 dark:text-red-400 block mb-1.5 uppercase tracking-wide">Downsides (Cons)</span>
                          <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-350 font-bold">
                            {tradeoffsData.cons.map((c, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-red-500">•</span> {parseInline(c)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 13. Improvements / Next Steps */}
                {caseStudy[13] && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                    <h3 className="text-lg font-black mb-4 text-[#14213D] dark:text-white flex items-center gap-2">
                      <FiTrendingUp className="text-[#FCA311]" /> Future Extensibility
                    </h3>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold">
                      {caseStudy[13].split("\n").map(l => l.trim()).filter(l => l.startsWith("-")).map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#FCA311] mt-0.5">•</span>
                          <span>{parseInline(item.replace(/^-\s*/, ""))}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "interview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Interview Q&As (14) */}
              <div className="lg:col-span-8 space-y-6">
                <h3 className="text-xl font-black text-[#14213D] dark:text-white flex items-center gap-2 px-1">
                  <FiHelpCircle className="text-[#FCA311]" /> Interview Preparation Q&A
                </h3>

                {interviewQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {interviewQuestions.map((qa, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
                        <h4 className="font-extrabold text-[#14213D] dark:text-white mb-2 flex items-start gap-2 text-sm sm:text-base leading-snug">
                          <span className="text-[#FCA311] shrink-0">Q:</span>
                          <span>{parseInline(qa.question)}</span>
                        </h4>
                        <div className="text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-bold pl-5 border-l border-slate-200 dark:border-slate-800">
                          {parseInline(qa.answer)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No Q&As added for this project yet.</p>
                )}
              </div>

              {/* Lessons Learned (15) */}
              <div className="lg:col-span-4 space-y-8">
                {caseStudy[15] && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FCA311]/5 rounded-full blur-xl pointer-events-none" />
                    <h3 className="text-lg font-black mb-4 text-[#14213D] dark:text-[#FCA311] flex items-center gap-2">
                      <FiBookOpen /> Lessons Learned
                    </h3>
                    <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-4 font-semibold italic">
                      {caseStudy[15].split("\n").map((line, idx) => (
                        <p key={idx}>{parseInline(line.trim().replace(/^-\s*/, ""))}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
