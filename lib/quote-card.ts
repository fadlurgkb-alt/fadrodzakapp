'use client';

export type CardTheme = 'terracotta' | 'krem' | 'sage' | 'gelap';

export interface CardOptions {
  judul: string;
  kutipan: string;
  penulis: string;
  kategori?: string;
  theme: CardTheme;
}

export async function generateQuoteCardCanvas(options: CardOptions): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350; // Aspect ratio 4:5 (Standar Instagram & WhatsApp Status)
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context tidak didukung.');

  const { judul, kutipan, penulis, kategori = 'Sastra', theme } = options;

  // 1. Palet Warna
  let bgGradientStart = '#FAF6EE';
  let bgGradientEnd = '#F2E8D8';
  let borderColor = '#C45A2C';
  let titleColor = '#C45A2C';
  let quoteColor = '#242424';
  let authorColor = '#5A4A42';
  let ornamentColor = 'rgba(196, 90, 44, 0.25)';

  if (theme === 'terracotta') {
    bgGradientStart = '#C45A2C';
    bgGradientEnd = '#9E3C16';
    borderColor = '#F5DDC7';
    titleColor = '#FFE8D6';
    quoteColor = '#FFFFFF';
    authorColor = '#FFD8BD';
    ornamentColor = 'rgba(255, 232, 214, 0.3)';
  } else if (theme === 'sage') {
    bgGradientStart = '#E8F0EA';
    bgGradientEnd = '#D3E2D7';
    borderColor = '#3D634C';
    titleColor = '#2F523E';
    quoteColor = '#1F3327';
    authorColor = '#4B6B58';
    ornamentColor = 'rgba(61, 99, 76, 0.25)';
  } else if (theme === 'gelap') {
    bgGradientStart = '#18181B';
    bgGradientEnd = '#0F0F12';
    borderColor = '#D4AF37';
    titleColor = '#E5C158';
    quoteColor = '#F4F4F5';
    authorColor = '#A1A1AA';
    ornamentColor = 'rgba(212, 175, 55, 0.25)';
  }

  // 2. Latar Belakang Gradasi
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bgGrad.addColorStop(0, bgGradientStart);
  bgGrad.addColorStop(1, bgGradientEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. Tekstur Halus Kertas Kuno
  ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * canvas.width;
    const ry = Math.random() * canvas.height;
    const rw = Math.random() * 2 + 1;
    ctx.fillRect(rx, ry, rw, rw);
  }

  // 4. Bingkai Estetis Ganda (Classic Double Border)
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

  ctx.strokeStyle = ornamentColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(74, 74, canvas.width - 148, canvas.height - 148);

  // 5. Sudut Ornamen Aksara (Corner Accents)
  const drawCorner = (x: number, y: number, angle: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 24);
    ctx.lineTo(0, 0);
    ctx.lineTo(24, 0);
    ctx.stroke();

    ctx.fillStyle = borderColor;
    ctx.beginPath();
    ctx.arc(6, 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawCorner(60, 60, 0);
  drawCorner(canvas.width - 60, 60, Math.PI / 2);
  drawCorner(canvas.width - 60, canvas.height - 60, Math.PI);
  drawCorner(60, canvas.height - 60, -Math.PI / 2);

  // Helper safe letterSpacing
  const setLetterSpacing = (val: string) => {
    try {
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = val;
      }
    } catch {}
  };

  // 6. Header Fadrodzak Brand
  ctx.textAlign = 'center';
  ctx.fillStyle = titleColor;
  ctx.font = 'bold 32px serif';
  setLetterSpacing('6px');
  ctx.fillText('F A D R O D Z A K', canvas.width / 2, 160);

  ctx.font = 'italic 20px serif';
  ctx.fillStyle = authorColor;
  setLetterSpacing('2px');
  ctx.fillText(`• Ruang Sastra & Komunitas Aksara •`, canvas.width / 2, 200);

  // Garis Pemisah Klasik
  ctx.strokeStyle = ornamentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 140, 230);
  ctx.lineTo(canvas.width / 2 + 140, 230);
  ctx.stroke();

  // Simbol Pusat Pemisah
  ctx.fillStyle = borderColor;
  ctx.font = '22px serif';
  ctx.fillText('❦', canvas.width / 2, 237);

  // 7. Judul Karya
  ctx.font = 'bold 36px serif';
  ctx.fillStyle = titleColor;
  setLetterSpacing('1px');
  ctx.fillText(`"${judul}"`, canvas.width / 2, 330);

  ctx.font = '600 18px sans-serif';
  ctx.fillStyle = authorColor;
  setLetterSpacing('3px');
  ctx.fillText(kategori.toUpperCase(), canvas.width / 2, 370);

  // 8. Tanda Petik Pembuka Besar Klasik
  ctx.fillStyle = ornamentColor;
  ctx.font = 'bold 120px serif';
  ctx.fillText('“', canvas.width / 2, 470);

  // 9. Isi Kutipan Teks (Auto Line Wrap & Justified & Overflow Cap)
  const cleanText = kutipan.replace(/<[^>]*>?/gm, '').trim();
  const isLong = cleanText.length > 180;
  const isVeryLong = cleanText.length > 320;

  const quoteFontSize = isVeryLong ? 28 : isLong ? 34 : 40;
  const lineHeight = isVeryLong ? 44 : isLong ? 52 : 62;
  const maxAllowedY = canvas.height - 350; // Jaga jarak aman dari footer

  ctx.fillStyle = quoteColor;
  ctx.font = `italic ${quoteFontSize}px serif`;
  setLetterSpacing('0.5px');

  const paragraphs = cleanText.split('\n').filter((p) => p.trim().length > 0);
  const maxWidth = 820;
  let currentY = 530;
  let hasTruncated = false;

  for (const pText of paragraphs) {
    if (hasTruncated) break;
    const words = pText.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      if (currentY + lineHeight > maxAllowedY) {
        if (currentLine.trim()) {
          ctx.fillText(currentLine.trim() + '...', canvas.width / 2, currentY);
        }
        hasTruncated = true;
        break;
      }

      const testLine = currentLine + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(currentLine.trim(), canvas.width / 2, currentY);
        currentLine = words[i] + ' ';
        currentY += lineHeight;
      } else {
        currentLine = testLine;
      }
    }

    if (!hasTruncated && currentLine.trim().length > 0) {
      if (currentY + lineHeight > maxAllowedY) {
        ctx.fillText(currentLine.trim() + '...', canvas.width / 2, currentY);
        hasTruncated = true;
      } else {
        ctx.fillText(currentLine.trim(), canvas.width / 2, currentY);
        currentY += lineHeight * 1.2;
      }
    }
  }

  // 10. Tanda Petik Penutup
  ctx.fillStyle = ornamentColor;
  ctx.font = 'bold 80px serif';
  ctx.fillText('”', canvas.width / 2, Math.min(currentY + 20, canvas.height - 290));

  // 11. Footer: Nama Penulis & Cap Tanggal
  const footerY = canvas.height - 180;
  ctx.strokeStyle = ornamentColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 180, footerY - 40);
  ctx.lineTo(canvas.width / 2 + 180, footerY - 40);
  ctx.stroke();

  ctx.fillStyle = authorColor;
  ctx.font = 'italic 24px serif';
  setLetterSpacing('1px');
  ctx.fillText('Oleh:', canvas.width / 2, footerY - 10);

  ctx.fillStyle = titleColor;
  ctx.font = 'bold 32px serif';
  setLetterSpacing('1px');
  ctx.fillText(penulis, canvas.width / 2, footerY + 30);

  ctx.fillStyle = authorColor;
  ctx.font = '16px sans-serif';
  setLetterSpacing('2px');
  ctx.fillText('fadrodzak.my.id', canvas.width / 2, canvas.height - 95);

  return canvas;
}

// Helper untuk download kartu langsung
export async function downloadQuoteCard(options: CardOptions, filename = 'kartu-sastra-fadrodzak.png') {
  const canvas = await generateQuoteCardCanvas(options);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper untuk berbagi ke WhatsApp / IG via Web Share API
export async function shareQuoteCard(options: CardOptions): Promise<boolean> {
  try {
    const canvas = await generateQuoteCardCanvas(options);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;

    const file = new File([blob], 'kutipan-fadrodzak.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `Kutipan dari "${options.judul}"`,
        text: `"${options.kutipan.slice(0, 140)}..." oleh ${options.penulis} di Fadrodzak Ruang Sastra.`,
        files: [file],
      });
      return true;
    } else if (navigator.share) {
      await navigator.share({
        title: `Kutipan dari "${options.judul}"`,
        text: `"${options.kutipan.slice(0, 140)}..." oleh ${options.penulis}\nBaca selengkapnya di Fadrodzak: https://fadrodzak.my.id`,
      });
      return true;
    }
  } catch (err) {
    if ((err as Error)?.name !== 'AbortError') {
      console.warn('Share quote card warning:', err);
    }
  }
  return false;
}
