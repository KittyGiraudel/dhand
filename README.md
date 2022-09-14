# Dhand

`dhand` (pronounded “d-hand”, short for “dominant hand”) is a React hook that attempts to detect the user’s dominant hand.

It works by listening to all click events and figuring out whether they happened more on the left or the right side of full-width interactive elements. As more taps are recorded, the guess becomes more and more accurate.

Try a [demo](https://codesandbox.io/s/dhand-hsq70r) on CodeSandbox or read the [related blog post](https://kittygiraudel.com/2022/09/14/dominant-hand-respecting-design/).

## Install

```sh
npm install dhand
# or
yarn add dhand
```

## Usage

The hook returns an object with the following key:

- `score`: a number between -1 and +1, where a negative number means the left hand is likely to be the dominant one, and a positive number means the right hand is likely the dominant one. The closer it gets to 0, the less conclusive it is.
- `tapCount`: the total amount of taps that were record. This can be handy to avoid making considerations before a certain amount of taps have occurred.
- `tapScore`: the total accumulated score for all taps (typically an internal value).

```js
import useDominantHand from 'dhand'

const MyComponent = () => {
  const { score, tapScore, tapCount } = useDominantHand(/* options */)

  return (
    <div className="App">
      <h1>dhand</h1>
      <p>
        Current score: {score} ({tapScore} over {tapCount} taps)
      </p>
      <p>
        Guessed dominant hand:{' '}
        {score < 0 ? 'left' : score > 0 ? 'right' : 'no-preference'}
      </p>
    </div>
  )
}
```

## Options

All options are strictly optional as they come with sensible default values:

- `maximumScreenWidth` (default to 767): the screen width in pixels beyond which taps are no longer record
- `fullWidthThreshold` (default to 0.8): the percentage as a float above which an element is considered full-width and can be used as a candidate to guess (0.8 means interactive elements spreading over 80% of the screen width are valid candidates)
- `centerDiscardThreshold` (default to 0.2): the percentage as a float around around the center of a full-width element within which not to count the tap as it’s too close to the center to guess (0.2 means taps within 20% of the center are discarded)
- `touchEventsOnly` (default to true): whether to check for device touch capabilities, which is a good idea but makes developing and testing harder

## Troubleshooting

### No event seems to register

This might be because your device does not have touch capabilities. Unless you can try on an actual mobile device or in a proper mobile emulator, you might want to turn off the `touchEventsOnly` option to disable the touch device capability check.

### What about RTL?

The library doesn’t make directional considerations per se. All it computes is which side of the screen is the most used. Feel free to use that knowledge the way you see fit.
