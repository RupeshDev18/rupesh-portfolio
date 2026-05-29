import React from "react";
import { motion } from "framer-motion";

const Skills = ({ darkMode }) => {
  const skillCategories = [
    {
      category: "Frontend",
      skills: [
        { name: "React.js", level: 95 },
        { name: "Next.js", level: 90 },
        { name: "Tailwind CSS", level: 95 },
        { name: "JavaScript/ES6+", level: 95 },
        { name: "TypeScript", level: 85 },
        { name: "Redux", level: 88 },
      ],
    },
    {
      category: "Backend",
      skills: [
        { name: "Node.js", level: 92 },
        { name: "Express.js", level: 90 },
        { name: "MongoDB", level: 88 },
        { name: "PostgreSQL", level: 82 },
        { name: "Firebase", level: 85 },
        { name: "REST APIs", level: 92 },
      ],
    },
    {
      category: "DevOps & Tools",
      skills: [
        { name: "Docker", level: 80 },
        { name: "GitHub", level: 95 },
        { name: "Git", level: 95 },
        { name: "AWS", level: 75 },
        { name: "CI/CD", level: 80 },
        { name: "Linux", level: 85 },
      ],
    },
    {
      category: "AI/ML",
      skills: [
        { name: "Python", level: 88 },
        { name: "TensorFlow", level: 78 },
        { name: "Machine Learning", level: 80 },
        { name: "Data Analysis", level: 82 },
        { name: "Pandas", level: 85 },
        { name: "Scikit-learn", level: 80 },
      ],
    },
  ];

  return (
    <section id="skills" className="py-20 px-6 bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-teal-950/10 dark:to-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.h2 className="text-4xl md:text-5xl font-bold mb-12 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          My <span className="text-teal-600 dark:text-cyan-400">Skills</span>
        </motion.h2>

        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {skillCategories.map((category, catIdx) => (
            <motion.div key={catIdx} className="p-6 bg-gray-50/50 dark:bg-slate-900/60 dark:backdrop-blur-md rounded-lg border border-gray-200 dark:border-teal-500/20 hover:border-teal-400 dark:hover:border-cyan-400/40 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300">
              <h3 className="text-xl font-bold mb-6 text-teal-600 dark:text-cyan-400">{category.category}</h3>
              <div className="space-y-4">
                {category.skills.map((skill, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{skill.name}</span>
                      <span className="text-teal-600 dark:text-cyan-400 font-bold">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-slate-950 rounded-full overflow-hidden border border-transparent dark:border-teal-950/40">
                      <motion.div
                        className="h-full bg-gradient-to-r from-teal-500 to-blue-500"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                      ></motion.div>
                    </div>
                  </div>
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