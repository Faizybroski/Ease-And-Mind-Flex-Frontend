import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Calendar,
  Clock,
  MapPin,
  Upload,
  Plus,
  X,
  Users,
  DollarSign,
} from "lucide-react";

interface AddRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddRoom: React.FC<AddRoomProps> = ({ open, onOpenChange }) => {
  const [addRoomData, setAddRoomData] = useState({
    room_name: "",
    morning_price: 1,
    afternoon_price: 1,
    night_price: 1,
    amenities: "",
    room_pics: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const handleImageUpload = async (
    room: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = room.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `room-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("room-pics")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("room-pics").getPublicUrl(filePath);

      setAddRoomData({
        ...addRoomData,
        room_pics: publicUrl,
      });
      toast({
        title: "Photo uploaded!",
        description: "Your event cover photo has been saved.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const addRoomfun = async () => {
    if (!addRoomData.room_name.trim()) {
      toast({
        title: "Name is required",
        variant: "destructive",
      });
      return;
    }
    if (!addRoomData.morning_price) {
      toast({
        title: "morning price is required",
        variant: "destructive",
      });
      return;
    }
    if (!addRoomData.afternoon_price) {
      toast({
        title: "Afternoon price is required",
        variant: "destructive",
      });
      return;
    }
    if (!addRoomData.night_price) {
      toast({
        title: "Night price is required",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("rooms")
        .insert({
          room_name: addRoomData.room_name,
          morning_price: addRoomData.morning_price,
          afternoon_price: addRoomData.afternoon_price,
          night_price: addRoomData.night_price,
          amenities: addRoomData.amenities,
          room_pics: addRoomData.room_pics
        })
        .select()
        .single();

      if (!error) {
        toast({ title: "Room Added successfully" });
        onOpenChange(false);
      }
      setLoading(false);
    } catch {
      toast({ title: "Room isn't Added successfully" });
    }
  };

  const isValid = addRoomData.room_name && addRoomData.morning_price && addRoomData.afternoon_price && addRoomData.night_price && addRoomData.room_pics
  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg text-primary">Add Room</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={addRoomData.room_name}
                onChange={(e) =>
                  setAddRoomData({
                    ...addRoomData,
                    room_name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Morning Price</Label>
              <Input
                type="number"
                value={addRoomData.morning_price}
                onChange={(e) =>
                  setAddRoomData({
                    ...addRoomData,
                    morning_price: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Afternoon Price</Label>
              <Input
                type="number"
                value={addRoomData.afternoon_price}
                onChange={(e) =>
                  setAddRoomData({
                    ...addRoomData,
                    afternoon_price: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Night Price</Label>
              <Input
                type="number"
                value={addRoomData.night_price}
                onChange={(e) =>
                  setAddRoomData({
                    ...addRoomData,
                    night_price: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Amenities</Label>
              <Input
                value={addRoomData.amenities}
                onChange={(e) =>
                  setAddRoomData({
                    ...addRoomData,
                    amenities: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Room Pics</Label>
              {addRoomData.room_pics && (
                <div className="relative">
                  <img
                    src={addRoomData.room_pics}
                    alt="Room pic"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="photo-upload"
                disabled={uploading}
              />

              <label htmlFor="photo-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="w-full cursor-pointer"
                  asChild
                >
                  <span>
                    {uploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {addRoomData.room_pics
                          ? "Change Photo"
                          : "Upload Room Photo"}
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                className="bg-secondary text-primary border border-primary hover:bg-primary hover:text-secondary"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="text-secondary bg-primary border border-primary hover:bg-secondary hover:text-primary"
                onClick={addRoomfun}
                disabled={loading || !isValid}
              >
                {loading ? "Adding..." : "Add Room"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddRoom;
