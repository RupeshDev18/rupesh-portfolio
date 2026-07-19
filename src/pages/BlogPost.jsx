import React, { useEffect } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCalendar, FiClock, FiShare2, FiBookmark } from "react-icons/fi";
import { blogPosts } from "../data/blogData";
import SEO from "../components/seo/SEO";

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#14213D] text-slate-900 dark:text-slate-100 pt-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-6xl mb-6 block">🔍</span>
          <h2 className="text-3xl font-extrabold mb-4 text-[#14213D] dark:text-white">Post Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
            The article you are looking for does not exist or has been moved to another URL.
          </p>
          <RouterLink
            to="/"
            className="px-6 py-3 bg-[#FCA311] hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg inline-flex items-center gap-2"
          >
            <FiArrowLeft /> Back to Home
          </RouterLink>
        </motion.div>
      </div>
    );
  }

  const renderContent = (contentString) => {
    const lines = contentString.trim().split("\n");
    const parsedElements = [];
    let inCodeBlock = false;
    let codeContent = [];
    let listItems = [];

    const flushList = (index) => {
      if (listItems.length > 0) {
        parsedElements.push(
          <ul key={`ul-${index}`} className="list-disc pl-6 mb-4 space-y-2 text-slate-700 dark:text-slate-300">
            {listItems}
          </ul>
        );
        listItems = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith("```")) {
        flushList(i - 1);
        if (inCodeBlock) {
          inCodeBlock = false;
          const codeString = codeContent.join("\n");
          parsedElements.push(
            <motion.div
              key={`code-${i}`}
              className="my-6 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md font-mono text-sm text-slate-100"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                  <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
                  <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                </div>
                <span className="text-xs text-slate-400 font-bold">JavaScript</span>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code>{codeString}</code>
              </pre>
            </motion.div>
          );
          codeContent = [];
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      if (line.startsWith("- ")) {
        listItems.push(
          <li key={`li-${i}`}>{line.replace("- ", "")}</li>
        );
      } else {
        flushList(i - 1);

        if (line.startsWith("### ")) {
          parsedElements.push(
            <h3 key={`h3-${i}`} className="text-2xl font-bold mt-8 mb-4 text-[#14213D] dark:text-white">
              {line.replace("### ", "")}
            </h3>
          );
        } else if (line.startsWith("## ")) {
          parsedElements.push(
            <h2 key={`h2-${i}`} className="text-3xl font-extrabold mt-10 mb-6 text-[#14213D] dark:text-white border-b pb-2 border-slate-200 dark:border-slate-800">
              {line.replace("## ", "")}
            </h2>
          );
        } else if (line.trim() !== "") {
          parsedElements.push(
            <p key={`p-${i}`} className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 text-lg">
              {line}
            </p>
          );
        }
      }
    }

    flushList(lines.length);

    return parsedElements;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#14213D] text-slate-900 dark:text-slate-100 pt-28 pb-20 px-6 transition-colors duration-300">
      <SEO 
        title={post.title} 
        description={post.content.substring(0, 160) + "..."}
      />
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <RouterLink
            to="/#blog"
            className="inline-flex items-center gap-2 text-[#14213D] dark:text-[#FCA311] font-bold transition-colors hover:text-amber-500"
          >
            <FiArrowLeft /> Back to Blog
          </RouterLink>

          <span className="px-3 py-1.5 bg-[#FCA311]/15 text-[#14213D] dark:text-[#FCA311] rounded-full text-xs font-bold uppercase tracking-wider border border-[#FCA311]/30">
            {post.category}
          </span>
        </motion.div>

        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-[#14213D] dark:text-white">
            {post.title}
          </h1>

          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pb-8 mb-8 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 font-medium">
                <FiCalendar className="text-[#FCA311]" /> {post.date}
              </div>
              <div className="flex items-center gap-2 font-medium">
                <FiClock className="text-[#FCA311]" /> {post.readTime}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: post.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Article URL copied to clipboard!");
                  }
                }}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:text-[#FCA311] transition-colors"
                title="Share Article"
              >
                <FiShare2 />
              </button>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
            {renderContent(post.content)}
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default BlogPost;
