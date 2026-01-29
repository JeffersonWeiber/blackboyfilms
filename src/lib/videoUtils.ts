export type VideoType = "youtube" | "drive" | "unknown";

/**
 * Detect the video type from a URL
 */
export function detectVideoType(url: string): VideoType {
  if (!url) return "unknown";
  
  const lowerUrl = url.toLowerCase();
  
  // YouTube patterns
  if (
    lowerUrl.includes("youtube.com") ||
    lowerUrl.includes("youtu.be") ||
    lowerUrl.includes("youtube-nocookie.com")
  ) {
    return "youtube";
  }
  
  // Google Drive patterns
  if (lowerUrl.includes("drive.google.com")) {
    return "drive";
  }
  
  return "unknown";
}

/**
 * Extract video ID from URL based on type
 */
export function extractVideoId(url: string, type?: VideoType): string | null {
  if (!url) return null;
  
  const videoType = type || detectVideoType(url);
  
  if (videoType === "youtube") {
    // Handle youtube.com/watch?v=ID
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return watchMatch[1];
    
    // Handle youtu.be/ID
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return shortMatch[1];
    
    // Handle youtube.com/embed/ID
    const embedMatch = url.match(/embed\/([^?&]+)/);
    if (embedMatch) return embedMatch[1];
    
    // Handle youtube.com/v/ID
    const vMatch = url.match(/\/v\/([^?&]+)/);
    if (vMatch) return vMatch[1];
  }
  
  if (videoType === "drive") {
    // Handle drive.google.com/file/d/ID/view
    const driveMatch = url.match(/\/d\/([^/]+)/);
    if (driveMatch) return driveMatch[1];
    
    // Handle drive.google.com/open?id=ID
    const openMatch = url.match(/[?&]id=([^&]+)/);
    if (openMatch) return openMatch[1];
  }
  
  return null;
}

/**
 * Generate thumbnail URL for a video
 */
export function generateThumbnailUrl(url: string, type?: VideoType): string | null {
  if (!url) return null;
  
  const videoType = type || detectVideoType(url);
  const videoId = extractVideoId(url, videoType);
  
  if (!videoId) return null;
  
  if (videoType === "youtube") {
    // Try maxresdefault first, fallback to hqdefault
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  
  if (videoType === "drive") {
    // Google Drive thumbnail (may require public sharing)
    return `https://drive.google.com/thumbnail?id=${videoId}&sz=w1280`;
  }
  
  return null;
}

/**
 * Generate embed URL for a video with autoplay options
 */
export function generateEmbedUrl(
  url: string, 
  type?: VideoType, 
  options: { autoplay?: boolean; muted?: boolean; loop?: boolean } = {}
): string | null {
  if (!url) return null;
  
  const videoType = type || detectVideoType(url);
  const videoId = extractVideoId(url, videoType);
  
  if (!videoId) return null;
  
  const { autoplay = true, muted = true, loop = true } = options;
  
  if (videoType === "youtube") {
    const params = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      mute: muted ? "1" : "0",
      loop: loop ? "1" : "0",
      playlist: videoId, // Required for loop to work
      controls: "0",
      showinfo: "0",
      rel: "0",
      modestbranding: "1",
      playsinline: "1",
      disablekb: "1",
      fs: "0",
      iv_load_policy: "3",
      cc_load_policy: "0",
      vq: "hd1080", // Force HD quality
      hd: "1", // Enable HD mode
    });
    
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  }
  
  if (videoType === "drive") {
    // Drive has limited customization options
    return `https://drive.google.com/file/d/${videoId}/preview`;
  }
  
  return null;
}

/**
 * Validate if a URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  const type = detectVideoType(url);
  if (type === "unknown") return false;
  
  const videoId = extractVideoId(url, type);
  return !!videoId;
}

/**
 * Get a human-readable label for the video type
 */
export function getVideoTypeLabel(type: VideoType): string {
  switch (type) {
    case "youtube":
      return "YouTube";
    case "drive":
      return "Google Drive";
    default:
      return "Desconhecido";
  }
}
