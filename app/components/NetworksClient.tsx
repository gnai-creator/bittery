"use client";
import { useEffect, useState } from "react";
import Networks from "./Networks";

const LAUNCH_DATE = new Date("2025-08-05T20:00:00-03:00").getTime();

export default function NetworksClient() {
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    const check = () => {
      setLaunched(Date.now() >= LAUNCH_DATE);
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  return <Networks launched={launched} />;
}
