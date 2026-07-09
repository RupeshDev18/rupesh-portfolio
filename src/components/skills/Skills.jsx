import React from "react";
import { motion } from "framer-motion";
import portfolioData from "../../data/data.json";
import { 
  FaReact, FaNodeJs, FaAws, FaDocker, FaHtml5, FaBolt, FaBrain 
} from "react-icons/fa";
import { 
  SiNextdotjs, SiTailwindcss, SiTypescript, SiFastapi, SiNestjs, SiPrisma, 
  SiPostgresql, SiMongodb, SiOpenai, SiGithubactions 
} from "react-icons/si";
import { 
  TbApi, TbShieldLock, TbComponents 
} from "react-icons/tb";

const Skills = ({ darkMode }) => {
  const skillCategories = portfolioData.skillCategories;

  const getSkillIcon = (name) => {
    const lowercaseName = name.toLowerCase();
    
    if (lowercaseName.includes("react")) return <FaReact className="text-[#61dafb] text-lg" />;
    if (lowercaseName.includes("next.js")) return <SiNextdotjs className="text-black dark:text-white text-lg" />;
    if (lowercaseName.includes("tailwind")) return <SiTailwindcss className="text-[#38bdf8] text-lg" />;
    if (lowercaseName.includes("shadcn")) return <TbComponents className="text-[#3b82f6] text-lg" />;
    if (lowercaseName.includes("html") || lowercaseName.includes("css")) return <FaHtml5 className="text-[#e34f26] text-lg" />;
    if (lowercaseName.includes("typescript")) return <SiTypescript className="text-[#3178c6] text-lg" />;
    
    if (lowercaseName.includes("node")) return <FaNodeJs className="text-[#339933] text-lg" />;
    if (lowercaseName.includes("fastapi")) return <SiFastapi className="text-[#009688] text-lg" />;
    if (lowercaseName.includes("nestjs")) return <SiNestjs className="text-[#e0234e] text-lg" />;
    if (lowercaseName.includes("prisma")) return <SiPrisma className="text-[#2d3748] dark:text-[#a5b4fc] text-lg" />;
    if (lowercaseName.includes("rest") || lowercaseName.includes("grpc")) return <TbApi className="text-teal-500 text-lg" />;
    if (lowercaseName.includes("event-driven")) return <FaBolt className="text-yellow-500 text-lg" />;
    
    if (lowercaseName.includes("aws")) return <FaAws className="text-[#ff9900] text-lg" />;
    if (lowercaseName.includes("docker")) return <FaDocker className="text-[#2496ed] text-lg" />;
    if (lowercaseName.includes("ci/cd")) return <SiGithubactions className="text-[#2088ff] text-lg" />;
    if (lowercaseName.includes("iam") || lowercaseName.includes("security")) return <TbShieldLock className="text-red-500 text-lg" />;
    
    if (lowercaseName.includes("postgres")) return <SiPostgresql className="text-[#4169e1] text-lg" />;
    if (lowercaseName.includes("mongodb") || lowercaseName.includes("sqlite")) return <SiMongodb className="text-[#47a248] text-lg" />;
    if (lowercaseName.includes("llm") || lowercaseName.includes("openai")) return <SiOpenai className="text-[#10a37f] text-lg" />;
    if (lowercaseName.includes("embeddings") || lowercaseName.includes("prompt")) return <FaBrain className="text-pink-500 text-lg" />;

    return null;
  };

  return (
    <section id="skills" className="py-20 px-6 bg-white dark:bg-slate-950 dark:bg-gradient-to-br dark:from-slate-950 dark:via-teal-950/10 dark:to-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.h2 className="text-[36px] font-bold mb-12 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          My <span className="text-teal-600 dark:text-cyan-400">Skills</span>
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
        >
          {skillCategories.map((category, catIdx) => (
            <motion.div
              key={catIdx}
              className="p-6 bg-gray-50/50 dark:bg-slate-900/60 dark:backdrop-blur-md rounded-lg border border-gray-200 dark:border-teal-500/20 hover:border-teal-400 dark:hover:border-cyan-400/40 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", stiffness: 50 } }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <h3 className="text-[22px] font-bold mb-6 text-teal-600 dark:text-cyan-400">{category.category}</h3>
              <div className="flex flex-wrap gap-2.5">
                {category.skills.map((skill, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm text-gray-800 dark:text-gray-200 cursor-default hover:border-teal-500 dark:hover:border-cyan-400 hover:shadow-md transition-all duration-200"
                    whileHover={{ scale: 1.03, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {getSkillIcon(skill.name)}
                    <span className="font-bold text-[15px]">{skill.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;