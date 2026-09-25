import { FormEvent, useEffect, useMemo, useState, useRef } from 'react'
import confetti from 'canvas-confetti'
import { supabase, supabaseConfigured } from './supabase'

type Lang = 'en' | 'hi' | 'bn'

type EventItem = {
  date: string
  city: string
  title: string
  hiTitle: string
  details: string
  hiDetails: string
  bnTitle: string
  bnDetails: string
  calendar: string
  mapUrl?: string
  contact?: {
    name: string
    phone: string
  }
}

const events: EventItem[] = [
  {
    date: '20 Nov • 2:00 PM',
    city: 'Rishikesh',
    title: 'Haldi Ceremony',
    hiTitle: 'हल्दी उत्सव',
    details: 'Phoolchatti Resort • Dress Code: Shades of Sunshine & Haldi Yellow',
    hiDetails: 'फूलचट्टी रिज़ॉर्ट • परिधान: हल्दी पीला',
    bnTitle: 'গায়ে হলুদ',
    bnDetails: 'ফুলচট্টি রিসর্ট • পোশাক: রোদ্দুর ও হলুদ রঙের ছোঁয়া',
    calendar: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Poulami+%26+Sachin+-+Haldi+Ceremony&dates=20261120T083000Z/20261120T113000Z&details=Haldi+Ceremony+at+Phoolchatti+Resort&location=Phoolchatti+Resort+Rishikesh',
  },
  {
    date: '20 Nov • 7:00 PM',
    city: 'Rishikesh',
    title: 'Engagement, Sangeet & Cocktail',
    hiTitle: 'सगाई, संगीत एवं कॉकटेल',
    details: 'Riverside Lawns, Phoolchatti Resort • Dress Code: Royal Glamour / Indo-Western',
    hiDetails: 'रिवरसाइड लॉन, फूलचट्टी रिज़ॉर्ट • परिधान: रॉयल इंडो-वेस्टर्न',
    bnTitle: 'বাগদান, সঙ্গীত ও ককটেল',
    bnDetails: 'রিভারসাইড লন, ফুলচট্টি রিসর্ট • পোশাক: রয়্যাল ইন্দো-ওয়েস্টার্ন',
    calendar: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Poulami+%26+Sachin+-+Sangeet+%26+Cocktails&dates=20261120T133000Z/20261120T180000Z&details=Sangeet+and+Cocktails&location=Phoolchatti+Resort+Rishikesh',
  },
  {
    date: '21 Nov • 3:00 PM',
    city: 'Rishikesh',
    title: 'Sundowner Varmala',
    hiTitle: 'सूर्यास्त वरमाला उत्सव',
    details: 'Ganga Vista Deck • Dress Code: Pastel Festive Elegance',
    hiDetails: 'गंगा विस्टा डेक • परिधान: पेस्टल ट्रेडिशनल',
    bnTitle: 'সূর্যাস্তে মালাবদল',
    bnDetails: 'গঙ্গা ভিস্তা ডেক • পোশাক: প্যাস্টেল ট্র্যাডিশনাল',
    calendar: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Poulami+%26+Sachin+-+Varmala&dates=20261121T093000Z/20261121T123000Z&details=Sundowner+Varmala&location=Phoolchatti+Resort+Rishikesh',
  },
  {
    date: '21 Nov • 7:00 PM',
    city: 'Rishikesh',
    title: 'Mandap, Saat Phere & Gala Dinner',
    hiTitle: 'शुभ सात फेरे एवं प्रीतिभोज',
    details: 'Main Mandap, Phoolchatti Resort • Auspicious Godhuli Lagna Muhurat',
    hiDetails: 'मुख्य मंडप, फूलचट्टी रिज़ॉर्ट • शुभ गोधूलि वेला मुहूर्त',
    bnTitle: 'শুভ সাত পাক ও প্রীতিভোজ',
    bnDetails: 'প্রধান মণ্ডপ, ফুলচট্টি রিসর্ট • শুভ গোধূলি লগ্ন',
    calendar: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Poulami+%26+Sachin+-+Saat+Phere&dates=20261121T133000Z/20261121T183000Z&details=Saat+Phere+and+Gala+Dinner&location=Phoolchatti+Resort+Rishikesh',
  },
]

const trivia = [
  { q: 'Who confessed their feelings first?', options: ['Sachin', 'Poulami', 'It was completely mutual!'], ans: 0 },
  { q: 'What is their favorite midnight food craving?', options: ['Maggi & Chai', 'Rishikesh Street Momos', 'Late-night Ice Cream'], ans: 0 },
  { q: 'Who takes longer to get ready for an event?', options: ['Sachin without a doubt', 'Poulami', 'Both take equal time!'], ans: 1 },
  { q: 'What is their favorite weekend getaway vibe?', options: ['Serene Mountain Views', 'Quiet Beachside Walk', 'Exploring New Cafes'], ans: 0 },
  { q: 'Their ultimate comfort food together is:', options: ['Ghar ki Dal Khichdi', 'Woodfired Pizza', 'Puchka / Golgappe'], ans: 2 },
]

const languageNames: Record<Lang, string> = { en: 'English', hi: 'हिन्दी', bn: 'বাংলা' }

const translations = {
  en: {
    invocation: '॥ SHRI GANESHAYA NAMAHA ॥',
    married: 'Are Getting Married',
    elders: 'With the heavenly blessings of our elders',
    groom: "Groom's Parents",
    bride: "Bride's Parents",
    invite: 'Cordially invite you to celebrate this auspicious union.',
    countdown: 'Auspicious Muhurat Countdown',
    festivities: 'Wedding Festivities',
    sacred: 'Sacred Ceremonies',
    rsvp: 'RSVP',
  },
  hi: {
    invocation: '॥ श्री गणेशाय नमः ॥',
    married: 'परिणय सूत्र में बंधने जा रहे हैं',
    elders: 'परम पूज्य पूर्वजों एवं बड़ों के शुभाशीर्वाद से',
    groom: 'वर पक्ष',
    bride: 'वधू पक्ष',
    invite: 'आपको इस पावन विवाह उत्सव में सप्रेम आमंत्रित करते हैं।',
    countdown: 'शुभ मुहूर्त की उलटी गिनती',
    festivities: 'विवाह उत्सव क्रम',
    sacred: 'मांगलिक कार्यक्रम',
    rsvp: 'उपस्थिति',
  },
  bn: {
    invocation: '॥ শ্রী গণেশায় নমঃ ॥',
    married: 'শুভ পরিণয়ে আবদ্ধ হতে চলেছেন',
    elders: 'পূজনীয় গুরুজনদের আশীর্বাদে',
    groom: 'বরপক্ষ',
    bride: 'কন্যাপক্ষ',
    invite: 'এই শুভ বিবাহ অনুষ্ঠানে আপনাকে সাদর আমন্ত্রণ জানাই।',
    countdown: 'শুভ লগ্নের ক্ষণগণনা',
    festivities: 'বিবাহ উৎসবের অনুষ্ঠানসূচি',
    sacred: 'মাঙ্গলিক অনুষ্ঠান',
    rsvp: 'উপস্থিতি',
  },
}

function App() {
  const defaultYoutubeVideoId = 'MbLpZXIZZOg'
  const defaultMusicSource = '/music/default-song.m4a'
  const defaultAudioRef = useRef<HTMLAudioElement | null>(null)
  const youtubeFrameRef = useRef<HTMLIFrameElement | null>(null)
  const [lang, setLang] = useState<Lang>('en')
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const langMenuRef = useRef<HTMLDivElement | null>(null)
  const [playing, setPlaying] = useState(true)
  const [showEntryGate, setShowEntryGate] = useState(true)
  const [youtubeVideoId, setYoutubeVideoId] = useState(defaultYoutubeVideoId)
  const [isDefaultYoutubeSong, setIsDefaultYoutubeSong] = useState(true)
  const [youtubePlayerOpen, setYoutubePlayerOpen] = useState(true)
  const [youtubePlayerMinimized, setYoutubePlayerMinimized] = useState(false)
  const [youtubeError, setYoutubeError] = useState('')
  const [youtubeSearch, setYoutubeSearch] = useState('')
  const [youtubeSearching, setYoutubeSearching] = useState(false)

  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [songs, setSongs] = useState([
    { name: 'Gallan Goodiyaan (Dil Dhadakne Do)', votes: 18 },
    { name: 'London Thumakda (Queen)', votes: 14 },
  ])
  const [song, setSong] = useState('')
  const [question, setQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([])
  const [quizDone, setQuizDone] = useState(false)
  const [quizMessage, setQuizMessage] = useState('')
  const [rsvpMessage, setRsvpMessage] = useState('')
  type SharedPhoto = {
    id: string
    public_url: string
    storage_path: string
    uploaded_by: string
    created_at: string
  }


  const [sharedPhotos, setSharedPhotos] = useState<SharedPhoto[]>([])
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoMessage, setPhotoMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const t = translations[lang]

  useEffect(() => {
    const target = new Date('2026-11-20T14:00:00+05:30').getTime()
    const update = () => {
      const diff = Math.max(0, target - Date.now())
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      })
    }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [])

  // Browsers block sound until the guest interacts with the page, so this
  // tries to autoplay first and keeps the "Open Invitation" screen up if blocked.
  useEffect(() => {
    const audio = defaultAudioRef.current
    if (!audio) return
    if (isDefaultYoutubeSong && playing) {
      audio.volume = 1
      audio.play()
        .then(() => setShowEntryGate(false))
        .catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }, [isDefaultYoutubeSong, playing])

  // Pause the music while the guest is on another tab or app, and resume it
  // when they come back (only if it was playing before they left).
  useEffect(() => {
    const sendYoutubeCommand = (func: 'pauseVideo' | 'playVideo') => {
      youtubeFrameRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func, args: [] }),
        'https://www.youtube.com',
      )
    }

    const handleVisibilityChange = () => {
      if (!playing) return
      const audio = defaultAudioRef.current
      if (document.hidden) {
        if (isDefaultYoutubeSong) audio?.pause()
        else sendYoutubeCommand('pauseVideo')
      } else {
        if (isDefaultYoutubeSong) audio?.play().catch(() => setPlaying(false))
        else sendYoutubeCommand('playVideo')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isDefaultYoutubeSong, playing])

  const openInvitation = () => {
    const audio = defaultAudioRef.current
    // play() must run directly inside the tap handler for the browser to allow sound.
    audio?.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
    setShowEntryGate(false)
  }

  useEffect(() => {
    const canvas = document.getElementById('petal-canvas') as HTMLCanvasElement | null
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    type Petal = { x: number; y: number; size: number; speedY: number; speedX: number; color: string; opacity: number }
    let petals: Petal[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    const makePetal = (): Petal => ({
      x: Math.random() * canvas.width,
      y: -20,
      size: Math.random() * 6 + 5,
      speedY: Math.random() * 1.2 + 0.8,
      speedX: Math.random() - 0.5,
      color: Math.random() > 0.5 ? '#E89020' : '#C41E3A',
      opacity: Math.random() * 0.6 + 0.3,
    })
    const resetPetal = (p: Petal) => {
      p.x = Math.random() * canvas.width
      p.y = -20
      p.size = Math.random() * 6 + 5
      p.speedY = Math.random() * 1.2 + 0.8
      p.speedX = Math.random() - 0.5
      p.opacity = Math.random() * 0.6 + 0.3
    }

    resize()
    petals = Array.from({ length: 28 }, makePetal)
    window.addEventListener('resize', resize)
    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      petals.forEach((p) => {
        p.y += p.speedY
        p.x += p.speedX
        if (p.y > canvas.height + 20) resetPetal(p)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      })
      frame = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Pick the text for the current language: English, Hindi or Bengali.
  const tr = (en: string, hi: string, bn: string) => (lang === 'hi' ? hi : lang === 'bn' ? bn : en)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  // Close the language menu when tapping anywhere outside it.
  useEffect(() => {
    if (!langMenuOpen) return
    const closeOnOutsideTap = (event: PointerEvent) => {
      if (!langMenuRef.current?.contains(event.target as Node)) setLangMenuOpen(false)
    }
    document.addEventListener('pointerdown', closeOnOutsideTap)
    return () => document.removeEventListener('pointerdown', closeOnOutsideTap)
  }, [langMenuOpen])

  const compressImageForUpload = async (file: File, maxWidth = 1600, targetQuality = 0.75): Promise<File> => {
    if (!file.type.startsWith('image/')) return file

    const objectUrl = URL.createObjectURL(file)

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Image could not be processed.'))
        img.src = objectUrl
      })

      const scale = Math.min(1, maxWidth / Math.max(image.width, image.height))
      const width = Math.max(1, Math.round(image.width * scale))
      const height = Math.max(1, Math.round(image.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const context = canvas.getContext('2d')
      if (!context) return file

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, width, height)
      context.drawImage(image, 0, 0, width, height)

      const mimeType = file.type === 'image/png' ? 'image/jpeg' : file.type
      const outputName = file.name.replace(/\.[^/.]+$/, '') + '.jpg'

      let quality = targetQuality
      let blob: Blob | null = null

      while (quality >= 0.45) {
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((result) => resolve(result), mimeType, quality)
        })

        if (!blob) return file

        if (blob.size <= 3 * 1024 * 1024 || quality <= 0.45) break
        quality -= 0.1
      }

      const compressedFile = new File([blob as Blob], outputName, {
        type: mimeType,
        lastModified: Date.now(),
      })

      return compressedFile
    } catch (error) {
      console.error('Photo compression failed:', error)
      return file
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  }

  const searchYoutube = async (event: FormEvent) => {
    event.preventDefault()
    const query = youtubeSearch.trim()
    if (!query) return

    if (!supabase) {
      setYoutubeError('Supabase is not configured for song search.')
      return
    }

    setYoutubeSearching(true)
    setYoutubeError('')

    try {
      const { data, error } = await supabase.functions.invoke('youtube-search', {
        body: { query },
      })

      if (error) {
        let message = error.message
        const context = 'context' in error ? error.context : undefined

        if (context instanceof Response) {
          try {
            const errorBody = await context.clone().json()
            message = errorBody.error || message
          } catch {
            // Keep the SDK error when the response is not JSON.
          }
        }

        throw new Error(message)
      }

      const videoId = data?.videoId
      if (!videoId) throw new Error(data?.error || 'No playable YouTube song was found for that name.')

      defaultAudioRef.current?.pause()
      setYoutubeVideoId(videoId)
      setIsDefaultYoutubeSong(false)
      setYoutubePlayerOpen(true)
      setYoutubePlayerMinimized(false)
      setPlaying(true)
    } catch (error) {
      console.error('YouTube search failed:', error)
      const message = error instanceof Error ? error.message : 'YouTube search failed.'
      setYoutubeError(message)
      setPlaying(false)
    } finally {
      setYoutubeSearching(false)
    }
  }

  const toggleMusic = () => {
    if (!youtubeVideoId) {
      setYoutubeError('Search for a song first.')
      return
    }

    setPlaying((value) => !value)
  }

  const addSong = (e: FormEvent) => {
    e.preventDefault()
    const value = song.trim()
    if (!value) return
    setSongs((current) => [{ name: value, votes: 1 }, ...current])
    setSong('')
  }

  const upvote = (index: number) => {
    setSongs((current) => current.map((item, i) => i === index ? { ...item, votes: item.votes + 1 } : item))
  }

  const saveQuizResponse = async (answers: number[], finalScore: number) => {
    if (!supabase || !currentUserId) {
      setQuizMessage('Quiz completed on this device. Connect Supabase to save the response.')
      return
    }

    const responseAnswers = answers.map((answer, index) => ({
      question: trivia[index].q,
      answer: trivia[index].options[answer],
      correct: answer === trivia[index].ans,
    }))

    const { error } = await supabase
      .from('quiz_responses')
      .insert({
        guest_id: currentUserId,
        answers: responseAnswers,
        score: finalScore,
      })

    if (error) {
      console.error('Quiz response could not be saved:', error)
      setQuizMessage(`Quiz response could not be saved: ${error.message}`)
      return
    }

    setQuizMessage('Your quiz response has been saved.')
  }

  const answerQuiz = async (choice: number) => {
    const nextAnswers = [...quizAnswers, choice]
    const nextScore = score + (choice === trivia[question].ans ? 20 : 0)
    setQuizAnswers(nextAnswers)

    if (question + 1 >= trivia.length) {
      setScore(nextScore)
      setQuizDone(true)
      await saveQuizResponse(nextAnswers, nextScore)
      confetti({ particleCount: 90, spread: 65, origin: { y: 0.7 } })
    } else {
      setScore(nextScore)
      setQuestion((value) => value + 1)
    }
  }

  const loadSharedPhotos = async (client = supabase) => {
    if (!client) return

    const { data, error } = await client
      .from('wedding_photos')
      .select('id, public_url, storage_path, uploaded_by, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Could not load shared wedding photos:', error)
      setPhotoMessage(`Gallery error: ${error.message}`)
      return
    }

    setSharedPhotos((data ?? []) as SharedPhoto[])
  }

  useEffect(() => {
    if (!supabase) {
      setPhotoMessage('Add Supabase settings to enable shared photos.')
      return
    }

    const client = supabase
    let mounted = true
    let channel: ReturnType<typeof client.channel> | null = null

    const initialiseSharedPhotos = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await client.auth.getSession()

        if (sessionError) throw sessionError

        let userId = session?.user?.id

        if (!userId) {
          const { data, error } = await client.auth.signInAnonymously()
          if (error) throw error
          const anonymousUserId = data.user?.id ?? null
          if (anonymousUserId) {
            userId = anonymousUserId
          }
        }

        if (!userId) {
          throw new Error('No guest session was created.')
        }

        if (!mounted) return

        setCurrentUserId(userId)
        await loadSharedPhotos(client)

        if (!mounted) return

        channel = client
          .channel(`wedding-photos-live-${userId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'wedding_photos' },
            () => void loadSharedPhotos(client)
          )
          .subscribe()

        setPhotoMessage('Shared gallery is ready. Add a photo anytime.')
      } catch (error) {
        console.error('Shared gallery initialization failed:', error)
        const message = error instanceof Error ? error.message : 'Unknown Supabase error.'
        setPhotoMessage(
          `Photo sharing is not ready: ${message} Enable Anonymous Sign-Ins and run supabase/schema.sql if needed.`
        )
      }
    }

    void initialiseSharedPhotos()

    return () => {
      mounted = false
      if (channel) void client.removeChannel(channel)
    }
  }, [])

  const submitPhoto = async (file?: File) => {
    if (!file) return

    if (!supabase || !currentUserId) {
      setPhotoMessage('Photo sharing is still connecting. Please try again in a moment.')
      return
    }

    if (!file.type.startsWith('image/')) {
      setPhotoMessage('Please select an image file.')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setPhotoMessage('Please choose an image smaller than 10 MB.')
      return
    }

    setPhotoUploading(true)
    setPhotoMessage('Optimizing your photo...')

    try {
      const optimizedFile = await compressImageForUpload(file)
      const extension = optimizedFile.name.split('.').pop()?.toLowerCase() || 'jpg'
      const photoId = crypto.randomUUID()
      const storagePath = `${currentUserId}/${photoId}.${extension}`

      setPhotoMessage('Uploading your memory...')

      const { error: uploadError } = await supabase.storage
        .from('wedding-photos')
        .upload(storagePath, optimizedFile, {
          cacheControl: '3600',
          contentType: optimizedFile.type,
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('wedding-photos')
        .getPublicUrl(storagePath)

      const { error: insertError } = await supabase
        .from('wedding_photos')
        .insert({
          id: photoId,
          storage_path: storagePath,
          public_url: publicUrlData.publicUrl,
          uploaded_by: currentUserId,
        })

      if (insertError) {
        await supabase.storage.from('wedding-photos').remove([storagePath])
        throw insertError
      }

      await loadSharedPhotos(supabase)
      setPhotoMessage('Your photo is now shared with the wedding guests.')
      confetti({ particleCount: 50, spread: 45 })
    } catch (error) {
      console.error('Photo upload failed:', error)
      const message = error instanceof Error ? error.message : 'Unknown Supabase error.'
      setPhotoMessage(`Photo upload failed: ${message}`)
    } finally {
      setPhotoUploading(false)
    }
  }

  const deleteSharedPhoto = async (photo: SharedPhoto) => {
    if (!supabase || photo.uploaded_by !== currentUserId) return

    const confirmed = window.confirm('Delete this photo from the shared wedding gallery?')
    if (!confirmed) return

    setPhotoMessage('Deleting photo...')

    try {
      const { error: rowError } = await supabase
        .from('wedding_photos')
        .delete()
        .eq('id', photo.id)

      if (rowError) throw rowError

      const { error: storageError } = await supabase.storage
        .from('wedding-photos')
        .remove([photo.storage_path])

      if (storageError) {
        console.warn('Database row deleted, but storage cleanup failed:', storageError)
      }

      setSharedPhotos((current) => current.filter((item) => item.id !== photo.id))
      setPhotoMessage('Photo deleted.')
    } catch (error) {
      console.error('Photo deletion failed:', error)
      const message = error instanceof Error ? error.message : 'Unknown Supabase error.'
      setPhotoMessage(`Could not delete this photo: ${message}`)
    }
  }

  const downloadSharedPhoto = async (photo: SharedPhoto) => {
    try {
      const response = await fetch(photo.public_url)
      if (!response.ok) throw new Error('Image download failed.')

      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `wedding-memory-${photo.id}.jpg`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Photo download failed:', error)
      setPhotoMessage('Could not download this photo. Please try again.')
    }
  }

  const submitRsvp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const fullName = String(formData.get('fullName') || '').trim()
    const phone = String(formData.get('phone') || '').trim()
    const affiliation = String(formData.get('affiliation') || '').trim()
    const dietaryPreference = String(formData.get('dietaryPreference') || '').trim()
    const blessings = String(formData.get('blessings') || '').trim()

    setRsvpMessage('Sending your RSVP...')

    if (supabase && currentUserId) {
      const { error } = await supabase.from('rsvp_responses').insert({
        guest_id: currentUserId,
        full_name: fullName,
        phone,
        affiliation,
        dietary_preference: dietaryPreference || null,
        blessings: blessings || null,
      })

      if (error) {
        console.error('RSVP could not be saved:', error)
        setRsvpMessage(`RSVP could not be saved: ${error.message}`)
        return
      }
    }

    const whatsappMessage = [
      'Wedding RSVP - Poulami & Sachin',
      `Name: ${fullName}`,
      `Phone: ${phone}`,
      `Affiliation: ${affiliation}`,
      `Food preference: ${dietaryPreference || 'Not specified'}`,
      `Blessings: ${blessings || 'None'}`,
    ].join('\n')

    window.open(`https://wa.me/917017030967?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer')
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
    setRsvpMessage('RSVP saved. WhatsApp is ready with your details.')
    form.reset()
  }

  const labels = useMemo(() => ({
    days: tr('Days', 'दिन', 'দিন'),
    hours: tr('Hours', 'घंटे', 'ঘণ্টা'),
    mins: tr('Mins', 'मिनट', 'মিনিট'),
    secs: tr('Secs', 'सेकंड', 'সেকেন্ড'),
  }), [lang])

  return (
    <div className="app">
      <audio
        ref={defaultAudioRef}
        src={defaultMusicSource}
        loop
        preload="auto"
        playsInline
      />

      <canvas id="petal-canvas" />

      <header className="sticky-header">
        <div className="container nav">
          <div className="brand">
            <span className="gold-text">P & S</span>
            <span className="divider">|</span>
            <span className="nav-subtitle">{tr('Vivah Nimantran', 'शुभ विवाह निमंत्रण', 'শুভ বিবাহের নিমন্ত্রণ')}</span>
          </div>
          <div className="nav-actions">
            <form className="youtube-search-form" onSubmit={searchYoutube}>
              <input
                value={youtubeSearch}
                onChange={(e) => setYoutubeSearch(e.target.value)}
                placeholder="Song name"
                aria-label="Search YouTube by song name"
              />
              <button type="submit" className="pill outline" disabled={youtubeSearching} aria-label="Search and play song">
                <i className={`fas ${youtubeSearching ? 'fa-spinner fa-spin' : 'fa-magnifying-glass'}`} />
                <span>{youtubeSearching ? 'Searching...' : 'Click to play Song'}</span>
              </button>
            </form>
            <button
              type="button"
              className="pill outline"
              onClick={toggleMusic}
            >
              <i className={`fas ${playing ? 'fa-pause' : 'fa-play'}`} />
              <span>{isDefaultYoutubeSong
                ? playing ? 'Pause Ullam Padum' : '🔊 Play Ullam Padum'
                : playing ? 'Pause Song' : 'Play Song'}</span>
            </button>

            <div className="lang-select" ref={langMenuRef}>
              <button
                type="button"
                className="pill gold-btn lang-select-button"
                onClick={() => setLangMenuOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={langMenuOpen}
                aria-label="Choose language"
              >
                <i className="fas fa-language" />
                <span className="lang-select-current">{languageNames[lang]}</span>
                <i className="fas fa-chevron-down lang-select-chevron" />
              </button>
              {langMenuOpen && (
                <ul className="lang-select-menu" role="listbox" aria-label="Languages">
                  {(Object.keys(languageNames) as Lang[]).map((code) => (
                    <li key={code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={lang === code}
                        className={lang === code ? 'active' : ''}
                        onClick={() => {
                          setLang(code)
                          setLangMenuOpen(false)
                        }}
                      >
                        {languageNames[code]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {youtubeError && <span className="audio-error">{youtubeError}</span>}

            <a href="#rsvp" className="rsvp-link">{t.rsvp}</a>
          </div>
        </div>
      </header>

      {showEntryGate && (
        <div className="entry-gate" role="dialog" aria-label="Open wedding invitation">
          <div className="entry-gate-card">
            <div className="om">ॐ</div>
            <p className="gold-kicker">{tr('You are cordially invited', 'आप सादर आमंत्रित हैं', 'আপনাকে সাদর আমন্ত্রণ')}</p>
            <h1 className="display gold-gradient-text">Poulami & Sachin</h1>
            <button type="button" className="pill gold-btn entry-gate-button" onClick={openInvitation}>
              <i className="fas fa-envelope-open-text" />
              <span>{tr('Open Invitation', 'निमंत्रण खोलें', 'নিমন্ত্রণপত্র খুলুন')}</span>
            </button>
            <p className="entry-gate-hint"><i className="fas fa-music" /> {tr('Best with sound on', 'ध्वनि चालू रखें', 'সাউন্ড চালু রাখুন')}</p>
          </div>
        </div>
      )}

      {youtubeVideoId && youtubePlayerOpen && !isDefaultYoutubeSong && (
        <div
          className={`youtube-player ${youtubePlayerMinimized ? 'youtube-player-minimized' : ''}`}
          aria-label="YouTube music player"
        >
          {!isDefaultYoutubeSong && (
            <div className="youtube-player-controls">
              <span>{playing ? 'Playing song' : 'Song paused'}</span>
              <button
                type="button"
                onClick={() => setYoutubePlayerMinimized((value) => !value)}
                aria-label="Minimize YouTube player"
                title="Minimize"
              >
                <i className={`fas ${youtubePlayerMinimized ? 'fa-expand' : 'fa-minus'}`} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying(false)
                  setYoutubePlayerOpen(false)
                  setIsDefaultYoutubeSong(true)
                  setYoutubeVideoId(defaultYoutubeVideoId)
                }}
                aria-label="Close YouTube player"
                title="Close"
              >
                <i className="fas fa-times" />
              </button>
            </div>
          )}
          <iframe
            ref={youtubeFrameRef}
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=${playing ? 1 : 0}&rel=0&playsinline=1&enablejsapi=1`}
            title="YouTube wedding song"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <main>
        <section className="hero">
          <div className="hero-inner container">
            <div className="hero-gallery" aria-label="Poulami and Sachin wedding photos">
              <img src="/images/taj-couple-5.jpg" alt="Poulami and Sachin together at the Taj Mahal" />
            </div>

            <div className="invocation">
              <div className="om">ॐ</div>
              <p className="gold-kicker">{t.invocation}</p>
              <p className="mantra">"वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"</p>
            </div>

            <div className="couple">
              <h1 className="display gold-gradient-text">Poulami & Sachin</h1>
              <p className="eyebrow">{t.married}</p>
            </div>

            <div className="lineage card">
              <p className="gold-kicker">{t.elders}</p>
              <div className="parents">

                <div className="parent">
                  <span>{t.bride}</span>
                  <strong>Smt. Gouri Manna</strong>
                  <strong>Dr. Prabir Kumar Manna</strong>
                </div>
                <div className="parent">
                  <span>{t.groom}</span>
                  <strong>Smt. Meena Saraswat</strong>
                  <strong>Shri Anil Saraswat</strong>
                </div>
              </div>
              <p className="invite">{t.invite}</p>
            </div>

            <div className="countdown-wrap">
              <p className="gold-kicker">{t.countdown}</p>
              <div className="countdown">
                {[
                  [countdown.d, labels.days],
                  [countdown.h, labels.hours],
                  [countdown.m, labels.mins],
                  [countdown.s, labels.secs],
                ].map(([value, label]) => (
                  <div className="count-box" key={label as string}>
                    <strong>{String(value).padStart(2, '0')}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="venue-line animated-address">
              <i className="fas fa-map-marker-alt" />
              <span>Phoolchatti Resort, Rattapani, Rishikesh, Uttarakhand</span>
            </div>
          </div>
        </section>

        <section className="memory-strip memory-strip-left">
          <div className="container memory-strip-inner">
            <img src="/images/taj-couple-1.jpeg" alt="Poulami and Sachin at the Taj Mahal" loading="lazy" />
            <div>
              <span className="gold-kicker">Together, Always</span>
              <p>{tr('A little glimpse of the journey that brought two hearts together.', 'दो दिलों को साथ लाने वाली खूबसूरत यात्रा की एक झलक।', 'দুটি হৃদয়কে কাছে আনা সুন্দর যাত্রার এক ঝলক।')}</p>
            </div>
          </div>
        </section>

        <section className="section container" id="events">
          <div className="section-heading">
            <span className="gold-kicker">{t.sacred}</span>
            <h2 className="gold-gradient-text">{t.festivities}</h2>
            <div className="gold-rule" />
          </div>
          <div className="event-list">
            {events.map((event) => (
              <article className="event-card card" key={event.title}>
                <div>
                  <div className="event-meta">
                    <span className="date-badge">{event.date}</span>
                    <span>{event.city}</span>
                  </div>
                  <h3>{tr(event.title, event.hiTitle, event.bnTitle)}</h3>
                  <p className="animated-address">{tr(event.details, event.hiDetails, event.bnDetails)}</p>
                  {event.contact && (
                    <div className="event-contact-actions">
                      <strong>{event.contact.name}</strong>
                      <a href={`tel:+91${event.contact.phone}`} aria-label={`Call ${event.contact.name}`}>
                        <i className="fas fa-phone" /> Call
                      </a>
                      <a
                        href={`https://wa.me/91${event.contact.phone}?text=${encodeURIComponent(`Hello ${event.contact.name}, this is regarding the wedding reception.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`WhatsApp ${event.contact.name}`}
                      >
                        <i className="fab fa-whatsapp" /> WhatsApp
                      </a>
                    </div>
                  )}
                </div>
                <div className="event-actions">
                  <a className="calendar-btn" href={event.calendar} target="_blank" rel="noreferrer">
                    <i className="far fa-calendar-plus" />
                    <span>{tr('Add to Calendar', 'कैलेंडर में जोड़ें', 'ক্যালেন্ডারে যোগ করুন')}</span>
                  </a>
                  {event.mapUrl && (
                    <a className="calendar-btn directions-btn" href={event.mapUrl} target="_blank" rel="noreferrer">
                      <i className="fas fa-directions" />
                      <span>{tr('Get Directions', 'दिशा देखें', 'পথনির্দেশ দেখুন')}</span>
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="memory-strip memory-strip-right">
          <div className="container memory-strip-inner">
            <img src="/images/taj-couple-2.jpeg" alt="Poulami and Sachin together at the Taj Mahal" loading="lazy" />
            <div>
              <span className="gold-kicker">Moments Worth Remembering</span>
              <p>{tr('From everyday smiles to unforgettable celebrations.', 'रोज़मर्रा की मुस्कानों से लेकर यादगार जश्न तक।', 'রোজকার হাসি থেকে অবিস্মরণীয় উদযাপন পর্যন্ত।')}</p>
            </div>
          </div>
        </section>

        <section className="interactive-band">
          <div className="container two-col">
            <div className="panel">
              <div className="panel-heading">
                <div>
                  <h3>{tr('Sangeet DJ Request Box', 'संगीत डीजे गाना अनुरोध', 'সঙ্গীত সন্ধ্যার গানের অনুরোধ')}</h3>
                  <p>{tr('Nominate & upvote songs for the dance night!', 'संगीत की रात के लिए अपना पसंदीदा गाना जोड़ें!', 'নাচের রাতের জন্য আপনার প্রিয় গান যোগ করুন ও ভোট দিন!')}</p>
                </div>
                <i className="fas fa-compact-disc" />
              </div>
              <form className="song-form" onSubmit={addSong}>
                <input value={song} onChange={(e) => setSong(e.target.value)} placeholder="Track name & artist..." />
                <button className="gold-btn" type="submit">{tr('Add', 'जोड़ें', 'যোগ করুন')}</button>
              </form>
              <div className="playlist">
                {songs.map((item, index) => (
                  <div className="song-row" key={`${item.name}-${index}`}>
                    <span>{item.name}</span>
                    <button onClick={() => upvote(index)}>▲ <b>{item.votes}</b></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <div>
                  <h3>{tr('How Well Do You Know Them?', 'आप इन्हें कितना जानते हैं?', 'আপনি ওদের কতটা চেনেন?')}</h3>
                  <p>{tr('Take the 5-question couple trivia quiz!', 'सचिन और पौलमी से जुड़ी इस छोटी सी क्विज़ को हल करें!', 'সচিন ও পৌলমীকে নিয়ে ৫টি প্রশ্নের ছোট্ট কুইজে অংশ নিন!')}</p>
                </div>
                <i className="fas fa-heart" />
              </div>

              {!quizDone ? (
                <div className="quiz-box">
                  <p className="quiz-question">{question + 1}. {trivia[question].q}</p>
                  <div className="quiz-options">
                    {trivia[question].options.map((option, index) => (
                      <button key={option} onClick={() => answerQuiz(index)}>{option}</button>
                    ))}
                  </div>
                  <div className="quiz-footer">
                    <span>Question {question + 1} of {trivia.length}</span>
                    <span>Score: {score}</span>
                  </div>
                  {quizMessage && <span className="quiz-message">{quizMessage}</span>}
                </div>
              ) : (
                <div className="quiz-complete">
                  <i className="fas fa-trophy" />
                  <p>Quiz Complete!</p>
                  <span>You scored {score}% on Poulami & Sachin's Trivia!</span>
                  {quizMessage && <span className="quiz-message">{quizMessage}</span>}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="memory-strip memory-strip-left">
          <div className="container memory-strip-inner">
            <img src="/images/taj-couple-3.jpeg" alt="Poulami and Sachin sharing a romantic moment" loading="lazy" />
            <div>
              <span className="gold-kicker">The Beginning of Forever</span>
              <p>{tr('One beautiful chapter, leading to a lifetime together.', 'एक खूबसूरत अध्याय, जो जीवनभर के साथ की ओर बढ़ रहा है।', 'একটি সুন্দর অধ্যায়, যা এগিয়ে চলেছে সারাজীবনের একসাথে পথচলার দিকে।')}</p>
            </div>
          </div>
        </section>

        <section className="section container two-col venue-photo">
          <div className="panel">
            <span className="gold-kicker">{tr('Wedding Destination', 'विवाह स्थल', 'বিবাহের স্থান')}</span>
            <h3>Phoolchatti Resort, Rishikesh</h3>
            <p className="animated-address">Rattapani, Neelkanth Temple Road, Rishikesh, Paliyal Gaon, Uttarakhand 249304</p>
            <a className="gold-btn action-btn" href="https://www.google.com/maps/search/?api=1&query=Phoolchatti+resort+Rattapani+Neelkanth+Temple+Rd+Rishikesh" target="_blank" rel="noreferrer">
              <i className="fas fa-directions" /> {tr('Open in Google Maps', 'गूगल मैप्स में देखें', 'গুগল ম্যাপে দেখুন')}
            </a>
          </div>

          <div className="panel photo-drop">
            <div className="panel-heading">
              <div>
                <span className="gold-kicker">{tr('Our Memories', 'हमारी यादें', 'আমাদের স্মৃতি')}</span>
                <h3>{tr('A Little Love Story', 'एक प्यारी सी प्रेम कहानी', 'একটি ছোট্ট ভালোবাসার গল্প')}</h3>
              </div>
              <i className="fas fa-camera-retro" />
            </div>

            <p className="memory-copy">
              {tr('See memories shared by everyone attending the wedding.', 'शादी में शामिल सभी मेहमानों द्वारा साझा की गई यादें देखें।', 'বিয়েতে আসা সকল অতিথির ভাগ করে নেওয়া স্মৃতিগুলি দেখুন।')}
            </p>

            <div className="memory-gallery shared-memory-gallery">
              {sharedPhotos.length === 0 && (
                <div className="memory-empty">No guest photos yet — be the first to add one.</div>
              )}

              {sharedPhotos.map((photo) => (
                <div className="memory-photo shared-photo" key={photo.id}>
                  <img src={photo.public_url} alt="Guest wedding memory" loading="lazy" />
                  <button
                    type="button"
                    className="download-photo-btn"
                    onClick={() => void downloadSharedPhoto(photo)}
                    aria-label="Download shared photo"
                    title="Download photo"
                  >
                    <i className="fas fa-download" />
                  </button>
                  {photo.uploaded_by === currentUserId && (
                    <button
                      type="button"
                      className="delete-photo-btn"
                      onClick={() => deleteSharedPhoto(photo)}
                      aria-label="Delete your shared photo"
                      title="Delete your photo"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <label className={`upload-btn ${photoUploading ? 'disabled' : ''}`}>
              <i className={`fas ${photoUploading ? 'fa-spinner fa-spin' : 'fa-upload'}`} />
              {photoUploading
                ? (tr('Sharing...', 'साझा हो रहा है...', 'শেয়ার হচ্ছে...'))
                : (tr('Add Your Photo', 'अपनी फोटो जोड़ें', 'আপনার ছবি যোগ করুন'))}
              <input
                type="file"
                accept="image/*"
                disabled={photoUploading}
                onChange={(e) => {
                  submitPhoto(e.target.files?.[0])
                  e.currentTarget.value = ''
                }}
                hidden
              />
            </label>

            <span className="upload-status">
              <i className="fas fa-users" /> {tr('Shared with wedding guests. You can delete your own photo anytime.', 'सभी मेहमानों के साथ साझा। अपनी फोटो कभी भी हटा सकते हैं।', 'বিয়ের সকল অতিথির সঙ্গে শেয়ার করা হয়। নিজের ছবি যেকোনো সময় মুছে ফেলতে পারেন।')}
            </span>

            {photoMessage && <span className="upload-status photo-message">{photoMessage}</span>}
          </div>        </section>

        <section className="memory-strip memory-strip-right">
          <div className="container memory-strip-inner">
            <img src="/images/taj-couple-4.jpeg" alt="Poulami and Sachin celebrating their journey" loading="lazy" />
            <div>
              <span className="gold-kicker">And The Story Continues...</span>
              <p>{tr('The best part of the story is still being written.', 'कहानी का सबसे खूबसूरत हिस्सा अभी लिखा जाना बाकी है।', 'গল্পের সবচেয়ে সুন্দর অংশটা এখনও লেখা বাকি।')}</p>
            </div>
          </div>
        </section>

        <section className="rsvp-section" id="rsvp">
          <div className="container rsvp-container">
            <div className="section-heading">
              <span className="gold-kicker">{tr('Bless Us With Your Presence', 'आपकी उपस्थिति प्रार्थनीय है', 'আপনার উপস্থিতি আমাদের একান্ত কাম্য')}</span>
              <h2 className="gold-gradient-text">{tr('Wedding RSVP & Desk', 'उपस्थिति सूचना एवं संपर्क', 'উপস্থিতি নিশ্চিতকরণ ও যোগাযোগ')}</h2>
              <p>{tr('Kindly confirm your presence by 15th October 2026', 'कृपया 15 अक्टूबर 2026 तक अपनी उपस्थिति सुनिश्चित करें', 'অনুগ্রহ করে ১৫ অক্টোবর ২০২৬-এর মধ্যে আপনার উপস্থিতি নিশ্চিত করুন')}</p>
            </div>

            <div className="coordinator card animated-contact">
              <div className="contact-details">
                <span className="mini-label">{tr('Wedding Coordinator Desk', 'विवाह व्यवस्थापक', 'বিবাহ সমন্বয়ক')}</span>
                <strong>Sachin</strong>
                <a href="tel:+917017030967">+91 7017030967</a>
              </div>
              <div className="contact-actions">
                <a href="tel:+917017030967" className="outline-btn"><i className="fas fa-phone" /> Call</a>
                <a href="https://wa.me/917017030967?text=Hello%20Sachin%2C%20this%20is%20regarding%20your%20wedding" target="_blank" rel="noreferrer" className="whatsapp-btn"><i className="fab fa-whatsapp" /> WhatsApp</a>
              </div>
            </div>

            <form className="rsvp-form panel" onSubmit={submitRsvp}>
              <div className="form-grid">
                <label>Full Name *
                  <input name="fullName" required type="text" />
                </label>
                <label>Phone Number *
                  <input name="phone" required type="tel" />
                </label>
              </div>
              <div className="form-grid">
                <label>Guest Affiliation
                  <select name="affiliation" defaultValue="Ladkewale (Groom's Side)">
                    <option>Ladkewale (Groom's Side)</option>
                    <option>Ladkiwale (Bride's Side)</option>
                    <option>Common Dear Friends</option>
                  </select>
                </label>
                <label>Dietary Preferences (Optional)
                  <select name="dietaryPreference" defaultValue="">
                    <option value="">No preference selected</option>
                    <option>Pure Vegetarian</option>
                    <option>Traditional Feast</option>
                  </select>
                </label>
              </div>
              <label>Warm Blessings & Wishes
                <textarea name="blessings" rows={3} placeholder="Write your heartfelt blessings here..." />
              </label>
              <button type="submit" className="submit-btn">
                {tr('Confirm Attendance & Send Blessings', 'उपस्थिति दर्ज करें एवं आशीर्वाद भेजें', 'উপস্থিতি নিশ্চিত করুন ও আশীর্বাদ পাঠান')}
              </button>
              {rsvpMessage && <span className="upload-status photo-message">{rsvpMessage}</span>}
            </form>
          </div>
        </section>
      </main>

      <footer>
        <img className="footer-photo" src="/images/taj-couple-6.jpg" alt="Poulami and Sachin together at the Taj Mahal" />
        <p className="footer-shubh">॥ शुभ विवाह ॥</p>
        <p>Poulami & Sachin • November 2026</p>
        <small>Phoolchatti Resort, Rishikesh • Firozabad • Kolkata</small>
      </footer>
    </div>
  )
}

export default App
