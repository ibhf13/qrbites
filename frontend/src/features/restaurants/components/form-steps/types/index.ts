export interface Step {
    id: string
    title: string
}

export type StepState = 'completed' | 'active' | 'inactive'