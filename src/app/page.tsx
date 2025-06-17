"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
  const depths = ["Interview", "Basics", "DeepDive"];

  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDepth, setSelectedDepth] = useState("");
  const [loading, setLoading] = useState(false);
  const [toc, setToc] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (selectedSkill && selectedLevel && selectedDepth) {
      fetchTOC();
    }
  }, [selectedSkill, selectedLevel, selectedDepth]);

  const fetchTOC = async () => {
  setLoading(true);
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skill: selectedSkill,
        level: selectedLevel,
        depth: selectedDepth,
        type: "toc",
      }),
    });

    const data = await response.json();

    // Step 1: Split the lines
    const rawLines = data.result?.split("\n") || [];

    // Step 2: Filter out unwanted lines
    const filteredLines = rawLines.filter((line: string) => {
      const trimmed = line.trim().toLowerCase();
      return (
        trimmed &&
        !trimmed.startsWith("table of contents") &&
        !trimmed.includes("good luck") &&
        !trimmed.includes("practice") &&
        !trimmed.includes("remember") &&
        !trimmed.includes("provides a comprehensive roadmap")
      );
    });

    setToc(filteredLines);
  } catch (err) {
    console.error("Failed to fetch TOC", err);
  } finally {
    setLoading(false);
  }
};


  const fetchContent = async () => {
    if (!selectedTopic) return;
    setLoading(true);
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: selectedSkill,
          level: selectedLevel,
          depth: selectedDepth,
          topic: selectedTopic,
          type: "content"
        })
      });
      const data = await response.json();
      setContent(data.result || "No content found.");
    } catch (err) {
      console.error("Failed to fetch topic content", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-4">
      {/* Header */}
      <div className="bg-white/80 p-4 rounded-lg shadow grid grid-cols-3 gap-4 mb-4">
        <select
  className="w-full p-3 rounded shadow bg-white border border-purple-300"
  value={selectedSkill}
  onChange={(e) => setSelectedSkill(e.target.value)}
>

          <option value="" disabled>Select a Skill</option>
          {skills.map(skill => <option key={skill}>{skill}</option>)}
        </select>

        {selectedSkill && (
          <select
  className="w-full p-3 rounded shadow bg-white border border-pink-300"
  value={selectedLevel}
  onChange={(e) => setSelectedLevel(e.target.value)}
>

            <option value="" disabled>Select Level</option>
            {levels.map(level => <option key={level}>{level}</option>)}
          </select>
        )}

        {selectedLevel && (
          <select
  className="w-full p-3 rounded shadow bg-white border border-blue-300"
  value={selectedDepth}
  onChange={(e) => setSelectedDepth(e.target.value)}
>

            <option value="" disabled>Select Learning Mode</option>
            {depths.map(depth => <option key={depth}>{depth}</option>)}
          </select>
        )}

        {loading && <Loader2 className="animate-spin text-blue-600" />}
      </div>

      {/* Main Split Layout */}
      <div className="flex h-[80vh] gap-4">
        {/* TOC Column */}
        <div className="w-1/3 overflow-y-auto bg-white/70 p-4 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-purple-800 mb-3">Table of Contents</h2>
          {toc.length === 0 && !loading && (
            <p className="text-gray-500 italic">TOC will appear here once all options are selected.</p>
          )}
          <div className="space-y-3 text-blue-800 text-sm font-medium whitespace-pre-wrap">
  {toc
    .filter(line => /^[\-\*\d\.]*\s*\*?\*?/.test(line)) // Show only meaningful TOC lines
    .map((item, idx) => {
      const cleanItem = item
        .replace(/^\*+\s*/, "")           // remove leading asterisks
        .replace(/\*\*+/g, "")           // remove markdown bold
        .replace(/\s*\d+\.\s*$/, "");    // remove dangling "* 1."
      return (
        <div
          key={idx}
          className="cursor-pointer hover:text-purple-600 hover:underline"
          onClick={() => {
            setSelectedTopic(cleanItem);
            fetchContent();
          }}
        >
          {cleanItem}
        </div>
      );
    })}
</div>

        </div>

        {/* Content Column */}
        <div className="w-2/3 overflow-y-auto bg-white/90 p-6 rounded-xl shadow-lg">
          {content ? (
            <div className="prose prose-lg max-w-none whitespace-pre-wrap text-gray-800">
              {content}
            </div>
          ) : (
            <p className="text-gray-500 italic">Select a topic to view content.</p>
          )}
        </div>
      </div>
    </div>
  );
}
