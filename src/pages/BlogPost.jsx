import React, { useEffect } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCalendar, FiClock, FiShare2, FiBookmark } from "react-icons/fi";
import { blogPosts } from "../data/blogData";

const BlogPost = ({ darkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.id === id);

  // Scroll to top on page render
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 pt-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-6xl mb-6 block">🔍</span>
          <h2 className="text-3xl font-extrabold mb-4">Post Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            The article you are looking for does not exist or has been moved to another URL.
          </p>
          <RouterLink
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg inline-flex items-center gap-2"
          >
            <FiArrowLeft /> Back to Home
          </RouterLink>
        </motion.div>
      </div>
    );
  }

  // Parse custom styled text block into JSX elements (Headings, code blocks, paragraphs)
  const renderContent = (contentString) => {
    const lines = contentString.trim().split("\n");
    const parsedElements = [];
    let inCodeBlock = false;
    let codeContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks selector
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          // Closing code block
          inCodeBlock = false;
          const codeString = codeContent.join("\n");
          parsedElements.push(
            <motion.div
              key={`code-${i}`}
              className="my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-teal-500/20 bg-slate-900 shadow-md font-mono text-sm text-gray-100"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full inline-block"></span>
                  <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block"></span>
                  <span className="w-3 h-3 bg-green-500 rounded-full inline-block"></span>
                </div>
                <span className="text-xs text-gray-400">JavaScript</span>
              </div>
              {/* Code */}
              <pre className="p-4 overflow-x-auto">
                <code>{codeString}</code>
              </pre>
            </motion.div>
          );
          codeContent = [];
        } else {
          // Opening code block
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Check for headings
      if (line.startsWith("### ")) {
        parsedElements.push(
          <h3 key={`h3-${i}`} className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
            {line.replace("### ", "")}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        parsedElements.push(
          <h2 key={`h2-${i}`} className="text-3xl font-extrabold mt-10 mb-6 text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-slate-800">
            {line.replace("## ", "")}
          </h2>
        );
      } else if (line.startsWith("- ")) {
        parsedElements.push(
          <ul key={`ul-${i}`} className="list-disc pl-6 mb-4 space-y-2 text-gray-700 dark:text-gray-300">
            <li>{line.replace("- ", "")}</li>
          </ul>
        );
      } else if (line.trim() !== "") {
        parsedElements.push(
          <p key={`p-${i}`} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
            {line}
          </p>
        );
      }
    }

    return parsedElements;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <RouterLink
            to="/#blog"
            className="inline-flex items-center gap-2 text-teal-600 dark:text-cyan-400 font-bold transition-colors hover:text-blue-500"
          >
            <FiArrowLeft /> Back to Articles
          </RouterLink>
        </motion.div>

        {/* Post Container */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Card */}
          <div className="h-64 md:h-96 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-8xl md:text-9xl shadow-lg mb-8 overflow-hidden relative group">
            <span className="z-10 filter drop-shadow-md">{post.image}</span>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
          </div>

          {/* Category Badge & Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5">
              <FiCalendar className="text-teal-500" /> {post.date}
            </div>
            <div className="flex items-center gap-1.5">
              <FiClock className="text-teal-500" /> {post.readTime}
            </div>
          </div>

          {/* Post Title */}
          <h1 className="text-4xl md:text-5xl font-black mb-8 leading-tight text-gray-900 dark:text-white">
            {post.title}
          </h1>

          {/* Interactive Share Toolbar */}
          <div className="flex items-center justify-between border-y border-gray-200 dark:border-slate-800 py-4 mb-10 text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">RY</div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Rupesh Yadav</p>
                <p className="text-xs">Author</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-900 hover:text-teal-500 transition-colors" title="Bookmark">
                <FiBookmark />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-900 hover:text-teal-500 transition-colors" title="Share Post">
                <FiShare2 />
              </button>
            </div>
          </div>

          {/* Article Body */}
          <div className="prose dark:prose-invert max-w-none">
            {renderContent(post.content)}
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default BlogPost;
