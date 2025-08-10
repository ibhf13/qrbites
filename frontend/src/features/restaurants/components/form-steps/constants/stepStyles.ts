import { StepStyleConfig } from '../utils/stepUtils'

export const STEP_STYLE_CONFIG: StepStyleConfig = {
    baseClasses: `
    relative flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full 
    border-2 transition-all duration-300 ease-in-out transform text-center
  `,
    stateClasses: {
        completed: `
      bg-gradient-to-br from-success-500 to-success-600 dark:from-success-600 dark:to-success-700
      border-success-500 dark:border-success-600 text-white shadow-lg
    `,
        active: `
      bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700
      border-primary-500 dark:border-primary-600 text-white shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/50
    `,
        inactive: `
      bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 
      text-neutral-500 dark:text-neutral-400
    `
    },
    hoverClasses: {
        completed: `
      hover:shadow-xl hover:from-success-600 hover:to-success-700 
      dark:hover:from-success-700 dark:hover:to-success-800
    `,
        active: `
      hover:shadow-xl hover:from-primary-600 hover:to-primary-700 
      dark:hover:from-primary-700 dark:hover:to-primary-800
    `,
        inactive: `
      hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400 
      dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300
    `
    }
}

export const CONNECTOR_STYLES = {
    base: 'flex-1 mx-3 h-1 rounded-full transition-all duration-500 ease-in-out',
    completed: 'bg-gradient-to-r from-success-400 to-success-500 dark:from-success-500 dark:to-success-600 shadow-sm',
    active: 'bg-gradient-to-r from-primary-400 to-primary-500 dark:from-primary-500 dark:to-primary-600 shadow-sm',
    inactive: 'bg-neutral-200 dark:bg-neutral-700'
}

export const TITLE_STYLES = {
    base: 'mt-3 text-center font-medium max-w-24 md:max-w-24 leading-tight transition-all duration-200',
    active: 'text-primary-600 dark:text-primary-400',
    completed: 'text-success-600 dark:text-success-400',
    inactive: 'text-neutral-500 dark:text-neutral-400',
    inactiveHover: 'hover:text-neutral-700 dark:hover:text-neutral-300'
}

export const PROGRESS_BAR_STYLES = {
    container: 'w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2',
    bar: `bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 
        dark:to-primary-700 h-2 rounded-full transition-all duration-500 ease-out shadow-sm`
}

export const MOBILE_STYLES = {
    container: 'flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2',
    stepWrapper: 'flex-shrink-0 w-1/2 px-2 snap-start',
    connector: `absolute top-4 left-1/2 w-full h-1 rounded-full transition-all duration-500 ease-in-out`,
    pageIndicator: {
        active: 'bg-primary-500 dark:bg-primary-400',
        inactive: 'bg-neutral-300 dark:bg-neutral-600'
    }
}