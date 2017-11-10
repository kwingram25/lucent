import { localizationData } from '../../../../Intl/setup'

// Export Constants
export const SWITCH_LANGUAGE = 'SWITCH_LANGUAGE'

export const switchLanguage = (newLang) => ({
  type: SWITCH_LANGUAGE,
  ...localizationData[newLang]
})
