import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { PreparedAIImage } from '@/types/aiHub';

export type AIImageKind = 'food' | 'physique';
export type AIImageSource = 'camera' | 'library';

const MAX_IMAGE_EDGE = 1280;

function pickerOptions(kind: AIImageKind): ImagePicker.ImagePickerOptions {
  return {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: kind === 'food' ? [1, 1] : [3, 4],
    quality: 0.5,
    base64: true,
    exif: false,
  };
}

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;
  const requested = await ImagePicker.requestCameraPermissionsAsync();
  return requested.granted;
}

async function optimizeAsset(asset: ImagePicker.ImagePickerAsset): Promise<PreparedAIImage> {
  const context = ImageManipulator.manipulate(asset.uri);
  const largestEdge = Math.max(asset.width, asset.height);

  if (largestEdge > MAX_IMAGE_EDGE) {
    if (asset.width >= asset.height) context.resize({ width: MAX_IMAGE_EDGE });
    else context.resize({ height: MAX_IMAGE_EDGE });
  }

  const rendered = await context.renderAsync();
  const optimized = await rendered.saveAsync({
    base64: true,
    compress: 0.5,
    format: SaveFormat.JPEG,
  });

  if (!optimized.base64) throw new Error('IMAGE_BASE64_MISSING');

  return {
    uri: optimized.uri,
    base64: optimized.base64,
    mimeType: 'image/jpeg',
    width: optimized.width,
    height: optimized.height,
  };
}

async function renderVariant(
  uri: string,
  width: number,
  height: number,
  maxEdge: number,
  compress: number,
): Promise<PreparedAIImage> {
  const context = ImageManipulator.manipulate(uri);
  const largestEdge = Math.max(width, height);

  if (largestEdge > maxEdge) {
    if (width >= height) context.resize({ width: maxEdge });
    else context.resize({ height: maxEdge });
  }

  const rendered = await context.renderAsync();
  const optimized = await rendered.saveAsync({
    base64: true,
    compress,
    format: SaveFormat.JPEG,
  });

  if (!optimized.base64) throw new Error('IMAGE_BASE64_MISSING');

  return {
    uri: optimized.uri,
    base64: optimized.base64,
    mimeType: 'image/jpeg',
    width: optimized.width,
    height: optimized.height,
  };
}

export async function buildAIImageVariants(image: PreparedAIImage): Promise<PreparedAIImage[]> {
  const variants = await Promise.all([
    renderVariant(image.uri, image.width, image.height, 1440, 0.7),
    renderVariant(image.uri, image.width, image.height, 1120, 0.55),
    renderVariant(image.uri, image.width, image.height, 960, 0.82),
  ]);

  const seen = new Set<string>();
  return variants.filter((variant) => {
    const key = `${variant.width}x${variant.height}-${variant.base64.length}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return variant.base64 !== image.base64;
  });
}

export async function pickAIImage(
  source: AIImageSource,
  kind: AIImageKind,
): Promise<PreparedAIImage | null> {
  if (source === 'camera' && !(await ensureCameraPermission())) {
    throw new Error('CAMERA_PERMISSION_DENIED');
  }

  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({ ...pickerOptions(kind), cameraType: ImagePicker.CameraType.back })
    : await ImagePicker.launchImageLibraryAsync(pickerOptions(kind));

  if (result.canceled || !result.assets[0]) return null;
  return optimizeAsset(result.assets[0]);
}
