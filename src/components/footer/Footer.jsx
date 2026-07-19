import React from "react";
import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from "react-icons/fi";
import portfolioData from "../../data/data.json";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const quickLinks = [
    { name: "Home", to: "home" },
    { name: "Skills", to: "skills" },
    { name: "Projects", to: "projects" },
    { name: "Blog", to: "blog" },
    { name: "Handbook", to: "/handbook", isPage: true },
  ];

  const socials = [
    { icon: <FiGithub />, label: "GitHub", link: portfolioData.socials.github },
    { icon: <FiLinkedin />, label: "LinkedIn", link: portfolioData.socials.linkedin },
    { icon: <FiTwitter />, label: "Twitter", link: portfolioData.socials.twitter },
    { icon: <FiMail />, label: "Email", link: portfolioData.socials.email },
  ];

  return (
    <footer className="bg-[#14213D] text-white py-14 px-6 border-t border-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-extrabold text-[#FCA311] mb-2">
              {portfolioData.name}
            </h3>
            <ul className="text-slate-300 text-xs space-y-2 mt-4 font-medium">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#FCA311]"></span> AWS Certified Solutions Architect</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#FCA311]"></span> GATE 2024 AIR 7700</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Available for Full Stack / Cloud Roles</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}>
            <h4 className="font-bold mb-4 text-[#FCA311] text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-slate-300 text-xs font-semibold">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  {link.isPage ? (
                    <RouterLink
                      to={link.to}
                      className="cursor-pointer hover:text-[#FCA311] transition-colors duration-300"
                    >
                      {link.name}
                    </RouterLink>
                  ) : isHome ? (
                    <ScrollLink
                      to={link.to}
                      smooth={true}
                      duration={500}
                      offset={-80}
                      className="cursor-pointer hover:text-[#FCA311] transition-colors duration-300"
                    >
                      {link.name}
                    </ScrollLink>
                  ) : (
                    <RouterLink
                      to={`/#${link.to}`}
                      className="cursor-pointer hover:text-[#FCA311] transition-colors duration-300"
                    >
                      {link.name}
                    </RouterLink>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} viewport={{ once: true }}>
            <h4 className="font-bold mb-4 text-[#FCA311] text-sm uppercase tracking-wider">Follow Me</h4>
            <div className="flex gap-3">
              {socials.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#FCA311] text-slate-300 hover:text-[#FCA311] text-base transition-colors duration-300"
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

        <div className="pt-8 text-center text-slate-400 text-xs border-t border-slate-800/80">
          <p>&copy; {currentYear} Rupesh Yadav. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;