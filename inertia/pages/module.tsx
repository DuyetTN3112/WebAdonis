import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "../components/ui/input";
import Layout from './layouts/layout';

interface Module {
  id: number;
  name: string;
  description: string;
  created_at: string;
  posts_count?: number;
}

interface ModuleProps {
  modules: Module[];
}

const ModulePage = ({ modules }: ModuleProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedModulePosts, setSelectedModulePosts] = useState<any[]>([]);

  const filteredModules = modules.filter(module =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    module.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleModuleClick = async (moduleId: number) => {
    setSelectedModuleId(moduleId);
    const mockPosts = [
      {
        title: "Sample Post Title",
        content: "This is a sample post content for the selected module.",
        author: "John Doe",
        created_at: new Date().toISOString(),
        module_names: modules.find(m => m.id === moduleId)?.name || ""
      }
    ];
    setSelectedModulePosts(mockPosts);
  };

  return (
    <Layout>
    <div className="min-h-screen bg-custom-black text-white">
      <main className="container mx-auto p-8 space-y-6">
        <h1 className="text-4xl font-bold text-custom-orange">Modules</h1>
          <h2 className="text-xl text-custom-lightGray max-w-4xl">
          A hashtag is a keyword or label that categorizes your post with other, similar posts. Using the right hashtags
          makes it easier for others to find and answer your post.
        </h2>

        <div className="relative my-6 max-w-2xl">
          <Input
            id="searchModules"
            type="text"
            placeholder="Search modules"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={(e) => e.target.placeholder = ''}
            onBlur={(e) => e.target.placeholder = 'Search modules'}            
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-custom-orange w-5 h-5" />
        </div>
    
        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <div key={module.id} className="w-full">
              <button
                onClick={() => handleModuleClick(module.id)}
                className={`w-full h-full text-left p-4 flex flex-col justify-between 
                  ${selectedModuleId === module.id ? 'border-2 border-[#FF9900]' : 'border border-[#FF9900]'}
                  bg-black! text-white! rounded-lg cursor-pointer transition-transform hover:scale-105`}
                style={{ backgroundColor: 'black', color: 'white', height: '220px' }}
              >
                <div>
                  <h5 className="text-xl font-bold mb-2 text-white!">{module.name}</h5>
                  <p className="text-sm text-white!">{module.description}</p>
                </div>
                <div className="text-xs text-gray-300!">
                  <small>Created at: {new Date(module.created_at).toLocaleDateString()}</small>
                  {module.posts_count !== undefined && (
                    <div className="mt-1">{module.posts_count} posts</div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>


        {selectedModuleId && selectedModulePosts.length > 0 && (
          <div className="user-posts mt-12">
            <h3 className="text-3xl font-bold text-[#FF9900] mb-6">Posts in Selected Module</h3>
            <div className="posts-list space-y-4">
              {selectedModulePosts.map((post, index) => (
                <div key={index} className="post-item bg-black p-4 rounded-lg border border-[#FF9900] text-white">
                  <h4 className="text-xl font-semibold">{post.title}</h4>
                  <p className="post-content mt-2">{post.content}</p>
                  <small className="text-gray-300 block mt-2">
                    Posted by: {post.author} 
                    on {new Date(post.created_at).toLocaleDateString()}
                    in Modules: {post.module_names}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {selectedModuleId && selectedModulePosts.length === 0 && (
          <div className="user-posts mt-12">
            <h3 className="text-3xl font-bold text-custom-orange mb-6">Posts in Selected Module</h3>
            <p className="text-custom-lightGray">No posts found in this module.</p>
          </div>
        )}
        </main>
      </div>
    </Layout>
  );
};

export default ModulePage;