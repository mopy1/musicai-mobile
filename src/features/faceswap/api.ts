import { File } from 'expo-file-system';

import { apiClient } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  FaceSwapCreateResponse,
  FaceSwapJob,
  FaceSwapTemplate,
  UrlResponse,
} from '@/types/api';

type ListResponse<T> = T[] | { results?: T[] };

function unwrapList<T>(data: ListResponse<T> | null | undefined): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export async function fetchFaceSwapTemplates(): Promise<FaceSwapTemplate[]> {
  const data = await apiClient.get<ListResponse<FaceSwapTemplate>>(
    ENDPOINTS.faceswap.templates,
  );
  return unwrapList(data);
}

export async function fetchFaceSwapJobs(): Promise<FaceSwapJob[]> {
  const data = await apiClient.get<ListResponse<FaceSwapJob>>(ENDPOINTS.faceswap.jobs);
  return unwrapList(data);
}

export async function fetchFaceSwapJob(id: string): Promise<FaceSwapJob> {
  return apiClient.get<FaceSwapJob>(ENDPOINTS.faceswap.jobDetail(id));
}

export async function getFaceSwapResultUrl(
  id: string,
  download = false,
): Promise<string> {
  const res = await apiClient.get<UrlResponse>(
    ENDPOINTS.faceswap.resultUrl(id, download),
  );
  return res.url;
}

export interface CreateFaceSwapPayload {
  photoUri: string;
  photoName?: string | null;
  photoMimeType?: string | null;
  templateId: string;
}

export async function createFaceSwapJob({
  photoUri,
  photoName,
  photoMimeType,
  templateId,
}: CreateFaceSwapPayload): Promise<FaceSwapCreateResponse> {
  const formData = new FormData();
  const photoFile = new File(photoUri);
  const safeName = photoName || photoFile.name || `selfie-${Date.now()}.jpg`;
  const safeType = photoMimeType || photoFile.type || 'image/jpeg';

  formData.append('photo', {
    name: safeName,
    type: safeType,
    bytes: () => photoFile.bytes(),
  } as unknown as Blob);
  formData.append('template_id', templateId);
  formData.append('consent', 'true');

  return apiClient.postForm<FaceSwapCreateResponse>(ENDPOINTS.faceswap.jobs, formData);
}

export async function deleteFaceSwapJob(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.faceswap.jobDetail(id));
}
