import React, { useState, useEffect } from 'react';
import ApplicationHeader from './application-header';
import ApplicantCard from '@/components/applicant-card';
import { FixedSizeList as List } from 'react-window';
import { getApplicants, ApplicantsResponse } from '../../utils/ht6-api';
//https://react-window.vercel.app/#/examples/list/fixed-size

const applicants = [
  {
    _id: '1',
    firstName: 'Dokja',
    lastName: 'Kim',
    email: 'kim.dokja@example.com',
    status: { internalTextStatus: 'Accepted' },
    internal: {
      computedApplicationScore: 85,
      computedFinalApplicationScore: 90,
    },
  },
  {
    _id: '2',
    firstName: 'Joonghyuk',
    lastName: 'Yoo',
    email: 'yoo.joonghyuk@example.com',
    status: { internalTextStatus: 'Rejected' },
    internal: {
      computedApplicationScore: 20,
      computedFinalApplicationScore: 30,
    },
  },
  {
    _id: '3',
    firstName: 'Hayoung',
    lastName: 'Jang',
    email: 'yoo.joonghyuk@example.com',
    status: { internalTextStatus: 'Application Expired' },
    internal: {
      computedApplicationScore: 100,
      computedFinalApplicationScore: 100,
    },
  },
  {
    _id: '44',
    firstName: 'Athanasia',
    lastName: 'de Alger Obelia',
    email: 'athanasiaobeliaaa@example.com',
    status: { internalTextStatus: 'Confirmed' },
    internal: {
      computedApplicationScore: 95,
      computedFinalApplicationScore: 92,
    },
  },
  {
    _id: '555',
    firstName: 'Lucas',
    lastName: '',
    email: 'Lucastheblacktowermagician@example.com',
    status: { internalTextStatus: 'Application Expired' },
    internal: {
      computedApplicationScore: 30,
      computedFinalApplicationScore: 0,
    },
  },
  {
    _id: '6666',
    firstName: 'Felix',
    lastName: 'Robane',
    email: 'claudesknight@example.com',
    status: { internalTextStatus: 'Waitlisted' },
    internal: {
      computedApplicationScore: 80,
      computedFinalApplicationScore: 75,
    },
  },
  {
    _id: '77777ly',
    firstName: 'Lilian',
    lastName: 'York',
    email: 'obeliasfavouritemaid@example.com',
    status: { internalTextStatus: 'Checked In' },
    internal: {
      computedApplicationScore: 83,
      computedFinalApplicationScore: 80,
    },
  },
];
export function Component() {
  const [data, setData] = useState<ApplicantsResponse | null>(null);
  const listRef = React.createRef<List>();

  return (
    <div className="p-4 m-3">
      <ApplicationHeader listRef={listRef} />
      <div className="flex justify-center">
        <List
          ref={listRef}
          height={500}
          itemCount={applicants.length}
          itemSize={100}
          width={1280}
        >
          {({ index, style }) => (
            <div style={style} className="space-y-5">
              <ApplicantCard
                base=""
                index={index + 1}
                info={applicants[index]}
                className="mr-5"
              />
            </div>
          )}
        </List>
      </div>
    </div>
  );
}
