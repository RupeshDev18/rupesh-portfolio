import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { scroller } from "react-scroll";
import Hero from "../components/hero/Hero";
import About from "../components/about/About";
import Achievements from "../components/achievements/Achievements";
import Skills from "../components/skills/Skills";
import Projects from "../components/projects/Projects";
import Experience from "../components/experience/Experience";
import Blog from "../components/blog/Blog";
import Contact from "../components/contact/Contact";
import SEO from "../components/seo/SEO";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const section = location.hash.replace("#", "");
      const timer = setTimeout(() => {
        scroller.scrollTo(section, {
          duration: 800,
          delay: 0,
          smooth: "easeInOutQuart",
          offset: -80, // Offset for navbar
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);

  return (
    <div>
      <SEO />
      <Hero />
      <About />
      <Achievements />
      <Skills />
      <Experience />
      <Projects />
      <Blog />
      <Contact />
    </div>
  );
};

export default Home;