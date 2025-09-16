import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Plus,
  Heart,
  UserCheck,
  Sun,
  Briefcase,
  CloudSun,
  Moon,
  ListChecks,
  CalendarCheck,
  Euro,
  Check,
  ListCheck,
  Edit,
  Trash2,
  Eye,
  Share2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Room {
  id: string;
  name: string;
  morning_price: number;
  afternoon_price: number;
  night_price: number;
  pic: string;
  available_for: string;
  total_bookings: number;
  revenue_generated: number;
  amenities: string[];
}

const AdminRooms = () => {
  const navigate = useNavigate();
  // const { profile } = useProfile();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRoomData, setEditRoomData] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setRooms([
        {
          id: "1",
          name: "Ocean View Suite",
          morning_price: 150,
          afternoon_price: 180,
          night_price: 250,
          pic: "https://images.unsplash.com/photo-1501117716987-c8e2aeb7a3f5",
          available_for: "Meetings, Stays",
          total_bookings: 120,
          revenue_generated: 25000,
          amenities: [
            "WiFi",
            "Air Conditioning",
            "Mini Bar",
            "Swimming Pool",
            "Breakfast Included",
          ],
        },
        {
          id: "2",
          name: "Mountain Retreat",
          morning_price: 120,
          afternoon_price: 150,
          night_price: 200,
          pic: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
          available_for: "Vacations",
          total_bookings: 95,
          revenue_generated: 18000,
          amenities: [
            "WiFi",
            "Air Conditioning",
            "Swimming Pool",
            "Breakfast Included",
          ],
        },
        {
          id: "3",
          name: "City Lights Penthouse",
          morning_price: 200,
          afternoon_price: 230,
          night_price: 350,
          pic: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
          available_for: "Luxury Stays",
          total_bookings: 80,
          revenue_generated: 30000,
          amenities: [
            "WiFi",
            "Air Conditioning",
            "Swimming Pool",
            "Room Service",
            "Breakfast Included",
          ],
        },
        {
          id: "4",
          name: "Garden View Room",
          morning_price: 100,
          afternoon_price: 120,
          night_price: 160,
          pic: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
          available_for: "Stays",
          total_bookings: 140,
          revenue_generated: 22000,
          amenities: [
            "WiFi",
            "Air Conditioning",
            "Swimming Pool",
            "Breakfast Included",
          ],
        },
        {
          id: "5",
          name: "Business Executive Room",
          morning_price: 130,
          afternoon_price: 160,
          night_price: 210,
          pic: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
          available_for: "Business Meetings",
          total_bookings: 110,
          revenue_generated: 19500,
          amenities: [
            "WiFi",
            "Air Conditioning",
            "Mini Bar",
            "Swimming Pool",
            "Breakfast Included",
          ],
        },
        {
          id: "6",
          name: "Heritage Suite",
          morning_price: 170,
          afternoon_price: 200,
          night_price: 280,
          pic: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
          available_for: "Luxury Stays",
          total_bookings: 75,
          revenue_generated: 21000,
          amenities: [
            "WiFi",
            "Air Conditioning",
            "Swimming Pool",
            "Room Service",
            "Gym",
            "Breakfast Included",
          ],
        },
        {
          id: "7",
          name: "Poolside Cabana",
          morning_price: 90,
          afternoon_price: 110,
          night_price: 150,
          pic: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
          available_for: "Relaxation",
          total_bookings: 130,
          revenue_generated: 17500,
          amenities: [
            "WiFi",
            "Air Conditioning",
            "Swimming Pool",
            "Breakfast Included",
          ],
        },
        {
          id: "8",
          name: "Skyline Apartment",
          morning_price: 160,
          afternoon_price: 190,
          night_price: 260,
          pic: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
          available_for: "Family Stays",
          total_bookings: 105,
          revenue_generated: 24000,
          amenities: [
            "WiFi",
            "Air Conditioning",
            "Swimming Pool",
            "Breakfast Included",
          ],
        },
        {
          id: "9",
          name: "Countryside Cottage",
          morning_price: 80,
          afternoon_price: 100,
          night_price: 140,
          pic: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8",
          available_for: "Vacations",
          total_bookings: 150,
          revenue_generated: 21000,
          amenities: [
            "WiFi",
            "Air Conditioning",
            "Mini Bar",
            "Swimming Pool",
            "Breakfast Included",
          ],
        },
        {
          id: "10",
          name: "Desert Villa",
          morning_price: 200,
          afternoon_price: 240,
          night_price: 320,
          pic: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
          available_for: "Luxury Retreats",
          total_bookings: 60,
          revenue_generated: 19000,
          amenities: [
            "WiFi",
            "Swimming Pool",
            "Room Service",
            "Gym",
            "Pet Friendly",
            "Breakfast Included",
          ],
        },
      ]);
      console.log("Rooms Fetched");
    } catch {
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!roomId) return;
    if (
      !confirm(
        "Are you sure you want to delete this Room? This action cannot be undone."
      )
    )
      return;

    try {
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      fetchRooms();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    } 
  };
  const shareEvent = async (
    name: string,
    description: string,
    roomId: string
  ) => {
    try {
      await navigator.share({
        title: name,
        text: description,
        url: window.location.origin + `/room/${roomId}/details`,
      });
    } catch (error) {
      navigator.clipboard.writeText(
        window.location.origin + `/room/${roomId}/details`
      );
      toast({
        title: "Link copied!",
        description: "Room link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Rooms Management</h1>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading Rooms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Room Management
            </h1>
            <p className="text-primary text-sm">
              Manage all rooms in the system
            </p>
          </div>
        </div>
        <Button
          // onClick={() => navigate("/admin/rooms/create")}
          className="text-sm bg-primary border border-primary font-medium text-secondary hover:border hover:border-primary hover:text-primary hover:bg-secondary"
        >
          <Plus className="h-4 w-4" />
          <span>Create Room</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => {
          return (
            <Card
              key={room.id}
              className="flex flex-col h-full border border-primary rounded-sm overflow-hidden shadow-sm"
            >
              <div className="relative w-full flex items-center justify-center flex-shrink-0 h-48">
                <img
                  src={room.pic}
                  alt={room.name}
                  className="w-full h-full object-contain"
                />
                {/* <div className="absolute inset-0 bg-black/70 z-10" /> */}
              </div>

              <CardContent className="flex flex-col flex-grow space-y-3 p-4">
                <div className=" inset-0 flex flex-col justify-end">
                  <h3 className="text-primary text-xl font-bold line-clamp-1">
                    {room.name}
                  </h3>
                </div>

                <div className="items-center pl-2 pt-4 pb-1 border-t-2 border-primary">
                  <div className="flex items-center mb-2">
                    <Sun className="h-5 w-5 mr-3 text-primary" />
                    <p className="flex items-center text-primary/90">
                      <Euro className="h-5 w-5 text-primary" />
                      {room.morning_price}
                    </p>
                  </div>
                  <div className="flex items-center mb-2">
                    <CloudSun className="h-5 w-5 mr-3 text-primary" />
                    <p className="flex items-center text-primary/90">
                      <Euro className="h-5 w-5 text-primary" />
                      {room.afternoon_price}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Moon className="h-5 w-5 mr-3 text-primary" />
                    <p className="flex items-center text-primary/90">
                      <Euro className="h-5 w-5 text-primary" />
                      {room.night_price}
                    </p>
                  </div>
                </div>

                <div className="font-medium py-4 px-2 border-t-2 border-b-2 border-primary">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-3 text-primary" />
                    <span className="text-primary/90">
                      {room.available_for}
                    </span>
                  </div>
                </div>

                <div className="flex font-medium pt-2 pb-4 px-2 border-b-2 border-primary">
                  <div className="flex items-center">
                    <CalendarCheck className="h-5 w-5 text-primary mr-3" />
                    <span className="text-primary/90">
                      {room.total_bookings}
                      {" bookings"}
                    </span>
                  </div>
                </div>

                <div className="flex font-medium pt-2 pb-4 px-2 border-b-2 border-primary">
                  <div className="flex items-center">
                      <ul className="space-y-2">
                        {room.amenities.map((amenity, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-primary/90">{amenity}</span>
                          </li>
                        ))}
                      </ul>
                  </div>
                </div>

                <div className="flex font-medium items-center ">
                  <Euro className="h-5 w-5 ml-2 mr-3 text-primary" />
                  <div className="flex flex-col text-primary/90">
                    {room.revenue_generated}
                  </div>
                </div>

                <div className="flex-grow" />

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditRoomData(room);
                      setShowEditModal(true);                   
                    }}
                    className="flex-1 text-secondary bg-primary hover:bg-secondary hover:text-primary hover:border hover:border-primary rounded-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Room
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleDeleteRoom(room.id)}
                    variant="destructive"
                    className="border border-primary bg-background text-destructive hover:text-[white] hover:border-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg text-primary">Edit Room</DialogTitle>
          </DialogHeader>

          {editRoomData && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editRoomData.name}
                  onChange={(e) =>
                    setEditRoomData({
                      ...editRoomData,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Morning Price</Label>
                <Input
                  type="number"
                  value={editRoomData.morning_price}
                  onChange={(e) =>
                    setEditRoomData({
                      ...editRoomData,
                      morning_price: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Afternoon Price</Label>
                <Input
                  type="number"
                  value={editRoomData.afternoon_price}
                  onChange={(e) =>
                    setEditRoomData({
                      ...editRoomData,
                      afternoon_price: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Night Price</Label>
                <Input
                  type="number"
                  value={editRoomData.night_price}
                  onChange={(e) =>
                    setEditRoomData({
                      ...editRoomData,
                      night_price: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Amenities</Label>
                <Input
                  value={editRoomData.amenities}
                  onChange={(e) =>
                    setEditRoomData({
                      ...editRoomData,
                      amenities: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-secondary hover:border hover:border-primary hover:text-primary text-secondary rounded-sm"
                  onClick={async () => {
                    if (!editRoomData) return;
                    if (!editRoomData.name.trim()) {
                      toast({
                        title: "Name is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!editRoomData.morning_price) {
                      toast({
                        title: "Morning Price is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!editRoomData.afternoon_price) {
                      toast({
                        title: "Afternoon Price is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!editRoomData.night_price) {
                      toast({
                        title: "Night Price is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    // const { error } = await supabase
                    //   .from("profiles")
                    //   .update({
                    //     first_name: editUserData.first_name.trim(),
                    //     last_name: editUserData.last_name.trim(),
                    //     role: editUserData.role.trim(),
                    //     job_title: editUserData.job_title.trim(),
                    //     location_city: editUserData.location_city.trim(),
                    //     instagram_username:
                    //       editUserData.instagram_username.trim() || null,
                    //     linkedin_username:
                    //       editUserData.linkedin_username.trim() || null,
                    //   })
                    //   .eq("id", editUserData.id);

                    // if (error) {
                    //   toast({
                    //     title: "Error updating user",
                    //     variant: "destructive",
                    //   });
                    // } else {
                      toast({ title: "Room updated successfully" });
                      setShowEditModal(false);
                      fetchRooms();
                    // }
                  }
                }
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRooms;
