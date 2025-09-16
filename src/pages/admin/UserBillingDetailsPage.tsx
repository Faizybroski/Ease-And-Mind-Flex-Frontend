import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import AddUser from "@/components/addUser/AddUser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle,
  CreditCard,
  User,
  Edit,
  Eye,
  Clock,
  Euro,
  Filter,
  Mail,
  MapPin,
  Search,
  Trash2,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";

interface User {
  id: number | string;
  name: string;
  email: string;
}

const UserBillingDetailsPage = ({ userId, onBack }) => {
  // You can fetch details with react-query or props
  // Example mock data for now:
  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState<User | null>(null);

  const fetchBookings = async () => {
    try {
      setBookings([
        {
          id: 1,
          room: "Room A",
          timeSession: "Morning",
          time: "08:00 - 01:00",
          day: "Monday",
          date: "2025-09-15",
          revenue: 120,
        },
        {
          id: 2,
          room: "Room B",
          timeSession: "Afternoon",
          time: "01:00 - 06:00",
          day: "Tuesday",
          date: "2025-09-16",
          revenue: 200,
        },
        {
          id: 3,
          room: "Room C",
          timeSession: "Night",
          time: "06:00 - 10:00",
          day: "Wednesday",
          date: "2025-09-17",
          revenue: 95,
        },
        {
          id: 4,
          room: "Room A",
          timeSession: "Morning",
          time: "08:00 - 01:00",
          day: "Thursday",
          date: "2025-09-18",
          revenue: 300,
        },
        {
          id: 5,
          room: "Room B",
          timeSession: "Afternoon",
          time: "01:00 - 06:00",
          day: "Friday",
          date: "2025-09-19",
          revenue: 180,
        },
        {
          id: 6,
          room: "Room C",
          timeSession: "Night",
          time: "06:00 - 10:00",
          day: "Saturday",
          date: "2025-09-20",
          revenue: 250,
        },
        {
          id: 7,
          room: "Room A",
          timeSession: "Morning",
          time: "08:00 - 01:00",
          day: "Sunday",
          date: "2025-09-21",
          revenue: 140,
        },
      ]);
      setUser({
        id: userId,
        name: "John Doe",
        email: "john@example.com",
      });
    } catch {
      console.log("error");
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (!userId) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">{user?.name}</h1>
          <p className="text-primary text-sm">{user?.email}</p>
        </div>
        <Button 
          className="text-primary bg-secondary hover:bg-primary border border-primary hover:text-secondary"
          variant="outline" 
          onClick={onBack}
        >
          ← Back
        </Button>
      </header>

      <Card className="border-none bg-transparent shadow-none p-0 m-0">
        <CardContent className="p-0 m-0 overflow-x-auto flex flex-col gap-2">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="grid grid-cols-1 md:grid-cols-3 items-center p-3 border border-primary/50 hover:bg-secondary rounded-md gap-4"
            >
              <div>
                <p className="text-lg text-primary">{booking.room}</p>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-primary mr-2"/>
                  <span className="text-sm text-primary/70">{booking.timeSession}{" "}</span>
                  <span className="text-sm text-primary/70">{booking.time}</span>
                </div>
              </div>
              <div className="flex space-x-6 justify-between">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-primary/70">
                    {booking.day}{" "}
                    {booking.date}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Euro className="h-4 w-4 text-primary" />
                  <p className="text-primary/70 ">
                    {booking.revenue}
                    <p>revenue</p>
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  className="text-primary bg-secondary hover:bg-primary border border-primary hover:text-secondary"
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  className="text-secondary bg-primary border border-primary hover:bg-secondary hover:text-primary"
                >
                  Send Invoice
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserBillingDetailsPage;
