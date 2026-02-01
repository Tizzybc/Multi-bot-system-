import axios from ‘axios’;
import ytdl from ‘ytdl-core’;
import fs from ‘fs’;
import path from ‘path’;
import { promisify } from ‘util’;
import { exec } from ‘child_process’;

const execPromise = promisify(exec);

class MediaDownloader {
constructor() {
this.downloadPath = ‘./downloads’;
if (!fs.existsSync(this.downloadPath)) {
fs.mkdirSync(this.downloadPath, { recursive: true });
}
}

detectPlatform(url) {
if (url.includes(‘youtube.com’) || url.includes(‘youtu.be’)) return ‘youtube’;
if (url.includes(‘instagram.com’)) return ‘instagram’;
if (url.includes(‘tiktok.com’)) return ‘tiktok’;
if (url.includes(‘twitter.com’) || url.includes(‘x.com’)) return ‘twitter’;
if (url.includes(‘facebook.com’) || url.includes(‘fb.watch’)) return ‘facebook’;
return ‘unknown’;
}

async download(url) {
const platform = this.detectPlatform(url);

```
switch (platform) {
  case 'youtube':
    return await this.downloadYouTube(url);
  case 'instagram':
    return await this.downloadInstagram(url);
  case 'tiktok':
    return await this.downloadTikTok(url);
  case 'twitter':
    return await this.downloadTwitter(url);
  case 'facebook':
    return await this.downloadFacebook(url);
  default:
    return { success: false, error: 'Platform not supported' };
}
```

}

async downloadYouTube(url) {
try {
const info = await ytdl.getInfo(url);
const title = info.videoDetails.title.replace(/[^\w\s]/gi, ‘’);
const filename = `${Date.now()}_${title}.mp4`;
const filepath = path.join(this.downloadPath, filename);

```
  return new Promise((resolve, reject) => {
    ytdl(url, { quality: 'highest' })
      .pipe(fs.createWriteStream(filepath))
      .on('finish', () => {
        resolve({
          success: true,
          filepath,
          title: info.videoDetails.title,
          platform: 'YouTube'
        });
      })
      .on('error', (error) => {
        reject({ success: false, error: error.message });
      });
  });
} catch (error) {
  return { success: false, error: error.message };
}
```

}

async downloadInstagram(url) {
try {
// Using yt-dlp as a more reliable option
const filename = `${Date.now()}_instagram.mp4`;
const filepath = path.join(this.downloadPath, filename);

```
  await execPromise(`yt-dlp -o "${filepath}" "${url}"`);
  
  return {
    success: true,
    filepath,
    platform: 'Instagram'
  };
} catch (error) {
  // Fallback to API method
  try {
    const response = await axios.post('https://api.downloadgram.com/download', {
      url: url
    });
    
    if (response.data && response.data.download_url) {
      const filename = `${Date.now()}_instagram.mp4`;
      const filepath = path.join(this.downloadPath, filename);
      
      const writer = fs.createWriteStream(filepath);
      const videoResponse = await axios({
        url: response.data.download_url,
        method: 'GET',
        responseType: 'stream'
      });
      
      videoResponse.data.pipe(writer);
      
      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve({ success: true, filepath, platform: 'Instagram' }));
        writer.on('error', reject);
      });
    }
  } catch (apiError) {
    return { success: false, error: 'Failed to download from Instagram' };
  }
}
```

}

async downloadTikTok(url) {
try {
const filename = `${Date.now()}_tiktok.mp4`;
const filepath = path.join(this.downloadPath, filename);

```
  // Using yt-dlp for TikTok
  await execPromise(`yt-dlp -o "${filepath}" "${url}"`);
  
  return {
    success: true,
    filepath,
    platform: 'TikTok'
  };
} catch (error) {
  return { success: false, error: 'Failed to download from TikTok' };
}
```

}

async downloadTwitter(url) {
try {
const filename = `${Date.now()}_twitter.mp4`;
const filepath = path.join(this.downloadPath, filename);

```
  await execPromise(`yt-dlp -o "${filepath}" "${url}"`);
  
  return {
    success: true,
    filepath,
    platform: 'Twitter'
  };
} catch (error) {
  return { success: false, error: 'Failed to download from Twitter' };
}
```

}

async downloadFacebook(url) {
try {
const filename = `${Date.now()}_facebook.mp4`;
const filepath = path.join(this.downloadPath, filename);

```
  await execPromise(`yt-dlp -o "${filepath}" "${url}"`);
  
  return {
    success: true,
    filepath,
    platform: 'Facebook'
  };
} catch (error) {
  return { success: false, error: 'Failed to download from Facebook' };
}
```

}

cleanupFile(filepath) {
try {
if (fs.existsSync(filepath)) {
fs.unlinkSync(filepath);
}
} catch (error) {
console.error(‘Error cleaning up file:’, error);
}
}
}

export default MediaDownloader;
