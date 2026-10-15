import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AwardsPagination from '@/components/AwardsPagination';
import { Award, FileText, ExternalLink, Calendar, Search, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAGE_SIZE = 10;

export interface IspbAward {
  id: string;
  award_year: number;
  award_number?: string | null;
  award_name: string;
  recipient_name?: string | null;
  affiliation?: string | null;
  location?: string | null;
  description: string | null;
  image_url?: string | null;
  pdf_url?: string | null;
  display_order: number;
  is_active: boolean;
}

const IspbAwards = () => {
  const [awards, setAwards] = useState<IspbAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('ispb_awards')
          .select('*')
          .eq('is_active', true)
          .order('award_year', { ascending: false })
          .order('display_order', { ascending: true });
        if (error) throw error;
        setAwards(data || []);
      } catch (error) {
        console.error('Error fetching awards:', error);
        toast.error('Error loading awards');
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();

    // Realtime: reflect admin changes without a page refresh
    const channel = supabase
      .channel('ispb-awards-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ispb_awards' }, () => fetchAwards())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const years = useMemo(
    () => Array.from(new Set(awards.map((a) => a.award_year))).sort((a, b) => b - a),
    [awards]
  );

  const filteredAwards = useMemo(() => {
    let list = awards;
    if (selectedYear !== 'all') {
      list = list.filter((a) => a.award_year === selectedYear);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          (a.award_name && a.award_name.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          String(a.award_year).includes(q)
      );
    }
    return list;
  }, [awards, selectedYear, search]);

  useEffect(() => {
    setPage(1);
  }, [selectedYear, search]);

  const totalPages = Math.max(1, Math.ceil(filteredAwards.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pagedAwards = useMemo(() => {
    return filteredAwards.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredAwards, currentPage]);

  // Group current page items by year
  const groupedByYear = useMemo(() => {
    const map = new Map<number, IspbAward[]>();
    pagedAwards.forEach((item) => {
      const list = map.get(item.award_year) || [];
      list.push(item);
      map.set(item.award_year, list);
    });
    return map;
  }, [pagedAwards]);

  const sortedGroupYears = useMemo(
    () => Array.from(groupedByYear.keys()).sort((a, b) => b - a),
    [groupedByYear]
  );

  const changePage = (p: number) => {
    setPage(p);
    document.getElementById('awards-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mt-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-100/80 text-green-800 text-xs font-semibold mb-4 tracking-wide uppercase">
            <Award className="h-4 w-4 text-green-700" />
            Recognition of Excellence
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            ISPB Awards
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Annual awards and honors conferred by the Indian Society of Plant Breeders for outstanding
            contributions and advancements in plant breeding and genetics.
          </p>
        </div>

        {/* Controls: Year Dropdown Filter & Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-5 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Year Dropdown Filter */}
            <div className="flex items-center gap-2">
              <Select
                value={String(selectedYear)}
                onValueChange={(val) => setSelectedYear(val === 'all' ? 'all' : parseInt(val, 10))}
              >
                <SelectTrigger className="w-full sm:w-44 bg-gray-50/80 border-gray-200 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-100/70 focus:ring-green-500">
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="h-4 w-4 text-green-600 shrink-0" />
                    <SelectValue placeholder="Filter by year" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-200 shadow-lg">
                  <SelectItem value="all" className="font-semibold text-sm">
                    All Years
                  </SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)} className="text-sm font-medium">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search bar */}
            <div className="relative sm:w-80 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search awards..."
                className="pl-9 pr-8 bg-gray-50/60 border-gray-200 text-sm rounded-xl focus:bg-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : filteredAwards.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">No awards found</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {search
                ? `No results matching "${search}". Try searching with a different term.`
                : 'No awards published for the selected period yet.'}
            </p>
          </div>
        ) : (
          <div id="awards-list" className="space-y-10 scroll-mt-24">
            {sortedGroupYears.map((year) => {
              const yearAwards = groupedByYear.get(year) || [];
              return (
                <section key={year} aria-labelledby={`year-heading-${year}`}>
                  {/* Year Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-100 text-green-900 font-extrabold text-base tracking-wide">
                      <Calendar className="h-4 w-4 text-green-700" />
                      <span>{year}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      {yearAwards.length} {yearAwards.length === 1 ? 'award' : 'awards'}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                  </div>

                  {/* Awards List Cards */}
                  <div className="space-y-4">
                    {yearAwards.map((award) => (
                      <article
                        key={award.id}
                        className="relative bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden pl-2"
                      >
                        {/* Green accent vertical bar on the left */}
                        <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-emerald-500 rounded-r-full" />

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 pl-4 sm:pl-6">
                          {/* Award icon & info */}
                          <div className="flex items-start gap-4 min-w-0 flex-1">
                            {/* Trophy icon in soft rounded-2xl box */}
                            <div className="h-12 w-12 rounded-2xl bg-emerald-50/90 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Award className="h-6 w-6 stroke-[2.2]" />
                            </div>

                            <div className="min-w-0 flex-1">
                              {/* Pill year badge + society subtitle */}
                              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                                  {award.award_year}
                                </span>
                              </div>

                              {/* Award title */}
                              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight leading-snug">
                                {award.award_name}
                              </h3>

                              {/* Short description */}
                              {award.description && (
                                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed max-w-3xl whitespace-pre-line">
                                  {award.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Action Button: View PDF */}
                          <div className="sm:self-center shrink-0 pt-2 sm:pt-0">
                            {award.pdf_url ? (
                              <a
                                href={award.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-sm font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 w-full sm:w-auto"
                              >
                                <FileText className="h-4 w-4 stroke-[2.2]" />
                                <span>View PDF</span>
                                <ExternalLink className="h-3.5 w-3.5 opacity-85" />
                              </a>
                            ) : (
                              <Button
                                variant="outline"
                                disabled
                                className="text-gray-400 border-gray-200 text-xs w-full sm:w-auto cursor-not-allowed rounded-xl"
                              >
                                <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-300" />
                                PDF Not Available
                              </Button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Pagination */}
            <AwardsPagination
              page={currentPage}
              totalPages={totalPages}
              totalItems={filteredAwards.length}
              pageSize={PAGE_SIZE}
              onPageChange={changePage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IspbAwards;
