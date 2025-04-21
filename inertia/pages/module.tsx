import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { ScrollArea } from "../components/ui/scroll-area";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import Layout from './layouts/layout';

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: number;
}

interface Module {
  id: number;
  name: string;
  description: string;
  created_at: string;
  posts_count?: number;
}

interface ModuleProps {
  user: User | null;
  modules: Module[];
  error?: string;
}

const ModulePage = ({ user, modules: initialModules, error: initialError }: ModuleProps) => {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex-grow p-8 space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-6 w-96" />
          <div className="relative my-6 max-w-2xl">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-custom-darkGray border-none">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex-grow p-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="flex-grow p-8 space-y-6">
        <h1 className="text-4xl font-bold text-custom-orange">Modules</h1>
        <h2 className="text-xl text-custom-lightGray">
          A hashtag is a keyword or label that categorizes your post with other, similar posts. 
          Using the right hashtags makes it easier for others to find and answer your post.
        </h2>

        {/* Module Search Bar */}
        <div className="relative my-6 max-w-2xl">
          <Input
            type="text"
            placeholder="Search modules"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full py-2 px-4 pl-10 bg-custom-darkGray text-white rounded-full focus:outline-none focus:ring-2 focus:ring-custom-orange text-lg"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-custom-orange w-5 h-5" />
        </div>

        {/* Modules Grid */}
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 p-4">
            {filteredModules.map((module) => (
              <Card key={module.id} className="bg-custom-darkGray border-none hover:bg-custom-gray transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold text-white">{module.name}</CardTitle>
                    {module.posts_count !== undefined && (
                      <Badge variant="secondary" className="bg-custom-orange/20 text-custom-orange">
                        {module.posts_count} posts
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-custom-lightGray">{module.description}</p>
                  <div className="mt-4">
                    <small className="text-custom-lightGray">
                      Created at: {new Date(module.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </main>
    </Layout>
  );
};

export default ModulePage; 