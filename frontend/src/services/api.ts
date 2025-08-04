import axios from 'axios';
import { ParseRequest, ParseResponse, UploadResponse, ConstraintGenerationResponse } from '../types/api';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for large file processing
});

export const uploadPDF = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('pdf', file);

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to upload PDF',
      };
    }
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
};

export const parseMortgageRules = async (
  request: ParseRequest
): Promise<ParseResponse> => {
  try {
    const response = await api.post('/parse', request);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to parse mortgage rules',
      };
    }
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
};

export const downloadJSON = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadTypeScript = (code: string, filename: string) => {
  const blob = new Blob([code], {
    type: 'text/typescript',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateConstraintNodes = async (
  mortgageRules: any
): Promise<ConstraintGenerationResponse> => {
  try {
    const response = await api.post('/generate-constraints', {
      mortgageRules,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to generate constraint nodes',
      };
    }
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
};

export const downloadConstraintNodes = (nodes: any[], filename: string) => {
  const blob = new Blob([JSON.stringify(nodes, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 