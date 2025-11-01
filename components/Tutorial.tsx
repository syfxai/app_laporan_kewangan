
import React, { useState, useEffect } from 'react';

interface TutorialProps {
  onFinish: () => void;
}

const tutorialSteps = [
  {
    element: '[data-tutorial="step-1"]',
    title: 'Selamat Datang!',
    text: 'Ini adalah bar navigasi utama. Anda boleh bertukar antara Papan Pemuka, Transaksi dan Laporan di sini. Terdapat juga butang untuk menukar tema dan menguruskan data anda.',
    position: 'bottom',
  },
  {
    element: '[data-tutorial="step-2"]',
    title: 'Ringkasan Kewangan',
    text: 'Di sini anda dapat melihat ringkasan kewangan anda sepintas lalu: jumlah wang masuk, keluar, dan baki semasa.',
    position: 'bottom',
  },
  {
    element: '[data-tutorial="step-3"]',
    title: 'Analisa Bulanan',
    text: 'Graf ini menunjukkan perbandingan aliran tunai masuk dan keluar setiap bulan, membantu anda memahami trend kewangan.',
    position: 'top',
  },
  {
    element: '[data-tutorial="step-4"]',
    title: 'Transaksi Terkini',
    text: 'Senarai transaksi terbaru anda dipaparkan di sini untuk rujukan pantas.',
    position: 'top',
  },
  {
    element: '[data-tutorial="step-5"]',
    title: 'Tambah Rekod',
    text: 'Klik butang ini untuk menambah rekod perbelanjaan atau pendapatan baru.',
    position: 'left',
  },
   {
    element: '[href="#reports"]', // This is a trick to target the reports nav link
    selector: '[data-tutorial="step-1"] a[href="#reports"], [data-tutorial="step-1"] button:nth-child(3)',
    title: 'Laporan Kewangan',
    text: 'Pergi ke bahagian Laporan untuk menjana penyata kewangan bulanan atau tahunan. Anda boleh mengeksportnya ke format PDF atau Excel untuk tujuan audit.',
    position: 'bottom',
  },
];

const Tutorial: React.FC<TutorialProps> = ({ onFinish }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const currentStep = tutorialSteps[stepIndex];
  const targetElement = document.querySelector(currentStep.element);

  useEffect(() => {
    // If the element for the current step is not visible, we might need to navigate.
    // For this app, step 6 requires clicking the "Laporan" button.
    if(stepIndex === 5){
      const reportsButton = document.querySelector('[data-tutorial="step-1"] button:nth-child(3)') as HTMLElement | null;
      reportsButton?.click();
    }
  }, [stepIndex]);

  if (!targetElement) {
    // This could happen if the component isn't mounted yet. Let's not render the tutorial.
    // It's a simple fallback.
    return null;
  }

  const { top, left, width, height } = targetElement.getBoundingClientRect();

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    transform: 'translate(-50%, 16px)',
    top: `${top + height}px`,
    left: `${left + width / 2}px`,
  };

  if (currentStep.position === 'top') {
    tooltipStyle.transform = 'translate(-50%, -100%)';
    tooltipStyle.top = `${top - 16}px`;
  } else if (currentStep.position === 'left') {
    tooltipStyle.transform = 'translate(calc(-100% - 16px), -50%)';
    tooltipStyle.top = `${top + height / 2}px`;
    tooltipStyle.left = `${left}px`;
  } else if (currentStep.position === 'right') {
     tooltipStyle.transform = 'translate(16px, -50%)';
     tooltipStyle.top = `${top + height / 2}px`;
     tooltipStyle.left = `${left + width}px`;
  }

  const handleNext = () => {
    if (stepIndex < tutorialSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onFinish();
    }
  };
  
  const handleSkip = () => {
    onFinish();
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      <div
        className="absolute transition-all duration-300 ease-in-out border-4 border-white rounded-lg shadow-2xl"
        style={{ top: top - 8, left: left - 8, width: width + 16, height: height + 16 }}
      ></div>

      <div style={tooltipStyle} className="z-50 w-80 p-5 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-gray-800 dark:text-gray-200">
        <h4 className="font-bold text-lg mb-2">{currentStep.title}</h4>
        <p className="text-sm mb-4">{currentStep.text}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{stepIndex + 1} / {tutorialSteps.length}</span>
          <div>
            <button onClick={handleSkip} className="text-sm text-gray-600 dark:text-gray-400 hover:underline mr-4">Langkau</button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700"
            >
              {stepIndex === tutorialSteps.length - 1 ? 'Selesai' : 'Seterusnya'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
