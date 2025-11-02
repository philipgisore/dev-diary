import React, { useState, useEffect, useRef } from "react";
import { Upload, FileText, Briefcase, X } from "lucide-react";
import BeginAnalysis from "../components/BeginAnalysis";
import { saveUpload } from "../utils/storage";

export default function ResumeUpload() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeBase64, setResumeBase64] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Load saved data
  useEffect(() => {
    const storedFileName = localStorage.getItem("resumeFileName");
    const storedFileContent = localStorage.getItem("resumeFileContent");
    const storedDesc = localStorage.getItem("jobDescription");

    if (storedFileName) setResumeFile(storedFileName);
    if (storedFileContent) setResumeBase64(storedFileContent);
    if (storedDesc) setJobDescription(storedDesc);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (resumeFile) localStorage.setItem("resumeFileName", resumeFile);
    else localStorage.removeItem("resumeFileName");

    if (resumeBase64) localStorage.setItem("resumeFileContent", resumeBase64);
    else localStorage.removeItem("resumeFileContent");

    if (jobDescription)
      localStorage.setItem("jobDescription", jobDescription);
    else localStorage.removeItem("jobDescription");
  }, [resumeFile, resumeBase64, jobDescription]);

  // Convert file to Base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Validate and upload file
  const handleFile = async (file) => {
    if (!file) return;

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Unsupported file format. Please upload a PDF or Word document.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Max 10MB allowed.");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setResumeFile(file.name);
      setResumeBase64(base64);
      saveUpload({ name: file.name, content: base64 }); // safer than raw File
    } catch (err) {
      console.error("Error reading file:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  // Drag & Drop handling
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  // Handle dragging outside the window (prevent stuck state)
  useEffect(() => {
    const handleGlobalDragEnd = () => setDragActive(false);
    window.addEventListener("dragend", handleGlobalDragEnd);
    window.addEventListener("drop", handleGlobalDragEnd);
    return () => {
      window.removeEventListener("dragend", handleGlobalDragEnd);
      window.removeEventListener("drop", handleGlobalDragEnd);
    };
  }, []);

  // Remove file
  const handleRemoveFile = () => {
    setResumeFile(null);
    setResumeBase64(null);
    localStorage.removeItem("resumeFileName");
    localStorage.removeItem("resumeFileContent");
    if (fileInputRef.current) fileInputRef.current.value = null; // reset file input
  };

  // Upload to backend (optional AI call)
  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      console.log("Server response:", data);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <section className="w-full flex justify-center items-center py-12 pt-20 px-4">
      <div className="w-full max-w-5xl bg-gradient-to-br from-[#173465] via-[#244865] to-[#2F3E6D] rounded-[24px] p-6 sm:p-10 shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Upload className="w-5 h-5 text-white" />
          <h2 className="text-white text-xl sm:text-2xl font-bold font-sans">
            Upload your resume
          </h2>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative w-full min-h-[200px] sm:min-h-[220px] border-2 border-dashed p-6 sm:p-8 text-center transition-all duration-200 cursor-pointer
            bg-gradient-to-r from-[#1C4278] via-[#1F476A] to-[#343C74]
            rounded-2xl shadow-lg border-[#274879]
            ${
              dragActive
                ? "ring-2 ring-blue-400"
                : "hover:border-white/10 hover:translate-y-1"
            }`}
          role="button"
          aria-label="Upload your resume by clicking or dragging and dropping a file"
          aria-describedby="resume-upload-description"
        >
          <input
            ref={fileInputRef}
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="space-y-3 mt-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 rounded-lg flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-blue-200" />
            </div>

            {resumeFile ? (
              <div>
                <p className="text-white/80 mt-1 truncate">
                  📄 {resumeFile} uploaded successfully
                </p>
                <p className="text-blue-200 text-sm mt-2">
                  Click to change file
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent triggering input click
                    handleRemoveFile();
                  }}
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1 text-xs text-white bg-red-500/70 hover:bg-red-500 rounded-md transition"
                >
                  <X className="w-3 h-3" /> Remove File
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-white font-semibold">
                  Drag & Drop your Resume
                </h3>
                <p
                  id="resume-upload-description"
                  className="text-blue-200 mt-2"
                >
                  Supports PDF, DOC, DOCX up to 10MB
                </p>
                <p className="text-blue-300 text-sm mt-2 mb-8">
                  Click to browse files from device
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="flex items-center gap-2 mb-3 mt-10">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-lg">
            Target Job Description
          </h3>
        </div>

        <p className="font-light text-white/80 mb-4">
          Paste the complete job description for AI-powered keyword analysis and
          optimization recommendations.
        </p>

        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the complete job description here..."
          className="w-full mt-3 p-4 border border-white/10 rounded-xl text-white font-light font-sans bg-transparent
            focus:outline-none focus:ring-2 focus:ring-white/10 hover:focus:border-white/30
            placeholder:text-gray-400 text-sm sm:text-base"
          rows="9"
        />

        {/* Begin AI analysis */}
        <BeginAnalysis
          resumeFile={resumeFile}
          resumeBase64={resumeBase64}
          jobDescription={jobDescription}
        />
      </div>
    </section>
  );
}

