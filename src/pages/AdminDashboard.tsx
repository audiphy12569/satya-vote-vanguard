import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Vote } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminCards = [
    {
      title: "Voter Management",
      description: "Approve new voters and manage existing ones",
      icon: Users,
      path: "/admin/voters",
    },
    {
      title: "Candidate Management",
      description: "Add and remove election candidates",
      icon: UserPlus,
      path: "/admin/candidates",
    },
    {
      title: "Election Control",
      description: "Start elections and view results",
      icon: Vote,
      path: "/admin/election",
    },
  ];

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Admin Dashboard
      </h1>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {adminCards.map((card) => (
          <Card 
            key={card.path}
            className="hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => navigate(card.path)}
          >
            <CardHeader>
              <card.icon className="w-8 h-8 mb-2 text-gray-700 dark:text-gray-300" />
              <CardTitle className="text-xl">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};