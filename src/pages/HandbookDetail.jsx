import React, { useEffect, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiClock, FiBook, FiChevronRight } from "react-icons/fi";
import { cheatsheets } from "../data/cheatsheetsData";
import SEO from "../components/seo/SEO";

// Custom interactive CodeBlock component with copy to clipboard
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-slate-900 shadow-md font-mono text-sm text-gray-100 relative group">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 select-none">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
          <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
          <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-bold uppercase">{language}</span>
          <button
            onClick={handleCopy}
            className="text-xs text-gray-400 hover:text-white bg-slate-700 hover:bg-slate-650 px-2.5 py-1 rounded border border-slate-600 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="p-5 overflow-x-auto text-[13px] md:text-sm leading-relaxed text-slate-300">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Helper function to parse inline markdown formatting (bold, italics, inline code, and links)
const parseInline = (text) => {
  let parts = [{ type: "text", content: text }];

  // 1. Parse bold: **text**
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

  // 1.5 Parse italic: _text_ or *text*
  parts = parts.flatMap((part) => {
    if (part.type !== "text") return part;
    const subparts = [];
    const italicRegex = /_([^_]+)_|\*([^*]+)\*/g;
    let lastIndex = 0;
    let match;
    while ((match = italicRegex.exec(part.content)) !== null) {
      if (match.index > lastIndex) {
        subparts.push({ type: "text", content: part.content.substring(lastIndex, match.index) });
      }
      const content = match[1] || match[2];
      subparts.push({ type: "italic", content: content });
      lastIndex = italicRegex.lastIndex;
    }
    if (lastIndex < part.content.length) {
      subparts.push({ type: "text", content: part.content.substring(lastIndex) });
    }
    return subparts;
  });

  // 2. Parse inline code: `text`
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
      subparts.push({ type: "inline-code", content: match[1] });
      lastIndex = codeRegex.lastIndex;
    }
    if (lastIndex < part.content.length) {
      subparts.push({ type: "text", content: part.content.substring(lastIndex) });
    }
    return subparts;
  });

  // 3. Parse links: [text](url)
  parts = parts.flatMap((part) => {
    if (part.type !== "text") return part;
    const subparts = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;
    while ((match = linkRegex.exec(part.content)) !== null) {
      if (match.index > lastIndex) {
        subparts.push({ type: "text", content: part.content.substring(lastIndex, match.index) });
      }
      subparts.push({ type: "link", content: match[1], url: match[2] });
      lastIndex = linkRegex.lastIndex;
    }
    if (lastIndex < part.content.length) {
      subparts.push({ type: "text", content: part.content.substring(lastIndex) });
    }
    return subparts;
  });

  return parts.map((part, idx) => {
    switch (part.type) {
      case "bold":
        return (
          <strong key={idx} className="font-extrabold text-gray-900 dark:text-white">
            {part.content}
          </strong>
        );
      case "italic":
        return (
          <em key={idx} className="italic text-gray-800 dark:text-gray-200">
            {part.content}
          </em>
        );
      case "inline-code":
        return (
          <code key={idx} className="px-1.5 py-0.5 font-mono text-[13px] text-teal-600 dark:text-cyan-450 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded font-bold">
            {part.content}
          </code>
        );
      case "link":
        return (
          <a key={idx} href={part.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-cyan-400 underline hover:text-blue-500 font-bold">
            {part.content}
          </a>
        );
      default:
        return part.content;
    }
  });
};

const HandbookDetail = () => {
  const { id } = useParams();
  const [activeId, setActiveId] = useState("");
  const [headings, setHeadings] = useState([]);

  const cheatsheet = cheatsheets.find((c) => c.id === id);

  // Scroll to top and generate table of contents
  useEffect(() => {
    window.scrollTo(0, 0);

    if (cheatsheet) {
      const foundHeadings = [];
      const lines = cheatsheet.content.split("\n");
      lines.forEach((line) => {
        if (line.startsWith("## ") && !line.startsWith("### ")) {
          const text = line.replace("## ", "").trim();
          const headingId = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          foundHeadings.push({ text, id: headingId, level: 2 });
        } else if (line.startsWith("### ")) {
          const text = line.replace("### ", "").trim();
          const headingId = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          foundHeadings.push({ text, id: headingId, level: 3 });
        }
      });
      setHeadings(foundHeadings);
    }
  }, [id, cheatsheet]);

  // Track active section on scroll
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (!cheatsheet) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 pt-24 px-6 text-center">
        <span className="text-6xl mb-6 block">🔍</span>
        <h2 className="text-3xl font-extrabold mb-4">Handbook Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The requested handbook does not exist.
        </p>
        <RouterLink
          to="/handbook"
          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg inline-flex items-center gap-2"
        >
          <FiArrowLeft /> Back to Handbooks
        </RouterLink>
      </div>
    );
  }

  // Parse markdown into JSX elements (Headings, Tables, Lists, Code, Paragraphs)
  const renderContent = (contentString) => {
    const lines = contentString.trim().split("\n");
    const parsedElements = [];
    let inCodeBlock = false;
    let codeContent = [];
    let codeLanguage = "";
    let listItems = [];
    let inTable = false;
    let tableHeader = null;
    let tableRows = [];

    const flushList = (index) => {
      if (listItems.length > 0) {
        parsedElements.push(
          <ul key={`ul-${index}`} className="list-disc pl-6 mb-6 space-y-2 text-gray-700 dark:text-gray-300">
            {listItems}
          </ul>
        );
        listItems = [];
      }
    };

    const flushTable = (index) => {
      if (tableRows.length > 0) {
        parsedElements.push(
          <div key={`table-wrapper-${index}`} className="my-8 overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm">
            <table className="w-full text-left border-collapse">
              {tableHeader && (
                <thead className="bg-gray-55/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-800">
                  <tr>
                    {tableHeader.map((cell, idx) => (
                      <th key={idx} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                        {parseInline(cell.trim())}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white/50 dark:bg-slate-950/20">
                {tableRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    {row.map((cell, idx) => (
                      <td key={idx} className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 font-semibold">
                        {parseInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeader = null;
        tableRows = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Horizontal Rule divider
      if (line.trim() === "---") {
        flushList(i - 1);
        flushTable(i - 1);
        parsedElements.push(
          <hr key={`hr-${i}`} className="my-10 border-gray-200 dark:border-slate-800" />
        );
        continue;
      }

      // Code blocks selector
      if (line.trim().startsWith("```")) {
        flushList(i - 1);
        flushTable(i - 1);
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeString = codeContent.join("\n");
          parsedElements.push(
            <CodeBlock key={`code-${i}`} code={codeString} language={codeLanguage || "code"} />
          );
          codeContent = [];
          codeLanguage = "";
        } else {
          inCodeBlock = true;
          codeLanguage = line.trim().replace("```", "").trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Tables selector
      if (line.trim().startsWith("|")) {
        flushList(i - 1);
        const cells = line.split("|").slice(1, -1);
        if (line.includes("---")) {
          // Divider line, skip
          continue;
        }
        if (!tableHeader && tableRows.length === 0) {
          tableHeader = cells;
        } else {
          tableRows.push(cells);
        }
        inTable = true;
        continue;
      } else if (inTable) {
        // Table ended, flush it
        flushTable(i - 1);
      }

      // Lists selector
      if (line.startsWith("- ")) {
        listItems.push(
          <li key={`li-${i}`}>{parseInline(line.replace("- ", ""))}</li>
        );
      } else {
        flushList(i - 1);

        if (line.startsWith("# ")) {
          const text = line.replace("# ", "").trim();
          const headingId = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          parsedElements.push(
            <h1 key={`h1-${i}`} id={headingId} className="text-3xl md:text-4xl font-black mt-12 mb-6 text-gray-900 dark:text-white scroll-mt-24 border-b pb-3 border-gray-200 dark:border-slate-800">
              {parseInline(text)}
            </h1>
          );
        } else if (line.startsWith("### ")) {
          const text = line.replace("### ", "").trim();
          const headingId = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          parsedElements.push(
            <h3 key={`h3-${i}`} id={headingId} className="text-xl font-bold mt-8 mb-4 text-gray-900 dark:text-white scroll-mt-24">
              {parseInline(text)}
            </h3>
          );
        } else if (line.startsWith("## ")) {
          const text = line.replace("## ", "").trim();
          const headingId = text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          parsedElements.push(
            <h2 key={`h2-${i}`} id={headingId} className="text-2xl font-extrabold mt-12 mb-6 text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-slate-800 scroll-mt-24">
              {parseInline(text)}
            </h2>
          );
        } else if (line.trim().startsWith("> ")) {
          const text = line.trim().replace(/^>\s*/, "");
          parsedElements.push(
            <blockquote key={`quote-${i}`} className="p-4 bg-gray-50 dark:bg-slate-900/50 border-l-4 border-teal-500 dark:border-cyan-400 text-gray-700 dark:text-gray-300 rounded-r-lg text-base md:text-lg my-4 italic">
              {parseInline(text)}
            </blockquote>
          );
        } else if (line.trim() !== "") {
          // Detect bold callout stars (⭐⭐⭐)
          if (line.includes("⭐")) {
            parsedElements.push(
              <div key={`star-${i}`} className="p-4 bg-amber-500/10 border-l-4 border-amber-500 text-amber-800 dark:text-amber-300 rounded-r-lg text-sm font-bold my-4">
                {parseInline(line)}
              </div>
            );
          } else {
            parsedElements.push(
              <p key={`p-${i}`} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-base md:text-lg">
                {parseInline(line)}
              </p>
            );
          }
        }
      }
    }

    flushList(lines.length);
    flushTable(lines.length);

    return parsedElements;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 pt-28 pb-20 px-6">
      <SEO 
        title={cheatsheet.title} 
        description={cheatsheet.description}
      />
      <div className="max-w-7xl mx-auto flex gap-12">
        {/* Left Side: Table of Contents (Desktop Sidebar) */}
        <aside className="hidden lg:block w-72 shrink-0 self-start sticky top-28 max-h-[calc(100vh-140px)] overflow-y-auto pr-4 scrollbar-thin">
          <RouterLink
            to="/handbook"
            className="inline-flex items-center gap-2 text-teal-600 dark:text-cyan-400 font-bold transition-colors hover:text-blue-500 mb-8"
          >
            <FiArrowLeft /> Back to Handbooks
          </RouterLink>

          <h4 className="text-xs uppercase font-extrabold tracking-wider text-gray-400 dark:text-slate-500 mb-4">
            Table of Contents
          </h4>
          <nav className="space-y-1">
            {headings.map((h, idx) => (
              <a
                key={idx}
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`block text-[14px] leading-relaxed transition-all pl-3 border-l-2 py-1.5 font-bold ${
                  h.level === 3 ? "pl-6 text-[13px]" : ""
                } ${
                  activeId === h.id
                    ? "text-teal-600 dark:text-cyan-400 border-teal-600 dark:border-cyan-400"
                    : "text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:text-gray-800 dark:hover:text-gray-200"
                }`}
              >
                {h.text}
              </a>
            ))}
          </nav>
        </aside>

        {/* Right Side: Handbook Content Viewport */}
        <main className="flex-1 max-w-4xl mx-auto">
          {/* Breadcrumb (Mobile/Tablet) */}
          <div className="lg:hidden mb-6 flex justify-between items-center">
            <RouterLink
              to="/handbook"
              className="inline-flex items-center gap-2 text-teal-600 dark:text-cyan-400 font-bold transition-colors hover:text-blue-500"
            >
              <FiArrowLeft /> Back to Handbooks
            </RouterLink>
          </div>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-wider font-extrabold">
              <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 rounded-full border border-teal-100 dark:border-teal-900/50">
                {cheatsheet.category}
              </span>
              <div className="flex items-center gap-1.5">
                <FiClock className="text-teal-500" /> {cheatsheet.readTime}
              </div>
              <div className="flex items-center gap-1.5">
                <FiBook className="text-teal-500" /> {cheatsheet.yoe}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-black mb-8 leading-tight text-gray-900 dark:text-white">
              {cheatsheet.title}
            </h1>

            {/* Rendered content */}
            <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-300">
              {renderContent(cheatsheet.content)}
            </div>
          </motion.article>
        </main>
      </div>
    </div>
  );
};

export default HandbookDetail;
