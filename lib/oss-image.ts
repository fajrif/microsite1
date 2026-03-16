export function ossImage(url: string, opts?: { width?: number; quality?: number }): string {
  if (!url) return url
  // Only process Alibaba OSS URLs
  if (!url.includes('.aliyuncs.com') && !url.includes(process.env.NEXT_PUBLIC_OSS_CDN_DOMAIN || '__none__')) {
    return url
  }
  const params: string[] = []
  if (opts?.width) params.push(`resize,w_${opts.width}`)
  if (opts?.quality) params.push(`quality,q_${opts.quality}`)
  params.push('format,webp')
  return params.length > 0 ? `${url}?x-oss-process=image/${params.join('/')}` : url
}
