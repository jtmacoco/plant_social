import { Platform } from 'react-native';
import httpClient from './http/httpClient';
import { API_BASE_URL } from './config';

export interface PlantTip {
  id: string;
  score: number;
  title: string;
  text: string;
  category: string;
}

export interface UploadImageResponse {
  content_type: string;
  tips: PlantTip[];
}

export async function uploadImage(uri: string): Promise<UploadImageResponse> {
  const formData = new FormData();
  
  // Extract filename from URI or use a default
  const filename = uri.split('/').pop() || 'photo.jpg';
  
  if (Platform.OS === 'web') {
    // On web, fetch the blob from the URI and append it
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('file', blob, filename);
  } else {
    // On native (iOS/Android), use the {uri, type, name} format
    // @ts-ignore - FormData typing for React Native
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: filename,
    });
  }

  return httpClient.upload<UploadImageResponse>(`${API_BASE_URL}/images`, formData);
}
