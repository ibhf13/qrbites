import React from 'react'

interface Step {
    id: string
    title: string
}

interface FormStepperProps {
    steps: Step[]
    currentStep: number
}

const FormStepper: React.FC<FormStepperProps> = ({ steps, currentStep }) => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isActive = index === currentStep
                    const isCompleted = index < currentStep

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step circle with number */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                    flex items-center justify-center w-10 h-10 rounded-full
                    ${isActive ? 'bg-blue-500 text-white' : ''}
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-600' : ''}
                    transition-colors duration-200
                  `}
                                >
                                    {isCompleted ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>
                                <span
                                    className={`
                    mt-2 text-sm font-medium
                    ${isActive ? 'text-blue-500' : ''}
                    ${isCompleted ? 'text-green-500' : ''}
                    ${!isActive && !isCompleted ? 'text-gray-500' : ''}
                  `}
                                >
                                    {step.title}
                                </span>
                            </div>

                            {/* Connector line between steps */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`
                    flex-auto border-t-2
                    ${index < currentStep ? 'border-green-500' : 'border-gray-200'}
                  `}
                                />
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}

export default FormStepper 