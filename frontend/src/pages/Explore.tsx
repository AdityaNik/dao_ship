import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import GlassmorphicCard from "@/components/ui/glassmorphic-card";
import GradientButton from "@/components/ui/gradient-button";
import { getAllDAOs } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface DAO {
  _id: string;
  name: string;
  description: string;
  members: any[];
  createdAt: string;
  imageUrl?: string; // Optional image URL property
}

const Explore = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [daos, setDaos] = useState<DAO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDAOs();
  }, []);

  const fetchDAOs = async () => {
    try {
      const response = await getAllDAOs();
      setDaos(response);
    } catch (error) {
      console.error("Error fetching DAOs:", error);
      toast({
        title: "Error",
        description: "Failed to load DAOs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDAOs = daos.filter(
    (dao) =>
      dao.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dao.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to generate a placeholder gradient based on DAO name
  const generatePlaceholderGradient = (name) => {
    // Simple hash function to generate consistent colors based on name
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const hue1 = Math.abs(hash % 360);
    const hue2 = (hue1 + 60) % 360;
    
    return `linear-gradient(135deg, hsla(${hue1}, 70%, 60%, 0.8), hsla(${hue2}, 70%, 50%, 0.8))`;
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <Navigation />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                Explore DAOs
              </h1>
              <p className="text-daoship-text-gray">
                Discover and join Algorand DAOs created with DAOShip
              </p>
            </div>

            <Link to="/create-dao">
              <GradientButton className="mt-4 md:mt-0">
                Create DAO
              </GradientButton>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/50" />
              </div>
              <input
                type="text"
                placeholder="Search DAOs..."
                className="glass-input rounded-lg py-4 px-12 w-full text-white focus:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* DAO Grid */}
          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-white">Loading DAOs...</p>
            </div>
          ) : filteredDAOs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDAOs.map((dao) => (
                <Link key={dao._id} to={`/dao/${dao._id}`}>
                  <GlassmorphicCard className="overflow-hidden h-full hover:scale-[1.02] transition-transform">
                    {/* Image Area */}
                    <div 
                      className="h-48 w-full flex items-center justify-center" 
                      style={{ 
                        background: dao.imageUrl 
                          ? `url(${dao.imageUrl}) center/cover no-repeat` 
                          : generatePlaceholderGradient(dao.name)
                      }}
                    >
                      {!dao.imageUrl && (
                        <span className="text-3xl font-bold text-white/90">
                          {dao.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {dao.name}
                      </h3>
                      <p className="text-daoship-text-gray mb-4 line-clamp-2">
                        {dao.description}
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/70">
                          {dao.members.length} members
                        </span>
                        <span className="text-white/70">
                          Created {new Date(dao.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </GlassmorphicCard>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-white">No DAOs found</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Explore;