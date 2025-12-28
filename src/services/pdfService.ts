import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Booking } from '../types';

export const pdfService = {
    /**
     * Generates a professional digital contract/receipt for a booking
     */
    generateContractPDF: (booking: Booking) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- Header ---
        doc.setFillColor(26, 26, 46); // Brand dark color
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('GENEREK', 20, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('COMPROVATIVO DE PRESTAÇÃO DE SERVIÇO ARTÍSTICO', 20, 33);

        // --- Body Content ---
        doc.setTextColor(33, 33, 33);
        doc.setFontSize(10);

        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // Date of Issue
        const today = new Date().toLocaleDateString('pt-BR');
        doc.text(`Emitido em: ${today}`, pageWidth - 60, 55);
        doc.text(`Ref: #${booking.id.substring(0, 8).toUpperCase()}`, 20, 55);

        // Contract Heading
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTRATO DIGITAL', margin, 75);

        // Professional descriptive text (Refined as requested)
        const eventDate = new Date(booking.event_date).toLocaleDateString('pt-BR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        const lName = booking.listener_name || '';
        const aName = booking.artist_name || '';
        const eType = booking.event_type || '';

        // We'll use a segmented approach to allow bolding names in the introductory paragraph
        let currentY = 85;
        doc.setFont('helvetica', 'normal');
        doc.text('Este contrato comprova que ', margin, currentY);
        let currentX = margin + doc.getTextWidth('Este contrato comprova que ');

        doc.setFont('helvetica', 'bold');
        doc.text(lName, currentX, currentY);
        currentX += doc.getTextWidth(lName);

        doc.setFont('helvetica', 'normal');
        doc.text(' contratou o/a artista ', currentX, currentY);
        currentX += doc.getTextWidth(' contratou o/a artista ');

        doc.setFont('helvetica', 'bold');
        doc.text(aName, currentX, currentY);

        currentY += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('para a realização de um serviço artístico de ', margin, currentY);
        currentX = margin + doc.getTextWidth('para a realização de um serviço artístico de ');

        doc.setFont('helvetica', 'bold');
        doc.text(`"${eType}"`, currentX, currentY);

        currentY += 7;
        doc.setFont('helvetica', 'normal');
        doc.text('no dia ', margin, currentY);
        currentX = margin + doc.getTextWidth('no dia ');

        doc.setFont('helvetica', 'bold');
        doc.text(eventDate, currentX, currentY);
        currentX += doc.getTextWidth(eventDate);

        doc.setFont('helvetica', 'normal');
        doc.text('.', currentX, currentY);

        currentY += 12;
        const disclaimer = doc.splitTextToSize(
            'As partes declaram estar de acordo com os termos e valores descritos abaixo, validando esta transação como um registro digital oficial da prestação de serviço acordada através da plataforma GENEREK.',
            contentWidth
        );
        doc.text(disclaimer, margin, currentY);

        // --- Details Table ---
        const tableStartY = currentY + 15;

        autoTable(doc, {
            startY: tableStartY,
            head: [['ITEM', 'DETALHES']],
            body: [
                ['Artista', booking.artist_name || ''],
                ['Tipo de Evento', booking.event_type || ''],
                ['Data do Evento', eventDate || ''],
                ['Horário', booking.event_time || 'A definir'],
                ['Duração', `${booking.duration_hours || 0} horas`],
                ['Localização', booking.location || ''],
                ['Observações', booking.notes || 'Nenhuma'],
            ],
            headStyles: { fillColor: [29, 185, 84], textColor: [255, 255, 255] },
            margin: { left: margin, right: margin },
            theme: 'grid'
        });

        // --- Value and Status ---
        // @ts-ignore - autoTable adds lastAutoTable to doc
        const finalY = doc.lastAutoTable.finalY + 15;

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('VALOR TOTAL DO INVESTIMENTO:', margin, finalY);
        doc.setTextColor(29, 185, 84); // Success green
        doc.text(`KZ ${(booking.total_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - margin, finalY, { align: 'right' });

        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('Status do Pagamento: CONFIRMADO & PAGO', margin, finalY + 10);

        // --- Stamp/Footer ---
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, 250, pageWidth - margin, 250);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 150, 150);
        const footerText = 'Este documento é um comprovativo eletrônico gerado automaticamente. A validade deste contrato está vinculada à confirmação da transação no sistema GENEREK.';
        doc.text(footerText, pageWidth / 2, 260, { align: 'center' });

        // --- Save File ---
        const filename = `Contrato_Generek_${booking.id.substring(0, 8)}.pdf`;
        doc.save(filename);
    }
};
