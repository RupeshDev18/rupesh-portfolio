import React from "react";
import { AiFillTwitterCircle, AiFillGithub, AiFillInstagram } from "react-icons/ai";
import { FaFacebook, FaLinkedinIn } from "react-icons/fa";
import { GitHub, LinkedIn, Instagram, Twitter, Facebook } from "../../data/data";

const SocialLinks = () => {
  return (
    <ul className="flex gap-4">
      <li>
        <a
          href={GitHub}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub Profile"
          className="w-10 h-10 rounded-full border border-black dark:border-gray-700 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white transition-all text-xl hover:scale-110"
        >
          <AiFillGithub />
        </a>
      </li>
      <li>
        <a
          href={LinkedIn}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn Profile"
          className="w-10 h-10 rounded-full border border-black dark:border-gray-700 flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-black dark:text-white transition-all text-xl hover:scale-110"
        >
          <FaLinkedinIn />
        </a>
      </li>
      <li>
        <a
          href={Instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram Profile"
          className="w-10 h-10 rounded-full border border-black dark:border-gray-700 flex items-center justify-center hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 text-black dark:text-white transition-all text-xl hover:scale-110"
        >
          <AiFillInstagram />
        </a>
      </li>
      <li>
        <a
          href={Facebook}
          aria-label="Facebook Profile"
          className="w-10 h-10 rounded-full border border-black dark:border-gray-700 flex items-center justify-center hover:bg-blue-800 hover:text-white dark:hover:bg-blue-800 text-black dark:text-white transition-all text-xl hover:scale-110"
        >
          <FaFacebook />
        </a>
      </li>
      <li>
        <a
          href={Twitter}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter Profile"
          className="w-10 h-10 rounded-full border border-black dark:border-gray-700 flex items-center justify-center hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 text-black dark:text-white transition-all text-xl hover:scale-110"
        >
          <AiFillTwitterCircle />
        </a>
      </li>
    </ul>
  );
};

export default SocialLinks;
