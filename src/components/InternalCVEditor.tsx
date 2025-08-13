"use client";

import { useState, useRef, ReactNode } from 'react';
import { AnonymousCandidate, CVSection } from '@/lib/types';

interface InternalCVEditorProps {
  candidate: AnonymousCandidate;
  onCandidateChange: (candidate: AnonymousCandidate) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{children}</h3>
  );
}

function RichTextToolbar({ targetRef }: { targetRef: React.RefObject<HTMLDivElement | null> }) {
  const execCommand = (command: string, value?: string) => {
    if (!targetRef.current) return;
    targetRef.current.focus();
    document.execCommand(command, false, value);
  };

  const handleColorChange = (color: string) => {
    execCommand('foreColor', color);
  };

  return (
    <div className="inline-flex flex-wrap overflow-hidden rounded-md border border-black/10 text-xs dark:border-white/10">
      <button
        type="button"
        className="px-2 py-1 font-bold hover:bg-black/5 dark:hover:bg-white/5"
        onClick={() => execCommand('bold')}
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        className="px-2 py-1 italic hover:bg-black/5 dark:hover:bg-white/5"
        onClick={() => execCommand('italic')}
        title="Italic"
      >
        I
      </button>
      <button
        type="button"
        className="px-2 py-1 underline hover:bg-black/5 dark:hover:bg-white/5"
        onClick={() => execCommand('underline')}
        title="Underline"
      >
        U
      </button>
      <select
        className="px-2 py-1 bg-transparent text-xs border-l border-black/10 dark:border-white/10"
        onChange={(e) => e.target.value && execCommand('fontName', e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Font</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times</option>
        <option value="Courier New">Courier</option>
      </select>
      <select
        className="px-2 py-1 bg-transparent text-xs border-l border-black/10 dark:border-white/10"
        onChange={(e) => e.target.value && execCommand('fontSize', e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Size</option>
        <option value="1">8px</option>
        <option value="2">10px</option>
        <option value="3">12px</option>
        <option value="4">14px</option>
        <option value="5">18px</option>
        <option value="6">24px</option>
        <option value="7">36px</option>
      </select>
      <div className="flex items-center border-l border-black/10 dark:border-white/10">
        <input
          type="color"
          className="w-6 h-6 border-none cursor-pointer"
          onChange={(e) => handleColorChange(e.target.value)}
          title="Text Color"
        />
      </div>
      <button
        type="button"
        className="px-2 py-1 hover:bg-black/5 dark:hover:bg-white/5 border-l border-black/10 dark:border-white/10"
        onClick={() => execCommand('removeFormat')}
        title="Clear formatting"
      >
        ✕
      </button>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-neutral-600 dark:text-neutral-400">{label}</span>
      <input
        className="rounded-md border border-black/10 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-blue-500 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function StarRating({ rating, onChange, readonly = false }: { 
  rating: number; 
  onChange?: (rating: number) => void; 
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange?.(star)}
          className={`text-lg transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } ${
            star <= rating 
              ? 'text-yellow-400' 
              : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          ⭐
        </button>
      ))}
      <span className="ml-2 text-sm text-neutral-600 dark:text-neutral-400">
        {rating}/5 Cultural Fit
      </span>
    </div>
  );
}

function SkillsSection({ 
  candidate, 
  isEditing, 
  onCandidateChange, 
  onAddSkill, 
  onRemoveSkill,
  newSkillRef,
  addNewSkill,
  draggingSkillIdx,
  setDraggingSkillIdx
}: {
  candidate: AnonymousCandidate;
  isEditing: boolean;
  onCandidateChange: (c: AnonymousCandidate) => void;
  onAddSkill: (s: string) => void;
  onRemoveSkill: (i: number) => void;
  newSkillRef?: React.RefObject<HTMLInputElement | null>;
  addNewSkill: () => void;
  draggingSkillIdx: number | null;
  setDraggingSkillIdx: (idx: number | null) => void;
}) {
  return (
    <>
      <SectionHeading>Skills</SectionHeading>
      {!isEditing ? (
        <div className="skills-container flex flex-wrap gap-2">
          {candidate.skills.map((s, i) => (
            <span key={i} className="skill-tag inline-flex items-center gap-2 rounded-full border border-black/10 bg-neutral-100 px-3 py-1 text-sm dark:border-white/10 dark:bg-neutral-800">{s}</span>
          ))}
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <input ref={newSkillRef} placeholder="Add a skill" className="flex-1 rounded-md border border-black/10 bg-white px-3 py-2 text-neutral-900 shadow-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-blue-500 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-100" />
            <button onClick={addNewSkill} className="rounded-md bg-neutral-900 px-3 py-2 text-white dark:bg-white dark:text-neutral-900">Add</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {candidate.skills.map((s, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => setDraggingSkillIdx(i)}
                onDragEnd={() => setDraggingSkillIdx(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggingSkillIdx === null || draggingSkillIdx === i) return;
                  const arr = [...candidate.skills];
                  const [moved] = arr.splice(draggingSkillIdx, 1);
                  arr.splice(i, 0, moved);
                  onCandidateChange({ ...candidate, skills: arr });
                  setDraggingSkillIdx(null);
                }}
                className={`group inline-flex cursor-move items-center gap-2 rounded-full border border-black/10 bg-neutral-100 px-3 py-1 text-sm transition-all dark:border-white/10 dark:bg-neutral-800 ${
                  draggingSkillIdx === i 
                    ? 'opacity-50 scale-95 rotate-3' 
                    : 'hover:bg-neutral-200 hover:shadow-md dark:hover:bg-neutral-700'
                }`}
              >
                <span className="text-xs text-neutral-400 select-none">⋮⋮</span>
                <span className="select-none">{s}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSkill(i);
                  }}
                  className="text-xs text-neutral-400 hover:text-red-600 hover:bg-red-100 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                  title="Remove skill"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function InternalCVEditor({ 
  candidate, 
  onCandidateChange, 
  onSave, 
  onDelete, 
  onClose 
}: InternalCVEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<1 | 2 | 3>(1);
  const newSkillRef = useRef<HTMLInputElement | null>(null);
  const [draggingSkillIdx, setDraggingSkillIdx] = useState<number | null>(null);
  const [draggingExpIdx, setDraggingExpIdx] = useState<number | null>(null);
  const [draggingSectionIdx, setDraggingSectionIdx] = useState<number | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);

  const addNewSkill = () => {
    const value = newSkillRef.current?.value?.trim() ?? "";
    if (!value) return;
    onCandidateChange({ ...candidate, skills: [...candidate.skills, value] });
    if (newSkillRef.current) newSkillRef.current.value = "";
  };

  const onAddSkill = (s: string) => {
    onCandidateChange({ ...candidate, skills: [...candidate.skills, s] });
  };

  const onRemoveSkill = (i: number) => {
    onCandidateChange({ ...candidate, skills: candidate.skills.filter((_, idx) => idx !== i) });
  };

  const printCV = () => window.print();

  const renderDesign1 = () => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1px]">
      <div className="rounded-2xl bg-white p-0 dark:bg-neutral-950">
        {/* Internal ID Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-600 text-white p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {candidate.id.substring(0, 2)}
              </div>
              <div>
                <h1 className="text-xl font-bold">{candidate.id}</h1>
                <p className="text-slate-300 text-sm">Internal Reference ID</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-sm">Anonymous CV</p>
              <p className="text-white font-medium">{candidate.title}</p>
            </div>
          </div>
        </div>

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
              <StarRating rating={candidate.culturalFitRating} readonly />
              <p className="text-xs text-blue-200 mt-2">
                Based on professional assessment
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-7xl max-h-[95vh] overflow-hidden rounded-2xl bg-white text-neutral-900 shadow-2xl dark:bg-neutral-900 dark:text-neutral-100"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-black/10 dark:border-white/10 px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Internal CV Editor</h1>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">ID: {candidate.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="rounded-md p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete CV"
            >
              🗑️
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/5"
              title="Close"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex border-b border-black/10 dark:border-white/10 px-6">
          <button
            onClick={() => setIsEditing(true)}
            className={`px-4 py-3 font-medium transition-colors ${
              isEditing
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            Edit CV
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className={`px-4 py-3 font-medium transition-colors ${
              !isEditing
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            }`}
          >
            View Formatted
          </button>
        </nav>

        {/* Content */}
        <section className="grid max-h-[calc(95vh-120px)] grid-rows-[1fr_auto] overflow-hidden">
          <div className="overflow-y-auto px-6 pb-6 pt-4">
            {isEditing ? (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <div className="flex flex-col gap-4 rounded-xl border border-black/10 p-5 shadow-sm dark:border-white/10 bg-white dark:bg-neutral-950">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <LabeledInput 
                        label="Job Title" 
                        value={candidate.title} 
                        onChange={(v) => onCandidateChange({ ...candidate, title: v })} 
                      />
                      <div className="md:col-span-2">
                        <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <span>Professional Summary</span>
                          <RichTextToolbar targetRef={summaryRef} />
                        </div>
                        <div
                          ref={summaryRef}
                          contentEditable
                          suppressContentEditableWarning
                          className="min-h-28 w-full rounded-md border border-black/10 bg-white p-3 text-neutral-900 shadow-sm outline-none ring-0 focus:border-blue-500 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-100"
                          onInput={(e) => onCandidateChange({ ...candidate, summary: (e.currentTarget as HTMLDivElement).innerHTML })}
                          dangerouslySetInnerHTML={{ __html: candidate.summary }}
                        />
                      </div>
                    </div>

                    {/* Cultural Fit Rating */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Cultural Fit Rating
                      </label>
                      <StarRating 
                        rating={candidate.culturalFitRating} 
                        onChange={(rating) => onCandidateChange({ ...candidate, culturalFitRating: rating })}
                      />
                    </div>

                    {/* Skills Section */}
                    <SkillsSection
                      candidate={candidate}
                      isEditing={isEditing}
                      onCandidateChange={onCandidateChange}
                      onAddSkill={onAddSkill}
                      onRemoveSkill={onRemoveSkill}
                      newSkillRef={newSkillRef}
                      addNewSkill={addNewSkill}
                      draggingSkillIdx={draggingSkillIdx}
                      setDraggingSkillIdx={setDraggingSkillIdx}
                    />

                    {/* Experience Section */}
                    <div>
                      <SectionHeading>Experience</SectionHeading>
                      <div className="grid gap-4">
                        {candidate.experience.map((exp, idx) => (
                          <div key={idx} className="rounded-lg border border-black/10 p-4 dark:border-white/10">
                            <div className="grid gap-3">
                              <LabeledInput 
                                label="Role" 
                                value={exp.role} 
                                onChange={(v) => {
                                  const copy = [...candidate.experience];
                                  copy[idx] = { ...copy[idx], role: v };
                                  onCandidateChange({ ...candidate, experience: copy });
                                }} 
                              />
                              <LabeledInput 
                                label="Company" 
                                value={exp.company} 
                                onChange={(v) => {
                                  const copy = [...candidate.experience];
                                  copy[idx] = { ...copy[idx], company: v };
                                  onCandidateChange({ ...candidate, experience: copy });
                                }} 
                              />
                              <LabeledInput 
                                label="Period" 
                                value={exp.period} 
                                onChange={(v) => {
                                  const copy = [...candidate.experience];
                                  copy[idx] = { ...copy[idx], period: v };
                                  onCandidateChange({ ...candidate, experience: copy });
                                }} 
                              />
                              <label className="grid gap-1 text-sm">
                                <span className="text-neutral-600 dark:text-neutral-400">Details (one per line)</span>
                                <textarea 
                                  className="h-24 rounded-md border border-black/10 bg-white p-3 text-neutral-900 shadow-sm outline-none ring-0 placeholder:text-neutral-400 focus:border-blue-500 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-100" 
                                  value={exp.details.join("\n")} 
                                  onChange={(e) => {
                                    const copy = [...candidate.experience];
                                    copy[idx] = { ...copy[idx], details: e.target.value.split("\n").filter(Boolean) };
                                    onCandidateChange({ ...candidate, experience: copy });
                                  }} 
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education Section */}
                    <div>
                      <SectionHeading>Education</SectionHeading>
                      <div className="grid gap-4">
                        {candidate.education.map((edu, idx) => (
                          <div key={idx} className="rounded-lg border border-black/10 p-4 dark:border-white/10">
                            <div className="grid gap-3">
                              <LabeledInput 
                                label="Degree" 
                                value={edu.degree} 
                                onChange={(v) => {
                                  const copy = [...candidate.education];
                                  copy[idx] = { ...copy[idx], degree: v };
                                  onCandidateChange({ ...candidate, education: copy });
                                }} 
                              />
                              <LabeledInput 
                                label="School" 
                                value={edu.school} 
                                onChange={(v) => {
                                  const copy = [...candidate.education];
                                  copy[idx] = { ...copy[idx], school: v };
                                  onCandidateChange({ ...candidate, education: copy });
                                }} 
                              />
                              <LabeledInput 
                                label="Period" 
                                value={edu.period} 
                                onChange={(v) => {
                                  const copy = [...candidate.education];
                                  copy[idx] = { ...copy[idx], period: v };
                                  onCandidateChange({ ...candidate, education: copy });
                                }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Panel */}
                <div className="rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                  <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{candidate.title}</h4>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1" dangerouslySetInnerHTML={{ __html: candidate.summary }} />
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Skills ({candidate.skills.length})</h4>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 5).map((skill) => (
                          <span key={skill} className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 5 && (
                          <span className="text-xs text-neutral-500">+{candidate.skills.length - 5} more</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">Experience ({candidate.experience.length})</h4>
                      <div className="space-y-2">
                        {candidate.experience.slice(0, 2).map((exp, idx) => (
                          <div key={idx} className="text-sm">
                            <div className="font-medium">{exp.role}</div>
                            <div className="text-neutral-600 dark:text-neutral-400">{exp.company} • {exp.period}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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
                        Professional
                      </button>
                    </div>
                  </div>
                </div>

                {/* CV Design */}
                <div className="flex justify-center">
                  <div className="w-full max-w-5xl transition-all duration-300">
                    {renderDesign1()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between gap-3 border-t border-black/10 px-6 py-3 dark:border-white/10">
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="rounded-lg border border-emerald-500/30 bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                  >
                    Save & View
                  </button>
                  <button 
                    onClick={onSave} 
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="rounded-lg border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    Edit CV
                  </button>
                  <button 
                    onClick={printCV} 
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
                  >
                    Download PDF
                  </button>
                </>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="rounded-lg border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              Close
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}
