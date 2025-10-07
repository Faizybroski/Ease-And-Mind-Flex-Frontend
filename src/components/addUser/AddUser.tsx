import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface AddUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddUser: React.FC<AddUserProps> = ({ open, onOpenChange }) => {
  const [addUserData, setAddUserData] = useState({
    name: "",
    email: "",
  });

  const addUserfun = async () => {
    if (!addUserData.name.trim()) {
      toast({
        title: "Fout",
        description: "Naam is vereist",
        variant: "destructive",
      });
      return;
    }
    if (!addUserData.email.trim()) {
      toast({
        title: "Fout",
        description: "E-mailadres is vereist",
        variant: "destructive",
      });
      return;
    }
    try {
      toast({
        title: "Succes",
        description: "Gebruiker succesvol toegevoegd",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Fout",
        description: "Het is niet gelukt om een ​​gebruiker toe te voegen",
        variant: "destructive",
      });
      console.error("Error adding user", error);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg text-primary">
              Gebruiker toevoegen
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Volledige naam</Label>
              <Input
                value={addUserData.name}
                onChange={(e) =>
                  setAddUserData({
                    ...addUserData,
                    name: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={addUserData.email}
                onChange={(e) =>
                  setAddUserData({
                    ...addUserData,
                    email: e.target.value,
                  })
                }
              />
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
                onClick={addUserfun}
              >
                Gebruiker toevoegen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddUser;
