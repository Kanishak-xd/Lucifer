import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
import { useAuth } from '@/context/AuthContext';
import FileUpload from '@/components/FileUpload';
import { DateInput, TimeField } from "@/components/ui/timefield"

export default function DashboardPage() {
  const { user } = useAuth();
  const [selectedServer, setSelectedServer] = useState("");
  const selectedGuild = useMemo(() => user?.guilds?.find(g => g.id === selectedServer), [user, selectedServer]);

  // A server must be selected to enable the file upload
  const isFileSelectorDisabled = !selectedServer;
  
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
        <div className={`space-y-1 mt-8 ${isFileSelectorDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <TimeField className="space-y-1">
            <label className="dark:text-white block mb-3">Breakfast:</label>
            <DateInput className={"w-30"} />
          </TimeField>

          <TimeField className="space-y-1 mt-8">
            <label className="dark:text-white block mb-3">Lunch:</label>
            <DateInput className={"w-30"} />
          </TimeField>

          <TimeField className="space-y-1 mt-8">
            <label className="dark:text-white block mb-3">Snacks:</label>
            <DateInput className={"w-30"} />
          </TimeField>

          <TimeField className="space-y-1 mt-8">
            <label className="dark:text-white block mb-3">Dinner:</label>
            <DateInput className={"w-30"} />
          </TimeField>
        </div>
      </div>
    </div>
  )
}