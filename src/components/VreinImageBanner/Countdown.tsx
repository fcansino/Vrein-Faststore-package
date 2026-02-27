'use client'

import React, { useState, useEffect } from 'react'

interface CountdownProps {
  fontSize?: number
  fontColor?: string
  dateStart?: string
  dateEnd: string
  timeZoneOffset?: number
}

export const Countdown: React.FC<CountdownProps> = ({
  fontSize = 20,
  fontColor = 'white',
  dateStart,
  dateEnd,
  timeZoneOffset = 0,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)
  const [show, setShow] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const startTime = dateStart ? new Date(dateStart).getTime() : null
    const endTime = new Date(dateEnd).getTime()

    const intervalId = setInterval(() => {
      const nowUTC = Date.now()
      const adjustedNow = nowUTC + timeZoneOffset * 60 * 1000

      if (adjustedNow > endTime) {
        setShow(false)
        setFinished(true)
        clearInterval(intervalId)
        return
      }

      if (startTime && adjustedNow < startTime) {
        setShow(false)
        setFinished(false)
        return
      }

      setShow(true)
      setFinished(false)

      const distance = endTime - adjustedNow
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      )
      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
      )
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [dateStart, dateEnd, timeZoneOffset])

  const formatNumber = (num: number) =>
    num.toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false,
    })

  if (finished || !show || !timeLeft) return null

  const items = [
    { value: timeLeft.days, label: 'Dias' },
    { value: timeLeft.hours, label: 'Horas' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Seg' },
  ]

  return (
    <div style={{ display: 'inline-block' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '10px' }}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index !== 0 && (
              <span style={{ fontSize: `${fontSize}px`, color: fontColor, lineHeight: 1 }}>
                :
              </span>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: `${fontSize * 1.5}px`,
                  fontWeight: 'bold',
                  color: fontColor,
                  lineHeight: 1.2,
                }}
              >
                {formatNumber(item.value)}
              </span>
              <span
                style={{
                  fontSize: `${fontSize * 0.6}px`,
                  color: fontColor,
                  lineHeight: 1.2,
                  textTransform: 'uppercase',
                }}
              >
                {item.label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default Countdown
