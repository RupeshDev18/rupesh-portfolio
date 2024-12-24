import React, { useState } from "react";
import { experiences, educations } from "../../data/data";
const Resume = () => {
  // State to manage the current section for Experience and Education
  const [activeExperience, setActiveExperience] = useState(0);
  const [activeEducation, setActiveEducation] = useState(0);

  // Function to handle dot click and change active section for Experience
  const handleExperienceDotClick = (index) => {
    setActiveExperience(index);
  };

  // Function to handle dot click and change active section for Education
  const handleEducationDotClick = (index) => {
    setActiveEducation(index);
  };

  return (
    <div id="resume" className="container m-auto mt-16">
      {/* Heading */}
      <div data-aos="fade-up" className="relative mb-5">
        <h3 className="text-3xl font-black text-gray-400 sm:text-2xl">
          Resume
        </h3>
        <span className="h-[1.1px] right-0 absolute w-[92%] bg-gray-300 block"></span>
      </div>
      <div data-aos="fade-up" className="left flex-1 w-full">
        <p className="text-gray-700 font-medium w-[100%]">
          Here are my experiences and qualifications.
        </p>
      </div>

      {/* Experience and Education Sections Side by Side */}
      <div className="card-wrapper w-[90%] sm:w-full mt-5 flex md:flex-col sm:gap-5 mx-auto gap-40">
        {/* Experience Section */}
        <div className="w-[35%] sm:w-full md:w-full mr-10 sm:mr-0">
          {" "}
          {/* Added responsive margin */}
          <fieldset
            data-aos="zoom-in"
            className="w-full p-5 py-12 sm:py-8 sm:w-full sm:p-2"
          >
            <legend className="w-auto ml-[50%] translate-x-[-50%] border-2 border-gray-200 rounded-3xl py-1 px-8 font-semibold text-xl text-yellow-500">
              Experience
            </legend>

            {/* Display the active experience */}
            <div className="relative">
              {/* Design */}
              <div className="design flex absolute left-[-150px] top-1/2 items-center rotate-[90deg] sm:left-[-160px]">
                <div className="c1 w-[12px] h-[12px] rounded-full bg-white border-2 border-yellow-500"></div>
                <div className="line w-[230px] bg-gray-300 h-[2px] sm:w-[250px]"></div>
                <div className="c2 w-[12px] h-[12px] rounded-full bg-white border-2 border-yellow-500"></div>
              </div>
              <div className="flex flex-col gap-1 sm:gap-1 border-2 border-yellow-400 shadow-[0px_0px_16px_1px_rgba(0,0,0,0.1)] p-3 rounded-lg">
                <h1 className="text-[1.4rem] font-semibold sm:text-xl">
                  {experiences[activeExperience].title}
                </h1>
                <span className="text-[.9rem] font-semibold text-gray-500 sm:text-base">
                  {experiences[activeExperience].company}
                </span>
                <span className="text-[.9rem] font-semibold text-yellow-500 sm:text-base">
                  {experiences[activeExperience].period}
                </span>
                <p className="text-[.9rem] text-justify break-words text-gray-500">
                  {experiences[activeExperience].description}
                </p>
              </div>
            </div>
          </fieldset>
          {/* Dots for Experience Section */}
          <div className="flex justify-center mt-5">
            {experiences.map((_, index) => (
              <button
                key={index}
                className={`mx-2 w-3 h-3 rounded-full ${
                  index === activeExperience ? "bg-yellow-500" : "bg-gray-300"
                }`}
                onClick={() => handleExperienceDotClick(index)}
              ></button>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="w-[35%] sm:w-full md:w-full">
          <fieldset
            data-aos="zoom-in"
            className="w-full p-5 py-12 sm:py-8 sm:w-full sm:p-2"
          >
            <legend className="w-auto ml-[50%] translate-x-[-50%] border-2 border-gray-200 rounded-3xl py-1 px-8 font-semibold text-xl text-yellow-500">
              Education
            </legend>

            {/* Display the active education */}
            <div className="relative">
              {/* Design */}
              <div className="design flex absolute left-[-150px] top-1/2 items-center rotate-[90deg] sm:left-[-160px]">
                <div className="c1 w-[12px] h-[12px] rounded-full bg-white border-2 border-yellow-500"></div>
                <div className="line w-[230px] bg-gray-300 h-[2px] sm:w-[250px]"></div>
                <div className="c2 w-[12px] h-[12px] rounded-full bg-white border-2 border-yellow-500"></div>
              </div>
              <div className="flex flex-col gap-1 sm:gap-1 border-2 border-yellow-400 shadow-[0px_0px_16px_1px_rgba(0,0,0,0.1)] p-3 rounded-lg">
                <h1 className="text-[1.4rem] font-semibold sm:text-xl">
                  {educations[activeEducation].title}
                </h1>
                <span className="text-[.9rem] font-semibold text-gray-500 sm:text-base">
                  {educations[activeEducation].school}
                </span>
                <span className="text-[.9rem] font-semibold text-yellow-500 sm:text-base">
                  {educations[activeEducation].period}
                </span>
                <p className="text-[.9rem] text-justify text-gray-500">
                  {educations[activeEducation].description}
                </p>
              </div>
            </div>
          </fieldset>

          {/* Dots for Education Section */}
          <div className="flex justify-center mt-5">
            {educations.map((_, index) => (
              <button
                key={index}
                className={`mx-2 w-3 h-3 rounded-full ${
                  index === activeEducation ? "bg-yellow-500" : "bg-gray-300"
                }`}
                onClick={() => handleEducationDotClick(index)}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;
