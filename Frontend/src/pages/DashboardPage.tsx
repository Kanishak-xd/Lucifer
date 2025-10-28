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

interface Channel {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedServer, setSelectedServer] = useState("");
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState("");
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

  // Server and channel must be selected to enable the file upload
  const isFileSelectorDisabled = !selectedServer || !selectedChannel;

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

  // Fetch channels when a server is selected
  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedServer) {
        setChannels([]);
        setSelectedChannel("");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/auth/discord/channels/${selectedServer}`);
        if (response.ok) {
          const data = await response.json();
          setChannels(data.channels || []);
        } else {
          console.error('Failed to fetch channels');
          setChannels([]);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        setChannels([]);
      }
    };

    fetchChannels();
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
    <div id="dashboard" className="flex justify-center pb-20 px-4 sm:px-10 w-full">
      <div className="w-full max-w-6xl h-full">
        <h1 className="dark:text-white text-4xl sm:text-5xl md:text-5xl xl:text-6xl font-bold pt-16">Menu Automation</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl">Follow the steps below to automate your menu posts.</p>
        
        <div className="mt-10 w-full overflow-x-hidden">
          <h2 className="text-2xl sm:text-3xl font-semibold dark:text-white">Step 1: Select a Server</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-2xl">Choose the Discord server and channel where you want to post the menu.</p>
          <h3 className="text-sm font-medium dark:text-white">Server</h3>
          {user?.guilds && user.guilds.length > 0 ? (
            <Select value={selectedServer} onValueChange={setSelectedServer}>
              <SelectTrigger className="w-[250px] h-[40px] mt-2">
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
          {/* Channel Select */}
          <div className={`mt-4 ${!selectedServer ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="text-sm font-medium dark:text-white">Channel</h3>
            <Select value={selectedChannel} onValueChange={setSelectedChannel} disabled={!selectedServer || (channels?.length ?? 0) === 0}>
              <SelectTrigger className="w-[250px] h-[40px] mt-2">
                <SelectValue placeholder={(channels?.length ?? 0) === 0 ? 'No channels available' : 'Select a channel'} />
              </SelectTrigger>
              <SelectContent>
                {channels?.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* FileUpload component */}
        <h2 className="text-2xl sm:text-3xl font-semibold dark:text-white mt-12">Step 2: Upload Menu</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-2xl">Upload the Excel file containing your menu.</p>
        <FileUpload 
          isDisabled={isFileSelectorDisabled} 
          selectedServerId={selectedGuild?.id || ""}
          selectedServerName={selectedGuild?.name || ""}
          selectedChannelId={selectedChannel || ""}
          selectedChannelName={channels.find(c => c.id === selectedChannel)?.name || ""}
          onUploadSuccess={() => setHasUpload(true)}
        />

        {/* Time Input component */}
        <h2 className="text-2xl sm:text-3xl font-semibold dark:text-white mt-12">Step 3: Set Meal Times</h2>
        <p className={`text-gray-500 dark:text-gray-400 mb-4 max-w-2xl ${isFileSelectorDisabled ? 'opacity-50' : ''}`}>Pick the times to post breakfast, lunch, snacks, and dinner.</p>
        <div className={`mt-6 w-full overflow-x-hidden ${isFileSelectorDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <TimeField 
            className="space-y-1 group" 
            value={breakfast || null}
            onChange={setBreakfast}
            isDisabled={isFileSelectorDisabled}
          >
            <Label className="dark:text-white block mb-3">Breakfast:</Label>
            <DateInput className="w-[250px]" />
          </TimeField>

          <TimeField 
            className="space-y-1 mt-8 group" 
            value={lunch || null}
            onChange={setLunch}
            isDisabled={isFileSelectorDisabled}
          >
            <Label className="dark:text-white block mb-3">Lunch:</Label>
            <DateInput className="w-[250px]" />
          </TimeField>

          <TimeField 
            className="space-y-1 mt-8 group" 
            value={snacks || null}
            onChange={setSnacks}
            isDisabled={isFileSelectorDisabled}
          >
            <Label className="dark:text-white block mb-3">Snacks:</Label>
            <DateInput className="w-[250px]" />
          </TimeField>

          <TimeField 
            className="space-y-1 mt-8 group" 
            value={dinner || null}
            onChange={setDinner}
            isDisabled={isFileSelectorDisabled}
          >
            <Label className="dark:text-white block mb-3">Dinner:</Label>
            <DateInput className="w-[250px]" />
          </TimeField>
        </div>

        {/* Role Selection */}
        <h2 className="text-2xl sm:text-3xl font-semibold dark:text-white mt-12">Step 4: Choose Role to Ping</h2>
        <p className={`text-gray-500 dark:text-gray-400 mb-4 max-w-2xl ${isFileSelectorDisabled ? 'opacity-50' : ''}`}>Select the role that should be mentioned when the menu is posted.</p>
        <div className={`mt-6 w-full overflow-x-hidden ${isFileSelectorDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isFileSelectorDisabled || (roles?.length ?? 0) === 0}>
            <SelectTrigger className="w-[250px] h-[40px]">
              <SelectValue placeholder={(roles?.length ?? 0) === 0 ? 'No roles available' : 'Select a role'} />
            </SelectTrigger>
            <SelectContent>
              {roles?.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Save Changes Button */}
        <h2 className="text-2xl sm:text-3xl font-semibold dark:text-white mt-12">Step 5: Save</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-2xl">Review your selections and save to apply the schedule.</p>
        <div className="mt-6 w-full overflow-x-hidden">
          <Button 
            onClick={handleSaveChanges} 
            disabled={!canSaveChanges || isSaving}
            className="w-[250px]"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
}