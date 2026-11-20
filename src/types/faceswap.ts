export interface FaceSwapTemplate {
  id: string;
  title: string;
  duration_seconds: number;
  has_reference: boolean;
  thumbnail_url: string;
  preview_url: string;
}

export type FaceSwapJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface FaceSwapJob {
  id: string;
  source_type: 'template' | 'upload';
  template: { id: string; title: string } | null;
  source_video_filename: string | null;
  source_duration_seconds: number | null;
  ref_time_s: number | null;
  target_face_x: number | null;
  target_face_y: number | null;
  model_used: string | null;
  remote_job_id: string | null;
  status: FaceSwapJobStatus;
  progress_pct: number;
  credits_used: number;
  error_message: string | null;
  has_result: boolean;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface FaceSwapCreateResponse {
  job_id: string;
  status: FaceSwapJobStatus;
}
