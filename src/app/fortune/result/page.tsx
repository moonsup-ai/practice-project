import { Suspense } from 'react';
import ResultContent from './ResultContent';

export default function FortuneResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#0a0510 0%,#1a0a2e 50%,#0d0820 100%)' }}>
        <p style={{ color: '#d4a853' }}>✦</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
