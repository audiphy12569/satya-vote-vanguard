import { CandidateManagement } from "@/components/admin/CandidateManagement";

export const CandidateManagementPanel = () => {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Candidate Management
      </h1>
      <div className="max-w-4xl mx-auto">
        <CandidateManagement />
      </div>
    </div>
  );
};