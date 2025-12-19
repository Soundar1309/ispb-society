import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, ExternalLink, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

interface Publication {
  id: string;
  title: string;
  description?: string;
  authors?: string;
  journal?: string;
  pdf_url?: string;
  pdf_file_url?: string;
  year?: number;
  category?: string;
  status?: string;
  is_featured?: boolean;
  cover_image_url?: string;
  price?: number;
  link?: string;
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

      if (error) {
        console.error('Error fetching publications:', error);
        toast.error('Error loading publications');
      } else {
        setPublications(data || []);
      }
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
        (pub.authors && pub.authors.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pub.journal && pub.journal.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pub.description && pub.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(pub => pub.category === categoryFilter);
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(pub => pub.year?.toString() === yearFilter);
    }

    setFilteredPublications(filtered);
  };

  const getUniqueYears = () => {
    const years = [...new Set(publications.map(pub => pub.year).filter(year => year !== null))];
    return years.sort((a, b) => (b || 0) - (a || 0));
  };

  const getUniqueCategories = () => {
    return [...new Set(publications.map(pub => pub.category).filter(cat => cat !== null))];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Publications</h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Explore our research publications and scientific contributions to plant breeding
            </p>
          </div>
          <LoadingSkeleton variant="list" count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Publications</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Explore our research publications and scientific contributions to plant breeding
          </p>
        </div>

        <div className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <SelectItem key={category} value={category || ''}>
                  {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Other'}
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
                <SelectItem key={year} value={year?.toString() || ''}>
                  {year || 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        {publication.cover_image_url && (
                          <img
                            src={publication.cover_image_url}
                            alt={publication.title}
                            className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-md flex-shrink-0 mx-auto sm:mx-0"
                          />
                        )}
                        <div className="flex-1 text-center sm:text-left">
                          <CardTitle className="text-lg sm:text-xl mb-2">{publication.title}</CardTitle>
                          {publication.description && (
                            <CardDescription className="text-sm sm:text-base mb-2">
                              {publication.description}
                            </CardDescription>
                          )}
                          {publication.authors && (
                            <CardDescription className="text-sm sm:text-base mb-2">
                              <span className="font-medium">Authors: </span>{publication.authors}
                            </CardDescription>
                          )}
                          {publication.journal && (
                            <CardDescription className="text-xs sm:text-sm text-gray-700 mb-3">
                              <span className="font-medium">Journal: </span>{publication.journal}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 justify-center lg:justify-end">
                      {publication.is_featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      {publication.category && (
                        <Badge variant="outline">{publication.category}</Badge>
                      )}
                      {publication.price && (
                        <Badge className="bg-green-100 text-green-800">₹{publication.price}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-600 text-center sm:text-left">
                      {publication.year && (
                        <span><strong>Year:</strong> {publication.year}</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
                      {publication.link && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => window.open(publication.link, '_blank')}
                          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Buy Now
                        </Button>
                      )}
                      
                      {publication.pdf_file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(publication.pdf_file_url, '_blank')}
                          className="flex items-center justify-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          View PDF
                        </Button>
                      )}
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
