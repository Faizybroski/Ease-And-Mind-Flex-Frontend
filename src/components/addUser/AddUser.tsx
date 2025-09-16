// import { useAuth } from "@/contexts/AuthContext";
// import { useProfile } from "@/hooks/useProfile";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
        title: "Name is required",
        variant: "destructive",
      });
      return;
    }
    if (!addUserData.email.trim()) {
      toast({
        title: "Email is required",
        variant: "destructive",
      });
      return;
    }
    try {
      toast({ title: "User Added successfully" });
      onOpenChange(false);
    } catch {
      toast({ title: "User isnt Added successfully" });
    }
    
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg text-primary">Add User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
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
              <Label>Email</Label>
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
                onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="outline"
                className="text-secondary bg-primary border border-primary hover:bg-secondary hover:text-primary" 
                onClick={addUserfun}
              >
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddUser;
