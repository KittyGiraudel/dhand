import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import useDominantHand from './dhand'

Object.defineProperties(window.HTMLElement.prototype, {
  offsetWidth: {
    get: function () {
      if (this.id === 'large-button') return 410
      if (this.id === 'invisible') return 0
      return 100
    },
  },
})

const Wrapper = ({
  buttonId = 'large-button',
  touchEventOnly = false,
  Component = 'button',
}) => {
  const { score } = useDominantHand({ touchEventsOnly: touchEventOnly })

  return (
    <div data-testid="score" data-score={score} style={{ width: '1000px' }}>
      <p>Hi</p>
      <Component data-testid="button" id={buttonId}>
        Click me
      </Component>
    </div>
  )
}

describe('useDominantHand', () => {
  it('should not record events on large screens', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000,
    })

    render(<Wrapper />)
    fireEvent.click(screen.getByTestId('button'), { clientX: 400, clientY: 10 })
    expect(screen.getByTestId('score')).toHaveAttribute('data-score', '0')

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })
  })

  it('should not record keyboard events', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByTestId('button'), { clientX: 0, clientY: 0 })
    expect(screen.getByTestId('score')).toHaveAttribute('data-score', '0')
  })

  it('should not record events when `touchEventOnly` is enabled', () => {
    render(<Wrapper touchEventOnly />)
    fireEvent.click(screen.getByTestId('button'), { clientX: 10, clientY: 10 })
    expect(screen.getByTestId('score')).toHaveAttribute('data-score', '0')
  })

  it('should not record events when the element is not fullscreen', () => {
    render(<Wrapper buttonId="small-button" />)
    fireEvent.click(screen.getByTestId('button'), { clientX: 10, clientY: 10 })
    expect(screen.getByTestId('score')).toHaveAttribute('data-score', '0')
  })

  it('should not record events when the element is not interactive', () => {
    render(<Wrapper Component="span" />)
    fireEvent.click(screen.getByTestId('button'), { clientX: 10, clientY: 10 })
    expect(screen.getByTestId('score')).toHaveAttribute('data-score', '0')
  })

  it('should not record events when the element is not visible', () => {
    render(<Wrapper buttonId="invisible" />)
    fireEvent.click(screen.getByTestId('button'), { clientX: 10, clientY: 10 })
    expect(screen.getByTestId('score')).toHaveAttribute('data-score', '0')
  })

  it('should not record events when the click is near the center', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByTestId('button'), { clientX: 200, clientY: 10 })
    expect(screen.getByTestId('score')).toHaveAttribute('data-score', '0')
  })

  it('should return a negative score for left side', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByTestId('button'), { clientX: 100, clientY: 10 })
    expect(
      +screen.getByTestId('score').getAttribute('data-score')
    ).toBeLessThan(0)
  })

  it('should return a positive score for right side', () => {
    render(<Wrapper />)
    fireEvent.click(screen.getByTestId('button'), { clientX: 300, clientY: 10 })
    expect(
      +screen.getByTestId('score').getAttribute('data-score')
    ).toBeGreaterThan(0)
  })
})
