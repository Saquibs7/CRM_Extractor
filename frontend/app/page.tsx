"use client";

import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { CSVPreview } from "@/components/CSVPreview";
import { ImportResults } from "@/components/ImportResults";
import { Header } from "@/components/Header";
import { useImportStore } from "@/lib/store";

type Step = "upload" | "preview" | "results";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const { resetStore } = useImportStore();

  const handleRestart = () => {
    resetStore();
    setCurrentStep("upload");
  };

  const handlePreview = () => {
    setCurrentStep("preview");
  };

  const handleConfirm = () => {
    setCurrentStep("results");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F8FAFC_0%,#F4F7FB_100%)] text-slate-900 dark:bg-[linear-gradient(180deg,#111827_0%,#1f2937_100%)] dark:text-slate-100">
      <Header onRestart={handleRestart} currentStep={currentStep} />

      <main className="mx-auto flex max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {currentStep === "upload" && <FileUploader onComplete={handlePreview} />}

        {currentStep === "preview" && <CSVPreview onConfirm={handleConfirm} onBack={handleRestart} />}

        {currentStep === "results" && <ImportResults onRestart={handleRestart} />}
      </main>
    </div>
  );
}
