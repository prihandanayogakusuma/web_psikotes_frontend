"use client";

import { useParams } from "next/navigation";
import WPT from "./components/WPT";
import PAPI from "./components/PAPIKOSTIK";
import IST from "./components/IST";
import DISC from "./components/DISC";


export default function ExamRouterPage() {
  const params = useParams();
  const testId = params.id as string;

 
  if (testId === "1") return <WPT />;
  if (testId === "2") return <PAPI />;
  if (testId === "3") return <IST />;
    if (testId === "4") return <DISC />;


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center font-bold text-xl text-gray-700">
        Modul Tes Tidak Ditemukan
      </div>
    </div>
  );
}