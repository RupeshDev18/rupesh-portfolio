import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiMapPin, FiPhone, FiLinkedin, FiFileText, FiCalendar } from "react-icons/fi";
import portfolioData from "../../data/data.json";

const Contact = ({ darkMode }) => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    { icon: <FiMail className="text-2xl" />, title: "Email", info: portfolioData.email, link: portfolioData.socials.email },
    { icon: <FiPhone className="text-2xl" />, title: "Phone", info: portfolioData.phone, link: `tel:${portfolioData.phone.replace(/[^0-9+]/g, '')}` },
    { icon: <FiCalendar className="text-2xl" />, title: "Schedule", info: "Let's meet", link: "#" }
  ];

  return (
    <section id="contact" className="py-20 px-6 bg-white dark:bg-slate-950 dark:bg-gradient-to-br dark:from-slate-950 dark:via-teal-950/10 dark:to-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.h2 className="text-[36px] font-bold mb-4 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          Get In <span className="text-teal-600 dark:text-cyan-400">Touch</span>
        </motion.h2>

        <motion.p className="text-center text-[16px] text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}>
          Have a project in mind? Reach out and let's create something amazing!
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-5 flex flex-col justify-start gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-[36px] font-bold mb-4 text-gray-900 dark:text-white">Let's build something together.</h3>
              <p className="text-[16px] text-gray-600 dark:text-gray-400 leading-relaxed">
                Whether you have a question, a project idea, or just want to say hi, I'll try my best to get back to you!
              </p>
            </motion.div>

            <div className="flex flex-col gap-6">
              {contactInfo.map((info, idx) => (
                <motion.a
                  key={idx}
                  href={info.link}
                  className="flex items-center gap-6 group"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-teal-600 dark:text-cyan-400 flex-shrink-0 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-full border border-gray-100 dark:border-slate-800 transition-all duration-300 group-hover:scale-110 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30">
                    {info.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-[22px] font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-cyan-400 transition-colors">{info.title}</h3>
                    <p className="text-[16px] text-gray-600 dark:text-gray-400 font-medium">{info.info}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <motion.div
            className="lg:col-span-7 bg-gray-50/50 dark:bg-slate-900/60 dark:backdrop-blur-md p-8 rounded-lg border border-gray-200 dark:border-teal-500/20 shadow-md"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-medium mb-2 text-gray-900 dark:text-white">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-cyan-400/50 focus:border-teal-500 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all shadow-sm hover:shadow-md"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-2 text-gray-900 dark:text-white">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-cyan-400/50 focus:border-teal-500 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all shadow-sm hover:shadow-md"
                    placeholder="Your Email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium mb-2 text-gray-900 dark:text-white">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-cyan-400/50 focus:border-teal-500 dark:focus:border-cyan-400 text-gray-900 dark:text-white transition-all shadow-sm hover:shadow-md"
                  placeholder="Subject"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium mb-2 text-gray-900 dark:text-white">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 dark:focus:ring-cyan-400/50 focus:border-teal-500 dark:focus:border-cyan-400 resize-none text-gray-900 dark:text-white transition-all shadow-sm hover:shadow-md"
                  placeholder="Your Message"
                  required
                ></textarea>
              </div>

              <motion.button
                type="submit"
                className="w-full px-8 py-3 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-650 hover:to-blue-755 text-white font-extrabold rounded-lg shadow-md hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(13,148,136,0.3)] transition-all uppercase tracking-wider text-[13px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;