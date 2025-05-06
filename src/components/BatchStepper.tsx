
import React from 'react';
import { Batch } from '../mock/fakeBatches';
import { getBatchProgress } from '../mock/fakeBatches';

interface BatchStepperProps {
  batch: Batch;
  currentStep?: string;
}

const BatchStepper: React.FC<BatchStepperProps> = ({ batch, currentStep }) => {
  const progress = getBatchProgress(batch);
  
  const steps = [
    { name: 'theme', label: 'Theme', percentage: progress.themeProgress },
    { name: 'style', label: 'Style', percentage: progress.styleProgress },
    { name: 'lyrics', label: 'Lyrics', percentage: progress.lyricsProgress },
    { name: 'audio', label: 'Audio', percentage: progress.audioProgress },
    { name: 'playlist', label: 'Playlist', percentage: progress.finalProgress }
  ];

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.name}>
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === step.name ? 'bg-music-purple' : 
                step.percentage === 100 ? 'bg-music-green' : 'bg-music-gray'
              }`}>
                {step.percentage === 100 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="text-xs mt-1">{step.label}</span>
              <span className="text-xs text-gray-400">{step.percentage}%</span>
            </div>
            
            {/* Connecting line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 bg-music-gray">
                <div 
                  className="h-full bg-music-purple" 
                  style={{ 
                    width: `${
                      step.percentage === 100 ? '100%' : 
                      steps[index + 1].percentage > 0 ? '100%' : 
                      step.percentage
                    }%` 
                  }}
                ></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BatchStepper;
