import React from 'react'
import focusableSelectors from 'focusable-selectors'

// Returns a number between -1 and +1 to convey the guessed dominant hand, with
// -1 being left side and +1 being right side.
const useDominantHandScore = ({
  // Arbitrary maximum screen width to compute score for; anything beyond that
  // is considered not a mobile device and thus discarded
  maximumScreenWidth = 767,
  // Threshold above which an element is considered full-width and can be a
  // candidate for tap recording (80% by default)
  fullWidthThreshold = 0.8,
  // Threshold around the center of the screen within which not to register taps
  // as they are unconclusive (20% around the center by default)
  centerDiscardThreshold = 0.2,
  // Whether there should be a check for the device touch capabilities before
  // recording taps (good idea, but makes testing/developing more difficult)
  touchEventsOnly = true,
} = {}) => {
  const [tapScore, setTapScore] = React.useState(0)
  const [tapCount, setTapCount] = React.useState(0)

  const handleTap = React.useCallback(
    event => {
      const viewportWidth = getViewportWidth()

      // If the device does not have touch capabilities or is likely not a
      // mobile device, skip recording
      if (touchEventsOnly && !isTouchDevice()) return false
      if (viewportWidth > maximumScreenWidth) return false

      // If the event is not a touch event, skip recording
      if (event.clientX === 0 && event.clientY === 0) return false

      const targetWidth = event.target.offsetWidth || 0
      const consideredFullWidth = viewportWidth * fullWidthThreshold

      // If the target element is not considered full width, skip recording
      if (targetWidth < consideredFullWidth) return false

      // If the target element is not a focusable element, skip recording
      if (!event.target.matches(focusableSelectors.join(','))) return false
      if (!isVisible(event.target)) return false

      // Convert the tap position in % to a number between -1 and +1
      const position = (getTapPosition(event) - 50) / 50

      if (
        (position > centerDiscardThreshold * -1 && position <= 0) ||
        (position >= 0 && position < centerDiscardThreshold)
      )
        return false

      setTapCount(count => count + 1)
      setTapScore(score => score + position)
    },
    [maximumScreenWidth, fullWidthThreshold, centerDiscardThreshold]
  )

  React.useEffect(() => {
    document.addEventListener('click', handleTap)

    return () => {
      document.removeEventListener('click', handleTap)
    }
  }, [handleTap])

  return { tapCount, tapScore, score: tapScore / tapCount || 0 }
}

function getTapPosition(event) {
  return Math.round(
    ((event.clientX - event.target.offsetLeft) / event.target.offsetWidth) * 100
  )
}

function getViewportWidth() {
  return Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
}

function isTouchDevice() {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  )
}

function isVisible(element) {
  return Boolean(
    element.offsetWidth ||
      element.offsetHeight ||
      element.getClientRects().length
  )
}

export default useDominantHandScore
