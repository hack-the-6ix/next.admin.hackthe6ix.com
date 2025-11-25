import { useEffect, useState, useMemo } from 'react';
import { getUser, checkInUser, getNfcIdForUser, User } from '@/utils/ht6-api';
import Button from '@/components/button';

type SortField = 'fullName' | 'email' | 'status';
type SortDirection = 'asc' | 'desc' | null;
type CheckInFilter = 'all' | 'checkedIn' | 'notCheckedIn';

export default function Hackers() {
  const [hackers, setHackers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [generatingNfc, setGeneratingNfc] = useState<string | null>(null);
  const [nfcUrls, setNfcUrls] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [checkInFilter, setCheckInFilter] = useState<CheckInFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [inputPage, setInputPage] = useState(1);

  useEffect(() => {
    const fetchHackers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getUser(1, 1000, 'asc', 'firstName', '', {
          'status.confirmed': true,
          'groups.hacker': true,
        });
        setHackers(res.message);
      } catch (e: any) {
        setError('Failed to load hackers');
      } finally {
        setLoading(false);
      }
    };
    fetchHackers();
  }, []);

  const handleCheckIn = async (user: User) => {
    setCheckingIn(user._id);
    try {
      await checkInUser(user._id, 'User');
      setHackers((prev) =>
        prev.map((h) =>
          h._id === user._id ?
            { ...h, status: { ...h.status, checkedIn: true } }
          : h,
        ),
      );
    } catch (e) {
      setError('Check-in failed');
    } finally {
      setCheckingIn(null);
    }
  };

  const handleGenerateNfc = async (user: User) => {
    setGeneratingNfc(user._id);
    try {
      const nfcId = await getNfcIdForUser(user._id);
      if (nfcId) {
        setNfcUrls((prev) => ({
          ...prev,
          [user._id]: `${window.location.origin}/nfc/u/${nfcId}`,
        }));
      } else {
        setError('Failed to generate NFC URL');
      }
    } catch (e) {
      setError('Failed to generate NFC URL');
    } finally {
      setGeneratingNfc(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedHackers = useMemo(() => {
    let filtered = [...hackers];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.fullName.toLowerCase().includes(searchLower) ||
          h.email.toLowerCase().includes(searchLower),
      );
    }

    // Apply check-in filter
    if (checkInFilter === 'checkedIn') {
      filtered = filtered.filter((h) => h.status.checkedIn);
    } else if (checkInFilter === 'notCheckedIn') {
      filtered = filtered.filter((h) => !h.status.checkedIn);
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aValue: string | boolean;
        let bValue: string | boolean;

        if (sortField === 'fullName') {
          aValue = a.fullName;
          bValue = b.fullName;
        } else if (sortField === 'email') {
          aValue = a.email;
          bValue = b.email;
        } else {
          // status
          aValue = a.status.checkedIn;
          bValue = b.status.checkedIn;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return sortDirection === 'asc' ? comparison : -comparison;
        } else {
          // boolean comparison
          const comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
          return sortDirection === 'asc' ? comparison : -comparison;
        }
      });
    }

    return filtered;
  }, [hackers, searchTerm, checkInFilter, sortField, sortDirection]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedHackers.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedHackers = filteredAndSortedHackers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setInputPage(1);
  }, [searchTerm, checkInFilter, sortField, sortDirection]);

  // Sync inputPage with currentPage
  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  const checkedInCount = hackers.filter((h) => h.status.checkedIn).length;
  const displayedCount = filteredAndSortedHackers.length;

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    if (sortDirection === 'asc') return ' ↑';
    if (sortDirection === 'desc') return ' ↓';
    return '';
  };

  const handlePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of table
      document.querySelector('#hackers-top')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(parseInt(e.target.value) || 1);
  };

  const handleSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setInputPage(1);
  };

  const scrollToTop = () => {
    document.querySelector('#hackers-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="p-4" id="hackers-top">
      <h1 className="text-3xl font-bold mb-4">Hackers</h1>
      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          {loading ?
            'Loading...'
          : `${checkedInCount} / ${hackers.length} checked in`}
          {!loading && displayedCount !== hackers.length && (
            <span className="ml-2 text-gray-500 dark:text-gray-400">
              (Showing {displayedCount} filtered)
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
          />
          <select
            value={checkInFilter}
            onChange={(e) => setCheckInFilter(e.target.value as CheckInFilter)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="checkedIn">Checked In</option>
            <option value="notCheckedIn">Not Checked In</option>
          </select>
        </div>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
          <thead>
            <tr>
              <th
                className="px-4 py-2 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 select-none"
                onClick={() => handleSort('fullName')}
              >
                Name{getSortIndicator('fullName')}
              </th>
              <th
                className="px-4 py-2 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 select-none"
                onClick={() => handleSort('email')}
              >
                Email{getSortIndicator('email')}
              </th>
              <th
                className="px-4 py-2 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 select-none"
                onClick={() => handleSort('status')}
              >
                Status{getSortIndicator('status')}
              </th>
              <th className="px-4 py-2 border-b">Check In</th>
              <th className="px-4 py-2 border-b">NFC URL</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHackers.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <td className="px-4 py-2 border-b">{user.fullName}</td>
                <td className="px-4 py-2 border-b">{user.email}</td>
                <td className="px-4 py-2 border-b">
                  {user.status.checkedIn ? 'Checked In' : 'Not Checked In'}
                </td>
                <td className="px-4 py-2 border-b">
                  <Button
                    onClick={() => handleCheckIn(user)}
                    disabled={user.status.checkedIn || checkingIn === user._id}
                  >
                    {checkingIn === user._id ?
                      'Checking In...'
                    : user.status.checkedIn ?
                      'Checked In'
                    : 'Check In'}
                  </Button>
                </td>
                <td className="px-4 py-2 border-b">
                  <Button
                    onClick={() => handleGenerateNfc(user)}
                    disabled={generatingNfc === user._id}
                  >
                    {generatingNfc === user._id ?
                      'Generating...'
                    : 'Generate NFC URL'}
                  </Button>
                  {nfcUrls[user._id] && (
                    <div className="mt-2 text-xs break-all">
                      <a
                        href={nfcUrls[user._id]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        {nfcUrls[user._id]}
                      </a>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAndSortedHackers.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm || checkInFilter !== 'all' ?
              'No hackers found matching your filters'
            : 'No hackers found'}
          </div>
        )}
      </div>
      {!loading && filteredAndSortedHackers.length > 0 && (
        <div className="flex space-x-3 mt-4 items-center justify-end" id="hackers-bottom">
          {pageSize > 10 && (
            <Button
              buttonType="primary"
              onClick={scrollToTop}
              className="font-normal px-2 py-1 dark:bg-primary-dark dark:hover:bg-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 18.75 7.5-7.5 7.5 7.5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 7.5-7.5 7.5 7.5"
                />
              </svg>
            </Button>
          )}
          <select
            className="mx-1 pl-2 py-1 border rounded dark:bg-slate-700"
            value={pageSize}
            onChange={(e) => {
              handleSize(parseInt(e.target.value));
            }}
          >
            <option value="10" className="dark:bg-slate-500">
              10 per page
            </option>
            <option value="25" className="dark:bg-slate-500">
              25 per page
            </option>
            <option value="50" className="dark:bg-slate-500">
              50 per page
            </option>
            <option value="100" className="dark:bg-slate-500">
              100 per page
            </option>
          </select>
          <Button
            buttonType="secondary"
            onClick={() => {
              handlePage(currentPage - 1);
            }}
            disabled={currentPage === 1}
            className="font-normal bg-transparent px-2 py-1 disabled:opacity-50 dark:text-white dark:hover:bg-slate-700"
          >
            &lt;
          </Button>
          <span>
            Page
            <input
              type="number"
              min="1"
              max={totalPages}
              value={inputPage}
              onChange={handlePageInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePage(inputPage);
                }
              }}
              className="mx-1 pl-2 py-1 border rounded dark:bg-slate-700"
            />
            of {totalPages}
            <Button
              buttonType="secondary"
              onClick={() => {
                handlePage(inputPage);
              }}
              className="font-normal ml-2 px-2 py-1 bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary dark:text-white"
            >
              Go
            </Button>
          </span>
          <Button
            buttonType="secondary"
            onClick={() => {
              handlePage(currentPage + 1);
            }}
            disabled={currentPage === totalPages}
            className="font-normal px-2 py-1 bg-transparent disabled:opacity-50 dark:text-white dark:hover:bg-slate-700"
          >
            &gt;
          </Button>
        </div>
      )}
    </div>
  );
}
