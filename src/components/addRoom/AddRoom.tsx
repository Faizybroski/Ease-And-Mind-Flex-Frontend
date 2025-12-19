import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AddRoomProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddRoom: React.FC<AddRoomProps> = ({ open, onOpenChange }) => {
  const { t } = useTranslation();
  const [addRoomData, setAddRoomData] = useState({
    room_name: "",
    morning_price: 1,
    afternoon_price: 1,
    night_price: 1,
    fullDay_price: 0,
    fullDayManual: false, // 👈 key player
    amenities: "",
    room_pics: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (addRoomData.fullDayManual) return;

    const { morning_price, afternoon_price } = addRoomData;

    let fullDay = 0;

    if (morning_price && afternoon_price) {
      fullDay = morning_price + afternoon_price;
    } else if (morning_price) {
      fullDay = morning_price;
    } else if (afternoon_price) {
      fullDay = afternoon_price;
    }

    setAddRoomData((prev) => ({
      ...prev,
      fullDay_price: fullDay,
    }));
  }, [addRoomData.morning_price, addRoomData.afternoon_price]);

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
        title: "Foto geüpload!",
        description: "Uw evenementfoto is opgeslagen.",
      });
    } catch (error) {
      toast({
        title: "Uploaden mislukt",
        description: "Foto uploaden mislukt",
        variant: "destructive",
      });
      console.log("Error uploading photo", error);
    } finally {
      setUploading(false);
    }
  };

  const addRoomfun = async () => {
    if (!addRoomData.room_name.trim()) {
      toast({
        title: "Fout",
        description: "Naam is vereist",
        variant: "destructive",
      });
      return;
    }
    if (!addRoomData.morning_price || addRoomData.morning_price <= 0) {
      toast({
        title: "Fout",
        description: "Ochtendprijs is vereist",
        variant: "destructive",
      });
      return;
    }
    if (!addRoomData.afternoon_price || addRoomData.afternoon_price <= 0) {
      toast({
        title: "Fout",
        description: "Middagprijs is vereist",
        variant: "destructive",
      });
      return;
    }
    if (!addRoomData.night_price || addRoomData.night_price <= 0) {
      toast({
        title: "Fout",
        description: "Nachtprijs is vereist",
        variant: "destructive",
      });
      return;
    }
    if (!addRoomData.fullDay_price || addRoomData.fullDay_price <= 0) {
      toast({
        title: "Fout",
        description: "haldagtprijs is vereist",
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
          Morning_price: addRoomData.morning_price,
          Afternoon_price: addRoomData.afternoon_price,
          Night_price: addRoomData.night_price,
          FullDay_price: addRoomData.fullDay_price,
          amenities: addRoomData.amenities,
          room_pics: addRoomData.room_pics,
        })
        .select()
        .single();

      if (error) throw error;

      if (!error) {
        toast({
          title: "Succes",
          description: "Kamer succesvol toegevoegd",
        });
        onOpenChange(false);
      }
      setLoading(false);
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kan geen kamer toevoegen",
        variant: "destructive",
      });
      console.error("Error adding room", error);
    }
  };

  const isValid =
    addRoomData.room_name &&
    addRoomData.morning_price &&
    addRoomData.afternoon_price &&
    addRoomData.night_price &&
    addRoomData.room_pics;
  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg text-primary">
              Kamer toevoegen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Naam</Label>
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
              <Label>Ochtendprijs</Label>
              <Input
                type="number"
                placeholder="1"
                min={1}
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
              <Label>Middagprijs</Label>
              <Input
                type="number"
                placeholder="1"
                min={1}
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
              <Label>Nachtprijs</Label>
              <Input
                type="number"
                placeholder="1"
                min={1}
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
              <Label>Hele dag:</Label>
              <Input
                type="number"
                placeholder="1"
                min={1}
                value={addRoomData.fullDay_price}
                onChange={(e) => {
                  const value = Number(e.target.value);

                  setAddRoomData((prev) => ({
                    ...prev,
                    fullDay_price: Number(e.target.value),
                    fullDayManual: true, // 👈 user is boss now
                  }));
                }}
              />
            </div>
            <div>
              <Label>Voorzieningen</Label>
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
              <Label>Kamerfoto's</Label>
              {addRoomData.room_pics && (
                <div className="relative">
                  <img
                    src={addRoomData.room_pics}
                    alt="Kamerfoto"
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
                  className="w-full cursor-pointer text-primary"
                  asChild
                >
                  <span className="mt-2">
                    {uploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Uploaden...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {addRoomData.room_pics
                          ? "Foto wijzigen"
                          : "Kamerfoto uploaden"}
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
                Annuleren
              </Button>
              <Button
                variant="outline"
                className="text-secondary bg-primary border border-primary hover:bg-secondary hover:text-primary"
                onClick={addRoomfun}
                disabled={loading || !isValid}
              >
                {loading ? "Toevoegen..." : "Kamer toevoegen"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddRoom;
