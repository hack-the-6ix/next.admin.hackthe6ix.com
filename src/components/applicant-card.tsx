import React, { ReactNode, FC } from 'react';
import { Link } from 'react-router-dom';
import { ApplicantsResponse } from '../utils/ht6-api';

interface ApplicantCardProps {
  base: string;
  index: number;
  info: ApplicantsResponse;
  children?: ReactNode;
  className?: string;
}

const ApplicantCard: FC<ApplicantCardProps> = ({
  base,
  index,
  info,
  className = '',
}) => {
  return (
    <Link to={`${base}/${info._id}`}>
      <div
        className={`bg-slate-50 dark:bg-slate-700 p-5 text-center rounded-lg hover:bg-slate-100 hover:dark:bg-slate-600 ${className}`}
      >
        <div className="flex flex-row">
          <h2 className="text-lg font-bold mb-2 text-primary dark:text-white">
            {index ? `${String(index)}. ` : ''}
            {info.firstName} {info.lastName}
          </h2>
          <h2 className="text-lg font-bold mb-2 text-slate-500 dark:text-slate-300 flex md:flex md:flex-grow flex-row justify-end space-x-3">
            {info.status.internalTextStatus}
          </h2>
        </div>

        <div className="text-slate-500 dark:text-slate-300 flex flex-row text-xs space-x-3">
          <div className="inline-flex items-center space-x-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4"
            >
              <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
              <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
            </svg>
            <span>{info.email}</span>
          </div>
          <div className="inline-flex items-center space-x-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4"
            >
              <path
                fillRule="evenodd"
                d="M3 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H3Zm2.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM10 5.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm.75 3.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5ZM10 8a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 10 8Zm-2.378 3c.346 0 .583-.343.395-.633A2.998 2.998 0 0 0 5.5 9a2.998 2.998 0 0 0-2.517 1.367c-.188.29.05.633.395.633h4.244Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{info._id}</span>
          </div>
          <div className="inline-flex items-center space-x-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4"
            >
              <path
                fillRule="evenodd"
                d="M8.074.945A4.993 4.993 0 0 0 6 5v.032c.004.6.114 1.176.311 1.709.16.428-.204.91-.61.7a5.023 5.023 0 0 1-1.868-1.677c-.202-.304-.648-.363-.848-.058a6 6 0 1 0 8.017-1.901l-.004-.007a4.98 4.98 0 0 1-2.18-2.574c-.116-.31-.477-.472-.744-.28Zm.78 6.178a3.001 3.001 0 1 1-3.473 4.341c-.205-.365.215-.694.62-.59a4.008 4.008 0 0 0 1.873.03c.288-.065.413-.386.321-.666A3.997 3.997 0 0 1 8 8.999c0-.585.126-1.14.351-1.641a.42.42 0 0 1 .503-.235Z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Personal Rating: {info.internal.computedApplicationScore}
            </span>
          </div>
          <div className="inline-flex items-center space-x-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4"
            >
              <path
                fillRule="evenodd"
                d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L7.998 12.08l-3.135 1.915a.75.75 0 0 1-1.12-.814l.852-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.41-3.393A.75.75 0 0 1 8 1.75Z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Final Rating:{' '}
              {info.internal.computedFinalApplicationScore ?
                info.internal.computedFinalApplicationScore
              : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ApplicantCard;
