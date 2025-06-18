"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkHighlight from "remark-highlight.js";

export default function Home() {
  const skills = [
    "Ansible", "Terraform", "Jenkins", "Docker", "Kubernetes", "AWS", "Azure", "Azure DevOps",
    "Git", "GitHub Actions", "Progress Chef", "Prometheus", "Grafana", "Helm", "Argo CD",
    "GitLab CI/CD", "HashiCorp Vault", "New Relic", "ELK Stack (Elasticsearch, Logstash, Kibana)",
    "Splunk", "SonarQube", "Artifactory", "Puppet", "GCP", "Oracle Cloud Infrastructure", "Openshift",
    "AWS Cloudformation", "ARM Templates", "OpenStack", "Sentry", "Nagios", "AWS CDK",
    "Amazon ECS & Fargate", "Azure Container Apps", "DataDog", "Fluentd",
    "Linux - RedHat, Ubuntu", "AWS Lambda, GCP Functions, Azure Functions"
  ];

  const levels = ["Beginner", "Intermediate", "Advanced"];

  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [toc, setToc] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [content, setContent] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
  if (selectedSkill && selectedLevel) fetchTOC();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkill, selectedLevel]);


  const fetchTOC = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: selectedSkill, level: selectedLevel, type: "toc" }),
      });
      const data = await res.json();
      const lines = data.result?.split("\n") || [];
      const filtered = lines.filter((line: string) => {
        const t = line.trim().toLowerCase();
        return t && !t.startsWith("table of contents") && !t.includes("good luck") && !t.includes("provides a comprehensive roadmap");
      });
      setToc(filtered);
    } catch (err) {
      console.error("TOC error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContent = async (topic: string) => {
    if (!topic) return;
    setContentLoading(true);
    setCurrentPage(0);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: selectedSkill, level: selectedLevel, topic, type: "content" }),
      });
      const data = await res.json();
      const normalized = data.result
        ?.replaceAll("\r\n", "\n")
        ?.replace(/(?<!\n)\*\*/g, "\n**")
        ?.replace(/\*\*(?!\n)/g, "**\n")
        ?.replace(/([^\n])\n(?=\* )/g, "$1\n\n")
        ?.replace(/([^\n])\n(?=#+ )/g, "$1\n\n")
        ?.replace(/\n{3,}/g, "\n\n");

      setContent(normalized || "No content found.");
    } catch (err) {
      console.error("Content error", err);
    } finally {
      setContentLoading(false);
    }
  };

  const splitContentIntoSections = (): string[] => {
    const parts = content.split(/##\s*\d+\.\s+/g).filter(Boolean);
    return parts.map((part, i) => `## ${i + 1}.\n\n${part.trim()}`);
  };

  const sections = splitContentIntoSections();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-4 pl-[5%] pr-[5%] sm:pl-[10%] sm:pr-[10%]">
      <div className="bg-white/80 p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4 items-center mb-4">
        <div className="w-full sm:w-1/3">
          <select className="w-full p-3 rounded shadow bg-white border border-purple-300" value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)}>
            <option value="" disabled>Select a Skill</option>
            {skills.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-1/3">
          <select className="w-full p-3 rounded shadow bg-white border border-pink-300" value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}>
            <option value="" disabled>Select Level</option>
            {levels.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="w-full sm:w-1/3 flex justify-end items-center gap-4 pr-2">
          {loading && <Loader2 className="animate-spin text-blue-600 w-6 h-6" />}
          <a href="https://instagram.com/developwithpunit" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
              <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm4.25 3a5.75 5.75 0 1 1 0 11.5a5.75 5.75 0 0 1 0-11.5Zm0 1.5a4.25 4.25 0 1 0 0 8.5a4.25 4.25 0 0 0 0-8.5ZM17 6.25a.75.75 0 1 1 1.5 0a.75.75 0 0 1-1.5 0Z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row h-[80vh] gap-4">
        <div className="w-full sm:w-1/3 overflow-y-auto bg-white/70 p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-purple-800 mb-3">Table of Contents</h2>
          {!loading && toc.length === 0 && <p className="text-gray-500 italic">TOC will appear here once both options are selected.</p>}
          <div className={`space-y-1 text-blue-800 text-sm font-medium ${contentLoading ? "opacity-50 pointer-events-none" : ""}`}>
            {toc.map((line, i) => {
              const clean = line.replace(/^\*+\s*/, "").replace(/\*\*+/g, "").trim();
              const selected = clean === selectedTopic;
              return (
                <div
                  key={i}
                  className={`cursor-pointer px-2 py-1 rounded ${selected ? "text-purple-800 font-semibold" : ""} hover:underline transition duration-150`}
                  onClick={() => !contentLoading && (setSelectedTopic(clean), fetchContent(clean))}
                >
                  {line}
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full sm:w-2/3 overflow-y-auto bg-white/90 p-6 rounded-xl shadow-lg">
          {contentLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-purple-600 w-8 h-8" />
            </div>
          ) : content ? (
            <>
              <h3 className="text-2xl font-semibold mb-4 text-purple-700">{selectedTopic}</h3>
              <div className="bg-gray-900 text-white p-4 rounded-xl shadow-inner border border-purple-200 overflow-auto min-h-[300px] prose prose-invert prose-pre:bg-black prose-pre:text-white prose-pre:rounded-md">
                <ReactMarkdown
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  remarkPlugins={[remarkGfm, remarkHighlight] as any}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  rehypePlugins={[rehypeRaw] as any}
                   >
                  {sections[currentPage]}</ReactMarkdown>
              </div>
              <div className="flex justify-between mt-4">
                <button className="bg-purple-200 text-purple-900 px-4 py-2 rounded shadow hover:bg-purple-300 disabled:opacity-50" disabled={currentPage === 0} onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}>⬅️ Prev</button>
                <span className="text-gray-600 mt-2">Page {currentPage + 1} of {sections.length}</span>
                <button className="bg-purple-200 text-purple-900 px-4 py-2 rounded shadow hover:bg-purple-300 disabled:opacity-50" disabled={currentPage >= sections.length - 1} onClick={() => setCurrentPage(prev => Math.min(sections.length - 1, prev + 1))}>Next ➡️</button>
              </div>
            </>
          ) : <p className="text-gray-500 italic">Select a topic to view content.</p>}
        </div>
      </div>
    </div>
  );
}