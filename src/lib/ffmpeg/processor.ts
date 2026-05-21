import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null
let ffmpegReady = false

async function toBlobURL(url: string, mimeType: string) {
  const response = await fetch(url)
  const blob = await response.blob()
  return URL.createObjectURL(new Blob([blob], { type: mimeType }))
}

async function initFFmpeg() {
  if (ffmpeg && ffmpegReady) {
    return ffmpeg
  }

  ffmpeg = new FFmpeg()

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message)
  })

  const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd'
  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })
    ffmpegReady = true
  } catch (error) {
    console.error('Failed to load FFmpeg:', error)
    throw error
  }

  return ffmpeg
}

export interface SpoofOptions {
  stripMetadata: boolean
  reEncode: boolean
  changeTimestamps: boolean
  cropPixels?: number // Crop a few pixels from edges
}

export async function processVideo(
  file: File,
  options: SpoofOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  try {
    const ff = await initFFmpeg()

    // Write input file to FFmpeg filesystem
    const inputName = 'input.mp4'
    const outputName = 'output.mp4'

    await ff.writeFile(inputName, await fetchFile(file))

    const command: string[] = ['-i', inputName]

    // Add filter complex for optional cropping
    if (options.cropPixels && options.cropPixels > 0) {
      const filterComplex = `crop=iw-${options.cropPixels * 2}:ih-${options.cropPixels * 2}:${options.cropPixels}:${options.cropPixels}`
      command.push('-vf', filterComplex)
    }

    // Re-encode video to change hash (use different codec settings)
    if (options.reEncode) {
      command.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '28')
    }

    // Strip all metadata
    if (options.stripMetadata) {
      command.push('-map_metadata', '-1', '-map_chapters', '-1')
    }

    // Force output format and codec
    command.push('-c:a', 'aac', '-b:a', '128k')
    command.push('-y', outputName)

    // Execute FFmpeg
    await ff.exec(command)

    // Read output file
    const data = (await ff.readFile(outputName)) as Uint8Array

    // Clean up filesystem
    ff.deleteFile(inputName)
    ff.deleteFile(outputName)

    // Create blob with new timestamps
    const blob = new Blob([Array.from(data)] as unknown as BlobPart[], { type: 'video/mp4' })

    // Change blob's lastModified to break hash matching
    if (options.changeTimestamps) {
      const newFile = new File([blob], file.name, {
        type: 'video/mp4',
        lastModified: Date.now(),
      })
      return newFile
    }

    return blob
  } catch (error) {
    console.error('Video processing error:', error)
    throw error
  }
}

export async function processImage(
  file: File,
  options: SpoofOptions,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  try {
    const ff = await initFFmpeg()

    const inputName = 'input.jpg'
    const outputName = 'output.jpg'

    await ff.writeFile(inputName, await fetchFile(file))

    const command: string[] = ['-i', inputName]

    // Crop if needed
    if (options.cropPixels && options.cropPixels > 0) {
      const filterComplex = `crop=iw-${options.cropPixels * 2}:ih-${options.cropPixels * 2}:${options.cropPixels}:${options.cropPixels}`
      command.push('-vf', filterComplex)
    }

    // Strip metadata
    if (options.stripMetadata) {
      command.push('-map_metadata', '-1')
    }

    // Re-encode for different hash
    if (options.reEncode) {
      command.push('-q:v', '90')
    }

    command.push('-y', outputName)

    await ff.exec(command)

    const data = (await ff.readFile(outputName)) as Uint8Array

    ff.deleteFile(inputName)
    ff.deleteFile(outputName)

    const blob = new Blob([Array.from(data)] as unknown as BlobPart[], { type: 'image/jpeg' })

    if (options.changeTimestamps) {
      const newFile = new File([blob], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })
      return newFile
    }

    return blob
  } catch (error) {
    console.error('Image processing error:', error)
    throw error
  }
}

export async function cropVideo(
  file: File,
  startTime: number,
  endTime: number
): Promise<Blob> {
  try {
    const ff = await initFFmpeg()

    const inputName = 'input.mp4'
    const outputName = 'output.mp4'

    await ff.writeFile(inputName, await fetchFile(file))

    const command: string[] = [
      '-i', inputName,
      '-ss', startTime.toString(),
      '-to', endTime.toString(),
      '-c', 'copy',
      '-y', outputName,
    ]

    await ff.exec(command)

    const data = (await ff.readFile(outputName)) as Uint8Array

    ff.deleteFile(inputName)
    ff.deleteFile(outputName)

    return new Blob([Array.from(data)] as unknown as BlobPart[], { type: 'video/mp4' })
  } catch (error) {
    console.error('Video crop error:', error)
    throw error
  }
}
