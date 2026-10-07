'use client'
import { createClient } from '@/lib/supabase/client'
import Script    from 'next/script'
import { useEffect, useState, useMemo } from 'react'


async function hashEmail(email: string): Promise<string> {
  const normalised = email.toLowerCase().trim()
  const encoded    = new TextEncoder().encode(normalised)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray  = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const TAG_ID = '2613635558070'

export function PinterestTag() {
  const [hashedEmail, setHashedEmail] = useState<string>('')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        const hashed = await hashEmail(session.user.email)
        setHashedEmail(hashed)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user?.email) {
          const hashed = await hashEmail(session.user.email)
          setHashedEmail(hashed)
        } else {
          setHashedEmail('')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  // Build the pintrk load call — include em only if user is logged in
  const pinterestScript = hashedEmail
    ? `
        !function(e){if(!window.pintrk){window.pintrk=function(){
        window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
        var n=window.pintrk;n.queue=[],n.version="3.0";
        var t=document.createElement("script");t.async=!0,t.src=e;
        var r=document.getElementsByTagName("script")[0];
        r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
        pintrk('load', '${TAG_ID}', { em: '${hashedEmail}' });
        pintrk('page');
      `
    : `
        !function(e){if(!window.pintrk){window.pintrk=function(){
        window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
        var n=window.pintrk;n.queue=[],n.version="3.0";
        var t=document.createElement("script");t.async=!0,t.src=e;
        var r=document.getElementsByTagName("script")[0];
        r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
        pintrk('load', '${TAG_ID}');
        pintrk('page');
      `

  // Build noscript src — include hashed email if available
  const noscriptSrc = hashedEmail
    ? `https://ct.pinterest.com/v3/?event=init&tid=${TAG_ID}&pd[em]=${hashedEmail}&noscript=1`
    : `https://ct.pinterest.com/v3/?event=init&tid=${TAG_ID}&noscript=1`

  return (
    <>
      <Script
        id="pinterest-tag"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: pinterestScript }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={noscriptSrc}
        />
      </noscript>
    </>
  )
}