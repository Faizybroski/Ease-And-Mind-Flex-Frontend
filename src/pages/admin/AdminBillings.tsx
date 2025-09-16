// import { useAuth } from "@/contexts/AuthContext";
// import { useProfile } from "@/hooks/useProfile";
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { format, subMonths, getMonth, getYear } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
// import { sendEventInvite } from "@/lib/sendInvite";
import {
  AlertTriangle,
  Ban,
  BarChart3,
  Euro,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  Star,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
  UserX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import UserBillingDetailsPage from "@/pages/admin/UserBillingDetailsPage"

const profile = {
  role: "admin",
  firstName: "Hasan",
  lastName: "Munir",
};

const AdminBilling = () => {
  // const { user, signOut } = useAuth();
  // const { profile } = useProfile();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setdata] = useState([]);

  useEffect(() => {
    if (profile && profile.role === "admin") {
      fetchBillingData();
    }
  }, [profile]);

  const fetchBillingData = async () => {
    try {
      setdata([
        {
          id: 1,
          profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
          name: "John Doe",
          email: "ali.raza@example.com",
          totalBookings: 2,
          revenue: 1200,
        },
        {
          id: 2,
          profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
          name: "Jane Smith",
          email: "fatima.khan@example.com",
          totalBookings: 4,
          revenue: 921,
        },
        {
          id: 3,
          profilePic: "https://randomuser.me/api/portraits/men/65.jpg",
          name: "Mike Johnson",
          email: "ahmed.malik@example.com",
          totalBookings: 10,
          revenue: 123,
        },
        {
          id: 4,
          name: "Ayesha Khan",
          profilePic: "https://randomuser.me/api/portraits/women/44.jpg",
          email: "ayesha.siddiqui@example.com",
          totalBookings: 7,
          revenue: 675,
        },
        {
          id: 5,
          name: "Bilal Ahmad",
          profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
          email: "hina.qureshi@example.com",
          totalBookings: 83,
          revenue: 786,
        },
        {
          id: 6,
          profilePic: "https://randomuser.me/api/portraits/men/65.jpg",
          name: "Mike Johnson",
          email: "usman.tariq@example.com",
          totalBookings: 101,
          revenue: 908,
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({ title: "Error loading dashboard data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedId(null);
  };

  const handleViewMore = (userId: string) => {
    setSelectedId(userId);
  };

  if (selectedId) {
    return <UserBillingDetailsPage userId={selectedId} onBack={handleBack} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <header>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Billing & Invoicing
            </h1>
            <p className="text-primary text-sm">
              Manage Your Last Month Billing & Invoicing.
            </p>
          </div>
        </div>
      </header>

      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="p-0 m-0 overflow-x-auto flex flex-col gap-2">
          {data.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-1 md:grid-cols-3 items-center p-3 border border-primary/50 hover:bg-secondary rounded-md gap-4"
            >
              <div>
                <p className="font-medium text-primary">{user.name}</p>
                <span className="text-sm text-foreground">{user.email}</span>
              </div>
              <div className="flex space-x-6">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-primary/70">
                  {user.totalBookings}
                  {" bookings"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Euro className="h-4 w-4 text-primary" />
                <span className="text-primary/70">
                  {user.revenue}
                  {" spent"}
                </span>
              </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="text-secondary bg-primary border border-primary hover:bg-secondary hover:text-primary"
                  onClick={() => handleViewMore(user.id)}
                >
                  View More
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBilling;
