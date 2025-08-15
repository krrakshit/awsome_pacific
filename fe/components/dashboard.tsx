"use client"
import { useState } from "react";
import { api } from "@/lib/api";

export default  function Dashboard(){
  const [orgname,setOrgname] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function addOrg(orgname : string){
    if (!orgname.trim()) {
      setMessage("Please enter an organization name");
      return;
    }

    setLoading(true);
    setMessage("");
    
    try {
      const result = await api.post("/org", { name: orgname });
      setMessage(`Organization "${orgname}" created successfully!`);
      setOrgname(""); // Clear the input
      console.log("Organization created:", result);
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Failed to create organization'}`);
      console.error("Failed to create org:", error);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="m-4 p-4">
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Enter the Org name" 
          value={orgname} 
          onChange={e => setOrgname(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 mr-2"
          disabled={loading}
        />
        <button 
          onClick={() => addOrg(orgname)}
          disabled={loading || !orgname.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Add Organization"}
        </button>
      </div>
      
      {message && (
        <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  )
}