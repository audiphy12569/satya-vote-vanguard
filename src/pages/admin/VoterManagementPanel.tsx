import { VoterManagement } from "@/components/admin/VoterManagement";

export const VoterManagementPanel = () => {
  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Voter Management
      </h1>
      <div className="max-w-4xl mx-auto">
        <VoterManagement />
      </div>
    </div>
  );
};