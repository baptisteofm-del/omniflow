// SVG logos for platform badges
export const OnlyFansLogo = ({ size = 16 }: { size?: number }) => (
  <div 
    style={{ background: '#00AFF0', width: size, height: size }}
    className="rounded-full flex items-center justify-center flex-shrink-0"
  >
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="white">
      <path d="M24 4.003h-4.015c-3.45 0-5.3.197-6.748 1.957a7.996 7.996 0 1 0 2.103 9.211c3.182-.231 5.39-2.134 6.085-5.173 0 0-2.399.585-4.43 0 4.018-.777 6.333-3.037 7.005-5.995zM5.61 11.999A2.391 2.391 0 0 1 9.28 9.97a2.966 2.966 0 0 1 2.998-2.528h.008c-.92 1.778-1.407 3.352-1.998 5.263A2.392 2.392 0 0 1 5.61 12Zm2.386-7.996a7.996 7.996 0 1 0 7.996 7.996 7.996 7.996 0 0 0-7.996-7.996Zm0 10.394A2.399 2.399 0 1 1 10.395 12a2.396 2.396 0 0 1-2.399 2.398Z"/>
    </svg>
  </div>
)

export const MYMLogo = ({ size = 16 }: { size?: number }) => (
  <div 
    style={{ background: '#000', width: size, height: size }}
    className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
  >
    M
  </div>
)

export const InstagramLogo = ({ size = 16 }: { size?: number }) => (
  <div 
    style={{ 
      background: 'linear-gradient(45deg, #E1306C 0%, #F77737 100%)',
      width: size, 
      height: size 
    }}
    className="rounded-full flex items-center justify-center flex-shrink-0"
  >
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="white">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="white" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" fill="none" stroke="white" strokeWidth="2"/>
      <circle cx="18" cy="6" r="1" fill="white"/>
    </svg>
  </div>
)

export const TikTokLogo = ({ size = 16 }: { size?: number }) => (
  <div 
    style={{ background: '#000', width: size, height: size }}
    className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
  >
    T
  </div>
)

export const TelegramLogo = ({ size = 16 }: { size?: number }) => (
  <div 
    style={{ background: '#2AABEE', width: size, height: size }}
    className="rounded-full flex items-center justify-center flex-shrink-0"
  >
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-5.53 5.52c-.04.04-.09.07-.14.1l-.5 3.49c-.04.31-.43.46-.67.25l-2.08-1.83c-.14-.12-.23-.3-.23-.48V10.5c0-.41.34-.75.75-.75h6.7c.41 0 .75.34.75.75v1.04c0 .41-.34.75-.75.75H10l2.36-2.36c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0L9.29 11H8.5c-.41 0-.75.34-.75.75v1.04c0 .41.34.75.75.75h3.96l-2.36 2.36c-.2.2-.2.51 0 .71.1.1.23.15.36.15s.26-.05.36-.15l2.36-2.36v2.36c0 .41.34.75.75.75.41 0 .75-.34.75-.75v-3.49l.5-3.49c.04-.31.43-.46.67-.25l2.08 1.83c.14.12.23.3.23.48v1.04c0 .41-.34.75-.75.75h-2.36"/>
    </svg>
  </div>
)

export const TwitterLogo = ({ size = 16 }: { size?: number }) => (
  <div 
    style={{ background: '#000', width: size, height: size }}
    className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
  >
    X
  </div>
)

export const PlatformLogo = ({ 
  platform, 
  size = 16 
}: { 
  platform: 'onlyfans' | 'mym' | 'instagram' | 'tiktok' | 'telegram' | 'twitter'
  size?: number 
}) => {
  switch (platform) {
    case 'onlyfans':
      return <OnlyFansLogo size={size} />
    case 'mym':
      return <MYMLogo size={size} />
    case 'instagram':
      return <InstagramLogo size={size} />
    case 'tiktok':
      return <TikTokLogo size={size} />
    case 'telegram':
      return <TelegramLogo size={size} />
    case 'twitter':
      return <TwitterLogo size={size} />
    default:
      return null
  }
}
