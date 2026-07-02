import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef, useState } from 'react';
import type { InternshipApplication } from '@/types/internship';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface ResumeModalProps {
    isOpen: boolean;
    selectedApp: InternshipApplication | null;
    onClose: () => void;
    onDownload: (id: number) => void;
    // onTextExtracted?: (text: string) => void;
}

function PDFCanvas( { resumePath }: { resumePath: string}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

    useEffect(() => {
        let cancelled = false;

        const render = async () => {
            try {
                setStatus("loading");

                const pdf = await pdfjsLib.getDocument(`/storage/${resumePath}`).promise;

                const THRESHOLD = 240;
                const PADDING = 20;
                const GAP = 24;

                type PageResult = {
                    bitmap: ImageBitmap;
                    cropW: number;
                    cropH: number;
                };

                const pages: PageResult[] = [];

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 2 });

                    const offscreen = document.createElement("canvas");
                    offscreen.width = viewport.width;
                    offscreen.height = viewport.height;
                    const offCtx = offscreen.getContext("2d")!;

                    await page.render({ canvasContext: offCtx, canvas: offscreen, viewport }).promise;

                    if (cancelled) return;

                    const { data, width, height } = offCtx.getImageData(0, 0, viewport.width, viewport.height);

                    let top = height, bottom = 0, left = width, right = 0;

                    for (let y = 0; y < height; y++) {
                        for (let x = 0; x < width; x++) {
                            const i = (y * width + x) * 4;
                            if (data[i] < THRESHOLD || data[i + 1] < THRESHOLD || data[i + 2] < THRESHOLD) {
                                if (y < top) top = y;
                                if (y > bottom) bottom = y;
                                if (x < left) left = x;
                                if (x > right) right = x;
                            }
                        }
                    }


                    const cropY = Math.max(0, top - PADDING);
                    const cropH = Math.min(height, bottom + PADDING) - cropY;

                    const bitmap = await createImageBitmap(offscreen, 0, cropY, width, cropH);
                    pages.push({ bitmap, cropW: width, cropH });
                }

                if (cancelled) return;

                const totalHeight = pages.reduce((sum, p, i) => sum + p.cropH + (i > 0 ? GAP : 0), 0);
                const maxWidth = Math.max(...pages.map(p => p.cropW));

                const canvas = canvasRef.current;
                if (!canvas) return;

                canvas.width = maxWidth;
                canvas.height = totalHeight;

                const ctx = canvas.getContext("2d")!;

                ctx.fillStyle = "#e5e7eb";
                ctx.fillRect(0, 0, maxWidth, totalHeight);

                let offsetY = 0;
                for (const { bitmap, cropW, cropH } of pages) {
                    const x = Math.floor((maxWidth - cropW) / 2)
                    ctx.drawImage(bitmap, x, offsetY, cropW, cropH);
                    offsetY += cropH + GAP;
                }

                // extract teks dari semua halaman di dalam pdf
                {/*let fullText = "";
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++){
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
                }
                onTextExtracted?.(fullText);*/}

                setStatus("done");
            } catch (err) {
                console.error("PDF render error:", err);
                if (!cancelled) setStatus("error");
            }
        };

        render();
        return () => { cancelled = true; };
    }, [resumePath]);

    return (
        <div className="w-full rounded-lg overflow-hidden bg-white">
            {status === "loading" && (
                <div className="flex items-center justify-center h-48 text-sm text-gray-400 bg-white/5 rounded-lg">
                    <span className="animate-pulse">Memuat resume...</span>
                </div>
            )}
            {status === "error" && (
                <div className="flex items-center justify-center h-48 text-sm text-red-400 bg-white/5 rounded-lg">
                    Gagal memuat resume.
                </div>
            )}
            <canvas
                ref={canvasRef}
                className={`w-full h-auto ${status !== "done" ? "hidden" : "block"}`}
            />
        </div>
    );
}



export default function ResumeModal({ isOpen, selectedApp, onClose, onDownload }: ResumeModalProps) {
    if (!isOpen || !selectedApp) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-[#0a0a0a] border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold">Resume Preview</h2>
                        <p className="text-sm text-white/50">{selectedApp.first_name} {selectedApp.last_name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    {selectedApp.resume_path ? (
                        <div className="space-y-4">
                            {/* nampilin resume */}
                            {/* <iframe
                                src={`/storage/${selectedApp.resume_path}`}
                                className="w-full h-[600px] border border-white/10 rounded-lg"
                                title="Resume PDF"
                            ></iframe> */}
                            <PDFCanvas 
                            resumePath={selectedApp.resume_path} 
                            />

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => onDownload(selectedApp.id)}
                                    className="flex-1 px-4 py-2 bg-[#0572FF] hover:bg-blue-700 rounded-lg font-medium transition-colors"
                                >
                                    Download Resume
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-white/50 text-center py-8">Resume not found</p>
                    )}
                </div>
            </div>
        </div>
    );
}
