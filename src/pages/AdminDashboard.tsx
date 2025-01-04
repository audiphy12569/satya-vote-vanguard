import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Vote } from "lucide-react";

export const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className="hover-scale cursor-pointer"
          onClick={() => navigate("/admin/voters")}
        >
          <CardHeader>
            <Users className="w-8 h-8 mb-2" />
            <CardTitle>Voter Management</CardTitle>
            <CardDescription>
              Approve new voters and manage existing ones
            </CardDescription>
          </CardHeader>
        </Card>

        <Card 
          className="hover-scale cursor-pointer"
          onClick={() => navigate("/admin/candidates")}
        >
          <CardHeader>
            <UserPlus className="w-8 h-8 mb-2" />
            <CardTitle>Candidate Management</CardTitle>
            <CardDescription>
              Add and remove election candidates
            </CardDescription>
          </CardHeader>
        </Card>

        <Card 
          className="hover-scale cursor-pointer"
          onClick={() => navigate("/admin/election")}
        >
          <CardHeader>
            <Vote className="w-8 h-8 mb-2" />
            <CardTitle>Election Control</CardTitle>
            <CardDescription>
              Start elections and view results
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};