/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React, { Suspense, useState, useEffect } from 'react';
import type { Info } from './+types';
import ApplicationHeader from './application-header';
import { getUser, getRankedUser, User } from '@/utils/ht6-api';
import {
  useLoaderData,
  useNavigate,
  useSearchParams,
  Await,
} from 'react-router';
import Button from '@/components/button';

// Helper function to get status chip colors - each status gets a unique color
const getStatusChipClasses = (status: string): string => {
  const statusLower = status.toLowerCase().trim();
  
  // Map each individual status to a unique color
  const statusColorMap: Record<string, string> = {
    'accepted': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'confirmed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    'checked in': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'declined': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    'waitlisted': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    'applied': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'expired': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };
  
  // Try exact match first
  if (statusColorMap[statusLower]) {
    return statusColorMap[statusLower];
  }
  
  // Try partial matches for variations
  for (const [key, color] of Object.entries(statusColorMap)) {
    if (statusLower.includes(key)) {
      return color;
    }
  }
  
  // Default - Neutral gray for unknown statuses
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

// Status chip component
const StatusChip = ({ status }: { status: string }) => (
  <span
    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipClasses(status)}`}
  >
    {status}
  </span>
);

// Table header name, function to get data, path for sorting, width
const columns = new Map<
  string,
  [(user: User) => React.ReactNode, string, string]
>([
  ['Name', [(user) => user.fullName, 'lastName', 'w-[250px]']],
  [
    'Status',
    [
      (user) => <StatusChip status={user.status.internalTextStatus} />,
      'status.internalTextStatus',
      'w-[200px]',
    ],
  ],
  ['ID', [(user) => user._id, '_id', 'w-[100px]']],
  ['Email', [(user) => user.email, 'email', 'w-[300px]']],
  [
    'Final Rating',
    [
      (user) => {
        return user.internal.computedFinalApplicationScore ?
            user.internal.computedFinalApplicationScore
          : 'No Rank';
      },
      'internal.computedFinalApplicationScore',
      'w-[200px]',
    ],
  ],
  [
    'Personal Rating',
    [
      (user) => {
        return user.internal.computedApplicationScore !== -1 ?
            user.internal.computedApplicationScore
          : 'No Rank';
      },
      'internal.computedApplicationScore',
      'w-[200px]',
    ],
  ],
]);

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const size = parseInt(url.searchParams.get('size') ?? '10');
  const sortCriteria =
    (
      url.searchParams.get('sortCriteria') === 'asc' ||
      url.searchParams.get('sortCriteria') === 'desc'
    ) ?
      url.searchParams.get('sortCriteria')
    : 'asc';
  const sortField = url.searchParams.get('sortField') ?? '';
  const isRanked = url.searchParams.get('isRanked') ?? 'false';
  const search = url.searchParams.get('search') ?? '';
  const statusFilter = url.searchParams.get('status') ?? '';

  // Build filter object with status filter if provided
  const baseFilter: Record<string, unknown> = {
    $and: [{ 'groups.hacker': true }],
  };

  // Add status filter to backend query using boolean fields with hierarchy logic
  if (statusFilter && statusFilter !== 'all') {
    // Status hierarchy: applied -> accepted/rejected/waitlisted -> confirmed/declined -> checked in
    // Each status should exclude higher-level statuses
    // Use $ne: true instead of false to match both false and undefined/null values
    const statusBooleanMap: Record<string, Record<string, unknown>> = {
      'applied': {
        'status.applied': true,
        'status.accepted': { $ne: true },
        'status.rejected': { $ne: true },
        'status.waitlisted': { $ne: true },
      },
      'accepted': {
        'status.accepted': true,
        'status.rejected': { $ne: true },
        'status.waitlisted': { $ne: true },
        'status.confirmed': { $ne: true },
        'status.declined': { $ne: true },
        'status.checkedIn': { $ne: true },
      },
      'rejected': {
        'status.rejected': true,
        'status.accepted': { $ne: true },
      },
      'waitlisted': {
        'status.waitlisted': true,
        'status.accepted': { $ne: true },
        // Note: waitlisted people might also be marked as rejected, so don't exclude it
      },
      'confirmed': {
        'status.confirmed': true,
        'status.declined': { $ne: true },
        'status.checkedIn': { $ne: true },
      },
      'declined': {
        'status.declined': true,
        'status.confirmed': { $ne: true },
      },
      'checked in': {
        'status.checkedIn': true,
      },
      'expired': {
        $or: [
          { 'status.rsvpExpired': true },
          { 'status.applicationExpired': true }
        ]
      },
    };

    const statusCondition = statusBooleanMap[statusFilter.toLowerCase()];
    if (statusCondition) {
      baseFilter.$and = [
        ...(baseFilter.$and as Record<string, unknown>[]),
        statusCondition,
      ];
    }
  }

  const applicantsData = await (isRanked === 'false' ?
    getUser(page, size, sortCriteria as 'asc' | 'desc', sortField, search, baseFilter)
  : getRankedUser());

  // Calculate total pages based on results
  // When filtering, if we get fewer results than page size, we're on the last page
  let totalPages = 50; // Default
  if (statusFilter && statusFilter !== 'all') {
    const resultCount = applicantsData.message?.length || 0;
    if (resultCount < size) {
      // Got fewer results than page size, so this is the last page
      totalPages = page;
    } else if (resultCount === 0 && page > 1) {
      // No results on this page, so previous page was the last
      totalPages = page - 1;
    } else {
      // Got a full page, so there might be more - allow going to next page
      // But cap it reasonably to prevent infinite pagination
      totalPages = Math.max(page + 1, 50);
    }
  }

  return {
    applicants: applicantsData.message,
    currentPage: page,
    totalPage: totalPages,
    size: size,
    isRanked: isRanked === 'true',
  };
}

export default function Applications() {
  const data = useLoaderData<Info['loaderData']>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inputPage, setInputPage] = useState(data.currentPage);
  const [isTableLoading, setIsTableLoading] = useState(false);

  const handleSort = (field?: string) => {
    if (!field) return;

    const currentSortField = searchParams.get('sortField');
    const currentSortCriteria = searchParams.get('sortCriteria');

    const params = new URLSearchParams(searchParams);

    if (currentSortField === field) {
      if (currentSortCriteria === 'asc') {
        params.set('sortCriteria', 'desc');
      } else if (currentSortCriteria === 'desc') {
        params.delete('sortField');
        params.delete('sortCriteria');
      } else {
        params.set('sortCriteria', 'asc');
      }
    } else {
      params.set('sortField', field);
      params.set('sortCriteria', 'asc');
    }
    setIsTableLoading(true);
    void navigate(`?${params.toString()}`);
  };

  const handleRanked = () => {
    const params = new URLSearchParams(searchParams);
    params.set('isRanked', !data.isRanked ? 'true' : 'false');
    params.delete('sortField');
    params.delete('sortCriteria');
    setIsTableLoading(true);
    void navigate(`?${params.toString()}`);
  };

  const handlePage = (page: number) => {
    if (page >= 1 && page <= data.totalPage) {
      const params = new URLSearchParams(searchParams);
      params.set('page', page.toString());
      setIsTableLoading(true);
      void navigate(`?${params.toString()}`);
    }
  };

  const handleSize = (size: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('size', size.toString());
    setIsTableLoading(true);
    void navigate(`?${params.toString()}`);
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(parseInt(e.target.value));
  };

  useEffect(() => {
    setIsTableLoading(false);
  }, [data]);

  useEffect(() => {
    setInputPage(data.currentPage);
  }, [data.currentPage]);

  const TableLoadingIndicator = () => (
    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-50/80 dark:bg-slate-800 text-center py-2 px-4 rounded-lg shadow-md">
      <span className="font-semibold text-primary dark:text-white">
        Loading data...
      </span>
    </div>
  );

  const scrollToTop = () => {
    console.log(document.body.scrollHeight);
    document.querySelector('#top')?.scrollIntoView();
  };

  return (
    <div className="p-4 m-3" id="top">
      <ApplicationHeader isRanked={data.isRanked} handleRanked={handleRanked} />
      <div>
        {isTableLoading && <TableLoadingIndicator />}
        <table className="min-w-full table-fixed border-collapse text-left">
          <thead className="sticky top-0.5 z-1 bg-slate-50 dark:bg-slate-700 rounded-t-lg">
            <tr>
              {[...columns.entries()].map(([key, value]) => (
                <th
                  key={key}
                  className={`px-2 py-2 border-b text-sm font-semibold dark:text-white dark:border-slate-600 ${value[2]} truncate`}
                  onClick={() => {
                    if (!data.isRanked && key != 'Status') handleSort(value[1]);
                  }}
                >
                  {key}
                  {searchParams.get('sortField') === value[1] &&
                    (searchParams.get('sortCriteria') === 'asc' ? ' ↑'
                    : searchParams.get('sortCriteria') === 'desc' ? ' ↓'
                    : '')}
                </th>
              ))}
            </tr>
          </thead>
          <Suspense>
            <Await resolve={data} errorElement={<p>Oh no...</p>}>
              <tbody className="max-h-64 overflow-y-auto">
                {data.applicants?.map((user: User) => (
                  <tr
                    key={user._id}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-500 dark:hover:bg-slate-700"
                    onClick={() => {
                      void navigate(`/user/${user._id}`);
                    }}
                  >
                    {[...columns.entries()].map(([key, value]) => (
                      <td
                        key={key}
                        className={`px-2 py-2 border-b border-gray-200 dark:border-slate-600 text-sm ${key === 'Status' ? '' : 'truncate'} ${value[2]}`}
                      >
                        {value[0](user)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Await>
          </Suspense>
        </table>
      </div>
      <div className="flex space-x-3 mt-4 items-center justify-end" id="bottom">
        {parseInt(searchParams.get('size') ?? '10') > 10 && (
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
          value={data.size}
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
            handlePage(data.currentPage - 1);
          }}
          disabled={data.currentPage === 1}
          className="font-normal bg-transparent px-2 py-1 disabled:opacity-50 dark:text-white dark:hover:bg-slate-700"
        >
          &lt;
        </Button>
        <span>
          Page
          <input
            type="number"
            min="1"
            max={data.totalPage}
            value={inputPage}
            onChange={handlePageInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handlePage(inputPage);
              }
            }}
            className="mx-1 pl-2 py-1 border rounded dark:bg-slate-700"
          />
          of {data.totalPage}
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
            handlePage(data.currentPage + 1);
          }}
          disabled={data.currentPage === data.totalPage}
          className="font-normal px-2 py-1 bg-transparent	 disabled:opacity-50  dark:text-white dark:hover:bg-slate-700"
        >
          &gt;
        </Button>
      </div>
    </div>
  );
}

