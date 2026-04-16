'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

function getGreeting(): string {
  const hour = dayjs().hour();
  if (hour >= 5 && hour < 12) return 'bom dia,';
  if (hour >= 12 && hour < 18) return 'boa tarde,';
  return 'boa noite,';
}

export function Greeting() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <h1 className="text-base text-gray-800 font-bold" suppressHydrationWarning>
      {greeting}
    </h1>
  );
}
