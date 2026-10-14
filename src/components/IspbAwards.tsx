import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AwardsPagination from '@/components/AwardsPagination';
import { Building2, MapPin } from 'lucide-react';

// divisible by 1, 2, 3 and 4 columns so rows stay full
const PAGE_SIZE = 12;


export interface IspbAward {
  id: string;
  award_year: number;
  award_number: string;
  award_name: string;
  recipient_name: string;
  affiliation: string | null;
  location: string | null;
  description: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
}

const initials = (name: string) =>
  name
    .replace(/^(dr|prof|mr|mrs|ms)\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

const isSafeImageUrl = (url?: string | null): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/')
  );
};

const AwardRecipientImage = ({ award }: { award: IspbAward }) => {
  const [imageError, setImageError] = useState(false);
  const safe = isSafeImageUrl(award.image_url);

  if (safe && award.image_url && !imageError) {
    return (
      <img
        src={award.image_url}
        alt={award.recipient_name}
        loading="lazy"
        onError={() => setImageError(true)}
        className="w-full h-full object-cover object-top"
      />
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-green-50">
      <span className="text-5xl font-bold text-green-600/50">
        {initials(award.recipient_name)}
      </span>
    </div>
  );
};

const IspbAwards = () => {
  const [awards, setAwards] = useState<IspbAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
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

  const showAll = selectedYear === 'all';
  const totalPages = Math.max(1, Math.ceil(awards.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  // All Years is paginated; a single year shows everything
  const pagedAwards = useMemo(() => {
    if (!showAll) return awards.filter((a) => a.award_year === selectedYear);
    return awards.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [awards, showAll, selectedYear, currentPage]);

  // year -> award name -> recipients
  const grouped = useMemo(() => {
    const result = new Map<number, { key: string; name: string; recipients: IspbAward[] }[]>();
    pagedAwards.forEach((a) => {
      const list = result.get(a.award_year) || [];
      const key = a.award_name.trim().toLowerCase();
      let group = list.find((g) => g.key === key);
      if (!group) {
        group = { key, name: a.award_name, recipients: [] };
        list.push(group);
      }
      group.recipients.push(a);
      result.set(a.award_year, list);
    });
    return result;
  }, [pagedAwards]);

  const visibleYears = years.filter((y) => grouped.has(y));

  const changePage = (p: number) => {
    setPage(p);
    document.getElementById('awards-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mt-12 mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">ISPB Awards</h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-2">
            Awards presented by the Indian Society of Plant Breeders to students, researchers and professionals
            for their contribution to plant breeding
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : years.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No awards have been published yet.</p>
        ) : (
          <>
            {/* Year filter */}
            <div
              className="flex flex-nowrap sm:flex-wrap sm:justify-center gap-2 overflow-x-auto pb-2 mb-10"
              role="tablist"
              aria-label="Filter awards by year"
            >
              {(['all', ...years] as Array<number | 'all'>).map((y) => (
                <button
                  key={y}
                  id={`awards-year-filter-${y}`}
                  role="tab"
                  aria-selected={selectedYear === y}
                  onClick={() => {
                    setSelectedYear(y);
                    setPage(1);
                  }}
                  className={`shrink-0 px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                    selectedYear === y
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {y === 'all' ? 'All Years' : y}
                </button>
              ))}
            </div>

            <div id="awards-list" className="space-y-12 scroll-mt-24">
              {visibleYears.map((year) => (
                <section key={year} id={`awards-${year}`} aria-labelledby={`awards-heading-${year}`}>
                  <h2
                    id={`awards-heading-${year}`}
                    className="text-2xl font-bold text-gray-900 pb-2 mb-6 border-b border-gray-200"
                  >
                    {year}
                  </h2>

                  <div className="space-y-10">
                    {(grouped.get(year) || []).map((group) => (
                      <div key={group.key}>
                        <h3 className="bg-gradient-to-r from-green-50 to-orange-50 border-l-4 border-green-500 rounded-r-xl px-4 py-3 mb-5 text-lg sm:text-xl font-bold text-green-800">
                          {group.name}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {group.recipients.map((award) => (
                            <article
                              key={award.id}
                              className="flex flex-col bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 hover:border-green-200 overflow-hidden transition-all duration-300"
                            >
                              <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                                <AwardRecipientImage award={award} />
                              </div>

                              <div className="flex flex-col flex-1 p-5">
                                <span className="self-start mb-3 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1">
                                  Award No. {award.award_number}
                                </span>
                                <h4 className="text-lg font-bold text-gray-900 leading-snug">{award.recipient_name}</h4>
                                {award.affiliation && (
                                  <p className="flex items-start gap-2 mt-2 text-sm text-gray-700">
                                    <Building2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                                    <span>{award.affiliation}</span>
                                  </p>
                                )}
                                {award.location && (
                                  <p className="flex items-start gap-2 mt-1 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                                    <span>{award.location}</span>
                                  </p>
                                )}
                                {award.description && (
                                  <p className="mt-4 pt-4 border-t border-gray-100 text-sm leading-relaxed text-gray-600">
                                    {award.description}
                                  </p>
                                )}
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {showAll && (
              <AwardsPagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={awards.length}
                pageSize={PAGE_SIZE}
                onPageChange={changePage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IspbAwards;
