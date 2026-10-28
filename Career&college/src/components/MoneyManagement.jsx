import { useEffect, useRef } from 'react';

const MONEY_APP_URL = '/Money%20Management/index.html?embedded=1';

function syncMoneyFrame(frame, activeSection) {
  const moneyDocument = frame?.contentDocument;
  moneyDocument?.documentElement.classList.add('embedded-money');
  moneyDocument?.body.classList.add('embedded-money');
  frame?.contentWindow?.postMessage(
    { type: 'campus360:money-section', section: activeSection },
    window.location.origin,
  );
}

export default function MoneyManagement({ activeSection }) {
  const frameRef = useRef(null);

  useEffect(() => {
    syncMoneyFrame(frameRef.current, activeSection);
  }, [activeSection]);

  return (
    <div className="h-full min-h-[620px]">
      <iframe
        ref={frameRef}
        title="Money Management"
        src={MONEY_APP_URL}
        onLoad={(event) => syncMoneyFrame(event.currentTarget, activeSection)}
        className="block h-full min-h-[620px] w-full border-0 bg-slate-50"
      />
    </div>
  );
}
