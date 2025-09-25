import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
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
  AlertTriangle,
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
import AddRoom from "@/components/addRoom/AddRoom";

interface Room {
  id: string;
  room_name: string;
  Morning_price: number; // lowercase to match DB
  Afternoon_price: number;
  Night_price: number;
  room_pics: string;
  amenities: string | null;
  total_bookings: number; // calculated
  revenue_generated: number; // calculated
}

const AdminRooms = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editRoomData, setEditRoomData] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data: rooms, error: roomsError } = await supabase
        .from("rooms")
        .select("*");
      if (roomsError) throw roomsError;

      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, room_id, final_revenue");
      if (bookingsError) throw bookingsError;

      const statsMap = bookings.reduce((acc, b) => {
        if (!acc[b.room_id])
          acc[b.room_id] = { total_bookings: 0, revenue_generated: 0 };
        acc[b.room_id].total_bookings += 1;
        acc[b.room_id].revenue_generated += b.final_revenue || 0;
        return acc;
      }, {} as Record<string, { total_bookings: number; revenue_generated: number }>);

      const roomsWithStats = rooms.map((room) => ({
        ...room,
        total_bookings: statsMap[room.id]?.total_bookings || 0,
        revenue_generated: statsMap[room.id]?.revenue_generated || 0,
      }));

      setRooms(roomsWithStats);
      console.log("Rooms Fetched", roomsWithStats);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load rooms.",
        variant: "destructive",
      });
      console.error("Error loading rooms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showAddRoom) {
      fetchRooms();
    }
  }, [showAddRoom]);

  const handleDeleteRoom = async (roomId: string) => {
    if (!roomId) return;
    if (
      !confirm(
        "Are you sure you want to delete this Room? This action cannot be undone."
      )
    )
      return;

    try {
      const { error } = await supabase.from("rooms").delete().eq("id", roomId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      fetchRooms();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete room",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
            onClick={() => {
              setShowAddRoom(true);
            }}
            className="text-sm bg-primary border border-primary font-medium text-secondary hover:border hover:border-primary hover:text-primary hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
            <span>Create Room</span>
          </Button>
        </header>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading Rooms...</p>
          </div>
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
          onClick={() => {
            setShowAddRoom(true);
          }}
          className="text-sm bg-primary border border-primary font-medium text-secondary hover:border hover:border-primary hover:text-primary hover:bg-secondary"
        >
          <Plus className="h-4 w-4" />
          <span>Create Room</span>
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No Rooms found.
          </div>
        ) : (
          rooms.map((room) => {
            return (
              <Card
                key={room.id}
                className="flex flex-col h-full border border-primary rounded-sm overflow-hidden shadow-sm"
              >
                <div className="relative w-full flex items-center justify-center flex-shrink-0 h-48">
                  <img
                    src={room.room_pics}
                    alt={room.room_name}
                    className="w-full h-full object-contain"
                  />
                  {/* <div className="absolute inset-0 bg-black/70 z-10" /> */}
                </div>

                <CardContent className="flex flex-col flex-grow space-y-3 p-4">
                  <div className=" inset-0 flex flex-col justify-end">
                    <h3 className="text-primary text-xl font-bold line-clamp-1">
                      {room.room_name}
                    </h3>
                  </div>

                  <div className="items-center pl-2 pt-4 pb-4 border-t-2 border-b-2 border-primary">
                    <div className="flex items-center mb-2">
                      <Sun className="h-5 w-5 mr-3 text-primary" />
                      <p className="flex items-center text-primary/90">
                        <Euro className="h-5 w-5 text-primary" />
                        {room.Morning_price}
                      </p>
                    </div>
                    <div className="flex items-center mb-2">
                      <CloudSun className="h-5 w-5 mr-3 text-primary" />
                      <p className="flex items-center text-primary/90">
                        <Euro className="h-5 w-5 text-primary" />
                        {room.Afternoon_price}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Moon className="h-5 w-5 mr-3 text-primary" />
                      <p className="flex items-center text-primary/90">
                        <Euro className="h-5 w-5 text-primary" />
                        {room.Night_price}
                      </p>
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

                  {room.amenities && (
                    <div className="flex font-medium pt-2 pb-4 px-2 border-b-2 border-primary">
                      <div className="flex items-center">
                        <ListChecks className="h-5 w-5 text-primary mr-3" />
                        <span className="text-primary/90">
                          {room.amenities}
                        </span>
                      </div>
                    </div>
                  )}

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
          })
        )}
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg text-primary">
              Edit Room
            </DialogTitle>
          </DialogHeader>

          {editRoomData && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editRoomData.room_name}
                  onChange={(e) =>
                    setEditRoomData({
                      ...editRoomData,
                      room_name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Morning Price</Label>
                <Input
                  type="number"
                  value={editRoomData.Morning_price}
                  onChange={(e) =>
                    setEditRoomData({
                      ...editRoomData,
                      Morning_price: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Afternoon Price</Label>
                <Input
                  type="number"
                  value={editRoomData.Afternoon_price}
                  onChange={(e) =>
                    setEditRoomData({
                      ...editRoomData,
                      Afternoon_price: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Night Price</Label>
                <Input
                  type="number"
                  value={editRoomData.Night_price}
                  onChange={(e) =>
                    setEditRoomData({
                      ...editRoomData,
                      Night_price: e.target.value,
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
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-secondary hover:border hover:border-primary hover:text-primary text-secondary rounded-sm"
                  onClick={async () => {
                    setLoading(true);
                    if (!editRoomData) return;
                    if (!editRoomData.room_name.trim()) {
                      toast({
                        title: "Validation Error",
                        description: "Name is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!editRoomData.Morning_price) {
                      toast({
                        title: "Validation Error",
                        description: "Morning Price is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!editRoomData.Afternoon_price) {
                      toast({
                        title: "Validation Error",
                        description: "Afternoon Price is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!editRoomData.Night_price) {
                      toast({
                        title: "Validation Error",
                        description: "Night Price is required",
                        variant: "destructive",
                      });
                      return;
                    }
                    try {
                      const { error } = await supabase
                        .from("rooms")
                        .update({
                          room_name: editRoomData.room_name.trim(),
                          Morning_price: editRoomData.Morning_price,
                          Afternoon_price: editRoomData.Afternoon_price,
                          Night_price: editRoomData.Night_price,
                          amenities: editRoomData.amenities.trim() || null,
                        })
                        .eq("id", editRoomData.id);

                      if (error) throw error;
                      if (!error) {
                        toast({ title: "Success", description: "Room updated successfully" });
                        setShowEditModal(false);
                        fetchRooms();
                      }
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Error updating room",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  {loading ? "Saving" : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddRoom open={showAddRoom} onOpenChange={setShowAddRoom} />
    </div>
  );
};

export default AdminRooms;
