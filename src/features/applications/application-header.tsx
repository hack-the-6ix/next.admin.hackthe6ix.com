import Button from '@/components/button';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import ReviewModal from '@/components/review-modal';

const ApplicationHeader = ({
  isRanked,
  handleRanked,
}: {
  isRanked: boolean;
  handleRanked: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewModal, setReviewModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
      params.delete('page');
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const toggleReviewModal = () => {
    setReviewModal(!reviewModal);
  };

  // function for scrolling to bottom onf table
  const scrollToBottom = () => {
    console.log(document.body.scrollHeight);
    document.querySelector('#bottom')?.scrollIntoView();
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center flex-wrap mb-3">
        <div className="mt-4 text-left mb-6">
          <h1 className="text-5xl font-bold text-primary">Applications</h1>
          <p className="text-xl font-bold text-slate-500 ">
            List of applicants
          </p>
        </div>
        <div className="flex md:flex md:flex-grow flex-row justify-end space-x-3 flex-wrap">
          {parseInt(searchParams.get('size') ?? '10') > 10 && (
            <Button
              className="h-12 dark:bg-primary-dark dark:hover:bg-primary"
              onClick={scrollToBottom}
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
                  d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                />
              </svg>
            </Button>
          )}
          <Button
            className="h-12 dark:bg-primary-dark dark:hover:bg-primary"
            onClick={handleRanked}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4"
            >
              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
              <path
                fillRule="evenodd"
                d="M1.38 8.28a.87.87 0 0 1 0-.566 7.003 7.003 0 0 1 13.238.006.87.87 0 0 1 0 .566A7.003 7.003 0 0 1 1.379 8.28ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{isRanked ? 'View No Rank' : 'View Final Rank'}</span>
          </Button>
          <Button
            className="h-12  dark:bg-primary-dark dark:hover:bg-primary"
            onClick={toggleReviewModal}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M13.5 4.938a7 7 0 1 1-9.006 1.737c.202-.257.59-.218.793.039.278.352.594.672.943.954.332.269.786-.049.773-.476a5.977 5.977 0 0 1 .572-2.759 6.026 6.026 0 0 1 2.486-2.665c.247-.14.55-.016.677.238A6.967 6.967 0 0 0 13.5 4.938ZM14 12a4 4 0 0 1-4 4c-1.913 0-3.52-1.398-3.91-3.182-.093-.429.44-.643.814-.413a4.043 4.043 0 0 0 1.601.564c.303.038.531-.24.51-.544a5.975 5.975 0 0 1 1.315-4.192.447.447 0 0 1 .431-.16A4.001 4.001 0 0 1 14 12Z"
                clipRule="evenodd"
              />
            </svg>
            <span> Begin Review</span>
          </Button>
        </div>
      </div>
      <div className="w-full pb-4">
        <div className="relative">
          <input
            className="w-full bg-white dark:bg-slate-700 placeholder:text-slate-500 text-slate-900 dark:text-slate-100 text-sm border border-slate-900 rounded-xl pl-3 pr-28 py-2 transition duration-300 ease focus:outline-none focus:border-primary  shadow-sm focus:shadow dark:border-slate-500 dark:focus:border-white"
            placeholder="Search for an applicant with name or id..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            disabled={isRanked}
          />
          <button
            className="absolute top-1 right-1 flex items-center rounded-xl bg-primary dark:bg-primary-dark dark:hover:bg-primary py-1 px-2.5 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:shadow-none active:bg-slate-700 hover:bg-primary-dark active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button"
            onClick={handleSearch}
            disabled={isRanked}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4 mr-2"
            >
              <path
                fillRule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z"
                clipRule="evenodd"
              />
            </svg>
            Search
          </button>
        </div>
      </div>
      <ReviewModal isOpen={reviewModal} onClose={toggleReviewModal} />
    </div>
  );
};

export default ApplicationHeader;
