import React from "react";
import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from "react-icons/fi";
import portfolioData from "../../data/data.json";

const Footer = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();

  const socials = [
    { icon: <FiGithub />, label: "GitHub", link: portfolioData.socials.github },
    { icon: <FiLinkedin />, label: "LinkedIn", link: portfolioData.socials.linkedin },
    { icon: <FiTwitter />, label: "Twitter", link: portfolioData.socials.twitter },
    { icon: <FiMail />, label: "Email", link: portfolioData.socials.email },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              {portfolioData.name}
            </h3>
            <p className="text-gray-400 text-sm">Full-Stack SaaS Engineer | AWS Certified Solutions Architect</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#home" className="hover:text-teal-450 transition-colors duration-300">Home</a></li>
              <li><a href="#about" className="hover:text-teal-450 transition-colors duration-300">About</a></li>
              <li><a href="#projects" className="hover:text-teal-450 transition-colors duration-300">Projects</a></li>
              <li><a href="#blog" className="hover:text-teal-450 transition-colors duration-300">Blog</a></li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
            <h4 className="font-semibold mb-4">Follow Me</h4>
            <div className="flex gap-4">
              {socials.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-teal-500 dark:hover:bg-cyan-400 hover:text-white dark:hover:text-black text-lg transition-colors duration-300"
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  title={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} Rupesh Yadav. All rights reserved.</p>
          <p className="mt-2">Designed & Built with ❤️ using React & Framer Motion</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;