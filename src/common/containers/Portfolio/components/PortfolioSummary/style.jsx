import styled, {keyframes} from 'styled-components'
import { FormattedNumber } from 'react-intl'

const animateDown = keyframes`
  0% { color: red }
  100% { color: #000 }
`

const animateUp = `
  0% { color: green }
  100% { color: #000 }
`

export const Value = styled.FormattedNumber`
  color: #000;
`

export const DecreasedValue = styled.FormattedNumber`
  animation: ${animateDown} 1s ease-in;
`

export const IncreasedValue = styled.FormattedNumber`
  animation: ${animateUp} 1s ease-in;
`
