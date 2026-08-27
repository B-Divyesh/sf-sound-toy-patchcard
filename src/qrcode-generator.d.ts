declare module 'qrcode-generator' {
  interface QR {
    addData(data: string): void;
    make(): void;
    createSvgTag(cellSize?: number, margin?: number): string;
  }
  export default function qrcode(typeNumber?: number, errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'): QR;
}
