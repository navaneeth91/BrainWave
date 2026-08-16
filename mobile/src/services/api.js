// Mobile API service — talks to the EXISTING BrainWave backend.
// Uses the auth token obtained from Clerk (getToken)
// and sends it as Authorization: Bearer <token>.

import axios from 'axios';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || 'http://10.0.2.2:5000';

export const API_BASE_URL = BACKEND_URL;

export const CURRENCY_SYMBOL =
  process.env.EXPO_PUBLIC_CURRENCY || '₹';

export const FREE_COURSES_MODE =
  process.env.EXPO_PUBLIC_FREE_COURSES_MODE !== 'false';

// ---------------------------------------------------------------------------
// Token provider
// ---------------------------------------------------------------------------

let tokenProvider = null;
let onUnauthorized = null;

export const setTokenProvider = (fn) => {
  tokenProvider = fn;
};

export const setOnUnauthorized = (fn) => {
  onUnauthorized = fn;
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Attach Clerk token to every request
// ---------------------------------------------------------------------------

api.interceptors.request.use(
  async (config) => {
    console.log(
      'API REQUEST:',
      config.method?.toUpperCase(),
      config.url
    );

    if (tokenProvider) {
      try {
        const token = await tokenProvider();

        console.log('AUTH TOKEN EXISTS:', !!token);

        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn(
            'WARNING: No authentication token available for:',
            config.url
          );
        }
      } catch (error) {
        console.error(
          'TOKEN ERROR:',
          error?.message || error
        );
      }
    } else {
      console.warn('WARNING: tokenProvider is not configured');
    }

    return config;
  },
  (error) => {
    console.error('REQUEST INTERCEPTOR ERROR:', error);
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Response interceptor
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  (response) => {
    console.log(
      'API RESPONSE:',
      response.status,
      response.config?.url
    );

    return response;
  },

  (error) => {
    const status = error.response?.status;

    console.error('API ERROR:', {
      url: error.config?.url,
      method: error.config?.method,
      status,
      message: error.message,
      data: error.response?.data,
    });

    if (status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Normalize errors
// ---------------------------------------------------------------------------

export function getErrorMessage(
  error,
  fallback = 'Something went wrong'
) {
  if (typeof error === 'string' && error) {
    return error;
  }

  if (error?.response?.data?.message) {
    return String(error.response.data.message);
  }

  if (error?.response?.data?.error) {
    return String(error.response.data.error);
  }

  if (error?.response?.status === 400) {
    return 'Invalid request.';
  }

  if (error?.response?.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (error?.response?.status === 403) {
    return 'You do not have permission to do that.';
  }

  if (error?.response?.status === 404) {
    return 'The requested resource was not found.';
  }

  if (
    error?.response?.status &&
    error.response.status >= 500
  ) {
    return 'The server hit a problem. Please try again shortly.';
  }

  if (error?.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.';
  }

  if (
    error?.message === 'Network Error' ||
    !error?.response
  ) {
    return 'Unable to connect to the server. Please check your connection.';
  }

  return fallback;
}

// ===========================================================================
// COURSE API
// ===========================================================================

// ---------------------------------------------------------------------------
// Get all courses
// Public API - no authentication required
// ---------------------------------------------------------------------------

export const getAllCourses = async () => {
  try {
    console.log('GETTING ALL COURSES');

    const { data } = await api.get('/api/course/all');

    console.log('ALL COURSES RESPONSE:', data);

    if (!data?.success) {
      throw new Error(
        data?.message || 'Failed to load courses'
      );
    }

    return data.courses || [];
  } catch (error) {
    console.error('GET ALL COURSES ERROR:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    throw error;
  }
};

// ---------------------------------------------------------------------------
// Get course by ID
// ---------------------------------------------------------------------------

export const getCourseById = async (courseId) => {
  if (!courseId) {
    throw new Error('Course ID is required');
  }

  try {
    console.log('GETTING COURSE:', courseId);

    const { data } = await api.get(
      `/api/course/${courseId}`
    );

    console.log('COURSE RESPONSE:', data);

    if (!data?.success) {
      throw new Error(
        data?.message || 'Course not found'
      );
    }

    return {
      courseData: data.courseData,
      exam: data.exam || null,
    };
  } catch (error) {
    console.error('GET COURSE ERROR:', {
      courseId,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    throw error;
  }
};

// ===========================================================================
// USER / STUDENT API
// Authentication required
// ===========================================================================

// ---------------------------------------------------------------------------
// Get user data
// ---------------------------------------------------------------------------

export const getUserData = async () => {
  try {
    console.log('GETTING USER DATA');

    const { data } = await api.get(
      '/api/user/data'
    );

    console.log('USER DATA RESPONSE:', data);

    if (!data?.success) {
      throw new Error(
        data?.message || 'Failed to load user data'
      );
    }

    return data.user;
  } catch (error) {
    console.error('GET USER DATA ERROR:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    throw error;
  }
};

// ---------------------------------------------------------------------------
// Get enrolled courses
// ---------------------------------------------------------------------------

export const getEnrolledCourses = async () => {
  try {
    console.log('====================================');
    console.log('GETTING ENROLLED COURSES');
    console.log('====================================');

    const { data } = await api.get(
      '/api/user/data/enrolled-courses'
    );

    console.log(
      'ENROLLED COURSES RESPONSE:',
      data
    );

    if (!data?.success) {
      throw new Error(
        data?.message ||
          'Failed to load enrolled courses'
      );
    }

    const enrolledCourses =
      data.enrolledCourses || [];

    console.log(
      'ENROLLED COURSES:',
      enrolledCourses
    );

    console.log(
      'ENROLLED COURSES COUNT:',
      enrolledCourses.length
    );

    return enrolledCourses;
  } catch (error) {
    console.error(
      '===================================='
    );

    console.error(
      'ENROLLED COURSES ERROR'
    );

    console.error({
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    console.error(
      '===================================='
    );

    throw error;
  }
};

// ---------------------------------------------------------------------------
// Purchase / enroll in course
// ---------------------------------------------------------------------------

export const purchaseCourse = async (courseId) => {
  if (!courseId) {
    throw new Error('Course ID is required');
  }

  try {
    console.log(
      'PURCHASING / ENROLLING COURSE:',
      courseId
    );

    const { data } = await api.post(
      '/api/user/purchase',
      {
        courseId,
      }
    );

    console.log(
      'PURCHASE RESPONSE:',
      data
    );

    if (!data?.success && !data?.sessionUrl) {
      throw new Error(
        data?.message ||
          'Failed to enroll in course'
      );
    }

    return data.sessionUrl || null;
  } catch (error) {
    console.error('PURCHASE COURSE ERROR:', {
      courseId,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    throw error;
  }
};

// ---------------------------------------------------------------------------
// Get course progress
// ---------------------------------------------------------------------------

export const getCourseProgress = async (courseId) => {
  if (!courseId) {
    throw new Error(
      'Course ID is required to get progress'
    );
  }

  try {
    console.log('====================================');
    console.log(
      'GETTING COURSE PROGRESS:',
      courseId
    );
    console.log('====================================');

    const { data } = await api.get(
      `/api/user/course-progress/${courseId}`
    );

    console.log(
      'PROGRESS RESPONSE:',
      data
    );

    if (!data?.success) {
      throw new Error(
        data?.message ||
          'Failed to load progress'
      );
    }

    console.log(
      'PROGRESS DATA:',
      data.progressData
    );

    return data.progressData;
  } catch (error) {
    console.error(
      '===================================='
    );

    console.error(
      'COURSE PROGRESS ERROR'
    );

    console.error({
      courseId,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    console.error(
      '===================================='
    );

    throw error;
  }
};

// ---------------------------------------------------------------------------
// Update course progress
// ---------------------------------------------------------------------------

export const updateCourseProgress = async (
  courseId,
  lectureId
) => {
  if (!courseId) {
    throw new Error(
      'Course ID is required'
    );
  }

  if (!lectureId) {
    throw new Error(
      'Lecture ID is required'
    );
  }

  try {
    console.log(
      'UPDATING COURSE PROGRESS:',
      {
        courseId,
        lectureId,
      }
    );

    const { data } = await api.post(
      '/api/user/update-course-progress',
      {
        courseId,
        lectureId,
      }
    );

    console.log(
      'UPDATE PROGRESS RESPONSE:',
      data
    );

    if (!data?.success) {
      throw new Error(
        data?.message ||
          'Failed to update progress'
      );
    }

    return data;
  } catch (error) {
    console.error(
      'UPDATE COURSE PROGRESS ERROR:',
      {
        courseId,
        lectureId,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      }
    );

    throw error;
  }
};

// ---------------------------------------------------------------------------
// Rate course
// ---------------------------------------------------------------------------

export const rateCourse = async (
  courseId,
  rating
) => {
  if (!courseId) {
    throw new Error('Course ID is required');
  }

  try {
    const { data } = await api.post(
      '/api/user/add-user-rating',
      {
        courseId,
        rating,
      }
    );

    if (!data?.success) {
      throw new Error(
        data?.message ||
          'Failed to submit rating'
      );
    }

    return data;
  } catch (error) {
    console.error('RATE COURSE ERROR:', {
      courseId,
      rating,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    throw error;
  }
};

// ===========================================================================
// EXAM API
// Authentication required
// ===========================================================================

// ---------------------------------------------------------------------------
// Get exam by course
// ---------------------------------------------------------------------------

export const getExamByCourse = async (
  courseId
) => {
  if (!courseId) {
    throw new Error('Course ID is required');
  }

  const { data } = await api.get(
    `/api/exam/course/${courseId}`
  );

  if (!data?.success) {
    throw new Error(
      data?.message || 'No exam found'
    );
  }

  return data.exam;
};

// ---------------------------------------------------------------------------
// Get exam for student
// ---------------------------------------------------------------------------

export const getExamForStudent = async (
  examId
) => {
  const { data } = await api.get(
    `/api/exam/${examId}`
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to load exam'
    );
  }

  return data;
};

// ---------------------------------------------------------------------------
// Start exam
// ---------------------------------------------------------------------------

export const startExam = async (examId) => {
  const { data } = await api.post(
    `/api/exam/${examId}/start`,
    {}
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to start exam'
    );
  }

  return data.attempt;
};

// ---------------------------------------------------------------------------
// Submit exam
// ---------------------------------------------------------------------------

export const submitExam = async (
  examId,
  attemptId,
  answers
) => {
  const { data } = await api.post(
    `/api/exam/${examId}/submit`,
    {
      attemptId,
      answers,
    }
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to submit exam'
    );
  }

  return data;
};

// ---------------------------------------------------------------------------
// Get exam attempt result
// ---------------------------------------------------------------------------

export const getExamAttemptResult = async (
  attemptId
) => {
  const { data } = await api.get(
    `/api/exam/attempt/${attemptId}`
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to load result'
    );
  }

  return data.attempt;
};

// ---------------------------------------------------------------------------
// Get my exam attempts
// ---------------------------------------------------------------------------

export const getMyExamAttempts = async (
  examId
) => {
  const { data } = await api.get(
    `/api/exam/${examId}/attempts`
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to load attempts'
    );
  }

  return data.attempts || [];
};

// ===========================================================================
// CERTIFICATE API
// ===========================================================================

// ---------------------------------------------------------------------------
// Generate certificate
// ---------------------------------------------------------------------------

export const generateCertificate = async (
  courseId
) => {
  if (!courseId) {
    throw new Error('Course ID is required');
  }

  const { data } = await api.post(
    `/api/user/generate-certificate/${courseId}`,
    {}
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Certificate not available'
    );
  }

  return data.certificate;
};

// ---------------------------------------------------------------------------
// Get user certificates
// ---------------------------------------------------------------------------

export const getUserCertificates = async () => {
  const { data } = await api.get(
    '/api/user/certificates'
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to load certificates'
    );
  }

  return data.certificates || [];
};

// ---------------------------------------------------------------------------
// Get certificate for course
// ---------------------------------------------------------------------------

export const getCertificateForCourse = async (
  courseId
) => {
  if (!courseId) {
    return null;
  }

  const { data } = await api.get(
    `/api/user/certificate/course/${courseId}`
  );

  if (!data?.success) {
    return null;
  }

  return data.certificate || null;
};

// ---------------------------------------------------------------------------
// Get certificate by ID
// ---------------------------------------------------------------------------

export const getCertificateById = async (
  certificateId
) => {
  const { data } = await api.get(
    `/api/user/certificate/${certificateId}`
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Certificate not found'
    );
  }

  return data.certificate;
};

// ===========================================================================
// EDUCATOR API
// Authentication required
// ===========================================================================

// ---------------------------------------------------------------------------
// Update role to educator
// ---------------------------------------------------------------------------

export const updateRoleToEducator = async () => {
  const { data } = await api.post(
    '/api/educator/update-role',
    {}
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to update role'
    );
  }

  return data;
};

// ---------------------------------------------------------------------------
// Get educator courses
// ---------------------------------------------------------------------------

export const getEducatorCourses = async () => {
  const { data } = await api.get(
    '/api/educator/courses'
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to load courses'
    );
  }

  return data.courses || [];
};

// ---------------------------------------------------------------------------
// Get educator dashboard
// ---------------------------------------------------------------------------

export const getEducatorDashboardData =
  async () => {
    const { data } = await api.get(
      '/api/educator/dashboard'
    );

    if (!data?.success) {
      throw new Error(
        data?.message ||
          'Failed to load dashboard'
      );
    }

    return data.dashboardData || null;
  };

// ---------------------------------------------------------------------------
// Get enrolled students
// ---------------------------------------------------------------------------

export const getEnrolledStudentsData =
  async () => {
    const { data } = await api.get(
      '/api/educator/enrolled-students'
    );

    if (!data?.success) {
      throw new Error(
        data?.message ||
          'Failed to load students'
      );
    }

    return data.enrolledStudents || [];
  };

// ---------------------------------------------------------------------------
// Get educator exams
// ---------------------------------------------------------------------------

export const getEducatorExams = async () => {
  const { data } = await api.get(
    '/api/exam/educator'
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to load exams'
    );
  }

  return data.exams || [];
};

// ===========================================================================
// COURSE MANAGEMENT API
// Authentication required - educator
// ===========================================================================

/**
 * Create a new course.
 *
 * Backend expects multipart/form-data:
 *
 * courseData:
 * JSON string containing:
 * courseTitle
 * courseDescription
 * coursePrice
 * discount
 * courseContent
 *
 * courseThumbnail:
 * image file
 */

export const addCourse = async (
  courseData,
  thumbnailFile
) => {
  const form = new FormData();

  form.append(
    'courseData',
    JSON.stringify(courseData)
  );

  if (thumbnailFile) {
    const uri = thumbnailFile.uri;

    const name =
      thumbnailFile.name ||
      uri.split('/').pop() ||
      'thumbnail.jpg';

    const type =
      thumbnailFile.mimeType ||
      thumbnailFile.type ||
      'image/jpeg';

    form.append(
      'courseThumbnail',
      {
        uri,
        name,
        type,
      }
    );
  }

  const { data } = await api.post(
    '/api/educator/add-course',
    form,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to create course'
    );
  }

  return data;
};

// ===========================================================================
// EXAM MANAGEMENT API
// ===========================================================================

// ---------------------------------------------------------------------------
// Create exam
// ---------------------------------------------------------------------------

export const createExam = async (
  examData
) => {
  const { data } = await api.post(
    '/api/exam/create',
    examData
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to create exam'
    );
  }

  return data.exam;
};

// ---------------------------------------------------------------------------
// Add exam question
// ---------------------------------------------------------------------------

export const addExamQuestion = async (
  questionData
) => {
  const { data } = await api.post(
    '/api/exam/question',
    questionData
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to add question'
    );
  }

  return data.question;
};

// ---------------------------------------------------------------------------
// Get exam for educator
// ---------------------------------------------------------------------------

export const getExamForEducator = async (
  examId
) => {
  const { data } = await api.get(
    `/api/exam/educator/${examId}`
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to load exam'
    );
  }

  return {
    exam: data.exam,
    questions: data.questions || [],
  };
};

// ---------------------------------------------------------------------------
// Update exam question
// ---------------------------------------------------------------------------

export const updateExamQuestion = async (
  questionId,
  questionData
) => {
  const { data } = await api.put(
    `/api/exam/question/${questionId}`,
    questionData
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to update question'
    );
  }

  return data.question;
};

// ---------------------------------------------------------------------------
// Delete exam question
// ---------------------------------------------------------------------------

export const deleteExamQuestion = async (
  questionId
) => {
  const { data } = await api.delete(
    `/api/exam/question/${questionId}`
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to delete question'
    );
  }

  return data;
};

// ---------------------------------------------------------------------------
// Toggle exam publish
// ---------------------------------------------------------------------------

export const toggleExamPublish = async (
  examId
) => {
  const { data } = await api.patch(
    `/api/exam/${examId}/publish`
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Failed to update exam'
    );
  }

  return data;
};

// ===========================================================================
// CERTIFICATE VERIFICATION
// Public API
// ===========================================================================

export const verifyCertificate = async (
  certificateId
) => {
  const { data } = await api.get(
    `/api/user/verify-certificate/${certificateId}`
  );

  if (!data?.success) {
    throw new Error(
      data?.message ||
        'Certificate not valid'
    );
  }

  return data.certificate;
};

// ===========================================================================
// DEFAULT EXPORT
// ===========================================================================

export default api;