"use client";

import { useState } from 'react';
import { AnonymousCandidate } from '@/lib/types';

interface FormattedCVProps {
  candidate: AnonymousCandidate;
}

export default function FormattedCV({ candidate }: FormattedCVProps) {
  const [selectedDesign, setSelectedDesign] = useState<1 | 2 | 3>(1);

  const renderDesign1 = () => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1px]">
      <div className="rounded-2xl bg-white p-0 dark:bg-neutral-950">
        <div className="grid gap-0 md:grid-cols-[300px_1fr]">
          {/* Left Sidebar */}
          <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 p-8 text-white">
            <div className="absolute inset-0 -z-10 opacity-10" aria-hidden>
              <svg viewBox="0 0 200 200" className="h-full w-full">
                <defs>
                  <linearGradient id="g1" x1="0" x2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="80" fill="url(#g1)" opacity="0.3"/>
                <circle cx="150" cy="50" r="30" fill="url(#g1)" opacity="0.2"/>
              </svg>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Anonymous Candidate</h2>
              <p className="text-blue-200 font-medium">{candidate.title}</p>
              <p className="text-xs text-blue-300 mt-2">ID: {candidate.id}</p>
            </div>
            
            {/* Skills */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200 mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <span key={skill} className="bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Cultural Fit */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200 mb-3">Cultural Fit</h3>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`text-lg ${star <= candidate.culturalFitRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-xs text-blue-200">
                {candidate.culturalFitRating}/5 Rating
              </p>
            </div>
          </div>
          
          {/* Right Content */}
          <div className="p-8">
            <div className="prose prose-neutral max-w-none">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Professional Summary</h3>
              <div className="text-slate-600 dark:text-slate-300 mb-8" dangerouslySetInnerHTML={{ __html: candidate.summary }} />
              
              {/* Dynamic Sections based on sectionOrder */}
              {candidate.sectionOrder.map((sectionType) => {
                switch (sectionType) {
                  case 'experience':
                    return (
                      <div key="experience" className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Experience</h3>
                        <div className="space-y-6">
                          {candidate.experience.map((exp, idx) => (
                            <div key={idx} className="border-l-4 border-blue-500 pl-4">
                              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200">{exp.role}</h4>
                                <span className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{exp.period}</span>
                              </div>
                              <p className="text-blue-600 font-medium mb-2">{exp.company}</p>
                              <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                                {exp.details.map((detail, i) => (
                                  <li key={i}>{detail}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  
                  case 'education':
                    return (
                      <div key="education" className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Education</h3>
                        <div className="space-y-3">
                          {candidate.education.map((edu, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">{edu.degree}</h4>
                                  <p className="text-slate-600 dark:text-slate-300">{edu.school}</p>
                                </div>
                                <span className="text-sm text-slate-500 bg-white dark:bg-slate-700 px-2 py-1 rounded">{edu.period}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  
                  case 'skills':
                    return (
                      <div key="skills" className="mb-8">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Technical Skills</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {candidate.skills.map((skill) => (
                            <div key={skill} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 py-2 rounded-lg text-center font-medium text-slate-700 dark:text-slate-200 shadow-sm">
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  
                  default:
                    return null;
                }
              })}
              
              {/* LinkedIn Questions if available */}
              {candidate.linkedinQuestions && candidate.linkedinQuestions.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">Professional Insights</h3>
                  <div className="space-y-4">
                    {candidate.linkedinQuestions.slice(0, 2).map((q) => (
                      <div key={q.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">{q.question}</h4>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{q.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDesign2 = () => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 p-[1px]">
      <div className="rounded-2xl bg-white p-0 dark:bg-neutral-950">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Anonymous Candidate</h1>
            <p className="text-orange-100 text-lg">{candidate.title}</p>
            <p className="text-orange-200 text-sm mt-1">ID: {candidate.id}</p>
          </div>
        </div>

        <div className="p-8">
          {/* Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b-2 border-orange-500 pb-2">
              Professional Summary
            </h2>
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: candidate.summary }} />
          </div>

          {/* Dynamic Sections */}
          {candidate.sectionOrder.map((sectionType) => {
            switch (sectionType) {
              case 'experience':
                return (
                  <div key="experience" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b-2 border-orange-500 pb-2">
                      Professional Experience
                    </h2>
                    <div className="space-y-6">
                      {candidate.experience.map((exp, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6 border-l-4 border-orange-500">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{exp.role}</h3>
                            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">{exp.period}</span>
                          </div>
                          <h4 className="text-lg font-medium text-orange-600 dark:text-orange-400 mb-3">{exp.company}</h4>
                          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
                            {exp.details.map((detail, i) => (
                              <li key={i}>{detail}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              
              case 'education':
                return (
                  <div key="education" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b-2 border-orange-500 pb-2">
                      Education
                    </h2>
                    <div className="grid gap-4">
                      {candidate.education.map((edu, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{edu.degree}</h3>
                              <p className="text-orange-600 dark:text-orange-400 font-medium">{edu.school}</p>
                            </div>
                            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-medium">{edu.period}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              
              case 'skills':
                return (
                  <div key="skills" className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b-2 border-orange-500 pb-2">
                      Skills & Competencies
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {candidate.skills.map((skill) => (
                        <span key={skill} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              
              default:
                return null;
            }
          })}

          {/* Cultural Fit */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b-2 border-orange-500 pb-2">
              Cultural Fit Assessment
            </h2>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-2xl ${star <= candidate.culturalFitRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {candidate.culturalFitRating}/5 Rating
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Based on professional experience, skills diversity, and cultural alignment assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDesign3 = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      {/* Minimalist Header */}
      <div className="bg-gray-50 dark:bg-gray-800 p-8 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-2">Anonymous Candidate</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 font-light">{candidate.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">ID: {candidate.id}</p>
        </div>
      </div>

      <div className="p-8">
        {/* Summary */}
        <div className="mb-12">
          <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">Summary</h2>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: candidate.summary }} />
        </div>

        {/* Dynamic Sections */}
        {candidate.sectionOrder.map((sectionType) => {
          switch (sectionType) {
            case 'experience':
              return (
                <div key="experience" className="mb-12">
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-8">Experience</h2>
                  <div className="space-y-8">
                    {candidate.experience.map((exp, idx) => (
                      <div key={idx} className="border-l-2 border-gray-300 dark:border-gray-600 pl-8">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-medium text-gray-900 dark:text-white">{exp.role}</h3>
                          <span className="text-gray-500 dark:text-gray-400 text-sm">{exp.period}</span>
                        </div>
                        <h4 className="text-lg text-gray-600 dark:text-gray-300 mb-4">{exp.company}</h4>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                          {exp.details.map((detail, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-gray-400 dark:text-gray-500 mr-3 mt-1">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            
            case 'education':
              return (
                <div key="education" className="mb-12">
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-8">Education</h2>
                  <div className="space-y-6">
                    {candidate.education.map((edu, idx) => (
                      <div key={idx} className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{edu.degree}</h3>
                          <p className="text-gray-600 dark:text-gray-300">{edu.school}</p>
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{edu.period}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            
            case 'skills':
              return (
                <div key="skills" className="mb-12">
                  <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-8">Skills</h2>
                  <div className="flex flex-wrap gap-4">
                    {candidate.skills.map((skill) => (
                      <span key={skill} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            
            default:
              return null;
          }
        })}

        {/* Cultural Fit */}
        <div className="mb-12">
          <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6">Cultural Fit</h2>
          <div className="flex items-center gap-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={`text-xl ${star <= candidate.culturalFitRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ⭐
                </span>
              ))}
            </div>
            <span className="text-gray-600 dark:text-gray-300">
              {candidate.culturalFitRating}/5
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Design Selector */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-2 shadow-md">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedDesign(1)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedDesign === 1
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              Modern Sidebar
            </button>
            <button
              onClick={() => setSelectedDesign(2)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedDesign === 2
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              Indian Theme
            </button>
            <button
              onClick={() => setSelectedDesign(3)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedDesign === 3
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
            >
              Minimalist
            </button>
          </div>
        </div>
      </div>

      {/* Centered CV Design */}
      <div className="flex justify-center">
        <div className="w-full max-w-5xl transition-all duration-300">
          {selectedDesign === 1 && renderDesign1()}
          {selectedDesign === 2 && renderDesign2()}
          {selectedDesign === 3 && renderDesign3()}
        </div>
      </div>
    </div>
  );
}

