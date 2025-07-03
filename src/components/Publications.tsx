
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Publication {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  pdf_url: string;
  category: string;
  status: string;
  is_featured: boolean;
}

const Publications = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  useEffect(() => {
    fetchPublications();
  }, []);

  useEffect(() => {
    filterPublications();
  }, [publications, searchTerm, categoryFilter, yearFilter]);

  const fetchPublications = async () => {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('status', 'published')
        .order('year', { ascending: false });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
      toast.error('Error loading publications');
    } finally {
      setLoading(false);
    }
  };

  const filterPublications = () => {
    let filtered = publications;

    if (searchTerm) {
      filtered = filtered.filter(pub =>
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.journal.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(pub => pub.category === categoryFilter);
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(pub => pub.year.toString() === yearFilter);
    }

    setFilteredPublications(filtered);
  };

  const getUniqueYears = () => {
    const years = [...new Set(publications.map(pub => pub.year))];
    return years.sort((a, b) => b - a);
  };

  const getUniqueCategories = () => {
    return [...new Set(publications.map(pub => pub.category))];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading publications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Publications</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our research publications and scientific contributions to plant breeding
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search publications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {getUniqueCategories().map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {getUniqueYears().map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Publications Grid */}
        <div className="grid grid-cols-1 gap-6">
          {filteredPublications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No publications found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            filteredPublications.map((publication) => (
              <Card key={publication.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{publication.title}</CardTitle>
                      <CardDescription className="text-base">
                        <span className="font-medium">{publication.authors}</span>
                      </CardDescription>
                    </div>
                    {publication.is_featured && (
                      <Badge variant="secondary" className="ml-4">Featured</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      <span><strong>Journal:</strong> {publication.journal}</span>
                      <span>•</span>
                      <span><strong>Year:</strong> {publication.year}</span>
                      {publication.volume && (
                        <>
                          <span>•</span>
                          <span><strong>Volume:</strong> {publication.volume}</span>
                        </>
                      )}
                      {publication.issue && (
                        <>
                          <span>•</span>
                          <span><strong>Issue:</strong> {publication.issue}</span>
                        </>
                      )}
                      {publication.pages && (
                        <>
                          <span>•</span>
                          <span><strong>Pages:</strong> {publication.pages}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 pt-2">
                      <Badge variant="outline">{publication.category}</Badge>
                      
                      <div className="flex gap-2 ml-auto">
                        {publication.doi && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://doi.org/${publication.doi}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            DOI
                          </Button>
                        )}
                        {publication.pdf_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(publication.pdf_url, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Publications;
