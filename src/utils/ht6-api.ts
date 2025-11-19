import { LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router';

export interface Ht6ApiResponse<Data = string> {
  status: number;
  message: Data;
}

export interface FetchHt6ApiOptions<Payload extends Record<string, unknown>> {
  searchParams?: URLSearchParams;
  payload?: Payload;
  method?: string;
}

type GroupCounts = Record<string, number>;
type Reviewers = Record<string, { total: number; name: string }>;

export interface StatisticsResponse {
  total: number;
  timestamp: number;
  groups: GroupCounts;
  hacker: {
    status: GroupCounts;
    submittedApplicationStats: {
      gender: GroupCounts;
      review: {
        reviewed: number;
        notReviewed: number;
        applicationScores: GroupCounts;
        reviewers: Reviewers;
      };
    };
    questionBreakdown: GroupCounts;
  };
}

export type UsersResponse = User[];

export interface User {
  _id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  created: number;
  checkInQR?: string;
  computedApplicationOpen: number;
  computedApplicationDeadline: number;
  computedRSVPDeadline: number;
  checkInNotes: string[];
  checkInTime?: number;
  rsvpForm: {
    selectedCompanies: string[];
    remindInPersonRSVP: boolean;
  };
  discord: {
    discordID?: string;
    username?: string;
    verifyTime?: number;
    additionalRoles: string[];
    refreshToken?: string;
    lastSyncTime?: number;
    lastSyncStatus?: string;
  };
  roles: {
    hacker: boolean;
    admin: boolean;
    organizer: boolean;
    volunteer: boolean;
  };
  status: {
    textStatus: string;
    internalTextStatus: string;
    statusReleased: boolean;
    applied: boolean;
    accepted: boolean;
    rejected: boolean;
    waitlisted: boolean;
    confirmed: boolean;
    declined: boolean;
    checkedIn: boolean;
    rsvpExpired: boolean;
    applicationExpired: boolean;
    canAmendTeam: boolean;
    canApply: boolean;
    canRSVP: boolean;
    isRSVPOpen: boolean;
  };
  hackerApplication?: {
    lastUpdated?: number;
    teamCode?: string;
    emailConsent?: boolean;
    phoneNumber?: string;
    age?: number;
    gender?: string;
    ethnicity?: string;
    country?: string;
    shirtSize?: string;
    dietaryRestrictions?: string;
    city?: string;
    province?: string;
    emergencyContact?: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      relationship?: string;
    };
    school?: string;
    program?: string;
    levelOfStudy?: string;
    graduationYear?: 2025;
    hackathonsAttended?: string;
    resumeFileName?: string;
    friendlyResumeFileName?: string;
    resumeSharePermission?: boolean;
    githubLink?: string;
    portfolioLink?: string;
    linkedinLink?: string;
    longEssay?: string;
    shortEssay?: string;
    mlhCOC?: boolean;
    mlhEmail?: boolean;
    mlhData?: boolean;
    oneSentenceEssay?: string;
  };
  internal: {
    notes?: string;
    computedApplicationScore?: number;
    computedFinalApplicationScore?: number;
    applicationScores?: {
      shortEssay: {
        score: number;
        reviewer?: string;
      };
      longEssay: {
        score: number;
        reviewer?: string;
      };
      oneSentenceEssay: {
        score: number;
        reviewer?: string;
      };
      portfolio: {
        score: number;
        reviewer?: string;
      };
    };
  };
  mailmerge: {
    FIRST_NAME: string;
    LAST_NAME: string;
    MERGE_FIRST_NAME: string;
    MERGE_LAST_NAME: string;
    MERGE_APPLICATION_DEADLINE: string;
    MERGE_CONFIRMATION_DEADLINE: string;
  };
}

export async function fetchHt6Api<
  Result,
  Payload extends Record<string, unknown>,
>(
  path: string,
  {
    payload,
    method = payload ? 'POST' : 'GET',
    searchParams,
  }: FetchHt6ApiOptions<Payload> = {},
) {
  const requestUrl = new URL(path, import.meta.env.VITE_API_HOST);
  if (searchParams) {
    Array.from(searchParams).forEach((keyPair) => {
      requestUrl.searchParams.set(...keyPair);
    });
  }

  const response = await fetch(requestUrl, {
    body: payload ? JSON.stringify(payload) : null,
    headers: {
      'X-Access-Token': window.localStorage.getItem('HT6_token') ?? '',
      'Content-Type': 'application/json',
    },
    method,
  });

  const data = (await response.json()) as Ht6ApiResponse<Result>;

  if (data.status !== 200) {
    const error = new Error(data.message as string);
    (error as any).status = data.status;
    (error as any).message = data.message;
    throw error;
  }

  return data;
}

export function toLoaderResult<T>(result: Ht6ApiResponse<T>) {
  const res = new Response(JSON.stringify(result.message), {
    statusText: JSON.stringify(result.message),
    status: result.status,
  });
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (result.status !== 200) throw res;
  return res;
}

export function loaderAuthCheck(next: LoaderFunction = () => null) {
  return (args: LoaderFunctionArgs) => {
    if (!window.localStorage.getItem('HT6_token')) {
      return redirect('/role-select');
    }
    return next(args);
  };
}

export const getStatistics = async (update: boolean) => {
  return fetchHt6Api<StatisticsResponse, never>('/api/action/getStatistics', {
    method: 'GET',
    searchParams: new URLSearchParams({ update: update ? 'true' : 'false' }),
  });
};

export const getCandidate = async (
  update: boolean,
  category: string | undefined,
) => {
  return fetchHt6Api<User, never>(
    `/api/action/getCandidate${category ? '?category=' + category : ''}`,
    {
      method: 'GET',
      searchParams: new URLSearchParams({ update: update ? 'true' : 'false' }),
    },
  );
};

export async function gradeCandidate(
  candidateID: string,
  grade: Record<string, number>,
) {
  const body: Record<string, unknown> = {
    candidateID,
    grade,
  };

  return fetchHt6Api<string, Record<string, unknown>>(
    'api/action/gradeCandidate',
    {
      payload: body,
      method: 'POST',
    },
  );
}

export async function getUser(
  page = 1,
  size = 30,
  sortCriteria?: 'asc' | 'desc',
  sortField?: string,
  search?: string,
  filter?: Record<string, unknown>,
) {
  const body: Record<string, unknown> = {
    page,
    size,
  };
  body.filter = {};
  if (sortCriteria) body.sortCriteria = sortCriteria;
  if (sortField) body.sortField = sortField;
  if (filter) body.filter = filter;
  if (search) {
    const searchParts = search.trim().split(/\s+/);
    const regexConditions = searchParts.map((part) => {
      const orConditions: Record<string, unknown>[] = [
        { firstName: { $regex: part, $options: 'i' } },
        { lastName: { $regex: part, $options: 'i' } },
      ];

      if (/^[a-f\d]{24}$/i.test(part)) {
        orConditions.push({ _id: part });
      }

      return { $or: orConditions };
    });
    // Merge existing $and conditions with search conditions
    const existingAnd = (body.filter as Record<string, unknown>).$and as Record<string, unknown>[] | undefined;
    body.filter = {
      ...(body.filter as Record<string, unknown>),
      $and: existingAnd ? [...existingAnd, ...regexConditions] : regexConditions,
    };
  }

  return fetchHt6Api<UsersResponse, Record<string, unknown>>('api/get/user', {
    payload: body,
    method: 'POST',
  });
}

export async function editObject(
  object: string,
  filter: Record<string, unknown>,
  changes: Record<string, unknown>,
  noFlatten?: boolean,
) {
  if (noFlatten === undefined) noFlatten = false;
  const body: Record<string, unknown> = {
    filter,
    changes,
    noFlatten,
  };
  return fetchHt6Api<string[], Record<string, unknown>>(`/api/edit/${object}`, {
    payload: body,
    method: 'POST',
  });
}

export async function getRankedUser() {
  return fetchHt6Api<UsersResponse, Record<string, unknown>>(
    '/api/action/getRanks',
    {
      method: 'GET',
    },
  );
}

export const getFileURL = async (filename: string) => {
  return fetchHt6Api<User, never>(`/api/gridfs`, {
    method: 'GET-FILE',
    searchParams: new URLSearchParams({
      filename: filename,
      bucket: 'resumes',
    }),
  });
};

export const getDownloadURL = async (
  container: string,
  blobName: string,
  expiresInMinutes?: number,
) => {
  const params = new URLSearchParams({ container, blobName });
  if (expiresInMinutes)
    params.append('expiresInMinutes', expiresInMinutes.toString());

  return fetchHt6Api<string, never>(
    `/api/blob/download-url?${params.toString()}`,
    {
      method: 'GET',
    },
  );
};

export interface OTP {
  id: string;
  code: string;
  email: string;
  used: boolean;
  expiration: string;
  createdAt: string;
  usedBy?: string;
  usedAt?: string;
  issuedBy: string;
  usedName?: string;
}

export interface GenerateOTPResponse {
  success: boolean;
  message: string;
  code: string;
  expiration: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

export interface GetAllOTPsResponse {
  success: boolean;
  otps: OTP[];
}

export const generateOTP = async (email: string) => {
  return fetchHt6Api<GenerateOTPResponse, { email: string }>(
    '/api/action/generate-otp',
    {
      payload: { email },
      method: 'POST',
    },
  );
};

export const verifyOTP = async (code: string, email: string) => {
  return fetchHt6Api<VerifyOTPResponse, { code: string; email: string }>(
    '/api/action/verify-otp',
    {
      payload: { code, email },
      method: 'POST',
    },
  );
};

export const getAllOTPs = async () => {
  return fetchHt6Api<GetAllOTPsResponse, never>('/api/action/get-all-otps', {
    method: 'GET',
  });
};

export const expireOTP = async (otpId: string) => {
  return fetchHt6Api<{ success: boolean; message: string }, never>(
    `/api/action/expire-otp/${otpId}`,
    {
      method: 'POST',
    },
  );
};

export interface ExternalUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  notes?: string;
  status: {
    checkedIn: boolean;
  };
  checkInQR?: string;
  checkInNotes: string[];
  checkInTime?: number;
  discord?: {
    discordID?: string;
    username?: string;
    verifyTime?: number;
    additionalRoles: string[];
    suffix?: string;
  };
}

export const getExternalUsers = async (
  page = 1,
  size = 1000,
  sortCriteria: 'asc' | 'desc' = 'asc',
  sortField = 'firstName',
  search?: string,
  filter?: Record<string, unknown>,
) => {
  const body: Record<string, unknown> = {
    page,
    size,
    sortCriteria,
    sortField,
  };
  if (filter) body.filter = filter;
  if (search) body.text = search;

  return fetchHt6Api<ExternalUser[], Record<string, unknown>>(
    '/api/get/externaluser',
    {
      payload: body,
      method: 'POST',
    },
  );
};

export const checkInUser = async (
  userID: string,
  userType: 'User' | 'ExternalUser',
) => {
  return fetchHt6Api<
    { status: number; message: false | string[] },
    { userID: string; userType: string }
  >('/api/action/checkIn', {
    payload: { userID, userType },
    method: 'POST',
  });
};

export const getNfcIdForUser = async (userId: string) => {
  const apiBaseURL = import.meta.env.VITE_API_HOST;
  const response = await fetch(`${apiBaseURL}/nfc/getUserId/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch NFC ID');
  const data = await response.json();
  return data.userId as string | undefined;
};
