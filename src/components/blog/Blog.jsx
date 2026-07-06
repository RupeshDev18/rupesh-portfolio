import React from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiClock, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { blogPosts } from "../../data/blogData";

const Blog = ({ darkMode }) => {
  return (
    <section id="blog" className="py-20 px-6 bg-gradient-to-br from-blue-50/20 via-white to-emerald-50/10 dark:bg-slate-950 dark:bg-gradient-to-br dark:from-slate-950 dark:via-teal-950/10 dark:to-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.h2 className="text-[36px] font-bold mb-12 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          Latest <span className="text-teal-600 dark:text-cyan-400">Blog Posts</span>
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
        >
          {blogPosts.map((post, idx) => (
            <motion.article
              key={idx}
              className="bg-white dark:bg-slate-900/60 dark:backdrop-blur-md rounded-lg overflow-hidden border border-gray-200 dark:border-teal-500/20 dark:hover:border-cyan-400/40 hover:shadow-lg dark:hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", stiffness: 50 } }
              }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className="p-6 flex-1 flex flex-col">
                <span className="inline-block px-3 py-1 bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 rounded-full text-[13px] font-semibold mb-2 w-fit">
                  {post.category}
                </span>

                <Link to={`/blog/${post.id}`} className="hover:text-teal-500 transition-colors">
                  <h3 className="text-[22px] font-bold mb-3 text-gray-900 dark:text-white line-clamp-2">{post.title}</h3>
                </Link>
                <p className="text-gray-600 dark:text-gray-400 text-[16px] mb-4 flex-1">{post.excerpt}</p>

                <div className="mb-4">
                  <Link to={`/blog/${post.id}`} className="inline-flex items-center gap-1 text-[16px] font-semibold text-teal-600 dark:text-cyan-400 hover:text-blue-500 transition-colors">
                    Read Article <FiArrowRight />
                  </Link>
                </div>

                <div className="flex items-center justify-between text-[13px] text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-teal-950/50">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-teal-500" /> {post.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <FiClock className="text-teal-500" /> {post.readTime}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;