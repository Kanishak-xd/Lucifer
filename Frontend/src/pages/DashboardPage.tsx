import { useMemo, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { useAuth } from '@/context/AuthContext';
import FileUpload from '@/components/FileUpload';
import { TimeField, DateInput } from "@/components/ui/timefield"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/field"
import { Time } from "@internationalized/date"

interface Role {
  id: string;
  name: string;
  color: number;
}

interface MealSchedule {
  serverId: string;
  roleId?: string;
  roleName?: string;
  breakfast?: string;
  lunch?: string;
  snacks?: string;
  dinner?: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedServer, setSelectedServer] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [hasUpload, setHasUpload] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Meal timing states (using Time objects for React Aria)
  const [breakfast, setBreakfast] = useState<Time | null>(null);
  const [lunch, setLunch] = useState<Time | null>(null);
  const [snacks, setSnacks] = useState<Time | null>(null);
  const [dinner, setDinner] = useState<Time | null>(null);
  
  const selectedGuild = useMemo(() => user?.guilds?.find(g => g.id === selectedServer), [user, selectedServer]);

  // A server must be selected to enable the file upload
  const isFileSelectorDisabled = !selectedServer;

  // Helper functions to convert between Time objects and strings
  const parseTime = (timeStr: string | null | undefined): Time | null => {
    if (!timeStr) return null;
    try {
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        return new Time(parseInt(parts[0]), parseInt(parts[1]));
      }
    } catch (e) {
      console.error('Error parsing time:', e);
    }
    return null;
  };

  const formatTime = (time: Time | null): string => {
    if (!time) return "";
    return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
  };

  // Check if there's an upload for the selected server
  useEffect(() => {
    const checkUpload = async () => {
      if (!selectedServer) {
        setHasUpload(false);
        return;
      }

      try {
        const token = localStorage.getItem('discord_token');
        if (!token) {
          setHasUpload(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/uploads/me', {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const uploadForServer = data.uploads?.find((u: any) => u.serverId === selectedServer);
          setHasUpload(!!uploadForServer);
        } else {
          setHasUpload(false);
        }
      } catch (error) {
        console.error('Error checking upload:', error);
        setHasUpload(false);
      }
    };

    checkUpload();
  }, [selectedServer]);

  // Fetch roles when a server is selected
  useEffect(() => {
    const fetchRoles = async () => {
      if (!selectedServer) {
        setRoles([]);
        setSelectedRole("");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/auth/discord/roles/${selectedServer}`);
        if (response.ok) {
          const data = await response.json();
          setRoles(data.roles || []);
        } else {
          console.error('Failed to fetch roles');
          setRoles([]);
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
      }
    };

    fetchRoles();
  }, [selectedServer]);

  // Fetch saved meal schedule when server is selected and upload exists
  useEffect(() => {
    const fetchMealSchedule = async () => {
      if (!selectedServer || !hasUpload) {
        setBreakfast(null);
        setLunch(null);
        setSnacks(null);
        setDinner(null);
        setSelectedRole("");
        return;
      }

      try {
        const token = localStorage.getItem('discord_token');
        if (!token) return;

        const response = await fetch(
          `http://localhost:5000/api/uploads/meal-schedules/${selectedServer}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data: MealSchedule | null = await response.json();
          if (data) {
            setBreakfast(parseTime(data.breakfast));
            setLunch(parseTime(data.lunch));
            setSnacks(parseTime(data.snacks));
            setDinner(parseTime(data.dinner));
            setSelectedRole(data.roleId || "");
          }
        }
      } catch (error) {
        console.error('Error fetching meal schedule:', error);
      }
    };

    fetchMealSchedule();
  }, [selectedServer, hasUpload]);

  // Check if all required fields are filled
  const canSaveChanges = useMemo(() => {
    // Server must be selected
    if (!selectedServer) return false;
    
    // Upload must exist for the selected server
    if (!hasUpload) return false;
    
    // All meal timings must be filled
    if (!breakfast || !lunch || !snacks || !dinner) return false;
    
    // Role must be selected
    if (!selectedRole) return false;
    
    return true;
  }, [selectedServer, hasUpload, breakfast, lunch, snacks, dinner, selectedRole]);

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!selectedServer) {
      alert("Please select a server first.");
      return;
    }
    if (!hasUpload) {
      alert("Please upload an Excel file first.");
      return;
    }

    // Check if all meal timings are filled
    if (!breakfast || !lunch || !snacks || !dinner) {
      alert("Please fill in all meal timings.");
      return;
    }

    // Check if role is selected
    if (!selectedRole) {
      alert("Please select a role to ping.");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('discord_token');
      if (!token) {
        alert("Authentication error. Please log in again.");
        return;
      }

      const selectedRoleData = roles.find(r => r.id === selectedRole);
      const roleName = selectedRoleData?.name || "";

      const response = await fetch('http://localhost:5000/api/uploads/meal-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          serverId: selectedServer,
          roleId: selectedRole,
          roleName,
          breakfast: formatTime(breakfast),
          lunch: formatTime(lunch),
          snacks: formatTime(snacks),
          dinner: formatTime(dinner),
        }),
      });

      if (response.ok) {
        alert("Meal schedule saved successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving meal schedule:', error);
      alert("Failed to save meal schedule. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex justify-center">
      <div className="w-6xl h-full">
        <h1 className="dark:text-white text-5xl font-bold pt-16">Menu Automation</h1>
        
        <div className="mt-8">
          <label className="dark:text-white block mb-3">Select a Server:</label>
          {user?.guilds && user.guilds.length > 0 ? (
            <Select value={selectedServer} onValueChange={setSelectedServer}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent>
                {user.guilds.map((guild) => (
                  <SelectItem key={guild.id} value={guild.id}>
                    {guild.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-gray-400">No servers found</p>
          )}
        </div>
        
        {/* FileUpload component */}
        <FileUpload 
          isDisabled={isFileSelectorDisabled} 
          selectedServerId={selectedGuild?.id || ""}
          selectedServerName={selectedGuild?.name || ""}
        />

        {/* Time Input component */}
        <div className={`mt-8 ${isFileSelectorDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <TimeField 
            className="space-y-1 group" 
            value={breakfast || null}
            onChange={setBreakfast}
            isDisabled={isFileSelectorDisabled}
          >
            <Label className="dark:text-white block mb-3">Breakfast:</Label>
            <DateInput className="w-[200px]" />
          </TimeField>

          <TimeField 
            className="space-y-1 mt-8 group" 
            value={lunch || null}
            onChange={setLunch}
            isDisabled={isFileSelectorDisabled}
          >
            <Label className="dark:text-white block mb-3">Lunch:</Label>
            <DateInput className="w-[200px]" />
          </TimeField>

          <TimeField 
            className="space-y-1 mt-8 group" 
            value={snacks || null}
            onChange={setSnacks}
            isDisabled={isFileSelectorDisabled}
          >
            <Label className="dark:text-white block mb-3">Snacks:</Label>
            <DateInput className="w-[200px]" />
          </TimeField>

          <TimeField 
            className="space-y-1 mt-8 group" 
            value={dinner || null}
            onChange={setDinner}
            isDisabled={isFileSelectorDisabled}
          >
            <Label className="dark:text-white block mb-3">Dinner:</Label>
            <DateInput className="w-[200px]" />
          </TimeField>
        </div>

        {/* Role Selection */}
        <div className={`mt-8 ${isFileSelectorDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <label className="dark:text-white block mb-3">Select Role to Ping:</label>
          {roles && roles.length > 0 ? (
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isFileSelectorDisabled}>
              <SelectTrigger className="w-[200px] h-[40px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-gray-400">No roles found. Please select a server first.</p>
          )}
        </div>

        {/* Save Changes Button */}
        <div className="mt-8">
          <Button 
            onClick={handleSaveChanges} 
            disabled={!canSaveChanges || isSaving}
            className="w-[200px]"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}