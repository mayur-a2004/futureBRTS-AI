import { Request, Response } from 'express';
import { openaiService } from '../../shared/services/openai.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const guestController = {
    chat: async (req: Request, res: Response) => {
        try {
            const { message, history, guestSessionId, attachments } = req.body;

            if (!message && (!attachments || attachments.length === 0)) {
                return res.status(400).json({ success: false, error: "Message or attachment is required" });
            }

            const cleanSessionId = guestSessionId || ('guest_ephemeral_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now());
            const storageDir = path.join(__dirname, '../../uploads');
            if (!fs.existsSync(storageDir)) {
                fs.mkdirSync(storageDir, { recursive: true });
            }

            let attachmentContext = '';
            const processedAttachments: any[] = [];

            if (attachments && Array.isArray(attachments)) {
                for (const file of attachments) {
                    try {
                        const fileId = crypto.randomUUID();
                        const extension = (file.name ? file.name.split('.').pop() || 'bin' : 'bin').toLowerCase();
                        const fileName = `guest_${fileId}.${extension}`;
                        const filePath = path.join(storageDir, fileName);

                        let bufferData = '';
                        if (file.preview && typeof file.preview === 'string' && file.preview.includes('base64,')) {
                            bufferData = file.preview.split('base64,')[1];
                        } else {
                            bufferData = file.preview || '';
                        }

                        if (bufferData) {
                            fs.writeFileSync(filePath, Buffer.from(bufferData, 'base64'));
                            const fullPreview = file.preview || `data:${file.type || 'image/png'};base64,${bufferData}`;

                            if (extension === 'pdf') {
                                const dataBuffer = fs.readFileSync(filePath);
                                const parsedPdf = await pdfParse(dataBuffer);
                                attachmentContext += `\n\n--- PDF FILE (${file.name}) ---\n${(parsedPdf.text || '').substring(0, 15000)}\n-------------------------\n`;
                            } else if (['png', 'jpg', 'jpeg', 'webp'].includes(extension) || (file.type && file.type.startsWith('image/'))) {
                                let result;
                                try {
                                    result = await Tesseract.recognize(filePath, 'eng+hin+guj');
                                } catch (_) {
                                    result = await Tesseract.recognize(filePath, 'eng');
                                }
                                const extractedText = result?.data?.text || '';
                                attachmentContext += `\n\n--- IMAGE FILE (${file.name}) ---\nOCR Extracted Text:\n${extractedText.substring(0, 10000)}\n---------------------------\n`;
                                if (fullPreview && fullPreview.startsWith('data:image/')) {
                                    attachmentContext += `\n[IMAGE_BASE64_URL:${fullPreview}]\n`;
                                }
                            }

                            const publicUrl = `/uploads/${fileName}`;
                            processedAttachments.push({
                                file_id: fileId,
                                type: file.type ? file.type.split('/')[0] : 'attachment',
                                name: file.name || fileName,
                                storage_path: filePath,
                                mime_type: file.type || 'application/octet-stream',
                                url: publicUrl,
                                preview: fullPreview || publicUrl
                            });
                        }
                    } catch (e: any) {
                        console.error("[Guest Attachment Error]", e);
                    }
                }
            }

            // 🌐 LIVE WEB SCRAPING EXTRACTOR
            const promptContent = message || '';
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const detectedUrls = promptContent.match(urlRegex);
            if (detectedUrls && detectedUrls.length > 0) {
                for (const targetUrl of detectedUrls.slice(0, 3)) {
                    try {
                        console.log(`[Guest Web Scraper] Scraping URL live: ${targetUrl}`);
                        const scrapeRes = await axios.get(targetUrl, {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                            },
                            timeout: 10000
                        });
                        const $ = cheerio.load(scrapeRes.data);
                        $('script, style, nav, footer, header, svg, noscript, iframe').remove();
                        const pageTitle = $('title').text().trim() || targetUrl;
                        const pageHeading = $('h1').first().text().trim();
                        const metaDesc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
                        let bodyText = $('body').text().replace(/\s+/g, ' ').trim();
                        if (bodyText.length > 8000) {
                            bodyText = bodyText.substring(0, 8000) + '... [Content Truncated]';
                        }
                        attachmentContext += `\n\n--- [LIVE WEB SCRAPED CONTENT FROM: ${targetUrl}] ---\nTitle: ${pageTitle}\nMain Heading: ${pageHeading}\nMeta Description: ${metaDesc}\nExtracted Page Content:\n${bodyText}\n----------------------------------------------------\n`;
                    } catch (scrapeErr: any) {
                        console.warn(`[Guest Web Scraper] Failed to scrape ${targetUrl}:`, scrapeErr.message);
                    }
                }
            }

            let finalMessage = promptContent;
            if (attachmentContext && attachmentContext.length > 5) {
                finalMessage += `\n\n[SYSTEM: ATTACHMENTS & LIVE WEB DATA PROCESSED]\n${attachmentContext}`;
            }

            // Process response in isolated ephemeral guest context
            const response = await openaiService.generateResponse(
                { title: "Guest Ephemeral Session", lastMsg: "", id: cleanSessionId } as any,
                finalMessage,
                { mode: 'guest', sessionState: {}, userContext: { persona: 'PROFESSIONAL', isGuest: true, guestId: cleanSessionId } },
                history || []
            );

            res.json({ success: true, response, processedAttachments });
        } catch (err: any) {
            console.error("Guest Chat Error:", err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

